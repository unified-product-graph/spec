/**
 * G6 alignment-sheet seam edges — v0.20.1
 *
 * Alignment Sheets (the composed flat region surfaces across org/team/product
 * altitudes) exposed two gaps: an initiative had no direct link to the OKR
 * ladder or the roadmap, and a strategic_pillar had no north-star metric of
 * its own. Three edges close the seam:
 *
 *   - initiative_advances_key_result         (initiative → key_result · causal · cross-product)
 *   - initiative_delivered_via_roadmap_theme  (initiative → roadmap_theme · semantic · within-graph)
 *   - strategic_pillar_measured_by_metric     (strategic_pillar → metric · hierarchy · cross-product)
 *
 * Run: npx vitest run src/__tests__/g6-sheet-seam-edges.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG, isCrossProductEligible } from '../catalog/edge-catalog.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'

describe('initiative_advances_key_result', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.initiative_advances_key_result
    expect(def).toBeDefined()
    expect(def.source_type).toBe('initiative')
    expect(def.target_type).toBe('key_result')
    // intra-strategy execution — both endpoints sit in the strategy domain,
    // so causal, not cross-domain.
    expect(def.classification).toBe('causal')
    expect(def.forward_verb).toBe('advances')
    expect(def.reverse_verb).toBe('advanced_by')
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge (both endpoints portfolio-shared)', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('initiative_advances_key_result')
    expect(isCrossProductEligible('initiative_advances_key_result')).toBe(true)
  })

  it('does not appear in UPG_VALID_CHILDREN (causal, not containment)', () => {
    expect(UPG_VALID_CHILDREN.initiative).not.toContain('key_result')
  })
})

describe('initiative_delivered_via_roadmap_theme', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.initiative_delivered_via_roadmap_theme
    expect(def).toBeDefined()
    expect(def.source_type).toBe('initiative')
    expect(def.target_type).toBe('roadmap_theme')
    // mirrors strategic_theme_realised_by_roadmap_theme: a cross-reference
    // between the strategy spine and the roadmap spine, not containment.
    expect(def.classification).toBe('semantic')
    expect(def.forward_verb).toBe('delivered_via')
    expect(def.reverse_verb).toBe('delivers')
  })

  it('is NOT cross-product-eligible (roadmap_theme is not portfolio-shared)', () => {
    expect(isCrossProductEligible('initiative_delivered_via_roadmap_theme')).toBe(false)
    expect(UPG_CROSS_EDGE_TYPES).not.toContain('initiative_delivered_via_roadmap_theme')
  })
})

describe('strategic_pillar_measured_by_metric', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.strategic_pillar_measured_by_metric
    expect(def).toBeDefined()
    expect(def.source_type).toBe('strategic_pillar')
    expect(def.target_type).toBe('metric')
    // mirrors objective_measured_by_metric one level up the cascade.
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe('measured_by')
    expect(def.reverse_verb).toBe('measures')
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge (both endpoints portfolio-shared)', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('strategic_pillar_measured_by_metric')
    expect(isCrossProductEligible('strategic_pillar_measured_by_metric')).toBe(true)
  })

  it('metric is a valid UPG_VALID_CHILDREN entry under strategic_pillar (hierarchy backing)', () => {
    expect(UPG_VALID_CHILDREN.strategic_pillar).toContain('metric')
  })
})
