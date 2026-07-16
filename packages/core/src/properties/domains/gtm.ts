/**
 * UPG Property Schemas: Go-To-Market Domain.
 * GtmStrategy, IdealCustomerProfile, Positioning, Messaging, Launch,
 * ContentStrategy, SalesMotion, CompetitiveBattleCard, DemandGenProgram,
 * Territory, Objection, Rebuttal, ProofPoint.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, Duration, FrequencyRating, ISODate, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// GO-TO-MARKET LAYER
// ---------------------------------------------------------------------------

/** GtmStrategy entity.
 *
 * @example
 * const properties: GtmStrategyProperties = {
 *   primary_motion: 'product_led',
 *   launch_date: '2026-04-01',
 * }
 */
export interface GtmStrategyProperties {
  /** Primary go-to-market motion */
  primary_motion?: 'product_led' | 'sales_led' | 'channel'
  /** Planned launch date (ISO format) */
  launch_date?: ISODate
}

/** IdealCustomerProfile entity.
 *
 * @example
 * const properties: IdealCustomerProfileProperties = {
 *   company_size: '51-200',
 *   industry: 'Developer Tools',
 *   budget_range: '$50K – $150K ACV',
 * }
 */
export interface IdealCustomerProfileProperties {
  /** Target company size. Standard B2B segmentation buckets so ICPs across products are comparable. */
  company_size?:
    | '1-10'
    | '11-50'
    | '51-200'
    | '201-1000'
    | '1001-5000'
    | '5000+'
    | 'other'
  /** Target industry vertical */
  industry?: string
  /** Expected budget range for the solution */
  budget_range?: string
  /** Events that signal buying readiness */
  trigger_events?: string[]
  /** Technologies the ideal customer already uses */
  tools_used?: string[]
}

/** Positioning entity. Structural facts expressed via edges (P20 hub).
 *
 * Only the statement itself lives here (textual, no natural edge target).
 * Structured fields go via edges:
 *   Differentiator → `positioning_differentiates_via_value_proposition`
 *   Category → `positioning_within_market_segment`
 *   Competitors → `competitor` edges
 *   Tagline → `brand_identity.tagline`
 *
 * @example
 * const properties: PositioningProperties = {
 *   positioning_statement: 'For product leaders drowning in AI output, Entopo is the structured thinking space that turns scattered work into compound knowledge.',
 *   target_summary: 'Product-led B2B SaaS teams of 10–200 people.',
 * }
 */
export interface PositioningProperties {
  /**
   * Full positioning statement, typically in Geoffrey Moore's form:
   * "For {target audience} who {problem or need}, {product} is the {category}
   * that {unique benefit}. Unlike {competitor or alternative}, we {differentiator}."
   * Edges carry the structured atoms; this field preserves the rhetorical whole.
   */
  positioning_statement?: string
  /**
   * One-line audience summary. Shortcut when an edge to the full
   * `ideal_customer_profile` or `persona` isn't yet in place.
   * @example "Solo product creators drowning in AI-generated artefacts"
   */
  target_summary?: string
}

/** Messaging entity. Each instance is a channel/stage variant.
 *
 * @example
 * const properties: MessagingProperties = {
 *   channel: 'landing_page',
 *   funnel_stage: 'awareness',
 *   headline: 'Stop losing AI output in tabs.',
 * }
 */
export interface MessagingProperties {
  /** Channel this messaging variant is crafted for. `enablement` is the internal
   * field-ops channel (SE/PMM/SA enablement one-pagers, battlecards' narrative),
   * distinct from `pitch` (external, customer-facing). */
  channel?: 'landing_page' | 'email' | 'social' | 'ad' | 'pitch' | 'press' | 'in_product' | 'enablement' | 'other'
  /** Marketing funnel stage this variant targets */
  funnel_stage?: 'awareness' | 'consideration' | 'conversion' | 'retention'
  /** Primary headline or hook */
  headline?: string
  /** Full message body copy */
  body?: string
  /** Call-to-action text */
  call_to_action?: string
  /** Voice and tone for this variant (e.g. "conversational", "authoritative", "playful") */
  tone?: string
}

/** Launch entity.
 *
 * @example
 * const properties: LaunchProperties = {
 *   launch_type: 'soft',
 *   target_date: '2026-06-15',
 *   success_metrics: ['Week-one activation', 'Decisions committed per team'],
 * }
 */
export interface LaunchProperties {
  /** Scale and audience of the launch */
  launch_type?: 'soft' | 'beta' | 'public' | 'feature'
  /** Planned launch date (ISO format) */
  target_date?: ISODate
}

/** ContentStrategy entity.
 *
 * @example
 * const properties: ContentStrategyProperties = {
 *   funnel_stage: 'top_of_funnel',
 *   content_types: ['blog-post', 'case-study', 'tutorial'],
 *   distribution_channels: ['self-serve signup', 'sales-assisted', 'partner-resold'],
 * }
 */
export interface ContentStrategyProperties {
  /** Funnel stage this content targets */
  funnel_stage?: 'top_of_funnel' | 'middle_of_funnel' | 'bottom_of_funnel'
  /** Types of content to produce */
  content_types?: string[]
  /** Channels where content will be distributed */
  distribution_channels?: string[]
  /**
   * Publishing cadence (canonical `Cadence` since v0.4.0).
   * Retyped from the legacy free-form `cadence: string` (e.g. "2x/week"). For
   * exact rates, set `frequency_count` + `frequency_period`.
   *
   * BREAKING in v0.4.0: previous string values like `"2x/week"` no longer
   * type-check. Map to `'weekly'` + `frequency_count: 2` + `frequency_period: 'P7D'`.
   */
  cadence?: Cadence
  /** Exact count of publications in the period. Pairs with `frequency_period`. */
  frequency_count?: number
  /** Recurrence period (ISO-8601 `Duration`, e.g. `'P7D'`) */
  frequency_period?: Duration
  /** Qualitative rate tier when an exact rate is unknown */
  frequency_rating?: FrequencyRating
}

/** SalesMotion entity.
 *
 * @example
 * const properties: SalesMotionProperties = {
 *   motion_type: 'self_serve',
 *   qualification_criteria: 'Team of 5+ product people; uses at least two AI tools weekly.',
 *   avg_deal_cycle: 'P30D',
 * }
 */
export interface SalesMotionProperties {
  /** Level of human involvement in the sales process */
  motion_type?: 'self_serve' | 'assisted' | 'enterprise'
  /** Narrative qualification rule: which funnel steps and conditions define 'qualified'. */
  qualification_criteria?: string
  /**
   * Average time from first touch to closed deal. ISO-8601 duration
   * (e.g. `'P30D'`, `'P3M'`). Typed as `Duration` so units survive round-trip.
   */
  avg_deal_cycle?: Duration
}

/** Objection entity.
 *
 * @example
 * const properties: ObjectionProperties = {
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 *   source_type: 'prospect',
 *   severity: 4,
 * }
 */
export interface ObjectionProperties {
  /** The objection as stated by the source */
  statement?: string
  /** Where this objection originated */
  source_type?: 'prospect' | 'competitor' | 'internal' | 'market'
  /** How frequently or strongly this objection comes up (1-5) */
  severity?: UPGAssessment
  /** Whether this objection has been addressed */
  resolution?: 'open' | 'addressed' | 'invalidated'
}

/** Rebuttal entity.
 *
 * @example
 * const properties: RebuttalProperties = {
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 *   strength: 4,
 *   evidence_refs: ['interview_007', 'interview_011'],
 * }
 */
export interface RebuttalProperties {
  /** The counter-argument or response to an objection */
  statement?: string
  /** How convincing this rebuttal is (1-5) */
  strength?: UPGAssessment
  /** References to supporting evidence (e.g. interview or observation ids). */
  evidence_refs?: string[]
}

/** ProofPoint entity.
 *
 * @example
 * const properties: ProofPointProperties = {
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 *   evidence_type: 'case_study',
 *   source: 'Onboarding interview series, Q1 2026',
 * }
 */
export interface ProofPointProperties {
  /** The claim or evidence statement */
  statement?: string
  /** Kind of evidence this proof point represents */
  evidence_type?: 'case_study' | 'statistic' | 'testimonial' | 'certification' | 'award'
  /** Origin of the evidence (e.g. customer name, study URL) */
  source?: string
}

/** CompetitiveBattleCard entity.
 *
 * @example
 * const properties: CompetitiveBattleCardProperties = {
 *   win_rate: 42,
 *   key_differentiators: 'Structured thinking primitives; open interchange format; works in your editor.',
 * }
 */
export interface CompetitiveBattleCardProperties {
  /** Historical win rate against this competitor (0-100%) */
  win_rate?: number
  /** Summary of key differentiators versus this competitor */
  key_differentiators?: string
}

/** DemandGenProgram entity.
 *
 * @example
 * const properties: DemandGenProgramProperties = {
 *   program_type: 'beta',
 *   budget: 50000,
 *   target_leads: 42,
 * }
 */
export interface DemandGenProgramProperties {
  /**
   * Closed-set classification so demand-gen mix can be reported on a stable axis.
   * Use `'other'` for novel program shapes; raise a spec proposal if `'other'` recurs.
   */
  program_type?:
    | 'webinar'
    | 'content_syndication'
    | 'event'
    | 'paid_media'
    | 'aba'
    | 'beta'
    | 'other'
  /** Allocated budget for this program */
  budget?: number
  /** Target number of leads to generate */
  target_leads?: number
  /** Current operational status of the program */
}

/** Territory entity.
 *
 * @example
 * const properties: TerritoryProperties = {
 *   territory_type: 'geographic',
 *   region: 'eu-west-1',
 *   quota: 42,
 * }
 */
export interface TerritoryProperties {
  /** How the territory is defined */
  territory_type?: 'geographic' | 'vertical' | 'account_based' | 'named'
  /** Geographic region or market covered */
  region?: string
  /** Revenue quota for this territory */
  quota?: number
}
