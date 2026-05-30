/**
 * UPG Property Schemas: Business Model Domain.
 * BusinessModel, ValueProposition, RevenueStream, PricingTier, CostStructure,
 * UnitEconomics, Partnership, KeyResource, KeyActivity, TargetCustomerSegment,
 * CustomerRelationship, DistributionChannel.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, Duration, FrequencyRating, ISODate, Priority, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// BUSINESS MODEL LAYER
// ---------------------------------------------------------------------------

/** BusinessModel: root of a BMC-style model.
 *
 * Structural atoms (segments, channels, propositions) live in child entities
 * connected via edges. This entity holds the top-level framing.
 *
 * @example
 * const properties: BusinessModelProperties = {
 *   framework_id: 'lean-canvas',
 *   stage: 'draft',
 *   pattern: 'saas',
 * }
 */
export interface BusinessModelProperties {
  /** Framework ID (references `UPGFramework.id`) */
  framework_id?: string
  /** Maturity */
  stage?: 'draft' | 'validated' | 'active'
  /** Canonical pattern. Useful for benchmarking against peer businesses with the same shape. */
  pattern?: 'freemium' | 'marketplace' | 'saas' | 'subscription' | 'transactional' | 'advertising' | 'licensing' | 'hybrid'
  /** Primary monetisation unit */
  monetisation_basis?: 'usage' | 'seat' | 'outcome' | 'transaction' | 'flat'
  /** The single metric the business optimises for */
  north_star_metric?: string
}

/** ValueProposition. Most relationships expressed as edges.
 *
 * @example
 * const properties: ValuePropositionProperties = {
 *   validation_state: 'hypothesis',
 *   offering_type: 'product',
 *   unique_selling_point: 'integration',
 * }
 *
 * Structural refs go via edges (v0.4.0):
 *   jobs addressed → `value_proposition_addresses_job`
 *   pains relieved → `value_proposition_solves_need` (a pain is a `need` with valence='pain')
 *   gains created → `value_proposition_delivers_outcome`
 */
export interface ValuePropositionProperties {
  /**
   * Validation maturity. Where it sits on the "is this real?" journey.
   * Renamed from `confidence` because these values describe validation state,
   * not subjective confidence. Use `Confidence` or `UPGAssessment` from primitives
   * for per-rater confidence.
   */
  validation_state?: 'hypothesis' | 'tested' | 'validated'
  /** Offering shape */
  offering_type?: 'product' | 'service' | 'platform' | 'experience' | 'hybrid'
  /**
   * Differentiation axis. Closed set so dashboards group propositions by
   * differentiation strategy. For the narrative form, use `unique_selling_point_statement`.
   */
  unique_selling_point?:
    | 'category_definition'
    | 'price'
    | 'speed'
    | 'quality'
    | 'integration'
    | 'experience'
    | 'other'
  /**
   * Narrative differentiator copy. Pairs with `unique_selling_point` for
   * messaging when the team needs the rhetorical sentence.
   */
  unique_selling_point_statement?: string
}

/** RevenueStream.
 *
 * @example
 * const properties: RevenueStreamProperties = {
 *   stream_type: 'subscription',
 *   recurring_revenue: 42,
 *   billing_model: 'subscription',
 * }
 */
export interface RevenueStreamProperties {
  /** How revenue is generated */
  stream_type?: 'subscription' | 'transaction' | 'licensing' | 'advertising' | 'freemium' | 'other'
  /** Monthly or annual recurring revenue from this stream */
  recurring_revenue?: number
  /** Billing mechanics. May differ from `stream_type`. */
  billing_model?: 'subscription' | 'usage' | 'one_time' | 'tiered' | 'freemium' | 'other'
  /** Accounting basis for revenue recognition */
  recognition_basis?: 'accrual' | 'cash' | 'deferred'
  /** Share of total ARR contributed (0–100) */
  arr_contribution_pct?: number
  /** Free-text forecast or projection */
  forecast?: string
}

/** PricingTier: the central pricing concept (the plan a customer buys).
 *
 * @example
 * const properties: PricingTierProperties = {
 *   price: 49,
 *   billing_period: 'monthly',
 *   currency: 'USD',
 * }
 */
export interface PricingTierProperties {
  /** Price per billing period */
  price?: number
  /** Billing cadence */
  billing_period?: 'monthly' | 'yearly' | 'one_time'
  /** ISO 4217 currency (e.g. "USD", "EUR") */
  currency?: string
  /** Display ordering (1 = first tier shown) */
  tier_order?: number
  /** Highlighted as recommended / most popular */
  is_highlighted?: boolean
}

/** CostStructure.
 *
 * @example
 * const properties: CostStructureProperties = {
 *   cost_type: 'fixed',
 *   amount: 1200,
 *   period: 'monthly',
 * }
 */
export interface CostStructureProperties {
  /** Classification */
  cost_type?: 'fixed' | 'variable' | 'cogs' | 'opex'
  /** Monetary amount */
  amount?: number
  /** Recurrence */
  period?: 'monthly' | 'yearly' | 'one_time'
}

/** UnitEconomics.
 *
 * @example
 * const properties: UnitEconomicsProperties = {
 *   lifetime_value: 42,
 *   customer_acquisition_cost: 42,
 *   payback_period_months: 42,
 * }
 */
export interface UnitEconomicsProperties {
  /** Customer lifetime value */
  lifetime_value?: number
  /** Customer acquisition cost */
  customer_acquisition_cost?: number
  /** Months to recover CAC from revenue */
  payback_period_months?: number
  /** Gross margin (0–100) */
  gross_margin?: number
}

/** Partnership.
 *
 * @example
 * const properties: PartnershipProperties = {
 *   partner_type: 'technology',
 *   value_exchange: 'We provide distribution; partner provides fulfilment at cost.',
 *   partnership_tier: 'strategic',
 * }
 */
export interface PartnershipProperties {
  /** Partnership nature */
  partner_type?: 'technology' | 'distribution' | 'content' | 'strategic'
  /** What each party gives and receives */
  value_exchange?: string
  /** Commercial significance. Drives attention and exec sponsorship. */
  partnership_tier?: 'strategic' | 'preferred' | 'standard' | 'trial'
  /** Exposure if the partnership fails (concentration risk, IP risk, etc.) */
  risk_level?: UPGAssessment
  /** Internal owner */
  owner?: string
  /** Date the partnership became effective (ISO 8601) */
  start_date?: ISODate
}

/** KeyResource.
 *
 * @example
 * const properties: KeyResourceProperties = {
 *   resource_type: 'physical',
 *   criticality: 'high',
 *   owner: 'sam.patel@arkheiev.com',
 * }
 */
export interface KeyResourceProperties {
  /** Category */
  resource_type?: 'physical' | 'intellectual' | 'human' | 'financial'
  /** Criticality to the business model */
  criticality?: Priority
  /** Accountable person or team */
  owner?: string
  /** Replacement difficulty */
  scarcity_risk?: UPGAssessment
  /** Substitutability if lost */
  substitutability?: 'high' | 'medium' | 'low'
}

/** KeyActivity.
 *
 * @example
 * const properties: KeyActivityProperties = {
 *   activity_type: 'production',
 *   cadence: 'monthly',
 *   operational_owner: 'platform-team',
 * }
 */
export interface KeyActivityProperties {
  /** Activity nature */
  activity_type?: 'production' | 'problem_solving' | 'platform' | 'network'
  /**
   * Canonical `Cadence`. Replaces the legacy free-form `frequency: string` in v0.4.0.
   * For exact rates (e.g. "3 times per week") set `frequency_count` + `frequency_period`.
   * For qualitative tiers ("rare" → "constant") use `frequency_rating`.
   */
  cadence?: Cadence
  /** Exact count of runs in the period. Pairs with `frequency_period`. */
  frequency_count?: number
  /** Recurrence period (ISO-8601 `Duration`, e.g. `'P7D'`) */
  frequency_period?: Duration
  /** Qualitative tier. Use when an exact rate is unknown. */
  frequency_rating?: FrequencyRating
  /** Operationally accountable team or individual */
  operational_owner?: string
  /** Bottleneck or scaling constraint */
  capacity_constraint?: string
  /** How much runs without human intervention */
  automation_level?: 'manual' | 'assisted' | 'automated'
}

/** TargetCustomerSegment.
 *
 * @example
 * const properties: TargetCustomerSegmentProperties = {
 *   segment_type: 'mass',
 *   segment_size: 12000,
 *   willingness_to_pay: 'willingness to pay',
 * }
 */
export interface TargetCustomerSegmentProperties {
  /** Segmentation strategy */
  segment_type?: 'mass' | 'niche' | 'segmented' | 'diversified' | 'multi_sided'
  /** Estimated potential customers */
  segment_size?: number
  /** Price sensitivity and willingness-to-pay description */
  willingness_to_pay?: string
}

/** CustomerRelationship.
 *
 * @example
 * const properties: CustomerRelationshipProperties = {
 *   relationship_type: 'personal',
 *   acquisition_role: 'first-touch',
 *   retention_role: 'Proactive check-ins at day 14, 30, and 60.',
 * }
 */
export interface CustomerRelationshipProperties {
  /** Interaction shape */
  relationship_type?: 'personal' | 'self_service' | 'automated' | 'community' | 'co_creation'
  /** Acquisition funnel stage primarily served */
  acquisition_role?:
    | 'first_touch'
    | 'nurture'
    | 'demo'
    | 'close'
    | 'other'
  /** Retention lever primarily pulled in the customer lifecycle */
  retention_role?:
    | 'onboarding'
    | 'check_in'
    | 'expansion'
    | 'renewal'
    | 'reactivation'
    | 'other'
}

/** DistributionChannel.
 *
 * @example
 * const properties: DistributionChannelProperties = {
 *   channel_type: 'direct',
 *   owned_or_partner: 'owned',
 *   phase: 'awareness',
 * }
 */
export interface DistributionChannelProperties {
  /** How the product reaches customers */
  channel_type?: 'direct' | 'retail' | 'wholesale' | 'marketplace' | 'oem'
  /** Owned or partner-operated */
  owned_or_partner?: 'owned' | 'partner'
  /** Customer journey phase served */
  phase?: 'awareness' | 'purchase' | 'delivery' | 'support'
}
