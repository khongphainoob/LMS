"""Entity extractor for GraphRAG preparation."""
import re
from collections import Counter
from typing import Dict, Any, List


class SimpleEntityExtractor:
	"""Lightweight entity/keyword extraction for GraphRAG preparation.
	
	Phase 1: Simple keyword extraction (no LLM, no GPU)
	Phase 2 (future): LLM-based entity extraction for full GraphRAG
	"""
	
	def __init__(self):
		# Vietnamese stopwords (compact set)
		self.stopwords = {
			"là", "của", "và", "có", "được", "trong", "cho", 
			"các", "với", "này", "đã", "để", "không", "một",
			"những", "từ", "theo", "về", "hay", "hoặc", "nhưng",
			"cũng", "như", "khi", "đó", "ra", "vào", "lại", "rất",
			"thì", "sẽ", "đến", "các", "có_thể", "người", "làm",
			"phải", "đang", "bị", "bởi", "nên", "nhiều", "còn"
		}
	
	def extract(self, text: str, doc_meta: dict) -> Dict[str, Any]:
		"""Extract entities and relationships from text."""
		keywords = self._extract_keywords(text)
		
		return {
			"entity_mentions": keywords,
			"entity_types": ["Keyword"] * len(keywords),
			"relationships": [],  # Empty for now, populated by GraphRAG later
		}
	
	def _extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
		"""TF-based keyword extraction — no external dependencies."""
		words = re.findall(r'\b[\w]+\b', text.lower())
		words = [w for w in words if len(w) > 2 and w not in self.stopwords and not w.isnumeric()]
		counter = Counter(words)
		return [word for word, _ in counter.most_common(top_n)]
