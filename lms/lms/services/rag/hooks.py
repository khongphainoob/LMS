"""Frappe doc_events handlers for RAG indexing."""
import frappe


def on_document_save(doc, method=None):
	"""Auto-index LMS Document when saved. Runs in background."""
	if doc.doctype != "LMS Document":
		return
	frappe.enqueue(
		"lms.lms.services.rag.hooks._index_async",
		doc_name=doc.name,
		queue="short",
		timeout=300,
	)

def on_document_delete(doc, method=None):
	"""Remove document from RAG index when trashed."""
	if doc.doctype != "LMS Document":
		return
	try:
		from lms.lms.services.rag.indexer import DocumentIndexer
		indexer = DocumentIndexer()
		indexer.remove_document(doc.name)
	except Exception as e:
		frappe.log_error(f"RAG Delete Error: {e}", "RAG Indexing")

def _index_async(doc_name: str):
	"""Background job for indexing."""
	from lms.lms.services.rag.indexer import DocumentIndexer
	try:
		indexer = DocumentIndexer()
		result = indexer.index_document(doc_name)
		frappe.logger("rag").info(f"Indexed {doc_name}: {result}")
	except Exception as e:
		frappe.log_error(f"RAG Index Error for {doc_name}: {e}", "RAG Indexing")
