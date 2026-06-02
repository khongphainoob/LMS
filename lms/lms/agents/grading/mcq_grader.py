import json
import logging
from langchain_core.messages import HumanMessage, SystemMessage
from ..utils.json_utils import extract_and_validate
from ..schemas import MCQGraderResultSchema
from ..provider import get_llm as get_model
from .shared_context import observe
from lms.lms.services.observability import get_unified_config_dict

logger = logging.getLogger(__name__)

MCQ_GRADER_PROMPT = """
BẠN LÀ CHUYÊN GIA CHẤM ĐIỂM TRẮC NGHIỆM (MCQ SPECIALIST).
Nhiệm vụ: So khớp bài làm học sinh với đáp án chuẩn và phân tích chi tiết từng lựa chọn.

## QUY TẮC SO KHỚP (MATCHING RULES):
1. **Đối chiếu chính xác**: So khớp Câu X -> Đáp án học sinh chọn -> Đáp án chuẩn.
2. **Format từng ý nhỏ**: Với các câu trắc nghiệm Đúng/Sai hoặc nhiều ý, PHẢI tách thành các dòng riêng trong `details`.
3. **Đối chiếu & Giải thích**: Ghi rõ "Học sinh chọn A, Đáp án chuẩn là B" trong phần feedback của từng câu.

## ĐỊNH DẠNG JSON YÊU CẦU:
{
    "total_score": float,
    "overall_feedback": "tổng hợp kết quả trắc nghiệm",
    "mcq_results": [
        {
            "question_no": "Câu 1",
            "score": float,
            "max_score": float,
            "details": [
                {
                    "label": "a",
                    "student_choice": "A",
                    "correct_answer": "B",
                    "is_correct": false,
                    "score": 0.0,
                    "max_score": 0.25,
                    "feedback": "HS chọn A, đáp án chuẩn là B. Sai."
                }
            ]
        }
    ]
}

LƯU Ý: Tuyệt đối tuân thủ tên trường (field names) để không gây lỗi Pydantic.
"""

@observe(as_type="generation", name="MCQ Grader Analysis")
def run_mcq_grading(ocr_text: str, answer_key: dict, rubric_context: str, session_id: str = None) -> dict:
    model, _, _ = get_model("mcq_grading")
    
    payload = {
        "student_ocr_text": ocr_text,
        "answer_key": answer_key,
        "rubric": rubric_context
    }
    
    messages = [
        SystemMessage(content=MCQ_GRADER_PROMPT),
        HumanMessage(content=f"DỮ LIỆU CHẤM ĐIỂM:\n{json.dumps(payload, ensure_ascii=False)}")
    ]
    
    try:
        config = get_unified_config_dict(agent_name="MCQ Grader", session_id=session_id, tags=["AI Grading"]) if session_id else None
        if config:
            response = model.invoke(messages, config=config)
        else:
            response = model.invoke(messages)
        result = extract_and_validate(response.content, MCQGraderResultSchema)
        if result:
            return result.model_dump()
    except Exception as e:
        logger.error(f"MCQ Grader Error: {str(e)}")
        return {"error": str(e)}

    return {"error": "Failed to parse MCQ results"}
