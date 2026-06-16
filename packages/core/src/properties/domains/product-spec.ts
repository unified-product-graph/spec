/**
 * UPG Property Schemas: Product Specification Domain.
 * Feature, FeatureArea, Epic, UserStory, AcceptanceCriterion, Release,
 * Task, Bug, Roadmap, RoadmapItem, Theme, Changelog.
 * Also: OutcomeProperties, ObjectiveProperties, KeyResultProperties.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { HealthStatus, ISODate, Priority, UPGAssessment } from '../primitives.js'

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
  /**
   * Current lifecycle phase, mirroring the `outcome` lifecycle in
   * `grammar/lifecycles.ts` ( Option B): `identified` -> `measuring` ->
   * `achieved` | `abandoned`.
   */
  outcome_status?: 'identified' | 'measuring' | 'achieved' | 'abandoned'
}

/** A high-level strategic goal. The O in OKR.
 *
 * @example
 * const properties: ObjectiveProperties = {
 *   timeframe: '12-18 months',
 *   objective_status: 'active',
 *   progress: 42,
 * }
 */
export interface ObjectiveProperties {
  /** Planning timeframe (e.g. "Q1 2026", "H1 2026") */
  timeframe?: string
  /** Current status */
  objective_status?: 'active' | 'achieved' | 'deferred'
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
 * by `area_status`.
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
 *   area_status: 'active',
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
  /** Status in the product structure */
  area_status?: 'active' | 'planned' | 'deprecated'
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
}

/** A collection of related user stories that delivers a feature or capability.
 *
 * @example
 * const properties: EpicProperties = {
 *   estimate: '3 person-weeks',
 *   priority: 'high',
 *   owner: 'sam.patel@arkheiev.com',
 * }
 */
export interface EpicProperties {
  /** Rough size estimate (e.g. "3 sprints", "L", "13 points") */
  estimate?: string
  /** Task-level priority */
  priority?: Priority
  /** Responsible person or team. Promote to a `node_owned_by_person` edge if ownership must be queryable. */
  owner?: string
  /** ISO date work begins */
  start_date?: ISODate
  /** ISO date work completes */
  target_date?: ISODate
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
  /** Current pass/fail */
  pass_status?: 'untested' | 'pass' | 'fail'
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
  /** Free-form classification tags. Applied uniformly across work item types. */
  labels?: string[]
  /**
   * Story-point or sizing estimate. String to support fibonacci, t-shirt sizes,
   * or custom scales (e.g. "5", "M", "3 pts"). Absorbed from `StoryTaskProperties`
   * when `story_task` collapsed into `task` (v0.4.0).
   */
  estimate?: string
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
  /** Free-form classification tags. Applied uniformly across work item types. */
  labels?: string[]
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
 *   item_status: 'planned',
 * }
 */
export interface RoadmapItemProperties {
  /** Planning quarter (e.g. "Q2 2026"). Pair with `start_date`/`target_date` for precise scheduling. */
  quarter?: string
  /** Importance against other items */
  priority?: Priority
  /** Status. `deferred` = explicitly pushed to a later period. */
  item_status?: 'planned' | 'in_progress' | 'shipped' | 'deferred'
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
