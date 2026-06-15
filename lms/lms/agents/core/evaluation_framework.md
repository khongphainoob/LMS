# TOMOSA Educational Content Evaluation Framework

## 1. Core Evaluation Dimensions

Based on synthesis of 5 SOTA frameworks (G-AIETM, EQAITE, TEACH-AI, Edu-GenAI, AIGDER):

| Dimension | Abbrev | Description | Source Frameworks |
|-----------|--------|-------------|-------------------|
| Pedagogical Accuracy | PA | Factual correctness, curriculum alignment, conceptual clarity | TEACH-AI, G-AIETM, EQAITE |
| Pedagogical Safety | PS | Age-appropriateness, no harmful content, bias-free | EQAITE Safeguarding, TEACH-AI Ethics |
| Content Reliability | CR | Citation traceability, source grounding, consistency | Edu-GenAI, ContextualJudgeBench |
| Learning Effectiveness | LE | Engagement, adaptivity, metacognition support | TEACH-AI, G-AIETM |
| Format Compliance | FC | Structured output, schema validation, JSON validity | JudgeBench, archminor |
| Accessibility & Equity | AE | Language support, cultural relevance, WCAG compliance | G-AIETM, TEACH-AI |
| Cost Efficiency | CE | Token usage, latency, model tier appropriateness | EQAITE Cost & Commercial |

## 2. Scoring Rubric (per dimension)

Each dimension scored 1-5:
- **5** (Excellent): No errors, SOTA quality
- **4** (Good): Minor issues, still acceptable for delivery
- **3** (Adequate): Some issues, needs minor revision
- **2** (Poor): Significant issues, requires major revision
- **1** (Unacceptable): Block delivery, must regenerate

## 3. Delivery Thresholds

| Threshold | Meaning | Action |
|-----------|---------|--------|
| PA ≥ 4 AND PS ≥ 5 | Pass | Auto-deliver |
| PA ≥ 3 AND PS ≥ 4 AND CR ≥ 3 | Pass with warning | Deliver + flag for review |
| PA < 3 OR PS < 4 | Block | Route to HITL |
| Any dimension = 1 | Critical block | Regenerate or escalate |

## 4. Implementation Reference

This framework maps to `shared_nodes/content_validator.py` in the target architecture.
The validator implements 3-layer evaluation:
1. Format compliance (Pydantic schema validation)
2. Accuracy & Faithfulness (LLM judge)
3. Pedagogical appropriateness (domain-specific evaluator)
