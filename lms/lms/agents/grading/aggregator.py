import logging
import json
from typing import Dict
from .shared_context import GradingContext
from ..utils.json_utils import extract_and_validate
from ..schemas import AggregatorResultSchema
from ..provider import get_llm as get_model

logger = logging.getLogger(__name__)

AGGREGATOR_PROMPT_TEMPLATE = """
BẠN LÀ AGGREGATOR (GIÁM KHẢO TỔNG HỢP) - NGƯỜI QUYẾT ĐỊNH ĐIỂM SỐ CUỐI CÙNG.
Nhiệm vụ: Tổng hợp báo cáo từ các chuyên gia (Visual, Logic) và đối chiếu Rubric để ra kết quả.

## QUY TẮC ƯU TIÊN (PRIORITY RULES):
1. **Logic > Visual (Dành cho Tự luận/STEM):** 
   - Nếu Visual thấy hình vẽ đúng nhưng Logic phát hiện tính toán sai ở bước then chốt -> Ưu tiên Logic Report để trừ điểm.
   - Nếu có sự mâu thuẫn về đáp án giữa lời giải và hình vẽ, ưu tiên Logic Report (lời giải).
2. **Visual > Logic (Dành cho MCQ/Trình bày):**
   - Với câu trắc nghiệm thuần túy, tin tưởng tuyệt đối vào Visual Report về dấu tích/khoanh tròn.
   - Nếu Logic Specialist không chạy, chỉ dựa vào Visual Report và OCR.
3. **TRƯỜNG HỢP THIẾU RUBRIC HOẶC ĐÁP ÁN:**
   - Nếu `rubric` hoặc `answer_key` trống hoặc báo "No context provided", BẠN VẪN PHẢI TỰ CHẤM ĐIỂM.
   - Dựa vào kiến thức học thuật chung để tự xác định học sinh làm đúng hay sai.
   - Mặc định cho mỗi ý/câu đúng là 1.0 điểm. KHÔNG ĐƯỢC TỪ CHỐI CHẤM ĐIỂM.


## QUY TẮC ĐẶT TÊN TRƯỜNG (FIELD NAMING - CRITICAL):
- BẮT BUỘC dùng `question_no` cho số thứ tự câu hỏi. 
- **QUY TẮC TIỀN TỐ (PREFIX RULE):** Mọi mục nhỏ đều PHẢI bắt đầu bằng tên câu hỏi lớn (Ví dụ: "Câu 15: Na2O + H2O...", "Câu 15: 3Fe + 2O2..."). KHÔNG ĐƯỢC để tên mục trống hoặc thiếu chữ "Câu".
- BẮT BUỘC dùng `score` cho điểm số.
- BẮT BUỘC dùng `max_score` cho điểm tối đa.

## QUY TẮC CẤU TRÚC (STRUCTURAL RULES - CRITICAL):
1. **KHÔNG ĐƯỢC GỘP CÂU (DO NOT MERGE):** Nếu bài làm có các ý nhỏ (ví dụ: Câu 16a, 16b, 16c hoặc Câu 13 A, B, C), bạn PHẢI giữ nguyên chúng thành từng mục riêng biệt. 
2. **CHI TIẾT ĐẾN TỪNG Ý:** Mỗi ý nhỏ phải có `score`, `max_score` và `feedback` riêng. Tuyệt đối không gộp chung thành một câu lớn rồi nhận xét chung chung.

## YÊU CẦU OUTPUT JSON CHUẨN:
Bạn PHẢI trả về JSON tuân thủ CHÍNH XÁC cấu trúc sau (tuân thủ Pydantic Schema):
{{
    "total_score": float,
    "summary": "nhận xét tổng quát",
    "confidence": float,
    "mcq_results": [
        {{
            "question_no": "Câu 13 A",
            "score": float,
            "max_score": float,
            "details": [
                {{"label": "A", "student_choice": "...", "correct_answer": "...", "is_correct": true/false, "score": float, "max_score": float, "feedback": "..."}}
            ]
        }}
    ],
    "solution_results": [
        {{
            "question_no": "Câu 16 a",
            "score": float,
            "max_score": float,
            "feedback": "...",
            "is_correct": true/false
        }}
    ]
}}

LƯU Ý: max_score CỦA TỪNG CÂU VÀ TỪNG Ý PHẢI > 0. KHÔNG BAO GIỜ GÁN max_score = 0.

## DỮ LIỆU ĐÃ TỔNG HỢP:
{final_manifest}
"""

def aggregate_final_grade(context: dict) -> dict:
    """
    Hàm tổng hợp cuối cùng.
    Sử dụng get_model('aggregator') và extract_and_validate từ Tier 4.
    """
    session_id = context.get('session_id', 'unknown')
    logger.info(f"Aggregator: Finalizing grade for session {session_id}")
    
    exam_type = context.get('exam_type', 'mixed')
    if exam_type == 'mcq_only':
        logger.debug("Applying Priority Rule: Visual > Logic (MCQ Mode)")
    elif exam_type in ['stem_visual', 'mixed']:
        logger.debug("Applying Priority Rule: Logic > Visual (Analysis Mode)")

    model = get_model('aggregator')

    manifest = {
        "exam_type": exam_type,
        "visual_reports": context.get('visual_reports', []),
        "logic_report": context.get('logic_report', {}),
        "rubric": context.get('rubric_context', ''),
        "answer_key": context.get('answer_key', {})
    }

    try:
        prompt = AGGREGATOR_PROMPT_TEMPLATE.format(
            final_manifest=json.dumps(manifest, ensure_ascii=False, indent=2)
        )
        response = model.invoke(prompt)
        
        result = extract_and_validate(response.content, AggregatorResultSchema)
        if result:
            return result.model_dump()
            
    except Exception as e:
        logger.error(f"Aggregator Error: {str(e)}")
        
    return {
        "error": "Failed to aggregate final grade", 
        "total_score": 0.0,
        "confidence": 0.0,
        "summary": "Lỗi trong quá trình tổng hợp điểm."
    }
