"""
RAG & GraphRAG retrieval agents for TOMOSA knowledge grounding.

Implements hybrid retrieval:
- Vector RAG: primary single-hop retrieval (fast, detail-oriented)
- GraphRAG: multi-hop enrichment (concept relationship, hierarchical)
- Hybrid: RRF fusion of both for best-of-both results

Based on:
- SAP (2025): Hybrid RAG + dependency KG = +15% over dense retrieval
- KA-RAG (MDPI 2025): KG + Agentic RAG = +4.4pp accuracy
- MSU/Meta (2025): Integration RAG+GraphRAG = +6.4pp on MultiHop-RAG

Usage:
    from lms.lms.agents.specialized_agents.retrievers import (
        vector_retriever_node, graphrag_retriever_node,
        hybrid_retriever_node, extract_entities_spacy,
    )
"""

from .vector_retriever import vector_retriever_node, VectorRetrieverConfig
from .graphrag_retriever import graphrag_retriever_node, GraphRAGConfig
from .hybrid_retriever import hybrid_retriever_node, HybridRetrieverConfig
from .entity_extractor import extract_entities_spacy, build_knowledge_triples

__all__ = [
    "vector_retriever_node",
    "VectorRetrieverConfig",
    "graphrag_retriever_node",
    "GraphRAGConfig",
    "hybrid_retriever_node",
    "HybridRetrieverConfig",
    "extract_entities_spacy",
    "build_knowledge_triples",
]
