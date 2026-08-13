/**
 * UPG Intelligence Conditions: structured, machine-evaluable graph predicates.
 *
 * Three check types: `EntityCheck` (count by criteria), `RelationshipCheck`
 * (edge existence/count), `BenchmarkCheck` (compare against stage benchmark).
 * Composable via `and` / `or` operators.
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
    }
  | { operator: 'and' | 'or'; checks: IntelligenceCondition[] }
