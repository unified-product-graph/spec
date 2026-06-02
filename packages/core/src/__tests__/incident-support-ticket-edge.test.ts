/**
 * incident → support_ticket edge — v0.8.2
 *
 * A single canonical edge addition that closes the "Customer Support" island in
 * `playbook:operations-quality`. Before this edge, `support_ticket` /
 * `knowledge_base_article` had no canonical link to the incident/ops spine, so
 * the step was a structural island no matter the authoring order.
 *
 * ITIL/ITSM incident management explicitly links an incident to the support
 * tickets/cases it spawns (incident = cause, ticket = effect). Anchored, HIGH.
 *
 * Run: npx vitest run src/__tests__/incident-support-ticket-edge.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_EDGE_PAIR_MAP, resolveAllEdges, pickCanonicalEdge } from '../index.js'

describe(' — incident → support_ticket', () => {
  it('incident_generates_support_ticket exists in UPG_EDGE_CATALOG with the right shape', () => {
    const def = UPG_EDGE_CATALOG.incident_generates_support_ticket
    expect(def).toBeDefined()
    expect(def.source_type).toBe('incident')
    expect(def.target_type).toBe('support_ticket')
    expect(def.classification).toBe('cross-domain')
    expect(def.forward_verb).toBe('generates')
    expect(def.reverse_verb).toBe('generated_by')
  })

  it('UPG_EDGE_PAIR_MAP indexes the incident → support_ticket pair', () => {
    expect(UPG_EDGE_PAIR_MAP['incident:support_ticket']).toContain(
      'incident_generates_support_ticket',
    )
  })

  it('resolve_edge_for_pair (resolveAllEdges) for (incident, support_ticket) resolves to the new edge', () => {
    expect(resolveAllEdges('incident', 'support_ticket')).toContain(
      'incident_generates_support_ticket',
    )
  })

  it('pickCanonicalEdge("incident","support_ticket") returns the new edge', () => {
    expect(pickCanonicalEdge('incident', 'support_ticket')).toBe(
      'incident_generates_support_ticket',
    )
  })
})
