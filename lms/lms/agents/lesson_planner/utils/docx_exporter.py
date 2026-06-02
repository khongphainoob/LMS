import os
import tempfile
import pypandoc
from docx import Document

def create_docx_from_markdown(content: str, topic: str, is_draft: bool = False) -> Document:
    # Build proper markdown content with headers
    md_text = f"**TRƯỜNG: ....................................** \t\t\t **CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**  \n"
    md_text += f"**TỔ: ...........................................** \t\t\t **Độc lập - Tự do - Hạnh phúc**  \n\n"
    md_text += f"---\n\n"
    md_text += f"<h1 style='text-align:center;'>KẾ HOẠCH BÀI DẠY</h1>\n\n"
    
    if is_draft:
        md_text += f"<h3 style='color:red; text-align:center;'>BẢN NHÁP AI - CHƯA PHÊ DUYỆT</h3>\n\n"
        
    # Replace checkboxes with proper unicode so pandoc doesn't just print text
    content = content.replace("[ ]", "☐").replace("[x]", "☑").replace("[X]", "☑")
    
    md_text += content

    with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as temp_md:
        temp_md.write(md_text.encode('utf-8'))
        md_path = temp_md.name
        
    docx_path = md_path.replace(".md", ".docx")
    try:
        # Convert using pypandoc without --mathjax to ensure DOCX format compatibility
        pypandoc.convert_file(md_path, 'docx', outputfile=docx_path)
        doc = Document(docx_path)
        return doc
    finally:
        if os.path.exists(md_path): os.remove(md_path)
        if os.path.exists(docx_path): os.remove(docx_path)
