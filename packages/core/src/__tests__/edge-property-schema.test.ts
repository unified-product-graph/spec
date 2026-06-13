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
