"""
LLM-as-a-Judge evaluation agents for TOMOSA content quality pipeline.

Implements multi-layer evaluation based on:
- JudgeBench (ICLR 2025): 3-layer hierarchy
- TEACH-AI: 7-dimension framework
- Darwish et al. (2025): 85.5% hallucination reduction via validation gates

Usage:
    from lms.lms.agents.specialized_agents.evaluators import (
        content_evaluator_node, pedagogical_evaluator_node, exam_evaluator_node,
    )
"""

from .content_evaluator import content_evaluator_node
from .pedagogical_evaluator import pedagogical_evaluator_node

__all__ = [
    "content_evaluator_node",
    "pedagogical_evaluator_node",
]
