"""Qdrant vector store with multi-tenant metadata filtering."""
import uuid
from typing import List, Dict, Any
import frappe
from .config import RAGConfig
from .chunker import Chunk


class QdrantVectorStore:
	"""Qdrant vector store running in embedded mode."""
	
	def __init__(self, config: RAGConfig):
		self.config = config
		from qdrant_client import QdrantClient
		
		# Connection mode: Remote or Embedded persistent
		try:
			if getattr(config, "qdrant_url", None):
				frappe.logger("rag").info(f"Connecting to remote Qdrant at {config.qdrant_url}")
				self.client = QdrantClient(url=config.qdrant_url)
			else:
				self.client = QdrantClient(path=config.qdrant_path)
			self._ensure_collection()
		except Exception as e:
			frappe.log_error(f"Failed to initialize Qdrant: {e}", "RAG Vector Store")
			self.client = None
			
	def _ensure_collection(self):
		"""Create collection with optimized indexes."""
		if not self.client:
			return
			
		from qdrant_client.http import models
		
		collections = [c.name for c in self.client.get_collections().collections]
		if self.config.qdrant_collection not in collections:
			distance = models.Distance.DOT if self.config.distance_metric.upper() == "DOT" else models.Distance.COSINE
			self.client.create_collection(
				collection_name=self.config.qdrant_collection,
				vectors_config=models.VectorParams(
					size=self.config.embedding_dims,
					distance=distance,
				),
			)
			# Create payload indexes
			indexes = {
				"course_id": models.PayloadSchemaType.KEYWORD,
				"document_id": models.PayloadSchemaType.KEYWORD,
				"category": models.PayloadSchemaType.KEYWORD,
				"scope": models.PayloadSchemaType.KEYWORD,
				"is_public": models.PayloadSchemaType.BOOL,
				"file_type": models.PayloadSchemaType.KEYWORD,
			}
			for field, schema in indexes.items():
				self.client.create_payload_index(
					collection_name=self.config.qdrant_collection,
					field_name=field,
					field_schema=schema,
				)

	def upsert_chunks(self, chunks: List[Chunk], embeddings: List[List[float]]):
		"""Upsert chunks with vectors and metadata."""
		if not self.client or not chunks:
			return
			
		from qdrant_client.http import models
		
		points = []
		for chunk, embedding in zip(chunks, embeddings):
			# Deterministic ID
			point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{chunk.document_id}_{chunk.chunk_index}"))
			
			payload = {
				"text": chunk.content,
				"context_prefix": chunk.context_prefix,
				"course_id": chunk.metadata.get("course_id") or "",
				"document_id": chunk.document_id,
				"document_title": chunk.metadata.get("document_title") or "",
				"scope": chunk.metadata.get("scope") or "Course",
				"category": chunk.metadata.get("category") or "",
				"is_public": chunk.metadata.get("is_public", False),
				"section_title": chunk.metadata.get("section_title") or "",
				"page_number": chunk.metadata.get("page_number", 0),
				"file_type": chunk.metadata.get("file_type") or "",
				"chunk_index": chunk.chunk_index,
				"entity_mentions": chunk.metadata.get("entity_mentions", []),
				"entity_types": chunk.metadata.get("entity_types", []),
				"relationships": chunk.metadata.get("relationships", []),
				"content_hash": chunk.content_hash,
				"indexed_at": chunk.metadata.get("indexed_at", ""),
			}
			
			points.append(models.PointStruct(id=point_id, vector=embedding, payload=payload))
			
		self.client.upsert(
			collection_name=self.config.qdrant_collection,
			points=points,
		)

	def search(self, query_vector: List[float], course_id: str = None, top_k: int = 20, is_public_only: bool = False, extra_filters: dict = None) -> List[Dict[str, Any]]:
		"""Metadata-filtered vector search."""
		if not self.client:
			return []
			
		from qdrant_client.http import models
		
		should_conditions = []
		must_conditions = []
		
		if is_public_only:
			must_conditions.append(
				models.FieldCondition(key="is_public", match=models.MatchValue(value=True))
			)
		elif course_id:
			should_conditions.append(
				models.FieldCondition(key="course_id", match=models.MatchValue(value=course_id))
			)
			should_conditions.append(
				models.FieldCondition(key="is_public", match=models.MatchValue(value=True))
			)
			
		query_filter = None
		if must_conditions or should_conditions:
			query_filter = models.Filter(must=must_conditions, should=should_conditions)
			
		try:
			response = self.client.query_points(
				collection_name=self.config.qdrant_collection,
				query=query_vector,
				query_filter=query_filter,
				limit=top_k,
				with_payload=True,
			)
			results = getattr(response, "points", response)
			
			return [
				{
					"text": hit.payload.get("text", ""),
					"context_prefix": hit.payload.get("context_prefix", ""),
					"score": hit.score,
					"document_id": hit.payload.get("document_id", ""),
					"document_title": hit.payload.get("document_title", ""),
					"section_title": hit.payload.get("section_title", ""),
					"page_number": hit.payload.get("page_number", 0),
					"course_id": hit.payload.get("course_id", ""),
				}
				for hit in results
			]
		except Exception as e:
			frappe.log_error(f"Search error: {e}", "RAG Vector Store")
			return []

	def delete_by_document(self, document_id: str):
		"""Remove all chunks of a document."""
		if not self.client:
			return
			
		from qdrant_client.http import models
		try:
			self.client.delete(
				collection_name=self.config.qdrant_collection,
				points_selector=models.FilterSelector(
					filter=models.Filter(must=[
						models.FieldCondition(
							key="document_id",
							match=models.MatchValue(value=document_id),
						)
					])
				),
			)
		except Exception as e:
			frappe.log_error(f"Delete error: {e}", "RAG Vector Store")

	def get_collection_info(self) -> Dict[str, Any]:
		"""Admin: get collection stats."""
		if not self.client:
			return {"status": "Error", "message": "Qdrant client not initialized"}
			
		try:
			info = self.client.get_collection(self.config.qdrant_collection)
			return {
				"vectors_count": getattr(info, "vectors_count", info.points_count),
				"points_count": info.points_count,
				"status": getattr(info.status, "value", str(info.status)),
			}
		except Exception as e:
			return {"status": "Error", "message": str(e)}
