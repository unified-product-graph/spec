/**
 * Entity-filter attribution specs and keys (0.29.0).
 *
 * `entityFilterKey` and the `nodesByEntityFilter` input it addresses are one
 * contract split across two packages: the SDK collector writes the map, the
 * evaluator reads it, and neither spells the key inline. A disagreement between
 * them does not throw, it just produces a permanently empty match list, so a
 * violation quietly loses its node ids while every count stays right and every
 * existing test stays green. That failure mode is why this file exists.
 *
 * The mirror-side tests (the collector actually producing these ids from a real
 * store) live in `packages/upg-sdk/src/__tests__/attribution-collector.test.ts`,
 * and the two files deliberately assert the SAME keys.
 */
import { describe, it, expect } from 'vitest'
import {
  entityFilterKey,
  classifyEntityFilter,
  edgeCountSpecKey,
  checkToEdgeCountSpec,
  UPG_ENTITY_FILTER_SPECS,
  UPG_EDGE_COUNT_SPECS,
} from '../../intelligence/anti-patterns.js'

describe('classifyEntityFilter', () => {
  it('recognises the three live shapes', () => {
    expect(classifyEntityFilter({ property: 'arbitration_rule', present: false })).toBe('presence')
    expect(classifyEntityFilter({ property: 'designation', value: 'north_star' })).toBe('value')
    expect(classifyEntityFilter({ status: 'drafted' })).toBe('status')
  })

  it('reports anything else as unrecognized rather than guessing', () => {
    // The guess is the danger: a shape silently classified as something it is
    // not would attribute the wrong nodes, which is worse than attributing none.
    expect(classifyEntityFilter({})).toBe('unrecognized')
    expect(classifyEntityFilter({ property: 'capacity' })).toBe('unrecognized')
    expect(classifyEntityFilter({ property: 'capacity', value: 4 })).toBe('unrecognized')
    expect(classifyEntityFilter({ present: true })).toBe('unrecognized')
  })

  it('classifies a present+except filter as plain presence', () => {
    // Attribution for the except form has no declarer, no collector path and no
    // test, so it is not a separate kind. Falling back to the presence
    // predicate alone is a SUPERSET of the except population, so it can never
    // name a node the detector did not implicate; it could only over-name, and
    // only if a detector declared this shape, which none does.
    expect(
      classifyEntityFilter({
        property: 'arbitration_rule',
        present: false,
        except_property: 'composition_mode',
        except_value: 'chained',
      }),
    ).toBe('presence')
  })
})

describe('entityFilterKey', () => {
  it('keys each live shape distinctly', () => {
    expect(entityFilterKey('hypothesis', { status: 'drafted' })).toBe('hypothesis|status=drafted')
    expect(entityFilterKey('metric', { property: 'designation', value: 'north_star' })).toBe(
      'metric|designation=north_star',
    )
    expect(entityFilterKey('surface', { property: 'arbitration_state', value: 'none' })).toBe(
      'surface|arbitration_state=none',
    )
  })

  it('distinguishes present from absent on the same property', () => {
    // The two are different populations and must never share a tally. Deriving
    // one from the other by subtraction is what the id-carrying map exists to
    // avoid.
    const present = entityFilterKey('surface', { property: 'arbitration_rule', present: true })
    const absent = entityFilterKey('surface', { property: 'arbitration_rule', present: false })
    expect(present).toBe('surface|arbitration_rule=present')
    expect(absent).toBe('surface|arbitration_rule=absent')
    expect(present).not.toBe(absent)
  })

  it('separates the same filter applied to different entity types', () => {
    expect(entityFilterKey('surface', { status: 'draft' })).not.toBe(
      entityFilterKey('screen', { status: 'draft' }),
    )
  })

  it('does not collide two different unrecognized shapes into one key', () => {
    // Unreachable through the catalog (the derivation walk throws first), but
    // the old catch-all silently mapped every unrecognized shape to the same
    // key, so two distinct filters would dedup each other out of existence.
    // Keyed distinctly from the live shapes so that can never be the failure.
    const key = entityFilterKey('surface', { nonsense: true } as Record<string, unknown>)
    expect(key).toBe('surface|<unrecognized>')
    expect(key).not.toBe(entityFilterKey('surface', { status: 'draft' }))
  })
})

describe('UPG_ENTITY_FILTER_SPECS (derived from the catalog)', () => {
  it('holds exactly the four filters the catalog declares', () => {
    // Pinned because the comment above the derivation claimed five for one
    // release after the contention branch stopped declaring one. A derived list
    // cannot drift from the conditions, but prose about it can, so the number
    // is asserted rather than described.
    const keys = UPG_ENTITY_FILTER_SPECS.map((s) => entityFilterKey(s.entity_type, s.filter)).sort()
    expect(keys).toEqual([
      'hypothesis|status=drafted',
      'metric|designation=north_star',
      'surface|arbitration_state=none',
      'surface|arbitration_state=safe_by_coincidence',
    ])
  })

  it('carries a resolved kind on every spec, none unrecognized', () => {
    // The collector switches exhaustively on `kind`. An unrecognized shape
    // cannot reach it (the walk throws), and this asserts the invariant that
    // guarantee rests on.
    for (const spec of UPG_ENTITY_FILTER_SPECS) {
      expect(['presence', 'value', 'status']).toContain(spec.kind)
      expect(spec.kind).toBe(classifyEntityFilter(spec.filter))
    }
  })

  it('excludes the edge-count check\'s node_filter', () => {
    // The only `present: false` left in the catalog is a per-node clause on
    // `edge_count_vs_property`, tallied through UPG_EDGE_COUNT_SPECS. Collecting
    // it here as well would double-attribute the same surfaces through two
    // different maps.
    expect(UPG_ENTITY_FILTER_SPECS.some((s) => s.filter.present !== undefined)).toBe(false)
    expect(UPG_EDGE_COUNT_SPECS[0]?.node_filter).toEqual({
      property: 'arbitration_rule',
      present: false,
    })
  })
})

describe('checkToEdgeCountSpec', () => {
  it('is the single construction site, and applies the direction default', () => {
    // Three call sites key into edgeCountSpecKey through this helper. A second
    // construction that forgot the default would produce a key that misses the
    // collector's entry, and the check would read as "nothing matched" rather
    // than fail.
    const spec = checkToEdgeCountSpec({
      type: 'edge_count_vs_property',
      entity_type: 'surface',
      edge_type: 'feature_occupies_surface',
      property: 'capacity',
      property_absent_default: 1,
      node_comparison: 'gt',
      comparison: 'nonzero',
    })
    expect(spec.direction).toBe('inbound')
    expect(edgeCountSpecKey(spec)).toBe(
      'surface|feature_occupies_surface|inbound|capacity|1|gt|*|*',
    )
  })

  it('round-trips the catalog spec to the same key it was derived under', () => {
    const declared = UPG_EDGE_COUNT_SPECS[0]!
    expect(edgeCountSpecKey(declared)).toBe(
      edgeCountSpecKey(
        checkToEdgeCountSpec({
          type: 'edge_count_vs_property',
          entity_type: declared.entity_type as never,
          edge_type: declared.edge_type as never,
          direction: declared.direction,
          property: declared.property,
          property_absent_default: declared.property_absent_default,
          node_comparison: declared.node_comparison,
          node_filter: declared.node_filter,
          except_property: declared.except_property,
          except_value: declared.except_value,
          comparison: 'nonzero',
        }),
      ),
    )
  })
})
