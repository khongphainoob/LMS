import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def create_docx_from_markdown(content: str, topic: str, is_draft: bool = False) -> Document:
    doc = Document()
    
    # Page setup (A4)
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2.0)
    section.bottom_margin = Cm(2.0)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.0)
    
    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(13)
    
    # Header Logo (Placeholder for now)
    header = section.header
    header_para = header.paragraphs[0]
    header_para.text = "SỞ GIÁO DỤC VÀ ĐÀO TẠO...\nTRƯỜNG..."
    header_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Watermark for draft
    if is_draft:
        # Since true watermarks require complex OXML, we will just add a centered red text at the top
        draft_para = doc.add_paragraph()
        draft_run = draft_para.add_run("BẢN NHÁP AI - CHƯA PHÊ DUYỆT")
        draft_run.font.color.rgb = RGBColor(255, 0, 0)
        draft_run.font.size = Pt(16)
        draft_run.bold = True
        draft_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # Parse markdown body
    lines = content.split('\\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            i += 1
            continue
            
        # Headings
        if line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            text = line.lstrip('#').strip()
            doc.add_heading(text, level=min(level, 9))
            
        # Lists
        elif line.startswith('- ') or line.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            _parse_inline_markdown(p, line[2:])
            
        # Tables
        elif line.startswith('|'):
            # simple table parser
            headers = [c.strip() for c in line.split('|') if c.strip()]
            i += 1
            if i < len(lines) and lines[i].strip().startswith('|---'):
                i += 1
                table = doc.add_table(rows=1, cols=len(headers))
                table.style = 'Table Grid'
                hdr_cells = table.rows[0].cells
                for j, h in enumerate(headers):
                    hdr_cells[j].text = h
                
                while i < len(lines) and lines[i].strip().startswith('|'):
                    row_line = lines[i].strip()
                    cols = row_line.split('|')
                    if row_line.startswith('|'): cols = cols[1:]
                    if row_line.endswith('|'): cols = cols[:-1]
                    
                    if cols:
                        row_cells = table.add_row().cells
                        for j in range(min(len(cols), len(headers))):
                            _parse_inline_markdown(row_cells[j].paragraphs[0], cols[j])
                            
            continue # Already incremented i in the while loop
            
        # Code blocks (Skip or add as text)
        elif line.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            code_text = "\\n".join(code_lines)
            p = doc.add_paragraph(code_text)
            p.style = 'Macro Text'
            
        # Normal paragraphs
        else:
            p = doc.add_paragraph()
            _parse_inline_markdown(p, line)
            
        i += 1
        
    return doc

def _parse_inline_markdown(paragraph, text: str):
    """
    Very basic inline markdown parsing for **bold** and *italic*.
    """
    # Quick hack: split by **
    parts = text.split('**')
    for idx, part in enumerate(parts):
        is_bold = (idx % 2 != 0)
        # Check italic within part
        italic_parts = part.split('*')
        for jdx, ipart in enumerate(italic_parts):
            is_italic = (jdx % 2 != 0)
            if ipart:
                run = paragraph.add_run(ipart)
                if is_bold:
                    run.bold = True
                if is_italic:
                    run.italic = True
