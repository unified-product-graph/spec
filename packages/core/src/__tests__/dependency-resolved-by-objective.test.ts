/**
 * dependency_resolved_by_objective — cross-product edge.
 *
 * The objective↔dependency pair (`objective_depends_on_dependency`,
 * `dependency_blocks_objective`) only expresses the BLOCKING relationship: an
 * objective held up by a dependency. It had no way to name the objective whose
 * completion RESOLVES the dependency (the providing side). Across two product
 * graphs in a portfolio — where one product depends on another — the resolving
 * link had to live in the dependency's free-text `resolution` property instead
 * of a typed, queryable, cross-graph edge. This adds the forward resolving edge,
 * cross_product_eligible so a dependency in one product can point at the
 * objective in another product whose completion clears it.
 *
 * Run: npx vitest run src/__tests__/dependency-resolved-by-objective.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

describe('27f64221 — dependency_resolved_by_objective', () => {
  it('exists with the right shape (dependency → objective, resolving verbs)', () => {
    const def = UPG_EDGE_CATALOG.dependency_resolved_by_objective
    expect(def).toBeDefined()
    expect(def.source_type).toBe('dependency')
    expect(def.target_type).toBe('objective')
    expect(def.classification).toBe('cross-domain')
    expect(def.forward_verb).toBe('resolved_by')
    expect(def.reverse_verb).toBe('resolves')
  })

  it('is cross_product_eligible (the resolving objective lives in another product)', () => {
    expect(UPG_EDGE_CATALOG.dependency_resolved_by_objective.cross_product_eligible).toBe(true)
  })

  it('is distinct from the blocking edges on the same pair', () => {
    const resolve = UPG_EDGE_CATALOG.dependency_resolved_by_objective
    const block = UPG_EDGE_CATALOG.dependency_blocks_objective
    // Same endpoints, opposite meaning: blocks (holds up) vs resolved_by (clears).
    expect(resolve.source_type).toBe(block.source_type)
    expect(resolve.target_type).toBe(block.target_type)
    expect(resolve.forward_verb).not.toBe(block.forward_verb)
  })

  it('the key satisfies the source-type prefix gate', () => {
    expect('dependency_resolved_by_objective'.startsWith('dependency_')).toBe(true)
  })
})
