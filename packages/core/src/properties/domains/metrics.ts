/**
 * UPG Property Schemas: Metrics. Unified measurement across the product.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, ISODateTime } from '../primitives.js'

// ─── Metric scalar types ─────────────────────────────────────────────────────

/** Role a metric plays in the measurement system */
export type MetricDesignation = 'north_star' | 'kpi' | 'driver' | 'input' | 'guardrail' | 'proxy' | 'health' | 'vanity' | 'metric'

/** Aggregation function applied to raw data */
export type MetricStatisticalFunction = 'average' | 'total' | 'count' | 'median' | 'rate' | 'ratio' | 'percentage' | 'score' | 'min' | 'max' | 'p95' | 'p99' | 'growth_rate' | 'conversion_rate' | 'retention_rate' | 'churn_rate' | 'custom'

/** Where a metric sits in the impact hierarchy */
export type MetricImpactLevel = 'impact' | 'outcome' | 'output'

/** Whether a metric leads or lags the behaviour it measures */
export type MetricIndicatorDirection = 'leading' | 'lagging'

/** AARRR or HEART category */
export type MetricCategory = 'acquisition' | 'activation' | 'retention' | 'referral' | 'revenue' | 'engagement' | 'happiness' | 'task_success' | 'adoption' | 'other'

/**
 * How often a metric is measured or updated.
 *
 * @deprecated since v0.4.0. Removed in v0.5.0. Replaced by the spec-wide
 * `Cadence` primitive. `'realtime'` maps to `'continuous'`; all other values
 * map 1:1. Authors should set `MetricProperties.cadence` (typed `Cadence`) on
 * new graphs.
 */

/**
 * Universal metric health rollup. Applies to every metric regardless of
 * `designation`. Orthogonal to lifecycle (metric has no `UPGBaseNode.status`)
 * and to `GuardrailStatus` (which stays breach-specific for guardrails).
 *
 * Renderers read `metric_health` for the lifecycle-dot signal across all
 * metric types; `guardrail_status` remains an overlay for guardrails.
 */
export type MetricHealth = 'healthy' | 'at_risk' | 'unhealthy' | 'unknown'

/** Current guardrail health state. Breach-specific; meaningful when
 *  `designation === 'guardrail'`. For a universal health signal across all
 *  metric types, see `MetricHealth`. */
export type GuardrailStatus = 'safe' | 'warning' | 'breached'

/** Type of audience or group a metric segment represents */
export type MetricSegmentType = 'persona' | 'cohort' | 'channel' | 'geography' | 'device' | 'plan' | 'custom'

/** Why a metric is used as a proxy */
export type ProxyReason = 'qualitative' | 'no_direct_measure' | 'not_yet_instrumented' | 'too_expensive'

/**
 * How strongly a proxy metric predicts the direct measure. Pairs with
 * `UPG_ENUM_SCALES.ProxyConfidence` for per-value labels and descriptions.
 */
export type ProxyConfidence = 'strong' | 'moderate' | 'weak'

// ─── Metric data point ──────────────────────────────────────────────────────

/** A time-series reading for a metric. One data point in the metric's history. */
export interface MetricDataPoint {
  /** Unique data point identifier */
  id: string
  /** The recorded metric value */
  value: number
  /** Optional annotation for this reading */
  note?: string
  /** When the measurement was taken (ISO 8601) */
  recorded_at: ISODateTime
  /** When this record was created (ISO 8601) */
  created_at: ISODateTime
}

// ─── MetricProperties ───────────────────────────────────────────────────────

/** Unified metric. Measures progress, health, or behaviour across the product.
 *
 * @example
 * const properties: MetricProperties = {
 *   designation: 'guardrail',
 *   action: 'Send welcome email',
 *   unit_of_analysis: 'unit of analysis',
 * }
 *
 * Structural refs go via edges (v0.4.0):
 *   guards which metric → `metric_guards_metric` (replaces deprecated `guardrail_for` property)
 */
export interface MetricProperties {
  // ── Identity ──
  /** Role this metric plays in the measurement system */
  designation?: MetricDesignation

  // ── Definition ──
  /** The action or behaviour this metric measures (e.g. "users who activated within 7 days") */
  action?: string
  /** The unit being counted or measured (e.g. "users", "sessions", "£") */
  unit_of_analysis?: string
  /** Aggregation function applied to raw data */
  statistical_function?: MetricStatisticalFunction
  /** Calculation formula or expression */
  formula?: string
  /** Where this metric sits in the impact hierarchy */
  impact_level?: MetricImpactLevel
  /** Whether this metric leads or lags the behaviour it measures */
  indicator_direction?: MetricIndicatorDirection
  /** AARRR or HEART category this metric belongs to */
  metric_category?: MetricCategory

  // ── Current state ──
  /** Most recent observed value */
  current_value?: number
  /** Value we are aiming to reach */
  target_value?: number
  /** Display unit for the metric value (e.g. "%", "ms", "£") */
  unit?: string
  /** Minimum expected or baseline value */
  range_min?: number
  /** Maximum expected or ceiling value */
  range_max?: number

  // ── Measurement ──
  /**
   * Measurement cadence. Canonical `Cadence` since v0.4.0.
   * `'realtime'` migrates to `'continuous'`; all other values 1:1.
   */
  cadence?: Cadence
  /** Person or team responsible for tracking this metric */
  owner?: string

  // ── Health ──
  /**
   * Universal health rollup. Orthogonal to lifecycle and `guardrail_status`.
   * Applies to every metric regardless of `designation`.
   *   `healthy` = trending well against target / inside safe range.
   *   `at_risk` = drifting, approaching breach or target shortfall.
   *   `unhealthy` = missed target or breached; action needed.
   *   `unknown` = no current reading or not yet measured.
   *
   * For guardrails specifically, `guardrail_status` remains the
   * breach-specific signal (`safe`/`warning`/`breached`).
   */
  metric_health?: MetricHealth

  // ── Guardrails ──
  /** Lower bound for guardrail safety (below this = breach) */
  guardrail_threshold_min?: number
  /** Upper bound for guardrail safety (above this = breach) */
  guardrail_threshold_max?: number
  /** Current guardrail health state */
  guardrail_status?: GuardrailStatus
}

// ─── MetricQualityAssessmentProperties ─────────────────────────────

/**
 * A point-in-time review of a metric's quality and fitness for purpose.
 *
 * Quality assessments are made BY someone, AT a moment in time. Splitting
 * them out of `metric` cleanly separates "what the metric is" (intrinsic
 * definition) from "how good a measurement we currently think it is"
 * (assessment). A single metric can carry multiple assessments over its
 * lifetime, one per review.
 *
 * Linked to its target metric via the `metric_assessed_by_metric_quality_assessment`
 * edge.
 *
 * @example
 * const properties: MetricQualityAssessmentProperties = {
 *   assessed_at: '2026-04-27T10:00:00Z',
 *   assessor: 'product-team',
 *   quality_correlated: true,
 *   quality_actionable: true,
 *   quality_score: 4,
 * }
 */
export interface MetricQualityAssessmentProperties {
  // ── Provenance ──
  /** ISO 8601 timestamp of when this assessment was made */
  assessed_at?: ISODateTime
  /** Free-text assessor label (person, team, or role) */
  assessor?: string

  // ── Quality signals ──
  /** Quality signal: metric correlates with outcomes we care about */
  quality_correlated?: boolean
  /** Quality signal: team can take action based on this metric */
  quality_actionable?: boolean
  /** Quality signal: metric changes when behaviour changes */
  quality_sensitive?: boolean
  /** Quality signal: metric can be compared across cohorts or time */
  quality_comparative?: boolean
  /** Quality signal: metric relates to other key metrics in the system */
  quality_related?: boolean
  /** Computed quality score across all quality signals (0–5) */
  quality_score?: number

  // ── Proxy review ──
  /** Why this metric is used as a proxy instead of measuring directly */
  proxy_reason?: ProxyReason
  /** How strongly this metric predicts the direct measure */
  proxy_confidence?: ProxyConfidence
}
