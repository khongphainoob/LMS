"""RAG Configuration — centralized settings with LMS AI Settings override."""
import os
from dataclasses import dataclass, field


@dataclass
class RAGConfig:
	"""Central RAG configuration.

	Priority: LMS AI Settings (Desk) > Environment Variables > Defaults
	"""

	# === Embedding ===
	embedding_model: str = "AITeamVN/Vietnamese_Embedding_v2"
	embedding_dims: int = 1024
	embedding_max_seq_length: int = 2048
	use_onnx: bool = False
	embedding_provider: str = "local"
	embedding_api_key: str = ""
	embedding_base_url: str = "https://api.openai.com/v1"

	# === Vector Store (Qdrant) ===
	qdrant_url: str = ""

	# === Chunking ===
	chunk_size: int = 512
	chunk_overlap: int = 100
	min_chunk_size: int = 50

	# === Vector Store (Qdrant) ===
	qdrant_path: str = ""
	qdrant_collection: str = "lms_documents"
	distance_metric: str = "Dot"

	# === Retrieval ===
	search_top_k: int = 20
	rerank_top_k: int = 5

	# === Reranker ===
	reranker_model: str = "namdp-ptit/ViRanker"
	reranker_enabled: bool = False
	reranker_use_onnx: bool = False
	reranker_provider: str = "local"
	reranker_api_key: str = ""

	# === Entity Extraction (GraphRAG prep) ===
	extract_entities: bool = True

	# === Feature Flags ===
	rag_enabled: bool = True

	@classmethod
	def from_settings(cls) -> "RAGConfig":
		"""Load config from LMS AI Settings, with fallback to defaults."""
		config = cls()

		# Set Qdrant path from Frappe site (fallback)
		try:
			import frappe
			config.qdrant_path = os.path.join(frappe.get_site_path(), "rag_vectors")
		except Exception:
			config.qdrant_path = "./rag_vectors"

		# Auto-detect Docker Qdrant server on localhost:6333
		try:
			import urllib.request
			req = urllib.request.Request("http://localhost:6333/healthz", method="GET")
			urllib.request.urlopen(req, timeout=1)
			config.qdrant_url = "http://localhost:6333"
		except Exception:
			pass  # No Docker Qdrant, use embedded path

		# Override from LMS AI Settings (Desk)
		try:
			import frappe
			settings = frappe.get_single("LMS AI Settings")

			_map = {
				"rag_enabled": "rag_enabled",
				"rag_embedding_model": "embedding_model",
				"rag_chunk_size": "chunk_size",
				"rag_chunk_overlap": "chunk_overlap",
				"rag_reranker_enabled": "reranker_enabled",
				"rag_reranker_model": "reranker_model",
				"rag_search_top_k": "search_top_k",
				"rag_rerank_top_k": "rerank_top_k",
				"rag_qdrant_url": "qdrant_url",
			}

			for desk_field, config_field in _map.items():
				val = getattr(settings, desk_field, None)
				if val is not None and val != "":
					setattr(config, config_field, val)
					
			# Use default provider and API key as fallback for embedding/reranker
			default_key = getattr(settings, "default_api_key", None)
			if default_key and not default_key.startswith("*"):
				setattr(config, "embedding_api_key", default_key)
				setattr(config, "reranker_api_key", default_key)
			elif default_key and default_key.startswith("*"):
				real_key = settings.get_password("default_api_key")
				setattr(config, "embedding_api_key", real_key)
				setattr(config, "reranker_api_key", real_key)
				
			if getattr(settings, "default_provider", None):
				setattr(config, "embedding_provider", settings.default_provider)
				setattr(config, "reranker_provider", settings.default_provider)
				if settings.default_provider.lower() == "openrouter":
					setattr(config, "embedding_dims", 2560)
					
			if getattr(settings, "default_base_url", None):
				setattr(config, "embedding_base_url", settings.default_base_url)
				
		except Exception:
			pass

		# Override from frappe.conf (site_config.json) or environment variables
		frappe_conf = {}
		try:
			import frappe
			if hasattr(frappe, "conf"):
				frappe_conf = frappe.conf
		except Exception:
			pass
			
		env_map = {
			"RAG_EMBEDDING_MODEL": "embedding_model",
			"RAG_EMBEDDING_PROVIDER": "embedding_provider",
			"RAG_EMBEDDING_API_KEY": "embedding_api_key",
			"RAG_EMBEDDING_BASE_URL": "embedding_base_url",
			"RAG_CHUNK_SIZE": ("chunk_size", int),
			"RAG_RERANKER_MODEL": "reranker_model",
			"RAG_RERANKER_PROVIDER": "reranker_provider",
			"RAG_RERANKER_API_KEY": "reranker_api_key",
			"RAG_QDRANT_PATH": "qdrant_path",
			"RAG_QDRANT_URL": "qdrant_url",
		}
		for env_key, target in env_map.items():
			env_val = frappe_conf.get(env_key) or frappe_conf.get(env_key.lower()) or os.environ.get(env_key)
			if env_val:
				if isinstance(target, tuple):
					setattr(config, target[0], target[1](env_val))
				else:
					setattr(config, target, env_val)

		# Final safeguard for OpenRouter Dimensions
		if (config.embedding_provider and "openrouter" in config.embedding_provider.lower()) or \
		   (config.embedding_base_url and "openrouter" in config.embedding_base_url.lower()):
			config.embedding_dims = 2560
			
		return config
