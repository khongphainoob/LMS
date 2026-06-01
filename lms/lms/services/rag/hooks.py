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

		# Notify document owner: indexed successfully
		try:
			from lms.lms.services.hitl.notification import notify_user_direct
			from lms.lms.utils import get_lms_route
			doc = frappe.get_doc("LMS Document", doc_name)
			notify_user_direct(
				for_user=doc.owner,
				subject=f"✅ Tài liệu đã được lập chỉ mục: {doc.title}",
				email_content=(
					f"Tài liệu <b>{doc.title}</b> đã được lập chỉ mục thành công vào RAG.<br>"
					f"Chatbot và các AI Agent có thể tìm kiếm nội dung này ngay bây giờ."
				),
				document_type="LMS Document",
				document_name=doc_name,
				link=get_lms_route(f"documents/{doc_name}"),
			)
		except Exception:
			pass

	except Exception as e:
		frappe.log_error(f"RAG Index Error for {doc_name}: {e}", "RAG Indexing")

		# Notify document owner: indexing failed
		try:
			from lms.lms.services.hitl.notification import notify_user_direct
			from lms.lms.utils import get_lms_route
			owner = frappe.db.get_value("LMS Document", doc_name, "owner")
			title = frappe.db.get_value("LMS Document", doc_name, "title") or doc_name
			if owner:
				notify_user_direct(
					for_user=owner,
					subject=f"❌ Lập chỉ mục tài liệu thất bại: {title}",
					email_content=(
						f"Tài liệu <b>{title}</b> bị lỗi khi lập chỉ mục RAG.<br>"
						f"<b>Lỗi:</b> {str(e)}"
					),
					document_type="LMS Document",
					document_name=doc_name,
					link=get_lms_route(f"documents/{doc_name}"),
				)
		except Exception:
			pass
