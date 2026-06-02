import os
import frappe

def extract_text_from_pdf(file_path):
    try:
        import pymupdf4llm
        return pymupdf4llm.to_markdown(file_path)
    except ImportError:
        frappe.log_error("pymupdf4llm not installed", "AI Universal Parser")
        return ""
    except Exception as e:
        frappe.log_error(f"PDF extraction error: {str(e)}", "AI Universal Parser")
        return ""

def extract_text_from_docx(file_path):
    try:
        import pypandoc
        return pypandoc.convert_file(file_path, to='markdown')
    except ImportError:
        frappe.log_error("pypandoc not installed", "AI Universal Parser")
        return ""
    except Exception as e:
        frappe.log_error(f"DOCX extraction error: {str(e)}", "AI Universal Parser")
        return ""

def extract_text_from_txt(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        frappe.log_error(f"TXT extraction error: {str(e)}", "AI Universal Parser")
        return ""

def get_content_from_file(file_path):
    """
    Main entry point for file parsing.
    Supports PDF, DOCX, and TXT.
    Returns Markdown string.
    """
    if not os.path.exists(file_path):
        return ""
    
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in [".docx", ".doc"]:
        return extract_text_from_docx(file_path)
    elif ext in [".txt", ".md", ".csv"]:
        return extract_text_from_txt(file_path)
    else:
        return ""
