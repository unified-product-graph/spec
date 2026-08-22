/**
 * UPG Property Schemas: Product Specification Domain.
 * Feature, FeatureArea, Epic, UserStory, AcceptanceCriterion, Release,
 * Task, Bug, Roadmap, RoadmapItem, Theme, Changelog.
 * Also: OutcomeProperties, ObjectiveProperties, KeyResultProperties.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { HealthStatus, ISODate, Priority, UPGAssessment } from '../primitives.js'
import type { StatusCategory } from '../../grammar/lifecycles.js'

// ---------------------------------------------------------------------------
// STRATEGY METRICS (live alongside product spec)
// ---------------------------------------------------------------------------

/** A measurable change in user or business state the product drives.
 * The "O" in OKR when paired with objectives. Answers *what changed for the user*,
 * not *what we built*.
 *
 * @example
 * const properties: OutcomeProperties = {
 *   timeline: 'Kickoff 2026-04-22, results by 2026-05-15.',
 *   owner: 'sam.patel@arkheiev.com',
 *   success_criteria: 'Week-one activation rises from 38% to ≥45%.',
 * }
 */
export interface OutcomeProperties {
  /** Target timeframe (e.g. "Q2 2026", "12 months") */
  timeline?: string
  /** Accountable person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /**
   * What "achieved" looks like, concretely. Pairs with `measurement_method`.
   * @example "30-day retention above 40% for new signups"
   */
  success_criteria?: string
  /**
   * Assessment approach.
   * `quantitative` = metrics drive the call.
   * `qualitative` = observation / interviews.
   * `mixed` = both, weighted case-by-case.
   */
  measurement_method?: 'quantitative' | 'qualitative' | 'mixed'
  /** Baseline or latest read */
  current_state?: string
  /** Evidence gathered so far (quotes, metrics, studies) */
  evidence_summary?: string
  /** Confidence this is the right outcome to pursue */
  confidence?: UPGAssessment
}

/** A high-level strategic goal. The O in OKR.
 *
 * @example
 * const properties: ObjectiveProperties = {
 *   timeframe: '12-18 months',
 *   progress: 42,
 * }
 */
export interface ObjectiveProperties {
  /**
   * Planning timeframe (e.g. "Q1 2026", "H1 2026").
   * @deprecated since 0.33.0, removeIn 1.0.0. Promote the period to a `planning_cycle` node and link it with the `objective_scoped_to_planning_cycle` edge, which has existed since 0.20.0 and points at a shared, dated, nestable interval instead of a drifting per-objective string. Until promoted, the value is a display label and nothing schedules on it. The promotion is documented rather than automated and no `drop_props` migration ships: which cycle a free-text string means, and whether one exists yet, is a judgement, and dropping the string before the cycle exists destroys the only record of the intent.
   * @example "Q1 2026", "H1 2026"
   */
  timeframe?: string
  /** Overall progress (0–100) */
  progress?: number
}

/** A measurable result under an objective. The KR in OKR.
 *
 * @example
 * const properties: KeyResultProperties = {
 *   current_value: 42,
 *   target_value: 42,
 *   unit: 'days',
 * }
 */
export interface KeyResultProperties {
  /** Most recent observed value */
  current_value?: number
  /** Value for full achievement */
  target_value?: number
  /** Display unit (e.g. "%", "users", "£") */
  unit?: string
  // Delivery health lives on the canonical lifecycle `UPGBaseNode.status`
  // (KEY_RESULT_LIFECYCLE phases: on_track | at_risk | behind | achieved). The
  // former `kr_status` property duplicated it and was removed in 0.9.14 (A2);
  // `UPG_PROPERTY_MIGRATIONS['0.9.14']` lifts any legacy value to `status`.
}

// ---------------------------------------------------------------------------
// PRODUCT SPECIFICATION
// ---------------------------------------------------------------------------

/** A structural grouping of related features within a product.
 *
 * A semantic container (e.g. "Canvas & Visualisation", "AI & Intelligence",
 * "Onboarding") that gathers features under a shared product surface, owning
 * team, or capability. Lifecycle (planned → active → deprecated) is governed
 * by the base-node `status` field (the former `area_status` property was
 * collapsed into it in 0.15.0 Pattern D).
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent product: `product_organised_by_feature_area`
 *   contained features: `feature_area_contains_feature`
 *   owning team: `team_owns_feature_area` (the `owning_team` field below is
 *     at-a-glance display only; the edge is canonical when a `team` entity exists)
 *   related capability: `feature_area_realises_capability`
 *
 * @example
 * const properties: FeatureAreaProperties = {
 *   scope_summary: 'Everything users see and touch on the canvas: graph rendering, layout, zoom, multi-select.',
 *   owning_team: 'platform-canvas',
 *   feature_count: 14,
 *   priority: 'high',
 *   maturity: 'mature',
 *   owner: 'sam.patel@arkheiev.com',
 * }
 */
export interface FeatureAreaProperties {
  /** One-line scope description. Disambiguates from sibling areas at a glance. */
  scope_summary?: string
  /** Team identifier or slug. Free-form display. Canonical relationship is the `team_owns_feature_area` edge. */
  owning_team?: string
  /** Approximate feature count under this area. Snapshot; `feature_area_contains_feature` edges are the source of truth. */
  feature_count?: number
  /** Area owner (handle or email). Promote to a `node_owned_by_team` edge if ownership must be queryable. */
  owner?: string
  /** Importance to the product overall */
  priority?: Priority
  /**
   * Maturity.
   * `nascent` = newly-formed grouping. `mature` = established surface.
   * `legacy` = being phased out for a successor.
   */
  maturity?: 'nascent' | 'growing' | 'mature' | 'legacy'
}

/** A discrete, user-facing capability of the product.
 *
 * @example
 * const properties: FeatureProperties = {
 *   priority: 'high',
 *   owner: 'sam.patel@arkheiev.com',
 *   start_date: '2026-04-01',
 * }
 */
export interface FeatureProperties {
  /** Task-level priority */
  priority?: Priority
  /** Responsible person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /** ISO date work begins */
  start_date?: ISODate
  /** ISO date work completes */
  target_date?: ISODate
  /** Delivery health */
  health?: HealthStatus
  /** The source tool's raw custom workflow state, verbatim and opaque (e.g. "In Review", "QA", "Needs Triage"). Non-canonical and never reasoned over: it exists to round-trip an import losslessly. Map it onto a canonical bucket with `workflow_state_category`; canonical `status` stays the sole reasoning axis. */
  workflow_state?: string
  /**
   * Canonical bucket the raw `workflow_state` maps onto for reasoning: a source
   * "In Review" and a source "QA" may both map to a verification phase.
   * Optional companion to `workflow_state`; canonical `status` remains the sole
   * reasoning axis.
   *
   * @remarks
   * It exists so a graph can reason over an imported custom workflow WITHOUT
   * promoting the source's raw label to `status`. The raw label keeps its own
   * field and stays verbatim; this one says what that label means in the
   * six-bucket vocabulary every major tracker converges on.
   *
   * NARROWED FROM `string` AT 0.32.0. The field exists to carry exactly the
   * {@link StatusCategory} vocabulary, and typing it as an open string meant
   * nothing enforced the one thing it was for; an importer could write any word
   * here and no consumer would know it had. A graph carrying a free string now
   * fails to type-check rather than failing to be understood.
   */
  workflow_state_category?: StatusCategory
}

/** A collection of related user stories that delivers a feature or capability.
 *
 * @example
 * const properties: EpicProperties = {
 *   effort: '3 person-weeks',
 *   priority: 'high',
 *   owner: 'sam.patel@arkheiev.com',
 * }
 */
export interface EpicProperties {
  /** Effort estimate (e.g. "2h", "1d", "3 points"). Use a consistent unit within your team. Canonical name for the work-item size family (`epic`, `user_story`, `task`). */
  effort?: string
  /**
   * Rough size estimate (e.g. "3 sprints", "L", "13 points").
   * @deprecated STAGED, release number assigned at release prep (docket Track "Docket wave 2").
   * Use `effort`, the family-uniform name already carried by
   * `user_story` and `task`. `estimate` was epic's lone divergent spelling of the same
   * concept and it caused real misreads (the app read `estimate` on `user_story`, where
   * only `effort` is declared). Kept (not removed) for back-compat; removal is a later
   * major. Writers: emit `effort`. Readers: prefer `effort`, fall back to `estimate`.
   */
  estimate?: string
  /** Task-level priority */
  priority?: Priority
  /** Responsible person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /** ISO date work begins */
  start_date?: ISODate
  /** ISO date work completes */
  target_date?: ISODate
  /** The source tool's raw custom workflow state, verbatim and opaque (e.g. "In Review", "QA", "Needs Triage"). Non-canonical and never reasoned over: it exists to round-trip an import losslessly. Map it onto a canonical bucket with `workflow_state_category`; canonical `status` stays the sole reasoning axis. */
  workflow_state?: string
  /**
   * Canonical bucket the raw `workflow_state` maps onto for reasoning: a source
   * "In Review" and a source "QA" may both map to a verification phase.
   * Optional companion to `workflow_state`; canonical `status` remains the sole
   * reasoning axis.
   *
   * @remarks
   * It exists so a graph can reason over an imported custom workflow WITHOUT
   * promoting the source's raw label to `status`. The raw label keeps its own
   * field and stays verbatim; this one says what that label means in the
   * six-bucket vocabulary every major tracker converges on.
   *
   * NARROWED FROM `string` AT 0.32.0. The field exists to carry exactly the
   * {@link StatusCategory} vocabulary, and typing it as an open string meant
   * nothing enforced the one thing it was for; an importer could write any word
   * here and no consumer would know it had. A graph carrying a free string now
   * fails to type-check rather than failing to be understood.
   */
  workflow_state_category?: StatusCategory
}


/** "As X, I want Y so Z" templated promise on a user story (UCS pattern P5).
 *
 * The stable design artefact: a product–engineering contract for what the
 * persona will be able to do. Lifecycle-free: a statement either still
 * describes a real promise, or is superseded by a new one when the promise changes.
 *
 * Pairs with `task` (UCS pattern P4, story_task collapsed into task) via `task_implements_user_story`.
 * One statement can have many tasks (re-implementation, per-platform variants);
 * each task carries its own lifecycle.
 *
 * @example
 * const statement: UserStoryProperties = {
 *   as_a: 'product manager',
 *   i_want_to: 'compare two metrics side-by-side',
 *   so_that: 'I can prioritise this week with confidence',
 *   text: 'As a product manager, I want to compare two metrics side-by-side so that I can prioritise this week with confidence.',
 * }
 */
export interface UserStoryProperties {
  /** "As a [persona], …". Free-text persona name or slug ref. */
  as_a?: string
  /** Capability or action the persona wants. */
  i_want_to?: string
  /** Benefit or outcome the persona expects. */
  so_that?: string
  /** Free-form story text. Used as a single-line rendered view. */
  text?: string
  /** Assigned person. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  assignee?: string
  /** Effort estimate (e.g. "2h", "1d", "3 points"). Use a consistent unit within your team. */
  effort?: string
  /** Relative importance against other stories. Lifted onto user_story (0.20.0) so the story is a first-class plannable unit alongside task, matching Jira/Linear where the story/issue is the estimated-and-assigned atom. */
  priority?: Priority
  /** ISO date due. Typically bounded by the release or planning_cycle the story is scheduled into. */
  due_date?: ISODate
  /** The source tool's raw custom workflow state, verbatim and opaque (e.g. "In Review", "QA", "Needs Triage"). Non-canonical and never reasoned over: it exists to round-trip an import losslessly. Map it onto a canonical bucket with `workflow_state_category`; canonical `status` stays the sole reasoning axis. */
  workflow_state?: string
  /**
   * Canonical bucket the raw `workflow_state` maps onto for reasoning: a source
   * "In Review" and a source "QA" may both map to a verification phase.
   * Optional companion to `workflow_state`; canonical `status` remains the sole
   * reasoning axis.
   *
   * @remarks
   * It exists so a graph can reason over an imported custom workflow WITHOUT
   * promoting the source's raw label to `status`. The raw label keeps its own
   * field and stays verbatim; this one says what that label means in the
   * six-bucket vocabulary every major tracker converges on.
   *
   * NARROWED FROM `string` AT 0.32.0. The field exists to carry exactly the
   * {@link StatusCategory} vocabulary, and typing it as an open string meant
   * nothing enforced the one thing it was for; an importer could write any word
   * here and no consumer would know it had. A graph carrying a free string now
   * fails to type-check rather than failing to be understood.
   */
  workflow_state_category?: StatusCategory
}

/**
 * @deprecated since v0.4.0. Use `TaskProperties`. `story_task` collapsed into
 * canonical `task`. `task_implements_user_story` edge expresses the story
 * relationship. The former `estimate` / `effort` / `priority` fields were
 * removed in v0.8.0; their values live on the canonical `task`
 * (`TaskProperties.estimate` / `.effort` / `.priority`).
 * Migration: `UPG_MIGRATIONS['0.4.0']` renames story_task nodes to task;
 * `UPG_PROPERTY_MIGRATIONS['0.8.0']` drops the removed property residue.
 */
export type StoryTaskProperties = Record<string, never>

/** Acceptance criterion on a story or feature.
 *
 * @example
 * const properties: AcceptanceCriterionProperties = {
 *   condition: 'personas.length > 0 && opportunities.length === 0',
 *   test_type: 'manual',
 *   pass_status: 'untested',
 * }
 */
export interface AcceptanceCriterionProperties {
  /** Required condition (Given/When/Then or plain text) */
  condition: string
  /** Test mode */
  test_type?: 'manual' | 'automated'
  /**
   * Current verification state of this criterion. `untested` means never
   * attempted; `blocked` means attempted but not verifiable for an
   * environmental reason; `regressed` means previously passing, now failing.
   *
   * @remarks
   * `blocked` is a distinct state from `untested` (a missing credential or an
   * unreachable dependency is not the same as nobody having tried), which the
   * earlier three-value enum conflated into a silent gap.
   *
   * `regressed` is a criterion-level state and is NOT derivable here, because
   * `acceptance_criterion` stores current state only and keeps no result
   * history. The history lives on the `test_case` to `test_result` series,
   * where a single execution's outcome is `TestResultProperties.result_status`
   * and can never itself be "regressed".
   */
  pass_status?: 'untested' | 'pass' | 'fail' | 'regressed' | 'blocked'
}

/** A shipped version or milestone of the product.
 *
 * @example
 * const properties: ReleaseProperties = {
 *   release_date: '2026-04-01',
 *   version: '0.3.1',
 *   start_date: '2026-04-01',
 * }
 */
export interface ReleaseProperties {
  /** Scheduled or actual release date (ISO) */
  release_date?: ISODate
  /** Semver or named version (e.g. "v2.1.0", "Beta 3") */
  version?: string
  /** ISO date work begins */
  start_date?: ISODate
  /** Responsible person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Task: a discrete unit of work, smaller than a story.
 *
 * @example
 * const properties: TaskProperties = {
 *   assignee: 'sam.patel@arkheiev.com',
 *   effort: '3 person-weeks',
 * }
 */
export interface TaskProperties {
  /** Assigned person. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  assignee?: string
  /** Effort estimate (e.g. "2h", "1d", "3 points"). Use a consistent unit within your team. */
  effort?: string
  /** Relative importance against other tasks */
  priority?: Priority
  /** ISO date due. Typically bounded by the containing story's due date. */
  due_date?: ISODate
  /**
   * Free-form classification tags.
   * @deprecated since 0.32.0. Use base-node `tags` for ungrouped labels, and
   * `classification_axis` + `classification_value` +
   * `node_classified_as_classification_value` when the labels belong to a named
   * group. This field duplicated `tags` and had no consumers; three parallel
   * label surfaces (base `tags`, per-type `tags`, per-type `labels`) were two
   * too many. `UPG_PROPERTY_MIGRATIONS['0.32.0']` drops it.
   */
  labels?: string[]
  // `estimate` (story_task collapse relic, duplicated `effort`) removed in 0.14.0.
  /** The source tool's raw custom workflow state, verbatim and opaque (e.g. "In Review", "QA", "Needs Triage"). Non-canonical and never reasoned over: it exists to round-trip an import losslessly. Map it onto a canonical bucket with `workflow_state_category`; canonical `status` stays the sole reasoning axis. */
  workflow_state?: string
  /**
   * Canonical bucket the raw `workflow_state` maps onto for reasoning: a source
   * "In Review" and a source "QA" may both map to a verification phase.
   * Optional companion to `workflow_state`; canonical `status` remains the sole
   * reasoning axis.
   *
   * @remarks
   * It exists so a graph can reason over an imported custom workflow WITHOUT
   * promoting the source's raw label to `status`. The raw label keeps its own
   * field and stays verbatim; this one says what that label means in the
   * six-bucket vocabulary every major tracker converges on.
   *
   * NARROWED FROM `string` AT 0.32.0. The field exists to carry exactly the
   * {@link StatusCategory} vocabulary, and typing it as an open string meant
   * nothing enforced the one thing it was for; an importer could write any word
   * here and no consumer would know it had. A graph carrying a free string now
   * fails to type-check rather than failing to be understood.
   */
  workflow_state_category?: StatusCategory
}

/** Bug report.
 *
 * @example
 * const properties: BugProperties = {
 *   bug_severity: { value: 5, scale: 'severity_5', label: 'critical' },
 *   steps_to_reproduce: 'steps to reproduce',
 * }
 */
export interface BugProperties {
  /**
   * Impact severity (UPGAssessment on the `severity_5` scale). Independent of
   * priority (which governs when it gets fixed). Migrated from the inline
   * `critical|major|minor|trivial` enum ( Option C): map
   * `critical` -> 5, `major` -> 4, `minor` -> 2, `trivial` -> 1; carry the old
   * word in `label`.
   */
  bug_severity?: UPGAssessment
  /** Step-by-step reproduction */
  steps_to_reproduce?: string
  /** Observed environment (e.g. "prod", "staging", "iOS 17.4") */
  environment?: string
  /** Urgency relative to other work. Independent of `bug_severity` (a critical bug can have low priority if rare). */
  priority?: Priority
  /** Assigned person. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  assignee?: string
  /** ISO date due. Often tied to a release gate or SLA. */
  due_date?: ISODate
  /**
   * Free-form classification tags.
   * @deprecated since 0.32.0. Use base-node `tags` for ungrouped labels, and
   * `classification_axis` + `classification_value` +
   * `node_classified_as_classification_value` when the labels belong to a named
   * group. This field duplicated `tags` and had no consumers; three parallel
   * label surfaces (base `tags`, per-type `tags`, per-type `labels`) were two
   * too many. `UPG_PROPERTY_MIGRATIONS['0.32.0']` drops it.
   */
  labels?: string[]
  /** The source tool's raw custom workflow state, verbatim and opaque (e.g. "In Review", "QA", "Needs Triage"). Non-canonical and never reasoned over: it exists to round-trip an import losslessly. Map it onto a canonical bucket with `workflow_state_category`; canonical `status` stays the sole reasoning axis. */
  workflow_state?: string
  /**
   * Canonical bucket the raw `workflow_state` maps onto for reasoning: a source
   * "In Review" and a source "QA" may both map to a verification phase.
   * Optional companion to `workflow_state`; canonical `status` remains the sole
   * reasoning axis.
   *
   * @remarks
   * It exists so a graph can reason over an imported custom workflow WITHOUT
   * promoting the source's raw label to `status`. The raw label keeps its own
   * field and stays verbatim; this one says what that label means in the
   * six-bucket vocabulary every major tracker converges on.
   *
   * NARROWED FROM `string` AT 0.32.0. The field exists to carry exactly the
   * {@link StatusCategory} vocabulary, and typing it as an open string meant
   * nothing enforced the one thing it was for; an importer could write any word
   * here and no consumer would know it had. A graph carrying a free string now
   * fails to type-check rather than failing to be understood.
   */
  workflow_state_category?: StatusCategory
}

/** Product roadmap.
 *
 * @example
 * const properties: RoadmapProperties = {
 *   roadmap_type: 'now_next_later',
 *   timeframe: '12-18 months',
 *   owner: 'sam.patel@arkheiev.com',
 * }
 */
export interface RoadmapProperties {
  /** Structure */
  roadmap_type?: 'now_next_later' | 'quarterly' | 'release_based' | 'theme_based'
  /** Covered timeframe */
  timeframe?: string
  /** Owning person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
}

/** Roadmap item.
 *
 * @example
 * const properties: RoadmapItemProperties = {
 *   quarter: '2026-Q2',
 *   priority: 'high',
 * }
 */
export interface RoadmapItemProperties {
  /** Planning quarter (e.g. "Q2 2026"). Pair with `start_date`/`target_date` for precise scheduling. */
  quarter?: string
  /** Importance against other items */
  priority?: Priority
  /** Delivery confidence within the planned period (UPGAssessment on `confidence_5`). */
  confidence?: UPGAssessment
  /** ISO date work begins. More precise than `quarter` for continuous planning. */
  start_date?: ISODate
  /** ISO date completion is expected. For shipped items, the actual completion date. */
  target_date?: ISODate
}

/** Thematic grouping of roadmap work, around the customer problem it solves.
 *
 * @example
 * const properties: RoadmapThemeProperties = {
 *   theme_scope: 'Week-one activation across all customer-facing surfaces.',
 *   priority: 'high',
 * }
 */
export interface RoadmapThemeProperties {
  /** Scope description */
  theme_scope?: string
  /** Priority */
  priority?: Priority
}

/** Changelog entry.
 *
 * @example
 * const properties: ChangelogProperties = {
 *   version: '0.3.1',
 *   date: '2026-04-01',
 *   change_type: 'feature',
 * }
 */
export interface ChangelogProperties {
  /** Version (e.g. "1.2.0") */
  version?: string
  /** ISO date */
  date?: string
  /** Change type */
  change_type?: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'deprecation'
}

/** Planning cycle: a named, dated interval work flows through, which nests.
 *
 * The cadence axis of the delivery region. One self-nesting type spans every
 * delivery methodology (Scrum sprint, Kanban cadence, Shape Up cycle + cooldown,
 * SAFe program increment, quarterly OKR cycle) because they are all variants of
 * one primitive: a named, dated interval that work is assigned to and which can
 * contain finer intervals. `cadence_kind` discriminates the granularity instead
 * of minting a type per methodology; `planning_cycle_contains_planning_cycle`
 * handles the granularity ladder (a PI contains iterations; a cycle contains its
 * cooldown). Concretely dated (`starts_on` / `ends_on`), which is the deliberate
 * contrast with the freeform `strategic_theme.time_horizon` label a theme carries.
 *
 * @remarks
 * THE ACTIVE CYCLE IS THE ONE WHOSE STATUS IS `active`. There is no `is_active`
 * property and there will not be one: the lifecycle already holds that fact, and
 * a boolean beside it would be a second source of truth for one thing, which is
 * a pair that drifts rather than a pair that agrees.
 *
 * INVARIANT, documented and deliberately UNENFORCED: at most one `active` cycle
 * per parent per `cadence_kind`. No check ships for it. The near-miss is real
 * rather than hypothetical, which is the reason: a portfolio legitimately runs
 * two products' iterations concurrently, so the rule holds per parent and a
 * checker would need a graded corpus to tell a violation from that arrangement.
 * Under the labeled-fixture doctrine a check without such a corpus is one nobody
 * can defend, so the rule lives here, where an implementer meets it, instead of
 * in a validator that would be wrong about real graphs.
 *
 * ROLLING A CYCLE FORWARD: set cycle N to `closed`, and RE-POINT the unfinished
 * work's `planning_cycle_schedules_work_item` edges at N+1. A rolled item ends
 * with ONE edge, not two. The edge means IS SCHEDULED IN, present tense, so a
 * second edge would assert the item is in both cycles at once.
 *
 * The rejected alternative was keeping both edges plus a `rolled_from` edge
 * property. It builds the deferred scheduling-provenance layer through a side
 * door, and the corpus shows what it would actually record: six issues
 * auto-rolled across five cycles with zero completions, which is five edges per
 * issue documenting that nothing happened.
 *
 * Whether the HISTORY of past scheduling is retained is deliberately still open,
 * deferred alongside the same question for canvas keys rather than answered
 * twice in two places with two different answers.
 *
 * PLANNING ENTITIES RELATE TO TIME THROUGH AN EDGE, NOT A FREE-TEXT FIELD
 * (0.33.0, ruled). A free-text period on a planning entity is a display label
 * that nothing can schedule on, join across, or nest; the edge to a
 * `planning_cycle` is the queryable form and both edges the ruling needs already
 * exist (`objective_scoped_to_planning_cycle` and
 * `strategic_theme_scoped_to_planning_cycle`, both shipped 0.20.0). Accordingly
 * `objective.timeframe` and `strategic_theme.time_horizon` are `@deprecated` with
 * `removeIn` 1.0.0.
 *
 * THE CLASS HAS A BOUNDARY, AND IT IS A TEST RATHER THAN A SLOGAN. The class is
 * the entities that can be SCHEDULED IN a planning cycle: the ones that have, or
 * could have, a `*_scoped_to_planning_cycle` or `planning_cycle_schedules_*`
 * edge. That is `objective` and `strategic_theme`, and nothing else in the
 * census. NAMED EXEMPTIONS, because a broader reading would wrongly capture all
 * five: `strategic_pillar.time_horizon` (a durable pillar horizon is genuinely
 * open-ended, not a dated cycle, and its own JSDoc already says so),
 * `vision.timeframe` (a vision is not scheduled in a cycle),
 * `roadmap.timeframe` (a roadmap is a plan OF cycles, not a thing inside one),
 * `roadmap_item.quarter` (pairs with real `start_date` and `target_date`
 * ISODates), `journey_phase.timeframe` (not a planning entity at all), and
 * `market_trend.timeframe` (a forecast window for something the org does not
 * schedule, which is the clearest case of all: nothing can be scoped to a cycle
 * that the org does not control).
 *
 * @example
 * const properties: PlanningCycleProperties = {
 *   cadence_kind: 'iteration',
 *   cadence_label: 'sprint',
 *   starts_on: '2026-07-06',
 *   ends_on: '2026-07-17',
 *   sequence: 47,
 *   goal: 'Ship the AI autofill beta to the design-partner cohort.',
 * }
 */
export interface PlanningCycleProperties {
  /** Methodology-neutral granularity of this interval. `period` is a coarse container (quarter / PI / OKR-cycle scale); `iteration` is a fine execution box (sprint / cycle); `buffer` is between-box slack (cooldown). Required: it is the discriminator that lets one type stand in for every methodology. */
  cadence_kind: 'period' | 'iteration' | 'buffer'
  /** The source methodology term verbatim ("sprint", "cycle", "PI", "quarter", "cooldown"). The dual-band label: `cadence_kind` is the canonical granularity reasoned over; `cadence_label` preserves what the team actually calls it. */
  cadence_label?: string
  /** ISO date the interval opens. A cycle is concretely dated, unlike a coarse `time_horizon` label. */
  starts_on?: ISODate
  /** ISO date the interval closes. */
  ends_on?: ISODate
  /** The cycle / iteration number (e.g. Sprint 47, PI 3). */
  sequence?: number
  /** The interval's goal or focus: what this cadence box is for. */
  goal?: string
  /** Shape Up appetite: the fixed time budget a cycle is willing to spend on a bet (e.g. "6 weeks", "2 weeks"). */
  appetite?: string
}

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------

/** What kind of lever this axis is. Names the mechanism family so a reader
 * knows what changing the value would mean operationally.
 *
 * - `feature_flag` — a runtime toggle owned by the product team.
 * - `plan_tier` — what the customer bought.
 * - `permission_level` — what this user is allowed to see.
 * - `beta_program` — enrolment in an early-access cohort.
 * - `other` — a lever that is none of these and is described in the node's
 *   description rather than forced into a category that fits badly.
 */
export type ConfigurationAxisKind =
  | 'feature_flag'
  | 'plan_tier'
  | 'permission_level'
  | 'beta_program'
  | 'other'

/** A named dimension along which the product's composition differs.
 *
 * The stored graph is the UNION of a configuration family; an axis names one
 * dimension of that family, and a projection picks one value on it. A graph
 * that declares no axis describes a product with one configuration, which is
 * what every graph written before this entity existed already meant. That is
 * the zero-migration guarantee: silence still means "true everywhere".
 *
 * ONE AXIS PER SEMANTIC LEVER, NOT PER CODE FLAG. The unit is the decision a
 * reader makes ("are we on the new navigation or the old one?"), not the
 * boolean a deploy system stores. Two flags that cannot be set independently
 * — one forcing the other on — are ONE axis with two values, and modelling
 * them as two axes would assert a four-configuration family, three members of
 * which do not exist. Link each driving flag with
 * `feature_flag_drives_configuration_axis`: the mechanism lives in
 * engineering, the lever lives here.
 *
 * VALUES ARE CLOSED. Every `present_under` and every `active_when.values`
 * entry must name a member of this list, and `validate_graph`'s
 * `configuration_drift` scope says so. An axis whose values are open cannot
 * support a projection, because nothing bounds the family being projected
 * from.
 *
 * NOT `classification_axis`. That instrument sorts SUBJECTS into cells: a
 * subject may sit in several at once, each placement carries evidence and
 * confidence, and the axis describes a landscape. This one selects WHICH
 * GRAPH YOU ARE READING: exactly one value holds at a time, placements carry
 * no evidence, and changing the value changes what exists. The shapes rhyme;
 * the questions do not.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   the product that defines it: `product_defines_configuration_axis` (inbound)
 *   the driving mechanism: `feature_flag_drives_configuration_axis` (inbound)
 *   what varies along it: `surface_varies_by_configuration_axis` (inbound)
 *
 * @example
 * const properties: ConfigurationAxisProperties = {
 *   values: ['legacy_nav', 'split_nav'],
 *   default_value: 'legacy_nav',
 *   kind: 'feature_flag',
 * }
 */
export interface ConfigurationAxisProperties {
  /**
   * The closed set of values this axis can take. Required: an axis with no
   * values selects nothing and cannot be projected along. Every `present_under`
   * and `active_when.values` entry must name one of them.
   *
   * @remarks
   * Two values is the common case and three is not unusual (a plan ladder).
   * Order is not significant: the axis is categorical, not ordinal. Where the
   * ordering does matter (an entitlement ladder in which each tier includes the
   * one below), that is a classification question, and `classification_axis`
   * with `axis_kind: 'ordinal'` is the instrument for it.
   */
  values: string[]
  /**
   * The value this axis is understood to sit at when nobody says otherwise.
   * Must be a member of `values`. NOTHING APPLIES IT AUTOMATICALLY: an
   * unqualified read returns the union, not this projection.
   *
   * @remarks
   * The union is the honest answer to an unqualified question, because it is
   * every configuration at once; silently substituting one of them would hide
   * the others from a reader who did not know to ask. What the field does carry
   * is the declaration convention for `surface_alternates_with_surface`
   * (declare the edge from the surface present under the default) and a
   * documented anchor for tools that later want to offer a starting
   * configuration.
   *
   * It is a claim about the model, not about deployment: it says which value
   * most of the graph was written against, not which configuration most
   * customers are on.
   */
  default_value?: string
  /** What kind of lever this is. Names the mechanism family. */
  kind?: ConfigurationAxisKind
}
