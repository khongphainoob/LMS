"""
Hybrid RAG Retriever — orchestrates Vector RAG + GraphRAG with RRF fusion.

Implements tiered retrieval:
1. Vector RAG → fast single-hop facts
2. GraphRAG → multi-hop relationship enrichment
3. Reciprocal Rank Fusion (RRF) → merge both result sets
4. Re-rank → best-of-both context for generator

Based on:
- SAP (2025): Hybrid RAG + dependency KG = +15% over dense retrieval alone
- MSU/Meta (2025): Integration RAG+GraphRAG = +6.4pp on MultiHop-RAG
- CMU (2025): Vector RAG best for detail, GraphRAG best for multi-hop

Usage:
    from lms.lms.agents.specialized_agents.retrievers.hybrid_retriever import hybrid_retriever_node

    result = hybrid_retriever_node(state, HybridRetrieverConfig())
"""

import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class HybridRetrieverConfig:
    """Configuration for the hybrid retriever."""

    # State fields
    query_field: str = "topic"
    subject_field: str = "subject"
    grade_field: str = "grade_level"

    # Vector RAG
    vector_top_k: int = 5
    vector_threshold: float = 0.7

    # GraphRAG
    enable_graphrag: bool = True
    graph_max_hops: int = 2
    graph_max_entities: int = 10

    # Entity extraction
    use_spacy_extraction: bool = True      # Zero-cost SpaCy extraction
    use_llm_extraction: bool = False        # LLM fallback (expensive)

    # RRF fusion
    rrf_k: int = 60                         # RRF constant
    final_top_k: int = 8                    # After fusion

    # Output
    output_field: str = "retrieved_curriculum"
    graph_context_field: str = "graphrag_context"
    entities_field: str = "extracted_entities"
    source_field: str = "reference_content"

    # Cost
    budget_usd: float = 0.01                # Max budget per query
    track_costs: bool = True


def hybrid_retriever_node(state: dict, config: Optional[HybridRetrieverConfig] = None) -> dict:
    """
    Hybrid retrieval node — Vector RAG + GraphRAG with RRF fusion.

    Args:
        state: Agent state dict
        config: HybridRetrieverConfig

    Returns:
        Dict with retrieved_curriculum, graphrag_context, extracted_entities
    """
    config = config or HybridRetrieverConfig()

    query = state.get(config.query_field, "")
    subject = state.get(config.subject_field, "")
    grade = state.get(config.grade_field, "")
    reference = state.get(config.source_field, "")

    # ===== Stage 1: Vector RAG =====
    vector_results = _run_vector_rag(query, subject, grade, config)
    logger.info(f"[hybrid] Vector RAG: {len(vector_results)} results")

    # ===== Stage 2: GraphRAG Enrichment =====
    graph_results = []
    entities: List[str] = []
    if config.enable_graphrag:
        graph_results, entities = _run_graphrag(
            query, subject, grade, vector_results, config,
        )
        logger.info(f"[hybrid] GraphRAG: {len(graph_results)} results, {len(entities)} entities")

    # ===== Stage 3: RRF Fusion =====
    merged = _reciprocal_rank_fusion(
        vector_results, graph_results, config.rrf_k, config.final_top_k,
    )
    logger.info(f"[hybrid] RRF merged: {len(merged)} total results")

    # ===== Stage 4: Build output =====
    curriculum_chunks = _build_curriculum_context(merged, reference)
    graph_context = _build_graph_context(graph_results, entities, query)

    return {
        config.output_field: curriculum_chunks,
        config.graph_context_field: graph_context,
        config.entities_field: entities,
    }


def _run_vector_rag(
    query: str, subject: str, grade: str, config: HybridRetrieverConfig,
) -> List[Dict[str, Any]]:
    """Run vector RAG retrieval via services/rag/."""
    try:
        import frappe
        from lms.lms.services.rag.retriever import RAGRetriever
        retriever = RAGRetriever()
        return retriever.retrieve(query, course_id=subject, top_k=config.vector_top_k)
    except Exception as e:
        logger.warning(f"[hybrid] Vector RAG failed: {e}")
        return []


def _run_graphrag(
    query: str, subject: str, grade: str,
    vector_results: List[Dict[str, Any]],
    config: HybridRetrieverConfig,
) -> tuple:
    """
    Run GraphRAG enrichment on top of vector RAG results.

    Returns (graph_results, entities).
    """
    try:
        from lms.lms.agents.specialized_agents.retrievers.graphrag_retriever import (
            graphrag_retriever_node, GraphRAGConfig,
        )

        # Build context from vector results
        rag_context = "\n".join(
            r.get("text", r.get("content", ""))
            for r in vector_results[:config.vector_top_k]
        )

        graphrag_state = {
            "topic": query,
            "subject": subject,
            "grade_level": grade,
            "retrieved_curriculum": rag_context,
        }

        graph_config = GraphRAGConfig(
            max_hops=config.graph_max_hops,
            max_entities=config.graph_max_entities,
            enrichment_prompt=False,  # Skip LLM synthesis to save cost
        )

        result = graphrag_retriever_node(graphrag_state, graph_config)

        return (
            [{"text": result.get("graphrag_context", "")}],
            result.get("extracted_entities", []),
        )
    except Exception as e:
        logger.warning(f"[hybrid] GraphRAG failed: {e}")

        # Fallback: use SpaCy entity extraction directly
        entities = []
        if config.use_spacy_extraction:
            try:
                from lms.lms.agents.specialized_agents.retrievers.entity_extractor import (
                    extract_entities_spacy,
                )
                rag_text = "\n".join(
                    r.get("text", "") for r in vector_results[:3]
                )
                if rag_text:
                    ents = extract_entities_spacy(rag_text)
                    entities = [e["entity"] for e in ents]
            except Exception:
                pass

        return ([], entities)


def _reciprocal_rank_fusion(
    vector_results: List[Dict[str, Any]],
    graph_results: List[Dict[str, Any]],
    k: int = 60,
    top_k: int = 8,
) -> List[Dict[str, Any]]:
    """
    Merge vector and graph results using Reciprocal Rank Fusion.

    RRF formula: score(d) = sum(1 / (k + rank_i(d)))

    Args:
        vector_results: Results from vector RAG
        graph_results: Results from GraphRAG
        k: RRF constant (default 60)
        top_k: Number of results to return after fusion

    Returns:
        Merged and re-ranked results
    """
    scores: Dict[str, float] = {}
    docs: Dict[str, Dict[str, Any]] = {}

    # Score vector results
    for rank, doc in enumerate(vector_results, 1):
        key = doc.get("text", "")[:100]  # Use first 100 chars as key
        if key not in scores:
            scores[key] = 0.0
            docs[key] = doc
        scores[key] += 1.0 / (k + rank)

    # Score graph results
    for rank, doc in enumerate(graph_results, 1):
        key = doc.get("text", "")[:100]
        if key not in scores:
            scores[key] = 0.0
            docs[key] = doc
        scores[key] += 1.0 / (k + rank)

    # Sort and return top_k
    sorted_keys = sorted(scores, key=scores.get, reverse=True)[:top_k]
    return [docs[k] for k in sorted_keys]


def _build_curriculum_context(
    merged: List[Dict[str, Any]],
    reference_content: str = "",
) -> str:
    """Build final curriculum context from merged results."""
    parts = []

    if reference_content:
        parts.append(f"TÀI LIỆU THAM KHẢO:\n{reference_content}")

    for i, doc in enumerate(merged, 1):
        text = doc.get("text", doc.get("content", ""))
        source = doc.get("document_title", doc.get("source", "Unknown"))
        if text:
            parts.append(f"[{i}] Nguồn: {source}\n{text[:1000]}")

    return "\n\n".join(parts)


def _build_graph_context(
    graph_results: List[Dict[str, Any]],
    entities: List[str],
    query: str,
) -> str:
    """Build graph enrichment context."""
    parts = []

    if entities:
        parts.append("KHÁI NIỆM LIÊN QUAN: " + ", ".join(entities[:10]))

    for doc in graph_results:
        text = doc.get("text", "")
        if text and text not in parts:
            parts.append(text)

    return "\n".join(parts)
