import frappe
import io
import json
from xhtml2pdf import pisa
from frappe.utils import get_files_path
from frappe.utils.file_manager import save_file

def generate_pdf(exam_name: str) -> str:
    """Generates a PDF for the exam and attaches it to the DocType"""
    exam_doc = frappe.get_doc("AI Exam", exam_name)
    
    # Prepare data for Jinja
    sections_map = {}
    
    # Group questions by section
    for q in exam_doc.get("questions", []):
        options = []
        try:
            options = json.loads(q.options) if q.options else []
        except:
            pass
            
        media = []
        try:
            media = json.loads(q.media_assets) if q.media_assets else []
        except:
            pass
            
        # We don't have section_idx saved directly on questions in our quick implementation, 
        # so we'll just distribute them evenly based on section definition for this MVP.
        pass

    # A more robust mapping logic:
    formatted_sections = []
    q_index = 0
    questions = exam_doc.get("questions", [])
    
    for sec in exam_doc.get("sections", []):
        sec_questions = questions[q_index : q_index + sec.num_questions]
        q_index += sec.num_questions
        
        formatted_q = []
        for q in sec_questions:
            formatted_q.append({
                "question_number": q.question_number,
                "question_type": q.question_type,
                "question_text": q.question_text,
                "options": json.loads(q.options) if q.options else [],
                "media_assets": json.loads(q.media_assets) if q.media_assets else []
            })
            
        formatted_sections.append({
            "section_title": sec.section_title,
            "section_instructions": sec.section_instructions,
            "questions": formatted_q
        })

    # Render template
    html = frappe.render_template(
        "lms/lms/services/ai_exam/templates/exam_paper.html",
        {
            "exam": exam_doc,
            "sections": formatted_sections
        }
    )
    
    # Generate PDF
    pdf_file = io.BytesIO()
    pisa_status = pisa.CreatePDF(
        src=html,
        dest=pdf_file,
        encoding='utf-8'
    )
    
    if pisa_status.err:
        raise Exception(f"PDF generation failed: {pisa_status.err}")
        
    pdf_file.seek(0)
    file_name = f"{exam_doc.title.replace(' ', '_')}_{exam_doc.name}.pdf"
    
    saved_file = save_file(
        file_name,
        pdf_file.read(),
        "AI Exam",
        exam_name,
        is_private=1
    )
    
    exam_doc.db_set("generated_file_pdf", saved_file.file_url)
    return saved_file.file_url
