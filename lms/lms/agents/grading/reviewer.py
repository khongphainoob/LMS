import json
import logging
from typing import Dict
from .shared_context import GradingContext
from ..utils.json_utils import extract_and_validate
from ..schemas import ReviewerResultSchema
from ..provider import get_llm as get_model

logger = logging.getLogger(__name__)

REVIEWER_PROMPT_TEMPLATE = """
BẠN LÀ CHUYÊN GIA THẨM ĐỊNH ĐIỂM (REVIEWER AGENT).
Nhiệm vụ: Kiểm tra bản nháp kết quả chấm thi và sửa các lỗi logic về điểm số.

## 1. CÁC LỖI CẦN TÌM:
- **Lỗi Gộp Câu (Merging Error)**: Nếu thấy Aggregator gộp các ý nhỏ (16a, 16b...) thành một câu lớn (16), BẮT BUỘC phải yêu cầu tách ra hoặc tự tách ra trong kết quả cuối. Mỗi ý nhỏ trong Rubric phải là một dòng riêng.
- **max_score = 0**: BẤT KỲ câu nào có max_score = 0 hoặc max_score <= 0 là LỖI NGHIÊM TRỌNG. Phải sửa thành giá trị phù hợp.
- **Mâu thuẫn Feedback/Điểm**: Feedback khen đúng nhưng điểm = 0 hoặc ngược lại.
- **Tính toán sai trong câu**: Tổng điểm các ý nhỏ không khớp với điểm câu lớn.
- **Bỏ sót ý**: Học sinh có làm nhưng Aggregator báo "Chưa có lời giải".
- **score > max_score**: Điểm vượt quá điểm tối đa.

## 2. QUY TẮC SỬA LỖI:
- **TÁCH Ý NHỎ**: Nếu bài làm có Câu 16a, 16b, 16c... thì `solution_results` PHẢI có ít nhất 3 object tương ứng.
- Nếu feedback khen đúng -> BẮT BUỘC phải cho điểm theo Rubric.
- Nếu trắc nghiệm Đúng/Sai: Phải ghi điểm cho từng ý nhỏ trong 'details' (thường là 0.25).

## 3. QUYẾT ĐỊNH RE-ANALYSIS:
Sau khi sửa lỗi, đánh giá xem bản kết quả CÓ THỂ CÒN sai ở cấp độ nhận diện hình ảnh (OCR/Visual) không.
- Nếu chỉ sai ở mức tính điểm (sai công thức tổng, max_score sai) -> Sửa xong là đủ, **needs_reanalysis = false**.
- Nếu nghi ngờ Visual Specialist đã nhận diện SAI câu trả lời của học sinh (OCR mờ, bị nhầm chữ, học sinh có làm nhưng bị báo chưa làm) -> **needs_reanalysis = true** và ghi rõ corrections.

## 4. QUY TẮC ĐẶT TÊN TRƯỜNG (NAMING RULES - CRITICAL):
- TRONG `mcq_results` VÀ `solution_results`: Bắt buộc dùng `question_no` (Ví dụ: "Câu 16 a"). KHÔNG DÙNG "question".
- TRONG `corrections`: Bắt buộc dùng `question` (Ví dụ: "Câu 16 a").

## 5. ĐỊNH DẠNG JSON TRẢ VỀ:
Bạn PHẢI trả về JSON tuân thủ CHÍNH XÁC cấu trúc sau (tuân thủ ReviewerResultSchema):
{{
    "total_score": float,
    "overall_feedback": "...",
    "confidence": float,
    "mcq_results": [
        {{
            "question_no": "Câu 1",
            "score": float,
            "max_score": float,
            "details": [...]
        }}
    ],
    "solution_results": [
        {{
            "question_no": "Câu 16 a",
            "score": float,
            "max_score": float,
            "feedback": "...",
            "is_correct": bool
        }}
    ],
    "needs_reanalysis": false,
    "corrections": [
        {{"question": "Câu X", "reason": "mô tả vấn đề..."}}
    ]
}}

## DỮ LIỆU ĐỐI CHIẾU:
- Rubric: {rubric}
- Báo cáo quan sát thực tế (Visual/OCR): {visual_reports}
- Bản nháp kết quả cần duyệt: {draft_result}
- Số lần đã re-analyze: {reanalysis_count}


HÃY TRẢ VỀ BẢN JSON ĐÃ ĐƯỢC SỬA LỖI. CHỈ TRẢ VỀ JSON.
"""

def run_review_analysis(context: GradingContext, draft_result: Dict) -> Dict:
    logger.info("Reviewer Agent: Double-checking the results...")
    model = get_model("review")

    try:
        prompt = REVIEWER_PROMPT_TEMPLATE.format(
            rubric=context['rubric_context'],
            visual_reports=json.dumps(context.get('visual_reports', []), ensure_ascii=False),
            draft_result=json.dumps(draft_result, ensure_ascii=False),
            reanalysis_count=context.get('reanalysis_count', 0)
        )

        response = model.invoke(prompt)
        result = extract_and_validate(response.content, ReviewerResultSchema)
        if result:
            return result.model_dump()
    except Exception as e:
        logger.error(f"Reviewer Error: {str(e)}")

    return draft_result
