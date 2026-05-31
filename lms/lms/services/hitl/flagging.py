import frappe
from typing import Tuple, Dict, Any, List

def should_flag_grading(result: Dict[str, Any], max_score: float = 10.0) -> Tuple[bool, str, str]:
    """
    Phân tích kết quả chấm điểm.
    Trả về (is_flagged, reason, priority)
    """
    reasons = []
    priority = "Medium"
    
    score = result.get("score", 0)
    
    # Check if we have feedback text
    feedback = result.get("feedback", "")
    
    if score == 0 and len(str(feedback)) > 100:
        reasons.append("AI chấm điểm = 0 nhưng có nội dung feedback dài (nghi ngờ OCR lỗi hoặc format sai)")
        priority = "High"
    elif score < (0.2 * max_score):
        reasons.append("Điểm cực thấp (< 20%), cần giáo viên review")
    
    return (len(reasons) > 0, "; ".join(reasons), priority)

def should_flag_chatbot(state: Dict[str, Any], session_doc: Any) -> Tuple[bool, str, str]:
    """
    Phát hiện các tình huống cần GV can thiệp trong Chatbot.
    Trả về (is_flagged, reason, priority)
    """
    reasons = []
    priority = "Medium"
    
    if state.get("is_blocked", False):
        reasons.append("Học sinh gửi nội dung vi phạm bị chặn")
        priority = "High"
        
    chat_history = state.get("chat_history", [])
    
    # Check for frustration (repeated message)
    if len(chat_history) >= 6:
        # User messages are typically at index -2, -4, -6 etc if interleaved
        user_msgs = [m for m in chat_history if m.get("role") == "user"]
        if len(user_msgs) >= 3:
            last_3 = user_msgs[-3:]
            if len(set([m.get("content", "") for m in last_3])) == 1:
                reasons.append("Học sinh lặp lại một câu hỏi nhiều lần")
                
    return (len(reasons) > 0, "; ".join(reasons), priority)

def should_flag_socratic(scaffolding_level: int, chat_history: List[Dict[str, Any]]) -> Tuple[bool, str, str]:
    """
    Phát hiện HS cần giúp đỡ từ GV trong Socratic.
    Trả về (is_flagged, reason, priority)
    """
    reasons = []
    priority = "Medium"
    
    if scaffolding_level >= 4:
        reasons.append("Học sinh kẹt ở mức hỗ trợ cao nhất (Level 4), AI đã giải thích chi tiết")
        priority = "High"
        
    return (len(reasons) > 0, "; ".join(reasons), priority)
