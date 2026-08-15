/**
 * UPG Property Schemas: UX Design Domain.
 * UserJourney, JourneyStep, DesignQuestion, DesignConcept, Prototype,
 * Wireframe, UserFlow, Screen, ScreenState, Surface, Annotation, InteractionSpec.
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
 *   tool: 'entopo',
 * }
 */
export interface PrototypeProperties {
  /** Detail level */
  fidelity?: 'low' | 'medium' | 'high'
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

/** Structural kind of a surface. Determines what may legally nest inside it
 * (see `UPG_VALID_CHILDREN.surface` and `surface_contains_surface`).
 *
 * - `shell` — the outermost frame a product renders into (window chrome, app shell).
 * - `tool` — a self-contained working environment hosted by the shell (a canvas, an editor).
 * - `pane` — a resizable division of a tool or shell (sidebar, inspector, split view).
 * - `region` — a named zone inside a pane with its own layout rules (header, body, footer).
 * - `slot` — a single addressable insertion point that holds one occupant at a time.
 * - `gutter` — a narrow margin rail alongside content (line numbers, field affordances).
 * - `action_bar` — a strip that collects invocable controls (toolbar, footer bar, command row).
 * - `overlay` — a surface drawn above the stack, temporarily taking focus (modal, popover, sheet).
 * - `ambient` — a non-focus-taking surface that reports state (toast rail, status line, presence layer).
 */
export type SurfaceKind =
  | 'shell'
  | 'tool'
  | 'pane'
  | 'region'
  | 'slot'
  | 'gutter'
  | 'action_bar'
  | 'overlay'
  | 'ambient'

/** How reliably a surface is present.
 *
 * - `always` — rendered in every state of its parent.
 * - `conditional` — rendered when `visibility_condition` holds.
 * - `on_demand` — rendered only after the user invokes it.
 * - `transient` — appears and self-dismisses without user action.
 */
export type SurfacePersistence = 'always' | 'conditional' | 'on_demand' | 'transient'

/** Who may add occupants to a surface.
 *
 * - `closed` — the occupant set is fixed by the product team.
 * - `plugin_registerable` — extensions may register occupants through a published contract.
 * - `user_configurable` — the end user chooses what occupies it.
 */
export type SurfaceExtensibility = 'closed' | 'plugin_registerable' | 'user_configurable'

/** How many instances of the surface exist, in UML multiplicity notation.
 *
 * `capacity` counts OCCUPANTS INSIDE one instance; `cardinality` counts the
 * INSTANCES themselves. A slot with `capacity: 1` still says nothing about
 * whether the product renders one such slot or forty.
 *
 * - `'1'` — exactly one instance, always present.
 * - `'0..1'` — at most one; may not be rendered at all.
 * - `'1..n'` — at least one, and more may be rendered.
 * - `'0..n'` — any number, including none.
 *
 * Spelled in UML multiplicity rather than snake_case words because the notation
 * is the lingua franca for the question and reads unambiguously in a diff. The
 * registry already carries non-identifier enum values where the domain has its
 * own notation (`headcount_band: '1-10'`, `openapi_version: 'v3.1'`).
 */
export type SurfaceCardinality = '1' | '0..1' | '1..n' | '0..n'

/** What an instance of the surface is scoped to.
 *
 * Read with `cardinality`: together they say whether "the product has an
 * inspector panel" is a true sentence, or whether the truth is "every document
 * pane has its own inspector panel, and three can show different content at
 * once". Without this, a graph asserts the former when it means the latter.
 *
 * - `global` — one instance serves the whole product; its state is shared.
 * - `per_parent` — each containing surface owns its own instance with its own
 *   state. "Parent" is the `surface_contains_surface` parent (or the
 *   `screen_renders_surface` host when the surface sits at the top of a screen).
 */
export type SurfaceInstanceScope = 'global' | 'per_parent'

/** How the occupants of a surface relate to one another.
 *
 * The three modes need genuinely different governance, and conflating them is
 * what makes a contention check misfire:
 *
 * - `exclusive` — one occupant wins and the others are not rendered. This is
 *   contention in the strict sense, and it is the mode that needs an
 *   `arbitration_rule`.
 * - `additive` — all occupants coexist and are rendered together. Nobody is
 *   suppressed, so the open question is ORDER rather than victory; record the
 *   ordering in `arbitration_rule`.
 * - `chained` — each occupant WRAPS the next, typically by invoking a
 *   render-default callback it is handed. Not contention but a trust model: an
 *   occupant that never calls the callback silently deletes everything
 *   downstream of it. Many occupants and no arbitration rule is the DESIGNED
 *   shape here, not a defect, so `chained` is exempt from
 *   `contended-surface-without-arbitration`.
 *
 * EXEMPTION IS DECLARE-TO-EARN. A surface that leaves `composition_mode` unset
 * keeps firing the contention check: the default posture stays suspicious, and
 * silence has to be claimed deliberately. Declaring `chained` is a factual
 * claim about how the code composes, and claiming it falsely to quiet the check
 * is the same category of error as filling `arbitration_rule` with a
 * placeholder.
 */
export type SurfaceCompositionMode = 'exclusive' | 'additive' | 'chained'

/** Whether the arbitration answer is enforced, written down, both, or neither.
 *
 * `arbitration_rule` is free text and its absence is meaningful, but absence
 * alone conflates three very different situations with three very different
 * remediations. This property separates them:
 *
 * - `enforced_documented` — the code enforces a rule and `arbitration_rule`
 *   transcribes it. The healthy state.
 * - `enforced_undocumented` — the code enforces a rule that was never written
 *   down. Remediation is ten minutes of transcription, not a design decision.
 * - `safe_by_coincidence` — nothing enforces anything, and the surface behaves
 *   only because the occupants happen not to collide (disjoint enum values,
 *   mutually exclusive conditions). The most dangerous state, because it looks
 *   settled from the outside and breaks the first time an occupant is added.
 * - `none` — nobody ever decided. Remediation is a design meeting.
 *
 * THIS IS NOT AN ESCAPE HATCH. Declaring `enforced_documented` does not by
 * itself silence `contended-surface-without-arbitration`: the detector still
 * requires a non-empty `arbitration_rule`, so claiming the rule is documented
 * without documenting it changes nothing. `safe_by_coincidence` and `none`
 * make the check fire whatever else is recorded, because both are admissions.
 */
export type SurfaceArbitrationState =
  | 'enforced_documented'
  | 'enforced_undocumented'
  | 'safe_by_coincidence'
  | 'none'

/** A place in the UI, its occupants, and the rule that arbitrates between them.
 *
 * `screen` answers *which route is this?*; `feature_area` answers *who owns
 * this?*; `bounded_context` answers *what architecture is this?*. None of them
 * answer *what else occupies the same place, and who wins when two things want
 * it?* A `surface` is that place: the shell, tool, pane, slot, gutter, action
 * bar, or overlay that features compete to occupy. Contention over UI places is
 * decided constantly and, when the decision lives only in prose, rediscovered
 * forever. Recording the place as an entity makes the guest list queryable and
 * the arbitration rule durable.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   nesting: `surface_contains_surface` (the spine; legality is constrained by
 *     `surface_kind` via `UPG_VALID_CHILDREN`)
 *   the guest list: `feature_occupies_surface` (inbound; the most important edge)
 *   the host screen: `screen_renders_surface` (inbound)
 *   purpose: `surface_serves_job`
 *   the governing rule: `surface_governed_by_design_guideline`
 *   what it draws with: `surface_renders_design_component`
 *   how it is judged: `surface_measured_by_metric`
 *   replacement: `surface_supersedes_surface`
 *   intent-versus-reality: `surface_deviates_via_technical_debt_item`
 *
 * @example
 * const properties: SurfaceProperties = {
 *   surface_kind: 'pane',
 *   persistence: 'conditional',
 *   visibility_condition: 'A node is selected and the inspector is not collapsed.',
 *   capacity: 1,
 *   cardinality: '0..n',
 *   instance_scope: 'per_parent',
 *   composition_mode: 'exclusive',
 *   arbitration_rule: 'The most recently selected node wins. A pinned inspector outranks selection until unpinned.',
 *   arbitration_state: 'enforced_documented',
 *   extensibility: 'plugin_registerable',
 *   mutates_content: true,
 *   dimensional_constraint: '292px wide, fixed',
 * }
 */
export interface SurfaceProperties {
  /** Structural kind. Determines what may legally nest inside this surface. */
  surface_kind?: SurfaceKind
  /** How reliably the surface is present. */
  persistence?: SurfacePersistence
  /**
   * When the surface appears, in plain language. Pairs with
   * `persistence: 'conditional'`, which states *that* it is conditional; this
   * states *what* the condition is.
   * @example "A node is selected", "Only for workspace admins"
   */
  visibility_condition?: string
  /**
   * How many occupants ONE INSTANCE of the surface holds at once, as a
   * non-negative count. Count the instances themselves with `cardinality`.
   *
   * CAPACITY IS ALWAYS INTENT, NEVER OBSERVED BEHAVIOUR. It records the cap the
   * design asserts, so a banner region declared `capacity: 1` keeps saying 1
   * even after someone finds it rendering four. Reality that has drifted from
   * the declared intent is recorded as a trackable, assignable debt item on
   * `surface_deviates_via_technical_debt_item`, not by quietly editing this
   * number up to match the bug. Editing it to match would destroy the only
   * record that a gap exists.
   *
   * ABSENT MEANS UNBOUNDED. UPG has no union-typed property primitive
   * (`PropertyDefinition.type` is a single scalar kind), so the proposed
   * `integer | unbounded` shape is expressed as an optional number whose
   * absence carries the "no cap" reading, rather than a magic sentinel value
   * that every consumer would have to special-case. `0` is a real cap meaning
   * "nothing may occupy this surface" (a reserved place), not "unbounded".
   *
   * THREE STATES, AND THEY ARE ALL DIFFERENT. Absent = unbounded, no cap
   * stated. `0` = a reserved place nothing may occupy. `null` = neither of
   * those, and nothing this field defines; it is what you get by writing an
   * explicit null rather than removing the key, and no consumer reads it as a
   * cap. To return this property to ABSENT, remove the key with
   * `update_node`'s or `batch_update_nodes`' `unset_properties`, since a
   * property merge preserves anything you omit.
   *
   * UNBOUNDED IS NOT AN EXEMPTION FROM SCRUTINY. The contention detector reads
   * an absent capacity as a threshold of 1, on the reasoning that a surface
   * which states no limit has stated no answer either, so several occupants is
   * exactly the unrecorded decision worth naming. Declaring a real capacity is
   * therefore the way to quiet the check honestly, and the only way that also
   * records something true.
   */
  capacity?: number
  /**
   * How many instances of this surface exist. `capacity` counts occupants
   * within one instance; this counts the instances.
   */
  cardinality?: SurfaceCardinality
  /**
   * What an instance is scoped to: one shared instance for the product, or one
   * per containing surface. Decides whether "the product has this surface" is
   * a true sentence or a per-parent one.
   */
  instance_scope?: SurfaceInstanceScope
  /**
   * How the occupants relate: one wins (`exclusive`), all coexist
   * (`additive`), or each wraps the next (`chained`). Declaring `chained`
   * exempts the surface from `contended-surface-without-arbitration`; leaving
   * this unset does not.
   */
  composition_mode?: SurfaceCompositionMode
  /**
   * Who wins when more occupants want the surface than `capacity` allows, and
   * why.
   *
   * ABSENCE IS MEANINGFUL: a null or empty `arbitration_rule` on a contested
   * surface means nobody decided, which is exactly what the
   * `contended-surface-without-arbitration` anti-pattern detects. Do not fill
   * this in with a placeholder to silence the check.
   * @example "Highest priority wins; ties break to the most recently updated."
   */
  arbitration_rule?: string
  /**
   * Whether the arbitration answer is enforced, written down, both, or neither.
   * Separates "enforced in code but never transcribed" (ten minutes of typing)
   * from "never decided" (a design meeting) from "safe only because nothing has
   * collided yet" (the dangerous one).
   */
  arbitration_state?: SurfaceArbitrationState
  /** Who may add occupants to the surface. */
  extensibility?: SurfaceExtensibility
  /**
   * Whether occupying this surface can change the underlying content, as
   * opposed to only selecting or revealing it. The selector-versus-mutator
   * distinction: a gutter that toggles a value is a mutator, a gutter that
   * jumps the cursor is not.
   */
  mutates_content?: boolean
  /**
   * The hard spatial budget the surface imposes on its occupants, in whatever
   * unit the design system speaks.
   * @example "292px wide", "25px per field", "two grid columns"
   */
  dimensional_constraint?: string
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
