import json
import re
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from lms.lms.agents.provider import get_llm
from lms.lms.agents.utils.json_utils import extract_json
import logging

logger = logging.getLogger(__name__)

class RubricBuilderState(TypedDict):
    input_text: str
    grading_scale: str
    max_score: float
    subject: str
    level: str
    knowledge_map: str
    analysis_topics: List[str]
    criteria: List[Dict[str, Any]]
    raw_response: str          # lưu raw text từ LLM để node sau phân tích nếu cần
    retry_count: int           # đếm số lần retry
    tokens_used: int
    input_tokens: int
    output_tokens: int
    total_cost_usd: float
    error: str

MAX_RETRIES = 2

RUBRIC_GEN_PROMPT = """BẠN LÀ CHUYÊN GIA THIẾT KẾ RUBRIC CHẤM ĐIỂM VÀ ĐỀ THI CAO CẤP.
Dựa vào mô tả bài kiểm tra dưới đây, hãy tạo ra một Rubric chấm điểm chi tiết.

THÔNG TIN BÀI KIỂM TRA:
- Môn học: {subject}
- Cấp độ: {level}
- Thang điểm: {grading_scale}
- Điểm tối đa: {max_score}
- Nội dung/Mô tả: {input_text}

QUY TẮC QUAN TRỌNG:
1. Phân bổ điểm cho từng câu hỏi/phần thi sao cho tổng điểm đúng bằng {max_score}.
2. Nếu là đề thi Toán hoặc các môn Khoa học tự nhiên, hãy chi tiết hóa điểm số theo từng bước giải (VD: 0.25đ cho mỗi bước).
3. Nếu là trắc nghiệm Đúng/Sai (Chuẩn MOET 2025): Phân bổ điểm lũy tiến (Đúng 1 ý: 0.1đ, Đúng 2 ý: 0.25đ, Đúng 3 ý: 0.5đ, Đúng 4 ý: 1.0đ).
4. Mỗi tiêu chí (criterion) tương ứng với 1 câu hỏi hoặc 1 kỹ năng cụ thể.
5. KHÔNG ĐƯỢC để dấu phẩy ở cuối object/array (Trailing commas).
6. KHÔNG ĐƯỢC dùng ký tự xuống dòng (Enter) trực tiếp trong chuỗi. Phải dùng \\n.

ĐỊNH DẠNG JSON TRẢ VỀ (Chỉ trả về Array JSON thuần, không giải thích gì thêm, không markdown):
[
    {{
        "criterion_name": "Tên câu hỏi / Tiêu chí",
        "criterion_type": "General",
        "max_score": 1.0,
        "weight": 1.0,
        "description": "Mô tả chi tiết câu hỏi hoặc yêu cầu",
        "level_excellent": "Mô tả mức độ xuất sắc (ví dụ: Làm đúng hoàn toàn +1.0đ)",
        "level_good": "Mô tả mức độ khá (ví dụ: Thiếu kết luận +0.75đ)",
        "level_adequate": "Mô tả mức độ đạt (ví dụ: Chỉ đúng công thức +0.25đ)",
        "level_poor": "Mô tả mức độ kém (ví dụ: Sai hoàn toàn +0đ)"
    }}
]"""

RUBRIC_FIX_PROMPT = """Bạn nhận được một phản hồi từ AI nhưng JSON bị lỗi cú pháp hoặc không đúng format.
Hãy sửa lại để trả về một JSON Array hợp lệ với các field sau cho mỗi phần tử:
- criterion_name (string)
- criterion_type (string, thường là "General")  
- max_score (number)
- weight (number, thường là 1.0)
- description (string)
- level_excellent (string)
- level_good (string)
- level_adequate (string)
- level_poor (string)

QUY TẮC BẮT BUỘC:
- Chỉ trả về JSON Array thuần. Không giải thích, không markdown, không ```json```.
- KHÔNG để trailing commas.
- KHÔNG dùng ký tự Enter thật trong chuỗi, chỉ dùng \\n.
- Giữ nguyên nội dung ý nghĩa từ văn bản gốc.

VĂN BẢN GỐC CẦN SỬA:
{raw_response}"""


def node_generate_rubric(state: RubricBuilderState) -> RubricBuilderState:
    """Node 1: Gọi LLM tạo rubric lần đầu."""
    llm, model_name, cost_info = get_llm("rubric_gen", temperature=0.1)
    prompt = RUBRIC_GEN_PROMPT.format(
        subject=state.get("subject", "General"),
        level=state.get("level", "N/A"),
        grading_scale=state.get("grading_scale", "10-point"),
        max_score=state.get("max_score", 10.0),
        input_text=state.get("input_text", "")
    )

    try:
        response = llm.invoke(prompt)
        raw = response.content or ""
        state["raw_response"] = raw
        state["retry_count"] = state.get("retry_count", 0)

        parsed = extract_json(raw, expected_type="array")
        if parsed and isinstance(parsed, list) and len(parsed) > 0:
            state["criteria"] = parsed
            state["error"] = ""
        else:
            logger.warning(f"[rubric_gen] Node generate: JSON extraction failed. Raw (first 300): {raw[:300]}")
            state["criteria"] = []
            # Không set error ngay - để node validate xử lý
    except Exception as e:
        state["error"] = str(e)
        state["raw_response"] = ""

    return state


def node_validate_and_fix(state: RubricBuilderState) -> RubricBuilderState:
    """Node 2: Kiểm tra kết quả, nếu sai thì yêu cầu LLM tự sửa JSON."""
    criteria = state.get("criteria", [])
    raw = state.get("raw_response", "")
    retry_count = state.get("retry_count", 0)

    # Nếu đã có criteria hợp lệ → validate từng item
    if criteria and isinstance(criteria, list):
        required_fields = {"criterion_name", "max_score"}
        valid = [c for c in criteria if required_fields.issubset(c.keys())]
        if len(valid) == len(criteria):
            logger.info(f"[rubric_gen] Validation passed: {len(valid)} criteria OK.")
            state["criteria"] = valid
            state["error"] = ""
            return state
        else:
            logger.warning(f"[rubric_gen] Validation: {len(criteria) - len(valid)} criteria missing required fields.")
            state["criteria"] = valid
            if valid:
                return state  # chấp nhận partial nếu còn dữ liệu

    # Không có criteria / criteria trống → thử dùng LLM sửa JSON từ raw_response
    if not raw or retry_count >= MAX_RETRIES:
        state["error"] = f"AI không thể tạo rubric hợp lệ sau {retry_count} lần thử. Vui lòng thử lại với mô tả đề chi tiết hơn."
        return state

    logger.info(f"[rubric_gen] Attempting JSON fix via LLM (retry {retry_count + 1}/{MAX_RETRIES})...")
    try:
        llm, _, _ = get_llm("rubric_gen", temperature=0.0)
        fix_prompt = RUBRIC_FIX_PROMPT.format(raw_response=raw[:3000])  # giới hạn để tránh quá dài
        fix_response = llm.invoke(fix_prompt)
        fixed_raw = fix_response.content or ""

        parsed = extract_json(fixed_raw, expected_type="array")
        if parsed and isinstance(parsed, list) and len(parsed) > 0:
            state["criteria"] = parsed
            state["error"] = ""
            state["retry_count"] = retry_count + 1
            logger.info(f"[rubric_gen] JSON fix succeeded: {len(parsed)} criteria recovered.")
        else:
            state["retry_count"] = retry_count + 1
            state["error"] = "AI trả về JSON không hợp lệ sau khi sửa. Vui lòng thử lại."
            logger.warning(f"[rubric_gen] JSON fix failed. Fixed raw (first 300): {fixed_raw[:300]}")
            import frappe
            frappe.log_error(f"RAW:\n{raw}\n\nFIXED:\n{fixed_raw}", "Rubric JSON Fix Failed")
    except Exception as e:
        state["error"] = f"Lỗi khi sửa JSON: {str(e)}"

    return state


def _route_after_validate(state: RubricBuilderState) -> str:
    """Điều hướng sau validate: nếu vẫn lỗi và còn retry thì quay lại generate, nếu không thì kết thúc."""
    has_criteria = bool(state.get("criteria"))
    has_error = bool(state.get("error"))
    retry_count = state.get("retry_count", 0)

    if has_criteria:
        return "end"
    # Nếu không có criteria và còn lượt retry → quay lại generate
    if retry_count < MAX_RETRIES:
        return "regenerate"
    return "end"


def build_rubric_graph():
    workflow = StateGraph(RubricBuilderState)

    workflow.add_node("generate", node_generate_rubric)
    workflow.add_node("validate_and_fix", node_validate_and_fix)

    workflow.set_entry_point("generate")
    workflow.add_edge("generate", "validate_and_fix")

    # Sau validate: end hoặc regenerate (quay về generate)
    workflow.add_conditional_edges(
        "validate_and_fix",
        _route_after_validate,
        {
            "end": END,
            "regenerate": "generate",
        }
    )

    return workflow.compile()
