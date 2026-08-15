/**
 * Edge property schema + validateEdgeProperties (0.10.4). The classification
 * edges carry a typed property_schema (confidence_5 assessment + provenance);
 * the shared validator backs the writers and validate_graph.
 */
import { describe, it, expect } from 'vitest'
import {
  edgeCarriesProperties,
  getEdgePropertySchema,
  CLASSIFICATION_EDGE_PROPERTY_SCHEMA,
} from '../catalog/edge-catalog.js'
import { validateEdgeProperties } from '../properties/edge-property-validation.js'

const COMP = 'competitor_classified_as_classification_value'
const NODE = 'node_classified_as_classification_value'

describe('classification edge property schema (0.10.4)', () => {
  it('both classification edges carry the identical schema', () => {
    for (const t of [COMP, NODE]) {
      expect(edgeCarriesProperties(t)).toBe(true)
      expect(getEdgePropertySchema(t)).toBe(CLASSIFICATION_EDGE_PROPERTY_SCHEMA)
    }
    expect(Object.keys(CLASSIFICATION_EDGE_PROPERTY_SCHEMA)).toEqual(['confidence', 'assessed_on', 'rationale', 'evidence'])
  })

  it('parity edge carries properties but declares no schema (stays wholesale)', () => {
    expect(edgeCarriesProperties('feature_rivals_competitor_feature')).toBe(true)
    expect(getEdgePropertySchema('feature_rivals_competitor_feature')).toBeUndefined()
    // No schema => no validation, any bag accepted.
    expect(validateEdgeProperties('feature_rivals_competitor_feature', { anything: 1 })).toEqual([])
  })
})

describe('validateEdgeProperties (0.10.4)', () => {
  it('accepts a valid bag and an empty bag', () => {
    expect(validateEdgeProperties(COMP, { confidence: { value: 3, label: 'medium', scale_id: 'confidence_5' }, assessed_on: '2026-06-13', rationale: 'x', evidence: 'http://y' })).toEqual([])
    expect(validateEdgeProperties(COMP, {})).toEqual([])
    expect(validateEdgeProperties(COMP, undefined)).toEqual([])
  })

  it('flags off-scale confidence', () => {
    const errs = validateEdgeProperties(COMP, { confidence: { value: 7, label: 'high' } })
    expect(errs.some((e) => /out of range/.test(e))).toBe(true)
  })

  it('flags a wrong scale_id', () => {
    const errs = validateEdgeProperties(COMP, { confidence: { value: 3, label: 'x', scale_id: 'reach_5' } })
    expect(errs.some((e) => /must be "confidence_5"/.test(e))).toBe(true)
  })

  it('flags a confidence assessment missing its label', () => {
    const errs = validateEdgeProperties(COMP, { confidence: { value: 3 } })
    expect(errs.some((e) => /missing required "label"/.test(e))).toBe(true)
  })

  it('flags an unknown property key', () => {
    const errs = validateEdgeProperties(COMP, { bogus: 1 })
    expect(errs.some((e) => /unknown property "bogus"/.test(e))).toBe(true)
  })
})

/**
 * The 0.30.0 configuration schemas are the first edge properties typed
 * `string[]` and `object`, and the validator had no case for either. The write
 * path therefore admitted exactly the shapes the read path mis-handles: a bare
 * string where a list belongs reads as absent to the projection operator, so
 * the surface silently reverts to appearing in every configuration.
 */
describe('configuration edge property validation (0.30.0)', () => {
  const VARIES = 'surface_varies_by_configuration_axis'
  const CONTAINS = 'surface_contains_surface'

  it('accepts a well-formed present_under', () => {
    expect(validateEdgeProperties(VARIES, { present_under: ['legacy_nav'] })).toEqual([])
  })

  it('rejects a bare string where a list belongs', () => {
    const errs = validateEdgeProperties(VARIES, { present_under: 'legacy_nav' })
    expect(errs.length).toBeGreaterThan(0)
    expect(errs[0]).toContain('array of strings')
  })

  it('rejects a list containing a non-string', () => {
    expect(validateEdgeProperties(VARIES, { present_under: ['a', 3] }).length).toBeGreaterThan(0)
  })

  it('rejects an empty present_under', () => {
    // A surface present under nothing should be deleted, not declared.
    expect(validateEdgeProperties(VARIES, { present_under: [] }).length).toBeGreaterThan(0)
  })

  it('accepts a well-formed active_when', () => {
    expect(
      validateEdgeProperties(CONTAINS, { active_when: { axis: 'ax_1', values: ['legacy'] } }),
    ).toEqual([])
  })

  it('rejects an active_when missing its values', () => {
    // This is the shape that reads as ABSENT to the projection operator, which
    // makes the edge invariant: the write means the opposite of the intent.
    const errs = validateEdgeProperties(CONTAINS, { active_when: { axis: 'ax_1' } })
    expect(errs.length).toBeGreaterThan(0)
    expect(errs.join(' ')).toContain('values')
  })

  it('rejects an active_when with an empty values list', () => {
    expect(
      validateEdgeProperties(CONTAINS, { active_when: { axis: 'ax_1', values: [] } }).length,
    ).toBeGreaterThan(0)
  })

  it('rejects an active_when that is not an object', () => {
    expect(validateEdgeProperties(CONTAINS, { active_when: 'legacy' }).length).toBeGreaterThan(0)
  })

  it('rejects an unknown key inside active_when', () => {
    expect(
      validateEdgeProperties(CONTAINS, {
        active_when: { axis: 'ax_1', values: ['a'], unless: 'b' },
      }).length,
    ).toBeGreaterThan(0)
  })
})
