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
 *   contained entities: `workspace_arranges_node`, whose edge `properties`
 *     carry the spatial placement (`x`, `y`, `expanded`, `frame_id`)
 *
 * Two meanings of "workspace" travel together in shipped tools and are
 * unrelated. THIS is the CANVAS workspace: a thinking space, an entity in the
 * graph. The FILE workspace is a folder of `.upg` products, addressed by the
 * CLI and MCP surfaces (`init_workspace`, `switch_product`, `workspace.json`).
 * A third, `UPGSource.workspace_id`, is the source tool's own project id.
 * Neither is renamed: all three are entrenched, and the ambiguity is smaller
 * than the rename would be.
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
   * What the workspace is for. Drives template suggestions and surfaces in
   * workspace browsers.
   *
   * @remarks
   * `discovery` is persona, job and opportunity exploration. `planning` covers
   * roadmap and decision sessions. `retrospective` is reflection on shipped
   * work. `design` is experience or UI exploration. `research` organises study
   * data and synthesis. `strategy` is high-level direction setting. `general`
   * is the catch-all.
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
  /**
   * Retention intent. Absent means `transient`.
   *
   * @remarks
   * A workspace is a free-form thinking space and is transient by default, so
   * the spec makes both intents EXPRESSIBLE and takes no position on which
   * reaches the file. Whether to write a transient canvas at all is a tool
   * decision, and the recommended posture is not to: a scratch canvas nobody
   * named has no business in a shared, git-tracked graph, where it lands in
   * everyone's diff. Writing only `durable` workspaces is what keeps a
   * canonical graph entity comfortable with a transient-by-default object.
   */
  retention?: 'transient' | 'durable'
  /**
   * Opaque canvas furniture: the parts of a canvas with no graph referent.
   * Preserved verbatim on round-trip and never interpreted. Tool extension keys
   * are namespaced `<tool>:<key>` with a colon, and no consumer interprets a key
   * it does not own.
   *
   * @remarks
   * The cut here is UPG principle P14 applied literally. Anything that is a
   * REFERENCE TO A GRAPH NODE is an edge, which is why placed entities ride
   * `workspace_arranges_node` and not this bag: a node id held as a scalar
   * inside a blob is a foreign key in disguise, and a deleted node would leave
   * a stale reference nothing can detect. Anything that is pure UI chrome with
   * no graph referent stays here, because minting `annotation` and `frame`
   * entity types would add catalog surface that is meaningless to every
   * consumer outside the tool that drew it.
   *
   * WHY THE COLON, and why the rule is in the summary rather than buried here.
   * An underscore key is indistinguishable from an ordinary property name, so a
   * migration that targets namespaced keys cannot match it and no validator can
   * detect one that should have been namespaced. That undetectability is why
   * enforcement lives in the type and the documentation instead of in a check:
   * a check would report clean on a bag full of underscore keys, which is worse
   * than no check. Two conventions were already coexisting when this was ruled
   * (`entopo_views` in a live writer, `entopo:view_blocks` in the contract test
   * certifying preservation), which is how a cheap rule becomes a migration.
   *
   * PRESERVATION IS NOT PERMISSION TO RENDER. Preserving every byte says nothing
   * about meaning: a field-measured canvas carried `excluded: true` tombstones,
   * and a consumer that preserved them faithfully while rendering every entry
   * showed the user images they had deleted.
   */
  canvas?: WorkspaceCanvas
}

/** The opaque half of a canvas: furniture with no graph referent.
 *
 * Carried on `WorkspaceProperties.canvas`. A consumer MUST preserve this object
 * verbatim and MUST NOT act on it. That preservation is already guaranteed by
 * the canonical serialiser, which passes `properties` through as an open bag,
 * so honouring the rule costs nothing; it just needs saying.
 *
 * @example
 * const canvas: WorkspaceCanvas = {
 *   canvas_version: 1,
 *   viewport: { x: 0, y: 0, zoom: 1 },
 * }
 */
export interface WorkspaceCanvas {
  /** Schema version of this bag, versioned by the tool that writes it and independent of the spec version. */
  canvas_version: number
  /** Free-text note cards placed on the canvas. */
  annotations?: Array<{ id: string; text: string; color?: string; x: number; y: number }>
  /** Visual grouping containers. `children` holds the ids of arranged nodes inside the frame. */
  frames?: Array<{ id: string; label: string; x: number; y: number; width: number; height: number; children?: string[] }>
  /**
   * Lightweight visual associations drawn between two cards.
   *
   * @remarks
   * Called RIDGES, not edges, and the rename is the point. Inside a `.upg` file
   * the word "edge" already means a graph edge, and a ridge is emphatically not
   * one: `promoted` exists precisely to mark the moment a ridge has BECOME a
   * real edge. Two different things under one word in the file format would be
   * a genuine ambiguity, and removing it costs nothing.
   */
  ridges?: Array<{ id: string; source: string; target: string; label?: string; promoted?: boolean }>
  /** Last camera position on the canvas. */
  viewport?: { x: number; y: number; zoom: number }
  /**
   * Canvas cards that are not yet entities in the graph.
   *
   * @remarks
   * A draft stays here rather than being materialised as a `status: 'draft'`
   * node because a draft is BY DEFINITION not in the graph yet. That is what
   * committing means, and `workspace_produced_node` exists to record the moment
   * it enters. Auto-materialising would empty that edge of meaning and litter
   * graphs with abandoned drafts.
   */
  drafts?: Array<{ id: string; type: string; title: string; description?: string; x: number; y: number }>
  /** Seed provenance, when the canvas was opened from a gap prompt rather than blank. */
  gap_context?: {
    scope_label: string
    region_slug?: string
    note?: string
    gaps: Array<{ type: string; label: string; count?: number; detail?: string }>
  }
  /**
   * Tool-namespaced extension keys, written by a tool and preserved by everyone.
   *
   * The doc above has always promised an open bag; until 0.31.0 this interface
   * closed, so every doc-honouring consumer widened locally (`graph-service`
   * shipped `WorkspaceCanvas & Record<string, unknown>` as its boundary type). A
   * type that forces every conforming consumer to work around it is describing
   * the wrong thing, so the type now says what the doc always did.
   *
   * THE RULE FOR THESE KEYS (0.31.0):
   *  - Syntax is `<tool>:<key>`, with a COLON. An underscore key is indistinguishable
   *    from an ordinary property name, so it cannot be reliably matched, which is
   *    exactly what makes a future migration miss half of what it targets.
   *  - Every consumer PRESERVES unknown keys byte for byte.
   *  - No consumer INTERPRETS a key it does not own. Preservation is a storage
   *    guarantee that says nothing about meaning: a field-measured canvas carried
   *    `excluded: true` tombstones, and a consumer that preserved every byte while
   *    rendering every entry showed the user images they had deleted.
   *  - The prefix is the owner. No registry at present scale.
   *
   * The declared members above keep their exact types, so the enumeration guard
   * is unaffected: adding a known layer still breaks exhaustive call sites at
   * compile time.
   *
   * THE COLON IS IN THE TYPE, and this is the only place the syntax rule is
   * enforceable at all. No runtime check can catch a key that should have been
   * namespaced and was not, because an underscore key is indistinguishable from
   * an ordinary property by construction, and a write-time rejection would
   * contradict the preservation guarantee the bag is built on. A bare
   * `[key: string]: unknown` would have accepted every form the rule forbids, so
   * the pattern index signature is what makes the rule cost anything.
   *
   * The declared members are exempt because none of them matches the pattern,
   * which is the mechanism working rather than a hole in it: they are the keys
   * the spec owns, and the pattern governs the keys it does not.
   *
   * The cost paid for the openness is narrower than the old closure but real: a
   * misspelled namespaced key resolves to `unknown` and surfaces at first use
   * rather than at the typo. A misspelled DECLARED member (`canvas.anotations`)
   * is still a compile error, because it does not match the pattern either.
   */
  [namespacedKey: `${string}:${string}`]: unknown
}

/** Composition: a named, published view assembled from a canvas.
 *
 * The durable counterpart to `workspace`. Where a workspace is a free-form
 * thinking space with an audience of one, a composition is a stable artifact
 * with a slug people link to, a publisher, and a revision history. Its node
 * `id` IS the slug: `.upg` ids are slugs by convention, and minting a separate
 * `slug` property would give one thing two identities.
 *
 * SCOPE OF THAT RULE, stated because assuming it generalised produced a
 * `not_found` refusal in the field (the invariant working, the documentation
 * failing): id-is-slug holds for `composition` and `workspace`. It does NOT hold
 * for `product`, which carries a uuid id and a separate slug. A rule whose scope
 * is undocumented gets over-generalised by the next reader.
 *
 * THE ARRANGEMENT IS FROZEN, THE CONTENT IS NOT. `members` captures layout and
 * pointers at publish time and never resolved data. Each member's `href` is
 * still a QUERY, re-resolved against current graph data at render, which is
 * what makes a composition a live UPG surface rather than a stale screenshot.
 * A consumer must not treat `members` as cached content.
 *
 * Provenance reuses `workspace_produced_node`: which canvas a composition was
 * published from is already expressible, so nothing new is minted for it. What
 * a composition SHOWS is `composition_focuses_node`, which is what makes
 * "which published views show this persona?" answerable to a tool that cannot
 * parse the publishing tool's URLs.
 *
 * @example
 * const properties: CompositionProperties = {
 *   members: [
 *     { id: 'blk_1', href: '/view/personas?segment=smb', title: 'SMB personas', x: 0, y: 0, width: 6, height: 4 },
 *   ],
 *   rev: 3,
 *   published_at: '2026-08-17T09:00:00Z',
 *   published_by: 'sam.patel@arkheiev.com',
 * }
 */
export interface CompositionMember {
  /** Stable id of the block within this composition. */
  id: string
  /** Tool-namespaced view reference, opaque to every other tool and preserved verbatim. */
  href: string
  /** Display title captured at publish, used as a fallback while the target resolves. */
  title: string
  /** Horizontal position of the block in the frozen arrangement. */
  x: number
  /** Vertical position of the block in the frozen arrangement. */
  y: number
  /** Width of the block in the frozen arrangement. */
  width: number
  /** Height of the block in the frozen arrangement. */
  height: number
  /** Whether the block is drawn collapsed. */
  collapsed?: boolean
}

export interface CompositionProperties {
  /**
   * The frozen member arrangement, captured at publish. Layout and pointers
   * only, never resolved content.
   */
  members: CompositionMember[]
  /**
   * Monotonic revision, bumped on each republish of the same slug.
   *
   * @remarks
   * A published revision is a fact about the composition, user-visible as a new
   * print from the same plate, so it is serialised. Worth distinguishing from a
   * store's concurrency token, which shares the name in some backends but is a
   * fact about the table rather than about the thing, and is not spec data.
   */
  rev: number
  /** ISO timestamp of the most recent publish or republish. */
  published_at: ISODateTime
  /** Publisher handle or email. Display scalar, same posture as `WorkspaceProperties.owner`. */
  published_by?: string
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
  /**
   * Relative multiplier per framework input for this run, keyed by input id.
   *
   * @remarks
   * A weight belongs to the RUN, not to any entity it scores: one weight per
   * input, shared by every scored entity, which is why it sits here and not on
   * the `framework_exercise_includes_node` edge alongside the per-entity result.
   *
   * Named `input_weights` rather than a bare `weight` deliberately, and the
   * collision is live rather than hypothetical: `getPropertyDefaultScale` keys
   * on property NAME alone and ignores entity type, and `PROPERTY_SCALE_MAP`
   * already maps `weight` to the `importance_5` ordinal. A bare `weight` here
   * would silently resolve to a 1-5 assessment scale, which is the wrong type,
   * range and meaning for a multiplier. The plural also matches the spec's own
   * vocabulary: a framework declares *inputs*, not dimensions.
   *
   * @example
   * const properties: FrameworkExerciseProperties = {
   *   framework_id: 'rice-scoring',
   *   input_weights: { reach: 1, impact: 2, confidence: 1, effort: 1.5 },
   * }
   */
  input_weights?: Record<string, number>
}
