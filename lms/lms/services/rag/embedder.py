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
			# Double check inside lock
			if self._initialized:
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
					# Fallback
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
		
		return self.st_model.encode(texts).tolist()
			
	def embed_query(self, query: str) -> List[float]:
		"""Embed a single search query."""
		self._initialize()
		
		return self.st_model.encode([query])[0].tolist()
			
	def _embed_onnx(self, texts: List[str]) -> List[List[float]]:
		pass
