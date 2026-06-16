/**
 * UPG Property Schemas: UX Design Domain.
 * UserJourney, JourneyStep, DesignQuestion, DesignConcept, Prototype,
 * Wireframe, UserFlow, Screen, ScreenState, Annotation, InteractionSpec.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGAssessment, Priority } from '../primitives.js'

// ---------------------------------------------------------------------------
// EXPERIENCE DESIGN
// ---------------------------------------------------------------------------

/** Whether a journey maps current or future state.
 *
 * BREAKING in v0.9.9: the `'service_blueprint'` value is deprecated
 * and removed from the union. A service blueprint is a first-class
 * `service_blueprint` *entity* (in the customer_success domain), not a *type of*
 * `user_journey`. Migration: a `user_journey` carrying
 * `journey_type: 'service_blueprint'` should be re-modelled as a
 * `service_blueprint` node; drop the journey_type value (it no longer
 * type-checks). `current_state` / `future_state` / `day_in_the_life` are kept.
 */
export type JourneyType = 'current_state' | 'future_state' | 'day_in_the_life'

/** User journey map.
 *
 * @example
 * const properties: UserJourneyProperties = {
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   scenario: 'First-time user lands in an empty workspace.',
 * }
 */
export interface UserJourneyProperties {
  /** Scope (e.g. "end-to-end onboarding") */
  scope?: string
  /** Maps current or future state */
  journey_type?: JourneyType
  /** Scenario context */
  scenario?: string
}

/** Phase within a user journey. A temporal BAND over the journey's step
 * timeline, not a container that owns steps. A journey map renders
 * phases as a horizontal band above one timeline; a phase spans a range of
 * that timeline. Steps belong to the journey, not the phase.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent journey: `user_journey_passes_through_journey_phase`
 *     (the journey carries the phase as a non-owning band overlay)
 *   spanned steps: `journey_phase_spans_journey_step` (non-owning; the steps
 *     are owned by `user_journey_contains_journey_step`, mirroring the
 *     marketing precedent `customer_journey_stage_spans_journey_step`)
 *   phase ordering: the `phase_order` scalar below (the convention shared
 *     with `journey_step.step_order` and `journey_action.action_order`)
 *
 * @example
 * const properties: JourneyPhaseProperties = {
 *   phase_order: 1,
 *   label: 'Onboarding',
 *   goal: 'Cut time-to-first-value from 7 days to 2.',
 *   emotion_arc: 'rising',
 *   entry_trigger: 'User completes signup and lands in an empty workspace',
 *   exit_trigger: 'User commits their first decision node',
 *   key_questions: ['What can I do here?', 'Will this help my team?', 'How do I get started?'],
 *   timeframe: 'days 1–3',
 * }
 */
export interface JourneyPhaseProperties {
  /** Display order within the journey (0-indexed) */
  phase_order?: number
  /**
   * Short human-readable name.
   * @example "Discovery", "Onboarding", "Activation"
   */
  label?: string
  /** What the user is trying to accomplish */
  goal?: string
  /** Directional shape of user emotion. Spots design opportunities at dips and payoff points at peaks. */
  emotion_arc?: 'rising' | 'steady' | 'falling' | 'mixed'
  /** Event or signal marking entry into this phase */
  entry_trigger?: string
  /** Event or signal marking exit. Pairs with the next phase's `entry_trigger`. */
  exit_trigger?: string
  /** Open questions the user asks themselves. Fuel for design and content priorities. */
  key_questions?: string[]
  /**
   * Typical time window.
   * @example "first 30 seconds", "days 1–7", "onboarding week"
   */
  timeframe?: string
}

/** Single step within a user journey. A user-moment on the journey's single
 * step timeline. Steps belong to the journey via
 * `user_journey_contains_journey_step` (the stable 0.1.0 spine); a
 * `journey_phase` spans a range of them but does not own them.
 *
 * @example
 * const properties: JourneyStepProperties = {
 *   step_order: 1,
 *   touchpoint: 'in-product',
 *   channel: 'in-product',
 *   emotion_score: 4,
 * }
 */
export interface JourneyStepProperties {
  /**
   * Display order within the journey's step timeline (0-indexed). The scalar
   * ordering convention shared with `journey_phase.phase_order` and
   * `journey_action.action_order`. For branching journeys, the
   * explicit `journey_step_precedes_journey_step` edge captures the chain.
   */
  step_order?: number
  /** Channel (e.g. "web", "email", "in-store") */
  channel?: string
  /** User emotion (1 = very negative, 5 = very positive) */
  emotion_score?: UPGAssessment
  /** Friction (1 = effortless, 5 = very painful) */
  friction_score?: UPGAssessment
  /** What the user is thinking */
  thought?: string
  /** Responsible owner. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Discrete action at a journey step, classified by service layer.
 * The finest blueprint layer (a service-blueprint row within a moment).
 * Enables service blueprint rendering and cross-domain linking.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent step: `journey_step_has_action` (the step owns its actions)
 *   downstream need: `journey_action_surfaces_need`. Opportunity discovery
 *     routes through `need`, which reaches `opportunity` via
 *     `opportunity_addresses_need`; the `pain_score` / `opportunity_score`
 *     scalars below are blueprint-cell diagnostics that fuel that discovery.
 *   realising feature: `journey_action_realised_by_feature`
 *
 * The `system` property is a display label naming the performing system; when
 * a `service` entity exists, model the relationship structurally rather than
 * relying on the label.
 *
 * @example
 * const properties: JourneyActionProperties = {
 *   action_order: 0,
 *   layer: 'user',
 *   action_description: 'User pastes a meeting transcript into the empty canvas',
 *   channel: 'in-app',
 *   pain_score: 4,
 *   opportunity_score: 5,
 *   evidence: 'Pasted transcript appears as a single text node',
 *   system: 'canvas-paste-handler',
 *   notes: 'Most users hesitate before pasting; too much trust required.',
 * }
 */
export interface JourneyActionProperties {
  /**
   * Display order of this action within its step (0-indexed). The scalar
   * ordering convention shared with `journey_phase.phase_order` and
   * `journey_step.step_order`. Orders the service-blueprint rows
   * within a single moment.
   */
  action_order?: number
  /** Service layer */
  layer: 'user' | 'frontstage' | 'backstage' | 'support'
  /** Plain-language description. Primary content of the action. */
  action_description?: string
  /** Channel or surface. Keeps service-blueprint columns consistent across the journey. */
  channel?: 'in-app' | 'email' | 'web' | 'mobile' | 'phone' | 'in-person' | 'sms' | 'social' | 'other'
  /** Pain (1 = effortless, 5 = very painful). Drives opportunity discovery. */
  pain_score?: UPGAssessment
  /** Opportunity (1 = low leverage, 5 = high leverage). Pairs with `pain_score` to rank investment. */
  opportunity_score?: UPGAssessment
  /** Physical or digital evidence visible at this point */
  evidence?: string
  /** Performing system or service */
  system?: string
  /** Free-text notes, observations, or follow-up questions */
  notes?: string
}

/** Design question framing an open problem.
 *
 * Seed of a design exploration. Sits upstream of `design_concept` (proposed
 * solutions) and downstream of `need` and `insight` (surfacing signals).
 * Lifecycle (open → researching → answered → parked / archived) is governed
 * by the canonical `DISCOVERY_TEMPLATE`.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   upstream signal: `insight_inspires_design_question`
 *   upstream need: `need_reframed_as_design_question`
 *   downstream answer: `design_question_answered_by_design_concept`
 *
 * @example
 * const properties: DesignQuestionProperties = {
 *   question: 'How might we help first-time users feel productive within their first session?',
 *   problem_context: 'Teams have rich AI output but no place to see how pieces connect.',
 *   hypothesis: 'A guided first-canvas template will lift day-1 activation by 8pp.',
 *   target_domain: 'ux',
 *   framing: 'how_might_we',
 *   priority: 'high',
 *   confidence: 'medium',
 *   assumptions: [
 *     'Empty-state friction is the dominant drop-off cause',
 *     'Users tolerate one guided template before exploring freely',
 *   ],
 *   validation_method: 'usability_test',
 * }
 */
export interface DesignQuestionProperties {
  /** The question itself ("How might we…?", "What if…?"). Primary content. */
  question?: string
  /** Context that prompted the question */
  problem_context?: string
  /** Working hypothesis. Captured up-front so research can confirm or disconfirm. */
  hypothesis?: string
  /** Target design discipline */
  target_domain?: 'ux' | 'visual' | 'interaction' | 'content' | 'accessibility' | 'other'
  /** Question framing template */
  framing?: 'how_might_we' | 'what_if' | 'why_do' | 'how_do' | 'what_prevents' | 'other'
  /** Importance against other backlog questions */
  priority?: Priority
  /** Confidence the question is well-framed (UPGAssessment on `confidence_5`). Distinct from confidence in any answer. */
  confidence?: UPGAssessment
  /** Underlying assumptions. Surfaced explicitly so they can be challenged or validated. */
  assumptions?: string[]
  /** Primary validation method */
  validation_method?: 'interview' | 'survey' | 'usability_test' | 'analytics' | 'a_b_test' | 'prototype_test' | 'literature_review' | 'other'
}

/** Design concept being explored.
 *
 * @example
 * const properties: DesignConceptProperties = {
 *   sketch_url: 'https://figma.com/file/abc/sketch',
 *   rationale: 'Reduces support burden and lifts activation, both priorities this quarter.',
 *   concept_status: 'exploring',
 * }
 */
export interface DesignConceptProperties {
  /** URL of the sketch or visual */
  sketch_url?: string
  /** Selection or rejection rationale */
  rationale?: string
  /** Current selection status */
  concept_status?: 'exploring' | 'validated' | 'selected' | 'rejected'
  /** Development stage, from rough idea to presentation-ready */
  maturity?: 'sketch' | 'refined' | 'final'
  /** Shepherding designer or researcher. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Prototype.
 *
 * @example
 * const properties: PrototypeProperties = {
 *   fidelity: 'low',
 *   test_status: 'untested',
 *   tool: 'entopo',
 * }
 */
export interface PrototypeProperties {
  /** Detail level */
  fidelity?: 'low' | 'medium' | 'high'
  /** User-test status */
  test_status?: 'untested' | 'testing' | 'passed' | 'failed'
  /** Authoring tool */
  tool?: string
}

/** Wireframe.
 *
 * @example
 * const properties: WireframeProperties = {
 *   fidelity: 'low',
 *   screen_name: 'OnboardingChecklist',
 *   version: '0.3.1',
 * }
 */
export interface WireframeProperties {
  /** Detail level */
  fidelity?: 'low' | 'medium' | 'high'
  /** Version or iteration (e.g. "v2", "2026-04-B") */
  version?: string
  /**
   * Authoring tool.
   * @example "Figma", "Balsamiq", "pen and paper"
   */
  tool?: string
  /** Review gate status */
  review_status?: 'draft' | 'in_review' | 'approved' | 'rejected'
  /** URL of the corresponding interactive prototype */
  linked_prototype_url?: string
}

/** User flow.
 *
 * @example
 * const properties: UserFlowProperties = {
 *   steps: ['Open the workspace', 'Pick a persona', 'Commit a decision'],
 *   trigger: 'User opens the third restricted feature in a session.',
 *   success_state: 'Dashboard shows a populated graph with at least one committed decision.',
 * }
 */
export interface UserFlowProperties {
  /**
   * Display order of this flow among sibling flows (0-indexed). The scalar
   * ordering convention shared with `journey_step.step_order` and
   * `journey_action.action_order` ( /). The free-text `steps`
   * array below still captures the within-flow narrative; this scalar makes the
   * flow itself a deterministically orderable sibling.
   */
  flow_order?: number
  /** Initiating event */
  trigger?: string
  /** Ordered steps */
  steps: string[]
  /** Successful completion */
  success_state?: string
  /** Failed completion */
  failure_state?: string
}

/** Screen in the product.
 *
 * @example
 * const properties: ScreenProperties = {
 *   route: '/workspace/:slug',
 *   viewport: 'mobile',
 *   access_level: 'public',
 * }
 */
export interface ScreenProperties {
  /**
   * Application route.
   * @example "/dashboard", "/settings/billing"
   */
  route?: string
  /** Primary target viewport */
  viewport?: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'watch' | 'responsive'
  /** Reach */
  access_level?: 'public' | 'authenticated' | 'admin' | 'internal'
  /** Build pipeline stage */
  screen_status?: 'draft' | 'in_design' | 'built' | 'shipped' | 'deprecated'
  /** One-line purpose */
  purpose?: string
}

/** Specific state of a screen.
 *
 * @example
 * const properties: ScreenStateProperties = {
 *   state_name: 'empty',
 *   trigger: 'User opens the third restricted feature in a session.',
 *   condition: 'personas.length > 0 && opportunities.length === 0',
 * }
 */
export interface ScreenStateProperties {
  /**
   * Display order of this state within its parent screen (0-indexed). The scalar
   * ordering convention shared with `journey_step.step_order` and
   * `journey_action.action_order` ( /). Orders the states a
   * screen moves through (e.g. skeleton, loading, populated).
   */
  state_order?: number
  /** State */
  state_name: 'empty' | 'loading' | 'error' | 'populated' | 'skeleton' | 'partial'
  /** Cause for entering this state */
  trigger?: string
  /** Data or environmental condition the state represents */
  condition?: string
  /** User-visible copy */
  message?: string
}

/** Design annotation on a screen.
 *
 * @example
 * const properties: AnnotationProperties = {
 *   annotation_type: 'spec',
 *   target_element: '[data-testid="onboarding-cta"]',
 *   note: 'Rechecked on 2026-04-10 after the onboarding rewrite.',
 * }
 */
export interface AnnotationProperties {
  /** Annotation type */
  annotation_type?: 'spec' | 'interaction' | 'content' | 'accessibility'
  /** Annotated element */
  target_element?: string
  /** Note text */
  note?: string
}

/** Interaction specification.
 *
 * @example
 * const properties: InteractionSpecProperties = {
 *   trigger: 'User opens the third restricted feature in a session.',
 *   animation_type: 'ease-in-out 240ms',
 *   duration_ms: 42,
 * }
 */
export interface InteractionSpecProperties {
  /** Triggering event */
  trigger?: string
  /** Animation or transition kind */
  animation_type?: string
  /** Duration in ms */
  duration_ms?: number
  /** Easing (e.g. "ease-in-out", "spring") */
  easing?: string
}
