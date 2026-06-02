import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from lms.lms.agents.provider import get_llm
from lms.lms.agents.utils.json_utils import extract_json

class RubricBuilderState(TypedDict):
    input_text: str
    grading_scale: str
    max_score: float
    subject: str
    level: str
    knowledge_map: str
    analysis_topics: List[str]
    criteria: List[Dict[str, Any]]
    tokens_used: int
    input_tokens: int
    output_tokens: int
    total_cost_usd: float
    error: str

RUBRIC_GEN_PROMPT = """
BẠN LÀ CHUYÊN GIA THIẾT KẾ RUBRIC CHẤM ĐIỂM VÀ ĐỀ THI CAO CẤP.
Dựa vào mô tả bài kiểm tra dưới đây, hãy tạo ra một Rubric chấm điểm chi tiết.

THÔNG TIN BÀI KIỂM TRA:
- Môn học: {subject}
- Cấp độ: {level}
- Thang điểm: {grading_scale}
- Điểm tối đa: {max_score}
- Nội dung/Mô tả: {input_text}

QUY TẮC QUAN TRỌNG (ÁP DỤNG CHUẨN MỚI):
1. Phân bổ điểm cho từng câu hỏi/phần thi sao cho tổng điểm đúng bằng {max_score}.
2. Nếu là đề thi Toán hoặc các môn Khoa học tự nhiên, hãy chi tiết hóa điểm số theo từng bước giải (VD: 0.25đ cho mỗi bước).
3. Nếu là trắc nghiệm Đúng/Sai (Chuẩn MOET 2025): Phân bổ điểm lũy tiến (Đúng 1 ý: 0.1đ, Đúng 2 ý: 0.25đ, Đúng 3 ý: 0.5đ, Đúng 4 ý: 1.0đ).
4. Mỗi tiêu chí (criterion) tương ứng với 1 câu hỏi hoặc 1 kỹ năng cụ thể.

ĐỊNH DẠNG JSON TRẢ VỀ (Chỉ trả về Array JSON, không giải thích gì thêm):
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
]
"""

def node_generate_rubric(state: RubricBuilderState) -> RubricBuilderState:
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
        parsed = extract_json(response.content, expected_type="array")
        if parsed:
            state["criteria"] = parsed
        else:
            state["error"] = "AI did not return a valid JSON array for criteria."
    except Exception as e:
        state["error"] = str(e)
        
    return state

def build_rubric_graph():
    workflow = StateGraph(RubricBuilderState)
    workflow.add_node("generate", node_generate_rubric)
    workflow.set_entry_point("generate")
    workflow.add_edge("generate", END)
    return workflow.compile()
