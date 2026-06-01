import re

def convert_md_to_latex(md_text: str, topic: str = "Bài giảng") -> str:
    """
    Converts markdown content into a compilable LaTeX document
    specifically configured for Vietnamese characters and academic math.
    """
    # 1. Boilerplate / Preamble
    latex = []
    latex.append(r"\documentclass[12pt,a4paper]{article}")
    latex.append(r"\usepackage[utf8]{inputenc}")
    latex.append(r"\usepackage[T5]{fontenc}")
    latex.append(r"\usepackage[vietnamese]{babel}")
    latex.append(r"\usepackage{amsmath, amssymb, amsthm}")
    latex.append(r"\usepackage[margin=2cm]{geometry}")
    latex.append(r"\usepackage{longtable, booktabs, array}")
    latex.append(r"\usepackage{graphicx}")
    latex.append(r"\usepackage{hyperref}")
    latex.append(r"\usepackage{enumitem}")
    latex.append(r"\usepackage{fancyhdr}")
    latex.append(r"\usepackage{tikz}")
    
    latex.append(r"\title{" + topic + r"}")
    latex.append(r"\author{AI Lesson Planner}")
    latex.append(r"\date{\today}")
    
    latex.append(r"\begin{document}")
    latex.append(r"\maketitle")
    
    # 2. Convert body
    in_code_block = False
    is_raw_latex_block = False
    in_table = False
    
    lines = md_text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines
        if not line:
            if not in_table and not in_code_block:
                latex.append("")
            i += 1
            continue
            
        # Code blocks
        if line.startswith("```"):
            if in_code_block:
                latex.append(r"\end{verbatim}")
                in_code_block = False
            else:
                latex.append(r"\begin{verbatim}")
                in_code_block = True
            i += 1
            continue
            
        if in_code_block:
            latex.append(line)
            i += 1
            continue
            
        # Headings
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#"))
            text = _escape_latex(line.lstrip("#").strip())
            if level == 1:
                latex.append(r"\section{" + text + "}")
            elif level == 2:
                latex.append(r"\subsection{" + text + "}")
            else:
                latex.append(r"\subsubsection{" + text + "}")
            
        # Lists
        elif line.startswith("- ") or line.startswith("* "):
            latex.append(r"\begin{itemize}")
            latex.append(r"  \item " + _escape_latex(line[2:]))
            # consume list items
            while i + 1 < len(lines) and (lines[i+1].strip().startswith("- ") or lines[i+1].strip().startswith("* ")):
                i += 1
                latex.append(r"  \item " + _escape_latex(lines[i+1].strip()[2:]))
            latex.append(r"\end{itemize}")
            
        # Images
        elif line.startswith("!["):
            import re
            match = re.match(r"!\[(.*?)\]\((.*?)\)", line)
            if match:
                alt_text, img_url = match.groups()
                latex.append(r"\begin{figure}[h!]")
                latex.append(r"  \centering")
                latex.append(r"  \includegraphics[width=0.8\textwidth]{" + img_url + "}")
            if alt_text:
                latex.append(r"  \caption{" + _escape_latex(alt_text) + "}")
            latex.append(r"\end{figure}")
            
        # Normal Text
        else:
            latex.append(_escape_latex(line))
            
        i += 1
        
    if in_table:
        latex.append(r"\end{longtable}")
        
    latex.append(r"\end{document}")
    
    return "\n".join(latex)

def _escape_latex(text: str) -> str:
    """
    Escapes latex special characters but leaves math $...$ intact.
    """
    # Temporarily hide math blocks
    math_blocks = []
    
    def replacer(match):
        math_blocks.append(match.group(0))
        return f"MATHBLOCKMAGIC{len(math_blocks)-1}MAGIC"
        
    # Replace $$...$$ and $...$
    text = re.sub(r'\$\$.*?\$\$', replacer, text, flags=re.DOTALL)
    text = re.sub(r'\$.*?\$', replacer, text)
    
    # Escape chars
    text = text.replace('\\', r'\textbackslash{}')
    text = text.replace('&', r'\&')
    text = text.replace('%', r'\%')
    text = text.replace('$', r'\$')
    text = text.replace('#', r'\#')
    text = text.replace('_', r'\_')
    text = text.replace('{', r'\{')
    text = text.replace('}', r'\}')
    text = text.replace('~', r'\textasciitilde{}')
    text = text.replace('^', r'\textasciicircum{}')
    
    # Very basic bold/italic
    text = re.sub(r'\*\*(.*?)\*\*', r'\\textbf{\1}', text)
    text = re.sub(r'\*(.*?)\*', r'\\textit{\1}', text)
    
    # Restore math blocks
    for i, math_block in enumerate(math_blocks):
        text = text.replace(f"MATHBLOCKMAGIC{i}MAGIC", math_block)
        
    return text
