/**
 * UPG Property Schemas: AI & ML Domain.
 * AiModel, PromptTemplate, PromptVersion, EvalBenchmark, EvalRun,
 * AiCostTracker, HallucinationReport, AiGuardrail, ModelComparison,
 * AiExperiment, AiDataset, AiTrace.
 * Creation order: ai_model → prompt_template → prompt_version.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, ISODateTime, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// AI / ML OPERATIONS
// ---------------------------------------------------------------------------

/** AI model.
 *
 * @example
 * const properties: AiModelProperties = {
 *   model_provider: 'anthropic',
 *   model_id: 'claude-sonnet-4-6',
 *   model_version: '2026-04-01',
 * }
 */
export interface AiModelProperties {
  /** Provider or vendor */
  model_provider?: 'anthropic' | 'openai' | 'google' | 'meta' | 'mistral' | 'custom'
  /** Unique model identifier (e.g. "claude-sonnet-4-20250514") */
  model_id?: string
  /** Specific version */
  model_version?: string
  /** Intended use case */
  model_purpose?: string
  /** Maximum context window (tokens) */
  context_window?: number
  /** Median latency (p50, ms) */
  latency_p50_ms?: number
  /** Tail latency (p99, ms) */
  latency_p99_ms?: number
  /** Expected input format or schema */
  input_schema?: string
  /** Expected output format or schema */
  output_schema?: string
  /** Alternative names */
  aliases?: string[]
  /** Free-form classification tags */
  tags?: string[]
}

/** Prompt template.
 *
 * The canonical parent of `prompt_version`: a template contains its
 * versions the way a file contains its commits. Lives in the AI domain, owned
 * by the `ai_model` that defines it (ai_model → prompt_template → prompt_version).
 *
 * @example
 * const properties: PromptTemplateProperties = {
 *   use_case: 'Kick off a discovery sprint with a fresh persona set.',
 *   variables: ['user_name', 'workspace_slug', 'cta_url'],
 *   version: '0.3.1',
 * }
 */
export interface PromptTemplateProperties {
  /** Intended use case for the prompt */
  use_case?: string
  /** Variable names expected by the template */
  variables?: string[]
  /** Version identifier of the template */
  version?: string
}

/** Prompt version.
 *
 * @example
 * const properties: PromptVersionProperties = {
 *   version_number: '0.3.1',
 *   template: 'weekly-exec-review',
 *   system_prompt: 'You are a product-research copilot. Extract opportunities from the transcript below.',
 * }
 */
export interface PromptVersionProperties {
  /** Semantic version */
  version_number?: string
  /** Template body with variable placeholders */
  template?: string
  /** System prompt prepended to every call */
  system_prompt?: string
  /** Expected template variable names */
  variables?: string[]
  /** Sampling temperature (0 = deterministic, 1 = creative) */
  temperature?: number
  /** Max tokens to generate */
  max_tokens?: number
  /** Estimated input tokens per invocation */
  input_token_estimate?: number
  /** Aggregate quality score from evaluations */
  performance_score?: number
}

/** Evaluation benchmark.
 *
 * @example
 * const properties: EvalBenchmarkProperties = {
 *   benchmark_type: 'accuracy',
 *   test_case_count: 42,
 *   passing_threshold: 42,
 * }
 */
export interface EvalBenchmarkProperties {
  /**
   * Measured dimension.
   *
   * @remarks
   * Widened in 0.31.0 with the three dimensions an eval suite actually reports
   * and this set could not express: `precision_recall` (two numbers, not one
   * accuracy figure, and the pair is the point, because a detector that fires on
   * everything scores perfectly on recall alone), `task_success` (did the agent
   * achieve the goal), and `coherence` (rubric-graded, for multi-step runs).
   *
   * THIS ENUM IS A DIMENSION AXIS, AND IT SHOULD STAY ONE. An eval suite's
   * families are a SUBJECT axis (what is under test), and a dimension cannot
   * separate subjects, which is why several families legitimately share
   * `task_success`.
   *
   * The subject is expressed on the EDGE, not here: `eval_benchmark_measures_node`
   * names what a benchmark measures by pointing at it. So "which benchmarks cover
   * the importer" is a traversal, and this property stays a clean answer to a
   * different question, "what dimension does this benchmark report". The
   * commissioning brief hoped the enum would carry both; splitting them across the
   * enum and the edge is the better answer, and it needs no third mechanism.
   *
   * Corollary worth stating, since it is load-bearing: do NOT add subject-shaped
   * values here. `tool_use` or `documentation` would encode on this axis what the
   * edge already carries, and the two would drift the first time a benchmark
   * measured something its enum value did not admit.
   */
  benchmark_type?:
    | 'accuracy'
    | 'latency'
    | 'cost'
    | 'safety'
    | 'precision_recall'
    | 'task_success'
    | 'coherence'
    | 'custom'
  /** Test cases in the suite */
  test_case_count?: number
  /** Minimum passing score */
  passing_threshold?: number
  /** ISO date of the most recent run */
  last_run?: ISODate
}

/** One metric's score inside `EvalRunProperties.metric_scores`.
 *
 * Every field is required, including `sample_size`. A score without its
 * denominator is not a smaller measurement, it is not a measurement, and an
 * optional denominator is how a run quietly stops reporting one.
 *
 * @example
 * const scores: MetricScore[] = [
 *   { metric: 'precision', value: 0.94, sample_size: 250 },
 *   { metric: 'recall', value: 0.71, sample_size: 250 },
 * ]
 */
export interface MetricScore {
  /** What was measured, named as the metric names itself: `precision`, `recall`, `faithfulness`. */
  metric: string
  /**
   * The score, normalized to 0 through 1, where 1 is the best result.
   *
   * @remarks
   * Normalization is the contract rather than a suggestion, because comparing
   * runs is the whole reason this array exists and two runs on different raw
   * scales do not compare. A rating collected on 1 through 5 is divided before
   * it lands here, and the raw scale belongs in the metric name if a reader
   * needs it (`faithfulness_of_5`).
   *
   * Measurements that are not rates do not belong here at all. Wall-clock time,
   * token counts, and cost already have typed fields on `eval_run`, so a metric
   * that cannot be expressed as a rate is a sign the value wanted one of those.
   */
  value: number
  /**
   * How many cases the score was computed over.
   *
   * @remarks
   * Required so a comparison across runs can never quietly compare different
   * sample sizes. It is the one field an author is most tempted to omit and the
   * one whose absence is least visible afterwards: a precision of 0.94 reads the
   * same whether it was measured over 250 cases or 4.
   */
  sample_size: number
}

/** Evaluation run.
 *
 * @example
 * const properties: EvalRunProperties = {
 *   run_date: '2026-04-01',
 *   score: 42,
 *   passed: true,
 * }
 */
export interface EvalRunProperties {
  /** ISO date executed */
  run_date?: ISODate
  /** Aggregate score */
  score?: number
  /** Whether the passing threshold was met */
  passed?: boolean
  /** Wall-clock duration (ms) */
  duration_ms?: number
  /** Total tokens consumed */
  token_count?: number
  /** Input tokens */
  input_token_count?: number
  /** Output tokens */
  output_token_count?: number
  /** Total run cost */
  cost?: number
  /** Percentage of test cases that errored */
  error_rate?: number
  /** Feedback score summary (human or automated) */
  feedback_scores?: string
  /**
   * Per-metric scores, one entry per measured metric.
   *
   * @remarks
   * Added in 0.31.0 because `score` is a single aggregate and the forcing case
   * needs two numbers: precision and recall, reported separately. An aggregate
   * hides the only interesting failure mode, which is a detector that catches
   * everything by firing on everything.
   *
   * `sample_size` is not optional decoration, and as of 0.31.0 the type says so:
   * it is a REQUIRED member of `MetricScore`. A sampled run reports its sample
   * size beside its score, always, so a comparison across runs can never quietly
   * compare different sample sizes. A number without its denominator is not a
   * smaller measurement, it is not a measurement, and a remark saying `always`
   * over a field typed optional is a contract only the careful reader honours.
   *
   * The entry shape is the exported `MetricScore` interface rather than an
   * anonymous literal, so a consumer can name the thing it is building. This is
   * one of two `object[]` properties in the spec; the other, `composition.members`,
   * already exports `CompositionMember`.
   *
   * The rejected alternative was two runs per benchmark, which needs no spec
   * change and makes every question about a benchmark's quality a join, encoding
   * a measurement artifact as graph structure.
   */
  metric_scores?: MetricScore[]
}

/** AI cost tracker.
 *
 * @example
 * const properties: AiCostTrackerProperties = {
 *   period: '2026-Q2',
 *   total_cost: 42,
 *   total_requests: 42,
 * }
 */
export interface AiCostTrackerProperties {
  /** Tracked period (e.g. "2026-Q1", "2026-04") */
  period?: string
  /** Total spend across all models */
  total_cost?: number
  /** Total API requests */
  total_requests?: number
  /** Average cost per request */
  avg_cost_per_request?: number
  /** Total input tokens */
  input_tokens?: number
  /** Total output tokens */
  output_tokens?: number
  /** Cost breakdown by model (name → USD) */
  cost_by_model?: Record<string, number>
  /** Spend ceiling for the period */
  budget_limit?: number
  /** Alert threshold (spend percentage) */
  budget_alert_threshold?: number
}

/** Hallucination report.
 *
 * @example
 * const properties: HallucinationReportProperties = {
 *   report_type: 'factual',
 *   severity: 4,
 *   user_facing: true,
 * }
 */
export interface HallucinationReportProperties {
  /** Classification */
  report_type?: 'factual' | 'logical' | 'fabrication' | 'inconsistency'
  /** Impact severity (1 = trivial, 5 = dangerous misinformation) */
  severity?: UPGAssessment
  /** Visible to end users */
  user_facing?: boolean
  /** Remediation steps */
  remediation?: string
}

/** AI guardrail.
 *
 * @example
 * const properties: AiGuardrailProperties = {
 *   guardrail_type: 'content_filter',
 *   enforcement: 'block',
 *   trigger_count: 42,
 * }
 */
export interface AiGuardrailProperties {
  /** Protection category */
  guardrail_type?: 'content_filter' | 'rate_limit' | 'token_limit' | 'safety' | 'custom'
  /** Action when triggered */
  enforcement?: 'block' | 'warn' | 'log'
  /** Times triggered */
  trigger_count?: number
}

/** Model comparison.
 *
 * @example
 * const properties: ModelComparisonProperties = {
 *   comparison_criteria: ['pricing', 'integrations', 'time-to-value'],
 *   winner: 'variant-B',
 *   comparison_date: '2026-04-01',
 * }
 */
export interface ModelComparisonProperties {
  /** Comparison dimensions (e.g. "accuracy", "cost", "latency") */
  comparison_criteria?: string[]
  /** ISO conduct date */
  comparison_date?: ISODate
}

/** AI training or fine-tuning experiment.
 *
 * @example
 * const properties: AiExperimentProperties = {
 *   project: 'q2-activation-uplift',
 *   run_name: 'regression-nightly-2026-04-17',
 *   config: '{ retries: 3, timeout_ms: 15000 }',
 * }
 */
export interface AiExperimentProperties {
  /** Parent project or experiment group */
  project?: string
  /** Human-readable run name */
  run_name?: string
  /** Serialised hyperparameters and config */
  config?: string
  /** Key-metric summary */
  summary_metrics?: string
  /** ISO timestamp started */
  started_at?: ISODateTime
  /** ISO timestamp completed */
  completed_at?: ISODateTime
  /** Training steps or epochs completed */
  training_steps?: number
  /** Produced artifact URI */
  artifact_uri?: string
  /** Free-text notes */
  notes?: string
  /** Free-form classification tags */
  tags?: string[]
}

/** Versioned AI training or evaluation dataset.
 *
 * @example
 * const properties: AiDatasetProperties = {
 *   dataset_type: 'training',
 *   version: '0.3.1',
 *   record_count: 42,
 * }
 */
export interface AiDatasetProperties {
  /** Purpose */
  dataset_type?: 'training' | 'evaluation' | 'fine_tuning' | 'rlhf' | 'synthetic'
  /** Version */
  version?: string
  /** Records */
  record_count?: number
  /** Format (e.g. "jsonl", "csv", "parquet") */
  format?: string
  /** Storage URI */
  storage_uri?: string
  /** Integrity hash */
  checksum?: string
  /** Origin */
  provenance?: 'human_labelled' | 'synthetic' | 'scraped' | 'converted' | 'mixed'
  /** SPDX license identifier */
  license?: string
  /** Free-form classification tags */
  tags?: string[]
}

/** Single LLM call or chain execution trace.
 *
 * @example
 * const properties: AiTraceProperties = {
 *   inputs: ['conversation-transcript', 'existing-graph'],
 *   outputs: ['ranked-opportunities', 'supporting-evidence'],
 *   called_at: '2026-04-01T00:00:00Z',
 * }
 */
export interface AiTraceProperties {
  /** Serialised input */
  inputs?: string
  /** Serialised output */
  outputs?: string
  /** ISO timestamp called */
  called_at?: ISODateTime
  /** Round-trip latency (ms) */
  latency_ms?: number
  /** Input tokens */
  input_tokens?: number
  /** Output tokens */
  output_tokens?: number
  /** Monetary cost */
  cost?: number
  /** Error message on failure */
  error?: string
  /** HTTP or API status */
  status_code?: number
  /** Human or automated quality score */
  feedback_score?: number
  /** Free-form classification tags */
  tags?: string[]
}
