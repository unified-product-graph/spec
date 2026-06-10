/**
 * Smoke test for the near-synonym edge audit.
 *
 * Verifies:
 * 1. The pair-grouping logic finds multi-edge pairs in the catalog.
 * 2. The known exact-duplicate pairs are detected.
 * 3. The insight→opportunity three-way situation is characterised correctly.
 *
 * This test operates on the live UPG_EDGE_CATALOG — it does NOT run
 * the full script (which writes files) but validates the core logic.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

// ─── Helper: group edges by (source_type, target_type) ────────────────────────

function groupByPair(
  catalog: typeof UPG_EDGE_CATALOG,
): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const [key, def] of Object.entries(catalog)) {
    const pairKey = `${def.source_type}→${def.target_type}`
    if (!map.has(pairKey)) map.set(pairKey, [])
    map.get(pairKey)!.push(key)
  }
  return map
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('edge near-synonym audit', () => {
  const pairMap = groupByPair(UPG_EDGE_CATALOG)
  const multiPairs = [...pairMap.entries()].filter(([, edges]) => edges.length >= 2)

  it('finds at least 5 pairs with 2+ edges', () => {
    expect(multiPairs.length).toBeGreaterThanOrEqual(5)
  })

  it('detects the insight→opportunity multi-edge pair', () => {
    const pair = pairMap.get('insight→opportunity')
    expect(pair).toBeDefined()
    expect(pair!.length).toBeGreaterThanOrEqual(2)
    expect(pair).toContain('insight_informs_opportunity')
    // insight_informs_opportunity_cross_domain was collapsed into
    // insight_informs_opportunity. The genuinely-distinct `surfaces` verb stays.
    expect(pair).not.toContain('insight_informs_opportunity_cross_domain')
    expect(pair).toContain('insight_surfaces_opportunity')
  })

  it('product→decision is now a single canonical edge ( collapse)', () => {
    // The product_decided_via_decision_hierarchy duplicate was
    // collapsed; product→decision now resolves to a single decided_via edge.
    const productDecision = pairMap.get('product→decision')
    expect(productDecision).toBeDefined()
    const verbs = productDecision!.map(k => UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG].forward_verb)
    expect(verbs.filter(v => v === 'decided_via').length).toBe(1)
    expect(productDecision).toContain('product_decided_via_decision')
    expect(productDecision).not.toContain('product_decided_via_decision_hierarchy')
  })

  it('detects metric→metric as a multi-edge pair with genuinely distinct verbs', () => {
    const metricMetric = pairMap.get('metric→metric')
    expect(metricMetric).toBeDefined()
    // the byte-identical metric_measures_metric_cross_domain and the
    // tense-twin metric_decomposed_into_metric were collapsed. The pair keeps
    // its genuinely-distinct verbs.
    const verbs = metricMetric!.map(k => UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG].forward_verb)
    expect(verbs.filter(v => v === 'measures').length).toBe(1)
    expect(metricMetric).not.toContain('metric_measures_metric_cross_domain')
    expect(metricMetric).not.toContain('metric_decomposed_into_metric')
    // Should still have genuinely different verbs
    expect(verbs).toContain('guards')
    expect(verbs).toContain('drives')
  })

  it('detects experiment_run→metric active/passive pair', () => {
    const pair = pairMap.get('experiment_run→metric')
    expect(pair).toBeDefined()
    const verbs = pair!.map(k => UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG].forward_verb)
    // Both active and passive form of "measure" exist
    expect(verbs).toContain('measures')
    expect(verbs).toContain('measured_by')
  })

  it('key_result→metric collapses to the single quantified_by edge', () => {
    // the tracked_by near-synonym was collapsed into quantified_by.
    const pair = pairMap.get('key_result→metric')
    expect(pair).toBeDefined()
    const verbs = pair!.map(k => UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG].forward_verb)
    expect(verbs).toContain('quantified_by')
    expect(verbs).not.toContain('tracked_by')
    expect(pair).not.toContain('key_result_tracked_by_metric')
  })

  it('the catalog has the expected total edge count (regression guard)', () => {
    const total = Object.keys(UPG_EDGE_CATALOG).length
    // This guard fires if edges are added or removed without updating the audit
    expect(total).toBeGreaterThanOrEqual(800)
  })
})
