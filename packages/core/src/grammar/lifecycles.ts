/**
 * UPG Lifecycles. Phase-and-state journeys for entity types with meaningful status.
 *
 * Phase is the universal vocabulary fixed by the spec. State carries granular
 * meaning within a phase. Tools add their own states via `lifecycle_extensions`
 * on the UPG document. Static types (persona, metric, quote) have no lifecycle.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────────────────────────────────────

/** A lifecycle defines the valid phase-and-state journey for an entity type. */
export interface UPGLifecycle {
  /** Which entity type this lifecycle governs. */
  entity_type: string
  /**
   * Identifier of the reusable template this lifecycle was generated from
   * (e.g. `'PUBLISHING'`, `'OPERATIONAL'`), if any.
   *
   * Hand-authored lifecycles leave this `undefined`. Template-derived
   * lifecycles set it via `fromTemplate()` so render and audit tooling can
   * group, label, and link templates without re-detecting them structurally.
   */
  template_id?: string
  /** The universal phases, fixed by the spec and understood by all tools. */
  phases: LifecyclePhase[]
  /** Which phase a new entity of this type starts in. */
  initial_phase: string
  /**
   * Phases representing completion: the end points of normal forward progression.
   *
   * A terminal phase MAY still declare `transitions_to` entries, which represent
   * late-state transitions (e.g., `archived → draft` for republishing, `approved
   * → deprecated` for late retirement, `parked → open` for reopen). These are
   * legitimate domain moves and are NOT forward progression.
   *
   * Consumers treating terminals as "complete":
   * - Dashboards / health scores: treat terminal phases as done for counting.
   * - Status nudges: stop prompting once terminal is reached.
   * - Transition gates: allow terminal → `transitions_to` targets as explicit
   *   late-state moves; forward-progression gates should compare against the
   *   authoring layer (e.g., "moving a `done` task back to `todo` requires
   *   reopening").
   */
  terminal_phases: string[]
}

/** A phase is one broad stage in the entity's lifecycle. */
export interface LifecyclePhase {
  /** Machine-readable phase ID: the universal vocabulary.
   * @example "in_progress" */
  id: string
  /** Human-readable label.
   * @example "In Progress" */
  label: string
  /** What this phase means: guidance for agents and documentation.
   * @example "The solution is actively being built or tested." */
  description: string
  /**
   * Which phases can follow this one: valid transitions at the phase level.
   *
   * On non-terminal phases: forward progression targets.
   * On terminal phases: late-state / reopen / revive paths (optional; often empty).
   *
   * @example ["shipped", "deferred"]
   */
  transitions_to: string[]
  /** Core states defined by the spec, always available in this phase.
   * If omitted, the phase itself is the only state. No nesting needed. */
  core_states?: LifecycleState[]
}

/** A state is a specific position within a phase. */
export interface LifecycleState {
  /** Machine-readable state ID.
   * @example "in_review" */
  id: string
  /** Human-readable label.
   * @example "In Review" */
  label: string
  /** What this state means within the phase.
   * @example "Code complete, awaiting peer review before merge." */
  description: string
  /** Optional: which states within this phase can follow this one.
   * If not defined, transition to any state in the next phase is valid. */
  transitions_to?: string[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Product (root entity)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * product (Strategy domain)
 *
 * The root entity of a product graph. Stages cover the full arc from napkin
 * idea to end-of-life, mirroring `UPGProductStage` from shapes/document.ts
 * (the two must stay in sync; see compile-time assertion below).
 *
 * Transition rule: products generally move forward. Forward-skip
 * transitions are allowed from every earlier stage to any later stage; teams
 * routinely go `concept → beta` or `validation → launch` when conviction is
 * high. The one backward path declared is `maintenance → mature` (recovery)
 * which is rare but real. Any stage may also exit directly to `sunset`
 * (pivot or abandon).
 */
const PRODUCT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'product',
  initial_phase: 'concept',
  terminal_phases: ['sunset'],
  phases: [
    {
      id: 'concept',
      label: 'Concept',
      description:
        'Napkin idea. Problem shape and solution sketch, pre-validation.',
      transitions_to: ['validation', 'build', 'beta', 'launch', 'growth', 'mature', 'sunset'],
    },
    {
      id: 'validation',
      label: 'Validation',
      description:
        'Testing demand. User conversations and experiments pressure-test assumptions before build commits.',
      transitions_to: ['build', 'beta', 'launch', 'growth', 'mature', 'sunset'],
    },
    {
      id: 'build',
      label: 'Build',
      description:
        'Actively developing v1. Core functionality is being authored, pre-user.',
      transitions_to: ['beta', 'launch', 'growth', 'mature', 'sunset'],
    },
    {
      id: 'beta',
      label: 'Beta',
      description:
        'Early users, iterating. Feature-complete enough to learn from, still changing weekly.',
      transitions_to: ['launch', 'growth', 'mature', 'maintenance', 'sunset'],
    },
    {
      id: 'launch',
      label: 'Launch',
      description:
        'Generally available. Announced to the target audience, open past beta access.',
      transitions_to: ['growth', 'mature', 'maintenance', 'sunset'],
    },
    {
      id: 'growth',
      label: 'Growth',
      description:
        'Scaling users and revenue. Product fit validated; focus is acquisition, retention, expansion.',
      transitions_to: ['mature', 'maintenance', 'sunset'],
    },
    {
      id: 'mature',
      label: 'Mature',
      description:
        'Stable. Growth levelled; investment weights toward optimisation, efficiency, and durability.',
      transitions_to: ['maintenance', 'sunset'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      description:
        'Sustaining. Minimal investment keeps the product running for existing users. Can transition back to `mature` on a strategic revival.',
      transitions_to: ['mature', 'sunset'],
    },
    {
      id: 'sunset',
      label: 'Sunset',
      description:
        'Winding down or retired. Existing users are being migrated or offboarded.',
      transitions_to: [],
    },
  ],
}

// Runtime guard for PRODUCT_LIFECYCLE ↔ UPGProductStage coherence lives in
// src/__tests__/spec-integrity.test.ts ("Lifecycle integrity → product
// lifecycle phases match UPGProductStage"). A type-level assertion would need
// PRODUCT_LIFECYCLE's phase ids preserved as literals, but the UPGLifecycle
// annotation widens them; the runtime test is the simpler contract.

// ─────────────────────────────────────────────────────────────────────────────
// Discovery & Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * research_study (UX Research domain)
 *
 * A study progresses from planning through execution, analysis, and conclusion.
 * The `complete` phase is terminal; findings are captured in `research_study`
 * children (insight, quote) after the study concludes.
 */
const RESEARCH_STUDY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'research_study',
  initial_phase: 'planned',
  terminal_phases: ['complete'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The study has been scoped and scheduled. Research questions are defined, method is chosen, participants have not yet been recruited or sessions started.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Research sessions are actively running. Participants are being interviewed, observed, or surveyed. Data is being collected.',
      transitions_to: ['analysing'],
    },
    {
      id: 'analysing',
      label: 'Analysing',
      description:
        'Data collection is complete. The team is reviewing recordings, notes, and responses to identify patterns and insights.',
      transitions_to: ['complete'],
    },
    {
      id: 'complete',
      label: 'Complete',
      description:
        'Analysis is done. Insights have been captured and shared. The study is a historical record.',
      transitions_to: [],
    },
  ],
}

/**
 * need (Users & Needs domain)
 *
 * A need's maturity reflects how well it is understood and prioritised.
 * `raw` needs have been captured but not yet validated with evidence.
 * `prioritized` is terminal; the need is ready to inform opportunity framing.
 */
const NEED_LIFECYCLE: UPGLifecycle = {
  entity_type: 'need',
  initial_phase: 'raw',
  terminal_phases: ['prioritized'],
  phases: [
    {
      id: 'raw',
      label: 'Raw',
      description:
        'Captured from an interview, observation, or support ticket. Articulation may be rough; may duplicate an existing need.',
      transitions_to: ['validated'],
    },
    {
      id: 'validated',
      label: 'Validated',
      description:
        'Corroborated by multiple data points or targeted research. The team agrees it is a real, recurring need.',
      transitions_to: ['prioritized'],
    },
    {
      id: 'prioritized',
      label: 'Prioritized',
      description:
        'Ranked against other needs. Ready to inform opportunity definition and solution exploration.',
      transitions_to: [],
    },
  ],
}

/**
 * opportunity (Discovery domain)
 *
 * An opportunity moves from identification through validation.
 * `deferred` is not terminal; an opportunity can always be revisited.
 * The lifecycle reflects the confidence the team has in pursuing it.
 */
const OPPORTUNITY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'opportunity',
  initial_phase: 'identified',
  terminal_phases: [],
  phases: [
    {
      id: 'identified',
      label: 'Identified',
      description:
        'A problem worth solving has been named. Sources include needs, insights, market trends, or competitive signals. Sizing and validation come next.',
      transitions_to: ['validated', 'deferred'],
    },
    {
      id: 'validated',
      label: 'Validated',
      description:
        'Research and evidence support pursuit. The problem is real, frequent, and painful enough to justify investment.',
      transitions_to: ['deferred'],
    },
    {
      id: 'deferred',
      label: 'Deferred',
      description:
        'Acknowledged but parked. Capacity, priority, or strategic timing reasons. Can be reopened.',
      transitions_to: ['identified'],
    },
  ],
}

/**
 * solution (Discovery domain)
 *
 * A solution's lifecycle tracks its journey from proposal through delivery.
 * `shipped` is the primary terminal phase. `deferred` is not terminal; a
 * solution can be reopened. This mirrors the canonical example in the lifecycle
 * design doc.
 */
const SOLUTION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'solution',
  initial_phase: 'proposed',
  terminal_phases: ['shipped'],
  phases: [
    {
      id: 'proposed',
      label: 'Proposed',
      description:
        'Identified as a possible response to an opportunity. Pre-commitment, pre-feasibility.',
      transitions_to: ['in_progress', 'deferred'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'A team is actively building, testing, or refining the solution.',
      transitions_to: ['shipped', 'deferred'],
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description:
        'Delivered to users. Live in the product.',
      transitions_to: ['deferred'],
    },
    {
      id: 'deferred',
      label: 'Deferred',
      description:
        'Acknowledged but parked. Capacity, priority, or a change in direction. Can be reopened.',
      transitions_to: ['proposed'],
    },
  ],
}

/**
 * hypothesis (Validation domain, v0.2.8 split 3)
 *
 * The stable templated belief (UCS pattern P5, templated-statement).
 * Unlike the legacy hypothesis, the claim is **lifecycle-bearing** because
 * the belief itself progresses through clear states: it's `drafted` (still
 * being written), `active` (committed and being tested by experiments and
 * evidence), `validated` (evidence sufficiently supports it), `invalidated`
 * (evidence sufficiently refutes it), or `archived` (set aside without
 * resolution: superseded by a new claim, deprioritised, etc.).
 *
 * The paired `hypothesis_evidence` is lifecycle-free; each evidence row
 * is a snapshot of a moment, not a state machine.
 *
 * Reopen path: `validated` and `invalidated` can transition back to
 * `active` if new evidence materially changes the picture (e.g. follow-up
 * experiment with different conditions). `archived` can return to `active`
 * if the team decides to revisit.
 */
const HYPOTHESIS_CLAIM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'hypothesis',
  initial_phase: 'drafted',
  terminal_phases: ['validated', 'invalidated', 'archived'],
  phases: [
    {
      id: 'drafted',
      label: 'Drafted',
      description:
        'The claim is being written. We_believe / will_result_in / we_know_when may not yet be complete. Not yet committed for testing.',
      transitions_to: ['active', 'archived'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The claim is committed and being tested. Experiments may be running; evidence may be accruing via supports/refutes edges. current_confidence updates as evidence weight shifts.',
      transitions_to: ['validated', 'invalidated', 'archived'],
    },
    {
      id: 'validated',
      label: 'Validated',
      description:
        'Evidence sufficiently supports the claim. The belief held. Reopens to `active` if new evidence materially changes the picture.',
      transitions_to: ['active'],
    },
    {
      id: 'invalidated',
      label: 'Invalidated',
      description:
        'Evidence sufficiently refutes the claim. The belief did not hold. Reopens to `active` if new evidence materially changes the picture.',
      transitions_to: ['active'],
    },
    {
      id: 'archived',
      label: 'Archived',
      description:
        'Set aside without resolution: superseded by a new claim, deprioritised, or no longer relevant. Reopens to `active` if revisited.',
      transitions_to: ['active'],
    },
  ],
}

/**
 * experiment (Validation domain)
 *
 * @deprecated since v0.2.6. The original lifecycle straddled plan-shape phases
 * (`planned`) and run-shape phases (`running`, `analysing`, `done`) on the
 * same entity, a textbook dual-shape entity per the UPG dual-shape audit.
 * See `EXPERIMENT_PLAN_LIFECYCLE` (plan-shape phases) and
 * `EXPERIMENT_RUN_LIFECYCLE` (run-shape phases) below for the post-split
 * lifecycles. Retained for one version while consumers migrate; narrows to
 * `never` in v0.2.7.
 */
const EXPERIMENT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'experiment',
  initial_phase: 'planned',
  terminal_phases: ['done'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The experiment has been designed. Method, sample size, success criteria, and timeline are defined. It has not started yet.',
      transitions_to: ['running'],
    },
    {
      id: 'running',
      label: 'Running',
      description:
        'The experiment is live and collecting data. Traffic is being split, interviews are being conducted, or surveys are being distributed.',
      transitions_to: ['analysing'],
    },
    {
      id: 'analysing',
      label: 'Analysing',
      description:
        'Data collection is complete. The team is reviewing results, running statistical analysis, and deriving conclusions.',
      transitions_to: ['done'],
    },
    {
      id: 'done',
      label: 'Done',
      description:
        'The experiment is concluded. Learnings have been captured. The experiment is a historical record.',
      transitions_to: [],
    },
  ],
}

/**
 * experiment_plan (Validation domain, v0.2.6 split 1)
 *
 * Plan-shape lifecycle. An `experiment_plan` is a planning artefact: it
 * captures intent (method, success criteria, target metric, projected
 * reach/impact, ownership, planned dates) before the actual run exists.
 * Once a plan is `approved` and a run begins, an `experiment_run` is
 * spawned and linked back via `experiment_plan_ran_as_experiment_run`.
 *
 * Plans are not the place where evidence accrues; that lives on the
 * paired `experiment_run`.
 *
 * Initial: `drafted`. Terminals: `cancelled` (plan never ran, abandoned)
 * and `approved` (plan ran or is running; the run carries forward
 * progress; a plan stays `approved` even after its runs complete).
 */
const EXPERIMENT_PLAN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'experiment_plan',
  initial_phase: 'drafted',
  terminal_phases: ['approved', 'cancelled'],
  phases: [
    {
      id: 'drafted',
      label: 'Drafted',
      description:
        'The plan is being written. Method, success criteria, target metric, projected reach/impact, ownership, and planned dates are being defined. Not yet approved.',
      transitions_to: ['scheduled', 'cancelled'],
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      description:
        'The plan is approved and slotted for execution. Resources committed; awaiting start date.',
      transitions_to: ['approved', 'cancelled'],
    },
    {
      id: 'approved',
      label: 'Approved',
        description:
        'Past scheduling: at least one run has started or completed against this plan. The plan is now a stable design artefact; future updates create a new plan.',
      transitions_to: [],
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      description:
        'The plan was abandoned before any run started. Reason should be documented in description or via an attached decision.',
      transitions_to: [],
    },
  ],
}

/**
 * experiment_run (Validation domain, v0.2.6 split 1)
 *
 * Run-shape lifecycle. An `experiment_run` is the execution event linked
 * back to its parent `experiment_plan` via `experiment_plan_ran_as_experiment_run`.
 * A single plan may have N runs (re-execution); each run is its own event
 * with its own actual dates, observed reach, outcome, and disposition.
 *
 * Runs are where evidence accrues; the `validates`, `produced_insight`,
 * and `informed_decision` edges all originate here.
 *
 * Initial: `in_progress`. Terminals: `complete` (the run finished and a
 * disposition was recorded) and `aborted` (the run terminated early
 * without a valid finding).
 */
const EXPERIMENT_RUN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'experiment_run',
  initial_phase: 'in_progress',
  terminal_phases: ['complete', 'aborted'],
  phases: [
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'The run is actively collecting data. Traffic is being split, interviews are happening, or surveys are out. Outcome and disposition are not yet recorded.',
      transitions_to: ['complete', 'aborted'],
    },
    {
      id: 'complete',
      label: 'Complete',
      description:
        'Data collection finished and a disposition was recorded (confirmed, disconfirmed, or inconclusive). Learnings captured; outcome edges (validates, produced_insight, informed_decision) wired to downstream entities.',
      transitions_to: [],
    },
    {
      id: 'aborted',
      label: 'Aborted',
      description:
        'Terminated early without a valid finding: infrastructure failure, exposure threshold not met, or the underlying plan was withdrawn. No disposition recorded.',
      transitions_to: [],
    },
  ],
}

/**
 * research_plan (Validation domain)
 *
 * A research plan is a planning artefact that precedes an experiment or study.
 * It moves from draft through active execution to completion or abandonment.
 */
const RESEARCH_PLAN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'research_plan',
  initial_phase: 'draft',
  terminal_phases: ['completed', 'abandoned'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The plan is being written. Research question, suggested methods, and evidence threshold are being defined. Not yet approved for execution.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The plan has been approved and is being executed. Research sessions are underway or scheduled.',
      transitions_to: ['completed', 'abandoned'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'The planned research has been carried out and learnings have been captured. The plan is a historical record.',
      transitions_to: [],
    },
    {
      id: 'abandoned',
      label: 'Abandoned',
      description:
        'Not executed: changing priorities, a decision no longer needing validation, or resource constraints.',
      transitions_to: [],
    },
  ],
}

/**
 * feedback_program (Customer Feedback domain)
 *
 * A feedback program is a sustained effort to collect structured signals
 * from customers. It moves from planning to active operation.
 * `retired` is terminal; a retired program can be replaced by a new one.
 */
const FEEDBACK_PROGRAM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feedback_program',
  initial_phase: 'planning',
  terminal_phases: ['retired'],
  phases: [
    {
      id: 'planning',
      label: 'Planning',
      description:
        'The program is being designed. Goals, audience, collection method, and cadence are being defined. No feedback is being collected yet.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The program is running. Feedback is being collected and processed on the defined cadence.',
      transitions_to: ['paused', 'retired'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'Collection has been temporarily suspended. The program will resume.',
      transitions_to: ['active', 'retired'],
    },
    {
      id: 'retired',
      label: 'Retired',
      description:
        'The program has ended. It is no longer collecting feedback. Historical data is preserved.',
      transitions_to: [],
    },
  ],
}

/**
 * feature_request (Customer Feedback domain)
 *
 * A feature request progresses from submission through triage, planning,
 * and delivery. `shipped` is the positive terminal; `wont_do` is the negative
 * terminal. `new` and `under_review` represent the triage funnel.
 */
const FEATURE_REQUEST_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feature_request',
  initial_phase: 'new',
  terminal_phases: ['shipped', 'wont_do'],
  phases: [
    {
      id: 'new',
      label: 'New',
      description:
        'The request has been submitted. It has not yet been reviewed by the product team.',
      transitions_to: ['under_review'],
    },
    {
      id: 'under_review',
      label: 'Under Review',
      description:
        'The request is being triaged. The product team is assessing feasibility, demand, and strategic fit.',
      transitions_to: ['planned', 'wont_do'],
    },
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The request has been accepted and is on the roadmap. It is scheduled for a future release cycle.',
      transitions_to: ['in_progress', 'wont_do'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Work on fulfilling the request is actively underway.',
      transitions_to: ['shipped'],
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description:
        'The requested capability has been delivered to users.',
      transitions_to: [],
    },
    {
      id: 'wont_do',
      label: "Won't Do",
      description:
        'Declined: strategic misalignment, infeasibility, or insufficient demand.',
      transitions_to: [],
    },
  ],
}

/**
 * beta_program (Customer Feedback domain)
 *
 * A beta program recruits users to test a feature before general availability.
 * `graduated` means the feature shipped to GA. `closed` means the beta ended
 * without graduating.
 */
const BETA_PROGRAM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'beta_program',
  initial_phase: 'recruiting',
  terminal_phases: ['graduated', 'closed'],
  phases: [
    {
      id: 'recruiting',
      label: 'Recruiting',
      description:
        'The program is accepting applications. Beta participants are being identified and onboarded.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'Beta participants have access and are using the feature. Feedback is being collected.',
      transitions_to: ['graduated', 'closed'],
    },
    {
      id: 'graduated',
      label: 'Graduated',
      description:
        'The beta was successful and the feature has progressed to general availability.',
      transitions_to: [],
    },
    {
      id: 'closed',
      label: 'Closed',
      description:
        'The beta ended without graduating to GA. The feature was deprioritised, pivoted, or missed exit criteria.',
      transitions_to: [],
    },
  ],
}

/**
 * user_advisory_board (Customer Feedback domain)
 *
 * A user advisory board (UAB) convenes a group of representative customers
 * to provide strategic feedback. It moves from formation through active
 * engagement. `retired` is terminal.
 */
const USER_ADVISORY_BOARD_LIFECYCLE: UPGLifecycle = {
  entity_type: 'user_advisory_board',
  initial_phase: 'recruiting',
  terminal_phases: ['retired'],
  phases: [
    {
      id: 'recruiting',
      label: 'Recruiting',
      description:
        'Members are being identified and invited. The board is not yet convened.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The board is convened and meeting regularly. Members are providing strategic input.',
      transitions_to: ['paused', 'retired'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'Board activities are temporarily suspended. Membership is retained and sessions will resume.',
      transitions_to: ['active', 'retired'],
    },
    {
      id: 'retired',
      label: 'Retired',
      description:
        'The board has been disbanded. Members are no longer engaged in an advisory capacity.',
      transitions_to: [],
    },
  ],
}

/**
 * design_sprint (Discovery domain)
 *
 * A design sprint is a time-boxed exploration of an opportunity. `completed`
 * is terminal.
 */
const DESIGN_SPRINT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'design_sprint',
  initial_phase: 'planning',
  terminal_phases: ['completed'],
  phases: [
    {
      id: 'planning',
      label: 'Planning',
      description:
        'The sprint challenge has been defined. Participants are identified. Space and materials are being arranged.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'The sprint is running. The team is moving through understand, sketch, decide, prototype, and test phases.',
      transitions_to: ['completed'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'The sprint has concluded. Decisions and prototypes have been captured. Learnings inform next steps.',
      transitions_to: [],
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy & Product Specification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * objective (Strategy domain)
 *
 * An objective is an OKR-style goal for a planning period. `achieved` is the
 * positive terminal. `deferred` is not terminal; an objective can be carried
 * forward to the next planning period.
 */
const OBJECTIVE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'objective',
  initial_phase: 'draft',
  terminal_phases: ['achieved', 'missed'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The objective is being written. Key results have not yet been attached or approved.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The objective is in the current planning period. Key results are being measured and progress is tracked.',
      transitions_to: ['achieved', 'missed', 'deferred'],
    },
    {
      id: 'achieved',
      label: 'Achieved',
      description:
        'The objective was met or exceeded within the planning period.',
      transitions_to: [],
    },
    {
      id: 'missed',
      label: 'Missed',
      description:
        'The planning period ended without achieving the objective. Learnings inform the next cycle.',
      transitions_to: [],
    },
    {
      id: 'deferred',
      label: 'Deferred',
      description:
        'The objective was not completed this period and is being carried forward. Can be reopened as active.',
      transitions_to: ['active'],
    },
  ],
}

/**
 * key_result (Strategy domain)
 *
 * A key result measures progress toward an objective. Health states
 * (`on_track`, `at_risk`, `behind`) are concurrent during the tracking period.
 * Any health state can transition to `achieved` when the target is hit.
 */
const KEY_RESULT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'key_result',
  initial_phase: 'on_track',
  terminal_phases: ['achieved'],
  phases: [
    {
      id: 'on_track',
      label: 'On Track',
      description:
        'Current measured value is progressing at a rate that should reach the target by the deadline.',
      transitions_to: ['at_risk', 'behind', 'achieved'],
    },
    {
      id: 'at_risk',
      label: 'At Risk',
      description:
        'Progress is slowing. Without intervention, the target may not be reached by the deadline.',
      transitions_to: ['on_track', 'behind', 'achieved'],
    },
    {
      id: 'behind',
      label: 'Behind',
      description:
        'Unlikely to reach the target at the current rate. The team needs to reassess strategy or accept a miss.',
      transitions_to: ['on_track', 'at_risk', 'achieved'],
    },
    {
      id: 'achieved',
      label: 'Achieved',
      description:
        'The target value has been reached or exceeded.',
      transitions_to: [],
    },
  ],
}

/**
 * strategic_theme (Strategy domain)
 *
 * A strategic theme is a sustained area of focus across planning periods.
 * `completed` is terminal. `paused` allows temporary suspension without closing.
 */
const STRATEGIC_THEME_LIFECYCLE: UPGLifecycle = {
  entity_type: 'strategic_theme',
  initial_phase: 'active',
  terminal_phases: ['completed'],
  phases: [
    {
      id: 'active',
      label: 'Active',
      description:
        'The theme is a current organisational focus. Initiatives and objectives are being run under it.',
      transitions_to: ['completed', 'paused'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'The theme is deprioritised for this period but is not being retired. It will resume.',
      transitions_to: ['active', 'completed'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'The theme has run its course. The focus area has been addressed or superseded by a new theme.',
      transitions_to: [],
    },
  ],
}

/**
 * initiative (Strategy domain)
 *
 * An initiative is a time-bounded programme of work. `completed` and
 * `abandoned` are both terminal. `cancelled` is a formal close with a
 * decision record.
 */
const INITIATIVE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'initiative',
  initial_phase: 'proposed',
  terminal_phases: ['completed', 'abandoned'],
  phases: [
    {
      id: 'proposed',
      label: 'Proposed',
      description:
        'The initiative has been put forward but not yet approved for resourcing. Business case is being evaluated.',
      transitions_to: ['in_progress', 'abandoned'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'The initiative has been approved and work is underway. Teams are executing against it.',
      transitions_to: ['completed', 'abandoned'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'The initiative has achieved its goals and been formally closed.',
      transitions_to: [],
    },
    {
      id: 'abandoned',
      label: 'Abandoned',
      description:
        'Stopped before completion: changing strategy, resource constraints, or learning that the goal is no longer relevant.',
      transitions_to: [],
    },
  ],
}

/**
 * strategic_pillar (Strategy domain)
 *
 * A strategic pillar is a foundational commitment that shapes the product
 * strategy. `sunset` is terminal.
 */
const STRATEGIC_PILLAR_LIFECYCLE: UPGLifecycle = {
  entity_type: 'strategic_pillar',
  initial_phase: 'proposed',
  terminal_phases: ['sunset'],
  phases: [
    {
      id: 'proposed',
      label: 'Proposed',
      description:
        'The pillar has been articulated but not yet ratified by leadership as a strategic commitment.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The pillar is a live strategic commitment. Decisions, themes, and initiatives are aligned to it.',
      transitions_to: ['sunset'],
    },
    {
      id: 'sunset',
      label: 'Sunset',
      description:
        'Retired: achieved, superseded by a new direction, or no longer reflects strategic reality.',
      transitions_to: [],
    },
  ],
}

/**
 * assumption (Strategy domain)
 *
 * A strategic assumption is a belief that underlies a decision. Unlike a
 * hypothesis, it may never be formally tested. `validated` and `invalidated`
 * are both terminal; once tested, an assumption becomes knowledge.
 */
const ASSUMPTION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'assumption',
  initial_phase: 'untested',
  terminal_phases: ['validated', 'invalidated'],
  phases: [
    {
      id: 'untested',
      label: 'Untested',
      description:
        'Stated and acknowledged, awaiting systematic test. Some strategic assumptions stay untested by design.',
      transitions_to: ['testing'],
    },
    {
      id: 'testing',
      label: 'Testing',
      description:
        'An experiment or research activity is underway to test this assumption. Evidence is being gathered.',
      transitions_to: ['validated', 'invalidated'],
    },
    {
      id: 'validated',
      label: 'Validated',
      description:
        'Evidence supports the assumption. The belief has been confirmed. Decisions resting on it are on firmer ground.',
      transitions_to: [],
    },
    {
      id: 'invalidated',
      label: 'Invalidated',
      description:
        'Evidence contradicts the assumption. Decisions or plans that rested on it should be revisited.',
      transitions_to: [],
    },
  ],
}

/**
 * strategic_question (Strategy domain)
 *
 * Open -> resolved. A strategic_question is an unresolved coordination or
 * ownership question a plan is exposed to (who owns a capability across teams,
 * where a boundary falls after a reorg). It is settled once the plan gains an
 * answer, captured in the `resolution` property. Mirrors research_question's
 * open->answered loop but stays in strategy-domain vocabulary. `resolved` can
 * reopen if the answer unravels.
 */
const STRATEGIC_QUESTION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'strategic_question',
  initial_phase: 'open',
  terminal_phases: ['resolved'],
  phases: [
    { id: 'open', label: 'Open', description: 'The question has been raised but not yet answered. The plan is exposed to it.', transitions_to: ['resolved'] },
    { id: 'resolved', label: 'Resolved', description: 'The question has been answered; the resolution is captured. The plan is no longer exposed to it. May reopen if the answer unravels.', transitions_to: ['open'] },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Strategy / OKR
// ─────────────────────────────────────────────────────────────────────────────

/**
 * outcome (Strategy domain)
 *
 * The measurable result a strategy aims to drive. Resolves the earlier
 * forward-ref ("goal → measuring → achieved / abandoned"). An outcome
 * starts as `identified`, enters `measuring` once instrumentation is in
 * place, then settles to `achieved` or `abandoned`. Abandoned outcomes
 * may resume measurement if the team revisits them.
 */
const OUTCOME_LIFECYCLE: UPGLifecycle = {
  entity_type: 'outcome',
  initial_phase: 'identified',
  terminal_phases: ['achieved', 'abandoned'],
  phases: [
    { id: 'identified', label: 'Identified', description: 'The outcome has been named: the team agrees on what success looks like, but is not yet measuring it.', transitions_to: ['measuring', 'abandoned'] },
    { id: 'measuring', label: 'Measuring', description: 'Instrumentation is live. Progress is being tracked against the outcome.', transitions_to: ['achieved', 'abandoned'] },
    { id: 'achieved', label: 'Achieved', description: 'The outcome was reached. Captured for the record; no further pursuit required.', transitions_to: [] },
    { id: 'abandoned', label: 'Abandoned', description: 'Pursuit was stopped. Strategy shifted, the outcome lost relevance, or the cost outweighed value. May resume to `measuring` if the team revisits it.', transitions_to: ['measuring'] },
  ],
}

/**
 * vision (Strategy domain)
 *
 * Visions evolve over time. Drafting → ratified (in force) → revised
 * (a new version is in force, this one is recorded as a milestone) →
 * archived. Revised visions can return to drafting for further iteration.
 */
const VISION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'vision',
  initial_phase: 'drafting',
  terminal_phases: ['ratified', 'revised', 'archived'],
  phases: [
    { id: 'drafting', label: 'Drafting', description: 'Vision is being authored or rewritten. Not yet adopted.', transitions_to: ['ratified', 'archived'] },
    { id: 'ratified', label: 'Ratified', description: 'The current, in-force vision. The team has aligned around it.', transitions_to: ['revised', 'archived'] },
    { id: 'revised', label: 'Revised', description: 'Superseded by a newer vision but kept as a recorded milestone. May reopen to drafting if revisited.', transitions_to: ['drafting'] },
    { id: 'archived', label: 'Archived', description: 'No longer in force. Retained for historical reference.', transitions_to: ['drafting'] },
  ],
}

/**
 * mission (Strategy domain)
 *
 * Missions are more stable than visions; they describe the enduring
 * purpose. Drafting → active → archived. Reopen path lets a retired
 * mission be revived (e.g. when a sunset product is brought back).
 */
const MISSION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'mission',
  initial_phase: 'drafting',
  terminal_phases: ['active', 'archived'],
  phases: [
    { id: 'drafting', label: 'Drafting', description: 'Mission is being authored or rewritten. Not yet adopted.', transitions_to: ['active', 'archived'] },
    { id: 'active', label: 'Active', description: 'The current, in-force mission. Guides product and organisational decisions.', transitions_to: ['archived'] },
    { id: 'archived', label: 'Archived', description: 'No longer in force. May reopen to drafting if the team revisits.', transitions_to: ['drafting'] },
  ],
}

/**
 * capability (Strategy domain)
 *
 * A capability is an organisational competency. Planned → building →
 * operational → retired. Operational is the "achieved" terminal;
 * retired covers end-of-life. Reopen from retired allows reinvestment.
 */
const CAPABILITY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'capability',
  initial_phase: 'planned',
  terminal_phases: ['operational', 'retired'],
  phases: [
    { id: 'planned', label: 'Planned', description: 'Capability has been identified as needed but development has not started.', transitions_to: ['building', 'retired'] },
    { id: 'building', label: 'Building', description: 'Active development: people, processes, or systems are being put in place.', transitions_to: ['operational', 'retired'] },
    { id: 'operational', label: 'Operational', description: 'Capability is in place and functioning. The organisation can rely on it.', transitions_to: ['retired'] },
    { id: 'retired', label: 'Retired', description: 'No longer maintained. May reopen to building if the capability is reinvested in.', transitions_to: ['building'] },
  ],
}

/**
 * feature_area (Product Specification domain)
 *
 * A feature area is a structural grouping of features. It follows a
 * simple maturity lifecycle from planning through active use to deprecation.
 */
const FEATURE_AREA_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feature_area',
  initial_phase: 'planned',
  terminal_phases: ['deprecated'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The feature area has been defined as an organising concept but no features have been built under it yet.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The feature area contains live features and is actively being developed.',
      transitions_to: ['deprecated'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The feature area is no longer being developed. It may still exist in the product but no new features are being added.',
      transitions_to: [],
    },
  ],
}

/**
 * feature (Product Specification domain)
 *
 * A feature tracks its journey from conception to delivery and eventual
 * archival. `archived` is terminal.
 */
const FEATURE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feature',
  initial_phase: 'proposed',
  terminal_phases: ['archived'],
  phases: [
    {
      id: 'proposed',
      label: 'Proposed',
      description:
        'The feature has been suggested and is under consideration. It is not yet on the roadmap.',
      transitions_to: ['in_progress', 'archived'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'The feature is actively being designed and built.',
      transitions_to: ['shipped'],
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description:
        'The feature is live in the product and available to users.',
      transitions_to: ['archived'],
    },
    {
      id: 'archived',
      label: 'Archived',
      description:
        'The feature has been removed from the product or superseded. It is retained as a historical record.',
      transitions_to: [],
    },
  ],
}

/**
 * epic (Product Specification domain)
 *
 * An epic is a large body of work spanning multiple sprints. It uses the
 * canonical Agile lifecycle.
 */
const EPIC_LIFECYCLE: UPGLifecycle = {
  entity_type: 'epic',
  initial_phase: 'todo',
  terminal_phases: ['done'],
  phases: [
    {
      id: 'todo',
      label: 'To Do',
      description:
        'The epic has been defined and scoped but work has not started. It is in the backlog.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Work on the epic is underway. Stories are being pulled into sprints.',
      transitions_to: ['done'],
    },
    {
      id: 'done',
      label: 'Done',
      description:
        'All stories in the epic have been completed and the epic goal has been achieved.',
      transitions_to: [],
    },
  ],
}

// `user_story` (re-canonicalised from `story_statement` at v0.7.0/) is
// the templated "As X, I want Y so Z" promise, a stable design artefact, NOT a
// state machine. It is lifecycle-free (declared in `UPG_LIFECYCLE_FREE_TYPES`
// below): a promise either holds or is superseded. The paired `task` carries the
// WORK_ITEM lifecycle (todo → in_progress → in_review → done) and implements the
// statement via `task_implements_user_story`.
//
// (Pre-v0.2.7 the bundled `user_story` had its own draft → ready → in_progress →
// done lifecycle, which conflated statement-shape state with task-shape state.
// The v0.2.7 split moved that lifecycle onto the task; the statement became
// lifecycle-free.)

/**
 * release (Product Specification domain)
 *
 * A release tracks the delivery of a versioned bundle of features.
 * `shipped` is terminal.
 */
const RELEASE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'release',
  initial_phase: 'planned',
  terminal_phases: ['shipped'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The release is defined and scheduled. Features are scoped but not all completed.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Features are being built. The release is open for development.',
      transitions_to: ['shipped'],
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description:
        'The release has been deployed to production and is available to users.',
      transitions_to: [],
    },
  ],
}

/**
 * task (Product Specification domain)
 *
 * A task is the smallest unit of tracked work. `in_review` captures the
 * code review stage before completion.
 */
const TASK_LIFECYCLE: UPGLifecycle = {
  entity_type: 'task',
  initial_phase: 'todo',
  terminal_phases: ['done'],
  phases: [
    {
      id: 'todo',
      label: 'To Do',
      description:
        'The task is defined and ready to be picked up.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'A team member is actively working on this task.',
      transitions_to: ['in_review', 'done'],
    },
    {
      id: 'in_review',
      label: 'In Review',
      description:
        'Work is complete and awaiting review, approval, or verification.',
      transitions_to: ['in_progress', 'done'],
    },
    {
      id: 'done',
      label: 'Done',
      description:
        'The task is complete and verified.',
      transitions_to: [],
    },
  ],
}

/**
 * bug (Product Specification domain)
 *
 * A bug tracks a defect through discovery, investigation, fix, and verification.
 * `wont_fix` is a deliberate terminal state when the team decides not to address it.
 */
const BUG_LIFECYCLE: UPGLifecycle = {
  entity_type: 'bug',
  initial_phase: 'open',
  terminal_phases: ['verified', 'wont_fix'],
  phases: [
    {
      id: 'open',
      label: 'Open',
      description:
        'The bug has been reported but not yet triaged or assigned.',
      transitions_to: ['in_progress', 'wont_fix'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'A developer is investigating and/or fixing the bug.',
      transitions_to: ['fixed', 'wont_fix'],
    },
    {
      id: 'fixed',
      label: 'Fixed',
      description:
        'A fix has been implemented and merged. Awaiting verification in the target environment.',
      transitions_to: ['verified', 'open'],
    },
    {
      id: 'verified',
      label: 'Verified',
      description:
        'The fix has been confirmed to resolve the bug in the target environment.',
      transitions_to: [],
    },
    {
      id: 'wont_fix',
      label: "Won't Fix",
      description:
        'Declined: by design, too costly relative to impact, or superseded by other work.',
      transitions_to: [],
    },
  ],
}

/**
 * roadmap_item (Product Specification domain)
 *
 * A roadmap item tracks a planned deliverable over time. `deferred` is not
 * terminal; items can be rescheduled.
 */
const ROADMAP_ITEM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'roadmap_item',
  initial_phase: 'planned',
  terminal_phases: ['shipped'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The item is on the roadmap and scheduled for a future period.',
      transitions_to: ['in_progress', 'deferred'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Work on this roadmap item is underway.',
      transitions_to: ['shipped', 'deferred'],
    },
    {
      id: 'shipped',
      label: 'Shipped',
      description:
        'The roadmap item has been delivered.',
      transitions_to: [],
    },
    {
      id: 'deferred',
      label: 'Deferred',
      description:
        'The item has been pushed to a later period. It remains on the roadmap.',
      transitions_to: ['planned'],
    },
  ],
}

/**
 * ip_asset (Legal domain)
 *
 * An IP asset (patent, trademark, copyright, trade secret) follows a
 * legal filing lifecycle. `expired` and `abandoned` are both terminal.
 * Note: copyright has no filing phase; it may start at `pending` or `granted`.
 */
const IP_ASSET_LIFECYCLE: UPGLifecycle = {
  entity_type: 'ip_asset',
  initial_phase: 'filed',
  terminal_phases: ['expired', 'abandoned'],
  phases: [
    {
      id: 'filed',
      label: 'Filed',
      description:
        'The IP application has been submitted to the relevant authority. Acknowledgement of filing is pending.',
      transitions_to: ['pending', 'abandoned'],
    },
    {
      id: 'pending',
      label: 'Pending',
      description:
        'The application has been acknowledged and is under examination by the relevant authority.',
      transitions_to: ['granted', 'abandoned'],
    },
    {
      id: 'granted',
      label: 'Granted',
      description:
        'The IP right has been formally granted. Protection is in force.',
      transitions_to: ['expired', 'abandoned'],
    },
    {
      id: 'expired',
      label: 'Expired',
      description:
        'The IP protection period has ended naturally.',
      transitions_to: [],
    },
    {
      id: 'abandoned',
      label: 'Abandoned',
      description:
        'Abandoned: non-payment of renewal fees, withdrawal of the application, or a decision to stop defending it.',
      transitions_to: [],
    },
  ],
}

/**
 * contract (Legal domain)
 *
 * A contract moves through drafting, review, execution, and expiry.
 * `expired` and `terminated` are both terminal.
 */
const CONTRACT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'contract',
  initial_phase: 'draft',
  terminal_phases: ['expired', 'terminated'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The contract is being written. Terms are not yet agreed by all parties.',
      transitions_to: ['in_review'],
    },
    {
      id: 'in_review',
      label: 'In Review',
      description:
        'The draft is under review by legal counsel or the counterparty. Negotiations may be ongoing.',
      transitions_to: ['signed', 'draft'],
    },
    {
      id: 'signed',
      label: 'Signed',
      description:
        'All parties have signed. The contract is executed and legally binding, but the effective period may not have started yet.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The contract is in its effective period. Obligations are in force.',
      transitions_to: ['expired', 'terminated'],
    },
    {
      id: 'expired',
      label: 'Expired',
      description:
        'The contract has reached its end date naturally.',
      transitions_to: [],
    },
    {
      id: 'terminated',
      label: 'Terminated',
      description:
        'Ended before natural expiry: mutual agreement, breach, or exercise of a termination clause.',
      transitions_to: [],
    },
  ],
}

/**
 * design_concept (Experience Design domain)
 *
 * A design concept progresses through refinement to selection or rejection.
 * The `refined` phase is optional; some concepts move directly from sketch to
 * a decision. Both `selected` and `rejected` are terminal.
 */
const DESIGN_CONCEPT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'design_concept',
  initial_phase: 'sketched',
  terminal_phases: ['selected', 'rejected'],
  phases: [
    {
      id: 'sketched',
      label: 'Sketched',
      description:
        'The concept has been captured in early, rough form. It is an idea worth exploring but has not been refined or evaluated.',
      transitions_to: ['refined', 'selected', 'rejected'],
    },
    {
      id: 'refined',
      label: 'Refined',
      description:
        'The concept has been developed with more detail. It is being compared to other concepts in the selection process.',
      transitions_to: ['selected', 'rejected'],
    },
    {
      id: 'selected',
      label: 'Selected',
      description:
        'This concept has been chosen to move forward into prototyping or implementation.',
      transitions_to: [],
    },
    {
      id: 'rejected',
      label: 'Rejected',
      description:
        'This concept was evaluated and not selected. It is retained as a record of design exploration.',
      transitions_to: [],
    },
  ],
}

/**
 * prototype (Experience Design domain)
 *
 * A prototype is built to be tested. `passed` and `failed` are both terminal.
 * A failed prototype informs the next iteration; a new prototype is created
 * rather than the failed one being reopened.
 */
const PROTOTYPE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'prototype',
  initial_phase: 'untested',
  terminal_phases: ['passed', 'failed'],
  phases: [
    {
      id: 'untested',
      label: 'Untested',
      description:
        'The prototype has been built but has not yet been put in front of users.',
      transitions_to: ['testing'],
    },
    {
      id: 'testing',
      label: 'Testing',
      description:
        'The prototype is being tested with users. Sessions are underway.',
      transitions_to: ['passed', 'failed'],
    },
    {
      id: 'passed',
      label: 'Passed',
      description:
        'Testing confirmed the design concept works for users. It is ready to inform detailed design or development.',
      transitions_to: [],
    },
    {
      id: 'failed',
      label: 'Failed',
      description:
        'Testing revealed significant usability or concept problems. Learnings will inform a new design direction.',
      transitions_to: [],
    },
  ],
}

/**
 * brand_identity (Experience Design domain)
 *
 * A brand identity evolves through maturity stages from exploration to a
 * fully articulated system. `mature` is terminal.
 */
const BRAND_IDENTITY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'brand_identity',
  initial_phase: 'exploratory',
  terminal_phases: ['mature'],
  phases: [
    {
      id: 'exploratory',
      label: 'Exploratory',
      description:
        'The brand is in early formation. Names, values, visual directions, and positioning are being explored without commitment.',
      transitions_to: ['defined'],
    },
    {
      id: 'defined',
      label: 'Defined',
      description:
        'Core brand elements have been decided. Name, values, visual identity, and voice are articulated. The brand is being applied but may still be evolving.',
      transitions_to: ['mature'],
    },
    {
      id: 'mature',
      label: 'Mature',
      description:
        'The brand identity is fully articulated and consistently applied. Guidelines are documented and followed across all touchpoints.',
      transitions_to: [],
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Engineering & Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * service (Engineering domain)
 *
 * A service progresses through deployment stages from development to production.
 * `deprecated` is terminal.
 */
const SERVICE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'service',
  initial_phase: 'development',
  terminal_phases: ['deprecated'],
  phases: [
    {
      id: 'development',
      label: 'Development',
      description:
        'The service is being built. It is not available in any shared environment.',
      transitions_to: ['staging'],
    },
    {
      id: 'staging',
      label: 'Staging',
      description:
        'The service is deployed to a staging environment for integration testing and pre-release validation.',
      transitions_to: ['production', 'development'],
    },
    {
      id: 'production',
      label: 'Production',
      description:
        'The service is live and serving real users.',
      transitions_to: ['deprecated'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The service is being phased out. A successor service is in place or the capability is no longer needed.',
      transitions_to: [],
    },
  ],
}

/**
 * deployment (Engineering domain)
 *
 * A deployment has a binary outcome lifecycle. It either succeeds or fails.
 * Both `success` and `failure` are terminal; deployments are immutable events.
 * A new deployment is created for retries.
 */
const DEPLOYMENT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'deployment',
  initial_phase: 'rolling',
  terminal_phases: ['success', 'failure'],
  phases: [
    {
      id: 'rolling',
      label: 'Rolling',
      description:
        'The deployment is in progress. Instances are being updated. Not all traffic has shifted yet.',
      transitions_to: ['success', 'failure'],
    },
    {
      id: 'success',
      label: 'Success',
      description:
        'The deployment completed successfully. All instances are running the new version.',
      transitions_to: [],
    },
    {
      id: 'failure',
      label: 'Failure',
      description:
        'The deployment failed or was rolled back. The previous version is restored.',
      transitions_to: [],
    },
  ],
}

/**
 * feature_flag (Engineering domain)
 *
 * A feature flag controls rollout. It starts off, graduates through partial
 * rollout, and can be fully enabled or rolled back. `on` is the positive terminal.
 */
const FEATURE_FLAG_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feature_flag',
  initial_phase: 'off',
  terminal_phases: ['on'],
  phases: [
    {
      id: 'off',
      label: 'Off',
      description:
        'The flag is disabled. The associated feature or code path is not active for any users.',
      transitions_to: ['rollout', 'on'],
    },
    {
      id: 'rollout',
      label: 'Rollout',
      description:
        'The flag is partially enabled. A percentage of users or a target segment has access.',
      transitions_to: ['on', 'off'],
    },
    {
      id: 'on',
      label: 'On',
      description:
        'The flag is fully enabled for all users. The feature is live. The flag can be cleaned up.',
      transitions_to: [],
    },
  ],
}

/**
 * technical_debt_item (Engineering domain)
 *
 * A technical debt item tracks a known quality compromise. `accepted` is a
 * deliberate terminal state; the team acknowledges the debt and chooses to
 * live with it. `resolved` is the positive terminal.
 */
const TECHNICAL_DEBT_ITEM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'technical_debt_item',
  initial_phase: 'identified',
  terminal_phases: ['resolved', 'accepted'],
  phases: [
    {
      id: 'identified',
      label: 'Identified',
      description:
        'The debt has been recognised and documented. It has not yet been triaged for action.',
      transitions_to: ['acknowledged', 'accepted'],
    },
    {
      id: 'acknowledged',
      label: 'Acknowledged',
      description:
        'The team agrees the debt exists and has assessed its severity. A decision on when to address it is pending.',
      transitions_to: ['in_progress', 'accepted'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Work is underway to address and remediate the debt.',
      transitions_to: ['resolved'],
    },
    {
      id: 'resolved',
      label: 'Resolved',
      description:
        'The debt has been addressed. The code or system has been improved.',
      transitions_to: [],
    },
    {
      id: 'accepted',
      label: 'Accepted',
      description:
        'A conscious decision to live with the debt. Remediation cost outweighs current value.',
      transitions_to: [],
    },
  ],
}

/**
 * investigation (Engineering domain)
 *
 * An investigation is a structured enquiry into a problem. `resolved` and
 * `abandoned` are both terminal.
 */
const INVESTIGATION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'investigation',
  initial_phase: 'open',
  terminal_phases: ['resolved', 'abandoned'],
  phases: [
    {
      id: 'open',
      label: 'Open',
      description:
        'The investigation has been opened. A problem has been identified but not yet actively worked.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The investigation is being actively worked. Evidence is being gathered and hypotheses are being tested.',
      transitions_to: ['paused', 'resolved', 'abandoned'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'On hold: awaiting additional data, unblocking conditions, or reprioritisation.',
      transitions_to: ['active', 'abandoned'],
    },
    {
      id: 'resolved',
      label: 'Resolved',
      description:
        'Root cause has been identified and documented. The investigation is closed.',
      transitions_to: [],
    },
    {
      id: 'abandoned',
      label: 'Abandoned',
      description:
        'Closed without resolution: the problem could not be reproduced, was deemed not worth pursuing, or became moot.',
      transitions_to: [],
    },
  ],
}

/**
 * external_api (Engineering domain)
 *
 * An external API has availability states that affect dependent services.
 * `unavailable` is terminal; applied when a third-party API is permanently shut down.
 */
const EXTERNAL_API_LIFECYCLE: UPGLifecycle = {
  entity_type: 'external_api',
  initial_phase: 'beta',
  terminal_phases: ['unavailable'],
  phases: [
    {
      id: 'beta',
      label: 'Beta',
      description:
        'The API is available for early access or testing. It may be unstable and subject to breaking changes.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The API is stable and in production use. The provider guarantees availability per their SLA.',
      transitions_to: ['deprecated', 'unavailable'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The provider has announced end-of-life. The API still works but a migration to a successor is required.',
      transitions_to: ['unavailable'],
    },
    {
      id: 'unavailable',
      label: 'Unavailable',
      description:
        'The API is no longer accessible. Any dependent service is broken until migrated.',
      transitions_to: [],
    },
  ],
}

/**
 * database_schema (Engineering domain)
 *
 * A database schema cycles between stable and pending-migration states.
 * `failed` is a temporary terminal that blocks until the issue is fixed
 * (which produces a new migration, restoring to `pending`).
 */
const DATABASE_SCHEMA_LIFECYCLE: UPGLifecycle = {
  entity_type: 'database_schema',
  initial_phase: 'current',
  terminal_phases: [],
  phases: [
    {
      id: 'current',
      label: 'Current',
      description:
        'The schema is up to date with the applied migrations. No pending changes.',
      transitions_to: ['pending'],
    },
    {
      id: 'pending',
      label: 'Pending',
      description:
        'A migration is queued and ready to run. The schema will change when it is applied.',
      transitions_to: ['current', 'failed'],
    },
    {
      id: 'failed',
      label: 'Failed',
      description:
        'A migration failed during application. The schema is in an inconsistent state and requires remediation before further changes can be applied.',
      transitions_to: ['pending'],
    },
  ],
}

/**
 * incident (DevOps & Platform domain)
 *
 * An incident has a response lifecycle. `resolved` is the primary terminal.
 * `mitigated` is a secondary terminal used when a compensating control is in
 * place but the root cause has not been permanently fixed.
 */
const INCIDENT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'incident',
  initial_phase: 'detected',
  terminal_phases: ['resolved', 'mitigated'],
  phases: [
    {
      id: 'detected',
      label: 'Detected',
      description:
        'Identified by an alert, a user report, or direct observation. Response has not yet started.',
      transitions_to: ['triaged'],
    },
    {
      id: 'triaged',
      label: 'Triaged',
      description:
        'The incident has been assessed for severity and impact. An on-call responder is assigned and is actively working it.',
      transitions_to: ['contained'],
    },
    {
      id: 'contained',
      label: 'Contained',
      description:
        'Immediate user impact stopped via rollback, circuit breaker, or another emergency measure. Root cause fix is still pending.',
      transitions_to: ['resolved', 'mitigated'],
    },
    {
      id: 'resolved',
      label: 'Resolved',
      description:
        'Root cause has been identified and fixed. The system is back to normal. A postmortem is recommended.',
      transitions_to: [],
    },
    {
      id: 'mitigated',
      label: 'Mitigated',
      description:
        'A compensating control is in place and user impact is stopped, but the root cause remains unfixed. A follow-up investigation or fix is required.',
      transitions_to: [],
    },
  ],
}

/**
 * vulnerability (Security domain)
 *
 * A vulnerability follows a remediation lifecycle. `resolved` is the ideal
 * terminal. `accepted` is a deliberate terminal when the risk is acknowledged
 * and no remediation is planned.
 */
const VULNERABILITY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'vulnerability',
  initial_phase: 'open',
  terminal_phases: ['resolved', 'accepted'],
  phases: [
    {
      id: 'open',
      label: 'Open',
      description:
        'The vulnerability has been identified. It has not yet been assessed for severity or assigned for remediation.',
      transitions_to: ['triaged'],
    },
    {
      id: 'triaged',
      label: 'Triaged',
      description:
        'The vulnerability has been assessed. CVSS score assigned. Priority and ownership determined.',
      transitions_to: ['in_progress', 'accepted'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'Remediation work is actively underway. A fix is being developed or a compensating control is being implemented.',
      transitions_to: ['mitigated', 'resolved'],
    },
    {
      id: 'mitigated',
      label: 'Mitigated',
      description:
        'A compensating control is in place. Immediate risk is reduced but the root vulnerability has not been patched.',
      transitions_to: ['resolved', 'accepted'],
    },
    {
      id: 'resolved',
      label: 'Resolved',
      description:
        'The vulnerability has been fully remediated. The underlying issue is patched or eliminated.',
      transitions_to: [],
    },
    {
      id: 'accepted',
      label: 'Accepted',
      description:
        'Formally acknowledged by the security team. Remediation is parked: low severity, compensating controls, or cost/benefit analysis.',
      transitions_to: [],
    },
  ],
}

/**
 * security_control (Security domain)
 *
 * A security control progresses from planning through implementation and
 * verification. `verified` is terminal.
 */
const SECURITY_CONTROL_LIFECYCLE: UPGLifecycle = {
  entity_type: 'security_control',
  initial_phase: 'planned',
  terminal_phases: ['verified'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The control has been identified as required but implementation has not started.',
      transitions_to: ['in_progress'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'The control is being implemented.',
      transitions_to: ['implemented'],
    },
    {
      id: 'implemented',
      label: 'Implemented',
      description:
        'The control is in place. It has not yet been independently tested or verified.',
      transitions_to: ['verified', 'in_progress'],
    },
    {
      id: 'verified',
      label: 'Verified',
      description:
        'The control has been tested and confirmed effective. It provides the intended security assurance.',
      transitions_to: [],
    },
  ],
}

/**
 * a11y_issue (Accessibility domain)
 *
 * An accessibility issue parallels the vulnerability lifecycle, moving from
 * discovery through triage and remediation to resolution. `accepted` is a
 * deliberate terminal for known issues the team has chosen not to fix.
 */
const A11Y_ISSUE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'a11y_issue',
  initial_phase: 'open',
  terminal_phases: ['verified', 'accepted'],
  phases: [
    {
      id: 'open',
      label: 'Open',
      description:
        'The accessibility issue has been identified. It has not yet been triaged for severity or assigned for remediation.',
      transitions_to: ['triaged'],
    },
    {
      id: 'triaged',
      label: 'Triaged',
      description:
        'The issue has been assessed for severity and mapped to the affected WCAG criterion. Priority has been assigned.',
      transitions_to: ['in_progress', 'accepted'],
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description:
        'A developer or designer is actively working to fix the accessibility issue.',
      transitions_to: ['fixed'],
    },
    {
      id: 'fixed',
      label: 'Fixed',
      description:
        'The fix has been implemented. Awaiting verification with assistive technology.',
      transitions_to: ['verified', 'in_progress'],
    },
    {
      id: 'verified',
      label: 'Verified',
      description:
        'The fix has been confirmed to resolve the accessibility barrier using appropriate assistive technology.',
      transitions_to: [],
    },
    {
      id: 'accepted',
      label: 'Accepted',
      description:
        'The team has formally acknowledged this issue and made a documented decision not to fix it at this time.',
      transitions_to: [],
    },
  ],
}

/**
 * data_pipeline (Data & Analytics domain)
 *
 * A data pipeline moves from construction through active operation.
 * `deprecated` is terminal. `failed` is a blocking operational state
 * that must be resolved before the pipeline returns to `active`.
 */
const DATA_PIPELINE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'data_pipeline',
  initial_phase: 'building',
  terminal_phases: ['deprecated'],
  phases: [
    {
      id: 'building',
      label: 'Building',
      description:
        'The pipeline is under construction. It is not yet processing real data.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The pipeline is running and processing data on its defined schedule.',
      transitions_to: ['paused', 'failed', 'deprecated'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'Deliberately suspended: maintenance, cost control, or upstream data unavailability.',
      transitions_to: ['active', 'deprecated'],
    },
    {
      id: 'failed',
      label: 'Failed',
      description:
        'The pipeline has errored and is not processing data. Intervention is required to restore it.',
      transitions_to: ['active'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The pipeline is being retired. It is no longer maintained and will be shut down.',
      transitions_to: [],
    },
  ],
}

/**
 * ai_model (AI & Machine Learning domain)
 *
 * An AI model progresses through a deployment lifecycle from evaluation to
 * retirement. All stages can transition to `retired` for emergency removal.
 */
const AI_MODEL_LIFECYCLE: UPGLifecycle = {
  entity_type: 'ai_model',
  initial_phase: 'evaluating',
  terminal_phases: ['retired'],
  phases: [
    {
      id: 'evaluating',
      label: 'Evaluating',
      description:
        'The model is being assessed for quality, cost, safety, and fit. Eval runs are being analysed. No production traffic.',
      transitions_to: ['staging', 'retired'],
    },
    {
      id: 'staging',
      label: 'Staging',
      description:
        'The model has passed evaluation and is deployed to a staging environment for integration testing.',
      transitions_to: ['production', 'evaluating', 'retired'],
    },
    {
      id: 'production',
      label: 'Production',
      description:
        'The model is serving live product traffic.',
      transitions_to: ['deprecated', 'retired'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'A successor model is in production. This model is being phased out. Traffic is being migrated.',
      transitions_to: ['retired'],
    },
    {
      id: 'retired',
      label: 'Retired',
      description:
        'The model is fully decommissioned. No traffic. Historical records are preserved.',
      transitions_to: [],
    },
  ],
}

/**
 * eval_run (AI & Machine Learning domain)
 *
 * An eval run progresses through execution phases. `complete` is the positive
 * terminal. `failed` is the negative terminal; a new run is created for retries.
 */
const EVAL_RUN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'eval_run',
  initial_phase: 'planned',
  terminal_phases: ['complete', 'failed'],
  phases: [
    {
      id: 'planned',
      label: 'Planned',
      description:
        'The run has been queued. It has not yet started executing.',
      transitions_to: ['running'],
    },
    {
      id: 'running',
      label: 'Running',
      description:
        'Actively executing. Prompts are being sent and responses scored.',
      transitions_to: ['complete', 'failed'],
    },
    {
      id: 'complete',
      label: 'Complete',
      description:
        'The run finished successfully. Scores and results are available.',
      transitions_to: [],
    },
    {
      id: 'failed',
      label: 'Failed',
      description:
        'Failed to complete: API error, timeout, or infrastructure failure. Create a new run to retry.',
      transitions_to: [],
    },
  ],
}

/**
 * workflow_run (Agentic Workflows domain)
 *
 * A workflow run is a single execution of a workflow template. `blocked` is a
 * waiting state when a review_gate is pending. `cancelled` can occur from any
 * non-terminal state.
 */
const WORKFLOW_RUN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'workflow_run',
  initial_phase: 'pending',
  terminal_phases: ['completed', 'failed', 'cancelled'],
  phases: [
    {
      id: 'pending',
      label: 'Pending',
      description:
        'The run has been queued and is awaiting execution. Resources or dependencies are being provisioned.',
      transitions_to: ['running', 'cancelled'],
    },
    {
      id: 'running',
      label: 'Running',
      description:
        'The workflow is actively executing its steps.',
      transitions_to: ['blocked', 'completed', 'failed', 'cancelled'],
    },
    {
      id: 'blocked',
      label: 'Blocked',
      description:
        'Execution is paused at a review_gate awaiting human or automated approval before proceeding.',
      transitions_to: ['running', 'cancelled'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'All steps executed successfully. Outputs are available.',
      transitions_to: [],
    },
    {
      id: 'failed',
      label: 'Failed',
      description:
        'The run encountered an unrecoverable error and stopped. Partial outputs may be available.',
      transitions_to: [],
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      description:
        'The run was deliberately stopped before completion.',
      transitions_to: [],
    },
  ],
}

/**
 * agent_definition (Agentic Workflows domain)
 *
 * An agent definition has an operational lifecycle from testing through active
 * service to retirement. `retired` is terminal.
 */
const AGENT_DEFINITION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'agent_definition',
  initial_phase: 'testing',
  terminal_phases: ['retired'],
  phases: [
    {
      id: 'testing',
      label: 'Testing',
      description:
        'The agent is being validated in a controlled environment. Sessions are not running against real product data.',
      transitions_to: ['active', 'disabled'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The agent is operational and creating sessions on demand.',
      transitions_to: ['paused', 'disabled', 'retired'],
    },
    {
      id: 'paused',
      label: 'Paused',
      description:
        'The agent is temporarily suspended. It is not creating new sessions but its configuration is preserved.',
      transitions_to: ['active', 'retired'],
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description:
        'Turned off: bug, policy change, or safety concern. Can be re-enabled after remediation.',
      transitions_to: ['testing', 'active', 'retired'],
    },
    {
      id: 'retired',
      label: 'Retired',
      description:
        'The agent has been permanently decommissioned. Sessions are no longer created from this definition.',
      transitions_to: [],
    },
  ],
}

/**
 * agent_session (Agentic Workflows domain)
 *
 * An agent session is a single interaction period. All terminal states are
 * final; sessions do not restart. A new session is created instead.
 */
const AGENT_SESSION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'agent_session',
  initial_phase: 'active',
  terminal_phases: ['completed', 'crashed', 'timed_out'],
  phases: [
    {
      id: 'active',
      label: 'Active',
      description:
        'The session is running. The agent is processing input and producing output.',
      transitions_to: ['completed', 'crashed', 'timed_out'],
    },
    {
      id: 'completed',
      label: 'Completed',
      description:
        'The session ended normally. The task was completed or the conversation was concluded.',
      transitions_to: [],
    },
    {
      id: 'crashed',
      label: 'Crashed',
      description:
        'The session terminated unexpectedly due to an unhandled error or infrastructure failure.',
      transitions_to: [],
    },
    {
      id: 'timed_out',
      label: 'Timed Out',
      description:
        'The session exceeded its maximum allowed duration and was automatically terminated.',
      transitions_to: [],
    },
  ],
}

/**
 * review_gate (Agentic Workflows domain)
 *
 * A review gate is a checkpoint in a workflow that requires approval.
 * `approved` and `bypassed` are terminal. `rejected` can be re-submitted.
 */
const REVIEW_GATE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'review_gate',
  initial_phase: 'pending',
  terminal_phases: ['approved', 'bypassed'],
  phases: [
    {
      id: 'pending',
      label: 'Pending',
      description:
        'The gate is awaiting review. The workflow is blocked until a decision is made.',
      transitions_to: ['approved', 'rejected', 'bypassed'],
    },
    {
      id: 'approved',
      label: 'Approved',
      description:
        'The gate has been passed. The workflow continues.',
      transitions_to: [],
    },
    {
      id: 'rejected',
      label: 'Rejected',
      description:
        'The gate was not passed. The workflow is blocked and the submitter must address the feedback before re-submitting.',
      transitions_to: ['pending'],
    },
    {
      id: 'bypassed',
      label: 'Bypassed',
      description:
        'Deliberately overridden without normal review by an authorised person in an emergency. Create an audit trail entry.',
      transitions_to: [],
    },
  ],
}

/**
 * test_suite (Quality Assurance domain)
 *
 * A test suite moves from authoring through active use to deprecation.
 * `deprecated` is terminal; superseded test suites are not deleted but
 * are no longer run as part of CI.
 */
const TEST_SUITE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'test_suite',
  initial_phase: 'draft',
  terminal_phases: ['deprecated'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The test suite is being authored. It is not yet part of any CI or QA process.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The suite is running in CI or scheduled QA processes.',
      transitions_to: ['deprecated'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The suite is no longer being run. It may be superseded by a newer suite or the tested functionality may have been removed.',
      transitions_to: [],
    },
  ],
}

/**
 * test_case (Quality Assurance domain)
 *
 * A test case moves from authoring through active use to deprecation.
 * `deprecated` is terminal.
 */
const TEST_CASE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'test_case',
  initial_phase: 'draft',
  terminal_phases: ['deprecated'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The test case is being written. Preconditions, steps, and expected results are being defined.',
      transitions_to: ['active'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The test case is included in one or more test suites and is being executed.',
      transitions_to: ['deprecated'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description:
        'The test case is no longer executed. The feature it covered may have changed or been removed.',
      transitions_to: [],
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase B hand-authored lifecycles
// ─────────────────────────────────────────────────────────────────────────────

// ── Research + Validation ────────────────────────────────────────────────────

/**
 * insight (UX Research domain)
 *
 * Insights synthesise observations into product knowledge. proposed
 * (raw synthesis) → validated (cross-checked) → applied (drove a
 * decision) → retired (superseded). Validated and applied are both
 * "settled" terminals; retired is end-of-life.
 */
const INSIGHT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'insight',
  initial_phase: 'proposed',
  terminal_phases: ['applied', 'retired'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'A pattern has been synthesised from observations. Not yet cross-checked.', transitions_to: ['validated', 'retired'] },
    { id: 'validated', label: 'Validated', description: 'The insight has been cross-checked against additional evidence. Believed reliable.', transitions_to: ['applied', 'retired'] },
    { id: 'applied', label: 'Applied', description: 'The insight drove a product decision. Captured for the record.', transitions_to: ['retired'] },
    { id: 'retired', label: 'Retired', description: 'Superseded by newer insight, or no longer relevant. May reopen to proposed if revisited.', transitions_to: ['proposed'] },
  ],
}

/**
 * research_question (UX Research domain)
 *
 * Open → researching → answered or parked. Mirrors the DISCOVERY template
 * shape but stays hand-authored because the question→answer loop has
 * domain-specific semantics distinct from generic discovery.
 */
const RESEARCH_QUESTION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'research_question',
  initial_phase: 'open',
  terminal_phases: ['answered', 'parked'],
  phases: [
    { id: 'open', label: 'Open', description: 'Question has been articulated. Research has not started.', transitions_to: ['researching', 'parked'] },
    { id: 'researching', label: 'Researching', description: 'Active investigation. Methods are being run, evidence is being gathered.', transitions_to: ['answered', 'parked'] },
    { id: 'answered', label: 'Answered', description: 'Question has been resolved. Findings captured in linked insights.', transitions_to: [] },
    { id: 'parked', label: 'Parked', description: 'Set aside due to capacity, priority, or dependency. May reopen to researching.', transitions_to: ['researching'] },
  ],
}

/**
 * interview_guide (UX Research domain)
 *
 * Drafting → ready → in_use → archived. Has an `in_use` working state
 * between ready and archived because guides circulate through multiple
 * studies before retirement.
 */
const INTERVIEW_GUIDE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'interview_guide',
  initial_phase: 'drafting',
  terminal_phases: ['archived'],
  phases: [
    { id: 'drafting', label: 'Drafting', description: 'Guide is being authored or revised. Not yet ready for use.', transitions_to: ['ready'] },
    { id: 'ready', label: 'Ready', description: 'Guide is approved for use. May be picked up by a study.', transitions_to: ['in_use', 'drafting'] },
    { id: 'in_use', label: 'In Use', description: 'Currently being run in one or more research_study entities.', transitions_to: ['ready', 'archived'] },
    { id: 'archived', label: 'Archived', description: 'Retired from active use. May reopen to drafting if revived.', transitions_to: ['drafting'] },
  ],
}

/**
 * test_plan (Validation domain)
 *
 * Drafted → executing → completed or cancelled. Plans get cancelled
 * mid-execution when the underlying assumption changes; that's a real
 * outcome, not a failure to complete.
 */
const TEST_PLAN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'test_plan',
  initial_phase: 'drafted',
  terminal_phases: ['completed', 'cancelled'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Plan has been authored. Not yet started.', transitions_to: ['executing', 'cancelled'] },
    { id: 'executing', label: 'Executing', description: 'Tests are running according to the plan.', transitions_to: ['completed', 'cancelled'] },
    { id: 'completed', label: 'Completed', description: 'All tests in the plan have run. Outcomes captured in linked test_result entities.', transitions_to: ['executing'] },
    { id: 'cancelled', label: 'Cancelled', description: 'Plan was abandoned mid-flight: assumption changed, priorities shifted, or the underlying code went away.', transitions_to: [] },
  ],
}

/**
 * feasibility_study (Discovery domain)
 *
 * Smaller cousin of research_study. Scoped → analysing → concluded or
 * abandoned. Concluded is the achievement terminal; abandoned covers
 * "we ran out of runway" cases.
 */
const FEASIBILITY_STUDY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'feasibility_study',
  initial_phase: 'scoped',
  terminal_phases: ['concluded', 'abandoned'],
  phases: [
    { id: 'scoped', label: 'Scoped', description: 'Study has been framed: questions, methods, and budget are agreed.', transitions_to: ['analysing', 'abandoned'] },
    { id: 'analysing', label: 'Analysing', description: 'Active analysis. Data is being gathered and synthesised.', transitions_to: ['concluded', 'abandoned'] },
    { id: 'concluded', label: 'Concluded', description: 'Study reached a conclusion. Findings inform a go/no-go decision.', transitions_to: [] },
    { id: 'abandoned', label: 'Abandoned', description: 'Study was stopped before reaching a conclusion. Captured for the record.', transitions_to: [] },
  ],
}

// ── AI workflow ──────────────────────────────────────────────────────────────

/**
 * ai_experiment (AI domain)
 *
 * Mirrors EXPERIMENT_LIFECYCLE but kept distinct because AI experiments
 * have specific tooling and provenance requirements (datasets, prompt
 * versions, eval benchmarks).
 */
const AI_EXPERIMENT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'ai_experiment',
  initial_phase: 'planned',
  terminal_phases: ['completed', 'abandoned'],
  phases: [
    { id: 'planned', label: 'Planned', description: 'Experiment has been designed but is not yet running.', transitions_to: ['running', 'abandoned'] },
    { id: 'running', label: 'Running', description: 'Experiment is actively executing: model is being trained, evaluated, or compared.', transitions_to: ['analysed', 'abandoned'] },
    { id: 'analysed', label: 'Analysed', description: 'Run is finished and results are being reviewed.', transitions_to: ['completed', 'abandoned'] },
    { id: 'completed', label: 'Completed', description: 'Findings captured. Linked learnings drive downstream decisions.', transitions_to: [] },
    { id: 'abandoned', label: 'Abandoned', description: 'Experiment was stopped before producing usable findings.', transitions_to: [] },
  ],
}

/**
 * ai_dataset (AI domain)
 *
 * Datasets evolve through collection and curation, then get versioned
 * for reproducibility. Versioned is "settled and citable"; archived is
 * end-of-life. May reopen for further collection.
 */
const AI_DATASET_LIFECYCLE: UPGLifecycle = {
  entity_type: 'ai_dataset',
  initial_phase: 'collecting',
  terminal_phases: ['versioned', 'archived'],
  phases: [
    { id: 'collecting', label: 'Collecting', description: 'Examples are being gathered. Schema and labelling rules may still be in flux.', transitions_to: ['curated', 'archived'] },
    { id: 'curated', label: 'Curated', description: 'Examples have been cleaned, deduped, and labelled. Ready for versioning.', transitions_to: ['versioned', 'collecting'] },
    { id: 'versioned', label: 'Versioned', description: 'A specific cut has been pinned and is citable. New collection continues in a successor version.', transitions_to: ['archived'] },
    { id: 'archived', label: 'Archived', description: 'No longer in active use. May reopen to collecting if revived.', transitions_to: ['collecting'] },
  ],
}

/**
 * ai_guardrail (AI domain)
 *
 * Three terminals: guardrails settle to active, relaxed, or removed.
 * Each is a recognised steady state with different operational meaning,
 * so all three are terminal rather than waypoints to a single "closed"
 * terminal.
 */
const AI_GUARDRAIL_LIFECYCLE: UPGLifecycle = {
  entity_type: 'ai_guardrail',
  initial_phase: 'proposed',
  terminal_phases: ['active', 'relaxed', 'removed'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'Guardrail has been suggested. Not yet enforced.', transitions_to: ['active', 'removed'] },
    { id: 'active', label: 'Active', description: 'Guardrail is enforced as designed. Currently the steady state.', transitions_to: ['relaxed', 'removed'] },
    { id: 'relaxed', label: 'Relaxed', description: 'Guardrail is enforced more loosely than originally specified. Captured separately because the looser form has different implications.', transitions_to: ['active', 'removed'] },
    { id: 'removed', label: 'Removed', description: 'Guardrail is no longer enforced. May reopen to active if reinstated.', transitions_to: ['active'] },
  ],
}

/**
 * hallucination_report (AI domain)
 *
 * Mirrors INCIDENT_LIFECYCLE shape. Reported → investigating →
 * resolved or accepted. Accepted means "known limitation, not fixing"
 * (a legitimate steady state for some hallucination classes).
 */
const HALLUCINATION_REPORT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'hallucination_report',
  initial_phase: 'reported',
  terminal_phases: ['resolved', 'accepted'],
  phases: [
    { id: 'reported', label: 'Reported', description: 'A hallucination has been observed and logged. Not yet investigated.', transitions_to: ['investigating'] },
    { id: 'investigating', label: 'Investigating', description: 'Active investigation: root cause analysis, reproduction, scope.', transitions_to: ['resolved', 'accepted'] },
    { id: 'resolved', label: 'Resolved', description: 'A fix has shipped. Future occurrences should not happen.', transitions_to: ['investigating'] },
    { id: 'accepted', label: 'Accepted', description: 'Known limitation that will not be fixed in this iteration. Documented for users.', transitions_to: ['investigating'] },
  ],
}

/**
 * model_comparison (AI domain)
 *
 * Mirrors test plan shape. Planned → running → published or archived.
 * Comparisons are reproducible reports; published is the citable
 * terminal. May reopen for re-runs when models update.
 */
const MODEL_COMPARISON_LIFECYCLE: UPGLifecycle = {
  entity_type: 'model_comparison',
  initial_phase: 'planned',
  terminal_phases: ['published', 'archived'],
  phases: [
    { id: 'planned', label: 'Planned', description: 'Comparison has been scoped: models, criteria, and methodology are agreed.', transitions_to: ['running', 'archived'] },
    { id: 'running', label: 'Running', description: 'Models are being evaluated against the chosen criteria.', transitions_to: ['published', 'archived'] },
    { id: 'published', label: 'Published', description: 'Results are written up and citable. Drives downstream model selection.', transitions_to: ['archived', 'planned'] },
    { id: 'archived', label: 'Archived', description: 'Superseded by newer comparison. May reopen to planned if re-run.', transitions_to: ['planned'] },
  ],
}

/**
 * prompt_version (AI domain)
 *
 * Drafted → testing → active → deprecated. Active means "in production";
 * deprecated means "still works but a successor exists." Testing is the
 * vetting state before promotion to active.
 */
const PROMPT_VERSION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'prompt_version',
  initial_phase: 'drafted',
  terminal_phases: ['active', 'deprecated'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Prompt has been authored. Not yet evaluated.', transitions_to: ['testing', 'deprecated'] },
    { id: 'testing', label: 'Testing', description: 'Running through eval benchmarks. Results inform whether to promote.', transitions_to: ['active', 'drafted', 'deprecated'] },
    { id: 'active', label: 'Active', description: 'In production use.', transitions_to: ['deprecated'] },
    { id: 'deprecated', label: 'Deprecated', description: 'Superseded by a successor version. Still available for backwards-compat. May reopen to testing if reinstated.', transitions_to: ['testing'] },
  ],
}

/**
 * eval_benchmark (AI domain)
 *
 * Drafted → running → published → deprecated. Published is the citable
 * terminal; deprecated covers "this benchmark no longer reflects what
 * we measure." Reopen path lets retired benchmarks be revived.
 */
const EVAL_BENCHMARK_LIFECYCLE: UPGLifecycle = {
  entity_type: 'eval_benchmark',
  initial_phase: 'drafted',
  terminal_phases: ['published', 'deprecated'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Benchmark questions and scoring rubric are being designed.', transitions_to: ['running', 'deprecated'] },
    { id: 'running', label: 'Running', description: 'Benchmark is being executed against models or prompt versions.', transitions_to: ['published', 'deprecated'] },
    { id: 'published', label: 'Published', description: 'Results are citable. Benchmark is part of the standard eval rotation.', transitions_to: ['deprecated', 'running'] },
    { id: 'deprecated', label: 'Deprecated', description: 'Benchmark no longer reflects what the team measures. May reopen to drafted if revisited.', transitions_to: ['drafted'] },
  ],
}

// ── Business Model ──────────────────────────────────────────────────────────

/**
 * business_model (Business Model domain)
 *
 * Drafted → testing → validated / invalidated / pivoted. Three terminals
 * because pivoting is structurally different from validation success or
 * failure; a pivoted model became something else, not failed.
 */
const BUSINESS_MODEL_LIFECYCLE: UPGLifecycle = {
  entity_type: 'business_model',
  initial_phase: 'drafted',
  terminal_phases: ['validated', 'invalidated', 'pivoted'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Model has been articulated. Not yet tested in market.', transitions_to: ['testing', 'invalidated'] },
    { id: 'testing', label: 'Testing', description: 'Model is being tested against real customers and revenue. Evidence is accumulating.', transitions_to: ['validated', 'invalidated', 'pivoted'] },
    { id: 'validated', label: 'Validated', description: 'Model holds up under real customer behaviour. Forms the operating basis.', transitions_to: ['testing', 'pivoted'] },
    { id: 'invalidated', label: 'Invalidated', description: 'Model failed to hold up. May reopen to drafted for a new attempt.', transitions_to: ['drafted'] },
    { id: 'pivoted', label: 'Pivoted', description: 'Model became something structurally different. Captured as a milestone before the new model takes over.', transitions_to: [] },
  ],
}

/**
 * value_proposition (Business Model domain)
 *
 * Simpler than business_model: drafted → testing → validated or
 * invalidated. No pivot terminal; a failed value proposition just goes
 * back to drafting.
 */
const VALUE_PROPOSITION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'value_proposition',
  initial_phase: 'drafted',
  terminal_phases: ['validated', 'invalidated'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Statement of value has been articulated. Not yet tested.', transitions_to: ['testing', 'invalidated'] },
    { id: 'testing', label: 'Testing', description: 'Statement is being tested against the target audience.', transitions_to: ['validated', 'invalidated'] },
    { id: 'validated', label: 'Validated', description: 'Audience response confirms the value resonates. Forms the messaging foundation.', transitions_to: ['testing'] },
    { id: 'invalidated', label: 'Invalidated', description: 'Statement did not resonate. May reopen to drafted for a rewrite.', transitions_to: ['drafted'] },
  ],
}

/**
 * revenue_stream (Business Model domain)
 *
 * Mirrors product lifecycle pattern. Proposed → piloting → live →
 * sunset. Live is the operational terminal; sunset covers
 * decommissioning. Reopen from sunset to piloting if revived.
 */
const REVENUE_STREAM_LIFECYCLE: UPGLifecycle = {
  entity_type: 'revenue_stream',
  initial_phase: 'proposed',
  terminal_phases: ['live', 'sunset'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'Stream has been hypothesised. Not yet built or sold.', transitions_to: ['piloting', 'sunset'] },
    { id: 'piloting', label: 'Piloting', description: 'Stream is being trialled with a limited audience. Pricing and packaging may still be in flux.', transitions_to: ['live', 'sunset'] },
    { id: 'live', label: 'Live', description: 'Stream is generally available and generating revenue.', transitions_to: ['sunset'] },
    { id: 'sunset', label: 'Sunset', description: 'Stream is being wound down. May reopen to piloting if revived.', transitions_to: ['piloting'] },
  ],
}

// ── Customer Success ─────────────────────────────────────────────────────────

/**
 * support_ticket (Customer Success domain)
 *
 * Two-step terminal (resolved → closed) is industry-standard for support:
 * a ticket can be resolved by support but stay open until the customer
 * confirms. Reopen from closed isn't typical (customers file a new
 * ticket); reopen from in_progress covers regressions found post-resolve.
 */
const SUPPORT_TICKET_LIFECYCLE: UPGLifecycle = {
  entity_type: 'support_ticket',
  initial_phase: 'opened',
  terminal_phases: ['resolved', 'closed'],
  phases: [
    { id: 'opened', label: 'Opened', description: 'Ticket has been filed. Not yet looked at.', transitions_to: ['triaged'] },
    { id: 'triaged', label: 'Triaged', description: 'Ticket has been categorised, prioritised, and assigned. Ready for work.', transitions_to: ['in_progress'] },
    { id: 'in_progress', label: 'In Progress', description: 'Support is actively working on the ticket.', transitions_to: ['resolved', 'triaged'] },
    { id: 'resolved', label: 'Resolved', description: 'Support believes the issue is fixed. Awaiting customer confirmation.', transitions_to: ['in_progress', 'closed'] },
    { id: 'closed', label: 'Closed', description: 'Customer has confirmed. Ticket is fully done.', transitions_to: [] },
  ],
}

/**
 * customer_feedback (Customer Success domain)
 *
 * Two terminals: actioned means it drove a change in product or
 * process; acknowledged means we read it but won't act. Both are
 * legitimate, distinguishable outcomes worth tracking.
 */
const CUSTOMER_FEEDBACK_LIFECYCLE: UPGLifecycle = {
  entity_type: 'customer_feedback',
  initial_phase: 'received',
  terminal_phases: ['actioned', 'acknowledged'],
  phases: [
    { id: 'received', label: 'Received', description: 'Feedback has been captured. Not yet processed.', transitions_to: ['triaged'] },
    { id: 'triaged', label: 'Triaged', description: 'Feedback has been categorised and routed. Decision on action is pending.', transitions_to: ['actioned', 'acknowledged'] },
    { id: 'actioned', label: 'Actioned', description: 'Feedback drove a change (a feature, a process, a doc update). Captured for the record.', transitions_to: [] },
    { id: 'acknowledged', label: 'Acknowledged', description: 'Feedback was read and considered but will not drive a change. Customer has been thanked.', transitions_to: [] },
  ],
}

/**
 * customer_health_score (Customer Success domain)
 *
 * Dynamic state machine: health flows back and forth between
 * monitoring, at_risk, critical until terminal. Recovered and churned
 * are both terminal but represent opposite outcomes; recovered may
 * reopen to monitoring if conditions degrade again.
 */
const CUSTOMER_HEALTH_SCORE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'customer_health_score',
  initial_phase: 'monitoring',
  terminal_phases: ['recovered', 'churned'],
  phases: [
    { id: 'monitoring', label: 'Monitoring', description: 'Customer is healthy. Score is being tracked passively.', transitions_to: ['at_risk', 'churned', 'recovered'] },
    { id: 'at_risk', label: 'At Risk', description: 'Signals indicate trouble. Customer Success has flagged the account for attention.', transitions_to: ['monitoring', 'critical', 'churned', 'recovered'] },
    { id: 'critical', label: 'Critical', description: 'Customer is on the verge of churning. Active intervention is underway.', transitions_to: ['at_risk', 'recovered', 'churned'] },
    { id: 'recovered', label: 'Recovered', description: 'Customer health has returned to monitoring. Captured as a milestone. May reopen to monitoring naturally.', transitions_to: ['monitoring'] },
    { id: 'churned', label: 'Churned', description: 'Customer left. Captured for analysis; reopen would mean a new customer relationship.', transitions_to: [] },
  ],
}

/**
 * playbook (Customer Success domain)
 *
 * Drafted → tested → live → retired. Live is the operational terminal;
 * retired covers superseded playbooks. Reopen from retired allows
 * revival; tested → drafted allows iteration after live testing.
 */
const PLAYBOOK_LIFECYCLE: UPGLifecycle = {
  entity_type: 'playbook',
  initial_phase: 'drafted',
  terminal_phases: ['live', 'retired'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Playbook is being authored. Not yet tested with customers.', transitions_to: ['tested', 'retired'] },
    { id: 'tested', label: 'Tested', description: 'Playbook has been run through pilot customers. Adjustments may follow.', transitions_to: ['live', 'drafted'] },
    { id: 'live', label: 'Live', description: 'Playbook is in active use across the customer success team.', transitions_to: ['retired', 'tested'] },
    { id: 'retired', label: 'Retired', description: 'Playbook no longer in use. May reopen to drafted if revived.', transitions_to: ['drafted'] },
  ],
}

// ── Team & Organisation ─────────────────────────────────────────────────────

/**
 * team_okr (Team & Organisation domain)
 *
 * Drafted → committed → in_progress → completed or missed. Missed reopens
 * to in_progress when teams carry forward objectives across cycles.
 */
const TEAM_OKR_LIFECYCLE: UPGLifecycle = {
  entity_type: 'team_okr',
  initial_phase: 'drafted',
  terminal_phases: ['completed', 'missed'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'OKR is being authored. Not yet committed to.', transitions_to: ['committed'] },
    { id: 'committed', label: 'Committed', description: 'Team has agreed to pursue the OKR. Cycle has not yet started.', transitions_to: ['in_progress', 'drafted'] },
    { id: 'in_progress', label: 'In Progress', description: 'Cycle is underway. Progress is being tracked.', transitions_to: ['completed', 'missed'] },
    { id: 'completed', label: 'Completed', description: 'OKR was achieved within the cycle.', transitions_to: [] },
    { id: 'missed', label: 'Missed', description: 'OKR was not achieved. May reopen to in_progress if carried forward.', transitions_to: ['in_progress'] },
  ],
}

/**
 * retrospective (Team & Organisation domain)
 *
 * Two terminals: `completed` is the meeting itself; `actions_tracked` is
 * the follow-up state when retro actions are still being executed.
 * Tracking both keeps "did the retro happen?" separate from "did we
 * actually do anything about it?"
 */
const RETROSPECTIVE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'retrospective',
  initial_phase: 'scheduled',
  terminal_phases: ['completed', 'actions_tracked'],
  phases: [
    { id: 'scheduled', label: 'Scheduled', description: 'Retro is on the calendar. Not yet held.', transitions_to: ['in_progress', 'completed'] },
    { id: 'in_progress', label: 'In Progress', description: 'Retro is being held.', transitions_to: ['completed'] },
    { id: 'completed', label: 'Completed', description: 'Meeting is done. Action items captured but not yet tracked to closure.', transitions_to: ['actions_tracked'] },
    { id: 'actions_tracked', label: 'Actions Tracked', description: 'Retro action items have been completed or explicitly dropped. Full loop closed.', transitions_to: [] },
  ],
}

/**
 * dependency (Team & Organisation domain)
 *
 * Identified → blocked → in_progress → resolved. Reopen from resolved
 * covers regressions where the dependency reappears.
 */
const DEPENDENCY_LIFECYCLE: UPGLifecycle = {
  entity_type: 'dependency',
  initial_phase: 'identified',
  terminal_phases: ['resolved'],
  phases: [
    { id: 'identified', label: 'Identified', description: 'Dependency has been named. Not yet evaluated for impact.', transitions_to: ['blocked', 'in_progress', 'resolved'] },
    { id: 'blocked', label: 'Blocked', description: 'Dependency is currently blocking work. Awaiting upstream action.', transitions_to: ['in_progress', 'resolved'] },
    { id: 'in_progress', label: 'In Progress', description: 'Active work is happening to resolve the dependency.', transitions_to: ['blocked', 'resolved'] },
    { id: 'resolved', label: 'Resolved', description: 'Dependency is no longer blocking. May reopen to blocked if regression.', transitions_to: ['blocked'] },
  ],
}

/**
 * role (Team & Organisation domain)
 *
 * Both `filled` and `vacant` are terminals; the role exists in either
 * state. Proposed and open are working states before settling. Reopen
 * from vacant to open is the typical hiring re-trigger.
 */
const ROLE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'role',
  initial_phase: 'proposed',
  terminal_phases: ['filled', 'vacant'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'Role has been described but not yet posted or staffed.', transitions_to: ['open', 'vacant'] },
    { id: 'open', label: 'Open', description: 'Role is actively being recruited for.', transitions_to: ['filled', 'vacant'] },
    { id: 'filled', label: 'Filled', description: 'Role is staffed. May reopen to open if the position becomes vacant again.', transitions_to: ['vacant'] },
    { id: 'vacant', label: 'Vacant', description: 'Role exists but is unfilled. May reopen to open to start recruiting.', transitions_to: ['open'] },
  ],
}

/**
 * capacity_plan (Team & Organisation domain)
 *
 * Drafted → committed → in_flight → completed or revised. Revised
 * reopens to drafted for the next iteration of the plan.
 */
const CAPACITY_PLAN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'capacity_plan',
  initial_phase: 'drafted',
  terminal_phases: ['completed', 'revised'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Plan is being authored. Not yet agreed.', transitions_to: ['committed', 'revised'] },
    { id: 'committed', label: 'Committed', description: 'Plan has been agreed by stakeholders. Cycle has not yet started.', transitions_to: ['in_flight', 'revised'] },
    { id: 'in_flight', label: 'In Flight', description: 'Cycle is underway. Capacity is being consumed.', transitions_to: ['completed', 'revised'] },
    { id: 'completed', label: 'Completed', description: 'Cycle is done. Plan executed as agreed.', transitions_to: [] },
    { id: 'revised', label: 'Revised', description: 'Plan was changed mid-flight. May reopen to drafted for the next iteration.', transitions_to: ['drafted'] },
  ],
}

// ── Product & Growth ────────────────────────────────────────────────────────

/**
 * variant (Growth domain)
 *
 * A/B-test variant. Three terminals (winning, losing, retired) because
 * each carries different downstream meaning (winning rolls out, losing
 * informs the next test, retired covers tests that ran inconclusively).
 */
const VARIANT_LIFECYCLE: UPGLifecycle = {
  entity_type: 'variant',
  initial_phase: 'proposed',
  terminal_phases: ['winning', 'losing', 'retired'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'Variant has been designed. Not yet running.', transitions_to: ['live', 'retired'] },
    { id: 'live', label: 'Live', description: 'Variant is being shown to users as part of an active test.', transitions_to: ['winning', 'losing', 'retired'] },
    { id: 'winning', label: 'Winning', description: 'Variant beat the control. Captured for the record before rollout.', transitions_to: ['retired'] },
    { id: 'losing', label: 'Losing', description: 'Variant did not beat the control. Captured for the record.', transitions_to: ['retired'] },
    { id: 'retired', label: 'Retired', description: 'Variant is no longer running. May reopen to proposed if revisited in a future test.', transitions_to: ['proposed'] },
  ],
}

/**
 * growth_campaign (Growth domain)
 *
 * Drafted → planning → live → completed or paused. Paused → live reopen
 * covers campaigns that resume after a temporary halt.
 */
const GROWTH_CAMPAIGN_LIFECYCLE: UPGLifecycle = {
  entity_type: 'growth_campaign',
  initial_phase: 'drafted',
  terminal_phases: ['completed', 'paused'],
  phases: [
    { id: 'drafted', label: 'Drafted', description: 'Campaign concept exists. Not yet planned for launch.', transitions_to: ['planning', 'paused'] },
    { id: 'planning', label: 'Planning', description: 'Campaign creative, channels, and timing are being finalised.', transitions_to: ['live', 'paused'] },
    { id: 'live', label: 'Live', description: 'Campaign is running across channels.', transitions_to: ['completed', 'paused'] },
    { id: 'completed', label: 'Completed', description: 'Campaign ran to completion. Outcomes captured.', transitions_to: [] },
    { id: 'paused', label: 'Paused', description: 'Campaign was halted before completion. May reopen to live if resumed.', transitions_to: ['live'] },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle Templates
//
// Reusable lifecycle patterns. Entity types that share the same progression
// get a lifecycle generated from the template; no hand-authoring needed.
// ─────────────────────────────────────────────────────────────────────────────

/** Create a lifecycle from a template for a specific entity type. */
function fromTemplate(
  entityType: string,
  template: Omit<UPGLifecycle, 'entity_type'>,
): UPGLifecycle {
  return { entity_type: entityType, ...template }
}

/** Publishing: draft → review → published → archived */
const PUBLISHING_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'PUBLISHING',
  initial_phase: 'draft',
  terminal_phases: ['archived'],
  phases: [
    { id: 'draft', label: 'Draft', description: 'Being authored or revised. Not visible externally.', transitions_to: ['review'] },
    { id: 'review', label: 'In Review', description: 'Under editorial or stakeholder review before publishing.', transitions_to: ['draft', 'published'] },
    { id: 'published', label: 'Published', description: 'Live and visible to the intended audience.', transitions_to: ['archived', 'draft'] },
    { id: 'archived', label: 'Archived', description: 'No longer current. Retained for historical reference.', transitions_to: ['draft'] },
  ],
}

/** Operational: planning → active → completed → paused → sunset */
const OPERATIONAL_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'OPERATIONAL',
  initial_phase: 'planning',
  terminal_phases: ['completed', 'sunset'],
  phases: [
    { id: 'planning', label: 'Planning', description: 'Being designed or scoped. Not yet started.', transitions_to: ['active'] },
    { id: 'active', label: 'Active', description: 'Currently running or in operation.', transitions_to: ['paused', 'completed', 'sunset'] },
    { id: 'paused', label: 'Paused', description: 'Temporarily halted. Can be resumed.', transitions_to: ['active', 'sunset'] },
    { id: 'completed', label: 'Completed', description: 'Finished successfully. Outcomes captured.', transitions_to: [] },
    { id: 'sunset', label: 'Sunset', description: 'Winding down or discontinued.', transitions_to: [] },
  ],
}

/** Approval: proposed → reviewing → approved → rejected; approved → deprecated */
const APPROVAL_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'APPROVAL',
  initial_phase: 'proposed',
  // `deprecated` is a legitimate terminal; once something has been deprecated
  // it does not normally progress anywhere. Transitions *out* of terminals
  // (rejected → proposed, approved → deprecated) are late-state moves per the
  // UPGLifecycle.terminal_phases contract.
  terminal_phases: ['approved', 'rejected', 'deprecated'],
  phases: [
    { id: 'proposed', label: 'Proposed', description: 'Submitted for consideration. Awaiting review.', transitions_to: ['reviewing'] },
    { id: 'reviewing', label: 'Reviewing', description: 'Under active review by approvers.', transitions_to: ['approved', 'rejected', 'proposed'] },
    { id: 'approved', label: 'Approved', description: 'Accepted and ready for implementation.', transitions_to: ['deprecated'] },
    { id: 'rejected', label: 'Rejected', description: 'Not accepted. Reasons should be documented.', transitions_to: ['proposed'] },
    { id: 'deprecated', label: 'Deprecated', description: 'Previously approved but no longer current.', transitions_to: [] },
  ],
}

/** Work item: todo → in_progress → in_review → done */
const WORK_ITEM_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'WORK_ITEM',
  initial_phase: 'todo',
  terminal_phases: ['done'],
  phases: [
    { id: 'todo', label: 'To Do', description: 'Identified but not yet started.', transitions_to: ['in_progress'] },
    { id: 'in_progress', label: 'In Progress', description: 'Actively being worked on.', transitions_to: ['in_review', 'todo'] },
    { id: 'in_review', label: 'In Review', description: 'Work completed, awaiting review or acceptance.', transitions_to: ['done', 'in_progress'] },
    { id: 'done', label: 'Done', description: 'Completed and accepted.', transitions_to: [] },
  ],
}

/** Discovery: open → exploring → resolved → parked */
const DISCOVERY_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'DISCOVERY',
  initial_phase: 'open',
  terminal_phases: ['resolved', 'parked'],
  phases: [
    { id: 'open', label: 'Open', description: 'Identified as worth exploring. No work started yet.', transitions_to: ['exploring'] },
    { id: 'exploring', label: 'Exploring', description: 'Actively being investigated or researched.', transitions_to: ['resolved', 'parked', 'open'] },
    { id: 'resolved', label: 'Resolved', description: 'Answered or addressed. Findings captured.', transitions_to: [] },
    { id: 'parked', label: 'Parked', description: 'Set aside for now. May revisit later.', transitions_to: ['open'] },
  ],
}

/** Maturity: alpha → beta → ga → deprecated */
const MATURITY_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'MATURITY',
  initial_phase: 'alpha',
  terminal_phases: ['deprecated'],
  phases: [
    { id: 'alpha', label: 'Alpha', description: 'Early stage, internal use only. Expect breaking changes.', transitions_to: ['beta'] },
    { id: 'beta', label: 'Beta', description: 'Feature complete but may have rough edges. Limited external use.', transitions_to: ['ga', 'alpha'] },
    { id: 'ga', label: 'Generally Available', description: 'Stable, production-ready. Widely available.', transitions_to: ['deprecated'] },
    { id: 'deprecated', label: 'Deprecated', description: 'Scheduled for removal. Migration path should be documented.', transitions_to: [] },
  ],
}

/**
 * Risk item: identified → assessed → mitigated / accepted / closed
 *
 * Three terminals: risks settle via different routes. `mitigated` means
 * action was taken. `accepted` means the risk is acknowledged but the cost
 * of mitigation outweighs the exposure. `closed` is for risks that became
 * irrelevant without action (e.g. the underlying threat went away).
 *
 * Reopen path: a closed risk can return to `assessed` if conditions change.
 */
const RISK_ITEM_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'RISK_ITEM',
  initial_phase: 'identified',
  terminal_phases: ['mitigated', 'accepted', 'closed'],
  phases: [
    { id: 'identified', label: 'Identified', description: 'Risk has been recognised and named. Not yet assessed for likelihood or impact.', transitions_to: ['assessed'] },
    { id: 'assessed', label: 'Assessed', description: 'Likelihood and impact have been evaluated. Outcome is one of mitigated, accepted, or closed.', transitions_to: ['mitigated', 'accepted', 'closed'] },
    { id: 'mitigated', label: 'Mitigated', description: 'Action has been taken to reduce likelihood or impact. The risk is no longer active.', transitions_to: [] },
    { id: 'accepted', label: 'Accepted', description: 'Risk is acknowledged. Cost of mitigation outweighs exposure; the team chooses to live with it.', transitions_to: [] },
    { id: 'closed', label: 'Closed', description: 'Risk became irrelevant without action; underlying conditions changed. May reopen to `assessed` if conditions change again.', transitions_to: ['assessed'] },
  ],
}

/**
 * Sales deal: qualified → proposal → negotiation → closed_won / closed_lost
 *
 * Two terminals: every deal settles to either won or lost. `closed_lost`
 * does NOT reopen by convention; a re-engaged prospect becomes a new
 * `deal` rather than reviving the old one. This keeps win-rate analytics
 * clean.
 */
const SALES_DEAL_TEMPLATE: Omit<UPGLifecycle, 'entity_type'> = {
  template_id: 'SALES_DEAL',
  initial_phase: 'qualified',
  terminal_phases: ['closed_won', 'closed_lost'],
  phases: [
    { id: 'qualified', label: 'Qualified', description: 'Lead has been qualified: there\'s a real budget, need, and decision-maker. Not yet pitched.', transitions_to: ['proposal'] },
    { id: 'proposal', label: 'Proposal', description: 'A proposal has been delivered. Pricing and scope are on the table.', transitions_to: ['negotiation', 'closed_lost'] },
    { id: 'negotiation', label: 'Negotiation', description: 'Terms are being finalised. Both sides are working toward agreement.', transitions_to: ['closed_won', 'closed_lost'] },
    { id: 'closed_won', label: 'Closed Won', description: 'Deal signed. Customer is now active.', transitions_to: [] },
    { id: 'closed_lost', label: 'Closed Lost', description: 'Deal did not close. A re-engaged prospect becomes a new `deal` rather than reviving this one.', transitions_to: [] },
  ],
}

/** All entity types generated from lifecycle templates */
const TEMPLATE_LIFECYCLES: UPGLifecycle[] = [
  // Publishing lifecycle
  fromTemplate('content_piece', PUBLISHING_TEMPLATE),
  fromTemplate('social_post', PUBLISHING_TEMPLATE),
  fromTemplate('press_release', PUBLISHING_TEMPLATE),
  fromTemplate('postmortem', PUBLISHING_TEMPLATE),
  fromTemplate('marketplace_listing', PUBLISHING_TEMPLATE),
  fromTemplate('api_contract', PUBLISHING_TEMPLATE),

  // Operational lifecycle
  fromTemplate('marketing_campaign_plan', OPERATIONAL_TEMPLATE),
  fromTemplate('marketing_channel', OPERATIONAL_TEMPLATE),
  fromTemplate('event', OPERATIONAL_TEMPLATE),
  fromTemplate('community_initiative', OPERATIONAL_TEMPLATE),
  fromTemplate('education_program', OPERATIONAL_TEMPLATE),
  fromTemplate('partner_program', OPERATIONAL_TEMPLATE),
  fromTemplate('program', OPERATIONAL_TEMPLATE),
  fromTemplate('project', OPERATIONAL_TEMPLATE),
  fromTemplate('partnership', OPERATIONAL_TEMPLATE),
  fromTemplate('developer_portal', OPERATIONAL_TEMPLATE),
  fromTemplate('pricing_tier', OPERATIONAL_TEMPLATE),
  fromTemplate('subscription', OPERATIONAL_TEMPLATE),

  // Approval lifecycle
  fromTemplate('change_request', APPROVAL_TEMPLATE),
  fromTemplate('threat_model', APPROVAL_TEMPLATE),
  fromTemplate('security_policy', APPROVAL_TEMPLATE),
  fromTemplate('compliance_framework', APPROVAL_TEMPLATE),
  fromTemplate('decision', APPROVAL_TEMPLATE),
  fromTemplate('quote_document', APPROVAL_TEMPLATE),

  // Work item lifecycle
  fromTemplate('deliverable', WORK_ITEM_TEMPLATE),
  fromTemplate('milestone', WORK_ITEM_TEMPLATE),
  fromTemplate('success_milestone', WORK_ITEM_TEMPLATE),
  fromTemplate('invoice', WORK_ITEM_TEMPLATE),
  fromTemplate('lead', WORK_ITEM_TEMPLATE),

  // Discovery lifecycle
  fromTemplate('design_question', DISCOVERY_TEMPLATE),

  // Maturity lifecycle
  fromTemplate('api_ecosystem', MATURITY_TEMPLATE),
  fromTemplate('integration_partner', MATURITY_TEMPLATE),
  fromTemplate('locale', MATURITY_TEMPLATE),

  // ── Phase C: PUBLISHING (draft / review / published / archived) ─────────────
  fromTemplate('user_journey', PUBLISHING_TEMPLATE),
  fromTemplate('user_flow', PUBLISHING_TEMPLATE),
  fromTemplate('wireframe', PUBLISHING_TEMPLATE),
  fromTemplate('service_blueprint', PUBLISHING_TEMPLATE),
  fromTemplate('design_guideline', PUBLISHING_TEMPLATE),
  fromTemplate('interaction_spec', PUBLISHING_TEMPLATE),
  fromTemplate('brand_asset', PUBLISHING_TEMPLATE),
  fromTemplate('brand_voice', PUBLISHING_TEMPLATE),
  fromTemplate('knowledge_base_article', PUBLISHING_TEMPLATE),
  fromTemplate('document', PUBLISHING_TEMPLATE),
  fromTemplate('documentation_template', PUBLISHING_TEMPLATE),
  fromTemplate('prompt_template', PUBLISHING_TEMPLATE),
  fromTemplate('help_video', PUBLISHING_TEMPLATE),
  fromTemplate('tutorial', PUBLISHING_TEMPLATE),
  fromTemplate('walkthrough', PUBLISHING_TEMPLATE),
  fromTemplate('learning_path', PUBLISHING_TEMPLATE),
  fromTemplate('competitive_analysis', PUBLISHING_TEMPLATE),
  fromTemplate('messaging', PUBLISHING_TEMPLATE),
  fromTemplate('competitive_battle_card', PUBLISHING_TEMPLATE),
  fromTemplate('ad_creative', PUBLISHING_TEMPLATE),
  fromTemplate('runbook', PUBLISHING_TEMPLATE),
  fromTemplate('report', PUBLISHING_TEMPLATE),
  fromTemplate('status_report', PUBLISHING_TEMPLATE),
  fromTemplate('translation_bundle', PUBLISHING_TEMPLATE),
  fromTemplate('a11y_guideline', PUBLISHING_TEMPLATE),
  fromTemplate('dashboard', PUBLISHING_TEMPLATE),
  fromTemplate('glossary_term', PUBLISHING_TEMPLATE),
  fromTemplate('event_schema', PUBLISHING_TEMPLATE),
  fromTemplate('data_model', PUBLISHING_TEMPLATE),
  fromTemplate('roadmap', PUBLISHING_TEMPLATE),
  fromTemplate('workflow_template', PUBLISHING_TEMPLATE),

  // ── Phase C: OPERATIONAL (planning / active / paused / completed / sunset) ──
  fromTemplate('launch', OPERATIONAL_TEMPLATE),
  fromTemplate('demand_gen_program', OPERATIONAL_TEMPLATE),
  fromTemplate('content_strategy', OPERATIONAL_TEMPLATE),
  fromTemplate('gtm_strategy', OPERATIONAL_TEMPLATE),
  fromTemplate('marketing_strategy', OPERATIONAL_TEMPLATE),
  fromTemplate('email_sequence', OPERATIONAL_TEMPLATE),
  fromTemplate('webinar', OPERATIONAL_TEMPLATE),
  fromTemplate('nps_campaign', OPERATIONAL_TEMPLATE),
  fromTemplate('monitor', OPERATIONAL_TEMPLATE),
  fromTemplate('alert_rule', OPERATIONAL_TEMPLATE),
  fromTemplate('on_call_rotation', OPERATIONAL_TEMPLATE),
  fromTemplate('security_audit', OPERATIONAL_TEMPLATE),
  fromTemplate('penetration_test', OPERATIONAL_TEMPLATE),
  fromTemplate('security_review', OPERATIONAL_TEMPLATE),
  fromTemplate('qa_session', OPERATIONAL_TEMPLATE),
  fromTemplate('a11y_audit', OPERATIONAL_TEMPLATE),
  fromTemplate('test_environment', OPERATIONAL_TEMPLATE),
  fromTemplate('workspace', OPERATIONAL_TEMPLATE),
  fromTemplate('pricing_strategy', OPERATIONAL_TEMPLATE),
  fromTemplate('discount_strategy', OPERATIONAL_TEMPLATE),

  // ── Phase C: APPROVAL (proposed / reviewing / approved / rejected / deprecated)
  fromTemplate('data_contract', APPROVAL_TEMPLATE),
  fromTemplate('audit_log_policy', APPROVAL_TEMPLATE),
  fromTemplate('access_policy', APPROVAL_TEMPLATE),
  fromTemplate('privacy_policy', APPROVAL_TEMPLATE),

  // ── Phase C: MATURITY (alpha / beta / ga / deprecated) ──────────────────────
  fromTemplate('design_system', MATURITY_TEMPLATE),
  fromTemplate('design_component', MATURITY_TEMPLATE),
  fromTemplate('design_pattern', MATURITY_TEMPLATE),
  fromTemplate('screen', MATURITY_TEMPLATE),
  fromTemplate('brand_logo', MATURITY_TEMPLATE),
  fromTemplate('certification', MATURITY_TEMPLATE),
  fromTemplate('data_source', MATURITY_TEMPLATE),
  fromTemplate('data_product', MATURITY_TEMPLATE),
  fromTemplate('infrastructure_component', MATURITY_TEMPLATE),

  // ── Phase C: WORK_ITEM (todo / in_progress / in_review / done) ──────────────
  fromTemplate('agent_task', WORK_ITEM_TEMPLATE),
  fromTemplate('agent_skill', WORK_ITEM_TEMPLATE),
  fromTemplate('agent_hook', WORK_ITEM_TEMPLATE),

  // ── Phase B: RISK_ITEM (identified → assessed → mitigated/accepted/closed) ──
  fromTemplate('threat', RISK_ITEM_TEMPLATE),
  fromTemplate('risk', RISK_ITEM_TEMPLATE),
  fromTemplate('compliance_requirement', RISK_ITEM_TEMPLATE),

  // ── Phase B: SALES_DEAL (qualified → proposal → negotiation → won/lost) ─────
  fromTemplate('deal', SALES_DEAL_TEMPLATE),
]

/**
 * framework_exercise (Workspace domain)
 *
 * One run of a framework over a set of entities. `draft` while the framework's
 * inputs are still being filled in, `active` once it is the authoritative run
 * consumers read and rank by, `archived` when superseded — retained for
 * provenance and revivable. The exercise's per-entity results live on its
 * `framework_exercise_includes_node` edges, not in these phases.
 */
const FRAMEWORK_EXERCISE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'framework_exercise',
  initial_phase: 'draft',
  terminal_phases: ['archived'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description:
        'The exercise has been created and entities pulled into scope, but the framework\'s inputs have not all been filled in yet.',
      transitions_to: ['active', 'archived'],
    },
    {
      id: 'active',
      label: 'Active',
      description:
        'The current, authoritative run of its framework. Its include edges carry the live results consumers read, rank, and render by.',
      transitions_to: ['archived'],
    },
    {
      id: 'archived',
      label: 'Archived',
      description:
        'A past run, retained for provenance. Still queryable but superseded by a newer exercise and hidden from default views. Can be revived to active.',
      transitions_to: ['active'],
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

/** The complete set of UPG lifecycle definitions, grouped by domain.
 *  Entity types without lifecycles (persona, metric, quote, etc.) are deliberately excluded. */
// Specification (Foundations, 0.9.12): lifecycle-light. A governed spec is
// authored (draft), adopted (active), wound down (deprecated), then replaced
// (superseded). No product-style phase ladder.
const SPECIFICATION_LIFECYCLE: UPGLifecycle = {
  entity_type: 'specification',
  initial_phase: 'draft',
  terminal_phases: ['superseded'],
  phases: [
    {
      id: 'draft',
      label: 'Draft',
      description: 'Being authored. Not yet adopted as the canonical specification.',
      transitions_to: ['active', 'superseded'],
    },
    {
      id: 'active',
      label: 'Active',
      description: 'In force. The current authoritative version products implement and conform to.',
      transitions_to: ['deprecated', 'superseded'],
    },
    {
      id: 'deprecated',
      label: 'Deprecated',
      description: 'Still valid but no longer recommended; a successor exists or is imminent.',
      transitions_to: ['superseded'],
    },
    {
      id: 'superseded',
      label: 'Superseded',
      description: 'Replaced by a newer specification. Retained for historical reference.',
      transitions_to: [],
    },
  ],
}

/**
 * planning_cycle (Product Specification domain)
 *
 * planned -> active -> closed. A cadence interval is drafted while it is being
 * shaped (dates set, goal written, work scheduled in), runs while the team is
 * inside it, and closes when it ends. `status` is the node lifecycle; there is
 * deliberately no shadow `*_status`. A closed cycle can reopen if the team
 * extends or reruns it.
 */
const PLANNING_CYCLE_LIFECYCLE: UPGLifecycle = {
  entity_type: 'planning_cycle',
  initial_phase: 'planned',
  terminal_phases: ['closed'],
  phases: [
    { id: 'planned', label: 'Planned', description: 'The cycle is being shaped: dates set, goal written, work scheduled into it. It has not started yet.', transitions_to: ['active'] },
    { id: 'active', label: 'Active', description: 'The team is inside the interval; work is flowing through it.', transitions_to: ['closed'] },
    { id: 'closed', label: 'Closed', description: 'The interval has ended. Scheduled work has shipped, carried over, or been dropped. May reopen if the team extends or reruns it.', transitions_to: ['active'] },
  ],
}

export const UPG_LIFECYCLES: readonly UPGLifecycle[] = [
  // Product (root)
  PRODUCT_LIFECYCLE,

  // Foundations (0.9.12)
  SPECIFICATION_LIFECYCLE,

  // Discovery & Validation
  RESEARCH_STUDY_LIFECYCLE,
  NEED_LIFECYCLE,
  OPPORTUNITY_LIFECYCLE,
  SOLUTION_LIFECYCLE,
  HYPOTHESIS_CLAIM_LIFECYCLE, // canonical 'hypothesis' lifecycle. The pre-v0.2.8 legacy binding (untested → testing → resolved) was removed in 0.13.0 Wave 1 ( T0.3): it was a dead second binding for the same entity_type, always shadowed by this one, and the legacy-status remap lives in UPG_*_MIGRATIONS, not a live lifecycle.
  EXPERIMENT_LIFECYCLE,
  EXPERIMENT_PLAN_LIFECYCLE,
  EXPERIMENT_RUN_LIFECYCLE,
  RESEARCH_PLAN_LIFECYCLE,
  FEEDBACK_PROGRAM_LIFECYCLE,
  FEATURE_REQUEST_LIFECYCLE,
  BETA_PROGRAM_LIFECYCLE,
  USER_ADVISORY_BOARD_LIFECYCLE,
  DESIGN_SPRINT_LIFECYCLE,

  // Strategy & Product Specification
  OUTCOME_LIFECYCLE,
  VISION_LIFECYCLE,
  MISSION_LIFECYCLE,
  CAPABILITY_LIFECYCLE,
  OBJECTIVE_LIFECYCLE,
  KEY_RESULT_LIFECYCLE,
  STRATEGIC_THEME_LIFECYCLE,
  INITIATIVE_LIFECYCLE,
  STRATEGIC_PILLAR_LIFECYCLE,
  ASSUMPTION_LIFECYCLE,
  STRATEGIC_QUESTION_LIFECYCLE,
  FEATURE_AREA_LIFECYCLE,
  FEATURE_LIFECYCLE,
  EPIC_LIFECYCLE,
  // user_story is lifecycle-free (declared in UPG_LIFECYCLE_FREE_TYPES below).
  // story_task lifecycle removed v0.4.0; collapsed into task (TASK_LIFECYCLE,
  // WORK_ITEM_TEMPLATE).
  RELEASE_LIFECYCLE,
  TASK_LIFECYCLE,
  BUG_LIFECYCLE,
  ROADMAP_ITEM_LIFECYCLE,
  PLANNING_CYCLE_LIFECYCLE,
  IP_ASSET_LIFECYCLE,
  CONTRACT_LIFECYCLE,
  DESIGN_CONCEPT_LIFECYCLE,
  PROTOTYPE_LIFECYCLE,
  BRAND_IDENTITY_LIFECYCLE,

  // Engineering & Operations
  SERVICE_LIFECYCLE,
  DEPLOYMENT_LIFECYCLE,
  FEATURE_FLAG_LIFECYCLE,
  TECHNICAL_DEBT_ITEM_LIFECYCLE,
  INVESTIGATION_LIFECYCLE,
  EXTERNAL_API_LIFECYCLE,
  DATABASE_SCHEMA_LIFECYCLE,
  INCIDENT_LIFECYCLE,
  VULNERABILITY_LIFECYCLE,
  SECURITY_CONTROL_LIFECYCLE,
  A11Y_ISSUE_LIFECYCLE,
  DATA_PIPELINE_LIFECYCLE,
  AI_MODEL_LIFECYCLE,
  EVAL_RUN_LIFECYCLE,
  WORKFLOW_RUN_LIFECYCLE,
  AGENT_DEFINITION_LIFECYCLE,
  AGENT_SESSION_LIFECYCLE,
  REVIEW_GATE_LIFECYCLE,
  TEST_SUITE_LIFECYCLE,
  TEST_CASE_LIFECYCLE,

  // ── Phase B hand-authored ─────────────────────────────────────────
  // Research + Validation
  INSIGHT_LIFECYCLE,
  RESEARCH_QUESTION_LIFECYCLE,
  INTERVIEW_GUIDE_LIFECYCLE,
  TEST_PLAN_LIFECYCLE,
  FEASIBILITY_STUDY_LIFECYCLE,
  // AI workflow
  AI_EXPERIMENT_LIFECYCLE,
  AI_DATASET_LIFECYCLE,
  AI_GUARDRAIL_LIFECYCLE,
  HALLUCINATION_REPORT_LIFECYCLE,
  MODEL_COMPARISON_LIFECYCLE,
  PROMPT_VERSION_LIFECYCLE,
  EVAL_BENCHMARK_LIFECYCLE,
  // Business Model
  BUSINESS_MODEL_LIFECYCLE,
  VALUE_PROPOSITION_LIFECYCLE,
  REVENUE_STREAM_LIFECYCLE,
  // Customer Success
  SUPPORT_TICKET_LIFECYCLE,
  CUSTOMER_FEEDBACK_LIFECYCLE,
  CUSTOMER_HEALTH_SCORE_LIFECYCLE,
  PLAYBOOK_LIFECYCLE,
  // Team & Organisation
  TEAM_OKR_LIFECYCLE,
  RETROSPECTIVE_LIFECYCLE,
  DEPENDENCY_LIFECYCLE,
  ROLE_LIFECYCLE,
  CAPACITY_PLAN_LIFECYCLE,
  // Product & Growth
  VARIANT_LIFECYCLE,
  GROWTH_CAMPAIGN_LIFECYCLE,

  // Workspace
  FRAMEWORK_EXERCISE_LIFECYCLE,

  // ── Template-generated lifecycles ─────────────────────────────────
  ...TEMPLATE_LIFECYCLES,
]

/**
 * Returns the lifecycle definition for a given entity type, or `undefined`
 * if the type does not have a lifecycle.
 *
 * @example
 * const lifecycle = getLifecycleForType('hypothesis')
 * // → HYPOTHESIS_CLAIM_LIFECYCLE
 *
 * const noLifecycle = getLifecycleForType('persona')
 * // → undefined
 */
export function getLifecycleForType(entityType: string): UPGLifecycle | undefined {
  return UPG_LIFECYCLES.find((l) => l.entity_type === entityType)
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle-free types: the explicit allow-list
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that are deliberately lifecycle-free.
 *
 * Every active UPGEntityType must be either in UPG_LIFECYCLES or in this
 * set; the `10-lifecycle-coverage` audit enforces it. The coverage check
 * is the successor to the earlier ad-hoc "barren entity" info log.
 *
 * Categories represented here:
 *
 *  • **Reference / catalog data**: vocabulary definitions that don't
 *    transition (persona, skill, competitor, glossary_term).
 *  • **Structural primitives**: atoms of a larger composite (journey_step,
 *    funnel_step, aggregate, domain_entity, contract_clause).
 *  • **Data points / snapshots**: immutable observations (quote,
 *    observation, evidence, survey_response, test_result).
 *  • **Configuration**: static settings (paywall, trial_config,
 *    attribution_model, design_token).
 *  • **Historical records**: append-only ledger entries (changelog,
 *    approval_record, workflow_artifact, ai_trace, ai_cost_tracker).
 *  • **Profile / directory entries**: people and orgs (contact,
 *    stakeholder, organization).
 *  • **Computed / derived values**: not workflow-bearing (cohort,
 *    customer_health_score, forecast, error_budget).
 *  • **DDD modelling primitives**: aggregates / value objects / commands;
 *    they describe the domain model, not processes within it.
 *
 * Some of these will gain lifecycles in v0.3 if Entopo usage surfaces real
 * states. The allow-list is therefore *intentional today*, not
 * *locked forever*.
 *
 * Keep this list organised by domain for review clarity. When moving a
 * type into UPG_LIFECYCLES, remove it from here.
 */
export const UPG_LIFECYCLE_FREE_TYPES: ReadonlySet<string> = new Set<string>([
  // ── Foundations (3 of 4): a primitive either exists or is deprecated; no
  //    phase ladder (like metric). `operating_lifecycle`/`operating_stage` are
  //    static ordered reference data (the loop is a `cyclic` flag, not a state
  //    machine). `specification` carries a lifecycle. ──
  'primitive', 'operating_lifecycle', 'operating_stage',

  // ── User (5): personas and JTBD atoms are reference data ──────────────────
  'persona', 'job', 'job_step', 'desired_outcome', 'switching_cost',

  // ── Market Intelligence (7 of 8): competitor landscape is reference data;
  //    competitor_signal is an append-only dated event (no phase ladder);
  //    competitive_analysis shipped PUBLISHING lifecycle in Phase C;
  //    classification_axis and classification_value are reference taxonomy
  //    atoms with no state machine. ─
  'competitor', 'competitor_feature', 'competitor_signal', 'market_trend', 'market_segment',
  'classification_axis', 'classification_value',

  // ── User Research (5 of 8): participants, quotes, observations,
  //    clusters, survey responses are immutable data points ────────────────
  'participant', 'observation', 'quote', 'affinity_cluster', 'survey_response',

  // ── UX Design (3 of 8): journey structural atoms ──────────────────────────
  'journey_step', 'journey_phase', 'journey_action', 'screen_state',

  // ── Design System (3 of 7): tokens and annotations are atomic values ────
  'design_token', 'annotation',

  // ── Brand (4 of 6): colour/typography/imagery/voice are reference atoms ──
  'brand_colour', 'brand_typography', 'brand_imagery',

  // ── Product Specification (4 of 5): criteria, grouping, historical, +
  //    user_story (the templated promise is a stable design artefact; the paired
  //    task carries the lifecycle). Re-canon story_statement → user_story at
  //    v0.7.0/. ─
  'acceptance_criterion', 'changelog', 'roadmap_theme', 'user_story',

  // ── Strategy: metric is a measurement definition; metric_quality_assessment
  //    is a point-in-time snapshot; value_stream is a mapped flow;
  //    constraint carries its own `constraint_status` enum (binding/advisory/
  //    lifted) as a property; base-node `status` not used.
  //    vision/mission/capability/outcome get lifecycles in Phase B or C ─────
  'metric', 'metric_quality_assessment', 'value_stream', 'constraint',

  // ── Engineering (15 of 17): DDD modelling primitives + infra references.
  //    root_cause / symptom / fix are investigation findings, not workflows
  //    (investigation itself has a lifecycle) ────────────────────────────────
  'aggregate', 'domain_entity', 'value_object', 'command', 'read_model',
  'domain_event', 'bounded_context', 'api_endpoint', 'queue_topic',
  'build_artifact', 'code_repository', 'library_dependency',
  'integration_pattern', 'data_flow', 'root_cause', 'symptom', 'fix',

  // ── Business Model (6 of 9): BMC cells are structural frames ────────────
  'cost_structure', 'unit_economics', 'key_resource', 'key_activity',
  'customer_relationship', 'distribution_channel',

  // ── Go-To-Market (8 of 13): positioning/ICP/territory/sales_motion are
  //    configuration; objection/rebuttal/proof_point are catalog entries ───
  'ideal_customer_profile', 'positioning', 'sales_motion', 'territory',
  'objection', 'rebuttal', 'proof_point',

  // ── Team & Organisation (7 of 11): org structural atoms ───────────────────
  'team', 'stakeholder', 'person', 'department', 'skill', 'ceremony',

  // ── Data & Analytics (4 of 10): lineage and domain containers, plus
  //    atomic definitions ────────────────────────────────────────────────────
  'data_lineage', 'data_domain', 'data_quality_rule',

  // ── AI (3 of 10): traces and cost trackers are append-only; model
  //    comparison snapshots are immutable ───────────────────────────────────
  'ai_cost_tracker', 'ai_trace',

  // ── Automation (2 of 6): approvals and artifacts are ledger entries ──────
  'approval_record', 'workflow_artifact',

  // ── Growth (7 of 9): funnels and attribution are structural definitions;
  //    cohorts/segments are computed snapshots ────────────────────────────
  'funnel', 'funnel_step', 'acquisition_channel', 'cohort',
  'behavioral_segment', 'growth_loop', 'attribution_model',

  // ── Sales (5 of 6): pipeline structure + accounts/contacts + forecast
  //    snapshots. Only `deal` has a lifecycle (Phase B SALES_DEAL template) ─
  'account', 'contact', 'pipeline_sales', 'pipeline_stage', 'forecast',

  // ── Customer Success (5 of 9): journey structure + derived values ────────
  'customer_journey_stage', 'touchpoint', 'churn_reason', 'service_level_agreement',

  // ── DevOps (5 of 10): indicators and budgets are measurement references;
  //    strategies and pipelines are configuration ──────────────────────────
  'service_level_indicator', 'service_level_objective', 'error_budget',
  'ci_pipeline', 'release_strategy',

  // ── Security (1 of 5): data classification is a reference label ──────────
  'data_classification',

  // ── Accessibility (2 of 4): standards and annotations ─────────────────────
  'a11y_standard', 'a11y_annotation',

  // ── Testing (3 of 5): regression tests are reference definitions; test
  //    results and coverage reports are immutable records ───────────────────
  'regression_test', 'test_coverage_report', 'test_result',

  // ── Customer Feedback (2 of 3): themes and votes are atomic data points ──
  'feedback_theme', 'feedback_vote',

  // ── Pricing (2 of 4): trial and paywall are configuration ─────────────────
  'trial_config', 'paywall',

  // ── Content (2 of 5): calendars and themes are planning configuration ────
  'content_calendar', 'content_theme',

  // ── Legal (2 of 3): legal_entity is an org; contract_clause is an atom
  //    of a contract (which has its own lifecycle) ───────────────────────────
  'legal_entity', 'contract_clause',

  // ── Portfolio (3 of 3): structural containers ─────────────────────────────
  'organization', 'portfolio', 'product_area',

  // ── Program Management (2 of 3): allocations and registers are tracking
  //    containers ────────────────────────────────────────────────────────────
  'resource_allocation', 'risk_register',

  // ── Localisation (4 of 5): translation keys, configs, and regional
  //    adaptations are reference data ────────────────────────────────────────
  'translation_key', 'locale_config', 'cultural_adaptation', 'regional_pricing',

  // ── Marketing (1 of 4): SEO keywords are tracked reference terms ─────────
  'seo_keyword',

  // ── Ecosystem (2 of 2): partner tiers and rev-share terms are config ─────
  'partner_tier', 'partner_revenue_share',

  // ── Validation (2 of 4): evidence + learning are data points captured
  //    from experiment_runs (which have lifecycles); hypothesis_evidence was
  //    lifecycle-free here but is deprecated at v0.4.0 ──────────────────────────────────────
  'evidence', 'learning',
])

/**
 * Returns `true` if an entity type is intentionally lifecycle-free (see
 * {@link UPG_LIFECYCLE_FREE_TYPES} for the full list and rationale).
 *
 * @example
 * isLifecycleFreeType('tag')        // true  (tags are reference data, not stateful artefacts)
 * isLifecycleFreeType('feature')    // false (features carry a development lifecycle)
 */
export function isLifecycleFreeType(entityType: string): boolean {
  return UPG_LIFECYCLE_FREE_TYPES.has(entityType)
}

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle-planned types: triaged, deferred to Phase B/C/D
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entity types that are **triaged but not yet implemented**; each has a
 * lifecycle planned for a later phase of. This set exists so that
 * the coverage audit (`10-lifecycle-coverage`) distinguishes
 * "actively deferred" from "untriaged"; moving a type here is a commitment
 * to enrich it, not a punt.
 *
 * Phase breakdown (committed 2026-04-17):
 *
 *  • **Phase B**: high-value hand-authored lifecycles (NL) + two new
 *    templates (SALES_DEAL, RISK_ITEM). ~30 types: outcome, feature, epic,
 *    user_story, bug, deal, threat, risk, compliance_requirement, insight,
 *    hypothesis-adjacent artefacts, workflow artefacts, etc.
 *  • **Phase C**: expand existing-template coverage to the PUBLISHING /
 *    OPERATIONAL / APPROVAL / MATURITY / WORK_ITEM buckets via
 *    `fromTemplate()`. ~60 types.
 *  • **Phase D**: residual new lifecycles for types that don't fit a
 *    template cleanly but didn't make Phase B's cut. ~10 types.
 *
 * As phases land, types migrate out of this set into UPG_LIFECYCLES.
 * The `10-lifecycle-coverage` audit surfaces the remaining count so the
 * closure trajectory is visible.
 */
export const UPG_LIFECYCLE_PLANNED_TYPES: ReadonlySet<string> = new Set<string>([
  // Phase B cleared this set entirely. Every type that was triaged
  // into Phase B/C/D under now either has a lifecycle in
  // `UPG_LIFECYCLES` or is documented as lifecycle-free in
  // `UPG_LIFECYCLE_FREE_TYPES`.
  //
  // Reintroduce entries here when a new entity type is added to the spec
  // and decided to be lifecycle-bearing but its phases have not yet been
  // designed. The `10-lifecycle-coverage` audit will surface uncovered
  // active types until they're either implemented or moved to the
  // free-types set.
])

/**
 * Returns `true` if an entity type has a lifecycle planned for a later phase
 * (see {@link UPG_LIFECYCLE_PLANNED_TYPES}).
 *
 * @example
 * isLifecyclePlannedType('outcome')   // true  (planned for a later phase)
 * isLifecyclePlannedType('feature')   // false (feature lifecycle is already implemented)
 */
export function isLifecyclePlannedType(entityType: string): boolean {
  return UPG_LIFECYCLE_PLANNED_TYPES.has(entityType)
}

// ─────────────────────────────────────────────────────────────────────────────
// Render-ready lifecycle shape
//
// Consumers that render a lifecycle as a state-machine graphic (the UPG site
// entity-detail visualiser, Entopo Explora, the CLI `upg lifecycle show`
// command, future Electron/IDE surfaces) all need the same flattened
// `{ states, transitions }` shape and the same transition classification.
//
// `getLifecycleRenderShape()` owns that translation so each consumer doesn't
// reinvent it (and drift). The shape is **phase-level**: the universal
// vocabulary every `UPGLifecycle` exposes, and the granularity that the
// `status` property on UPG entities actually uses. Finer state-level
// rendering is intentionally deferred to a future helper.
// ─────────────────────────────────────────────────────────────────────────────

/** A render-ready lifecycle state (one phase of the underlying lifecycle). */
export interface LifecycleRenderState {
  /** Phase id (e.g. `'draft'`, `'in_progress'`, `'archived'`). */
  id: string
  /** Human-readable label. */
  label: string
  /** What this state means. */
  description: string
  /** True if this state is in the lifecycle's `terminal_phases`. */
  terminal: boolean
}

/** A render-ready transition between two lifecycle states. */
export interface LifecycleRenderTransition {
  /** Source state id. */
  from: string
  /** Target state id. */
  to: string
  /**
   * Classification derived from the lifecycle's terminal set and authoring
   * order:
   *
   * - `'reopen'`: source is terminal, target is not (e.g. `archived → draft`).
   * - `'terminal'`: target is terminal, source is not (forward to completion).
   * - `'backward'`: target appears before source in `phases[]` and is not a reopen.
   * - `'forward'`: everything else.
   *
   * The classification is a render hint, not a validation rule: any transition
   * declared in the source lifecycle is valid by definition.
   */
  kind: 'forward' | 'backward' | 'terminal' | 'reopen'
}

/** A flattened, render-ready shape derived from a single `UPGLifecycle`. */
export interface LifecycleRenderShape {
  /** Entity type this shape was derived from. */
  entity_type: string
  /**
   * Identifier of the source template, if the underlying lifecycle was
   * generated from one (e.g. `'PUBLISHING'`). Hand-authored lifecycles leave
   * this `undefined`.
   */
  template_id?: string
  /** Render states, in the authoring order of the source `phases[]`. */
  states: LifecycleRenderState[]
  /** Render transitions, classified by `kind`. */
  transitions: LifecycleRenderTransition[]
  /** Initial state id; equals the source `initial_phase`. */
  initial_state: string
}

/**
 * Returns a render-ready `{ states, transitions }` shape for an entity type's
 * lifecycle, or `null` if the type is intentionally lifecycle-free
 * (see {@link UPG_LIFECYCLE_FREE_TYPES}).
 *
 * The shape is flattened to one level; each phase becomes one render state.
 * Optional finer-grained `core_states` are not surfaced here; consumers that
 * need them should read the source lifecycle directly via
 * {@link getLifecycleForType}.
 *
 * Transitions are classified into one of `'forward' | 'backward' | 'terminal'
 * | 'reopen'` so visualisers can style them without re-deriving the
 * classification.
 *
 * Returns `null` for:
 * - Types in {@link UPG_LIFECYCLE_FREE_TYPES} (e.g. `persona`, `metric`).
 * - Types not yet in the registry (planned types per
 *   {@link UPG_LIFECYCLE_PLANNED_TYPES}, or unknown types).
 *
 * @example
 * const shape = getLifecycleRenderShape('document')
 * // → { entity_type: 'document', template_id: 'PUBLISHING',
 * //     states: [{ id: 'draft', terminal: false, … }, …],
 * //     transitions: [{ from: 'archived', to: 'draft', kind: 'reopen' }, …],
 * //     initial_state: 'draft' }
 *
 * @example
 * getLifecycleRenderShape('persona')  // → null (intentionally lifecycle-free)
 */
export function getLifecycleRenderShape(
  entityType: string,
): LifecycleRenderShape | null {
  const lifecycle = getLifecycleForType(entityType)
  if (!lifecycle) return null

  const terminalSet = new Set(lifecycle.terminal_phases)
  const phaseIndex = new Map(lifecycle.phases.map((p, i) => [p.id, i]))

  const states: LifecycleRenderState[] = lifecycle.phases.map((phase) => ({
    id: phase.id,
    label: phase.label,
    description: phase.description,
    terminal: terminalSet.has(phase.id),
  }))

  const transitions: LifecycleRenderTransition[] = []
  for (const phase of lifecycle.phases) {
    const fromTerminal = terminalSet.has(phase.id)
    for (const to of phase.transitions_to) {
      const toTerminal = terminalSet.has(to)
      let kind: LifecycleRenderTransition['kind']
      if (fromTerminal && !toTerminal) {
        kind = 'reopen'
      } else if (toTerminal && !fromTerminal) {
        kind = 'terminal'
      } else {
        const fromIdx = phaseIndex.get(phase.id) ?? 0
        const toIdx = phaseIndex.get(to) ?? 0
        kind = toIdx < fromIdx ? 'backward' : 'forward'
      }
      transitions.push({ from: phase.id, to, kind })
    }
  }

  return {
    entity_type: lifecycle.entity_type,
    ...(lifecycle.template_id !== undefined && { template_id: lifecycle.template_id }),
    states,
    transitions,
    initial_state: lifecycle.initial_phase,
  }
}
