"""
Pedagogical safety & appropriateness evaluator (LLM-as-a-Judge Layer 3).

Checks AI-generated content for age-appropriateness, bias, engagement,
curriculum alignment, and learning effectiveness before delivery.

Based on:
- TEACH-AI (Georgia Tech 2025): Pedagogical alignment component
- G-AIETM (Frontiers 2025): Ethical compliance + pedagogical effectiveness
- EduGuardBench (AAAI 2026): Role-playing Fidelity Score + Attack Success Rate

Usage:
    from lms.lms.agents.specialized_agents.evaluators import pedagogical_evaluator_node

    result = pedagogical_evaluator_node(state, {"grade_level": "10", "subject": "Math"})
"""

import logging
from typing import Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class PedagogyEvalConfig:
    """Configuration for the pedagogical evaluator."""
    agent_name: str = "pedagogical_evaluator"
    temperature: float = 0.0
    max_tokens: int = 1024

    # Context fields
    content_field: str = "response"
    grade_level_field: str = "grade_level"
    subject_field: str = "subject"
    topic_field: str = "topic"


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
- "unsafe": có vấn đề nghiêm trọng, KHÔNG được gửi đến học sinh
"""


def pedagogical_evaluator_node(state: dict, config: Optional[PedagogyEvalConfig] = None) -> dict:
    """
    Evaluate content for pedagogical safety and appropriateness.

    Checks age-appropriateness, bias, engagement, curriculum alignment,
    and flags content that should not reach students directly.

    Args:
        state: Agent state dict
        config: PedagogyEvalConfig

    Returns:
        Dict with pedagogy_evaluation fields
    """
    config = config or PedagogyEvalConfig()

    content = state.get(config.content_field, "")
    if not content:
        return {
            "pedagogy_evaluation": {
                "safety_verdict": "unsafe",
                "safety_issues": ["No content to evaluate"],
            }
        }

    from lms.lms.agents.core.provider import get_llm
    from lms.lms.agents.shared_nodes.json_extractor import extract_json

    prompt = PEDAGOGY_EVAL_PROMPT

    # Add context
    grade = state.get(config.grade_level_field, "")
    subject = state.get(config.subject_field, "")
    topic = state.get(config.topic_field, "")

    prompt += f"\n\nNGỮ CẢNH:\n- Lớp: {grade or 'Không xác định'}\n- Môn: {subject or 'Không xác định'}\n- Chủ đề: {topic or 'Không xác định'}"

    prompt += f"\n\nNỘI DUNG CẦN ĐÁNH GIÁ:\n{content[:5000]}"

    for attempt in range(2):
        try:
            llm, _, _ = get_llm(
                config.agent_name,
                temperature=config.temperature,
                max_tokens=config.max_tokens,
            )
            response = llm.invoke(prompt)
            raw = response.content or ""

            result = extract_json(raw, expected_type="object")
            if result:
                return {"pedagogy_evaluation": result}

        except Exception as e:
            logger.error(f"[pedagogical_evaluator] Attempt {attempt + 1} failed: {e}")

    return {
        "pedagogy_evaluation": {
            "safety_verdict": "caution",
            "safety_issues": ["Evaluation unavailable — manual review recommended"],
        }
    }
