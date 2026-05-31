"""Legacy RAG utilities - delegates to lms.lms.services.rag module.
Kept for backward compatibility.
"""
from lms.lms.services.rag.indexer import DocumentIndexer
from lms.lms.services.rag.retriever import RAGRetriever

def index_all_documents():
	return DocumentIndexer().reindex_all()

def query_vector_db(query_text, n_results=3, filters=None):
	course_id = filters.get("course_id") if filters else None
	return RAGRetriever().retrieve(query_text, course_id=course_id, top_k=n_results)

def index_single_document(doc, method=None):
	if doc.doctype == "LMS Document":
		DocumentIndexer().index_document(doc.name)
