"""Public API endpoints for RAG operations."""
import frappe
from frappe import _


@frappe.whitelist()
def search(query: str, course: str = None, top_k: int = 5):
	"""Search RAG index. Available to authenticated users."""
	from .retriever import RAGRetriever
	retriever = RAGRetriever()
	return retriever.retrieve(query, course_id=course, top_k=int(top_k))

@frappe.whitelist()
def search_public(query: str, top_k: int = 5):
	"""Search public documents only (for Socratic Agent)."""
	from .retriever import RAGRetriever
	retriever = RAGRetriever()
	return retriever.retrieve_public(query, top_k=int(top_k))

def _run_reindex_all():
	from .indexer import DocumentIndexer
	DocumentIndexer().reindex_all()

@frappe.whitelist()
def reindex_all():
	"""Admin: Rebuild entire RAG index."""
	if not frappe.has_permission("LMS AI Settings", "write"):
		frappe.throw(_("Insufficient permissions"))
	frappe.enqueue("lms.lms.services.rag.api._run_reindex_all", queue="long", timeout=3600)
	return {"status": "queued"}

@frappe.whitelist()
def reindex_document(doc_name: str):
	"""Admin: Reindex a single document."""
	if not frappe.has_permission("LMS AI Settings", "write"):
		frappe.throw(_("Insufficient permissions"))
	from .indexer import DocumentIndexer
	indexer = DocumentIndexer()
	frappe.enqueue("lms.lms.services.rag.hooks._index_async", doc_name=doc_name, queue="short", timeout=300)
	return {"status": "queued"}

@frappe.whitelist()
def index_status():
	"""Admin: Check index statistics."""
	if not frappe.has_permission("LMS AI Settings", "read"):
		frappe.throw(_("Insufficient permissions"))
	from .indexer import DocumentIndexer
	return DocumentIndexer().get_index_status()
