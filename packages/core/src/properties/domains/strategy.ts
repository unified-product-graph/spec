/**
 * UPG Property Schemas: Strategy Domain.
 * Product (root), Vision, Mission, StrategicTheme, Initiative, Capability,
 * ValueStream, StrategicPillar, Assumption, Decision, Constraint.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { HealthStatus, ISODate, ISODateTime, MaturityLevel, RuleStrength, UPGAssessment } from '../primitives.js'
import type { UPGProductStage } from '../../shapes/document.js'

// ---------------------------------------------------------------------------
// PRODUCT ROOT
// ---------------------------------------------------------------------------

/** The product being created. Root of the graph.
 *
 * Identity and lifecycle only. Users, features, business model, metrics live
 * in child entities and edges.
 *
 * @example
 * const properties: ProductProperties = {
 *   stage: 'beta',
 *   health_status: 'on_track',
 *   url: 'https://entopo.app',
 * }
 */
export interface ProductProperties {
  /** Lifecycle stage */
  stage?: UPGProductStage
  /** Overall health */
  health_status?: HealthStatus
  /** Where the product lives. Marketing site, app store URL, etc. */
  url?: string
  /** Logo or icon URL. Used to render product cards and lists. */
  logo_url?: string
  /** When the product became generally available (ISO 8601) */
  launched_at?: ISODateTime
}

// ---------------------------------------------------------------------------
// STRATEGIC EXPANSION
// ---------------------------------------------------------------------------

/** Vision entity.
 *
 * @example
 * const properties: VisionProperties = {
 *   timeframe: '12-18 months',
 *   north_star: 'Active weekly graph-edits per product team',
 *   success_looks_like: 'success looks like',
 * }
 */
export interface VisionProperties {
  /**
   * Target timeframe.
   * @example "3 years"
   */
  timeframe?: string
  /**
   * The north-star statement — a prose slogan of the future the product steers
   * toward. Legitimately free-text (graph-vs-prose). To link the *metric* a
   * vision optimises for, use the `vision_anchored_by_metric` edge (P14 0.12.0).
   */
  north_star?: string
  /** Narrative of what success looks like */
  success_looks_like?: string
}

/** Mission entity.
 *
 * @example
 * const properties: MissionProperties = {
 *   target_audience: 'Product managers and founders at 10–200-person B2B SaaS companies.',
 *   core_value: 'Clarity beats velocity: decisions you can justify compound faster than code.',
 *   differentiation: 'Open interchange format + works where you already think.',
 * }
 */
export interface MissionProperties {
  /** Who the mission serves */
  target_audience: string
  /** Core value proposition */
  core_value: string
  /** Differentiation from alternatives */
  differentiation?: string
}

/** StrategicTheme entity.
 *
 * @example
 * const properties: StrategicThemeProperties = {
 *   owner: 'sam.patel@arkheiev.com',
 *   time_horizon: 'Q2 2026',
 *   description: 'Short narrative describing the entity and why it exists.',
 * }
 */
export interface StrategicThemeProperties {
  /** Owning person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /**
   * Planning horizon.
   * @example "Q1 2026", "FY26"
   */
  time_horizon?: string
  /** Short narrative of what the theme is about */
  description?: string
  /** What the theme explicitly includes or excludes */
  scope?: string
}

/** Initiative entity.
 *
 * @example
 * const properties: InitiativeProperties = {
 *   start_date: '2026-04-01',
 *   end_date: '2026-09-30',
 *   budget: 50000,
 * }
 */
export interface InitiativeProperties {
  /**
   * ISO start date.
   * @example "2026-04-01"
   */
  start_date?: ISODate
  /**
   * ISO end date.
   * @example "2026-09-30"
   */
  end_date?: ISODate
  /** Budget allocated (base currency units) */
  budget?: number
  /** Owning person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Capability entity.
 *
 * @example
 * const properties: CapabilityProperties = {
 *   maturity_level: 'initial',
 *   target_maturity: 'initial',
 *   gap: 'No lifecycle coverage for external-api nodes.',
 *   evolution_stage: 'product',
 *   visibility: 0.8,
 * }
 */
export interface CapabilityProperties {
  /** Current maturity */
  maturity_level?: MaturityLevel
  /** Target maturity */
  target_maturity?: MaturityLevel
  /** Gap between current and target */
  gap?: string
  /**
   * Wardley evolution axis: where this capability sits on the
   * genesis → custom → product → commodity spectrum. Used by frameworks
   * like `wardley-map`; generally useful as a maturity-of-the-domain signal
   * independent of `maturity_level` (which measures the team's internal
   * capability practice).
   *
   * @example 'product'
   */
  evolution_stage?: 'genesis' | 'custom' | 'product' | 'commodity'
  /**
   * Position on the visibility axis from `0.0` (deepest dependency, infra
   * the user never sees) to `1.0` (user-visible anchor). Used by
   * `wardley-map` for the y-axis position of each capability in the
   * value chain.
   *
   * @example 0.8
   */
  visibility?: number
}

/** ValueStream entity.
 *
 * @example
 * const properties: ValueStreamProperties = {
 *   stream_stage: 'growth',
 *   lead_time: '14d',
 *   throughput: '250 req/s at p95 60ms',
 * }
 */
export interface ValueStreamProperties {
  /** Current stage in the value delivery pipeline ( Option B). */
  stream_stage?: 'discovery' | 'definition' | 'build' | 'delivery' | 'operation' | 'other'
  /**
   * End-to-end lead time.
   * @example "2 weeks"
   */
  lead_time?: string
  /**
   * Throughput measure.
   * @example "5 features/sprint"
   */
  throughput?: string
}

/** StrategicPillar entity. Durable multi-year direction the product commits to.
 * Pillars frame what themes hang under and what initiatives serve.
 *
 * @example
 * const properties: StrategicPillarProperties = {
 *   owner: 'sam.patel@arkheiev.com',
 *   description: 'Short narrative describing the entity and why it exists.',
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 * }
 */
export interface StrategicPillarProperties {
  /** Owning person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /** Narrative of the pillar's intent */
  description?: string
  /** What this pillar covers */
  scope?: string
  /**
   * Planning horizon. Typically multi-year.
   * @example "3 years", "2026-2028"
   */
  time_horizon?: string
  /** How the business knows the pillar is on track. Narrative, not a metric edge. */
  success_indicator?: string
}

/** Assumption entity.
 *
 * @example
 * const properties: AssumptionProperties = {
 *   confidence: 'medium',
 *   validation_method: 'Prototype + 5 task-based interviews',
 *   risk_level: 4,
 * }
 */
export interface AssumptionProperties {
  /** Confidence before testing (UPGAssessment on `confidence_5`). Independent of whether the assumption is validated (tracked in lifecycle). */
  confidence?: UPGAssessment
  /** Validation method, planned or used */
  validation_method?: string
  /** Exposure if the assumption turns out wrong */
  risk_level?: UPGAssessment
  /** Observation that would prove this assumption false */
  falsifiability?: string
}

/** Decision record. Strategic, product, engineering, or design.
 *
 * @example
 * const properties: DecisionProperties = {
 *   layer: 'strategic',
 *   options_considered: ['buy SaaS', 'build in-house', 'extend open-source'],
 *   context: 'Leads a 12-person product team at a mid-size B2B SaaS (50–200 employees).',
 * }
 */
export interface DecisionProperties {
  /**
   * Domain layer.
   * `engineering` = Architecture Decision Record (ADR).
   * `design` = Design Decision Record.
   * The layer field replaces separate `architecture_decision` and `design_decision` types.
   */
  layer: 'strategic' | 'product' | 'engineering' | 'design' | 'business' | 'other'
  /** Background and problem statement that prompted the decision */
  context?: string
  /** Required. Evaluated alternatives. A decision without considered alternatives is incomplete. */
  options_considered: string[]
  /** Why the chosen option was selected over the alternatives */
  rationale?: string
  /** ISO date the decision was made or last meaningfully updated. */
  date?: string
  /** Outcome text. What was decided. Separate from `rationale` (which explains why). */
  decision_outcome?: string
  /** Known positive and negative consequences. Mirrors MADR's "Consequences" section. */
  consequences?: string
  /** People who made the decision. Mirrors MADR's "Deciders" field. Promote to `node_owned_by_person` edges (one per name) if ownership must be queryable. */
  decision_makers?: string[]
  /**
   * Forces, constraints, and goals that shaped the decision. Mirrors MADR's
   * "Decision Drivers" section.
   * @example ["must work offline", "team has no Go expertise", "cost < $500/mo"]
   */
  decision_drivers?: string[]
}

// ---------------------------------------------------------------------------
// CONSTRAINT
// ---------------------------------------------------------------------------

/**
 * Kind of constraint. Category of limitation.
 * Aligns with Theory of Constraints / Wardley value-chain framings.
 *   `resource` = budget, headcount, or capacity bound.
 *   `technical` = platform ceiling, performance, architecture bound.
 *   `regulatory` = law or jurisdictional rule (GDPR, CCPA, regional).
 *   `temporal` = deadline, time-window, sequencing dependency.
 *   `compliance` = contractual or audit-framework requirement.
 *   `other` = falls outside the above; describe via `source`.
 */
export type ConstraintKind = 'resource' | 'technical' | 'regulatory' | 'temporal' | 'compliance' | 'other'

/**
 * Whether a constraint is currently binding.
 *   `binding` = actively limiting; cannot be exceeded today.
 *   `advisory` = recommended boundary; can be deliberately accepted.
 *   `lifted` = no longer in effect (kept for historical record).
 */
export type ConstraintStatus = 'binding' | 'advisory' | 'lifted'

/**
 * Where a constraint comes from (0.17.2). The provenance axis, orthogonal to
 * `constraint_kind` (category), `constraint_status` (in-effect state), and
 * `rule_strength` (enforcement strictness).
 *   `internal` = self-imposed: a principle or operating tenet the team commits to
 *     (e.g. "ship weekly", "no feature without a metric"). The home for the
 *     qualitative guardrails `constraint` models in place of a separate principle
 *     type.
 *   `external` = imposed on us: a limit, requirement, or ceiling coming from
 *     outside (a regulation, a budget cap, a platform bound, a contractual rule).
 */
export type ConstraintOrigin = 'internal' | 'external'

/**
 * Constraint: a named limitation or boundary on product creation.
 *
 * **Edge-defined**: semantic identity comes from what it constrains
 * (feature, initiative, metric, team) via `constraint_constrains_*` and
 * `constraint_owned_by_*` edges. Properties here are intentionally thin.
 *
 * Reuses `RuleStrength` (see `primitives.ts`) so constraint-enforcement
 * vocabulary matches the broader rule/governance system.
 *
 * @example
 * const properties: ConstraintProperties = {
 *   constraint_kind: 'regulatory',
 *   constraint_status: 'binding',
 *   rule_strength: 'must',
 *   source: 'EU AI Act Article 6',
 *   review_date: '2026-12-01T00:00:00Z',
 * }
 */
export interface ConstraintProperties {
  /** Limitation category */
  constraint_kind?: ConstraintKind
  /** Provenance: a self-imposed tenet (`internal`) or an imposed-on-us limit/requirement (`external`). */
  constraint_origin?: ConstraintOrigin
  /** Whether binding, advisory, or lifted */
  constraint_status?: ConstraintStatus
  /** Enforcement strictness. Reuses the governance/guideline rule vocabulary. */
  rule_strength?: RuleStrength
  /** Free-text origin: policy document, regulation, stakeholder, technical doc. */
  source?: string
  /** Re-evaluation date (ISO-8601). Useful for regulatory or temporal constraints with sunset clauses. */
  review_date?: ISODateTime
}
