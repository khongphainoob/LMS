"""RAG Service — Vietnamese-optimized Retrieval Augmented Generation cho Frappe LMS.

Pipeline:
  Ingestion: LMS Document → Parse → Chunk → Extract Entities → Embed → Qdrant
  Retrieval: Query → Embed → Qdrant Search (filter course) → ViRanker Rerank → Context

Usage:
  from lms.lms.services.rag import RAGService
  rag = RAGService()
  rag.index_document("DOC-001")
  results = rag.retrieve("đạo hàm là gì", course_id="MATH-001")
"""
from lms.lms.services.rag.indexer import DocumentIndexer
from lms.lms.services.rag.retriever import RAGRetriever
from lms.lms.services.rag.config import RAGConfig


class RAGService:
	"""Facade for RAG operations."""

	def __init__(self, config: RAGConfig = None):
		self.config = config or RAGConfig.from_settings()
		self._indexer = None
		self._retriever = None

	@property
	def indexer(self):
		if self._indexer is None:
			self._indexer = DocumentIndexer(self.config)
		return self._indexer

	@property
	def retriever(self):
		if self._retriever is None:
			self._retriever = RAGRetriever(self.config)
		return self._retriever

	def index_document(self, doc_name: str) -> dict:
		return self.indexer.index_document(doc_name)

	def remove_document(self, doc_name: str):
		return self.indexer.remove_document(doc_name)

	def reindex_all(self) -> dict:
		return self.indexer.reindex_all()

	def retrieve(self, query: str, course_id: str = None, top_k: int = None) -> list:
		return self.retriever.retrieve(query, course_id=course_id, top_k=top_k)

	def retrieve_with_context(self, query: str, course_id: str = None, top_k: int = None) -> str:
		return self.retriever.retrieve_with_context(query, course_id=course_id, top_k=top_k)

	def retrieve_public(self, query: str, top_k: int = None) -> list:
		"""Retrieve only public documents (for Socratic Agent)."""
		return self.retriever.retrieve_public(query, top_k=top_k)

	def retrieve_public_with_context(self, query: str, top_k: int = None) -> str:
		"""Retrieve public documents as formatted context (for Socratic Agent)."""
		return self.retriever.retrieve_public_with_context(query, top_k=top_k)

	def get_index_status(self) -> dict:
		return self.indexer.get_index_status()
