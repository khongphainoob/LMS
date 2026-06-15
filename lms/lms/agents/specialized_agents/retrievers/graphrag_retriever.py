"""
GraphRAG retriever for TOMOSA knowledge grounding.

Provides multi-hop knowledge graph retrieval for complex educational queries.
Combines entity extraction with relationship mapping to enrich context with
concept hierarchies, prerequisite chains, and cross-topic connections.

Based on:
- KA-RAG (MDPI 2025): KG + Agentic RAG = +4.4pp accuracy (87%→91.4%)
- MSU/Meta (2025): Integration RAG+GraphRAG = +6.4pp on MultiHop-RAG
- CMU (2025): GraphRAG best for multi-hop reasoning; RAG best for single-hop

Architecture:
    Query → Entity Extraction → Graph Traversal → Context Enrichment
    → Merged with Vector RAG results for hybrid retrieval

Usage:
    from lms.lms.agents.specialized_agents.retrievers import graphrag_retriever_node

    result = graphrag_retriever_node(state, {"query": "...", "rag_context": "..."})
"""

import logging
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class GraphRAGConfig:
    """Configuration for the GraphRAG retriever."""

    # Query
    query_field: str = "topic"
    subject_field: str = "subject"
    grade_field: str = "grade_level"

    # Input from vector RAG (to enrich)
    rag_context_field: str = "retrieved_curriculum"

    # Output
    output_field: str = "graphrag_context"
    entity_output_field: str = "extracted_entities"

    # Graph traversal
    max_hops: int = 2                       # Max relation hops from starting concept
    max_entities: int = 10                  # Max entities to extract
    enrichment_prompt: bool = True          # Use LLM to synthesize graph context


GRAPH_ENRICHMENT_PROMPT = """Bạn là chuyên gia phân tích mối liên hệ kiến thức giáo dục.

NHIỆM VỤ: Dựa vào danh sách entity và mối quan hệ, tạo một bản tóm tắt mối liên hệ kiến thức
hữu ích cho việc soạn bài giảng. Tập trung vào:
1. Kiến thức tiên quyết (prerequisites) học sinh cần biết
2. Mối liên hệ với các chủ đề khác trong chương trình
3. Ứng dụng thực tế của kiến thức

Trả về văn bản thuần (không markdown headings, ngắn gọn, súc tích).
"""


def graphrag_retriever_node(state: dict, config: Optional[GraphRAGConfig] = None) -> dict:
    """
    GraphRAG retrieval node — enriches context with multi-hop knowledge graph.

    Works as a post-processor on vector RAG results:
    1. Extract entities from vector RAG context
    2. Find related concepts via entity/relationship graph
    3. (Optional) Synthesize enriched context with LLM
    4. Return graph-enriched context to augment the generator

    Args:
        state: Agent state dict (should contain retrieved_curriculum)
        config: GraphRAGConfig

    Returns:
        Dict with graphrag_context (str) and extracted_entities (list)
    """
    config = config or GraphRAGConfig()

    query = state.get(config.query_field, "")
    subject = state.get(config.subject_field, "")
    grade = state.get(config.grade_field, "")
    rag_context = state.get(config.rag_context_field, "")

    if not rag_context:
        return {
            config.output_field: "",
            config.entity_output_field: [],
        }

    # Stage 1: Extract entities from RAG context
    entities = _extract_entities(rag_context, subject, grade)

    # Stage 2: Find related concepts via graph
    related = _find_related_concepts(entities, config.max_hops)

    # Stage 3: Build enriched context
    graph_context = _build_graph_context(entities, related, query)

    # Stage 4: (Optional) LLM synthesis
    if config.enrichment_prompt and graph_context:
        graph_context = _synthesize_context(graph_context, query)

    return {
        config.output_field: graph_context,
        config.entity_output_field: list(set(entities)),
    }


def _extract_entities(context: str, subject: str, grade: str) -> List[str]:
    """
    Extract educational entities from RAG context.

    Uses services/rag/entity_extractor if available,
    falls back to keyword extraction.
    """
    entities = []

    # Try entity_extractor service
    try:
        from lms.lms.services.rag.entity_extractor import extract_entities as svc_extract
        result = svc_extract(context)
        if result:
            entities = [e.get("entity", e) if isinstance(e, dict) else str(e) for e in result]
            logger.info(f"[graphrag] Extracted {len(entities)} entities via service")
            return entities[:10]
    except ImportError:
        pass
    except Exception as e:
        logger.warning(f"[graphrag] Entity extraction error: {e}")

    # Fallback: simple keyword extraction
    import re
    # Extract capitalized phrases and terms in quotes
    quoted = re.findall(r'"([^"]+)"', context)
    capitalized = re.findall(r'\b[A-ZĐ][a-zđàáảãạâầấẩẫậăằắẳẵặêềếểễệôồốổỗộơờớởỡợưừứửữự]+\b', context)
    entities = list(set(quoted + capitalized))[:10]

    return entities


def _find_related_concepts(entities: List[str], max_hops: int) -> List[Dict[str, Any]]:
    """
    Find concepts related to extracted entities via knowledge graph traversal.

    Currently uses database lookup for course content relationships.
    Future: replace with actual graph traversal when graph DB is added.
    """
    related = []
    try:
        import frappe

        for entity in entities[:5]:  # Limit to 5 source entities
            # Search for lessons containing this concept
            matches = frappe.get_all(
                "Course Lesson",
                filters={"title": ["like", f"%{entity}%"]},
                fields=["title", "course"],
                limit=3,
            )
            for m in matches:
                related.append({
                    "source_entity": entity,
                    "related_concept": m.title,
                    "relationship": "curriculum_cotopic",
                    "course": m.course,
                })
    except Exception:
        pass

    return related[:20]


def _build_graph_context(
    entities: List[str],
    related: List[Dict[str, Any]],
    query: str,
) -> str:
    """Build a graph-enriched context string for the generator."""
    parts = []

    if entities:
        parts.append(
            "CÁC KHÁI NIỆM LIÊN QUAN ĐẾN CHỦ ĐỀ:\n" +
            "\n".join(f"- {e}" for e in entities)
        )

    if related:
        parts.append("\n\nMỐI LIÊN HỆ KIẾN THỨC:")
        for r in related:
            parts.append(
                f"- {r['source_entity']} → {r['related_concept']} "
                f"({r.get('relationship', 'related')})"
            )

    return "\n".join(parts)


def _synthesize_context(graph_context: str, query: str) -> str:
    """Use LLM to synthesize enriched context from graph data."""
    try:
        from lms.lms.agents.core.provider import get_llm

        llm, _, _ = get_llm("graphrag_retriever", temperature=0.0, max_tokens=512)
        prompt = GRAPH_ENRICHMENT_PROMPT
        prompt += f"\n\nCHỦ ĐỀ: {query}\n\nDỮ LIỆU GRAPH:\n{graph_context}"
        response = llm.invoke(prompt)
        return response.content or graph_context
    except Exception:
        return graph_context
