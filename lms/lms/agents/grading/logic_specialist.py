import json
import logging
from typing import Optional
from langchain_core.messages import HumanMessage
from ..utils.json_utils import extract_and_validate
from ..schemas import LogicReportSchema
from .shared_context import LogicReport, GradingContext, VisualPageReport, observe
from ..provider import get_llm as get_model
from lms.lms.services.observability import get_unified_config_dict

logger = logging.getLogger(__name__)

LOGIC_PROMPT_TEMPLATE = """
BẠN LÀ LOGIC & CALCULATION SPECIALIST (CHUYÊN GIA LOGIC VÀ TÍNH TOÁN).
NHIỆM VỤ: Kiểm tra tính toán và tính nhất quán của lời giải dựa trên dữ liệu OCR và Visual Report.

## DỮ LIỆU ĐẦU VÀO:
1. OCR Text: Văn bản thô trích xuất từ bài làm.
2. Visual Report: Các phát hiện về hình vẽ, sơ đồ và dấu hiệu từ Visual Specialist.
3. Rubric: Quy tắc chấm và đáp án chuẩn.

## CÁC BƯỚC THỰC HIỆN:
1. **Soát lỗi tính toán:** Kiểm tra từng phép tính (cộng, trừ, nhân, chia, chuyển vế). 
   - Nếu phát hiện lỗi, liệt kê chi tiết: Biểu thức gốc -> Kết quả học sinh -> Kết quả đúng.
2. **Kiểm tra tính nhất quán:**
   - Kết quả câu trước có được dùng đúng cho câu sau không?
   - Các đơn vị đo lường có thống nhất không?
   - Có bước nào bị "nhảy cóc" logic không?

## ĐỊNH DẠNG TRẢ VỀ (JSON):
{{
    "was_run": true,
    "calculation_errors": [
        {{
            "step": int,
            "original_expression": "string",
            "student_value": "string",
            "correct_value": "string",
            "error_type": "arithmetic | unit | sign | logic",
            "impact": "minor | major | fatal"
        }}
    ],
    "consistency_issues": ["mô tả lỗi..."],
    "logical_feedback": "nhận xét tổng thể về logic giải bài",
    "severity": "none | low | medium | high"
}}

LƯU Ý: Nếu bài là MCQ thuần túy và không có lời giải viết tay, hãy trả về 'calculation_errors': [] và severity: 'none'.

DỮ LIỆU BÀI LÀM:
{grading_manifest}
"""

def _get_logic_model():
    return get_model("logic")[0]

@observe(as_type="generation", name="Logic Specialist Analysis")
def run_logic_analysis(context: GradingContext) -> Optional[LogicReport]:
    """
    Chạy phân tích logic và tính toán.
    Chỉ chạy nếu có ít nhất một trang có 'has_solution_text' = True.
    """
    has_solution = any(r['has_solution_text'] for r in context['visual_reports'])
    
    if not has_solution and context['exam_type'] == 'mcq_only':
        logger.info("Logic Specialist: Skipped (Pure MCQ with no solution text)")
        return {
            "was_run": False,
            "calculation_errors": [],
            "consistency_issues": [],
            "logical_feedback": "No solution text to analyze.",
            "severity": "none"
        }

    logger.info("Logic Specialist: Running analysis on solution text...")
    
    # Chuẩn bị Manifest để AI đọc
    manifest = {
        "visual_reports": context['visual_reports'],
        "rubric": context['rubric_context']
    }
    
    model = _get_logic_model()
    try:
        prompt = LOGIC_PROMPT_TEMPLATE.format(grading_manifest=json.dumps(manifest, ensure_ascii=False))
        
        session_id = context.get('session_id')
        config = get_unified_config_dict(agent_name="Logic Specialist", session_id=session_id, tags=["AI Grading"])
        response = model.invoke(prompt, config=config)
        
        import re
        json_match = re.search(r"\{.*\}", response.content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
    except Exception as e:
        logger.error(f"Error in Logic Specialist: {str(e)}")
        
    return None
