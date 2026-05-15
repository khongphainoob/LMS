import os
import frappe

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

def extract_text_from_pdf(file_path):
    if not PyPDF2:
        frappe.log_error("PyPDF2 not installed", "AI Quiz Parser")
        return ""
    
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        frappe.log_error(f"PDF extraction error: {str(e)}", "AI Quiz Parser")
    return text

def extract_text_from_docx(file_path):
    if not docx:
        frappe.log_error("python-docx not installed", "AI Quiz Parser")
        return ""
    
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        frappe.log_error(f"DOCX extraction error: {str(e)}", "AI Quiz Parser")
    return text

def extract_text_from_txt(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        frappe.log_error(f"TXT extraction error: {str(e)}", "AI Quiz Parser")
    return ""

def get_content_from_file(file_path):
    """
    Main entry point for file parsing.
    Supports PDF, DOCX, and TXT.
    """
    if not os.path.exists(file_path):
        return ""
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext == ".txt":
        return extract_text_from_txt(file_path)
    else:
        return ""
