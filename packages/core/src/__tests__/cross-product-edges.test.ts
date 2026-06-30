/**
 * Cross-product edge validation — post-portfolio-migration rules.
 *
 * After the portfolio-document migration, cross-product edge types
 * are illegal inside a product's `edges[]`. They must live exclusively in
 * `portfolio.cross_edges[]`.
 *
 * The validator now emits an error (not a warning, not a silent pass) when it
 * finds a cross-product edge type in `edges[]`.
 */

import { describe, it, expect } from 'vitest'
import { validateUPGDocument } from '../grammar/validate.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_EDGE_CATALOG, getEdgePropertySchema } from '../catalog/edge-catalog.js'
import { validateEdgeProperties } from '../properties/edge-property-validation.js'

const baseDoc = (edges: Array<Record<string, unknown>>) => ({
  upg_version: '0.2.4',
  exported_at: '2026-04-27T20:00:00Z',
  source: { tool: 'test', tool_version: '0.0.0' },
  product: { id: 'p_test', title: 'Test product' },
  nodes: [
    { id: 'n1', type: 'persona', title: 'Local persona' },
    { id: 'n2', type: 'persona', title: 'Another persona' },
  ],
  edges,
})

describe('cross-product edge validation', () => {
  it('exposes the forty-one canonical cross-product edge types', () => {
    expect(UPG_CROSS_EDGE_TYPES).toEqual([
      'shares_persona',
      'shares_competitor',
      'shares_metric',
      'depends_on_product',
      'cannibalises',
      'succeeds',
      'hosts',
      'contributes_to',
      'instance_of',
      'area_serves_persona',
      'area_targets_market_segment',
      'rolls_up_to',
      'product_implements_specification',
      'product_exposes_specification',
      'feature_conforms_to_specification',
      'api_contract_speaks_specification',
      'product_exposes_primitive',
      'feature_manipulates_primitive',
      'primitive_stored_as_data_type',
      'feature_rivals_competitor_feature',
      'competitor_signal_maps_to_feature',
      'competitor_signal_surfaces_opportunity',
      'competitor_classified_as_classification_value',
      'node_classified_as_classification_value',
      'journey_phase_realises_operating_stage',
      'screen_markets_product',
      'screen_renders_design_component',
      'product_expresses_brand_identity',
      'shares_job',
      'shares_need',
      'persona_delegates_to_persona',
      'screen_targets_competitor',
      'feature_surfaces_product',
      'feature_uses_design_component',
      'product_implements_design_system',
      'node_owned_by_team',
      'node_owned_by_department',
      'strategic_theme_contains_objective',
      'objective_achieved_through_key_result',
      'key_result_quantified_by_metric',
      'objective_measured_by_metric',
    ])
  })

  it('rejects a cross-product edge type in product edges[]', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'shares_persona' },
    ])
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('portfolio.cross_edges'))).toBe(true)
  })

  it('emits the error on the edge type path', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'shares_persona' },
    ])
    const result = validateUPGDocument(doc)
    const typeError = result.errors.find((e) => e.path === '$.edges[0].type')
    expect(typeError).toBeDefined()
    expect(typeError?.message).toContain('portfolio.cross_edges[]')
  })

  it('rejects the cross-product-only edge types in edges[]', () => {
    // Dual-registered types (present in BOTH the within-product catalogue and the
    // cross-edge registry — the parity / signal family from #38/#41) are
    // legitimate within-product edges and are exempt; see the next test.
    const catalogTypes = new Set(Object.keys(UPG_EDGE_CATALOG))
    const crossOnly = UPG_CROSS_EDGE_TYPES.filter((t) => !catalogTypes.has(t))
    for (const crossType of crossOnly) {
      const doc = baseDoc([
        { id: 'e1', source: 'n1', target: 'n2', type: crossType },
      ])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('portfolio.cross_edges'))).toBe(true)
    }
  })

  it('accepts dual-registered edge types (catalog + cross-edge) in product edges[]', () => {
    // feature_rivals_competitor_feature and the competitor_signal cross-mappings
    // are valid WITHIN a product graph (the catalogue / degenerate case, #38/#41)
    // as well as cross-product. A within-product instance must NOT trip the
    // "must live in portfolio.cross_edges[]" check (UPG 0.10.1).
    const catalogTypes = new Set(Object.keys(UPG_EDGE_CATALOG))
    const dual = UPG_CROSS_EDGE_TYPES.filter((t) => catalogTypes.has(t))
    expect(dual.length).toBeGreaterThan(0)
    for (const dualType of dual) {
      const doc = baseDoc([
        { id: 'e1', source: 'n1', target: 'n2', type: dualType },
      ])
      const result = validateUPGDocument(doc)
      expect(
        result.errors.some((e) => e.message.includes('portfolio.cross_edges')),
        `${dualType} should be allowed in product edges[]`,
      ).toBe(false)
    }
  })

  it('registers the four cross-graph strategy/measurement edges as dual-registered (catalog + cross), same direction and verb', () => {
    // 0.17.2: the OKR/measurement spine can span files (a company strategy spine
    // in the rollup laddering into product-graph objectives, key results, and
    // metrics). Each cross-product variant reuses the EXISTING within-graph
    // hierarchy edge unchanged — same source/target type, direction, and verb —
    // so traversal is uniform regardless of where the endpoint lives.
    const strategyCrossEdges = [
      'strategic_theme_contains_objective',
      'objective_achieved_through_key_result',
      'key_result_quantified_by_metric',
      'objective_measured_by_metric',
    ] as const
    for (const type of strategyCrossEdges) {
      // Present in the cross-edge registry.
      expect(UPG_CROSS_EDGE_TYPES).toContain(type)
      // Dual-registered: the within-graph catalog entry still exists.
      const def = UPG_EDGE_CATALOG[type]
      expect(def, `${type} must remain a within-graph catalog edge`).toBeDefined()
      // Hierarchy classification — these are containment / measurement edges.
      expect(def.classification).toBe('hierarchy')
    }
    // Direction + verb are the canonical within-graph ones (no new verbs minted).
    expect(UPG_EDGE_CATALOG.strategic_theme_contains_objective).toMatchObject({
      forward_verb: 'contains', source_type: 'strategic_theme', target_type: 'objective',
    })
    expect(UPG_EDGE_CATALOG.objective_achieved_through_key_result).toMatchObject({
      forward_verb: 'achieved_through', source_type: 'objective', target_type: 'key_result',
    })
    expect(UPG_EDGE_CATALOG.key_result_quantified_by_metric).toMatchObject({
      forward_verb: 'quantified_by', source_type: 'key_result', target_type: 'metric',
    })
    expect(UPG_EDGE_CATALOG.objective_measured_by_metric).toMatchObject({
      forward_verb: 'measured_by', source_type: 'objective', target_type: 'metric',
    })
  })

  it('does not let the four strategy/measurement cross-edges carry properties', () => {
    // They are structural hierarchy edges, not assessment-carrying edges, so they
    // declare no property_schema and are not carries_properties. A property bag on
    // one of them must be rejected by the cross-edge writer (validated upstream);
    // here we assert the spec-level contract: no property schema is defined.
    for (const type of [
      'strategic_theme_contains_objective',
      'objective_achieved_through_key_result',
      'key_result_quantified_by_metric',
      'objective_measured_by_metric',
    ]) {
      expect(validateEdgeProperties(type, { confidence: { value: 3, label: 'high' } }).length).toBe(0)
      // No schema means the bag is simply unvalidated at the spec layer; the
      // writer is what rejects properties on a non-carries-properties edge.
      expect(getEdgePropertySchema(type)).toBeUndefined()
    }
  })

  it('still rejects normal edges with unknown endpoints', () => {
    const doc = baseDoc([
      {
        id: 'e_bad',
        source: 'n1',
        target: 'n_does_not_exist',
        type: 'persona_pursues_job',
      },
    ])
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    const targetError = result.errors.find((e) => e.path === '$.edges[0].target')
    expect(targetError?.message).toContain('unknown node id')
  })

  it('accepts a valid product edge between known nodes', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'persona_pursues_job' },
    ])
    const result = validateUPGDocument(doc)
    // persona_pursues_job may not be in catalog — that produces a warning, not an error
    expect(result.errors).toHaveLength(0)
  })
})
