/**
 * UPG v0.2 Workspace Properties.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODateTime } from '../primitives.js'
import type { UPGEntityType } from '../../catalog/entity-catalog.js'
import type { StatusCategory } from '../../grammar/lifecycles.js'

/** Workspace: a spatial thinking space for arranging entities.
 *
 * A transient or durable canvas where a team arranges, relates, and debates
 * entities before committing them to the wider product graph. Distinct from
 * `feature_area` (which structures shipped product) and `team` (the people
 * unit): a workspace is the *space* a team thinks in.
 *
 * Per UPG principle P14, structural relationships are edges:
 *   parent anchor: `product_thinks_in_workspace` (or its `organization_` /
 *     `product_area_` siblings, one per altitude)
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
  /**
   * Archived. Archived workspaces remain queryable but hidden from default views.
   * @deprecated since 0.32.0. Use `UPGBaseNode.archived`, which generalises this
   * pair to every entity type. Field data showed the archived/status split is not
   * a workspace peculiarity: a tracker held 559 archived-completed items beside 18
   * live-completed ones, and one status field has nowhere to put the difference.
   * `UPG_PROPERTY_MIGRATIONS['0.32.0']` lifts this value to the top level.
   */
  archived?: boolean
  /**
   * ISO timestamp archived. Pairs with `archived === true`.
   * @deprecated since 0.32.0. Use `UPGBaseNode.archived_at`. Lifted by
   * `UPG_PROPERTY_MIGRATIONS['0.32.0']`.
   */
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
/** One predicate over a type-specific property.
 *
 * @example
 * const p: UPGViewPredicate = { property: 'priority', in: ['urgent', 'high'] }
 */
export interface UPGViewPredicate {
  /** Property name, resolved against the node's `properties` bag. */
  property: string
  /** Admitted values. A node matches when its value is one of these. */
  in?: string[]
  /** Match on presence rather than value. `true` admits nodes that carry the
   *  property at all; `false` admits those that do not. */
  present?: boolean
}

/** A declarative, portable selection over the graph.
 *
 * Selection ONLY. What a surface should look like once the nodes are chosen is
 * {@link UPGViewPresentation}, and a consumer may ignore all of it.
 *
 * @remarks
 * WHY THIS IS IN THE SPEC AND NOT IN A NAMESPACED BAG KEY. The 0.31.0 rule says
 * no consumer interprets a key it does not own. A driving query living in
 * `sometool:gallery_query` would therefore be readable by exactly one tool, so
 * the layer it drives could be rendered by exactly one tool. A query-driven
 * layer whose query nothing else can read is a feature, not a format — and
 * "views are queries" would stop being a property of the standard and become a
 * property of one application.
 *
 * P14 AND THE ONE PLACE THIS DESIGN TOUCHES THE LINE. A predicate over types,
 * phases, buckets and tag strings holds no node references, so it is a
 * predicate rather than a foreign key. `from_focus` keeps it that way for
 * relative selections: the anchor set is the `composition_focuses_node` EDGE,
 * and the query only says how to walk from it — which is how "everything under
 * this epic" is expressed without a node id in a scalar. `classified_as` is the
 * exception and is admitted knowingly: it holds `classification_value` ids,
 * because the alternative is matching a taxonomy by title, which is the thing
 * P14 exists to stop. Those ids are resolvable references that
 * `repair_dangling_edges` does not cover, and a consumer meeting one that no
 * longer resolves should drop the clause rather than the view.
 *
 * @example
 * const q: UPGViewQuery = {
 *   types: ['task', 'bug'],
 *   status_category: ['unstarted', 'started'],
 *   properties: [{ property: 'priority', in: ['urgent', 'high'] }],
 * }
 */
export interface UPGViewQuery {
  /** Entity types admitted. Omitted means every type. */
  types?: UPGEntityType[]
  /** Canonical phase ids admitted (e.g. `['todo', 'in_progress']`). */
  status?: string[]
  /** Six-bucket categories admitted. The portable form when the phase ids
   *  differ per type but the reading is the same. */
  status_category?: StatusCategory[]
  /** Freeform tags. `match` governs all-of versus any-of. */
  tags?: string[]
  /** Ids of `classification_value` nodes admitted: the grouped-label clause. */
  classified_as?: string[]
  /** Predicates over type-specific properties. */
  properties?: UPGViewPredicate[]
  /** Whether archived nodes are admitted. Absent means false, which is the
   *  documented default read for `UPGBaseNode.archived`. */
  include_archived?: boolean
  /** How the clauses combine. Absent means `all`. */
  match?: 'all' | 'any'
  /** Walk from the composition's focused nodes, for a selection that is
   *  relative rather than absolute. The anchor is the
   *  `composition_focuses_node` edge set, never an id held here. */
  from_focus?: {
    /** Canonical edge types to traverse. */
    edge_types: string[]
    /** Which way to walk them. */
    direction: 'out' | 'in' | 'both'
    /** Hops. Absent means 1. */
    depth?: number
  }
}

/** Advisory rendering intent. A consumer MAY ignore every field here.
 *
 * @remarks
 * Kept separate from {@link UPGViewQuery} so that "views are queries" stays
 * literally true. A selection is a fact about the graph and travels; a lane
 * arrangement is a preference of the tool that drew it and does not. Splitting
 * them means a consumer that cannot honour the presentation still renders the
 * right nodes, which is the failure mode worth designing for.
 *
 * @example
 * const p: UPGViewPresentation = { group_by: 'status_category', layout: 'board' }
 */
export interface UPGViewPresentation {
  /** Property name, base field, or `status_category`, to group lanes by. */
  group_by?: string
  /** Sort keys in precedence order. */
  sort?: Array<{ key: string; direction: 'asc' | 'desc' }>
  /** Requested layout family. Advisory. */
  layout?: 'board' | 'table' | 'list' | 'cards' | 'timeline' | 'gallery'
}

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
  /**
   * True when this member arrived by running the composition's `member_query`
   * rather than by a person placing it.
   *
   * @remarks
   * MEMBERSHIP IS DERIVED, POSITION IS AUTHORED, and both are serialised because
   * both are real. A field pilot measured the shape: blocks were auto-admitted
   * by a query, then dragged into an order somebody chose.
   *
   * DERIVED MEMBERS ARE NOT AUTHORED CONTENT. Any signature meant to answer "did
   * a person change this" must exclude them. The measured failure is precise: a
   * content baseline captured at creation, before the query first ran, moved the
   * moment the query admitted its first block — so a viewer who only glanced at
   * a gallery would have written to it.
   */
  derived?: boolean
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
  /**
   * When present, membership is DERIVED: members are produced by running this
   * query rather than authored by placement.
   *
   * @remarks
   * This is the portable statement of what the composition shows.
   * `CompositionMember.href` remains the publishing tool's own resolved route
   * and stays opaque to everyone else; a member may carry both, and then the
   * href is a fast path while the query is the meaning. A consumer that cannot
   * parse the href can still render the layer, which is the whole reason the
   * declaration is here rather than in a tool-namespaced bag key.
   *
   * A composition with no `member_query` is authored, which is what every
   * composition written before 0.32.0 is.
   */
  member_query?: UPGViewQuery
  /**
   * Advisory rendering intent for the composition as a whole. A consumer may
   * ignore it entirely and still be conformant.
   */
  presentation?: UPGViewPresentation
}

/** Capture: a dated, hashed rendition of something already in the graph.
 *
 * A screenshot of a surface, a PDF of a report, an export of a canvas. The
 * subject is a graph node and stays one; a capture says "here is what that
 * looked like, at this moment, and here is how to tell whether it still does."
 * Lifecycle-free (a capture is a fact, not a workflow) and containment-free
 * (it anchors to what it RENDERS via `capture_renders_node`, the same posture
 * as `composition` and `framework_exercise`).
 *
 * @remarks
 * WHY IT IS NOT CALLED `artifact`. The word is already spent twice over:
 * `workflow_artifact` is an output produced BY a workflow run, and shipped
 * tools commonly have an "artifacts" store of generated documents holding
 * inline content. A third meaning of one word is how a vocabulary stops being
 * one, so this type is named for what it does.
 *
 * WHY NOT EXTEND `document`. Three ways apart, which is a split by the spec's
 * own dual-shape gate: `document` carries the PUBLISHING lifecycle and a
 * capture has no lifecycle; `document` has neither a content hash nor a capture
 * moment; and `document_describes_*` is a family of typed edges about subject
 * matter, not a rendition relation.
 *
 * WHY NOT EXTEND `workflow_artifact`. Its only structural parent is
 * `workflow_run`, so every captured file would need a workflow run invented to
 * hold it — dead schema created to satisfy a hierarchy.
 *
 * WHY THE HASH IS THE SIGNAL. Regenerating a capture must change what viewers
 * see without moving anything they arranged. Modification time lies on a
 * byte-identical re-run and size misses a same-size repaint, so a content hash
 * is the only value that means THIS RENDITION IS DIFFERENT.
 *
 * WHERE THE BYTES LIVE IS A TOOL DECISION. `capture_uri` is a URI on the same
 * footing as `UPGBaseNode.external_ref`: `https://` for hosted, `file://` or a
 * relative path for local. The spec takes no position on a sibling directory
 * beside the `.upg` file. The earlier no-sidecar ruling governed the `.upg`
 * FILE BODY and reading it wider than it was made would be inventing a decision
 * nobody took.
 *
 * @example
 * const properties: CaptureProperties = {
 *   capture_uri: './captures/checkout-panel.png',
 *   content_hash: '9f2b7c1a4e6d8035bb1c2f9a7e4d6058c3b1a9f27e4d60583c1b9a2f7e4d6058',
 *   captured_at: '2026-08-20T21:14:00Z',
 *   media_type: 'image/png',
 *   fidelity: 'exact',
 *   capture_status: 'captured',
 * }
 */
export interface CaptureProperties {
  /** Where the bytes are. `https://` for hosted, `file://` or a relative path
   *  for local. Required: a capture with no location renders nothing. */
  capture_uri: string
  /** Content hash of the bytes. The regeneration signal; see the type's
   *  `@remarks` for why mtime and size are not. */
  content_hash?: string
  /** Hash algorithm. Absent means `sha256`. */
  hash_algorithm?: 'sha256' | 'sha1' | 'md5'
  /** ISO timestamp the capture was taken. */
  captured_at?: ISODateTime
  /** IANA media type of the bytes. @example "image/png" */
  media_type?: string
  /** How faithfully this rendition represents its subject. `approximate` covers
   *  a capture taken in a stand-in state or at the wrong viewport. */
  fidelity?: 'exact' | 'approximate' | 'not_applicable'
  /**
   * Whether the capture succeeded.
   *
   * @remarks
   * A `blocked` capture is a real record rather than a missing one: it says the
   * subject exists and could not be rendered, which is what stops the next run
   * rediscovering the same obstacle. `skipped` is the deliberate exclusion.
   */
  capture_status?: 'captured' | 'blocked' | 'skipped'
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
