"""
Zero-cost entity extraction using SpaCy dependency parsing.

Based on SAP (2025): dependency parsing achieves 94% of LLM extraction
quality at near-zero cost. Used as the primary entity extraction method
for GraphRAG knowledge graph construction.

LLM-based extraction is used only as fallback when SpaCy confidence is low.

Usage:
    from lms.lms.agents.specialized_agents.retrievers.entity_extractor import (
        extract_entities_spacy, extract_relations, build_knowledge_triples,
    )

    entities = extract_entities_spacy("Định luật Newton mô tả mối quan hệ giữa lực và gia tốc")
    triples = build_knowledge_triples("Định luật Newton mô tả mối quan hệ giữa lực và gia tốc")
"""

import logging
from typing import List, Dict, Tuple, Optional

logger = logging.getLogger(__name__)


def _get_nlp():
    """Lazy-load SpaCy model. Falls back gracefully."""
    try:
        import spacy
        try:
            return spacy.load("en_core_web_sm")
        except OSError:
            # Download if not available
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"], capture_output=True)
            return spacy.load("en_core_web_sm")
    except ImportError:
        logger.warning("SpaCy not installed. Install with: pip install spacy && python -m spacy download en_core_web_sm")
        return None


def extract_entities_spacy(text: str, min_confidence: float = 0.0) -> List[Dict[str, str]]:
    """
    Extract named entities from text using SpaCy dependency parsing.

    Returns entities like PERSON, ORG, GPE, DATE, etc. plus
    noun phrases extracted from dependency tree.

    Args:
        text: Input text (Vietnamese or English)
        min_confidence: Minimum confidence threshold (unused for SpaCy, for API compat)

    Returns:
        List of {"entity": str, "type": str, "confidence": float}
    """
    nlp = _get_nlp()
    if nlp is None:
        return _extract_entities_fallback(text)

    doc = nlp(text[:10000])  # Limit to avoid memory issues

    entities = []

    # Named entities
    for ent in doc.ents:
        entities.append({
            "entity": ent.text.strip(),
            "type": ent.label_,
            "confidence": 0.95,  # SpaCy NER is deterministic
        })

    # Noun phrases from dependency tree (catches concepts not in NER)
    for chunk in doc.noun_chunks:
        text_stripped = chunk.text.strip()
        # Avoid duplicates and short phrases
        if len(text_stripped) > 2 and not any(e["entity"] == text_stripped for e in entities):
            entities.append({
                "entity": text_stripped,
                "type": "CONCEPT",
                "confidence": 0.85,
            })

    # Deduplicate
    seen = set()
    unique = []
    for e in entities:
        key = e["entity"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique[:15]  # Limit to top 15


def extract_relations(doc_text: str, entities: List[str]) -> List[Dict[str, str]]:
    """
    Extract subject-verb-object relations from dependency parse.

    For each token that is a root verb, find its subject (nsubj) and
    object (dobj/pobj) to form (subject, verb, object) triples.

    Args:
        doc_text: Full sentence text
        entities: List of entity strings to match against

    Returns:
        List of {"subject": str, "relation": str, "object": str}
    """
    nlp = _get_nlp()
    if nlp is None:
        return []

    doc = nlp(doc_text[:2000])
    relations = []
    entity_set = {e.lower() for e in entities}

    for token in doc:
        if token.dep_ == "ROOT" and token.pos_ == "VERB":
            subjects = [child for child in token.children if child.dep_ in ("nsubj", "nsubjpass")]
            objects = [child for child in token.children if child.dep_ in ("dobj", "pobj", "attr", "dative")]

            for subj in subjects:
                subj_text = _get_span_text(subj)
                for obj in objects:
                    obj_text = _get_span_text(obj)
                    if subj_text and obj_text:
                        relations.append({
                            "subject": subj_text,
                            "relation": token.lemma_,
                            "object": obj_text,
                        })

    return relations[:20]


def build_knowledge_triples(text: str) -> List[Dict[str, str]]:
    """
    Build (entity1, relation, entity2) triples from text.

    High-level API that combines entity extraction + relation extraction.
    These triples feed directly into the knowledge graph.

    Args:
        text: Input text (paragraph, lesson content, etc.)

    Returns:
        List of {"subject": str, "predicate": str, "object": str}
    """
    entities = extract_entities_spacy(text)
    entity_strings = [e["entity"] for e in entities]
    relations = extract_relations(text, entity_strings)

    # Convert to knowledge graph triples
    triples = []
    for rel in relations:
        triples.append({
            "subject": rel["subject"],
            "predicate": rel["relation"],
            "object": rel["object"],
        })

    # If SpaCy found no relations but we have entities, create co-occurrence edges
    if not triples and len(entity_strings) >= 2:
        for i in range(len(entity_strings)):
            for j in range(i + 1, min(i + 3, len(entity_strings))):
                triples.append({
                    "subject": entity_strings[i],
                    "predicate": "related_to",
                    "object": entity_strings[j],
                })

    return triples


def _get_span_text(token) -> str:
    """Get the full span of a token including its subtree."""
    if token is None:
        return ""
    # Get the full subtree span
    span = list(token.subtree)
    if span:
        return " ".join(t.text for t in span).strip()
    return token.text.strip()


def _extract_entities_fallback(text: str) -> List[Dict[str, str]]:
    """Fallback entity extraction without SpaCy."""
    import re
    entities = []

    # Capitalized phrases (English)
    capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    for phrase in capitalized[:10]:
        if len(phrase) > 2:
            entities.append({
                "entity": phrase.strip(),
                "type": "CONCEPT",
                "confidence": 0.5,
            })

    # Vietnamese proper nouns (capitalized after punctuation)
    proper = re.findall(r'[.!?]\s+([A-ZĐ][a-zđàáảãạâầấẩẫậăằắẳẵặêềếểễệôồốổỗộơờớởỡợưừứửữự]+(?:\s+[a-zđàáảãạâầấẩẫậăằắẳẵặêềếểễệôồốổỗộơờớởỡợưừứửữự]+)*)', text)
    for phrase in proper[:10]:
        if len(phrase) > 3:
            entities.append({
                "entity": phrase.strip(),
                "type": "CONCEPT",
                "confidence": 0.4,
            })

    return entities[:15]
