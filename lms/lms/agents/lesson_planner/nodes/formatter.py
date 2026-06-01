import os
import frappe
import logging
from docx import Document
from frappe.utils.file_manager import save_file
from lms.lms.agents.lesson_planner.state import LessonPlanState

logger = logging.getLogger(__name__)

def formatter_node(state: LessonPlanState) -> dict:
    """
    Formatter Node.
    Outputs the final lesson plan in the selected format:
    - markdown: Saves final content as raw text
    - docx: Generates Microsoft Word document using python-docx and attaches it
    - latex: Generates academic LaTeX format
    - lms_native: Directly creates a new Draft 'Course Lesson' in Frappe LMS
    """
    teacher_id = state.get("teacher")
    output_format = state.get("output_format") or "lms_native"
    content = state.get("lesson_content") or ""
    topic = state.get("topic") or "Bài giảng AI"
    target_course = state.get("target_course")
    plan_doc_name = state.get("plan_doc_name")
    
    file_url = None
    lms_lesson_name = None

    # 1. Format: docx (Word Export)
    if output_format == "docx":
        try:
            from lms.lms.agents.lesson_planner.utils.docx_exporter import create_docx_from_markdown
            
            is_draft = state.get("review_status") != "approved"
            doc = create_docx_from_markdown(content, topic, is_draft=is_draft)
            
            # Save file locally inside bench
            filename = f"AI_Lesson_Plan_{frappe.generate_hash(length=8)}.docx"
            import io
            file_stream = io.BytesIO()
            doc.save(file_stream)
            file_stream.seek(0)
            
            frappe_file = frappe.get_doc({
                "doctype": "File",
                "file_name": filename,
                "content": file_stream.read(),
                "is_private": 1
            })
            frappe_file.insert()
            
            # Publish file URL to frontend
            file_url = frappe_file.file_url
            frappe.publish_realtime("lesson_plan_file_ready", {"file_url": file_url})
            
        except Exception as e:
            logger.error(f"Docx Exporter failed: {e}", exc_info=True)
            state["error"] = f"Docx generation failed: {str(e)}"

    # 2. Format: latex
    elif output_format == "latex":
        try:
            from lms.lms.agents.lesson_planner.utils.latex_exporter import create_latex_from_markdown
            
            is_draft = state.get("review_status") != "approved"
            latex_content = create_latex_from_markdown(content, topic, is_draft=is_draft)
            
            # Save file locally inside bench
            filename_tex = f"AI_Lesson_Plan_{frappe.generate_hash(length=8)}.tex"
            filename_pdf = f"AI_Lesson_Plan_{frappe.generate_hash(length=8)}.pdf"
            
            # 1. Save .tex file
            frappe_file_tex = frappe.get_doc({
                "doctype": "File",
                "file_name": filename_tex,
                "content": latex_content.encode('utf-8'),
                "is_private": 1
            })
            frappe_file_tex.insert()

            # Return the .tex file directly instead of compiling to PDF (as requested by user)
            file_url = frappe_file_tex.file_url
            
            # Append the raw LaTeX source link to the markdown content so users can download it
            content += f"\n\n---\n### 📄 Mã nguồn LaTeX\n[📥 Tải xuống mã nguồn gốc (.tex)]({file_url})"

            frappe.publish_realtime("lesson_plan_file_ready", {"file_url": file_url})
            
        except Exception as e:
            logger.error(f"LaTeX Exporter failed: {e}", exc_info=True)
            state["error"] = f"LaTeX generation failed: {str(e)}"
            
    # Push to LMS Course Lesson natively if requested
    if state.get("push_to_lms"):
        try:
            chapter = state.get("chapter")
            lesson_doc = frappe.get_doc({
                "doctype": "Course Lesson",
                "title": topic,
                "chapter": chapter,
                "body": content
            })
            lesson_doc.insert(ignore_permissions=True)
            lms_lesson_name = lesson_doc.name
            
            # 3.3 Register lesson in Chapter lessons child table
            chapter_doc = frappe.get_doc("Course Chapter", chapter)
            chapter_doc.append("lessons", {
                "lesson": lms_lesson_name
            })
            chapter_doc.save(ignore_permissions=True)
            
        except Exception as e:
            logger.error(f"LMS Native Push failed: {e}", exc_info=True)
            state["error"] = f"LMS Native Push failed: {str(e)}"

    # Update Frappe Document with the final results
    if plan_doc_name:
        updates = {
            "status": "Completed",
            "generated_content": content,
            "curriculum_standards_matched": ", ".join(state.get("curriculum_standards") or []),
            "diagram_method": state.get("diagram_method") or "mermaid"
        }
        if file_url:
            updates["generated_file"] = file_url
        if lms_lesson_name:
            updates["linked_lesson"] = lms_lesson_name
            
        frappe.db.set_value("AI Lesson Plan", plan_doc_name, updates)
        frappe.db.commit()

        # 1. Realtime (ephemeral) — chỉ hiệu quả khi user đang online
        frappe.publish_realtime("lesson_plan_ready", {
            "plan_name": plan_doc_name,
            "status": "Completed",
            "file_url": file_url,
            "linked_lesson": lms_lesson_name
        }, user=teacher_id)

        # 2. Persistent notification → /lms/notifications + bell icon
        try:
            from lms.lms.services.hitl.notification import notify_user_direct
            from lms.lms.utils import get_lms_route
            topic = state.get("topic", plan_doc_name)
            notify_user_direct(
                for_user=teacher_id,
                subject=f"✅ Giáo án hoàn thành: {topic}",
                email_content=(
                    f"Giáo án <b>{topic}</b> đã được AI tạo xong.<br>"
                    f"{'Đã xuất file và sẵn sàng tải về.' if file_url else 'Nội dung sẵn sàng để xem xét.'}"
                ),
                document_type="AI Lesson Plan",
                document_name=plan_doc_name,
                link=get_lms_route("lesson-planning"),
            )
        except Exception:
            pass

    return {
        "final_markdown": content,
        "file_url": file_url,
        "lms_lesson_name": lms_lesson_name,
        "status": "Completed"
    }
