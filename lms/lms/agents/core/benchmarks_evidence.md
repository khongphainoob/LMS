# Architecture Benchmarks & Empirical Evidence

## A. GraphRAG vs RAG — Empirical Comparison

### Source Studies

| Study | Venue | Dataset | Key Metric |
|-------|-------|---------|------------|
| CMU Math Textbook QA | arXiv:2509.16780 | 477 QA pairs (undergrad math) | Retrieval Accuracy, F1 |
| KA-RAG | MDPI Applied Sciences 15(23) | 50 Pattern Recognition questions | Accuracy |
| Unbiased Eval Framework | VLDB 2025 | 3 datasets | Win Rate (bias-corrected) |
| RAG vs GraphRAG Systematic | MSU/Meta 2025 | MultiHop-RAG, 4 benchmarks | Accuracy, F1 |

### Concrete Numbers

| Comparison | Improvement | Caveat |
|------------|-------------|--------|
| KA-RAG (KG + Agentic RAG) over Basic RAG | +4.4pp (87%→91.4%) | Education domain, small dataset |
| Integration RAG+GraphRAG over best single | +6.4pp | MultiHop-RAG with Llama-3.1-70B |
| Vanilla RAG over GraphRAG (page-level) | +6.9pp (99.4% vs 91.4%) | Detail-oriented queries |
| GraphRAG over closed-book baseline | +10.5% F1 | Math textbook QA |
| Bias-corrected GraphRAG gains | <8% | After correcting position/length/trial bias |
| GraphRAG token cost vs RAG | 10-50× more | Major trade-off |

### Decision Rule
- Single-hop factual retrieval → use Vector RAG
- Multi-hop reasoning/synthesis → use GraphRAG
- Education QA → use Hybrid (RAG first, GraphRAG enrichment)

---

## B. LLM-as-a-Judge — Evaluation Benchmarks

### Source Studies

| Study | Venue | Dataset | Key Metric |
|-------|-------|---------|------------|
| JudgeBench | ICLR 2025 | 350 response pairs (MMLU-Pro, LiveBench, LiveCodeBench) | Accuracy |
| ContextualJudgeBench | ACL 2025 | 2,000 pairs (RAG/Summarization) | Consistent Accuracy |
| RISE-Judge | EMNLP 2025 | RewardBench | SOTA training method |
| Judging the Judges | GEM@ACL 2025 | TriviaQA, 13 judges × 9 models | Scott's π |

### Judge Model Accuracy

| Model | JudgeBench | Notes |
|-------|------------|-------|
| o3-mini (high) | 80.86% | Best evaluator |
| Claude-3.5-Sonnet | 64.29% | Best general-purpose |
| GPT-4o | ~57% | Barely beats random |
| o1 (ContextualJudgeBench) | 55.3% | Contextual tasks are harder |
| Fine-tuned DeBERTa | Comparable to GPT-4 in-domain | Overfits to training data |

### Ablation Findings
- Judge ability ≈ solver ability (correlated)
- Self-generated pairs are HARDEST for the generator (self-bias)
- Inference-time scaling (self-consistency, juries) → minimal gains
- Scott's π recommended over percent agreement
- Question-specific rubrics improve ICC from 0.560→0.819

---

## C. Multi-Agent Hallucination Prevention — Validation Gates

### Source Studies

| Study | Domain | Hallucination Reduction | Validation Mechanism |
|-------|--------|------------------------|---------------------|
| Darwish et al. (2025) Info 16(7) | Call transcripts (3,680 chunks) | 85.5% (32.6→4.7%) | Consultant-Evaluator loop, rule-based similarity |
| Wang & Katsaggelos (2025) | STEM MCQs | >90% | 4-dimensional scoring + iterative Generator-Detector |
| Yan et al. (2026) LASEV | Educational videos (20M+) | 96% publishable rate | Semantic+Tool+Rule critique gates |
| Yao et al. (2025) | Course materials | +0.5–0.9 quality pts | QM Rubric + Program Chair agent review |
| Gosmar & Dahl (2025) OVON | 310 hallucination prompts | ~2,800% THS improvement | 4-KPI scoring by 4th agent layer |

### Common Pattern
1. Generator produces output
2. Detector/Evaluator scores on multiple dimensions
3. If score < threshold → feedback loop → regenerate
4. Max iterations enforced (usually 2-3)
5. Statistical significance verified (95% CIs, ANOVA)

---

## D. Circuit Breaker & Retry — Production Patterns

### Source Studies

| Source | Key Recommendation | Value |
|--------|-------------------|-------|
| Cordum (2026) | 3 failures → open 30s, Redis-backed state | Fail-fast for safety |
| Salesforce Agentforce | 40% error rate → route to alternative | Provider failover |
| Maxim/Bifrost | Retries + fallbacks as gateway features | 90% failure reduction |
| Hendricks (2025) | Quality-aware thresholds beyond HTTP codes | Semantic degradation detection |

### Configuration Consensus

| Parameter | Default | Notes |
|-----------|---------|-------|
| Error threshold | 50% over 30s or 100 calls | Adapt for LLM latency |
| Cooldown | 30s + jitter | Exponential backoff |
| Max retries | 3-5 | Inside circuit breaker |
| Timeout | 15-60s per call | Tiered by task complexity |
| Scope | Per (provider, model, region) | Never global |
| Fallback chain | Primary→Alternative→Cheaper→Cached→Rule-based | Graceful degradation |

---

## E. Human-in-the-Loop (HITL) — Quality Impact

| Study | Finding | Effect Size |
|-------|---------|-------------|
| Springer EIT 2025 (n=60) | GenAI explanations improve feedback quality | β=0.190, p=0.010 |
| GradeHITL (2025) | Adaptive rubric refinement surpasses fully automated | Significant (ASAG) |
| Frontiers Edu 2025 (76 studies) | Tools ready; teacher training is bottleneck | Systematic review |
| ERVET 2025 (n=103) | AI feedback matched/surpassed human on several dimensions | Longitudinal intervention |

**Key Insight**: HITL is not about reducing workload — it shifts labor from production to oversight, audit, and documentation. Tools alone without training produce zero improvement in AI literacy.

---

## F. TOMOSA-Specific Scorecard (Before/After)

| Metric | Current | After Phase 3 | Evidence Basis |
|--------|---------|---------------|----------------|
| Agents with validation gates | 1/6 (grading reviewer) | 6/6 (all content-producing) | Darwish 85.5% reduction |
| Pre-delivery quality scoring | None | 7-dimension rubric per output | TEACH-AI, G-AIETM |
| Circuit breaker protection | None | Per-model CB + retry + fallback | 90% failure reduction |
| GraphRAG integration | Hardcoded standards | Hybrid RAG+GraphRAG | +4.4-6.4pp accuracy |
| HITL coverage | 2/6 agents | 6/6 agents (confidence-gated) | GradeHITL, Springer EIT |
| State consistency | 6 isolated TypedDicts | BaseAgentState inheritance | AWS Zero Trust pattern |
| Token cost per query | Unbounded | Budget-gated + tier selection | EQAITE Cost framework |
