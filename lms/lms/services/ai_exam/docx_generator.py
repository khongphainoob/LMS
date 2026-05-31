import frappe
import json
import pypandoc

def generate_docx(exam_name: str) -> str:
    exam = frappe.get_doc("AI Exam", exam_name)
    
    # Build markdown string
    md_lines = []
    
    # Header
    school = exam.school_name or "TRƯỜNG........................."
    dept = exam.department or "TỔ.............................."
    md_lines.append(f"**{school}** | **CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**")
    md_lines.append(f"**{dept}** | **Độc lập - Tự do - Hạnh phúc**")
    md_lines.append("---")
    
    md_lines.append(f"# {exam.title}")
    md_lines.append(f"**Môn:** {exam.subject} - **Lớp:** {exam.grade_level}")
    md_lines.append(f"**Thời gian làm bài:** {exam.duration_minutes} phút")
    md_lines.append("\n**Họ và tên học sinh:** .......................................................................")
    md_lines.append("**Lớp:** ........................ **Số báo danh:** ........................")
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
            md_lines.append(f"**Câu {q.question_number} ({q.score} điểm):** {q.question_text}")
            
            if q.options and q.question_type == "Multiple Choice":
                try:
                    options = json.loads(q.options)
                    for i, opt in enumerate(options):
                        label = chr(65 + i) # A, B, C, D
                        md_lines.append(f"- **{label}**. {opt}")
                except:
                    pass
                    
            md_lines.append(f"\n**Đáp án:** {q.correct_answer}")
            if q.solution:
                md_lines.append(f"**Lời giải:**\n{q.solution}")
                
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
