/**
 * UPG Property Schemas: Growth Domain.
 * Funnel, FunnelStep, AcquisitionChannel, GrowthCampaign, Cohort, BehavioralSegment,
 * GrowthLoop, Variant, AttributionModel.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate } from '../primitives.js'

// ---------------------------------------------------------------------------
// GROWTH LAYER
// ---------------------------------------------------------------------------

/** Funnel entity.
 *
 * @example
 * const properties: FunnelProperties = {
 *   funnel_type: 'acquisition',
 *   step_count: 42,
 *   overall_conversion_rate: 42,
 * }
 */
export interface FunnelProperties {
  /** Which stage of the customer lifecycle this funnel measures */
  funnel_type?: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom'
  /** Number of steps in the funnel */
  step_count?: number
  /** End-to-end conversion rate through the funnel (0-1) */
  overall_conversion_rate?: number
}

/** FunnelStep entity.
 *
 * @example
 * const properties: FunnelStepProperties = {
 *   step_index: 42,
 *   conversion_rate: 0.08,
 *   drop_off_rate: 42,
 * }
 */
export interface FunnelStepProperties {
  /** Position of this step in the funnel (0-indexed) */
  step_index?: number
  /** Percentage of users who advance from this step */
  conversion_rate?: number
  /** Percentage of users who leave at this step */
  drop_off_rate?: number
}

/** AcquisitionChannel entity.
 *
 * @example
 * const properties: AcquisitionChannelProperties = {
 *   channel_type: 'seo',
 *   customer_acquisition_cost: 42,
 *   monthly_volume: 42,
 * }
 */
export interface AcquisitionChannelProperties {
  /** Category of the acquisition channel */
  channel_type?: 'seo' | 'paid' | 'social' | 'referral' | 'direct' | 'content'
  /** Customer acquisition cost for this channel */
  customer_acquisition_cost?: number
  /** Monthly volume of new users from this channel */
  monthly_volume?: number
}

/** GrowthCampaign entity.
 *
 * A bounded, time-boxed promotional or acquisition push run across one or
 * more channels with measurable goals. Campaign lifecycle (drafted ->
 * planning → live → completed/paused) is governed by the canonical
 * `GROWTH_CAMPAIGN_LIFECYCLE`.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent acquisition_channel: `acquisition_channel_runs_growth_campaign`
 *   target audience: `growth_campaign_targets_behavioral_segment`
 *   tested via: `growth_campaign_tests_via_experiment_plan`
 *   amplified launches: `launch_amplified_by_growth_campaign`
 *   included content: `content_piece_part_of_growth_campaign`
 *
 * @example
 * const properties: GrowthCampaignProperties = {
 *   campaign_type: 'paid_acquisition',
 *   start_date: '2026-04-01',
 *   end_date: '2026-09-30',
 *   budget_amount: 50000,
 *   budget_currency: 'USD',
 *   channels_targeted: ['google_ads', 'linkedin', 'partner_newsletter'],
 *   primary_kpi: 'qualified_signups',
 *   kpi_target: 1500,
 *   utm_parameters: 'utm_source=google&utm_medium=cpc&utm_campaign=q2-launch',
 * }
 */
export interface GrowthCampaignProperties {
  /** Strategic shape. Drives channel mix, budget pattern, and measurement style. */
  campaign_type?: 'paid_acquisition' | 'content' | 'referral' | 'partnership' | 'event' | 'viral' | 'lifecycle' | 'other'
  /** ISO start date */
  start_date?: ISODate
  /** ISO end date */
  end_date?: ISODate
  /** Total allocated budget. Use with `budget_currency`. */
  budget_amount?: number
  /** ISO 4217 currency code (e.g. "USD", "EUR", "GBP") */
  budget_currency?: string
  /** Channels the campaign runs across. Free-form so partner channels and ad networks both fit (e.g. "google_ads", "linkedin", "podcast_sponsorship"). */
  channels_targeted?: string[]
  /** Primary KPI optimised for (e.g. "qualified_signups", "MQL_volume", "activated_teams") */
  primary_kpi?: string
  /** Numeric target for `primary_kpi` over the campaign window */
  kpi_target?: number
  /** UTM tracking parameters for this campaign */
  utm_parameters?: string
  /** Hypothesis or rationale this campaign is testing (free-form, complements `experiment_plan` linkage) */
  hypothesis?: string
}

/** Cohort entity.
 *
 * @example
 * const properties: CohortProperties = {
 *   definition: 'A measurable result a team commits to deliver in a time-boxed period.',
 *   acquisition_start: '2026-01-01',
 *   acquisition_end: '2026-03-31',
 * }
 */
export interface CohortProperties {
  /** How this cohort is defined */
  definition?: string
  /** Start of the acquisition window (ISO format) */
  acquisition_start?: string
  /** End of the acquisition window (ISO format) */
  acquisition_end?: string
  /** Number of users in the cohort */
  size?: number
  /** 7-day retention rate (0-1) */
  retention_day_7?: number
  /** 30-day retention rate (0-1) */
  retention_day_30?: number
}

/** BehavioralSegment entity.
 *
 * A definition of a user cohort grouped by observed or qualifying behaviour
 * (distinct from `cohort`, a time-bounded acquisition window, and from
 * `market_segment`, which segments the addressable market). Behavioral
 * segments are computed snapshots: no lifecycle status, just a defining rule,
 * a measured size, and a validity window over which the snapshot was taken.
 *
 * Per UPG principle P14, mappings to other entities are edges:
 *   persona overlay: `behavioral_segment_maps_to_persona`
 *   parent product: `product_segments_into_behavioral_segment`
 *   ICP overlay: `ideal_customer_profile_maps_to_behavioral_segment`
 *   campaign / experiment / pricing targeting: `*_targets_behavioral_segment`
 *
 * @example
 * const properties: BehavioralSegmentProperties = {
 *   definition: 'Users who created ≥ 3 nodes within their first 24 hours.',
 *   criteria: 'event:node_created count >= 3 AND days_since_signup < 1',
 *   segment_type: 'behavioral',
 *   source: 'clickstream',
 *   included_behaviors: ['created_node', 'connected_nodes', 'opened_canvas'],
 *   excluded_behaviors: ['account_deleted', 'support_flagged'],
 *   size_estimate: 1240,
 *   validity_period_start: '2026-04-01',
 *   validity_period_end: '2026-04-30',
 * }
 */
export interface BehavioralSegmentProperties {
  /** Plain-language description. Pairs with the machine-readable `criteria`. */
  definition?: string
  /** Machine-readable or semi-structured membership rule (event-query DSL, SQL fragment, segmentation tool clause). */
  criteria?: string
  /** Classification. `behavioral` is the default; the wider enum allows reclassification without changing entity type. */
  segment_type?: 'behavioral' | 'demographic' | 'firmographic' | 'custom'
  /** Membership data source. Drives confidence weighting and refresh policy. */
  source?: 'clickstream' | 'survey' | 'interview' | 'mixed' | 'inferred' | 'imported'
  /** Qualifying behaviours (positive criteria, free-text labels) */
  included_behaviors?: string[]
  /** Excluding behaviours (negative criteria, free-text labels) */
  excluded_behaviors?: string[]
  /** Estimated current size. Snapshot value. */
  size_estimate?: number
  /** Size. Alias retained for the v0.2 baseline. */
  size?: number
  /** ISO start of the validity window. Behavioural definitions decay; outside the window the snapshot should be re-computed. */
  validity_period_start?: ISODate
  /** End of the window over which the segment definition is considered valid (ISO format) */
  validity_period_end?: ISODate
}

/** GrowthLoop entity.
 *
 * @example
 * const properties: GrowthLoopProperties = {
 *   loop_type: 'viral',
 *   trigger: 'User opens the third restricted feature in a session.',
 *   action: 'Send welcome email',
 * }
 */
export interface GrowthLoopProperties {
  /** Mechanism that drives the loop */
  loop_type?: 'viral' | 'content' | 'paid' | 'product' | 'network_effect'
  /** Event that initiates the loop cycle */
  trigger?: string
  /** Action the user takes within the loop */
  action?: string
  /** Outcome that reinforces the next cycle */
  reward?: string
}

/** Variant entity.
 *
 * @example
 * const properties: VariantProperties = {
 *   variant_name: 'B: simplified onboarding',
 *   traffic_percentage: 42,
 *   variant_status: 'active',
 * }
 */
export interface VariantProperties {
  /** Display name of the experiment variant */
  variant_name?: string
  /** Percentage of traffic allocated to this variant */
  traffic_percentage?: number
  /** Outcome status of the variant */
  variant_status?: 'active' | 'winner' | 'loser' | 'inactive'
}

/** AttributionModel entity.
 *
 * @example
 * const properties: AttributionModelProperties = {
 *   model_type: 'first_touch',
 *   lookback_window: '90d',
 * }
 */
export interface AttributionModelProperties {
  /** How credit is distributed across touchpoints */
  model_type?: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'custom'
  /** Time window for attributing conversions */
  lookback_window?: string
}
