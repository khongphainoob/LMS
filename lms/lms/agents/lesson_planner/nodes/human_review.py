import frappe
from langgraph.types import interrupt
from lms.lms.agents.lesson_planner.state import LessonPlanState

def human_review_node(state: LessonPlanState) -> dict:
    """
    Human Review Node (HITL).
    Pauses graph execution and waits for teacher validation.
    """
    teacher_id = state.get("teacher")
    plan_doc_name = state.get("plan_doc_name")
    review_count = state.get("review_count", 0) + 1
    
    if review_count > 3:
        # Auto-approve if limit reached
        try:
            if plan_doc_name:
                frappe.db.set_value("AI Lesson Plan", plan_doc_name, "status", "Illustrating")
                frappe.db.commit()
                frappe.publish_realtime("lesson_plan_review", {
                    "plan_name": plan_doc_name,
                    "status": "Illustrating",
                    "message": "Đã đạt giới hạn 3 lần chỉnh sửa, hệ thống tự động chốt và chuyển sang vẽ hình minh họa."
                })
        except Exception as e:
            pass
            
        return {
            "review_status": "approved",
            "status": "approved",
            "review_count": review_count
        }
    
    try:
        if plan_doc_name:
            
            # Save the draft content into the database so the teacher can view it on the UI
            frappe.db.set_value("AI Lesson Plan", plan_doc_name, {
                "review_draft": state["lesson_content"],
                "status": "Review",
                "review_started_at": frappe.utils.now_datetime(),
                "review_notified": 0,
                "review_feedback": None
            })
            frappe.db.commit()
            
            # Publish a persistent Notification so the bell icon rings
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            
            topic = state.get("topic", plan_doc_name)
            notify_user_direct(
                for_user=teacher_id,
                subject=f"⏳ Cần duyệt Giáo án: {topic}",
                email_content=f"AI đã soạn thảo xong bản nháp cho giáo án <b>{topic}</b>. Vui lòng xem xét và phê duyệt để tiếp tục quá trình sinh bài giảng (Lần {review_count}/3).",
                document_type="AI Lesson Plan",
                document_name=plan_doc_name,
                link=get_lms_route("lesson-planning"),
            )
            
            # Publish a realtime message to notify the frontend
            frappe.publish_realtime("lesson_plan_review", {
                "plan_name": plan_doc_name,
                "status": "Review",
                "message": f"Nội dung bài giảng nháp đã sẵn sàng để bạn duyệt. (Lần {review_count}/3)"
            }, user=teacher_id)
            
    except Exception as e:
        frappe.log_error(f"Error in HITL Node: {e}", "AI Lesson Planner HITL Node")

    # Raise an interrupt to pause execution
    # This will persist the state and wait for resume Command
    review_result = interrupt({
        "draft_content": state.get("lesson_content"),
        "lesson_outline": state.get("lesson_outline"),
        "curriculum_standards": state.get("curriculum_standards"),
        "plan_name": plan_doc_name,
        "message": f"Vui lòng xem lại bản soạn thảo. Bạn có thể chỉnh sửa trực tiếp hoặc xác nhận duyệt. (Lần {review_count}/3)"
    })
    
    # Process the result from resume command
    action = review_result.get("action")
    edited_content = review_result.get("edited_content")
    feedback = review_result.get("feedback")
    
    if action == "approve":
        return {
            "review_status": "approved",
            "review_feedback": feedback,
            "status": "approved",
            "review_count": review_count
        }
    elif action == "edit" and edited_content:
        return {
            "lesson_content": edited_content,
            "review_status": "revised",
            "review_feedback": feedback,
            "status": "revised",
            "review_count": review_count
        }
        
    return {
        "review_status": "approved",
        "status": "approved",
        "review_count": review_count
    }
