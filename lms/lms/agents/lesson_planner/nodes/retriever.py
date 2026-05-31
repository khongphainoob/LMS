import os
import frappe
from lms.lms.agents.lesson_planner.state import LessonPlanState

def retriever_node(state: LessonPlanState) -> dict:
    """
    RAG Retriever Node.
    Retrieves syllabus chunks, textbook contents, or curriculum standards based on subject, grade, and topic.
    """
    subject = state.get("subject") or ""
    grade_level = state.get("grade_level") or ""
    topic = state.get("topic") or ""
    reference_content = state.get("reference_content") or ""
    
    retrieved_chunks = []
    standards = []

    # 1. If teacher uploaded a custom reference file, prioritize grounding on that content
    if reference_content.strip():
        retrieved_chunks.append(f"TÀI LIỆU KHẢO SÁT DO GIÁO VIÊN CUNG CẤP:\n{reference_content.strip()}")
        standards.append("REF_DOC_STANDARD")

    # 2. Try loading official curriculum standards from the system if vector db is ready
    # Fallback to simple database keyword lookup in LMS Course or Course Lesson if vector store not initialized
    try:
        # Check if we have pre-configured lessons or chapters in LMS that match this topic
        matched_lessons = frappe.get_all("Course Lesson", 
            filters={"course": ["like", f"%{subject}%"], "title": ["like", f"%{topic}%"]}, 
            fields=["title", "description"], 
            limit=3
        )
        if matched_lessons:
            lesson_context = "\n".join([f"- Bài học liên quan: {l.title} (Mô tả: {l.description})" for l in matched_lessons])
            retrieved_chunks.append(f"CÁC BÀI HỌC CÓ SẴN TRONG HỆ THỐNG:\n{lesson_context}")
    except Exception as e:
        frappe.log_error(title="AI Lesson Planner Retriever Error", message=str(e))
        pass

    # 3. Fallback dummy curriculum standards for demonstration purposes
    subject_lower = subject.lower() if subject else ""
    if "toán" in subject_lower or "math" in subject_lower:
        standards.append("GD.TOAN.MA-01")
        retrieved_chunks.append("CHUẨN BỘ GIÁO DỤC - MÔN TOÁN: Đảm bảo hình thành tư duy toán học, phát triển kỹ năng giải quyết vấn đề, tính toán chính xác và ứng dụng thực tiễn.")
    elif "lý" in subject_lower or "physics" in subject_lower:
        standards.append("GD.LY.MA-02")
        retrieved_chunks.append("CHUẨN BỘ GIÁO DỤC - MÔN VẬT LÝ: Giải thích hiện tượng tự nhiên thông qua thực nghiệm, rèn luyện kỹ năng quan sát, đo lường và làm báo cáo.")
    elif "hóa" in subject_lower or "chem" in subject_lower:
        standards.append("GD.HOA.MA-03")
        retrieved_chunks.append("CHUẨN BỘ GIÁO DỤC - MÔN HÓA HỌC: Hiểu cấu trúc chất, sự biến đổi hóa học, kỹ năng sử dụng dụng cụ thí nghiệm an toàn.")
    elif "tin" in subject_lower or "computer" in subject_lower:
        standards.append("GD.TIN.MA-04")
        retrieved_chunks.append("CHUẨN BỘ GIÁO DỤC - MÔN TIN HỌC: Phát triển tư duy thuật toán, kỹ năng lập trình giải quyết vấn đề, ứng dụng CNTT lành mạnh.")
    else:
        standards.append("GD.GEN.MA-00")
        retrieved_chunks.append("CHUẨN ĐÀO TẠO PHỔ THÔNG TOÀN DIỆN: Đảm bảo học sinh phát triển năng lực tự chủ, tự học, hợp tác nhóm và giải quyết vấn đề thực tế.")

    final_retrieved_text = "\n\n".join(retrieved_chunks)
    
    # Update status of DocType if loaded
    frappe.db.set_value("AI Lesson Plan", state.get("teacher") or "", "status", "Retrieving")
    
    return {
        "retrieved_curriculum": final_retrieved_text,
        "curriculum_standards": standards,
        "status": "Retrieving"
    }
