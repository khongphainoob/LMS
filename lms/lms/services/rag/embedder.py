"""Vietnamese embedding service with ONNX CPU optimization."""
import threading
from typing import List
import frappe
from .config import RAGConfig


class EmbeddingService:
	"""Singleton embedding service."""
	
	_instance = None
	_lock = threading.Lock()
	
	def __new__(cls, config: RAGConfig = None):
		with cls._lock:
			if cls._instance is None:
				cls._instance = super().__new__(cls)
				cls._instance._initialized = False
			return cls._instance
			
	def __init__(self, config: RAGConfig = None):
		# __init__ might be called multiple times, but initialization only happens once
		if not self._initialized:
			self.config = config or RAGConfig.from_settings()
			self.model = None
			self.tokenizer = None
			self.st_model = None
			
	def _initialize(self):
		"""Lazy load model on first use."""
		if self._initialized:
			return
			
		with self._lock:
			if self._initialized:
				return
				
			if self.config.embedding_provider.lower() != "local":
				# No need to load local model for external API
				frappe.logger("rag").info(f"Using {self.config.embedding_provider} API for Embeddings. Skipping local model load.")
				self._initialized = True
				return

			try:
				if self.config.use_onnx:
					self._load_onnx_model()
				else:
					self._load_pytorch_model()
			except Exception as e:
				frappe.log_error(f"Failed to load embedding model: {e}", "RAG Embedder")
				frappe.logger("rag").error(f"Failed to load embedding model: {e}. Falling back to PyTorch if ONNX failed.")
				if self.config.use_onnx:
					self.config.use_onnx = False
					self._load_pytorch_model()
					
			self._initialized = True

	def _load_onnx_model(self):
		pass
		
	def _load_pytorch_model(self):
		"""Fallback: sentence-transformers."""
		import os
		import warnings
		os.environ["CUDA_VISIBLE_DEVICES"] = ""
		warnings.filterwarnings("ignore")
		frappe.logger("rag").info(f"Loading PyTorch embedding model on CPU: {self.config.embedding_model}")
		from sentence_transformers import SentenceTransformer
		self.st_model = SentenceTransformer(self.config.embedding_model, device="cpu")
		self.st_model.max_seq_length = self.config.embedding_max_seq_length
		
	def embed_documents(self, texts: List[str]) -> List[List[float]]:
		"""Batch embed documents."""
		if not texts:
			return []
			
		self._initialize()
		
		if self.config.embedding_provider.lower() != "local":
			return self._embed_openai(texts)
			
		return self.st_model.encode(texts).tolist()
			
	def embed_query(self, query: str) -> List[float]:
		"""Embed a single search query."""
		self._initialize()
		
		if self.config.embedding_provider.lower() != "local":
			return self._embed_openai([query])[0]
			
		return self.st_model.encode([query])[0].tolist()

	def _embed_openai(self, texts: List[str]) -> List[List[float]]:
		"""Call OpenAI or compatible API (like OpenRouter) to offload CPU."""
		import requests
		api_key = self.config.embedding_api_key
		base_url = self.config.embedding_base_url
		provider = self.config.embedding_provider.lower() if self.config.embedding_provider else ""
		
		# OpenRouter default URL handling
		if provider == "openrouter" and ("openai.com" in base_url or not base_url):
			base_url = "https://openrouter.ai/api/v1/embeddings"
			
		if not base_url.endswith("/embeddings"):
			if base_url.endswith("/v1") or base_url.endswith("/v1/"):
				base_url = base_url.rstrip("/") + "/embeddings"
			else:
				base_url = base_url.rstrip("/") + "/v1/embeddings"
				
		if not api_key:
			frappe.throw("Missing API Key for embedding")
			
		api_key = api_key.strip()
			
		headers = {
			"Authorization": f"Bearer {api_key}",
			"Content-Type": "application/json"
		}
		
		if "openrouter" in base_url.lower() or provider == "openrouter":
			headers["HTTP-Referer"] = frappe.utils.get_url()
			headers["X-OpenRouter-Title"] = "Frappe LMS"
		
		# Model resolution
		model = self.config.embedding_model
		if model == "AITeamVN/Vietnamese_Embedding_v2":
			if "openrouter" in base_url.lower() or provider == "openrouter":
				model = "perplexity/pplx-embed-v1-4b"
			else:
				model = "text-embedding-3-small"
			
		data = {
			"input": texts,
			"model": model,
		}
		
		try:
			response = requests.post(base_url, headers=headers, json=data, timeout=30)
			response.raise_for_status()
			res_data = response.json()
			
			# Extract embedding vector. Some APIs don't return 'index' correctly, so just iterate
			if "data" in res_data:
				return [item["embedding"] for item in res_data["data"]]
			return []
		except Exception as e:
			error_msg = f"External Embedding API Error: {str(e)} - URL: {base_url} - Model: {model}"
			# Truncate to prevent CharacterLengthExceededError on title
			frappe.log_error(error_msg[:139], "RAG Embedder")
			raise e
			
	def _embed_onnx(self, texts: List[str]) -> List[List[float]]:
		pass
