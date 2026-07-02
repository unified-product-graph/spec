/**
 * Research provenance — v0.17.5 (additive, non-breaking)
 *
 * Two provenance gaps in the user_research domain closed:
 *
 *   #1  Per-moment source locators. `quote`, `participant`, and `observation`
 *       each gain an optional `source_url` — a stable deep-link to the exact
 *       moment in the originating recording/transcript. Modeled as the
 *       canonical rot-prone external pointer: a plain string tagged
 *       `modifier: 'volatile'` (the property-fit convention, not a validator).
 *
 *   #2  The graph-owned synthesis `document` is walkable to the evidence it
 *       sourced, extending the existing `document_contains_*` family:
 *         - document_contains_quote        (document → quote · semantic · within-graph)
 *         - document_contains_observation  (document → observation · semantic · within-graph)
 *       Within-graph containment (the doc and its evidence co-reside), so
 *       NEITHER is cross_product_eligible — mirroring document_contains_insight.
 *
 *   #3  A `Study conflation` anti-pattern on the user_research domain guide.
 *
 * Participant intentionally gets `source_url` only, NO document edge: a
 * participant is a research subject, not an artifact a synthesis document
 * extracts and contains. Its provenance is the external recording deep-link
 * plus the existing study-membership edge.
 *
 * Run: npx vitest run src/__tests__/research-provenance.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG, isCrossProductEligible } from '../catalog/edge-catalog.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import { getGuideForDomain } from '../intelligence/domain-guides.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_EDGE_PAIR_MAP, resolveContainmentEdge } from '../index.js'

// ─── #1: source_url per-moment locators ──────────────────────────────────────

describe('#1 — source_url exists on quote / participant / observation as a volatile string', () => {
  for (const entity of ['quote', 'participant', 'observation'] as const) {
    it(`${entity}.source_url is an optional volatile string property`, () => {
      const prop = UPG_PROPERTY_SCHEMA[entity].source_url
      expect(prop, `${entity} is missing source_url`).toBeDefined()
      expect(prop.type).toBe('string')
      // The rot-prone-pointer keystone: source_url must carry modifier 'volatile'.
      // A naive property-schema regeneration strips these annotations, so this
      // assertion is the guard against that regression.
      expect(prop.modifier).toBe('volatile')
    })
  }

  it('observation keeps session_ref (the opaque session-id convenience field) alongside source_url', () => {
    // source_url is a per-moment URL locator; session_ref is a distinct opaque
    // session ID retained as an AI-inference context anchor. Both coexist.
    expect(UPG_PROPERTY_SCHEMA.observation.session_ref).toBeDefined()
    expect(UPG_PROPERTY_SCHEMA.observation.source_url).toBeDefined()
  })
})

// ─── #2: document_contains_{quote,observation} ───────────────────────────────

describe('#2 — document_contains_quote / document_contains_observation', () => {
  for (const [edge, target] of [
    ['document_contains_quote', 'quote'],
    ['document_contains_observation', 'observation'],
  ] as const) {
    it(`${edge} exists with the document_contains_* family shape`, () => {
      const def = UPG_EDGE_CATALOG[edge]
      expect(def).toBeDefined()
      expect(def.source_type).toBe('document')
      expect(def.target_type).toBe(target)
      expect(def.forward_verb).toBe('contains')
      expect(def.reverse_verb).toBe('contained_in')
      expect(def.classification).toBe('semantic')
    })

    it(`${edge} is within-graph containment: NOT cross_product_eligible`, () => {
      // The document and the evidence it contains co-reside in one graph, so
      // this must never enter the cross-product registry.
      expect((UPG_EDGE_CATALOG[edge] as { cross_product_eligible?: true }).cross_product_eligible).toBeUndefined()
      expect(isCrossProductEligible(edge)).toBe(false)
      expect(UPG_CROSS_EDGE_TYPES).not.toContain(edge)
    })

    it(`${edge} matches the existing document_contains_insight shape exactly`, () => {
      const mine = UPG_EDGE_CATALOG[edge]
      const model = UPG_EDGE_CATALOG.document_contains_insight
      expect(mine.forward_verb).toBe(model.forward_verb)
      expect(mine.reverse_verb).toBe(model.reverse_verb)
      expect(mine.classification).toBe(model.classification)
      expect(mine.source_type).toBe(model.source_type)
    })
  }

  it('both edges index their document → target pair like document_contains_insight', () => {
    expect(UPG_EDGE_PAIR_MAP['document:quote']).toContain('document_contains_quote')
    expect(UPG_EDGE_PAIR_MAP['document:observation']).toContain('document_contains_observation')
  })

  it('are semantic reference edges, NOT hierarchy: they do not re-parent quote/observation under document', () => {
    // Mirrors document_contains_insight: a semantic `contains` edge does not
    // make the target a tree child of document.
    expect(UPG_VALID_CHILDREN.document ?? []).not.toContain('insight')
    expect(UPG_VALID_CHILDREN.document ?? []).not.toContain('quote')
    expect(UPG_VALID_CHILDREN.document ?? []).not.toContain('observation')
  })

  it('resolveContainmentEdge picks them for the document → target pair, as with insight', () => {
    expect(resolveContainmentEdge('document', 'quote')).toBe('document_contains_quote')
    expect(resolveContainmentEdge('document', 'observation')).toBe('document_contains_observation')
  })

  it('participant gets NO document edge (subject, not an extracted artifact)', () => {
    expect('document_contains_participant' in UPG_EDGE_CATALOG).toBe(false)
    expect('document_describes_participant' in UPG_EDGE_CATALOG).toBe(false)
  })
})

// ─── #3: Study conflation anti-pattern ───────────────────────────────────────

describe('#3 — Study conflation anti-pattern on the user_research guide', () => {
  const guide = getGuideForDomain('user_research')

  it('the user_research guide is registered', () => {
    expect(guide).toBeDefined()
  })

  it('carries a Study conflation anti-pattern scoped to research_study', () => {
    const ap = guide!.anti_patterns.find((a) => a.name === 'Study conflation')
    expect(ap, 'Study conflation anti-pattern is missing').toBeDefined()
    expect(ap!.affected_entity).toBe('research_study')
    expect(ap!.description).toContain('different stated goals')
    expect(ap!.description).toContain('research_study')
    expect(ap!.remediation).toContain('original')
  })
})
