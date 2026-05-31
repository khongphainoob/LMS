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

	# === Entity Extraction (GraphRAG prep) ===
	extract_entities: bool = True

	# === Feature Flags ===
	rag_enabled: bool = True

	@classmethod
	def from_settings(cls) -> "RAGConfig":
		"""Load config from LMS AI Settings, with fallback to defaults."""
		config = cls()

		# Set Qdrant path from Frappe site
		try:
			import frappe
			config.qdrant_path = os.path.join(frappe.get_site_path(), "rag_vectors")
		except Exception:
			config.qdrant_path = "./rag_vectors"

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
			}

			for desk_field, config_field in _map.items():
				val = getattr(settings, desk_field, None)
				if val is not None and val != "":
					setattr(config, config_field, val)
		except Exception:
			pass

		# Override from environment variables
		env_map = {
			"RAG_EMBEDDING_MODEL": "embedding_model",
			"RAG_CHUNK_SIZE": ("chunk_size", int),
			"RAG_RERANKER_MODEL": "reranker_model",
			"RAG_QDRANT_PATH": "qdrant_path",
		}
		for env_key, target in env_map.items():
			env_val = os.environ.get(env_key)
			if env_val:
				if isinstance(target, tuple):
					setattr(config, target[0], target[1](env_val))
				else:
					setattr(config, target, env_val)

		return config
