"""
Vector RAG retriever for TOMOSA knowledge grounding.

Connects the existing services/rag/ infrastructure to the agent graph.
Provides single-hop retrieval suitable for detail-oriented queries,
curriculum standards lookup, and document search.

Based on:
- CMU (2025): Vanilla RAG achieves 99.4% retrieval accuracy for page-level detail
- MDPI KA-RAG (2025): Basic RAG baseline at 87% accuracy

Usage:
    from lms.lms.agents.specialized_agents.retrievers import vector_retriever_node

    result = vector_retriever_node(state, {"query_field": "topic", "top_k": 5})
"""

import logging
from typing import Optional, List
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class VectorRetrieverConfig:
    """Configuration for the vector RAG retriever."""
    # State fields
    query_field: str = "topic"               # Field containing the search query
    subject_field: str = "subject"           # For filtering by subject
    grade_field: str = "grade_level"         # For filtering by grade

    # Retrieval params
    top_k: int = 5                           # Number of chunks to retrieve
    similarity_threshold: float = 0.7        # Minimum similarity score

    # Source fields
    reference_content_field: str = "reference_content"  # Teacher-uploaded content
    output_field: str = "retrieved_curriculum"          # Where to store results
    standards_field: str = "curriculum_standards"       # Where to store standards

    # Whether to fall back to database keyword search if vector store unavailable
    fallback_to_db: bool = True

    # Prepend teacher content
    prepend_teacher_content: bool = True


def vector_retriever_node(state: dict, config: Optional[VectorRetrieverConfig] = None) -> dict:
    """
    Vector RAG retrieval node for LangGraph agents.

    Retrieves relevant curriculum chunks, lesson content, and documents
    from the vector store. Falls back to database keyword search if
    the vector store is unavailable.

    Args:
        state: Agent state dict
        config: VectorRetrieverConfig

    Returns:
        Dict with retrieved_curriculum, curriculum_standards
    """
    config = config or VectorRetrieverConfig()

    query = state.get(config.query_field, "")
    subject = state.get(config.subject_field, "")
    grade = state.get(config.grade_field, "")
    reference_content = state.get(config.reference_content_field, "")

    retrieved_chunks: List[str] = []
    standards: List[str] = []

    # 1. Teacher-uploaded reference content (highest priority)
    if config.prepend_teacher_content and reference_content.strip():
        retrieved_chunks.append(
            f"TÀI LIỆU KHẢO SÁT DO GIÁO VIÊN CUNG CẤP:\n{reference_content.strip()}"
        )
        standards.append("REF_DOC_STANDARD")

    # 2. Try vector RAG via services/rag/
    vector_results = _try_vector_rag(query, subject, grade, config.top_k)
    if vector_results:
        for i, chunk in enumerate(vector_results, 1):
            source = chunk.get("source", chunk.get("document_title", "Unknown"))
            text = chunk.get("text", chunk.get("content", ""))
            if text:
                retrieved_chunks.append(f"[{i}] Nguồn: {source}\n{text}")

        # Extract curriculum standards from results
        for chunk in vector_results:
            std = chunk.get("standard_code") or chunk.get("curriculum_standard")
            if std and std not in standards:
                standards.append(str(std))

    # 3. Fallback: database keyword search
    if not vector_results and config.fallback_to_db:
        db_chunks = _try_db_fallback(subject, query)
        retrieved_chunks.extend(db_chunks)

    # 4. Curriculum standards fallback
    if not standards:
        standards = _get_subject_standards(subject)

    return {
        config.output_field: "\n\n".join(retrieved_chunks),
        config.standards_field: standards,
    }


def _try_vector_rag(query: str, subject: str, grade: str, top_k: int) -> List[dict]:
    """Try retrieving from the vector store via services/rag/."""
    try:
        import frappe
        from lms.lms.services.rag.retriever import RAGRetriever

        retriever = RAGRetriever()
        results = retriever.retrieve(
            query,
            course_id=subject,
            top_k=top_k,
        )
        if results:
            logger.info(f"[vector_retriever] Retrieved {len(results)} chunks from vector store")
            return results
    except ImportError as e:
        logger.info(f"[vector_retriever] RAGRetriever not available: {e}")
    except Exception as e:
        logger.warning(f"[vector_retriever] Vector retrieval error: {e}")

    return []


def _try_db_fallback(subject: str, topic: str) -> List[str]:
    """Fallback to database keyword search for curriculum content."""
    try:
        import frappe
        chunks = []

        # Search Course Lesson
        matched = frappe.get_all(
            "Course Lesson",
            filters={
                "course": ["like", f"%{subject}%"],
                "title": ["like", f"%{topic}%"],
            },
            fields=["title", "body"],
            limit=3,
        )
        if matched:
            lesson_context = "\n".join(
                f"- Bài học liên quan: {l.title}\n  Nội dung: {l.body[:500]}..."
                for l in matched
                if l.body
            )
            chunks.append(f"CÁC BÀI HỌC CÓ SẴN TRONG HỆ THỐNG:\n{lesson_context}")

        return chunks
    except Exception:
        return []


def _get_subject_standards(subject: str) -> List[str]:
    """Return standard curriculum codes for known subjects."""
    subject_lower = (subject or "").lower()
    mapping = {
        "toán": ("GD.TOAN.MA-01", "CHUẨN BỘ GIÁO DỤC - MÔN TOÁN: Tư duy toán học, giải quyết vấn đề, tính toán chính xác, ứng dụng thực tiễn."),
        "math": ("GD.TOAN.MA-01", "CHUẨN BỘ GIÁO DỤC - MÔN TOÁN: Tư duy toán học, giải quyết vấn đề, tính toán chính xác, ứng dụng thực tiễn."),
        "vật lý": ("GD.LY.MA-02", "CHUẨN BỘ GIÁO DỤC - MÔN VẬT LÝ: Giải thích hiện tượng tự nhiên qua thực nghiệm, kỹ năng quan sát, đo lường."),
        "physics": ("GD.LY.MA-02", "CHUẨN BỘ GIÁO DỤC - MÔN VẬT LÝ: Giải thích hiện tượng tự nhiên qua thực nghiệm, kỹ năng quan sát, đo lường."),
        "hóa": ("GD.HOA.MA-03", "CHUẨN BỘ GIÁO DỤC - MÔN HÓA HỌC: Cấu trúc chất, biến đổi hóa học, kỹ năng thí nghiệm an toàn."),
        "chem": ("GD.HOA.MA-03", "CHUẨN BỘ GIÁO DỤC - MÔN HÓA HỌC: Cấu trúc chất, biến đổi hóa học, kỹ năng thí nghiệm an toàn."),
        "sinh": ("GD.SINH.MA-04", "CHUẨN BỘ GIÁO DỤC - MÔN SINH HỌC: Hiểu về sự sống, hệ sinh thái, di truyền, kỹ năng thực hành sinh học."),
        "biology": ("GD.SINH.MA-04", "CHUẨN BỘ GIÁO DỤC - MÔN SINH HỌC: Hiểu về sự sống, hệ sinh thái, di truyền, kỹ năng thực hành sinh học."),
        "tin": ("GD.TIN.MA-05", "CHUẨN BỘ GIÁO DỤC - MÔN TIN HỌC: Tư duy thuật toán, kỹ năng lập trình, ứng dụng CNTT."),
        "computer": ("GD.TIN.MA-05", "CHUẨN BỘ GIÁO DỤC - MÔN TIN HỌC: Tư duy thuật toán, kỹ năng lập trình, ứng dụng CNTT."),
    }

    for key, (code, desc) in mapping.items():
        if key in subject_lower:
            return [code]

    return ["GD.GEN.MA-00"]
