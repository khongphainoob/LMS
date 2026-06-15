"""
Pre-delivery content validation node (LLM-as-a-Judge).

Implements 3-layer evaluation based on SOTA research:
1. Format Compliance — JSON/structure validation (rule-based)
2. Accuracy & Faithfulness — LLM judge checks factual correctness
3. Pedagogical Appropriateness — domain evaluator checks age/safety/relevance

Based on:
- JudgeBench (ICLR 2025): 3-layer hierarchy
- Darwish et al. (2025): 85.5% hallucination reduction via validation gate
- TEACH-AI framework: 7-dimension evaluation

Usage:
    from lms.lms.agents.shared_nodes import content_validator_node, ValidatorContext

    ctx = ValidatorContext(agent_name="lesson_planner", content_field="lesson_content")
    result = content_validator_node(state, ctx)
    # Returns {evaluation_result, needs_review, flagged_issues, ...}
"""

import json
import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class ValidatorContext:
    """Configuration for the content validator node."""

    # Which agent is producing this content?
    agent_name: str = "default"

    # State field containing the content to validate
    content_field: str = "response"

    # State field for source/context to verify against
    source_field: Optional[str] = "retrieved_curriculum"

    # Which dimensions to check
    enabled_dimensions: List[str] = field(default_factory=lambda: ["PA", "PS", "CR", "FC"])

    # Thresholds
    auto_deliver_threshold: float = 4.0   # Score >= this → auto-deliver
    warning_threshold: float = 3.0         # Score >= this → deliver with warning
    # Below warning → block/regenerate

    # Model settings
    evaluation_model_temperature: float = 0.0
    max_retries: int = 2

    # Skip validation entirely (for non-content agents like context builders)
    skip_validation: bool = False


EVALUATOR_SYSTEM_PROMPT = """Bạn là chuyên gia đánh giá chất lượng nội dung giáo dục AI.

Nhiệm vụ: Đánh giá nội dung do AI tạo ra trước khi gửi đến học sinh/giáo viên.
Trả về JSON với cấu trúc CHÍNH XÁC sau (không markdown, chỉ JSON thuần):

{
    "overall_score": <1.0-5.0>,
    "dimension_scores": [
        {"dimension": "PA", "score": <1-5>, "reasoning": "...", "issues": [], "suggestions": []},
        {"dimension": "PS", "score": <1-5>, "reasoning": "...", "issues": [], "suggestions": []},
        {"dimension": "CR", "score": <1-5>, "reasoning": "...", "issues": [], "suggestions": []},
        {"dimension": "FC", "score": <1-5>, "reasoning": "...", "issues": [], "suggestions": []}
    ],
    "delivery_decision": "auto_deliver|deliver_with_warning|route_to_hitl|regenerate",
    "needs_human_review": true/false,
    "flagged_content": ["phần bị gắn cờ 1", "phần bị gắn cờ 2"],
    "summary": "Tóm tắt đánh giá"
}

TIÊU CHÍ ĐÁNH GIÁ:
- PA (Pedagogical Accuracy - Độ chính xác sư phạm): Kiến thức đúng, phù hợp chương trình, logic rõ ràng.
  Score 5 = hoàn toàn chính xác. Score 1 = sai kiến thức nghiêm trọng.
- PS (Pedagogical Safety - An toàn sư phạm): Phù hợp lứa tuổi, không nội dung độc hại, không thiên vị.
  Score 5 = an toàn tuyệt đối. Score 1 = có nội dung nguy hiểm.
- CR (Content Reliability - Độ tin cậy): Có trích dẫn nguồn, căn cứ vào tài liệu gốc, nhất quán.
  Score 5 = trích dẫn đầy đủ. Score 1 = bịa đặt hoàn toàn.
- FC (Format Compliance - Đúng định dạng): JSON/Markdown hợp lệ, cấu trúc đúng yêu cầu.
  Score 5 = hoàn hảo. Score 1 = không thể parse.

QUY TẮC:
- Nếu PA < 3 HOẶC PS < 4 → delivery_decision = "route_to_hitl"
- Nếu tất cả ≥ 4 → delivery_decision = "auto_deliver"
- Còn lại → delivery_decision = "deliver_with_warning"
- ĐIỂM QUAN TRỌNG: Nếu không có nguồn để kiểm tra, vẫn đánh giá dựa trên kiến thức chung.
"""


def content_validator_node(state: dict, ctx: ValidatorContext = None) -> dict:
    """
    Pre-delivery content quality gate.

    Evaluates AI-generated content on 4 dimensions before it reaches
    students/teachers. Routes low-quality content to HITL.

    Args:
        state: Agent state dict
        ctx: ValidatorContext configuration

    Returns:
        Dict with evaluation_result, needs_review, flagged_issues, validator_summary
    """
    ctx = ctx or ValidatorContext()

    if ctx.skip_validation:
        return {
            "evaluation_result": {"overall_score": 5.0, "delivery_decision": "auto_deliver"},
            "needs_review": False,
            "flagged_issues": [],
            "validator_summary": "Validation skipped by config",
            "delivery_decision": "auto_deliver",
        }

    content = state.get(ctx.content_field, "")
    if not content:
        return {
            "evaluation_result": {"overall_score": 1.0, "delivery_decision": "regenerate"},
            "needs_review": True,
            "flagged_issues": ["No content to validate"],
            "validator_summary": "Empty content — regeneration required",
            "delivery_decision": "regenerate",
        }

    # Layer 1: Format Compliance (rule-based, no LLM)
    format_score = _check_format(content)

    # Layer 2-3: Accuracy & Pedagogy (LLM-as-a-Judge)
    llm_result = _run_llm_evaluation(content, state, ctx)

    if llm_result is None:
        # LLM failed — conservative: route to HITL
        return {
            "evaluation_result": {
                "overall_score": format_score,
                "delivery_decision": "route_to_hitl",
                "dimension_scores": [],
            },
            "needs_review": True,
            "flagged_issues": ["LLM evaluation failed — routed to HITL for safety"],
            "validator_summary": "Evaluator unavailable — manual review required",
            "delivery_decision": "route_to_hitl",
        }

    # Merge format score into dimension scores
    overall = llm_result.get("overall_score", 3.0)
    needs_review = llm_result.get("needs_human_review", False) or overall < ctx.warning_threshold
    decision = llm_result.get("delivery_decision", "route_to_hitl")

    # Override if format is critically broken
    if format_score <= 2.0:
        decision = "regenerate"
        needs_review = True

    return {
        "evaluation_result": llm_result,
        "needs_review": needs_review,
        "flagged_issues": llm_result.get("flagged_content", []),
        "validator_summary": llm_result.get("summary", "Evaluation complete"),
        "delivery_decision": decision,
    }


def _check_format(content: str) -> int:
    """
    Layer 1: Rule-based format compliance check.

    Checks:
    - Not empty
    - Parseable JSON (if JSON expected)
    - Markdown structure present
    - Minimum length

    Returns score 1-5.
    """
    if not content or len(content.strip()) < 10:
        return 1

    score = 5

    # Check for common format issues
    stripped = content.strip()

    # If content is meant to be JSON
    if stripped.startswith("{") or stripped.startswith("["):
        try:
            json.loads(stripped)
        except json.JSONDecodeError:
            # Try cleaning
            import re
            cleaned = re.sub(r',\s*([\]}])', r'\1', stripped)
            try:
                json.loads(cleaned)
                score = 4  # Fixed trailing commas — minor issue
            except json.JSONDecodeError:
                score = 2  # Not valid JSON

    # Markdown structure check
    if not any(marker in stripped for marker in ("#", "**", "- ", "1. ")):
        score = min(score, 3)  # Missing structure

    # Length check
    if len(stripped) < 100:
        score = min(score, 2)

    return score


def _run_llm_evaluation(content: str, state: dict, ctx: ValidatorContext) -> Optional[dict]:
    """Layer 2-3: LLM-based accuracy and pedagogical evaluation."""
    from lms.lms.agents.core.provider import get_llm
    from lms.lms.agents.shared_nodes.json_extractor import extract_json

    source_text = ""
    if ctx.source_field:
        source_text = state.get(ctx.source_field, "") or ""

    prompt = EVALUATOR_SYSTEM_PROMPT
    if source_text:
        prompt += f"\n\nTÀI LIỆU NGUỒN (để kiểm tra căn cứ):\n{source_text[:3000]}"

    prompt += f"\n\nNỘI DUNG CẦN ĐÁNH GIÁ:\n{content[:5000]}"

    for attempt in range(ctx.max_retries + 1):
        try:
            llm, _, _ = get_llm(
                f"{ctx.agent_name}_validator",
                temperature=ctx.evaluation_model_temperature,
                max_tokens=2048,
            )
            response = llm.invoke(prompt)
            raw = response.content or ""

            result = extract_json(raw, expected_type="object")
            if result and "overall_score" in result:
                return result

            logger.warning(
                f"[content_validator] Attempt {attempt + 1}: "
                f"JSON extraction failed for {ctx.agent_name}"
            )

        except Exception as e:
            logger.error(f"[content_validator] LLM evaluation error: {e}")

    return None
