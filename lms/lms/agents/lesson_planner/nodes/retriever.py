"""
RAG Retriever Node — connected to services/rag/ + hybrid GraphRAG.

Uses the centralized hybrid retriever (Vector RAG + GraphRAG + RRF fusion)
instead of hardcoded curriculum standards. Falls back to DB keyword search
only when vector store is unavailable.

Usage:
    from lms.lms.agents.lesson_planner.nodes.retriever import retriever_node
    result = retriever_node(state)
"""

import frappe
from lms.lms.agents.lesson_planner.state import LessonPlanState


def retriever_node(state: LessonPlanState) -> dict:
    """
    Hybrid RAG Retriever Node.

    Retrieves curriculum chunks via:
    1. Teacher-uploaded reference content (highest priority)
    2. Vector RAG from services/rag/ (Qdrant + Vietnamese_Embedding_v2)
    3. GraphRAG enrichment (entity extraction + relationship mapping)
    4. DB keyword fallback (only if vector store unavailable)
    """
    subject = state.get("subject") or ""
    grade_level = state.get("grade_level") or ""
    topic = state.get("topic") or ""
    reference_content = state.get("reference_content") or ""

    retrieved_chunks = []
    standards = []

    # 1. Teacher-uploaded reference content (highest priority)
    if reference_content.strip():
        retrieved_chunks.append(
            f"TÀI LIỆU KHẢO SÁT DO GIÁO VIÊN CUNG CẤP:\n{reference_content.strip()}"
        )
        standards.append("REF_DOC_STANDARD")

    # 2. Try hybrid RAG (Vector + GraphRAG) via specialized_agents/retrievers/
    try:
        from lms.lms.agents.specialized_agents.retrievers.hybrid_retriever import (
            hybrid_retriever_node, HybridRetrieverConfig,
        )

        config = HybridRetrieverConfig(
            query_field="topic",
            subject_field="subject",
            grade_field="grade_level",
            vector_top_k=5,
            enable_graphrag=True,
            use_spacy_extraction=True,
            final_top_k=8,
        )

        # Build a minimal state for the hybrid retriever
        hybrid_state = {
            "topic": topic,
            "subject": subject,
            "grade_level": grade_level,
            "reference_content": reference_content,
        }

        result = hybrid_retriever_node(hybrid_state, config)

        rag_context = result.get("retrieved_curriculum", "")
        graph_context = result.get("graphrag_context", "")
        entities = result.get("extracted_entities", [])

        if rag_context:
            retrieved_chunks.append(rag_context)
        if graph_context:
            retrieved_chunks.append(f"NGỮ CẢNH MỞ RỘNG (GraphRAG):\n{graph_context}")
        if entities:
            standards.extend(entities[:5])

        frappe.logger("lesson_planner").info(
            f"[retriever] Hybrid RAG: {len(rag_context)} chars vector, "
            f"{len(graph_context)} chars graph, {len(entities)} entities"
        )

    except ImportError as e:
        frappe.logger("lesson_planner").warning(f"[retriever] Hybrid RAG unavailable: {e}")
    except Exception as e:
        frappe.logger("lesson_planner").warning(f"[retriever] Hybrid RAG error: {e}")

    # 3. Fallback: DB keyword search (only if RAG returned nothing)
    if not retrieved_chunks or len(retrieved_chunks) <= 1:
        try:
            matched_lessons = frappe.get_all(
                "Course Lesson",
                filters={
                    "course": ["like", f"%{subject}%"],
                    "title": ["like", f"%{topic}%"],
                },
                fields=["title", "body"],
                limit=3,
            )
            if matched_lessons:
                lesson_context = "\n".join(
                    f"- Bài học liên quan: {l.title}\n  Nội dung: {l.body[:500]}..."
                    for l in matched_lessons
                    if l.body
                )
                retrieved_chunks.append(
                    f"CÁC BÀI HỌC CÓ SẴN TRONG HỆ THỐNG:\n{lesson_context}"
                )
        except Exception as e:
            frappe.log_error(
                title="AI Lesson Planner Retriever Error", message=str(e)
            )

    # 4. Last resort: curriculum standards (only if everything else failed)
    if not standards:
        standards = _get_subject_standards(subject)

    final_retrieved_text = "\n\n".join(retrieved_chunks)

    # Update status
    try:
        plan_doc_name = state.get("plan_doc_name")
        if plan_doc_name:
            frappe.db.set_value("AI Lesson Plan", plan_doc_name, "status", "Retrieving")
    except Exception:
        pass

    return {
        "retrieved_curriculum": final_retrieved_text,
        "curriculum_standards": standards,
        "status": "Retrieving",
    }


def _get_subject_standards(subject: str) -> list:
    """Last-resort curriculum standards when RAG + DB both fail."""
    subject_lower = (subject or "").lower()
    mapping = {
        "toán": "GD.TOAN.MA-01",
        "math": "GD.TOAN.MA-01",
        "vật lý": "GD.LY.MA-02",
        "physics": "GD.LY.MA-02",
        "hóa": "GD.HOA.MA-03",
        "chem": "GD.HOA.MA-03",
        "sinh": "GD.SINH.MA-04",
        "biology": "GD.SINH.MA-04",
        "tin": "GD.TIN.MA-05",
        "computer": "GD.TIN.MA-05",
    }
    for key, code in mapping.items():
        if key in subject_lower:
            return [code]
    return ["GD.GEN.MA-00"]
