/**
 * UPG Spec Completeness Audit — Regression Test
 *
 * Inline re-implementation of the audit categories defined in
 * `scripts/audit-completeness.ts`. Re-implemented here (not imported)
 * because the script also writes Markdown and parses CLI flags — the
 * test only needs the structural assertions.
 *
 * Categories mirror:
 *
 *   G1 — Hierarchy orphans:
 *        Active entity types in `UPG_ENTITY_META` that appear in neither
 *        side of `UPG_VALID_CHILDREN` (not a parent, not a child of any
 *        parent). These types are unreachable through containment.
 *
 *   G2 — Edge gaps:
 *        Active types with neither outbound nor inbound entries in
 *        `UPG_EDGE_CATALOG`, AND every `UPG_VALID_CHILDREN` pair must
 *        have at least one corresponding edge in the catalog.
 *
 *   G3 — Property-schema gaps:
 *        Active types with no entry in `UPG_PROPERTY_SCHEMA`. (This is
 *        auto-generated from `properties/domains/*.ts` — a missing entry
 *        means there is no `*Properties` interface for that type.)
 *
 *   G4 — Catalog/registry desync:
 *        Edges in `UPG_EDGE_CATALOG` whose `source_type` or `target_type`
 *        is not a known type in `UPG_ENTITY_META` (and is not the
 *        polymorphic `'node'` wildcard).
 *
 * G5 (pair-resolver collisions) is reported by the audit script but is
 * NOT a regression gate yet — collisions are sometimes intentional (e.g.
 * the genuinely-distinct metric→metric verbs `measures` / `guards` / `drives`).
 * The byte-identical and near-synonym shadows were collapsed in; the
 * remaining collisions are deliberate near-synonyms with distinct verbs.
 *
 * Run:
 *   npx vitest run src/__tests__/audit-completeness.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_ENTITY_META } from '../registry/entity-meta.js'
import { UPG_VALID_CHILDREN, UPG_CONTAINMENT_FREE_TYPES } from '../grammar/hierarchy.js'
import {
  UPG_EDGE_CATALOG,
  UPG_WILDCARD_ENDPOINT,
} from '../catalog/edge-catalog.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

const ACTIVE_TYPES = new Set(
  UPG_ENTITY_META
    .filter((m) => m.maturity === 'stable' || m.maturity === 'proposed')
    .map((m) => m.name),
)

const ALL_META_TYPES = new Set(UPG_ENTITY_META.map((m) => m.name))

const outboundByType: Record<string, string[]> = {}
const inboundByType: Record<string, string[]> = {}
const edgePairs = new Set<string>()

const CATALOG_ENTRIES = Object.entries(UPG_EDGE_CATALOG) as Array<
  [
    string,
    {
      source_type: string
      target_type: string
    },
  ]
>

for (const [key, edge] of CATALOG_ENTRIES) {
  ;(outboundByType[edge.source_type] ??= []).push(key)
  ;(inboundByType[edge.target_type] ??= []).push(key)
  edgePairs.add(`${edge.source_type}::${edge.target_type}`)
}

const parentsOfChild: Record<string, string[]> = {}
for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
  for (const c of children) {
    ;(parentsOfChild[c] ??= []).push(parent)
  }
}

describe('Spec completeness regression', () => {
  it('G1 — every active type is reachable via UPG_VALID_CHILDREN (as parent or child), unless containment-free', () => {
    // Containment-free types (UPG_CONTAINMENT_FREE_TYPES) deliberately have no
    // structural parent — they are referenced via edges instead. They are
    // exempt from G1 by design. See grammar/hierarchy.ts for the rationale.
    const orphans: string[] = []
    for (const type of ACTIVE_TYPES) {
      if (UPG_CONTAINMENT_FREE_TYPES.has(type)) continue
      const isParent = type in UPG_VALID_CHILDREN
      const isChild = type in parentsOfChild
      if (!isParent && !isChild) orphans.push(type)
    }
    expect(
      orphans,
      `Active types absent from UPG_VALID_CHILDREN as both parent and child: ${orphans.join(', ')}`,
    ).toEqual([])
  })

  it('G2a — every active type has at least one inbound or outbound edge', () => {
    const isolated: string[] = []
    for (const type of ACTIVE_TYPES) {
      const hasOut = (outboundByType[type] ?? []).length > 0
      const hasIn = (inboundByType[type] ?? []).length > 0
      if (!hasOut && !hasIn) isolated.push(type)
    }
    expect(
      isolated,
      `Active types with zero inbound + zero outbound edges: ${isolated.join(', ')}`,
    ).toEqual([])
  })

  it('G2b — every UPG_VALID_CHILDREN (parent, child) pair has a matching edge in UPG_EDGE_CATALOG', () => {
    const missing: string[] = []
    for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
      for (const child of children) {
        if (!edgePairs.has(`${parent}::${child}`)) {
          missing.push(`${parent} -> ${child}`)
        }
      }
    }
    expect(
      missing,
      `Hierarchy pairs without a matching edge:\n  ${missing.join('\n  ')}`,
    ).toEqual([])
  })

  it('G3 — every active type has an entry in UPG_PROPERTY_SCHEMA', () => {
    const propertyTypes = new Set(Object.keys(UPG_PROPERTY_SCHEMA))
    const missing: string[] = []
    for (const type of ACTIVE_TYPES) {
      if (!propertyTypes.has(type)) missing.push(type)
    }
    expect(
      missing,
      `Active types without UPG_PROPERTY_SCHEMA entry: ${missing.join(', ')}`,
    ).toEqual([])
  })

  it('G4 — every edge endpoint is a known type (or the polymorphic wildcard)', () => {
    const bad: string[] = []
    for (const [key, edge] of CATALOG_ENTRIES) {
      for (const endpoint of ['source_type', 'target_type'] as const) {
        const t = edge[endpoint]
        if (t === UPG_WILDCARD_ENDPOINT) continue
        if (!ALL_META_TYPES.has(t)) {
          bad.push(`${key} (${endpoint}=${t})`)
        }
      }
    }
    expect(
      bad,
      `Edges referencing unknown types: ${bad.join(', ')}`,
    ).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// v0.4.1 — Cross-domain edge clusters
//   Wave 4 stress-test (2026-05-16) surfaced 9 genuinely-missing cross-domain
//   edges across 4 clusters. This block pins each newly-added edge to its
//   expected endpoints and classification so future audits cannot silently
//   delete or re-classify them. Clusters E (brand_logo / brand_imagery
//   containment) and F (DesignSystem → Component) were already complete in
//   v0.4.0 — those rejections were Entopo runtime-snapshot drift, not gaps.
// ─────────────────────────────────────────────────────────────────────────────

const EXPECTED_V041_EDGES: Array<{
  key: string
  source: string
  target: string
  classification: 'hierarchy' | 'causal' | 'semantic' | 'cross-domain'
  cluster: 'A' | 'B' | 'C' | 'D'
}> = [
  // Cluster A — Testing → Bug
  { key: 'regression_test_addresses_bug', source: 'regression_test', target: 'bug', classification: 'cross-domain', cluster: 'A' },
  // Cluster B — DevOps cross-domain
  { key: 'incident_affects_feature', source: 'incident', target: 'feature', classification: 'cross-domain', cluster: 'B' },
  { key: 'release_strategy_used_by_deployment', source: 'release_strategy', target: 'deployment', classification: 'cross-domain', cluster: 'B' },
  // Cluster C — User Research linkage matrix
  { key: 'participant_voiced_quote', source: 'participant', target: 'quote', classification: 'cross-domain', cluster: 'C' },
  { key: 'research_question_addressed_by_insight', source: 'research_question', target: 'insight', classification: 'cross-domain', cluster: 'C' },
  { key: 'survey_response_evidences_insight', source: 'survey_response', target: 'insight', classification: 'cross-domain', cluster: 'C' },
  // Cluster D — Engineering finishing touches
  { key: 'feature_flag_gates_feature', source: 'feature_flag', target: 'feature', classification: 'cross-domain', cluster: 'D' },
  { key: 'data_model_persisted_in_database_schema', source: 'data_model', target: 'database_schema', classification: 'cross-domain', cluster: 'D' },
  { key: 'read_model_projects_aggregate', source: 'read_model', target: 'aggregate', classification: 'cross-domain', cluster: 'D' },
]

describe('V0.4.1 — cross-domain edge clusters', () => {
  for (const expected of EXPECTED_V041_EDGES) {
    it(`Cluster ${expected.cluster} — ${expected.key} (${expected.source} → ${expected.target}, ${expected.classification})`, () => {
      const def = (UPG_EDGE_CATALOG as Record<string, { source_type: string; target_type: string; classification: string }>)[expected.key]
      expect(def, `Edge ${expected.key} missing from UPG_EDGE_CATALOG`).toBeDefined()
      expect(def.source_type).toBe(expected.source)
      expect(def.target_type).toBe(expected.target)
      expect(def.classification).toBe(expected.classification)
    })
  }
})
