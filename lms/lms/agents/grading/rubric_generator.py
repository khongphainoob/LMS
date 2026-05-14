import json
import logging
from typing import List, Dict
from ..utils.json_utils import extract_json
from ..provider import get_llm as get_model

logger = logging.getLogger(__name__)

RUBRIC_GEN_PROMPT = """
BẠN LÀ CHUYÊN GIA THIẾT KẾ ĐỀ THI VÀ RUBRIC CHẤM ĐIỂM CAO CẤP.
NHIỆM VỤ: Phân tích nội dung câu hỏi từ tệp tin và tạo ra một Rubric chấm điểm chi tiết.

## 1. PHÂN TÍCH NỘI DUNG:
- Xác định các câu hỏi (Trắc nghiệm, Tự luận, Đúng/Sai).
- Trích xuất đáp án đúng hoặc hướng dẫn giải cho mỗi câu.

## 2. QUY TẮC TẠO CRITERIA:
Mỗi câu hỏi sẽ trở thành một 'Criterion' trong Rubric với:
- `criterion_name`: Tên câu hỏi (ví dụ: Câu 1).
- `criterion_type`: Loại câu (Correctness cho MCQ, Completeness/Clarity cho Essay).
- `max_score`: Điểm tối đa của câu đó (nếu không ghi rõ trong đề, hãy tự phân bổ hợp lý trên thang 10).
- `description`: Nội dung câu hỏi và đáp án chuẩn.
- `performance_levels_json`: Mô tả chi tiết cách trừ điểm (ví dụ: Đúng hoàn toàn: 100% điểm, Sai logic: 50% điểm, Sai hoàn toàn: 0đ).

## ĐỊNH DẠNG JSON TRẢ VỀ:
[{{
    "criterion_name": "...",
    "criterion_type": "...",
    "max_score": float,
    "weight": 1.0,
    "description": "...",
    "performance_levels_json": "{{\\"levels\\": [...]}}"
}}]

NỘI DUNG CÂU HỎI TRÍCH XUẤT:
{extracted_text}
"""

def generate_rubric_structure(extracted_text: str) -> List[Dict]:
    model = get_model("rubric_gen")

    try:
        response = model.invoke(RUBRIC_GEN_PROMPT.format(extracted_text=extracted_text))
        parsed = extract_json(response.content, expected_type="array")
        if parsed:
            return parsed
    except Exception as e:
        logger.error(f"Rubric Generation Error: {str(e)}")
    
    return []
