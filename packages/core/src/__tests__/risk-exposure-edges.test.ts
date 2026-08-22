/**
 * 0.35.0 — the UCS edge-canon batch (Captain-ratified 2026-08-22).
 *
 * Five edges answering six manifest TODOs open since 2026-05-21. Two of the
 * packet's eight asks were already canon (`insight_evidenced_by_quote`,
 * `node_owned_by_stakeholder`) and one was derivable through the story rung,
 * so only five landed. This file pins each to its endpoints, verbs and
 * classification, plus the two `UPG_VALID_CHILDREN` companions, so a later
 * audit cannot silently delete or re-classify them.
 *
 * The polymorphic pair's registration is asserted in `spec-integrity.test.ts`
 * (count 28, sixteen families) and its collision in `edge-duplicate-gate`;
 * the scale half of the same release is in `get-property-default-scale`.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_EDGE_CATALOG,
  UPG_POLYMORPHIC_EDGE_KEYS,
  UPG_WILDCARD_ENDPOINT,
  isPolymorphicEdge,
  isRegisteredPolymorphicEdge,
  edgeCarriesProperties,
} from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'

type Catalog = typeof UPG_EDGE_CATALOG
const def = (key: string) => (UPG_EDGE_CATALOG as Record<string, Catalog[keyof Catalog]>)[key]

const EXPECTED = [
  {
    key: 'research_study_captures_quote',
    source: 'research_study', target: 'quote',
    forward: 'captures', reverse: 'captured_in',
    classification: 'hierarchy',
  },
  {
    key: 'feature_specified_by_user_story',
    source: 'feature', target: 'user_story',
    forward: 'specified_by', reverse: 'specifies',
    classification: 'hierarchy',
  },
  {
    key: 'stakeholder_invested_in_outcome',
    source: 'stakeholder', target: 'outcome',
    forward: 'invested_in', reverse: 'matters_to',
    classification: 'cross-domain',
  },
  {
    key: 'risk_threatens_node',
    source: 'risk', target: UPG_WILDCARD_ENDPOINT,
    forward: 'threatens', reverse: 'threatened_by',
    classification: 'cross-domain',
  },
  {
    key: 'risk_mitigated_by_node',
    source: 'risk', target: UPG_WILDCARD_ENDPOINT,
    forward: 'mitigated_by', reverse: 'mitigates',
    classification: 'cross-domain',
  },
] as const

describe('0.35.0 edge batch — shape', () => {
  for (const e of EXPECTED) {
    it(`${e.key} is ${e.source} -> ${e.target}, ${e.forward}/${e.reverse}, ${e.classification}`, () => {
      const d = def(e.key)
      expect(d, `${e.key} missing from UPG_EDGE_CATALOG`).toBeTruthy()
      expect(d.source_type).toBe(e.source)
      expect(d.target_type).toBe(e.target)
      expect(d.forward_verb).toBe(e.forward)
      expect(d.reverse_verb).toBe(e.reverse)
      expect(d.classification).toBe(e.classification)
    })
  }

  it('none of the five carries edge properties', () => {
    // Edges are verb-only outside the gated `carries_properties` set. B-3 in
    // particular was proposed as a scale-on-edge and ruled against: the stake
    // MAGNITUDE is `influence` / `interest` on the stakeholder itself.
    for (const e of EXPECTED) {
      expect(edgeCarriesProperties(e.key), `${e.key}`).toBe(false)
    }
  })
})

describe('0.35.0 edge batch — the risk-exposure family', () => {
  const RISK_EXPOSURE = ['risk_threatens_node', 'risk_mitigated_by_node'] as const

  it('both are polymorphic AND registered as such', () => {
    for (const key of RISK_EXPOSURE) {
      expect(isPolymorphicEdge(key as never), `${key} derived`).toBe(true)
      expect(isRegisteredPolymorphicEdge(key as never), `${key} registered`).toBe(true)
      expect(UPG_POLYMORPHIC_EDGE_KEYS).toContain(key)
    }
  })

  it('typed source, wildcard target — not the reverse', () => {
    // The construction matters: `risk` is always the source, so both edges
    // resolve from the risk card. A wildcard SOURCE would make them invisible
    // there, which is the P-I class the edge-prefix gate exists to catch.
    for (const key of RISK_EXPOSURE) {
      expect(def(key).source_type).toBe('risk')
      expect(def(key).target_type).toBe(UPG_WILDCARD_ENDPOINT)
    }
  })

  it('both are cross-domain, so containment is untouched', () => {
    // `cross-domain` keeps them out of UPG_VALID_CHILDREN and out of the
    // containment tree: a risk does not OWN what it threatens.
    for (const key of RISK_EXPOSURE) {
      expect(def(key).classification).toBe('cross-domain')
    }
    expect(UPG_VALID_CHILDREN.risk).toBeUndefined()
  })

  it('does not absorb the typed security-domain mitigation edge', () => {
    // `security_control_mitigates_threat` stays: it is the security-domain
    // typed edge, and this family is the product-risk generalisation.
    const sec = def('security_control_mitigates_threat')
    expect(sec).toBeTruthy()
    expect(sec.source_type).toBe('security_control')
    expect(sec.target_type).toBe('threat')
  })
})

describe('0.35.0 edge batch — hierarchy companions', () => {
  it('research_study accepts quote as a child', () => {
    expect(UPG_VALID_CHILDREN.research_study).toContain('quote')
  })

  it('feature accepts user_story as a child, alongside epic', () => {
    expect(UPG_VALID_CHILDREN.feature).toContain('user_story')
    expect(UPG_VALID_CHILDREN.epic).toContain('user_story')
  })

  it('quote keeps all three declared parents (multi-parent grammar)', () => {
    // observation = raw capture, insight = synthesis, research_study =
    // provenance. Per-INSTANCE parentage stays single via `parent_id`.
    expect(UPG_VALID_CHILDREN.observation).toContain('quote')
    expect(UPG_VALID_CHILDREN.insight).toContain('quote')
    expect(UPG_VALID_CHILDREN.research_study).toContain('quote')
  })

  it('acceptance_criterion is still reached only through user_story', () => {
    // B-7 was REJECTED as derivable: with the feature -> user_story rung the
    // path is feature -> user_story -> acceptance_criterion, and a direct
    // `feature_contains_acceptance_criterion` would be the duplicate-parent-
    // link verb ARCHITECTURE.md forbids.
    expect(UPG_VALID_CHILDREN.user_story).toContain('acceptance_criterion')
    expect(UPG_VALID_CHILDREN.feature).not.toContain('acceptance_criterion')
    expect(def('feature_contains_acceptance_criterion')).toBeUndefined()
  })
})

describe('0.35.0 edge batch — the two asks that were already canon', () => {
  it('insight_evidenced_by_quote answers B-1 (no new entity, no new edge)', () => {
    const d = def('insight_evidenced_by_quote')
    expect(d).toBeTruthy()
    expect(d.source_type).toBe('insight')
    expect(d.target_type).toBe('quote')
    // Classified `hierarchy`, so the UPG_VALID_CHILDREN pair must exist.
    expect(d.classification).toBe('hierarchy')
    expect(UPG_VALID_CHILDREN.insight).toContain('quote')
  })

  it('node_owned_by_stakeholder answers B-4 and retires risk_owned_by', () => {
    const d = def('node_owned_by_stakeholder')
    expect(d).toBeTruthy()
    expect(d.source_type).toBe(UPG_WILDCARD_ENDPOINT)
    expect(d.target_type).toBe('stakeholder')
    // The manifest keys these two asks wanted are NOT canon, deliberately.
    expect(def('stakeholder_owns_decision')).toBeUndefined()
    expect(def('risk_owned_by')).toBeUndefined()
  })
})
