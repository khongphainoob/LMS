import frappe
from frappe import _
from ...agents.socratic_agent import socratic_graph
from ...services.chatbot.session import (
    get_or_create_session_key,
    get_chat_history,
    save_message_to_history,
    clear_session
)


RATE_LIMIT_REQUESTS_PER_MINUTE = 5


def _ensure_socratic_access(user: str) -> None:
    if user == "Guest":
        frappe.throw(_("Please login to use the Socratic Tutor"))

    allowed_roles = {"LMS Student", "Course Creator", "Moderator", "Batch Evaluator", "System Manager"}
    if user != "Administrator" and not any(frappe.has_role(role, user=user) for role in allowed_roles):
        frappe.throw(_("You do not have permission to use the Socratic Tutor"))


def _apply_rate_limit(user: str) -> None:
    key = f"socratic:rate:{user}"
    cache = frappe.cache()
    current = cache.get_value(key) or 0
    try:
        current_int = int(current)
    except Exception:
        current_int = 0

    if current_int >= RATE_LIMIT_REQUESTS_PER_MINUTE:
        frappe.throw(_("Too many requests. Please wait a minute and try again."))

    cache.set_value(key, str(current_int + 1), expires_in_sec=60)


def _publish_socratic_result(user: str, payload: dict) -> None:
    frappe.publish_realtime(event="socratic_response", message=payload, user=user)

@frappe.whitelist()
def send_socratic_message(message: str, lesson_name: str = None, session_key: str = None, scaffolding_level: int = 0, image_data: str = None, rubric_data: str = None):
    if not message and not image_data and not rubric_data:
        frappe.throw(_("Message, image or rubric cannot be empty"))

    student = frappe.session.user
    _ensure_socratic_access(student)
    _apply_rate_limit(student)

    if not session_key:
        session_key = get_or_create_session_key(student, f"socratic_{lesson_name or 'general'}")

    lesson_content = ""
    if lesson_name:
        try:
            doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
            lesson_doc = frappe.get_doc(doctype, lesson_name)
            lesson_content = lesson_doc.body or lesson_doc.content or ""
        except Exception:
            pass

    initial_state = {
        "user_message": message or "",
        "student_name": student,
        "lesson_name": lesson_name,
        "session_key": session_key,
        "chat_history": get_chat_history(session_key),
        "scaffolding_level": int(scaffolding_level),
        "lesson_content": lesson_content,
        "image_data": image_data,
        "rubric_data": rubric_data
    }

    try:
        final_state = socratic_graph.invoke(initial_state)
        response = final_state.get("response")

        save_message_to_history(session_key, "user", message)
        save_message_to_history(session_key, "assistant", response)

        _log_to_db(student, lesson_name, final_state)

        return {
            "response": response,
            "session_key": session_key,
            "tokens_used": final_state.get("tokens_used", 0)
        }

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Socratic API Error")
        frappe.throw(_("An error occurred. Please try again later."))


@frappe.whitelist(methods=["POST"])
def send_socratic_message_async(message: str = None, lesson_name: str = None, session_key: str = None, scaffolding_level: int = 0, image_data: str = None, rubric_data: str = None, request_id: str = None):
    if not message and not image_data and not rubric_data:
        frappe.throw(_("Message, image or rubric cannot be empty"))

    student = frappe.session.user
    _ensure_socratic_access(student)
    _apply_rate_limit(student)

    if not session_key:
        session_key = get_or_create_session_key(student, f"socratic_{lesson_name or 'general'}")

    if not request_id:
        request_id = frappe.generate_hash(length=12)

    lesson_content = ""
    if lesson_name:
        try:
            doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
            lesson_doc = frappe.get_doc(doctype, lesson_name)
            lesson_content = lesson_doc.body or lesson_doc.content or ""
        except Exception:
            pass

    initial_state = {
        "user_message": message or "",
        "student_name": student,
        "lesson_name": lesson_name,
        "session_key": session_key,
        "chat_history": get_chat_history(session_key),
        "scaffolding_level": int(scaffolding_level),
        "lesson_content": lesson_content,
        "image_data": image_data,
        "rubric_data": rubric_data,
    }

    job = frappe.enqueue(
        "lms.lms.services.socratic.api._run_socratic_job",
        queue="long",
        timeout=300,
        user=student,
        lesson_name=lesson_name,
        request_id=request_id,
        initial_state=initial_state,
    )
    job_id = getattr(job, "id", job)

    return {
        "status": "queued",
        "job_id": job_id,
        "session_key": session_key,
        "request_id": request_id,
    }


def _run_socratic_job(user: str, lesson_name: str, request_id: str, initial_state: dict) -> None:
    try:
        frappe.set_user(user)
        _ensure_socratic_access(user)

        final_state = socratic_graph.invoke(initial_state)
        response = final_state.get("response")

        save_message_to_history(initial_state["session_key"], "user", initial_state.get("user_message"))
        save_message_to_history(initial_state["session_key"], "assistant", response)

        _log_to_db(user, lesson_name, final_state)

        _publish_socratic_result(
            user,
            {
                "status": "done",
                "request_id": request_id,
                "session_key": initial_state.get("session_key"),
                "response": response,
                "tokens_used": final_state.get("tokens_used", 0),
            },
        )
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Socratic Async Job Error")
        try:
            _publish_socratic_result(
                user,
                {
                    "status": "error",
                    "request_id": request_id,
                    "session_key": initial_state.get("session_key") if isinstance(initial_state, dict) else None,
                    "error": _("An error occurred while processing your request."),
                },
            )
        except Exception:
            pass

@frappe.whitelist()
def get_socratic_history(lesson_name: str = None, session_key: str = None):
    student = frappe.session.user
    _ensure_socratic_access(student)
    if not session_key:
        session_key = get_or_create_session_key(student, f"socratic_{lesson_name or 'general'}")
    return get_chat_history(session_key)

@frappe.whitelist()
def reset_socratic_session(lesson_name: str = None, session_key: str = None):
    student = frappe.session.user
    _ensure_socratic_access(student)
    if not session_key:
        session_key = get_or_create_session_key(student, f"socratic_{lesson_name or 'general'}")
    clear_session(session_key)
    return "OK"

@frappe.whitelist()
def get_sessions():
    student = frappe.session.user
    _ensure_socratic_access(student)
    return frappe.get_all("Socratic Session", 
        filters={"student": student}, 
        fields=["name", "session_key", "course", "lesson", "last_active", "message_count"],
        order_by="last_active desc"
    )

@frappe.whitelist()
def create_session(course: str = None, batch: str = None, lesson: str = None, category: str = None):
    student = frappe.session.user
    _ensure_socratic_access(student)
    session_key = get_or_create_session_key(student, f"socratic_{lesson or 'general'}_{frappe.utils.now()}")
    
    doc = frappe.get_doc({
        "doctype": "Socratic Session",
        "student": student,
        "course": course,
        "lesson": lesson,
        "session_key": session_key,
        "last_active": frappe.utils.now_datetime()
    })
    doc.insert(ignore_permissions=True)
    return {"session_key": session_key}

@frappe.whitelist()
def delete_session(session_key: str):
    student = frappe.session.user
    _ensure_socratic_access(student)
    session_name = frappe.db.get_value("Socratic Session", {"session_key": session_key, "student": student}, "name")
    if session_name:
        frappe.delete_doc("Socratic Session", session_name, ignore_permissions=True)
        clear_session(session_key)
    return "OK"

@frappe.whitelist()
def get_student_context():
    student = frappe.session.user
    _ensure_socratic_access(student)
    
    # Very basic placeholder logic for UI loading, fetch enrolled courses if needed
    courses = frappe.get_all("LMS Course", fields=["name", "title"]) if frappe.db.exists("DocType", "LMS Course") else []
    batches = frappe.get_all("LMS Batch", fields=["name", "title", "course"]) if frappe.db.exists("DocType", "LMS Batch") else []
    
    return {
        "courses": courses,
        "batches": batches
    }

def _log_to_db(student, lesson_name, state):
    try:
        session_name = frappe.db.get_value("Socratic Session", {"session_key": state["session_key"]}, "name")
        if not session_name:
            lesson_doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
            course = frappe.db.get_value(lesson_doctype, lesson_name, "course") if lesson_name else None
            
            doc = frappe.get_doc({
                "doctype": "Socratic Session",
                "student": student,
                "course": course,
                "lesson": lesson_name,
                "session_key": state["session_key"],
                "last_active": frappe.utils.now_datetime()
            })
            doc.insert(ignore_permissions=True)
            session_name = doc.name
        else:
            frappe.db.set_value("Socratic Session", session_name, "last_active", frappe.utils.now_datetime())

        log = frappe.get_doc({
            "doctype": "Socratic Message",
            "session": session_name,
            "role": "assistant",
            "content": state["response"],
            "message_type": "socratic_hint",
            "scaffolding_level": state.get("scaffolding_level", 0),
            "tokens_used": state.get("tokens_used", 0),
            "latency_ms": state.get("latency_ms", 0),
            "model_used": state.get("model_used", "gemini")
        })
        log.insert(ignore_permissions=True)
        
        frappe.db.sql(
            """
            UPDATE `tabSocratic Session`
            SET total_tokens = IFNULL(total_tokens, 0) + %(tokens_used)s,
                message_count = IFNULL(message_count, 0) + 1
            WHERE name = %(session_name)s
            """,
            {
                "tokens_used": state.get("tokens_used", 0),
                "session_name": session_name,
            },
        )
    except Exception as e:
        frappe.log_error(f"Socratic DB Logging Error: {str(e)}")
