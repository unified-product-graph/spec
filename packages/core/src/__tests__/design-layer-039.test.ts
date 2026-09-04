/**
 * 0.39.0 — the design-layer edges and vocabulary (B1, B2, B3, B4).
 *
 * From a measured estate: a Studio graph and a design-system graph populated
 * through ~2,000 MCP calls, where each of these gaps was worked around in
 * prose, tags, or a script. The assertions name the edges rather than counting
 * them, so a later drop is a deliberate edit here.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_EDGE_CATALOG,
  UPG_VALID_CHILDREN,
  UPG_PROPERTY_SCHEMA,
  isCrossProductEligible,
  isPortfolioSharedType,
  getDomainForType,
} from '../index.js'

const catalog = UPG_EDGE_CATALOG as Record<string, { forward_verb: string; reverse_verb: string; classification: string; source_type: string; target_type: string; cross_product_eligible?: boolean }>

describe('B1 — a product graph component can point at the design-system component it wraps', () => {
  it('design_component_composes_design_component is cross-product eligible', () => {
    expect(isCrossProductEligible('design_component_composes_design_component')).toBe(true)
  })

  it('passes the type gate on its own endpoints (no exception needed)', () => {
    // design_component is portfolio_shared, which is WHY widening the existing
    // edge was right and minting a `_wraps_` twin was not.
    expect(isPortfolioSharedType('design_component')).toBe(true)
  })

  it('no second verb was minted for the same relationship', () => {
    expect(catalog['design_component_wraps_design_component']).toBeUndefined()
  })
})

describe('B2 — the token alias tier', () => {
  const t = 'design_token_derives_from_design_token'

  it('exists, self-directed, causal, cross-product eligible', () => {
    expect(catalog[t]).toBeDefined()
    expect(catalog[t].source_type).toBe('design_token')
    expect(catalog[t].target_type).toBe('design_token')
    // causal, not semantic: the alias's value is COMPUTED from the primitive's.
    expect(catalog[t].classification).toBe('causal')
    expect(isCrossProductEligible(t)).toBe(true)
  })

  it('reads correctly in both directions', () => {
    expect(catalog[t].forward_verb).toBe('derives_from')
    expect(catalog[t].reverse_verb).toBe('derived_into')
  })
})

describe('B3 — design_token.category speaks DTCG $type', () => {
  const category = UPG_PROPERTY_SCHEMA['design_token']?.category

  it('keeps every original UPG value (a widening must not narrow)', () => {
    for (const v of ['color', 'spacing', 'typography', 'radius', 'motion']) {
      expect(category?.enum, `${v} dropped`).toContain(v)
    }
  })

  it('adds the DTCG vocabulary the field estate needed', () => {
    // shadow / dimension / opacity are the three the reporter wrote and the
    // server accepted against an enum that did not list them.
    for (const v of ['shadow', 'dimension', 'opacity', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'gradient', 'border', 'transition', 'strokeStyle']) {
      expect(category?.enum, `${v} missing`).toContain(v)
    }
  })
})

describe('B4 — component catalogs group by area', () => {
  const t = 'feature_area_groups_design_component'

  it('exists as a hierarchy edge from feature_area to design_component', () => {
    expect(catalog[t]).toBeDefined()
    expect(catalog[t].source_type).toBe('feature_area')
    expect(catalog[t].target_type).toBe('design_component')
    expect(catalog[t].classification).toBe('hierarchy')
  })

  it('groups rather than contains: the area is not the owner', () => {
    expect(catalog[t].forward_verb).toBe('groups')
    expect(catalog[t].reverse_verb).toBe('grouped_in')
  })

  it('is declared in the hierarchy grammar', () => {
    expect(UPG_VALID_CHILDREN['feature_area']).toContain('design_component')
  })

  it('leaves the real owners in place (multi-parent grammar, single parentage)', () => {
    expect(UPG_VALID_CHILDREN['design_system']).toContain('design_component')
  })
})

describe('the four are coherent as a set', () => {
  it('every new/widened edge resolves a domain at both ends', () => {
    for (const t of ['design_component_composes_design_component', 'design_token_derives_from_design_token', 'feature_area_groups_design_component']) {
      expect(getDomainForType(catalog[t].source_type), `${t} source`).toBeTruthy()
      expect(getDomainForType(catalog[t].target_type), `${t} target`).toBeTruthy()
    }
  })
})
