/**
 * UPG v0.2 Workspace Properties.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODateTime } from '../primitives.js'

/** Workspace: a spatial thinking space for arranging entities.
 *
 * A transient or durable canvas where a team arranges, relates, and debates
 * entities before committing them to the wider product graph. Distinct from
 * `feature_area` (which structures shipped product) and `team` (the people
 * unit): a workspace is the *space* a team thinks in.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent product: `product_contains_workspace`
 *   members: `team_works_in_workspace` / `persona_collaborates_in_workspace`
 *     (the `member_count` and `owner` properties are display-time aggregates;
 *     canonical membership is the edge set)
 *   contained entities: spatial placement is recorded on edge metadata
 *
 * @example
 * const properties: WorkspaceProperties = {
 *   visibility: 'shared',
 *   purpose: 'Arrange personas, jobs, and opportunities for the Q2 discovery sprint.',
 *   workspace_purpose: 'discovery',
 *   owner: 'sam.patel@arkheiev.com',
 *   member_count: 5,
 *   archived: false,
 *   archived_at: undefined,
 *   icon: 'compass',
 * }
 */
export interface WorkspaceProperties {
  /** Who can see this workspace */
  visibility?: 'private' | 'shared' | 'public'
  /** Free-text description. Pairs with the closed-enum `workspace_purpose`. */
  purpose?: string
  /**
   * Closed-enum classifier. Drives template suggestions and surfaces in workspace browsers.
   *   `discovery` = persona/job/opportunity exploration.
   *   `planning` = roadmap and decision sessions.
   *   `retrospective` = reflection on shipped work.
   *   `design` = experience or UI exploration.
   *   `research` = organising study data and synthesis.
   *   `strategy` = high-level direction setting.
   *   `general` = catch-all.
   */
  workspace_purpose?: 'discovery' | 'planning' | 'retrospective' | 'design' | 'research' | 'strategy' | 'general'
  /** Workspace owner (handle or email). Display label; canonical owner is `team_owns_workspace` or `persona_owns_workspace`. */
  owner?: string
  /** Snapshot count. `team_works_in_workspace` edges are the source of truth. */
  member_count?: number
  /** Archived. Archived workspaces remain queryable but hidden from default views. */
  archived?: boolean
  /** ISO timestamp archived. Pairs with `archived === true`. */
  archived_at?: ISODateTime
  /** Display icon (emoji or icon name) */
  icon?: string
}

/** Framework exercise: one run of a framework over a set of entities.
 *
 * A framework_exercise is a structured workspace — applying a single framework
 * (MoSCoW, RICE, Kano, …) to a chosen set of entities. It is the persistent
 * home for that run's answers: each entity it scores is linked by a
 * `framework_exercise_includes_node` edge whose `properties` carry the result
 * for that entity (a MoSCoW bucket, a RICE score, a canvas slot, a funnel
 * stage). Because the value lives on the edge, the same entity can appear in
 * many exercises with different results, and any entity type can be scored —
 * not just `feature`. See ADR 2026-06-02-framework-exercises.
 *
 * `title` (the exercise's human label) and `status` (draft / active /
 * archived) are base-node fields; the fields below are its own intrinsic data.
 *
 * @example
 * const properties: FrameworkExerciseProperties = {
 *   framework_id: 'moscow',
 * }
 */
export interface FrameworkExerciseProperties {
  /** Which framework this exercise runs: a framework id (e.g. 'moscow',
   *  'rice-scoring', 'kano-model'). Resolves against the framework catalog. */
  framework_id: string
  /**
   * Optional frozen copy of the framework's input spec at apply time, so a
   * historical exercise still renders correctly if the framework definition
   * later evolves (inputs added, removed, or rescaled).
   */
  inputs_snapshot?: Record<string, unknown>
}
