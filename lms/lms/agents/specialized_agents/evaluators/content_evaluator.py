"""
Content accuracy & faithfulness evaluator (LLM-as-a-Judge Layer 2).

Evaluates AI-generated content for factual correctness, source alignment,
and logical coherence before delivery to students/teachers.

Based on:
- JudgeBench (ICLR 2025): Factual/Logical Correctness layer
- Darwish et al. (2025): Consultant-Evaluator loop reduces hallucination 85.5%
- Wang & Katsaggelos (2025): 4-dimensional scoring → 90%+ hallucination reduction

Usage:
    from lms.lms.agents.specialized_agents.evaluators import content_evaluator_node

    result = content_evaluator_node(state, {"content_field": "lesson_content", "source_field": "retrieved_curriculum"})
"""

import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class ContentEvalConfig:
    """Configuration for the content evaluator."""
    content_field: str = "response"
    source_field: Optional[str] = "retrieved_curriculum"
    agent_name: str = "content_evaluator"
    temperature: float = 0.0
    max_tokens: int = 1024


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
- "fail": overall_score < 3.0 hoặc hallucination nghiêm trọng
"""


def content_evaluator_node(state: dict, config: Optional[ContentEvalConfig] = None) -> dict:
    """
    Evaluate AI-generated content for accuracy and faithfulness.

    Args:
        state: Agent state dict
        config: ContentEvalConfig

    Returns:
        Dict with evaluation fields for the content_validator pipeline
    """
    config = config or ContentEvalConfig()

    content = state.get(config.content_field, "")
    if not content:
        return {
            "content_evaluation": {
                "overall_score": 1.0,
                "verdict": "fail",
                "issues": ["No content to evaluate"],
            }
        }

    from lms.lms.agents.core.provider import get_llm
    from lms.lms.agents.shared_nodes.json_extractor import extract_json

    # Build prompt with source context
    prompt = CONTENT_EVAL_PROMPT

    if config.source_field:
        source = state.get(config.source_field, "")
        if source:
            prompt += f"\n\nTÀI LIỆU NGUỒN:\n{source[:3000]}"

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
                return {"content_evaluation": result}

        except Exception as e:
            logger.error(f"[content_evaluator] Attempt {attempt + 1} failed: {e}")

    return {
        "content_evaluation": {
            "overall_score": 2.0,
            "verdict": "warn",
            "issues": ["Evaluation failed — content not verified"],
        }
    }
