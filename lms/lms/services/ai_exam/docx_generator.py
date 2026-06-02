import frappe
import json
import pypandoc
import re

def generate_docx(exam_name: str) -> str:
    exam = frappe.get_doc("AI Exam", exam_name)
    
    # Build markdown string
    md_lines = []
    
    # Header
    school = exam.get("school_name") or "TRƯỜNG........................."
    dept = exam.get("department") or "TỔ.............................."
    md_lines.append(f"**{school}** | **CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**\n")
    md_lines.append(f"**{dept}** | **Độc lập - Tự do - Hạnh phúc**\n")
    md_lines.append("--- \n")
    
    md_lines.append(f"# **{exam.title}**\n")
    md_lines.append(f"**Môn học:** {exam.subject}\n")
    md_lines.append(f"**Lớp:** {exam.grade_level}\n")
    md_lines.append(f"**Thời gian làm bài:** {exam.duration_minutes} phút\n")
    md_lines.append("\n**Họ và tên học sinh:** .......................................................................\n")
    md_lines.append("**Lớp:** ........................ **Số báo danh:** ........................\n")
    md_lines.append("\n---\n")
    
    questions = frappe.get_all("AI Exam Question", filters={"parent": exam_name}, fields=["*"], order_by="idx asc")
    
    q_index = 0
    for section in exam.sections:
        md_lines.append(f"## {section.section_title}")
        md_lines.append(f"*{section.section_instructions}*\n")
        
        num_questions = section.num_questions or 0
        section_questions = questions[q_index : q_index + num_questions]
        q_index += num_questions
        
        for q in section_questions:
            points = q.points if q.points is not None else 0.25
            q_num = q.question_number if q.question_number else q.idx
            md_lines.append(f"**Câu {q_num} ({points} điểm):** {q.question_text}\n")
            
            if q.options:
                try:
                    options = json.loads(q.options)
                    for i, opt in enumerate(options):
                        text = ''
                        if isinstance(opt, dict):
                            text = opt.get("option_text") or opt.get("text") or str(opt)
                        else:
                            text = str(opt)
                        text = str(text)
                        text = re.sub(r'^[A-Za-z][\.\:\)]\s*', '', text)
                        
                        if q.question_type == "True/False":
                            label = chr(97 + i) # a, b, c, d
                            md_lines.append(f"{label}) {text}\n")
                        else:
                            label = chr(65 + i) # A, B, C, D
                            md_lines.append(f"**{label}.** {text}\n")
                except Exception:
                    pass
                    
            md_lines.append(f"**Đáp án:** {q.correct_answer}\n")
            if q.solution:
                md_lines.append(f"**Lời giải:**\n{q.solution}\n")
                
            md_lines.append("\n---\n")
            
    md_content = "\n".join(md_lines)
    
    # Generate DOCX using pandoc
    output_path = frappe.get_site_path("public", "files", f"{exam_name}.docx")
    
    pypandoc.convert_text(md_content, 'docx', format='md', outputfile=output_path)
    
    # Create Frappe File document
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{exam_name}.docx",
        "file_url": f"/files/{exam_name}.docx",
        "attached_to_doctype": "AI Exam",
        "attached_to_name": exam_name,
        "is_private": 0
    })
    
    try:
        file_doc.insert()
        frappe.db.commit()
    except frappe.DuplicateEntryError:
        pass # File already exists
        
    return f"/files/{exam_name}.docx"
