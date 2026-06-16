/**
 * UPG Property Schemas: Customer Success Domain.
 * SupportTicket, CustomerFeedback, ChurnReason, CustomerHealthScore,
 * Playbook, ServiceLevelAgreement, CustomerJourneyStage, Touchpoint,
 * SuccessMilestone, ServiceBlueprint.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Duration, FrequencyRating, ISODate, SignalSentiment, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// CUSTOMER SUCCESS
// ---------------------------------------------------------------------------

/** Support ticket.
 *
 * @example
 * const properties: SupportTicketProperties = {
 *   ticket_type: 'bug',
 *   severity: 4,
 *   resolution: 'Disable the retry loop on 4xx responses.',
 * }
 */
export interface SupportTicketProperties {
  /** Classification of the ticket */
  ticket_type?: 'bug' | 'question' | 'feature_request'
  /** Impact severity of the issue (1 = cosmetic, 5 = service down) */
  severity?: UPGAssessment
  /** Description of how the ticket was resolved */
  resolution?: string
  /** Where the ticket originated (e.g. "email", "in-app", "chat") */
  source?: string
  /** Detected sentiment of the customer's message */
  signal_sentiment?: SignalSentiment
  /** Channel through which the signal was received */
  signal_channel?: string
  /** Perceived urgency of the customer's request */
  signal_urgency?: 'low' | 'medium' | 'high' | 'critical'
}

/** Customer feedback.
 *
 * @example
 * const properties: CustomerFeedbackProperties = {
 *   feedback_type: 'survey',
 *   sentiment: 'positive',
 *   verbatim: 'I just paste everything into a doc and hope I find it again.',
 * }
 */
export interface CustomerFeedbackProperties {
  /** How the feedback was collected */
  feedback_type?: 'survey' | 'interview' | 'review' | 'nps'
  /** Overall sentiment of the feedback */
  sentiment?: SignalSentiment
  /** Exact words from the customer */
  verbatim?: string
  /** Detected sentiment of the underlying signal */
  signal_sentiment?: SignalSentiment
  /** Channel through which the signal was received */
  signal_channel?: string
  /** Perceived urgency of the feedback */
  signal_urgency?: 'low' | 'medium' | 'high' | 'critical'
}

/** Churn reason.
 *
 * @example
 * const properties: ChurnReasonProperties = {
 *   category: 'activation',
 *   frequency_count: 12,
 *   frequency_period: 'P30D',
 *   contributing_factors: ['recent login flow change', 'cache invalidation bug'],
 * }
 */
export interface ChurnReasonProperties {
  /** High-level category of the churn reason */
  category?: string
  /** Exact count of times this reason has been cited in `frequency_period` */
  frequency_count?: number
  /** The recurrence period the count is measured over (ISO-8601 `Duration`, e.g. `'P30D'`) */
  frequency_period?: Duration
  /** Qualitative frequency tier when an exact count is not known */
  frequency_rating?: FrequencyRating
  /** Other factors that contributed to the churn */
  contributing_factors?: string[]
  /** Detected sentiment of the churn signal */
  signal_sentiment?: SignalSentiment
  /** Channel through which the churn signal was received */
  signal_channel?: string
  /** Urgency of the churn risk */
  signal_urgency?: 'low' | 'medium' | 'high' | 'critical'
}

/** Customer health score.
 *
 * @example
 * const properties: CustomerHealthScoreProperties = {
 *   overall_score: 42,
 *   risk_level: 'healthy',
 *   trend: 'improving',
 * }
 */
export interface CustomerHealthScoreProperties {
  /** Individual metrics that compose the health score */
  metrics?: Record<string, number>
  /** Aggregate health score (0-100) */
  overall_score?: number
  /** Current risk classification */
  risk_level?: 'healthy' | 'at_risk' | 'red'
  /** Direction the health score is moving */
  trend?: 'improving' | 'stable' | 'declining'
}

/** Customer success playbook.
 *
 * @example
 * const properties: PlaybookProperties = {
 *   playbook_type: 'onboarding',
 *   trigger: 'User opens the third restricted feature in a session.',
 *   playbook_steps: ['Open ticket', 'Verify logs', 'Page on-call', 'Write postmortem'],
 * }
 */
export interface PlaybookProperties {
  /** Scenario this playbook addresses */
  playbook_type?: 'onboarding' | 'expansion' | 'renewal' | 'rescue' | 'other'
  /** Condition that activates this playbook */
  trigger?: string
  /** Ordered list of steps to execute */
  playbook_steps?: string[]
}

/** Service-level agreement (SLA). The concrete obligations a service commits
 *  to deliver against. Renamed from `SlaProperties` so the generated
 *  property-schema key matches the canonical entity name `service_level_agreement`.
 *
 * @example
 * const properties: ServiceLevelAgreementProperties = {
 *   target: 'Week-one activation ≥ 45%.',
 *   measurement_window: 'rolling-30-days',
 *   coverage_hours: '24x7',
 * }
 */
export interface ServiceLevelAgreementProperties {
  /** Target value for the primary metric (e.g. "99.9%", "< 200ms p95") */
  target?: string
  /** Time period over which `target` is measured (e.g. "monthly", "quarterly") */
  measurement_window?: string
  /** Hours during which the SLA applies (e.g. "24/7", "business hours", "follow-the-sun") */
  coverage_hours?: string
  /** Target time to first acknowledgement of an incident (e.g. "15 minutes") */
  response_time_target?: string
  /** Target time to incident resolution (e.g. "4 hours" for sev-1) */
  resolution_time_target?: string
  /** Effective term of the agreement (e.g. "12 months", "auto-renewing annual") */
  agreement_term?: string
  /** ISO date effective */
  effective_date?: ISODate
  /** ISO date expires. Pairs with `agreement_term` for renewal logic. */
  expiry_date?: ISODate
  /** Party accountable on the service provider side. Promote to a `node_owned_by_team` edge if ownership must be queryable. */
  owner?: string
  /** What happens if the SLA is breached (credits, penalties, escalation path) */
  consequence_of_breach?: string
}

/** Customer journey stage.
 *
 * @example
 * const properties: CustomerJourneyStageProperties = {
 *   stage_type: 'awareness',
 *   stage_order: 0,
 *   avg_duration: '45m',
 *   conversion_rate: 0.08,
 * }
 */
export interface CustomerJourneyStageProperties {
  /** Which pirate metric (AAARRR) this stage maps to */
  stage_type?: 'awareness' | 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral'
  /**
   * Display order along the lifecycle timeline (0-indexed). The `*_order`
   * convention shared with `journey_phase.phase_order` and
   * `journey_step.step_order` ( / CS-8), so two same-`stage_type` stages
   * are orderable.
   */
  stage_order?: number
  /** Average time a customer spends in this stage */
  avg_duration?: string
  /** Percentage of customers who advance to the next stage */
  conversion_rate?: number
}

/** Customer touchpoint.
 *
 * @example
 * const properties: TouchpointProperties = {
 *   touchpoint_channel: 'in_app',
 *   touchpoint_type: 'reactive',
 *   satisfaction_score: 42,
 * }
 */
export interface TouchpointProperties {
  /**
   * Medium (modality) of the interaction: how it physically happens. Distinct
   * from a go-to-market *channel* (`marketing_channel`/`acquisition_channel`/
   * `distribution_channel`), which are market routes, not interaction media.
   */
  touchpoint_channel?: 'in_app' | 'email' | 'phone' | 'chat' | 'sms' | 'in_person' | 'mail'
  /** Whether the touchpoint is initiated by the customer, CSM, or system */
  touchpoint_type?: 'reactive' | 'proactive' | 'automated'
  /** Customer satisfaction score for this touchpoint */
  satisfaction_score?: number
}

/** Customer success milestone.
 *
 * @example
 * const properties: SuccessMilestoneProperties = {
 *   milestone_type: 'adoption',
 *   target_date: '2026-06-15',
 * }
 */
export interface SuccessMilestoneProperties {
  /** Phase of the customer lifecycle this milestone tracks */
  milestone_type?: 'adoption' | 'expansion' | 'renewal' | 'advocacy'
  /** Target date for achieving this milestone (ISO format) */
  target_date?: ISODate
  /** Whether the milestone has been reached */
  achieved?: boolean
}

/** Service blueprint.
 *
 * @example
 * const properties: ServiceBlueprintProperties = {
 *   blueprint_scope: 'End-to-end onboarding from signup to first committed decision.',
 *   frontstage_steps: 42,
 *   backstage_steps: 42,
 * }
 */
export interface ServiceBlueprintProperties {
  /** What part of the service this blueprint covers */
  blueprint_scope?: string
  /** Number of customer-visible steps */
  frontstage_steps?: number
  /** Number of internal operational steps */
  backstage_steps?: number
}
