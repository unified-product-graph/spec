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
import { UPG_CROSS_EDGE_TYPES, UPG_CROSS_ONLY_EDGE_TYPES } from '../shapes/document.js'
import { UPG_EDGE_CATALOG, getEdgePropertySchema, UPG_CROSS_ELIGIBLE_CATALOG_EDGE_TYPES, isCrossProductEligible, type UPGEdgeDefinition } from '../catalog/edge-catalog.js'
import { validateEdgeProperties } from '../properties/edge-property-validation.js'
import { crossProductScope, isCrossCapable, isCuratedCrossEligible } from '../grammar/cross-scope.js'
import { UPG_PORTFOLIO_SHARED_TYPES, isPortfolioSharedType } from '../registry/entity-meta.js'

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

// The 0.17.2 baseline: the 41 cross-product edge types that existed before the
// whitelist became DERIVED (0.17.3). The derived set MUST stay a superset of this
// frozen snapshot — the change is purely additive, so no blessed type may drop.
const BASELINE_41 = [
  'shares_persona', 'shares_competitor', 'shares_metric', 'depends_on_product',
  'cannibalises', 'succeeds', 'hosts', 'contributes_to', 'instance_of',
  'area_serves_persona', 'area_targets_market_segment', 'rolls_up_to',
  'product_implements_specification', 'product_exposes_specification',
  'feature_conforms_to_specification', 'api_contract_speaks_specification',
  'product_exposes_primitive', 'feature_manipulates_primitive',
  'primitive_stored_as_data_type', 'feature_rivals_competitor_feature',
  'competitor_signal_maps_to_feature', 'competitor_signal_surfaces_opportunity',
  'competitor_classified_as_classification_value', 'node_classified_as_classification_value',
  'journey_phase_realises_operating_stage', 'screen_markets_product',
  'screen_renders_design_component', 'product_expresses_brand_identity', 'shares_job',
  'shares_need', 'persona_delegates_to_persona', 'screen_targets_competitor',
  'feature_surfaces_product', 'feature_uses_design_component', 'product_implements_design_system',
  'node_owned_by_team', 'node_owned_by_department', 'strategic_theme_contains_objective',
  'objective_achieved_through_key_result', 'key_result_quantified_by_metric',
  'objective_measured_by_metric',
] as const

describe('cross-product edge validation', () => {
  it('the derived whitelist is a superset of the frozen 0.17.2 baseline of 41 types', () => {
    expect(BASELINE_41).toHaveLength(41)
    const set = new Set<string>(UPG_CROSS_EDGE_TYPES)
    for (const t of BASELINE_41) {
      expect(set.has(t), `baseline cross-edge type ${t} dropped from the derived whitelist`).toBe(true)
    }
    // Additive by design: never fewer than the baseline.
    expect(UPG_CROSS_EDGE_TYPES.length).toBeGreaterThanOrEqual(BASELINE_41.length)
  })

  it('composes cross-only + catalog-derived with no duplicates and disjoint tiers', () => {
    const dupes = UPG_CROSS_EDGE_TYPES.filter((t, i, a) => a.indexOf(t) !== i)
    expect(dupes, `duplicate cross-edge types: ${dupes.join(', ')}`).toEqual([])
    // Disjoint tiers: a portfolio-native type has NO catalog entry; a derived type has one.
    const catalogTypes = new Set(Object.keys(UPG_EDGE_CATALOG))
    for (const t of UPG_CROSS_ONLY_EDGE_TYPES) {
      expect(catalogTypes.has(t), `${t} is cross-only but has a catalog entry`).toBe(false)
    }
    for (const t of UPG_CROSS_ELIGIBLE_CATALOG_EDGE_TYPES) {
      expect(catalogTypes.has(t), `${t} is catalog-derived but missing its catalog entry`).toBe(true)
    }
    expect(UPG_CROSS_EDGE_TYPES.length).toBe(
      UPG_CROSS_ONLY_EDGE_TYPES.length + UPG_CROSS_ELIGIBLE_CATALOG_EDGE_TYPES.length,
    )
  })

  it('the catalog-derived half is exactly the entries flagged cross_product_eligible', () => {
    const flagged = Object.keys(UPG_EDGE_CATALOG).filter((k) => isCrossProductEligible(k)).sort()
    expect([...UPG_CROSS_ELIGIBLE_CATALOG_EDGE_TYPES].sort()).toEqual(flagged)
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

// ── 3-state cross-product derivation (0.18.0) ─────────────────────────────────
// The write surface is now curated (allow) / provisional (allow + warn) /
// resident (reject), derived from `EntityTypeMeta.portfolio_shared`. The DERIVATION
// itself is a separate predicate from the canonical `UPG_CROSS_EDGE_TYPES` set — it
// only grows when a `cross_product_eligible` flag or a portfolio-native type is
// added (61 as of 0.20.1's two new G6 seam-edge flags), never as a side effect of
// this 3-state logic.

// The ratified portfolio-shared set (0.18.0): capability +
// market_segment + classification_axis IN, design_token OUT. 0.20.0 added
// planning_cycle (a coarse cadence interval is an org-shared node). Snapshot-guarded
// so adding or removing a shared tag is a deliberate, reviewed change.
const EXPECTED_PORTFOLIO_SHARED_TYPES = [
  'brand_identity', 'capability', 'classification_axis', 'classification_value',
  'competitor', 'competitor_feature', 'competitor_signal', 'department', 'dependency',
  'design_component', 'design_system', 'initiative', 'key_result', 'market_segment',
  'metric', 'mission', 'objective', 'operating_lifecycle', 'operating_stage', 'outcome',
  'planning_cycle',
  'primitive', 'specification', 'strategic_pillar', 'strategic_theme', 'team', 'vision',
].sort()

// The 3 curated edges whose endpoints are NOT portfolio-shared, so they ride on the
// explicit curated flag, not the gate. (screen/feature → product where a product is
// referenced cross-graph, and persona → persona peer delegation.)
const CURATED_GATE_EXCEPTIONS = [
  'feature_surfaces_product', 'persona_delegates_to_persona', 'screen_markets_product',
].sort()

describe('cross-product 3-state derivation (0.18.0)', () => {
  it('the portfolio_shared entity-type set matches the ratified 27-name snapshot', () => {
    expect(UPG_PORTFOLIO_SHARED_TYPES).toHaveLength(27)
    expect([...UPG_PORTFOLIO_SHARED_TYPES].sort()).toEqual(EXPECTED_PORTFOLIO_SHARED_TYPES)
  })

  it('every curated cross type classifies as scope "curated" (canonical 62 as of 0.23.1)', () => {
    expect(UPG_CROSS_EDGE_TYPES).toHaveLength(62)
    for (const t of UPG_CROSS_EDGE_TYPES) {
      expect(crossProductScope(t), `${t} should classify as curated`).toBe('curated')
      expect(isCuratedCrossEligible(t), `${t} should be curated-eligible`).toBe(true)
    }
  })

  it('the gate covers every curated catalog edge EXCEPT exactly the 3 gate-exceptions', () => {
    const exceptions = Object.keys(UPG_EDGE_CATALOG)
      .filter((k) => isCuratedCrossEligible(k))
      .filter((k) => {
        const def = (UPG_EDGE_CATALOG as Record<string, UPGEdgeDefinition>)[k]
        return !isCrossCapable(def.source_type, def.target_type)
      })
      .sort()
    expect(exceptions).toEqual(CURATED_GATE_EXCEPTIONS)
  })

  it('resident internal edges stay resident — the containment guardrail (both endpoints non-shared)', () => {
    const residentInternal = [
      'persona_pursues_job',
      'persona_experiences_need',
      'persona_aspires_to_desired_outcome',
      'product_holds_assumption',
    ]
    for (const t of residentInternal) {
      // Must be a real catalog edge, so a typo cannot masquerade as "resident".
      expect(UPG_EDGE_CATALOG[t as keyof typeof UPG_EDGE_CATALOG], `${t} must exist in the catalog`).toBeDefined()
      expect(crossProductScope(t), `${t} must be resident (hard-rejected cross-product)`).toBe('resident')
    }
    // Echoable-not-resident: persona is shareable via `shares_persona` (portfolio-native)
    // yet is NOT portfolio_shared, so its internal edges stay in-graph.
    expect(isPortfolioSharedType('persona')).toBe(false)
    expect(isPortfolioSharedType('job')).toBe(false)
    expect(isPortfolioSharedType('need')).toBe(false)
    expect(isPortfolioSharedType('product')).toBe(false)
  })

  it('an unflagged catalog edge touching a shared type is provisional (not resident, not curated)', () => {
    // metric is portfolio_shared → experiment_run_measures_metric passes the gate but
    // is not curated, so it is allowed with a warning at the write surface.
    expect(UPG_EDGE_CATALOG.experiment_run_measures_metric).toBeDefined()
    expect(crossProductScope('experiment_run_measures_metric')).toBe('provisional')
    expect(isCuratedCrossEligible('experiment_run_measures_metric')).toBe(false)
  })

  it('an unknown / non-catalog edge type is resident (default-deny)', () => {
    expect(crossProductScope('not_a_real_edge_type')).toBe('resident')
  })
})
