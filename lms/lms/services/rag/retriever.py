"""Retrieval pipeline with ViRanker reranking."""
from typing import List, Dict, Any
import frappe
from .config import RAGConfig
from .embedder import EmbeddingService
from .vector_store import QdrantVectorStore


class ViRankerReranker:
	"""Vietnamese cross-encoder reranker using ViRanker."""
	
	_instance = None
	
	def __new__(cls, config: RAGConfig):
		if cls._instance is None:
			cls._instance = super().__new__(cls)
			cls._instance._initialized = False
		return cls._instance
		
	def __init__(self, config: RAGConfig):
		if not self._initialized:
			self.config = config
			self.model = None
			self.tokenizer = None
			self._initialized = True
			if self.config.reranker_enabled:
				self._load_model()
				
	def _load_model(self):
		try:
			from transformers import AutoModelForSequenceClassification, AutoTokenizer
			frappe.logger("rag").info(f"Loading Reranker model: {self.config.reranker_model}")
			self.tokenizer = AutoTokenizer.from_pretrained(self.config.reranker_model)
			self.model = AutoModelForSequenceClassification.from_pretrained(self.config.reranker_model)
			self.model.eval()
		except Exception as e:
			frappe.log_error(f"Failed to load reranker model: {e}", "RAG Reranker")
			self.model = None
			
	def rerank(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
		"""Rerank documents by relevance to query."""
		if not self.model or not documents:
			return documents[:top_k]
			
		import torch
		
		pairs = [[query, doc["text"]] for doc in documents]
		
		try:
			with torch.inference_mode():
				inputs = self.tokenizer(
					pairs, padding=True, truncation=True,
					return_tensors="pt", max_length=512
				)
				scores = self.model(**inputs, return_dict=True).logits.view(-1).float()
				
			scored_docs = list(zip(documents, scores.tolist()))
			scored_docs.sort(key=lambda x: x[1], reverse=True)
			
			return [
				{**doc, "rerank_score": score}
				for doc, score in scored_docs[:top_k]
			]
		except Exception as e:
			frappe.log_error(f"Reranking error: {e}", "RAG Reranker")
			return documents[:top_k]


class RAGRetriever:
	"""Full retrieval pipeline: Embed → Search → Rerank → Format."""
	
	def __init__(self, config: RAGConfig = None):
		self.config = config or RAGConfig.from_settings()
		self.embedder = EmbeddingService(self.config)
		self.vector_store = QdrantVectorStore(self.config)
		self.reranker = ViRankerReranker(self.config)
		self._retrieval_plugins = []
		
	def retrieve(self, query: str, course_id: str = None, top_k: int = None, is_public_only: bool = False) -> List[Dict[str, Any]]:
		"""Main retrieval entry point."""
		if not self.config.rag_enabled:
			return []
			
		top_k = top_k or self.config.rerank_top_k
		
		query_vector = self.embedder.embed_query(query)
		
		candidates = self.vector_store.search(
			query_vector=query_vector,
			course_id=course_id,
			top_k=self.config.search_top_k,
			is_public_only=is_public_only
		)
		
		for plugin in self._retrieval_plugins:
			extra_results = plugin.retrieve(query, course_id)
			candidates = self._merge_results(candidates, extra_results)
			
		results = self.reranker.rerank(query, candidates, top_k=top_k)
		return results
		
	def retrieve_with_context(self, query: str, course_id: str = None, top_k: int = None) -> str:
		"""Retrieve and format as context string for LLM."""
		results = self.retrieve(query, course_id, top_k)
		return self._format_context_with_citations(results)
		
	def retrieve_public(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
		"""Retrieve only public documents (for Socratic Agent)."""
		return self.retrieve(query, top_k=top_k, is_public_only=True)
		
	def retrieve_public_with_context(self, query: str, top_k: int = None) -> str:
		"""Retrieve public documents as formatted context."""
		results = self.retrieve_public(query, top_k=top_k)
		return self._format_context_with_citations(results)
		
	def _format_context_with_citations(self, results: List[Dict[str, Any]]) -> str:
		"""Format retrieval results as LLM context with source citations."""
		if not results:
			return ""
			
		context_parts = ["=== TÀI LIỆU THAM KHẢO ==="]
		for i, r in enumerate(results, 1):
			source = r.get("document_title") or "Không rõ nguồn"
			section = r.get("section_title", "")
			page = r.get("page_number", 0)
			text = r.get("text", "")
			prefix = r.get("context_prefix", "")
			
			citation = f"[{i}] Nguồn: {source}"
			if section and section != "General":
				citation += f", {section}"
			if page:
				citation += f" (Trang {page})"
				
			# If prefix is already in text (some chunkers do this), avoid duplication
			if prefix and not text.startswith(prefix.strip()):
				context_parts.append(f"{citation}\n{prefix}{text}\n")
			else:
				context_parts.append(f"{citation}\n{text}\n")
				
		return "\n".join(context_parts)
		
	def register_retrieval_plugin(self, plugin):
		self._retrieval_plugins.append(plugin)
		
	def _merge_results(self, list1, list2):
		"""Merge and deduplicate results."""
		seen = set()
		merged = []
		for item in list1 + list2:
			doc_id = item.get("document_id")
			chunk_idx = item.get("chunk_index")
			key = f"{doc_id}_{chunk_idx}"
			if key not in seen:
				seen.add(key)
				merged.append(item)
		return merged
