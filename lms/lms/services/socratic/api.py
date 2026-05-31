import frappe
from frappe import _
from ...agents.socratic.graph import socratic_graph
from .session import (
    get_or_create_session_key,
    get_chat_history,
    save_message_to_history,
    clear_session
)
from lms.lms.services.hitl.flagging import should_flag_socratic
from lms.lms.services.hitl.notification import notify_teacher
from lms.lms.services.ai_rate_limit import check_and_record_usage

def _ensure_socratic_access(user: str) -> None:
    if user == "Guest":
        frappe.throw(_("Please login to use the Socratic Tutor"))

    allowed_roles = {"LMS Student", "Course Creator", "Moderator", "Batch Evaluator", "System Manager"}
    if user != "Administrator" and not any(role in frappe.get_roles(user) for role in allowed_roles):
        frappe.throw(_("You do not have permission to use the Socratic Tutor"))


def _apply_rate_limit(user: str) -> None:
    check_and_record_usage(user, "Socratic", increment=1)


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
        "knowledge_state": {},
        "lesson_content": lesson_content,
        "image_data": image_data,
        "rubric_data": rubric_data
    }

    try:
        from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
        config = get_unified_config_dict(agent_name="socratic_agent", session_id=session_key, tags=["Socratic"])
        
        final_state = socratic_graph.invoke(initial_state, config)
        flush_langfuse()
            
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
def send_socratic_message_async(message: str = None, lesson_name: str = None, session_key: str = None, scaffolding_level: int = 0, image_data: str = None, rubric_data: str = None, request_id: str = None, images_data: str = None):
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
            
    if session_key:
        session = frappe.db.get_value("Socratic Session", {"session_key": session_key, "student": student}, ["lesson", "attached_image", "attached_images", "attached_rubric", "knowledge_state", "scaffolding_level"], as_dict=True)
        if session:
            if not lesson_name and session.lesson:
                lesson_name = session.lesson
            if not image_data and session.attached_image:
                image_data = session.attached_image
            if not images_data and session.attached_images:
                images_data = session.attached_images
            if not rubric_data and session.attached_rubric:
                rubric_data = session.attached_rubric
            
            import json
            try:
                knowledge_state_dict = json.loads(session.knowledge_state) if session.knowledge_state else {}
            except Exception:
                knowledge_state_dict = {}
                
            initial_state = {
                "user_message": message or "",
                "student_name": student,
                "lesson_name": lesson_name,
                "session_key": session_key,
                "chat_history": get_chat_history(session_key),
                "scaffolding_level": session.scaffolding_level or 0,
                "knowledge_state": knowledge_state_dict,
                "lesson_content": lesson_content,
                "image_data": image_data,
                "images_data": images_data,
                "rubric_data": rubric_data,
            }
        else:
            initial_state = {
                "user_message": message or "",
                "student_name": student,
                "lesson_name": lesson_name,
                "session_key": session_key,
                "chat_history": get_chat_history(session_key),
                "scaffolding_level": int(scaffolding_level),
                "knowledge_state": {},
                "lesson_content": lesson_content,
                "image_data": image_data,
                "images_data": images_data,
                "rubric_data": rubric_data,
            }
    else:
        initial_state = {
            "user_message": message or "",
            "student_name": student,
            "lesson_name": lesson_name,
            "session_key": session_key,
            "chat_history": get_chat_history(session_key),
            "scaffolding_level": int(scaffolding_level),
            "knowledge_state": {},
            "lesson_content": lesson_content,
            "image_data": image_data,
            "images_data": images_data,
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

        frappe.logger("socratic").info(f"[JOB] Starting for user={user}, request_id={request_id}")
        frappe.logger("socratic").info(f"[JOB] session_key={initial_state.get('session_key')}")
        frappe.logger("socratic").info(f"[JOB] user_message length={len(initial_state.get('user_message', ''))}")

        from lms.lms.services.observability import get_unified_config_dict, flush_langfuse
        config = get_unified_config_dict(agent_name="socratic_agent", session_id=initial_state.get("session_key"), tags=["Socratic", "Async"])

        final_state = socratic_graph.invoke(initial_state, config)
        flush_langfuse()
        
        frappe.logger("socratic").info(f"[JOB] Graph completed. Keys in final_state: {list(final_state.keys())}")
        
        response = final_state.get("response")
        message_type = final_state.get("message_type", "socratic_hint")
        
        frappe.logger("socratic").info(f"[JOB] response={response[:100] if response else 'NONE'}...")

        if not response:
            response = "Tôi đã nhận được bài làm của bạn. Hãy cho tôi biết bạn cần hỗ trợ gì nhé!"

        save_message_to_history(initial_state["session_key"], "user", initial_state.get("user_message"))
        save_message_to_history(
            initial_state["session_key"], 
            "assistant", 
            response, 
            message_type=message_type,
            tokens_used=final_state.get("tokens_used", 0),
            model_used=final_state.get("model_used", "gemini")
        )

        _log_to_db(user, lesson_name, {**final_state, "response": response, "session_key": initial_state["session_key"]})

        session_name = frappe.db.get_value("Socratic Session", {"session_key": initial_state["session_key"]}, "name")
        if session_name:
            session_doc = frappe.get_doc("Socratic Session", session_name)
            is_flagged, reason, priority = should_flag_socratic(
                final_state.get("scaffolding_level", 0), 
                final_state.get("chat_history", [])
            )
            
            if is_flagged:
                session_doc.status = "Flagged"
                session_doc.save(ignore_permissions=True)
                notify_teacher(
                    event_type="socratic_escalation",
                    student=user,
                    course=session_doc.course,
                    reference_doctype="Socratic Session",
                    reference_name=session_name,
                    reason=reason,
                    priority=priority
                )

        _publish_socratic_result(
            user,
            {
                "status": "done",
                "request_id": request_id,
                "session_key": initial_state.get("session_key"),
                "response": response,
                "message_type": message_type,
                "tokens_used": final_state.get("tokens_used", 0),
            },
        )
        frappe.logger("socratic").info(f"[JOB] Published result for request_id={request_id}")
        
    except Exception:
        tb = frappe.get_traceback()
        frappe.log_error(tb, "Socratic Async Job Error")
        frappe.logger("socratic").error(f"[JOB] ERROR: {tb}")
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
def get_sessions(start: int = 0, limit: int = 5, search_term: str = None):
    student = frappe.session.user
    _ensure_socratic_access(student)
    
    filters = {"student": student}
    if search_term:
        filters["lesson"] = ["like", f"%{search_term}%"]
        
    start = int(start)
    limit = int(limit)
        
    sessions = frappe.get_all("Socratic Session", 
        filters=filters, 
        fields=["name", "session_key", "course", "lesson", "last_active", "message_count"],
        order_by="last_active desc",
        limit_start=start,
        limit_page_length=limit + 1
    )
    
    has_more = len(sessions) > limit
    if has_more:
        sessions = sessions[:limit]
        
    return {
        "sessions": sessions,
        "has_more": has_more
    }

@frappe.whitelist()
def create_session(course: str = None, batch: str = None, lesson: str = None, category: str = None, image_url: str = None, rubric_url: str = None, image_urls: str = None):
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
    
    image_data = image_url
    rubric_data = rubric_url
    
    if image_urls:
        import json
        try:
            urls = json.loads(image_urls)
            if urls:
                doc.attached_images = image_urls
                doc.attached_image = urls[0]
                image_data = urls[0]  # fallback
        except Exception:
            pass
    elif image_data:
        doc.attached_image = image_data
        import json
        doc.attached_images = json.dumps([image_data])
        
    if rubric_data:
        doc.attached_rubric = rubric_data
        
    doc.insert(ignore_permissions=True)
    
    # Fetch lesson content if available
    lesson_content = ""
    if lesson:
        try:
            doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
            lesson_doc = frappe.get_doc(doctype, lesson)
            lesson_content = lesson_doc.body or getattr(lesson_doc, "content", "") or ""
        except Exception:
            pass
    
    # ALWAYS auto-trigger evaluation agent
    request_id = frappe.generate_hash(length=12)
    
    # Build a descriptive first message
    parts = ["Hãy phân tích và đánh giá bài làm của tôi."]
    
    parsed_urls = []
    if getattr(doc, "attached_images", None):
        import json
        try:
            parsed_urls = json.loads(doc.attached_images)
        except Exception:
            pass

    if len(parsed_urls) > 1:
        parts.append(f"Tôi đã tải lên {len(parsed_urls)} ảnh bài làm.")
    elif image_data:
        parts.append(f"Tôi đã tải lên ảnh bài làm.")
        
    if rubric_data:
        parts.append(f"Tôi cũng đã đính kèm tiêu chí chấm điểm (rubric).")
    if lesson:
        parts.append(f"Bài học liên quan: {lesson}")
    
    initial_state = {
        "user_message": " ".join(parts),
        "student_name": student,
        "lesson_name": lesson,
        "session_key": session_key,
        "chat_history": [],
        "scaffolding_level": 0,
        "lesson_content": lesson_content,
        "image_data": image_data,
        "images_data": doc.attached_images,
        "rubric_data": rubric_data
    }
    
    frappe.enqueue(
        "lms.lms.services.socratic.api._run_socratic_job",
        queue="long",
        timeout=300,
        user=student,
        lesson_name=lesson,
        request_id=request_id,
        initial_state=initial_state,
    )
    
    frappe.logger("socratic").info(f"[create_session] Created session={session_key}, auto-started agent request_id={request_id}")
    
    return {"session_key": session_key, "request_id": request_id, "auto_started": True}

@frappe.whitelist()
def delete_session(session_key: str):
    student = frappe.session.user
    _ensure_socratic_access(student)
    session_name = frappe.db.get_value("Socratic Session", {"session_key": session_key, "student": student}, "name")
    if session_name:
        clear_session(session_key, delete_parent=True)
    return "OK"

@frappe.whitelist()
def get_session_detail(session_key: str):
    student = frappe.session.user
    _ensure_socratic_access(student)
    session = frappe.db.get_value(
        "Socratic Session",
        {"session_key": session_key, "student": student},
        ["name", "lesson", "course", "batch", "attached_image", "attached_images", "attached_rubric", "status", "message_count"],
        as_dict=True
    )
    if not session:
        frappe.throw(_("Session not found"))
    return session
@frappe.whitelist()
def retry_analysis(session_key: str):
    """Re-trigger the initial analysis for an existing session."""
    student = frappe.session.user
    _ensure_socratic_access(student)
    
    session = frappe.get_doc("Socratic Session", {"session_key": session_key, "student": student})
    
    # Clear existing messages for this session to start fresh
    frappe.db.delete("Socratic Message", {"session": session.name})
    clear_session(session_key)
    
    # Fetch lesson content
    lesson_content = ""
    if session.lesson:
        try:
            doctype = "Course Lesson" if frappe.db.exists("DocType", "Course Lesson") else "LMS Lesson"
            lesson_doc = frappe.get_doc(doctype, session.lesson)
            lesson_content = lesson_doc.body or getattr(lesson_doc, "content", "") or ""
        except Exception:
            pass

    request_id = frappe.generate_hash(length=12)
    parts = ["Hãy phân tích và đánh giá bài làm của tôi."]
    
    parsed_urls = []
    if getattr(session, "attached_images", None):
        import json
        try:
            parsed_urls = json.loads(session.attached_images)
        except Exception:
            pass

    if len(parsed_urls) > 1:
        parts.append(f"Tôi đã tải lên {len(parsed_urls)} ảnh bài làm.")
    elif session.attached_image:
        parts.append(f"Tôi đã tải lên ảnh bài làm.")
        
    if session.attached_rubric:
        parts.append(f"Tôi cũng đã đính kèm tiêu chí chấm điểm (rubric).")
        
    initial_state = {
        "user_message": " ".join(parts),
        "student_name": student,
        "lesson_name": session.lesson,
        "session_key": session_key,
        "chat_history": [],
        "scaffolding_level": 0,
        "lesson_content": lesson_content,
        "image_data": session.attached_image,
        "images_data": session.attached_images,
        "rubric_data": session.attached_rubric,
    }
    
    frappe.enqueue(
        "lms.lms.services.socratic.api._run_socratic_job",
        queue="long",
        timeout=300,
        user=student,
        lesson_name=session.lesson,
        request_id=request_id,
        initial_state=initial_state,
    )
    
    return {"status": "retrying", "request_id": request_id}

@frappe.whitelist()
def get_student_context():
    student = frappe.session.user
    _ensure_socratic_access(student)
    
    # 1. Fetch Enrolled Courses
    enrolled_courses = frappe.get_all("LMS Enrollment", 
        filters={"member": student}, 
        pluck="course"
    )
    courses = frappe.get_all("LMS Course", 
        filters={"name": ["in", enrolled_courses]},
        fields=["name", "title"]
    ) if enrolled_courses else []
    
    # 2. Fetch Enrolled Batches
    enrolled_batches = frappe.get_all("LMS Batch Enrollment",
        filters={"member": student},
        pluck="batch"
    )
    batches = frappe.get_all("LMS Batch",
        filters={"name": ["in", enrolled_batches]},
        fields=["name", "title"]
    ) if enrolled_batches else []
    
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

        import json
        knowledge_state_str = json.dumps(state.get("knowledge_state", {}))
        
        frappe.db.sql(
            """
            UPDATE `tabSocratic Session`
            SET total_tokens = IFNULL(total_tokens, 0) + %(tokens_used)s,
                input_tokens = IFNULL(input_tokens, 0) + %(input_tokens)s,
                output_tokens = IFNULL(output_tokens, 0) + %(output_tokens)s,
                total_cost_usd = IFNULL(total_cost_usd, 0.0) + %(total_cost_usd)s,
                message_count = IFNULL(message_count, 0) + 1,
                knowledge_state = %(knowledge_state)s,
                scaffolding_level = %(scaffolding_level)s
            WHERE name = %(session_name)s
            """,
            {
                "tokens_used": state.get("tokens_used", 0),
                "input_tokens": state.get("input_tokens", 0),
                "output_tokens": state.get("output_tokens", 0),
                "total_cost_usd": state.get("total_cost_usd", 0.0),
                "knowledge_state": knowledge_state_str,
                "scaffolding_level": state.get("scaffolding_level", 0),
                "session_name": session_name,
            },
        )
    except Exception as e:
        frappe.log_error(f"Socratic DB Logging Error: {str(e)}")
