"""Structure-aware chunking for educational content."""
import hashlib
from dataclasses import dataclass, field
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from .config import RAGConfig
from .document_parser import ParsedDocument
import frappe


@dataclass
class Chunk:
	"""A single chunk ready for embedding."""
	content: str
	context_prefix: str
	metadata: Dict[str, Any]
	chunk_index: int
	document_id: str
	content_hash: str


class EducationalChunker:
	"""Structure-aware chunking optimized for educational content."""

	def __init__(self, config: RAGConfig):
		self.config = config
		self.text_splitter = RecursiveCharacterTextSplitter(
			chunk_size=config.chunk_size,
			chunk_overlap=config.chunk_overlap,
			length_function=len,
			is_separator_regex=False,
		)

	def chunk_document(self, parsed_doc: ParsedDocument, doc_meta: dict) -> List[Chunk]:
		"""Main entry: ParsedDocument → list[Chunk] with metadata."""
		chunks = []
		
		if parsed_doc.sections:
			chunks = self._chunk_by_sections(parsed_doc.sections, doc_meta)
		else:
			chunks = self._chunk_recursive(parsed_doc.content, doc_meta)
			
		# Apply contextual prefix
		for chunk in chunks:
			chunk.context_prefix = self._build_context_prefix(chunk, doc_meta)
			
		return chunks

	def _chunk_by_sections(self, sections: List[Dict[str, Any]], doc_meta: dict) -> List[Chunk]:
		chunks = []
		chunk_index = 0
		document_id = doc_meta.get("document_id", "")
		
		for section in sections:
			content = section.get("content", "").strip()
			if not content:
				continue
				
			# If section is small enough, make it one chunk
			if len(content) <= self.config.chunk_size:
				if len(content) >= self.config.min_chunk_size:
					chunks.append(self._create_chunk(
						content=content,
						section=section,
						doc_meta=doc_meta,
						chunk_index=chunk_index
					))
					chunk_index += 1
			else:
				# Split large section
				texts = self.text_splitter.split_text(content)
				for text in texts:
					if len(text) >= self.config.min_chunk_size:
						chunks.append(self._create_chunk(
							content=text,
							section=section,
							doc_meta=doc_meta,
							chunk_index=chunk_index
						))
						chunk_index += 1
		
		return chunks

	def _chunk_recursive(self, content: str, doc_meta: dict) -> List[Chunk]:
		chunks = []
		document_id = doc_meta.get("document_id", "")
		
		texts = self.text_splitter.split_text(content)
		for i, text in enumerate(texts):
			if len(text) >= self.config.min_chunk_size:
				chunks.append(self._create_chunk(
					content=text,
					section={"title": "", "page": 0},
					doc_meta=doc_meta,
					chunk_index=i
				))
				
		return chunks

	def _create_chunk(self, content: str, section: dict, doc_meta: dict, chunk_index: int) -> Chunk:
		meta = doc_meta.copy()
		meta["section_title"] = section.get("title", "")
		meta["page_number"] = section.get("page", 0)
		meta["chunk_index"] = chunk_index
		
		content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
		
		return Chunk(
			content=content,
			context_prefix="", # Set later
			metadata=meta,
			chunk_index=chunk_index,
			document_id=doc_meta.get("document_id", ""),
			content_hash=content_hash
		)

	def _build_context_prefix(self, chunk: Chunk, doc_meta: dict) -> str:
		"""Anthropic-style context prefix."""
		parts = [f"Tài liệu: {doc_meta.get('document_title', doc_meta.get('document_id', ''))}"]
		section_title = chunk.metadata.get("section_title")
		if section_title and section_title != "General":
			parts.append(f"Phần: {section_title}")
		return " | ".join(parts) + "\n\n"
