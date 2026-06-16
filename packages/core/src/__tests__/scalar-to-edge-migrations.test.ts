/**
 * Scalar → edge promotion contract (P14 conformance, 0.12.0).
 *
 * `UPG_SCALAR_TO_EDGE_MIGRATIONS` is the declarative rule set that promotes a
 * scalar property naming a first-class entity into a canonical edge (principle
 * P14, "Foreign Keys Are Edges"). This suite validates the rule SHAPE — every
 * type and edge a rule references must really exist, and the edge's catalog
 * direction must agree with the rule's orientation. The apply ENGINE and its
 * lossless round-trip live in `@unified-product-graph/sdk`.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_SCALAR_TO_EDGE_MIGRATIONS,
  getScalarToEdgeMigrations,
} from '../grammar/migrations.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { getTypes } from '../registry/domains.js'

const ACTIVE_TYPES = new Set(getTypes())
const ALL_RULES = Object.values(UPG_SCALAR_TO_EDGE_MIGRATIONS).flat()

describe('scalar→edge migration contract — rule shape', () => {
  it('has at least the 0.12.0 ruleset', () => {
    expect(UPG_SCALAR_TO_EDGE_MIGRATIONS['0.12.0']?.length ?? 0).toBeGreaterThan(0)
  })

  it('every from_type is an active entity type', () => {
    const bad = ALL_RULES.filter((r) => !ACTIVE_TYPES.has(r.from_type)).map((r) => r.from_type)
    expect(bad, `unknown from_type(s): ${bad.join(', ')}`).toEqual([])
  })

  it('every target_type is an active entity type', () => {
    const bad = ALL_RULES.filter((r) => !ACTIVE_TYPES.has(r.target_type)).map(
      (r) => `${r.from_type}.${r.scalar_property} → ${r.target_type}`,
    )
    expect(bad, `unknown target_type(s): ${bad.join(', ')}`).toEqual([])
  })

  it('every edge_type exists in UPG_EDGE_CATALOG', () => {
    const bad = ALL_RULES.filter((r) => !(r.edge_type in UPG_EDGE_CATALOG)).map(
      (r) => `${r.from_type}.${r.scalar_property} → ${r.edge_type}`,
    )
    expect(bad, `unknown edge_type(s): ${bad.join(', ')}`).toEqual([])
  })

  it('the edge catalog direction agrees with each rule orientation', () => {
    const mismatches: string[] = []
    for (const r of ALL_RULES) {
      const def = UPG_EDGE_CATALOG[r.edge_type as keyof typeof UPG_EDGE_CATALOG]
      if (!def) continue // covered by the previous test
      // forward: from_type → target_type ; reverse: target_type → from_type
      const expectSource = r.reverse ? r.target_type : r.from_type
      const expectTarget = r.reverse ? r.from_type : r.target_type
      // 'node' is the polymorphic wildcard source — it accepts any from_type.
      const sourceOk = def.source_type === expectSource || def.source_type === 'node'
      const targetOk = def.target_type === expectTarget || def.target_type === 'node'
      if (!sourceOk || !targetOk) {
        mismatches.push(
          `${r.from_type}.${r.scalar_property} (reverse=${!!r.reverse}): rule wants ${expectSource}→${expectTarget}, ` +
            `catalog ${r.edge_type} is ${def.source_type}→${def.target_type}`,
        )
      }
    }
    expect(mismatches, mismatches.join('\n')).toEqual([])
  })

  it('every rule declares drop_scalar and a non-empty reason', () => {
    const bad = ALL_RULES.filter((r) => typeof r.drop_scalar !== 'boolean' || !r.reason?.trim()).map(
      (r) => `${r.from_type}.${r.scalar_property}`,
    )
    expect(bad, `rules missing drop_scalar/reason: ${bad.join(', ')}`).toEqual([])
  })

  it('getScalarToEdgeMigrations is version-scoped', () => {
    expect(getScalarToEdgeMigrations('0.11.6', '0.12.0').length).toBe(
      UPG_SCALAR_TO_EDGE_MIGRATIONS['0.12.0'].length,
    )
    // A range that ends before 0.12.0 picks up nothing.
    expect(getScalarToEdgeMigrations('0.10.0', '0.11.6')).toEqual([])
  })

  it('the flagship north_star_metric rule is present and well-formed', () => {
    const flagship = ALL_RULES.find(
      (r) => r.from_type === 'business_model' && r.scalar_property === 'north_star_metric',
    )
    expect(flagship).toBeTruthy()
    expect(flagship!.target_type).toBe('metric')
    expect(flagship!.edge_type).toBe('business_model_guided_by_metric')
    expect(flagship!.target_defaults).toMatchObject({ designation: 'north_star' })
    expect(flagship!.drop_scalar).toBe(true)
  })
})
