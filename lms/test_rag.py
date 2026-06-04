import frappe
from lms.lms.services.rag.indexer import DocumentIndexer
from lms.lms.services.rag.retriever import RAGRetriever
from lms.lms.services.rag.vector_store import QdrantVectorStore
from lms.lms.services.rag.config import RAGConfig

@frappe.whitelist()
def test():
    conf = RAGConfig.from_settings()
    vs = QdrantVectorStore(conf)

    # Xoa collection cu va reindex lai
    print("Deleting old collection...")
    try:
        vs.client.delete_collection(conf.qdrant_collection)
        print("Collection deleted.")
    except:
        pass

    print("Reindexing all docs with updated is_public logic...")
    indexer = DocumentIndexer()
    results = indexer.reindex_all()
    print(f"Reindex result: {results}")

    # Check metadata moi trong Qdrant
    print("\n=== [A] Sample points after reindex ===")
    result = vs.client.scroll(
        collection_name=conf.qdrant_collection,
        limit=6,
        with_payload=True,
        with_vectors=False
    )
    points, _ = result
    for p in points:
        pl = p.payload
        print(f"  doc_id={pl.get('document_id')}, course_id='{pl.get('course_id')}', is_public={pl.get('is_public')}, scope={pl.get('scope')}")

    # Test retrieve public (Socratic)
    print("\n=== [B] Socratic Public Retrieve ===")
    retriever = RAGRetriever()
    public_results = retriever.retrieve_public("hệ điều hành", top_k=3)
    print(f"Public results: {len(public_results)}")
    for r in public_results:
        print(f"  - {r.get('document_title')} | score={r.get('rerank_score', r.get('score', 0)):.3f}")

    # Test retrieve by course
    print("\n=== [C] Course Filter Retrieve ===")
    course_results = retriever.retrieve("hệ điều hành", course_id="e2e-course-1776088307679", top_k=3)
    print(f"Course filter results: {len(course_results)}")
    for r in course_results:
        print(f"  - {r.get('document_title')} | score={r.get('rerank_score', r.get('score', 0)):.3f}")

    return "Done"
