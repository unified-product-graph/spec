/**
 * UPG Property Schemas: Users & Needs Domain.
 * Persona, Job (JTBD), Need, DesiredOutcome, JobStep, SwitchingCost.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ComfortLevel, UPGAssessment } from '../primitives.js'

/** User archetype representing a distinct group of users.
 *
 * @example
 * const properties: PersonaProperties = {
 *   context: 'Leads a 12-person product team at a mid-size B2B SaaS (50–200 employees).',
 *   is_primary: true,
 *   experience_level: 'beginner',
 * }
 */
export interface PersonaProperties {
  /** Free-text description of the persona's situation and environment
   *  @example "Leads 12-person team at mid-size B2B SaaS (50-200 employees)" */
  context?: string
  /** Whether this is the primary/target persona for this product */
  is_primary?: boolean
  /** How experienced this persona is in their domain */
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'varies'
  /** Primary motivation or driving need
   *  @example "Making confident, evidence-based decisions" */
  motivation?: string
  /**
   * Tech comfort. Closed set so personas across products compare on the same axis.
   * Free-text colour belongs in `context` or `motivation`.
   */
  tech_comfort?: ComfortLevel
  /** Industry or domain knowledge this persona brings
   *  @example "10+ years SaaS experience", "New to healthcare IT" */
  domain_expertise?: string
  /**
   * Role in the buying / adoption decision (the decision-making-unit split):
   * who signs (buyer) vs who uses (user) vs who advocates internally (champion)
   * vs who shapes the choice (influencer) vs who delivers / implements
   * (partner). A portfolio must separate the economic buyer from the
   * practitioner user; they are distinct personas with distinct jobs. Closed
   * set so roles compare across products.
   * @example "buyer"
   */
  audience_role?: 'buyer' | 'user' | 'champion' | 'influencer' | 'partner'
}

/** Job-to-be-Done: the underlying goal a user is trying to accomplish.
 *
 * @example
 * const properties: JobProperties = {
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 *   job_type: 'functional',
 *   importance: 4,
 * }
 */
export interface JobProperties {
  /** Job statement: "When I... I want to... So I can..." */
  statement?: string
  /** Classification by motivation dimension */
  job_type?: 'functional' | 'emotional' | 'social' | 'supporting'
  /** Importance to the user (1 = low, 5 = critical) */
  importance?: UPGAssessment
  /** Current satisfaction with how this job gets done (1 = very unsatisfied, 5 = fully satisfied) */
  current_satisfaction?: UPGAssessment
  /** Persona role in the value exchange */
  supporting_role?: 'buyer_of_value' | 'co_creator_of_value' | 'transferrer_of_value'
}

/** What kind of experience a need represents */
export type NeedValence = 'pain' | 'gap' | 'constraint'

/** How mature a need is in our understanding */
export type NeedMaturity = 'raw' | 'validated' | 'prioritized'

/** Unified need. Replaces pain_point + user_need. Framework labels provide context-specific display names.
 *
 * @example
 * const properties: NeedProperties = {
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 *   valence: 'pain',
 *   maturity: 'validated',
 * }
 */
export interface NeedProperties {
  /** The need expressed as a clear, user-facing statement */
  statement?: string
  /** What kind of experience: pain (friction), gap (unmet), constraint (limitation) */
  valence?: NeedValence
  /** How mature is this need in our understanding */
  maturity?: NeedMaturity
  /** How often the user encounters this need (1 = rarely, 5 = constantly) */
  frequency?: UPGAssessment
  /** How painful or disruptive the need is when unaddressed (1 = minor, 5 = critical) */
  severity?: UPGAssessment
  /** How important resolving this need is to the user (1 = low, 5 = critical) */
  importance?: UPGAssessment
  /** Motivation dimension. Inherited from parent job if not set. */
  motivation?: 'functional' | 'emotional' | 'social'
}

/** DesiredOutcome entity.
 *
 * @example
 * const properties: DesiredOutcomeProperties = {
 *   importance: 4,
 *   current_satisfaction: 4,
 *   statement: 'When I am reviewing a sprint, I want a one-page health summary so I can decide what to escalate.',
 * }
 */
export interface DesiredOutcomeProperties {
  /** Outcome statement in the user's words */
  statement?: string
  /** How important this outcome is to the user (1 = low, 5 = critical) */
  importance: UPGAssessment
  /** How satisfied the user currently is with this outcome (1 = very unsatisfied, 5 = fully satisfied) */
  current_satisfaction: UPGAssessment
}

/** JobStep entity.
 *
 * @example
 * const properties: JobStepProperties = {
 *   step_order: 1,
 *   step_type: 'core',
 *   tools_used: 'Notion for capture, Linear for tracking, Figma for design.',
 * }
 */
export interface JobStepProperties {
  /** Order of this step within the parent job */
  step_order?: number
  /** Classification of the step */
  step_type?: 'core' | 'supporting' | 'emotional'
  /** Tools or products currently used for this step */
  tools_used?: string
}

/** SwitchingCost entity.
 *
 * @example
 * const properties: SwitchingCostProperties = {
 *   cost_type: 'financial',
 *   magnitude: 'high',
 *   barrier_description: 'Extensive Notion workspace with years of history; migration feels daunting.',
 * }
 */
export interface SwitchingCostProperties {
  /** Type of switching cost */
  cost_type?: 'financial' | 'learning' | 'data' | 'relationship' | 'procedural'
  /** How large the barrier is */
  magnitude?: 'high' | 'medium' | 'low'
  /** Free-text description of the barrier */
  barrier_description?: string
}
