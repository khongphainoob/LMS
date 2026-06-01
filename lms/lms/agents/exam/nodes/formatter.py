from typing import Dict, Any

def node_format(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format the generated exam to ensure text cleanliness, 
    LaTeX normalization, or any post-processing required.
    """
    final_exam = state.get("final_exam")
    if not final_exam:
        return state
        
    try:
        # Example of formatting: Ensure all mathematical equations use standard MathJax $...$ format
        # and clean up basic markdown inconsistencies.
        for section in final_exam.get("sections", []):
            for q in section.get("questions", []):
                if q.get("question_text"):
                    q["question_text"] = q["question_text"].replace(r"\(", "$").replace(r"\)", "$").replace(r"\[", "$$").replace(r"\]", "$$")
                if q.get("explanation"):
                    q["explanation"] = q["explanation"].replace(r"\(", "$").replace(r"\)", "$").replace(r"\[", "$$").replace(r"\]", "$$")
                
                # Format options if they exist — guard against options=None
                for opt in (q.get("options") or []):
                    if opt and opt.get("text"):
                        opt["text"] = opt["text"].replace(r"\(", "$").replace(r"\)", "$").replace(r"\[", "$$").replace(r"\]", "$$")
                        
    except Exception as e:
        state["errors"].append(f"Formatter failed: {str(e)}")
        
    return state
