import json
from langchain_core.tools import tool
from ..utils.filesystem import _read_filesystem, _write_to_filesystem
from ..utils.json_utils import extract_json

@tool
def tool_validate_score(session_id: str, score: float = None, feedback: str = None) -> str:
    """
    Hard validation bằng Python. KHÔNG gọi AI.
    Ghi kết quả vào grading_result.json và đảm bảo tính nhất quán.
    """
    try:
        # Nếu có truyền trực tiếp thì ưu tiên dùng, nếu không thì đọc từ đĩa
        if score is not None:
            data = {
                "total_score": score,
                "overall_feedback": feedback or "",
                "questions": []
            }
        else:
            data_str = _read_filesystem(session_id, "grading_result.json")
            if not data_str:
                return "Error: grading_result.json not found."
            data = json.loads(data_str)
        
        total = float(data.get("total_score", 0))
        total = round(min(10.0, max(0.0, total)), 2)

        questions = data.get("questions", [])
        if questions:
            q_sum = sum(float(q.get("score", 0)) for q in questions)
            if abs(q_sum - total) > 0.5:
                # Override total if sum of questions is significantly different
                total = round(min(10.0, max(0.0, q_sum)), 2)

        for q in questions:
            max_s = float(q.get("max_score", 10.0))
            q["score"] = round(min(max_s, max(0.0, float(q.get("score", 0)))), 2)

        data["total_score"] = total
        data["validated"] = True
        
        _write_to_filesystem(session_id, "grading_result.json", data)
        return "Validation successful."
    except Exception as e:
        return f"Validation failed: {str(e)}"

import logging
logger = logging.getLogger(__name__)

@tool
def skill_detect_question_types(session_id: str, image_paths: list[str]) -> str:
    """
    Phân tích hình ảnh bài làm để nhận diện các vùng câu hỏi và phân loại chúng.
    Trả về JSON list các vùng: {"q_no": "1", "subtype": "single|multi|true_false", "image_path": "..."}.
    """
    from .document_tools import _get_vision_model, _b64
    from langchain_core.messages import HumanMessage
    import logging
    logger = logging.getLogger(__name__)

    try:
        model = _get_vision_model()
        content = [{"type": "text", "text": "Phân tích các ảnh sau và xác định các câu hỏi trắc nghiệm. Phân loại từng câu vào: 'single' (khoanh 1 đáp án), 'multi' (chọn nhiều đáp án), hoặc 'true_false' (đúng/sai). Trả về JSON array: [{\"q_no\": \"1\", \"subtype\": \"single\", \"image_path\": \"path_to_image\"}]"}]
        
        for p in image_paths:
            content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{_b64(p)}", "detail": "high"}})
            
        msg = HumanMessage(content=content)
        resp = model.invoke([msg])

        parsed = extract_json(resp.content, expected_type="array")
        if parsed and isinstance(parsed, list):
            detection = parsed
            _write_to_filesystem(session_id, "question_detection.json", detection)
            return f"SUCCESS: Đã nhận diện được {len(detection)} câu hỏi."
        return "ERROR: Không tìm thấy câu hỏi trắc nghiệm nào."
    except Exception as e:
        logger.error(f"Lỗi detect question types: {e}")
        return f"ERROR: {str(e)}"

@tool
def skill_grade_mcq_single(session_id: str, question_info: dict) -> str:
    """
    Chấm điểm câu hỏi trắc nghiệm 1 đáp án (khoanh tròn).
    question_info: {"q_no": "1", "image_path": "...", "correct_ans": "A"}
    """
    from .document_tools import _get_vision_model, _b64
    from langchain_core.messages import HumanMessage
    
    try:
        model = _get_vision_model()
        img_b64 = _b64(question_info['image_path'])
        prompt = f"""
        CHẤM ĐIỂM MCQ SINGLE CHOICE (KHOANH TRÒN).
        Câu hỏi: {question_info['q_no']}
        Đáp án đúng: {question_info['correct_ans']}
        
        Nhiệm vụ: Nhìn ảnh, xác định học sinh khoanh vào đáp án nào.
        Trả về JSON: {{
            "q_no": "{question_info['q_no']}",
            "subtype": "single",
            "student_ans": "...",
            "correct_ans": "{question_info['correct_ans']}",
            "is_correct": bool,
            "score": 1.0 or 0.0,
            "feedback": "..."
        }}
        """
        msg = HumanMessage(content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
        ])
        resp = model.invoke([msg])
        return resp.content
    except Exception as e:
        return json.dumps({"error": str(e)})

@tool
def skill_grade_mcq_multi(session_id: str, question_info: dict) -> str:
    """
    Chấm điểm câu hỏi trắc nghiệm nhiều đáp án.
    question_info: {"q_no": "2", "image_path": "...", "correct_ans": ["A", "B"]}
    """
    from .document_tools import _get_vision_model, _b64
    from langchain_core.messages import HumanMessage
    
    try:
        model = _get_vision_model()
        img_b64 = _b64(question_info['image_path'])
        prompt = f"""
        CHẤM ĐIỂM MCQ MULTI CHOICE (NHIỀU ĐÁP ÁN).
        Câu hỏi: {question_info['q_no']}
        Đáp án đúng: {question_info['correct_ans']}
        
        Nhiệm vụ: Nhìn ảnh, xác định học sinh chọn những đáp án nào.
        Trả về JSON: {{
            "q_no": "{question_info['q_no']}",
            "subtype": "multi",
            "student_ans": [...],
            "correct_ans": {question_info['correct_ans']},
            "is_correct": bool,
            "score": float,
            "feedback": "..."
        }}
        """
        msg = HumanMessage(content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
        ])
        resp = model.invoke([msg])
        return resp.content
    except Exception as e:
        return json.dumps({"error": str(e)})

@tool
def skill_grade_true_false(session_id: str, question_info: dict) -> str:
    """
    Chấm điểm câu hỏi Đúng/Sai.
    question_info: {"q_no": "3", "image_path": "...", "correct_ans": "Đúng"}
    """
    from .document_tools import _get_vision_model, _b64
    from langchain_core.messages import HumanMessage
    
    try:
        model = _get_vision_model()
        img_b64 = _b64(question_info['image_path'])
        prompt = f"""
        CHẤM ĐIỂM ĐÚNG/SAI.
        Câu hỏi: {question_info['q_no']}
        Đáp án đúng: {question_info['correct_ans']}
        
        Nhiệm vụ: Nhìn ảnh, xác định học sinh chọn Đúng hay Sai.
        Trả về JSON: {{
            "q_no": "{question_info['q_no']}",
            "subtype": "true_false",
            "student_ans": "Đúng/Sai",
            "correct_ans": "{question_info['correct_ans']}",
            "is_correct": bool,
            "score": float,
            "feedback": "..."
        }}
        """
        msg = HumanMessage(content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
        ])
        resp = model.invoke([msg])
        return resp.content
    except Exception as e:
        return json.dumps({"error": str(e)})
