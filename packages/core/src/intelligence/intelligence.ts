/**
 * UPG Intelligence Conditions: structured, machine-evaluable graph predicates.
 *
 * Check types: `EntityCheck` (count by criteria), `RelationshipCheck`
 * (edge existence/count), `BenchmarkCheck` (compare against stage benchmark),
 * `EdgeCountVsPropertyCheck` (per-node: edge count against the node's own
 * numeric property), plus the graph-shape counts (total / domain / orphan).
 * Composable via `and` / `or` operators.
 *
 * All but `EdgeCountVsPropertyCheck` are AGGREGATE checks — whole-graph tallies
 * compared against constants. That is why most detectors here are whole-graph
 * approximations of per-node rules, and why they can say a graph has a problem
 * without saying where. `EdgeCountVsPropertyCheck` (0.29.0) is the exception,
 * and it is what lets a violation name the nodes it is about.
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'
import type { UPGEdgeType } from '../shapes/edges.js'

// ─── Check Types ────────────────────────────────────────────────────────────

/** Count entities matching criteria */
export interface EntityCheck {
  /** Discriminator, always `'entity_count'` for this check type */
  type: 'entity_count'
  /** The UPG entity type to count */
  entity_type: UPGEntityType
  /**
   * Optional filter narrowing which entities of `entity_type` are counted.
   * Three recognised forms, checked in this order:
   *
   * 1. `{ property, present }` (0.27.0) — count entities whose `property`
   *    carries a non-empty value (`present: true`) or does NOT
   *    (`present: false`). The absence form is what lets a pattern key on a
   *    field nobody filled in, e.g. a `surface` with no `arbitration_rule`.
   *    A value-keyed filter cannot express absence, because the collector only
   *    indexes values that exist.
   * 2. `{ property, value }` (0.17.0) — count entities whose `property` equals
   *    `value`, e.g. `metric` where `designation === 'north_star'`.
   * 3. `{ status }` — count entities in a given lifecycle status.
   * 4. `{ property, present, except_property, except_value }` (0.28.0) — form 1,
   *    but entities whose `except_property` equals `except_value` are removed
   *    from the counted population first. This is what lets a detector carry a
   *    declared exemption: `surface` counts as missing an `arbitration_rule`
   *    unless it has declared `composition_mode: 'chained'`, for which having
   *    no rule is the designed shape rather than an omission. The exclusion is
   *    an intersection, not a marginal, so it cannot be derived from forms 1-3;
   *    collectors compute it from `UPG_PRESENCE_EXCEPT_SPECS`, which is derived
   *    from these filters, and store it under `presenceExceptKey(...)`.
   */
  filter?: Record<string, unknown>
  /** Comparison operator */
  comparison: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'zero' | 'nonzero'
  /** Threshold value (not needed for 'zero' / 'nonzero') */
  threshold?: number
}

/** Check relationship existence or count */
export interface RelationshipCheck {
  /** Discriminator, always `'relationship'` for this check type */
  type: 'relationship'
  /** Source entity type */
  source_type: UPGEntityType
  /** Edge type to check */
  edge_type: UPGEdgeType
  /** Target entity type */
  target_type: UPGEntityType
  /** Comparison */
  comparison: 'exists' | 'not_exists' | 'count_gt' | 'count_lt'
  /** Threshold for count comparisons */
  threshold?: number
}

/** Compare against stage-appropriate benchmark */
export interface BenchmarkCheck {
  /** Discriminator, always `'benchmark'` for this check type */
  type: 'benchmark'
  /** The entity type to benchmark */
  entity_type: UPGEntityType
  /** How current count compares to the benchmark for the product's stage */
  comparison: 'below_min' | 'above_max' | 'within_range' | 'missing'
}

/**
 * Graph-wide entity-count check, ignoring entity type. Used by the Full lens
 * to detect "the graph is nearly empty" / "the graph is large" without naming
 * a specific type.
 */
export interface TotalEntityCountCheck {
  /** Discriminator, always `'total_entity_count'` for this check type */
  type: 'total_entity_count'
  /** Comparison operator */
  comparison: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'zero' | 'nonzero'
  /** Threshold value (not needed for 'zero' / 'nonzero') */
  threshold?: number
}

/**
 * Count how many distinct UPG domains the graph populates. Used by the Full
 * lens to flag thin-coverage graphs (e.g. all entities in one or two domains).
 */
export interface DomainCountCheck {
  /** Discriminator, always `'domain_count'` for this check type */
  type: 'domain_count'
  /** Comparison operator */
  comparison: 'eq' | 'gt' | 'lt' | 'gte' | 'lte'
  /** Threshold (number of distinct domains with at least one entity) */
  threshold: number
}

/**
 * Check whether a specific domain has any entities. Used by the Full lens to
 * detect "building without validating" patterns (validation domain empty
 * while product-spec domain is populated).
 */
export interface DomainPopulationCheck {
  /** Discriminator, always `'domain_population'` for this check type */
  type: 'domain_population'
  /** Domain id (matches `UPGDomainId`) */
  domain_id: string
  /** Comparison operator */
  comparison: 'zero' | 'nonzero' | 'gt' | 'lt'
  /** Threshold for `'gt'` / `'lt'` comparisons */
  threshold?: number
}

/**
 * Count entities that have no incoming or outgoing edges. Used by the Full
 * lens to surface "loose thoughts waiting to be placed" in graph-health
 * prompts.
 */
export interface OrphanCheck {
  /** Discriminator, always `'orphan_count'` for this check type */
  type: 'orphan_count'
  /** Comparison operator */
  comparison: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'zero' | 'nonzero'
  /** Threshold value (not needed for 'zero' / 'nonzero') */
  threshold?: number
}

/**
 * Count entities whose EDGE COUNT stands in a stated relation to one of their
 * own NUMERIC PROPERTIES (0.29.0).
 *
 * The first genuinely per-node check form. Every other check in this file is an
 * aggregate: it compares a whole-graph tally against a constant. This one
 * compares two values that both live on the same node, so it cannot be
 * expressed by any composition of the others — a graph-wide edge count says
 * nothing about which node holds which capacity, and the presence filters key
 * on whether a property EXISTS, never on what it says relative to anything else.
 *
 * The motivating case (feedback `af9ae4c2`, measured on a 43-surface field
 * graph): `contended-surface-without-arbitration` counted
 * `feature_occupies_surface` edges and never read `capacity`, so a header row
 * declaring room for four occupants and holding exactly four was flagged as
 * contended alongside a capacity-1 panel holding three. Ten surfaces flagged,
 * three of them wrongly, and all three wrong for this one reason.
 *
 * DELIBERATELY GENERAL. The shape is "edge count versus numeric property", not
 * "occupancy versus capacity". A surface's guest list against its capacity is
 * the first instance, but the form fits any place the graph states a numeric
 * intent and the edges record what actually arrived.
 *
 * COLLECTORS ARE DRIVEN BY DECLARED SPECS, never by speculative indexing.
 * `UPG_EDGE_COUNT_SPECS` is derived from the conditions in this catalog, so a
 * collector computes exactly the per-node tallies some detector asked for, and
 * seeds every declared spec before walking so that "nothing matched" and "this
 * collector is stale" stay distinguishable. The evaluator treats the second as
 * a worst case and over-reports, which is the safe failure for a detector whose
 * job is noticing omissions.
 */
export interface EdgeCountVsPropertyCheck {
  /** Discriminator, always `'edge_count_vs_property'` for this check type */
  type: 'edge_count_vs_property'
  /** The entity type whose nodes are evaluated one at a time. */
  entity_type: UPGEntityType
  /** The edge type counted against each node of `entity_type`. */
  edge_type: UPGEdgeType
  /**
   * Which end of `edge_type` the evaluated node sits on. `inbound` (the
   * default) counts edges that POINT AT the node, which is the occupancy
   * reading: `feature_occupies_surface` runs feature → surface, so a surface's
   * guest list is its inbound count.
   */
  direction?: 'inbound' | 'outbound'
  /** The node's own numeric property the count is compared against. */
  property: string
  /**
   * What to compare against when the node does not carry `property` at all.
   *
   * ABSENCE IS A READING, NOT A HOLE. On `surface.capacity` absence means
   * unbounded, and an unbounded surface is not thereby exempt: it has stated no
   * limit, so it has stated no answer, and more than one occupant is exactly
   * the situation worth naming. Setting this to `1` encodes that — an
   * unqualified place holding two things has an unrecorded decision in it.
   */
  property_absent_default: number
  /**
   * How a node's edge count must relate to the property value for that node to
   * be counted. `gt` reads "more arrived than the design said would fit".
   */
  node_comparison: 'gt' | 'gte' | 'lt' | 'lte' | 'eq'
  /**
   * Optional additional per-node requirement, stated in the vocabulary of
   * `EntityCheck.filter`'s presence form: the node must carry
   * (`present: true`) or must not carry (`present: false`) a non-empty value
   * for `property`.
   *
   * THIS IS WHY THE FORM IS PER-NODE RATHER THAN TWO ANDED AGGREGATES.
   * "Some surface is over capacity" AND "some surface has no arbitration rule"
   * are both true of a graph where those are DIFFERENT surfaces, so composing
   * two aggregate checks would keep firing on exactly the graphs this release
   * exists to stop firing on. Both halves have to be asked of the same node.
   */
  node_filter?: { property: string; present: boolean }
  /**
   * Optional exemption, mirroring the 0.28.0 `except_property` /
   * `except_value` form on `EntityCheck`. A node declaring the exemption is
   * removed from the evaluated population entirely — it is not counted, and it
   * is not attributed.
   */
  except_property?: string
  /** Value of `except_property` that triggers the exemption. */
  except_value?: string
  /** Aggregate comparison applied to the number of nodes that matched. */
  comparison: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'zero' | 'nonzero'
  /** Threshold value (not needed for 'zero' / 'nonzero') */
  threshold?: number
}

// ─── Condition Composition ──────────────────────────────────────────────────

/**
 * A structured, machine-evaluable condition for intelligence prompts.
 *
 * Modelled as a discriminated union. Every condition is either a single
 * leaf check or a compound node combining child conditions with `and` or `or`.
 * This prevents constructing nonsensical shapes (e.g. an `operator` with a
 * `check` at the same level).
 *
 * @example Leaf: { check: { type: 'entity_count', entity_type: 'persona', comparison: 'zero' } }
 * @example Compound: { operator: 'and', checks: [
 *   { check: { type: 'entity_count', entity_type: 'feature', comparison: 'nonzero' } },
 *   { check: { type: 'entity_count', entity_type: 'hypothesis', comparison: 'zero' } }
 * ] }
 */
export type IntelligenceCondition =
  | {
      check:
        | EntityCheck
        | RelationshipCheck
        | BenchmarkCheck
        | TotalEntityCountCheck
        | DomainCountCheck
        | DomainPopulationCheck
        | OrphanCheck
        | EdgeCountVsPropertyCheck
    }
  | { operator: 'and' | 'or'; checks: IntelligenceCondition[] }
