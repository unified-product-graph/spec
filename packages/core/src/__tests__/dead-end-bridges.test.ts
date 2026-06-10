/**
 * F6 — Dead-end & Missing-bridge Pass
 *
 * The 36-domain wiring audit found pattern P-A (scored / synthesis / verdict
 * leaves with 0 outbound) and P-D (missing forward bridges). F6 adds outbound
 * bridge edges that close each confirmed dead-end or missing direction.
 *
 * This file is the regression guard: it pins every F6 edge's existence,
 * endpoints, and classification so a future catalog edit can't silently drop a
 * bridge and re-open a leaf.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'

type ClassifiedEdge = {
  key: string
  source: string
  target: string
  classification: 'hierarchy' | 'causal' | 'semantic' | 'cross-domain'
}

// The full F6 edge set: key, expected endpoints, expected classification.
const F6_EDGES: ClassifiedEdge[] = [
  // Priority 1 — both-sides-verified cross-domain bridges
  { key: 'data_classification_governed_by_privacy_policy', source: 'data_classification', target: 'privacy_policy', classification: 'cross-domain' },
  { key: 'design_component_conforms_to_a11y_standard', source: 'design_component', target: 'a11y_standard', classification: 'cross-domain' },
  { key: 'design_component_conforms_to_a11y_guideline', source: 'design_component', target: 'a11y_guideline', classification: 'cross-domain' },
  { key: 'feature_request_becomes_feature', source: 'feature_request', target: 'feature', classification: 'cross-domain' },
  { key: 'objective_advances_outcome', source: 'objective', target: 'outcome', classification: 'causal' },
  // Priority 2 — scored / synthesis / verdict dead-end leaves
  { key: 'desired_outcome_reveals_opportunity', source: 'desired_outcome', target: 'opportunity', classification: 'cross-domain' },
  { key: 'desired_outcome_quantified_by_metric', source: 'desired_outcome', target: 'metric', classification: 'cross-domain' },
  { key: 'feasibility_study_informs_decision', source: 'feasibility_study', target: 'decision', classification: 'cross-domain' },
  { key: 'feasibility_study_recommends_solution', source: 'feasibility_study', target: 'solution', classification: 'semantic' },
  { key: 'feasibility_study_produces_learning', source: 'feasibility_study', target: 'learning', classification: 'cross-domain' },
  { key: 'design_sprint_informs_decision', source: 'design_sprint', target: 'decision', classification: 'cross-domain' },
  { key: 'design_sprint_recommends_solution', source: 'design_sprint', target: 'solution', classification: 'semantic' },
  { key: 'design_sprint_produces_learning', source: 'design_sprint', target: 'learning', classification: 'cross-domain' },
  { key: 'affinity_cluster_groups_observation', source: 'affinity_cluster', target: 'observation', classification: 'hierarchy' },
  { key: 'feedback_theme_reveals_opportunity', source: 'feedback_theme', target: 'opportunity', classification: 'cross-domain' },
  { key: 'competitor_feature_benchmarks_capability', source: 'competitor_feature', target: 'capability', classification: 'cross-domain' },
  { key: 'switching_cost_locks_in_competitor', source: 'switching_cost', target: 'competitor', classification: 'cross-domain' },
  // Region tail
  { key: 'test_result_reports_bug', source: 'test_result', target: 'bug', classification: 'cross-domain' },
  { key: 'content_piece_repurposed_as_social_post', source: 'content_piece', target: 'social_post', classification: 'cross-domain' },
  { key: 'translation_key_localises_content_piece', source: 'translation_key', target: 'content_piece', classification: 'cross-domain' },
  { key: 'translation_key_targets_locale', source: 'translation_key', target: 'locale', classification: 'semantic' },
  { key: 'partner_revenue_share_feeds_revenue_stream', source: 'partner_revenue_share', target: 'revenue_stream', classification: 'cross-domain' },
  { key: 'retrospective_produces_learning', source: 'retrospective', target: 'learning', classification: 'cross-domain' },
  { key: 'retrospective_yields_decision', source: 'retrospective', target: 'decision', classification: 'cross-domain' },
  { key: 'status_report_reports_on_milestone', source: 'status_report', target: 'milestone', classification: 'semantic' },
  { key: 'quote_document_advances_deal', source: 'quote_document', target: 'deal', classification: 'causal' },
  { key: 'data_quality_rule_governs_data_source', source: 'data_quality_rule', target: 'data_source', classification: 'semantic' },
  { key: 'press_release_announces_launch', source: 'press_release', target: 'launch', classification: 'cross-domain' },
]

const catalog = UPG_EDGE_CATALOG as Record<string, { source_type: string; target_type: string; classification: string; forward_verb: string; reverse_verb: string }>

describe('F6 dead-end bridge edges', () => {
  for (const e of F6_EDGES) {
    describe(e.key, () => {
      it('exists with the expected endpoints and classification', () => {
        const def = catalog[e.key]
        expect(def, `${e.key} must exist in UPG_EDGE_CATALOG`).toBeDefined()
        expect(def.source_type).toBe(e.source)
        expect(def.target_type).toBe(e.target)
        expect(def.classification).toBe(e.classification)
      })

      it('key begins with its source_type as a whole token (F2 prefix rule)', () => {
        expect(e.key === e.source || e.key.startsWith(`${e.source}_`)).toBe(true)
      })

      it('carries both a forward and reverse verb', () => {
        const def = catalog[e.key]
        expect(def.forward_verb.length).toBeGreaterThan(0)
        expect(def.reverse_verb.length).toBeGreaterThan(0)
      })
    })
  }

  it('no two F6 edges share a source→target pair (F3 dup rule)', () => {
    const seen = new Set<string>()
    for (const e of F6_EDGES) {
      const pair = `${e.source}->${e.target}`
      expect(seen.has(pair), `duplicate F6 pair: ${pair}`).toBe(false)
      seen.add(pair)
    }
  })

  it('no F6 source→target pair duplicates a pre-existing catalog pair', () => {
    // Build the pair multiset excluding the F6 keys themselves, then assert
    // each F6 pair appears exactly once overall (i.e. F6 introduced no dup).
    const f6Keys = new Set(F6_EDGES.map((e) => e.key))
    const priorPairs = new Set<string>()
    for (const [key, def] of Object.entries(catalog)) {
      if (f6Keys.has(key)) continue
      priorPairs.add(`${def.source_type}->${def.target_type}`)
    }
    const collisions = F6_EDGES.filter((e) => priorPairs.has(`${e.source}->${e.target}`))
    expect(collisions.map((c) => `${c.source}->${c.target}`)).toEqual([])
  })

  it('the affinity_cluster→observation hierarchy edge has a matching UPG_VALID_CHILDREN entry', () => {
    expect(UPG_VALID_CHILDREN['affinity_cluster']).toContain('observation')
  })
})
