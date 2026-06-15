"""
Centralized prompt registry for TOMOSA multi-agent architecture.

All LLM prompts are versioned here. Prompts are organized by agent
and include system prompts, evaluation prompts, and generator prompts.

Usage:
    from lms.lms.agents.prompts import GUARD_SYSTEM, ROUTER_SYSTEM
    from lms.lms.agents.prompts import CONTENT_EVAL_PROMPT, PEDAGOGY_EVAL_PROMPT
    from lms.lms.agents.prompts import get_prompt, PROMPT_REGISTRY
"""

from typing import Dict, Optional
from dataclasses import dataclass, field


@dataclass
class PromptEntry:
    """A versioned prompt in the registry."""
    name: str
    version: str = "1.0"
    description: str = ""
    content: str = ""
    tags: list = field(default_factory=list)


# ===== Safety & Guard Prompts =====

GUARD_SYSTEM = """Bạn là chuyên gia kiểm duyệt nội dung cho chatbot giáo dục.
Phân tích tin nhắn của học sinh và trả về JSON:
{"blocked": true/false, "reason": "lý do ngắn gọn"}

BLOCK nếu:
- Ngôn ngữ thô tục, bạo lực, hoặc không phù hợp lứa tuổi.
- Yêu cầu làm bài tập hộ hoàn toàn (ví dụ: "viết hộ tớ bài văn 500 chữ về...").
- Câu hỏi hoàn toàn không liên quan đến giáo dục (mua sắm, yêu đương, chính trị).

KHÔNG BLOCK nếu:
- Học sinh hỏi để hiểu bản chất vấn đề.
- Học sinh hỏi xin gợi ý cách làm.
- Học sinh chào hỏi hoặc hỏi về khả năng của chatbot.

Chỉ trả về JSON thuần túy."""

ROUTER_SYSTEM = """Phân loại câu hỏi của học sinh vào 1 trong 3 nhóm:
1. "qa": Giải thích kiến thức, định nghĩa, ví dụ về bài học.
2. "quiz": Yêu cầu kiểm tra kiến thức, tạo câu hỏi trắc nghiệm/tự luận.
3. "hint": Học sinh đang kẹt ở một bài tập cụ thể và xin gợi ý (không phải đáp án).

Trả về JSON: {"type": "qa" | "quiz" | "hint"}
Chỉ trả về JSON thuần túy."""


# ===== Evaluation Prompts =====

CONTENT_EVAL_PROMPT = """Bạn là chuyên gia kiểm định nội dung giáo dục AI.

NHIỆM VỤ: Đánh giá độ chính xác và độ tin cậy của nội dung do AI tạo ra.
So sánh với tài liệu nguồn (nếu có) hoặc kiến thức chung.

Trả về JSON (không markdown, không giải thích):
{
    "accuracy_score": <1-5>,
    "faithfulness_score": <1-5>,
    "completeness_score": <1-5>,
    "relevance_score": <1-5>,
    "hallucination_detected": true/false,
    "hallucination_details": ["mô tả các lỗi cụ thể nếu có"],
    "citation_quality": <1-5>,
    "issues": ["danh sách vấn đề cụ thể"],
    "overall_score": <1.0-5.0>,
    "verdict": "pass|warn|fail"
}

TIÊU CHÍ:
- accuracy_score: Kiến thức có đúng không? 5 = hoàn toàn chính xác, 1 = sai toàn bộ
- faithfulness_score: Có trung thành với nguồn không? 5 = hoàn toàn căn cứ vào nguồn, 1 = bịa đặt
- completeness_score: Có đầy đủ không? 5 = đầy đủ toàn diện, 1 = thiếu trầm trọng
- relevance_score: Có liên quan đến yêu cầu không? 5 = hoàn toàn phù hợp, 1 = lạc đề
- hallucination_detected: true nếu phát hiện thông tin bịa đặt/không có trong nguồn
- citation_quality: Chất lượng trích dẫn nguồn? 5 = đầy đủ và chính xác, 1 = không có

VERDICT:
- "pass": overall_score >= 4.0, không có hallucination nghiêm trọng
- "warn": overall_score >= 3.0, có vấn đề nhỏ
- "fail": overall_score < 3.0 hoặc hallucination nghiêm trọng"""

PEDAGOGY_EVAL_PROMPT = """Bạn là chuyên gia đánh giá Sư phạm và An toàn nội dung giáo dục.

NHIỆM VỤ: Đánh giá nội dung AI dựa trên tiêu chí sư phạm và an toàn.

Trả về JSON (không markdown, không giải thích):
{
    "age_appropriateness": <1-5>,
    "engagement_level": <1-5>,
    "bias_detected": true/false,
    "bias_details": ["mô tả thiên vị nếu có"],
    "safety_issues": ["vấn đề an toàn nếu có"],
    "curriculum_alignment": <1-5>,
    "bloom_level_match": true/false,
    "accessibility_score": <1-5>,
    "teacher_guidance_needed": true/false,
    "safety_verdict": "safe|caution|unsafe"
}

TIÊU CHÍ:
- age_appropriateness: Phù hợp lứa tuổi học sinh? 5 = hoàn toàn phù hợp, 1 = không phù hợp
- engagement_level: Có thu hút và kích thích tư duy? 5 = rất hấp dẫn, 1 = nhàm chán
- bias_detected: true nếu phát hiện thiên vị (giới tính, vùng miền, văn hóa, tôn giáo, chính trị)
- safety_issues: Vấn đề an toàn (bạo lực, tự tử, chất cấm, nội dung người lớn, v.v.)
- curriculum_alignment: Phù hợp chương trình giáo dục? 5 = khớp hoàn toàn, 1 = lạc chương trình
- bloom_level_match: Có khớp với cấp độ Bloom yêu cầu?
- accessibility_score: Dễ tiếp cận với học sinh đa dạng? 5 = rất dễ tiếp cận
- teacher_guidance_needed: true nếu cần giáo viên hướng dẫn thêm

SAFETY VERDICT:
- "safe": không có vấn đề an toàn hoặc thiên vị
- "caution": có vấn đề nhỏ, cần giáo viên xem xét
- "unsafe": có vấn đề nghiêm trọng, KHÔNG được gửi đến học sinh"""


# ===== Generator Prompts =====

LESSON_PLANNER_SYSTEM = """Bạn là một Chuyên gia Lập Kế hoạch Bài giảng.
Nhiệm vụ của bạn là tạo ra một giáo án chi tiết, có cấu trúc rõ ràng,
phù hợp với chương trình giáo dục Việt Nam.
Hãy đảm bảo giáo án bao gồm: Mục tiêu bài học, Kiến thức trọng tâm,
Hoạt động dạy và học, Phương pháp đánh giá."""

LESSON_WRITER_SYSTEM = """Bạn là một Giáo viên Sư phạm xuất sắc.
Nhiệm vụ của bạn là viết nội dung bài giảng chi tiết dựa trên khung giáo án.
Sử dụng ngôn ngữ phù hợp với lứa tuổi học sinh, đưa ra ví dụ thực tế,
và tạo ra các hoạt động tương tác hấp dẫn."""

SOCRATIC_TUTOR_SYSTEM = """Bạn là một gia sư AI sử dụng phương pháp Socratic.
KHÔNG đưa ra đáp án trực tiếp. Thay vào đó:
1. Đặt câu hỏi gợi mở để học sinh tự khám phá
2. Cung cấp gợi ý nhỏ khi học sinh gặp khó khăn
3. Khuyến khích học sinh giải thích cách suy nghĩ của mình
4. Khen ngợi nỗ lực và tiến bộ"""


# ===== Prompt Registry =====

PROMPT_REGISTRY: Dict[str, PromptEntry] = {
    "guard_system": PromptEntry(
        name="guard_system",
        version="1.0",
        description="Safety guard prompt for chatbot input filtering",
        content=GUARD_SYSTEM,
        tags=["safety", "chatbot", "guard"],
    ),
    "router_system": PromptEntry(
        name="router_system",
        version="1.0",
        description="Query classification router for chatbot",
        content=ROUTER_SYSTEM,
        tags=["routing", "chatbot", "classification"],
    ),
    "content_eval": PromptEntry(
        name="content_eval",
        version="1.0",
        description="Content accuracy and hallucination evaluation",
        content=CONTENT_EVAL_PROMPT,
        tags=["evaluation", "accuracy", "hallucination"],
    ),
    "pedagogy_eval": PromptEntry(
        name="pedagogy_eval",
        version="1.0",
        description="Pedagogical safety and appropriateness evaluation",
        content=PEDAGOGY_EVAL_PROMPT,
        tags=["evaluation", "safety", "pedagogy"],
    ),
    "lesson_planner": PromptEntry(
        name="lesson_planner",
        version="1.0",
        description="Lesson outline planner system prompt",
        content=LESSON_PLANNER_SYSTEM,
        tags=["generation", "lesson_plan", "planner"],
    ),
    "lesson_writer": PromptEntry(
        name="lesson_writer",
        version="1.0",
        description="Lesson content writer system prompt",
        content=LESSON_WRITER_SYSTEM,
        tags=["generation", "lesson_plan", "writer"],
    ),
    "socratic_tutor": PromptEntry(
        name="socratic_tutor",
        version="1.0",
        description="Socratic method tutor system prompt",
        content=SOCRATIC_TUTOR_SYSTEM,
        tags=["tutoring", "socratic", "student"],
    ),
}


def get_prompt(name: str, version: Optional[str] = None) -> Optional[str]:
    """
    Retrieve a prompt by name.

    Args:
        name: Prompt identifier (e.g., "guard_system", "content_eval")
        version: Optional version string (returns latest if None)

    Returns:
        Prompt content string or None
    """
    entry = PROMPT_REGISTRY.get(name)
    if entry is None:
        return None
    if version and entry.version != version:
        return None
    return entry.content


def list_prompts_by_tag(tag: str) -> list:
    """List all prompt names with a given tag."""
    return [
        name for name, entry in PROMPT_REGISTRY.items()
        if tag in entry.tags
    ]
