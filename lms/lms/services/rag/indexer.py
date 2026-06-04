"""End-to-end document indexing pipeline."""
import os
import urllib.parse
import frappe
from frappe.utils.file_manager import get_file_path
from .config import RAGConfig
from .document_parser import DocumentParser
from .chunker import EducationalChunker
from .embedder import EmbeddingService
from .vector_store import QdrantVectorStore
from .entity_extractor import SimpleEntityExtractor


class DocumentIndexer:
	"""Document indexing pipeline."""
	
	def __init__(self, config: RAGConfig = None):
		self.config = config or RAGConfig.from_settings()
		self.parser = DocumentParser()
		self.chunker = EducationalChunker(self.config)
		self.embedder = EmbeddingService(self.config)
		self.vector_store = QdrantVectorStore(self.config)
		self.entity_extractor = SimpleEntityExtractor()
		
	def index_document(self, doc_name: str) -> dict:
		"""Index a single LMS Document."""
		if not self.config.rag_enabled:
			return {"status": "skipped", "reason": "RAG is disabled"}
			
		doc = frappe.get_doc("LMS Document", doc_name)
		if doc.status != "Active" or not doc.file:
			return {"status": "skipped", "reason": "inactive or no file"}
			
		try:
			# 1. Get file path
			file_path = self._get_file_path(doc.file)
			if not file_path or not os.path.exists(file_path):
				return {"status": "failed", "reason": f"File not found: {file_path}"}
				
			file_type = self._detect_file_type(doc.file, doc.file_type)
			
			# 2. Parse
			parsed = self.parser.parse(file_path, file_type)
			
			# 3. Build metadata
			doc_meta = {
				"document_id": doc.name,
				"document_title": doc.title,
				"course_id": doc.course or "",
				"scope": doc.scope,
				"category": doc.category or "",
				# Community-scope docs are always public (accessible to all users / Socratic)
				"is_public": bool(doc.is_public) or (doc.scope == "Community"),
				"file_type": file_type,
				"indexed_at": frappe.utils.now(),
			}
			
			# 4. Chunk
			chunks = self.chunker.chunk_document(parsed, doc_meta)
			
			# 5. Extract entities
			if self.config.extract_entities:
				for chunk in chunks:
					entities = self.entity_extractor.extract(chunk.content, doc_meta)
					chunk.metadata.update(entities)
					
			# 6. Embed
			texts_to_embed = [f"{c.context_prefix}{c.content}" for c in chunks]
			embeddings = self.embedder.embed_documents(texts_to_embed)
			
			if not embeddings:
				return {"status": "failed", "reason": "Embedding failed"}
				
			# 7. Upsert
			self.vector_store.delete_by_document(doc.name)
			self.vector_store.upsert_chunks(chunks, embeddings)
			
			frappe.logger("rag").info(f"Indexed {doc_name}: {len(chunks)} chunks")
			return {
				"status": "ok",
				"document_id": doc.name,
				"chunks": len(chunks),
				"file_type": file_type,
			}
			
		except Exception as e:
			err_msg = str(e)
			if len(err_msg) > 100:
				err_msg = err_msg[:100] + "..."
			frappe.log_error(f"Error indexing {doc_name}: {err_msg}", "RAG Indexer")
			return {"status": "failed", "error": err_msg}

	def remove_document(self, doc_name: str):
		"""Remove a document from index."""
		self.vector_store.delete_by_document(doc_name)

	def reindex_all(self) -> dict:
		"""Rebuild entire index."""
		documents = frappe.get_all("LMS Document", filters={"status": "Active"}, fields=["name"])
		
		results = {"total": len(documents), "indexed": 0, "failed": 0, "errors": []}
		
		for doc in documents:
			res = self.index_document(doc.name)
			if res.get("status") == "ok":
				results["indexed"] += 1
			elif res.get("status") == "failed":
				results["failed"] += 1
				results["errors"].append({"doc": doc.name, "error": res.get("error") or res.get("reason")})
				
		return results

	def get_index_status(self) -> dict:
		"""Get index statistics."""
		return {
			**self.vector_store.get_collection_info(),
			"embedding_model": self.config.embedding_model,
			"reranker_model": self.config.reranker_model,
		}

	def _get_file_path(self, file_url: str) -> str:
		"""Resolve Frappe file URL to absolute path on disk."""
		if file_url.startswith("data:"):
			# Handle base64 encoded files directly
			import base64
			import tempfile
			
			header, encoded = file_url.split(",", 1)
			data = base64.b64decode(encoded)
			
			# Extract extension from header if possible e.g. data:application/pdf;base64
			ext = ".txt"
			if "pdf" in header:
				ext = ".pdf"
			elif "wordprocessingml" in header:
				ext = ".docx"
			elif "presentationml" in header:
				ext = ".pptx"
				
			temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
			temp_file.write(data)
			temp_file.close()
			return temp_file.name
			
		file_name = file_url.split("/")[-1]
		file_doc = frappe.get_doc("File", {"file_url": file_url})
		return file_doc.get_full_path()

	def _detect_file_type(self, file_url: str, file_type_field: str) -> str:
		if file_type_field:
			return file_type_field.lower()
		if file_url.startswith("data:"):
			if "pdf" in file_url[:50]: return "pdf"
			if "wordprocessingml" in file_url[:50]: return "docx"
			if "presentationml" in file_url[:50]: return "pptx"
			return "txt"
		ext = file_url.split('.')[-1].lower()
		return ext
