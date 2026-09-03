/**
 * UPG v0.2 Workspace Properties.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, ISODateTime } from '../primitives.js'
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
export interface WorkspaceProperties extends UPGQueryDrivenLayer {
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
   * are namespaced `<tool>:<key>` with a colon (the rule since 0.31.0), and no
   * consumer interprets a key it does not own.
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
   * THE RULE FOR THESE KEYS (0.31.0; the one-release read tolerance for the old
   * underscore form was retired at 0.32.0, which is a different fact about a
   * different release and is why the two dates are both correct):
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

/** The axis a clause selects on. */
export type UPGViewDimension =
  | 'type' | 'status' | 'status_category' | 'tag' | 'classification'
  | 'property' | 'date' | 'edge'

/** A relative or absolute time window, DECLARED rather than resolved.
 *
 * @remarks
 * A window is evaluated at READ time in the reader's session, never frozen at
 * save. A saved view that says "this quarter" must mean this quarter to whoever
 * opens it, which an absolute range captured at save cannot do.
 *
 * THE CALENDAR AND THE CADENCE ARE NAMED SEPARATELY AND DELIBERATELY. `calendar`
 * is the wall clock. A team's own cadence is NOT a window at all: it resolves
 * through the ACTIVE-CYCLE DESIGNATION, which is an edge clause with
 * `target_status: ['active']`, not a date bracket. Field data settles why: of 19
 * cycles in a real tracker every one is dateless and exactly one carries status
 * `active`, so a date-bracketed reading of "current cycle" resolves to nothing on
 * the only graph that has real cycle data. Conflating them makes the filter lie.
 *
 * @example
 * const w: UPGTimeWindow = { kind: 'calendar', anchor: 'current', unit: 'quarter' }
 */
export type UPGTimeWindow =
  | {
      kind: 'calendar'
      anchor: 'current' | 'previous' | 'next'
      unit: 'week' | 'month' | 'quarter' | 'year'
    }
  | {
      kind: 'rolling'
      anchor: 'last_n' | 'next_n'
      unit: 'day' | 'week' | 'month' | 'quarter'
      count: number
    }
  | { kind: 'absolute'; from?: ISODate; to?: ISODate }

/** A condition on a node's edges: the gap 0.32.0 opened by shipping assignment
 *  and cadence AS EDGES alongside a query that could not mention one.
 *
 * @remarks
 * `UPGViewQuery.from_focus` does not cover this. It walks from the composition's
 * focused set, so it can say "everything under this epic" and cannot say
 * "assigned to anyone" or "in the active cycle".
 *
 * TWO AXES NAME A MOVING TARGET WITHOUT HOLDING AN ID, and they are deliberately
 * parallel. On the CADENCE axis it is `target_status`: the active cycle is the
 * one whose status is `active` (the invariant stated on
 * `PlanningCycleProperties`), so an edge clause over
 * `planning_cycle_schedules_work_item` with `target_status: ['active']` selects
 * the current cycle portably. On the PERSON axis it is `target_designation`:
 * `'viewer'` selects whoever is reading, resolved in the reader's session.
 *
 * `target_ids` is the exception and is admitted knowingly, on the same terms as
 * `UPGViewQuery.classified_as`.
 *
 * @example
 * const cycle: UPGViewEdgeClause = {
 *   edge_type: 'planning_cycle_schedules_work_item',
 *   direction: 'in',
 *   target_status: ['active'],
 * }
 *
 * @example
 * const mine: UPGViewEdgeClause = {
 *   edge_type: 'node_assigned_to_person',
 *   direction: 'out',
 *   target_designation: 'viewer',
 * }
 */
export interface UPGViewEdgeClause {
  /** Canonical edge type. */
  edge_type: string
  /** Which way to walk it from the candidate node. */
  direction: 'out' | 'in' | 'both'
  /** Admitted endpoint ids. Omitted means any edge of this type satisfies it. */
  target_ids?: string[]
  /** Admitted endpoint phase ids. The designation form on the cadence axis. */
  target_status?: string[]
  /**
   * Selects the endpoint by ROLE rather than by identity. `'viewer'` is whoever
   * is reading the view, resolved in the reader's session at READ time.
   *
   * @remarks
   * WHY THIS IS NOT AN ID, and it is the whole point of the field. A saved view
   * that means "assigned to me" cannot store an id, because the id it stores is
   * one particular person and the view is then permanently about a colleague. A
   * shipped surface reached for the sentinel `'@me'` inside `target_ids`, which
   * round-trips and whose MEANING does not travel: a consumer that has not
   * agreed to that sentinel reads it as a node id and resolves nothing. A
   * sentinel in an id field is a private protocol wearing a public shape.
   *
   * THE PARALLEL IS DELIBERATE. This is the person axis' answer to the same
   * question `target_status: ['active']` answers on the cadence axis: name the
   * moving target by what it IS to the reader, not by which row it happens to be
   * today. Both resolve at read time, both are portable, and neither holds a
   * foreign key in a scalar.
   *
   * DESIGNATION, NOT SERIALISATION. A tool may serialise this however it likes
   * at its own boundary, `'@me'` included; the spec stores the designation. A
   * closed union rather than a free string, because an open one is how the
   * sentinel arose in the first place.
   */
  target_designation?: 'viewer'
}

/** One clause of a selection: the faithful form.
 *
 * It can express negation, declared time windows and edge conditions, none of
 * which the named fields on {@link UPGViewQuery} can hold.
 *
 * @remarks
 * A named-field shape cannot carry per-clause negation without a `not_*` twin
 * for every field, which is combinatorial and grows with every dimension added,
 * and which still could not express "not (A and B)" as distinct from "(not A)
 * and (not B)". A uniform clause list carries it with one flag.
 *
 * A DISCRIMINATED UNION ON `dimension` SINCE 0.34.0, and the reason is that the
 * two tiers disagreed about types. `values` was `string[]` while the shorthand
 * `UPGViewQuery.types` is `UPGEntityType[]`, so the FAITHFUL tier admitted a
 * value the SHORTHAND tier could not describe, and a round-trip through the
 * shorthand could silently narrow what the clause list said. The shipped example
 * `{ dimension: 'type', values: ['task', 'bug'] }` puts both halves on one line.
 * The field evidence is a cast at exactly that boundary in the first consumer,
 * carrying the comment "the clause list is the authority" — a cast is the tell
 * that the author knew the tiers disagreed and had to assert past it.
 *
 * THIS IS A COMPILE-TIME BREAK AND CALLING IT ADDITIVE WOULD BE DISHONEST. The
 * WIRE FORMAT does not change at all: the JSON is identical, so there is no
 * migration, no fixture and no canonical-format entry. What changes is that a
 * TypeScript consumer writing a plain `string[]` on a `type` clause stops
 * compiling. Two measured facts make that acceptable: the field shipped ONE
 * release ago, and the only known consumer already casts at this exact boundary,
 * so the break lands where someone has already written down why the tiers
 * disagree. A stated break with one known site is better than a silent narrowing
 * with none, which is what shipping nothing preserves.
 *
 * THE ROUND-TRIP NARROWING RULE (normative, and it holds regardless of the
 * union, because a union constrains AUTHORS and not JSON arriving from a file).
 * The clause list is AUTHORITATIVE. The named shorthand fields on
 * {@link UPGViewQuery} are a positive-only PROJECTION of it. A consumer that
 * rewrites clauses into shorthand and back MUST NOT narrow the admitted set, and
 * MUST REFUSE rather than narrow when it cannot represent a clause. Silently
 * dropping what it cannot express is the one behaviour this rule forbids.
 *
 * @example
 * const c: UPGViewClause = { dimension: 'tag', values: ['spike'], negate: true }
 *
 * @example
 * const t: UPGViewClause = { dimension: 'type', values: ['task', 'bug'] }
 */
interface UPGViewClauseBase {
  /** Property name when `dimension` is `property`; the date field when `date`. */
  field?: string
  /** Present exactly when `dimension` is `date`. */
  window?: UPGTimeWindow
  /** Present exactly when `dimension` is `edge`. */
  edge?: UPGViewEdgeClause
  /** Negates this clause and only this clause. */
  negate?: boolean
}

/** A clause on the `type` axis. `values` are entity types, not free strings. */
export interface UPGViewTypeClause extends UPGViewClauseBase {
  dimension: 'type'
  /** Admitted entity types. */
  values?: UPGEntityType[]
}

/** A clause on any axis other than `type`, whose admitted values are strings. */
export interface UPGViewGenericClause extends UPGViewClauseBase {
  dimension: Exclude<UPGViewDimension, 'type'>
  /** Admitted values. */
  values?: string[]
}

export type UPGViewClause = UPGViewTypeClause | UPGViewGenericClause

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
    /**
     * Hops. Absent means 1. `'unbounded'` walks the relation transitively until
     * it stops producing new nodes.
     *
     * @remarks
     * WHY A NAMED ARM RATHER THAN A LARGE NUMBER. A relative selection over a
     * tree ("everything under this epic") is transitive by nature and has no
     * correct finite depth: the right answer is a property of the data, not of
     * the query. A surface that wants transitivity and has only a number picks a
     * big one, and a shipped one picked 64. That is a sentinel, it is
     * indistinguishable from a caller who genuinely meant 64, and it silently
     * truncates the first graph deeper than the guess.
     *
     * A consumer that cannot walk transitively should refuse the clause rather
     * than substitute a depth of its own choosing, which would quietly return a
     * different answer to the question asked.
     */
    depth?: number | 'unbounded'
  }
  /**
   * The faithful representation of the selection: every clause, including the
   * negations, declared windows and edge conditions the named fields above
   * cannot hold.
   *
   * @remarks
   * PRECEDENCE. A reader that finds `clauses` uses it and IGNORES the named
   * fields. A reader that finds only named fields lifts them into clauses. A
   * writer emitting both keeps the named fields positive-only, because they have
   * nowhere to put a negation.
   *
   * THE NAMED FIELDS ARE NOT DEPRECATED. They are the readable form of the common
   * case and most selections never need a clause. This is one canonical form plus
   * a positive-only shorthand with a stated precedence rule, which is the shape a
   * field application arrived at independently for the same reason.
   *
   * A `date` clause over `created_at` or `updated_at` reads store metadata, which
   * is declared on `UPGBaseNode` and tagged `@volatile`. Such a window is
   * portable but the values it reads are maintained by the store rather than
   * authored.
   *
   * @example
   * [
   *   { dimension: 'type', values: ['task', 'bug'] },
   *   { dimension: 'tag', values: ['spike'], negate: true },
   *   { dimension: 'edge', edge: { edge_type: 'node_assigned_to_person', direction: 'out' } },
   * ]
   */
  clauses?: UPGViewClause[]
}

/** One grouping axis: a value partition, or an edge dimension.
 *
 * The string form is a property name, base field, or `status_category`,
 * partitioning members on a value. The object form lanes members by an EDGE:
 * each lane is a far-end neighbour of the named edge type ("board laned by
 * assignee" is `{ dimension: 'edge', edge_type: 'node_assigned_to_person' }`).
 * Lane identity is the neighbour node's id and its label is that node's title.
 *
 * @remarks
 * The object form mirrors the edge grammar the QUERY side already speaks
 * (`UPGViewClause`'s `dimension: 'edge'`) rather than minting a second one.
 * `direction` is which way the edge is walked FROM THE MEMBER: `'out'` (absent
 * means `'out'`) lanes a member by the targets of its outgoing edges, `'in'`
 * by the sources of its incoming ones. Direction is explicit in the object
 * form from day one, never guessed, which is the lesson `nest_by`'s bare-name
 * orientation rule taught (F-7). The failure case is stated rather than left
 * to the renderer: a member with NO such edge lands in a `none` lane, never
 * dropped, for the same reason `orphan_disposition` defaults to `root`.
 */
export type UPGViewAxis =
  | string
  | {
      dimension: 'edge'
      /** Canonical edge type whose far-end neighbour identifies the lane. */
      edge_type: string
      /** Which way the edge is walked from the member. Absent means `'out'`. */
      direction?: 'out' | 'in'
    }

/** One `nest_by` entry: a bare edge-type name, or the explicit-orientation form.
 *
 * @remarks
 * A bare name binds in catalog-declared orientation, source = parent (the
 * normative rule, F-7). The object form exists for the intent a bare name
 * cannot state: nesting children under the edge's TARGET end. `parent` names
 * which declared endpoint of the edge is the tree parent; a bare string is
 * exactly `{ parent: 'source' }`.
 */
export type UPGViewNestEntry = string | { edge_type: string; parent: 'source' | 'target' }

/** Where a tree roots: the product node, every member of a type, or the focus set.
 *
 * @remarks
 * Root choice is PRESENTATION, not scope (ruled 2026-09-01, F-8): it never
 * changes the selected set, only which already-selected members are drawn as
 * the tree's tops, and `orphan_disposition`'s absent-means-`root` default is
 * what keeps it safely ignorable. `'focus'` roots at the composition's
 * `composition_focuses_node` edge set, the same portable anchor `from_focus`
 * uses. Absent means `'product'`, which states the fallback consumers already
 * applied. A portable root is also what makes an authored
 * `orphan_disposition: 'hide'` safe to honour: measured on the registry, 8 of
 * 57 saved trees collapsed to a single node on bare read-back precisely
 * because they hid orphans while their non-product root went unstated.
 */
export type UPGViewTreeRoot =
  | { kind: 'product' }
  | { kind: 'type'; type: string }
  | { kind: 'focus' }

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
  /** The lane (column) axis. A property/base-field/`status_category` string,
   *  or an edge dimension (see {@link UPGViewAxis}). */
  group_by?: UPGViewAxis
  /**
   * The row axis, making the board a two-axis grid (`rows_by` × `group_by`).
   * Absent means a one-axis board, which is exactly what every pre-0.37.0
   * view already meant.
   *
   * @remarks
   * A named second slot rather than an axes array, deliberately: a grid is
   * two-dimensional, the generality of an array is unearned, and an array
   * would put the first axis in two homes beside `group_by`, which is the
   * shadow-pair shape the property-fit cleanup exists to kill. Dropping this
   * field degrades `priority × status` into a flat status board: same nodes,
   * but the dimension the author was REASONING in is gone, which is why the
   * field is portable rather than app-local.
   */
  rows_by?: UPGViewAxis
  /** Sort keys in precedence order. */
  sort?: Array<{ key: string; direction: 'asc' | 'desc' }>
  /** Requested layout family. Advisory. */
  layout?: 'board' | 'table' | 'list' | 'cards' | 'timeline' | 'gallery' | 'tree'
  /**
   * Lane keys in display order, leftmost first. Lane keys are the `group_by`
   * values (node ids when the axis is an edge dimension).
   *
   * @remarks
   * The presentation split's own charter names this case: a lane arrangement
   * is a preference of the tool that drew it. Same class as `sort`. The
   * failure case is stated: lanes not listed here follow the listed ones in
   * natural order, so a new value never vanishes for being unlisted.
   */
  lane_order?: string[]
  /**
   * Lane keys drawn collapsed. Advisory; a consumer that ignores this renders
   * every lane expanded, which is the safe direction (it shows more, never
   * hides).
   *
   * @remarks
   * Not ephemeral-UI territory: `workspace_arranges_node`'s `expanded` already
   * blesses persisted collapse state as presentation that survives a reload,
   * unlike selection. This is the same cut at lane level.
   */
  collapsed_lanes?: string[]
  /** Row keys drawn collapsed, when `rows_by` is set. Same contract as
   *  `collapsed_lanes`, on the row axis. */
  collapsed_rows?: string[]
  /**
   * Where the tree roots, when `layout` is `'tree'`. Absent means
   * `{ kind: 'product' }`. See {@link UPGViewTreeRoot}.
   */
  root?: UPGViewTreeRoot
  /**
   * Edge types to nest by, outermost first, when `layout` is `'tree'`. Advisory,
   * like everything else here.
   *
   * @remarks
   * `group_by` partitions a flat set on a value and cannot express nesting,
   * because a tree's levels are EDGES rather than property values. Naming the
   * edge types keeps the nesting portable: a consumer that does not know a
   * layout family can still read which relation the author meant to nest on.
   *
   * A consumer may ignore this entirely, render flat, and remain conformant.
   *
   * ORIENTATION IS NORMATIVE (ruled 2026-09-01, F-7): a bare name binds in its
   * catalog-declared orientation — the edge's `source_type` is the PARENT and
   * its `target_type` is the CHILD. That is the convention every hierarchy edge
   * in the catalog already follows (`user_journey_contains_journey_step`:
   * source = journey = parent), and it is what makes a bare name deterministic:
   * two conformant consumers reading the same `nest_by` must build the same
   * tree. Guessing the orientation, or walking an edge in its converse
   * direction on a bare name, is non-conformant. Intent whose parent sits at
   * the edge's TARGET end (e.g. children under their
   * `opportunity_pursues_outcome` target) takes the explicit object form,
   * `{ edge_type, parent: 'target' }` (0.37.0); a bare string is exactly
   * `{ parent: 'source' }`. Direction is semantics, never a rendering
   * preference: the catalog legally holds distinct edge types between the same
   * endpoints in opposite directions (`outcome_reveals_opportunity` is
   * provenance, `opportunity_pursues_outcome` is intent), so no consumer may
   * rewrite one into the other to make a tree connect.
   */
  nest_by?: UPGViewNestEntry[]
  /**
   * What to do with a selected member the nest relation does not reach.
   * Absent means `'root'`.
   *
   * @remarks
   * THE ASYMMETRY THIS CLOSES. 0.33.0's `nest_by` made NESTING portable and left
   * the FAILURE of nesting unportable. A member the scope selected that the nest
   * relation cannot reach may be drawn as an additional root or silently omitted,
   * both conformant, and the spec could not say which the author meant.
   *
   * ABSENT MEANS `'root'`, deliberately, and this is the whole safety argument. A
   * consumer that ignores this field must never silently DROP a node the scope
   * admitted. Measured on a real imported tracker graph of 1,118 nodes and 3,685
   * edges: one tree selects 218 members and renders ONE card under `hide`; three
   * more go 185 to 1, and one goes 11 to 1. Under absent-means-hide a conformant
   * consumer renders a blank tree over 218 matching nodes with no way to tell the
   * author anything is missing. Under absent-means-root, "everything the scope
   * admits is visible somewhere" becomes a checkable invariant, and the majority
   * (51 of 57 registry trees prefer hiding) pays for hiding EXPLICITLY — which is
   * the right way round for a default that decides whether data disappears.
   *
   * The orphans ARE the dataset rather than an edge case, and the cause is
   * structural: tracker-imported work wires through cycle and project relations,
   * which are reference-axis edges, never nesting, so the containment edges these
   * trees traverse do not reach it.
   *
   * WHY THIS IS SPEC AND NOT APPLICATION CHASSIS, which the filing author first
   * concluded and measurement overturned. Running the two dispositions changes
   * WHICH NODES APPEAR, not where pixels go. Presentation is advisory precisely
   * because a consumer may ignore it and stay conformant, and a field that
   * decides membership visibility cannot be ignored safely. Selection-class facts
   * belong in the spec; that is the line, and the measurement is what located it.
   *
   * PRESENTATION STAYS ADVISORY OVERALL. This field does not break that: a
   * consumer may ignore it and remain conformant, because the default it then
   * applies is the safe one. That property is exactly what the absent-means-root
   * cut buys.
   */
  orphan_disposition?: 'root' | 'hide'
}

/** A layer whose membership is produced by a query rather than by placement.
 *
 * Extended by both `CompositionProperties` and `WorkspaceProperties` (0.33.0).
 *
 * @remarks
 * WHY BOTH HALVES CARRY IT. `composition` is the durable published print and
 * `workspace` is the transient canvas it is published from. A layer is
 * query-driven while it is being worked on, not only after it is published, so
 * declaring the query only on the published half makes the fact something
 * invented at publish time rather than something recorded.
 *
 * WHY ONE INTERFACE RATHER THAN TWO DECLARATIONS. The alternative is two copies
 * of the same JSDoc that must stay identical, which is how a shipped type summary
 * came to cite an edge that does not exist. Note that the lift is not free at the
 * runtime layer: `UPG_PROPERTY_SCHEMA` is a flat per-type map, so `workspace`
 * gets its own entries there regardless. What is shared is the definition.
 */
export interface UPGQueryDrivenLayer {
  /**
   * When present, membership is DERIVED: members are produced by running this
   * query rather than authored by placement. The clause list is authoritative and
   * the named fields are a positive-only projection of it; since 0.34.0 a clause
   * is a discriminated union on `dimension`, so the `type` axis carries entity
   * types rather than free strings.
   *
   * @remarks
   * This is the portable statement of what the layer shows. On a composition,
   * `CompositionMember.href` remains the publishing tool's own resolved route
   * and stays opaque to everyone else; a member may carry both, and then the
   * href is a fast path while the query is the meaning. A consumer that cannot
   * parse the href can still render the layer, which is the whole reason the
   * declaration is here rather than in a tool-namespaced bag key.
   *
   * A layer with no `member_query` is authored, which is what every composition
   * written before 0.32.0 is.
   *
   * DECLARED ON BOTH HALVES OF THE PAIR since 0.33.0. A layer is query-driven
   * while it is being worked on, not only once it is published, so declaring the
   * query only on the durable composition would make it a fact invented at
   * publish time rather than one recorded.
   */
  member_query?: UPGViewQuery
  /**
   * Advisory rendering intent for the layer as a whole: `group_by`, `sort`,
   * `layout`, `nest_by`, and `orphan_disposition` (0.34.0, absent means
   * `'root'`). A consumer may ignore it entirely and still be conformant,
   * because every default it then applies is the safe one.
   *
   * @remarks
   * THE DESCRIPTION LISTS THE FIELDS ON PURPOSE. This property is `object` in the
   * runtime property registry, so an agent reading `get_entity_schema` gets an
   * opaque blob and this sentence. For an object-typed property the description IS
   * the declared shape, which is why `check:editorial` hashes it (E.4, 0.34.0) and
   * why a field added to `UPGViewPresentation` without a word here would be
   * invisible to every gate and every agent at once.
   */
  presentation?: UPGViewPresentation
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

export interface CompositionProperties extends UPGQueryDrivenLayer {
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
  // member_query and presentation are inherited from UPGQueryDrivenLayer, which
  // composition and workspace both extend since 0.33.0. Declaring them here as
  // well would be two copies of one JSDoc block that must stay identical.
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
