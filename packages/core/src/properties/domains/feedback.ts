/**
 * UPG Property Schemas: Customer Feedback Domain.
 * FeedbackProgram, FeatureRequest, FeedbackVote, NpsCampaign,
 * UserAdvisoryBoard, BetaProgram, FeedbackTheme.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence, FrequencyRating, ISODate, SignalSentiment, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// FEEDBACK & VoC
// ---------------------------------------------------------------------------

/** Feedback program.
 *
 * @example
 * const properties: FeedbackProgramProperties = {
 *   program_type: 'continuous',
 *   collection_method: 'Segment events + Stripe webhooks',
 * }
 */
export interface FeedbackProgramProperties {
  /** How frequently feedback is collected */
  program_type?: 'continuous' | 'periodic' | 'event_triggered'
  /** Method used to collect feedback (e.g. "survey", "interview", "widget") */
  collection_method?: string
}

/** Feature request raised by customer, prospect, or internal stakeholder.
 *
 * @example
 * const properties: FeatureRequestProperties = {
 *   request_source: 'customer',
 *   vote_count: 42,
 *   signal_sentiment: 'positive',
 * }
 */
export interface FeatureRequestProperties {
  /** Where the request originated */
  request_source?: 'customer' | 'internal' | 'prospect' | 'support' | 'community'
  /** Number of votes or upvotes from users */
  vote_count?: number
  /** Detected sentiment of the request */
  signal_sentiment?: SignalSentiment
  /** Channel through which the request was received */
  signal_channel?: string
  /** Perceived urgency of the request */
  signal_urgency?: 'low' | 'medium' | 'high' | 'critical'
  /** Estimated revenue impact if implemented (1-5) */
  revenue_impact?: UPGAssessment
  /** Estimated implementation effort (1-5) */
  effort_estimate?: UPGAssessment
  /** Computed impact score combining reach, revenue, and effort */
  impact_score?: number
  /** Estimated delivery date (ISO format) */
  eta?: string
}

/** Feedback vote.
 *
 * @example
 * const properties: FeedbackVoteProperties = {
 *   vote_count: 42,
 *   mrr_impact: 42,
 * }
 */
export interface FeedbackVoteProperties {
  /** Total number of votes cast */
  vote_count?: number
  /** Combined MRR of voting accounts */
  mrr_impact?: number
}

/** NPS (Net Promoter Score) measurement campaign.
 *
 * @example
 * const properties: NpsCampaignProperties = {
 *   campaign_type: 'relationship',
 *   send_date: '2026-04-01',
 *   response_count: 42,
 * }
 */
export interface NpsCampaignProperties {
  /** What triggers the NPS survey */
  campaign_type?: 'relationship' | 'transactional' | 'feature'
  /** Date the survey was sent (ISO format) */
  send_date?: ISODate
  /** Number of responses received */
  response_count?: number
  /** Percentage of recipients who responded */
  response_rate?: number
  /** Net Promoter Score (-100 to 100) */
  score?: number
  /** Percentage of respondents who are promoters (9-10) */
  promoters_pct?: number
  /** Percentage of respondents who are detractors (0-6) */
  detractors_pct?: number
}

/** User advisory board.
 *
 * @example
 * const properties: UserAdvisoryBoardProperties = {
 *   member_count: 42,
 *   meeting_cadence: 'bi-weekly',
 *   board_focus: 'Weekly discovery prioritisation',
 * }
 */
export interface UserAdvisoryBoardProperties {
  /** Number of members on the board */
  member_count?: number
  /** How often the board meets. Uses the shared `Cadence` scale. */
  meeting_cadence?: Cadence
  /** Primary topic or area the board advises on */
  board_focus?: string
}

/** Beta program.
 *
 * @example
 * const properties: BetaProgramProperties = {
 *   beta_type: 'closed',
 *   participant_count: 42,
 * }
 */
export interface BetaProgramProperties {
  /** Access model for the beta */
  beta_type?: 'closed' | 'open' | 'invite_only'
  /** Number of users participating in the beta */
  participant_count?: number
}

/** Recurring theme identified across feedback signals.
 *
 * @example
 * const properties: FeedbackThemeProperties = {
 *   sentiment: 'positive',
 *   actionable: true,
 *   frequency: 'monthly',
 * }
 */
export interface FeedbackThemeProperties {
  /** Display name of the theme */
  /** Overall sentiment across mentions */
  sentiment?: SignalSentiment
  /** Whether this theme can be acted upon */
  actionable?: boolean
  /** How often the theme is mentioned (1-5) */
  frequency?: UPGAssessment
  /** ISO date when the theme was first identified */
  first_seen_date?: ISODate
  /** ISO date of the most recent mention */
  last_seen_date?: ISODate
  /** Whether mentions are increasing or decreasing */
  trend_direction?: 'growing' | 'stable' | 'declining'
}
