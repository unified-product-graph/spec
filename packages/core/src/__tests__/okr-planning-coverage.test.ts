/**
 * OKR planning coverage — v0.17.4
 *
 * Reconciling the strategy graph against a live, independently-authored planning
 * doc surfaced texture the objective — the node every OKR doc organises itself
 * around — could not reach. This batch closes two of those gaps:
 *
 *   #1  objective ↔ dependency (cross-team dependency tracking on objectives)
 *         - objective_depends_on_dependency   (strategy → team_org · cross-domain · cross-product)
 *         - dependency_blocks_objective        (team_org → strategy · cross-domain · cross-product)
 *
 *   #2  strategic_question (new entity, strategy domain) — the strategy-domain
 *       sibling of research_question / design_question, completing the triad.
 *         - objective_raises_strategic_question   (hierarchy · within-graph)
 *         - initiative_raises_strategic_question  (hierarchy · within-graph)
 *
 *   #3  the defer / out-of-scope edge — an objective points at the real feature
 *       or capability it parks for later, carrying a `deferred_to` period.
 *         - objective_defers_feature     (strategy → product_spec · cross-domain · cross-product)
 *         - objective_defers_capability  (intra-strategy · semantic · cross-product)
 *
 * Run: npx vitest run src/__tests__/okr-planning-coverage.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG, isCrossProductEligible, getEdgePropertySchema, DEFER_EDGE_PROPERTY_SCHEMA, isDeliberateOnlyEdge, UPG_DELIBERATE_ONLY_EDGE_TYPES } from '../catalog/edge-catalog.js'
import { validateEdgeProperties } from '../properties/edge-property-validation.js'
import { UPG_EDGE_PAIR_MAP, resolveContainmentEdge } from '../index.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_ACTIVE_TYPES, UPG_ENTITY_META_BY_NAME } from '../registry/entity-meta.js'
import { getDomainIdForType } from '../registry/domains.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_LIFECYCLES } from '../grammar/lifecycles.js'
import { ENTITY_EMOJI } from '../presentation/entity-emoji.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// ─── #1: objective ↔ dependency ──────────────────────────────────────────────

describe('#1 — objective_depends_on_dependency', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.objective_depends_on_dependency
    expect(def).toBeDefined()
    expect(def.source_type).toBe('objective')
    expect(def.target_type).toBe('dependency')
    // cross-domain, NOT hierarchy: a dependency is parented under its owning
    // team, so an objective references it laterally rather than containing it.
    expect(def.classification).toBe('cross-domain')
    expect(def.forward_verb).toBe('depends_on')
    expect(def.reverse_verb).toBe('dependency_of')
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('objective_depends_on_dependency')
    expect(isCrossProductEligible('objective_depends_on_dependency')).toBe(true)
  })

  it('indexes the objective → dependency pair', () => {
    expect(UPG_EDGE_PAIR_MAP['objective:dependency']).toContain('objective_depends_on_dependency')
  })

  it('does NOT re-parent dependency under objective (dependency stays a team child)', () => {
    // The edge is a lateral reference, not containment. objective's valid
    // children must not gain `dependency`; dependency's home stays team_org.
    expect(UPG_VALID_CHILDREN.objective).not.toContain('dependency')
    expect(UPG_VALID_CHILDREN.team).toContain('dependency')
  })
})

describe('#1 — dependency_blocks_objective (the explicit mirror)', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.dependency_blocks_objective
    expect(def).toBeDefined()
    expect(def.source_type).toBe('dependency')
    expect(def.target_type).toBe('objective')
    expect(def.classification).toBe('cross-domain')
    expect(def.forward_verb).toBe('blocks')
    expect(def.reverse_verb).toBe('blocked_by')
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('dependency_blocks_objective')
  })

  it('mirrors the existing dependency_blocks_team shape (verb + classification)', () => {
    const mirror = UPG_EDGE_CATALOG.dependency_blocks_objective
    const team = UPG_EDGE_CATALOG.dependency_blocks_team
    expect(mirror.forward_verb).toBe(team.forward_verb)
    expect(mirror.classification).toBe(team.classification)
  })
})

// ─── #2: strategic_question entity ───────────────────────────────────────────

describe('#2 — strategic_question is a full roster entity', () => {
  it('is an active entity type', () => {
    expect(UPG_ACTIVE_TYPES).toContain('strategic_question')
  })

  it('carries the expected identity metadata (ent_357, proposed, since 0.17.4)', () => {
    const meta = UPG_ENTITY_META_BY_NAME.get('strategic_question')
    expect(meta).toBeDefined()
    expect(meta!.type_id).toBe('ent_357')
    expect(meta!.maturity).toBe('proposed')
    expect(meta!.since).toBe('0.17.4')
  })

  it('lives in the strategy domain', () => {
    expect(getDomainIdForType('strategic_question')).toBe('strategy')
  })

  it('has a typed property schema (question, context, resolution, priority)', () => {
    const schema = UPG_PROPERTY_SCHEMA.strategic_question
    expect(schema).toBeDefined()
    for (const key of ['question', 'context', 'resolution', 'priority']) {
      expect(schema[key], `missing property ${key}`).toBeDefined()
    }
    expect(schema.priority.enum).toEqual(['urgent', 'high', 'medium', 'low', 'none'])
  })

  it('has an open → resolved lifecycle (status is the node lifecycle)', () => {
    const lc = UPG_LIFECYCLES.find((l) => l.entity_type === 'strategic_question')
    expect(lc).toBeDefined()
    expect(lc!.initial_phase).toBe('open')
    expect(lc!.terminal_phases).toContain('resolved')
    expect(lc!.phases.map((p) => p.id).sort()).toEqual(['open', 'resolved'])
  })

  it('has an explicit emoji glyph (no fallback)', () => {
    expect(ENTITY_EMOJI.strategic_question).toBeTruthy()
  })
})

describe('#2 — strategic_question wiring (raised under objective / initiative)', () => {
  it('objective_raises_strategic_question is a within-graph hierarchy edge', () => {
    const def = UPG_EDGE_CATALOG.objective_raises_strategic_question
    expect(def).toBeDefined()
    expect(def.source_type).toBe('objective')
    expect(def.target_type).toBe('strategic_question')
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe('raises')
    expect(def.reverse_verb).toBe('raised_by')
    // the question node is authored alongside its objective in ONE planning
    // graph; the cross-team nature lives in the question text, not a cross-edge.
    expect(isCrossProductEligible('objective_raises_strategic_question')).toBe(false)
    expect(UPG_CROSS_EDGE_TYPES).not.toContain('objective_raises_strategic_question')
  })

  it('initiative_raises_strategic_question mirrors it for initiatives', () => {
    const def = UPG_EDGE_CATALOG.initiative_raises_strategic_question
    expect(def).toBeDefined()
    expect(def.source_type).toBe('initiative')
    expect(def.target_type).toBe('strategic_question')
    expect(def.classification).toBe('hierarchy')
    expect(isCrossProductEligible('initiative_raises_strategic_question')).toBe(false)
    expect(UPG_CROSS_EDGE_TYPES).not.toContain('initiative_raises_strategic_question')
  })

  it('objective and initiative both accept strategic_question as a valid child', () => {
    expect(UPG_VALID_CHILDREN.objective).toContain('strategic_question')
    expect(UPG_VALID_CHILDREN.initiative).toContain('strategic_question')
  })

  it('the canonical containment edge resolves from both parents', () => {
    expect(resolveContainmentEdge('objective', 'strategic_question')).toBe('objective_raises_strategic_question')
    expect(resolveContainmentEdge('initiative', 'strategic_question')).toBe('initiative_raises_strategic_question')
  })
})

// ─── #3: the defer / out-of-scope edge ───────────────────────────────────────

describe('#3 — objective_defers_feature', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.objective_defers_feature
    expect(def).toBeDefined()
    expect(def.source_type).toBe('objective')
    expect(def.target_type).toBe('feature')
    // strategy → product_spec
    expect(def.classification).toBe('cross-domain')
    expect(def.forward_verb).toBe('defers')
    expect(def.reverse_verb).toBe('deferred_by')
    expect(def.carries_properties).toBe(true)
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('objective_defers_feature')
    expect(isCrossProductEligible('objective_defers_feature')).toBe(true)
  })
})

describe('#3 — objective_defers_capability', () => {
  it('exists in UPG_EDGE_CATALOG with the correct shape', () => {
    const def = UPG_EDGE_CATALOG.objective_defers_capability
    expect(def).toBeDefined()
    expect(def.source_type).toBe('objective')
    expect(def.target_type).toBe('capability')
    // intra-strategy → semantic (capability lives in the strategy domain)
    expect(def.classification).toBe('semantic')
    expect(def.forward_verb).toBe('defers')
    expect(def.reverse_verb).toBe('deferred_by')
    expect(def.carries_properties).toBe(true)
    expect(def.cross_product_eligible).toBe(true)
  })

  it('is registered as a cross-product edge', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('objective_defers_capability')
  })
})

describe('#3 — the deferred_to edge property', () => {
  it('both defer edges carry the shared DEFER_EDGE_PROPERTY_SCHEMA', () => {
    expect(getEdgePropertySchema('objective_defers_feature')).toBe(DEFER_EDGE_PROPERTY_SCHEMA)
    expect(getEdgePropertySchema('objective_defers_capability')).toBe(DEFER_EDGE_PROPERTY_SCHEMA)
  })

  it('the schema carries a single freeform deferred_to string key', () => {
    expect(Object.keys(DEFER_EDGE_PROPERTY_SCHEMA)).toEqual(['deferred_to'])
    expect(DEFER_EDGE_PROPERTY_SCHEMA.deferred_to.type).toBe('string')
  })

  it('accepts a valid deferred_to bag (and an empty one) but rejects unknown keys', () => {
    expect(validateEdgeProperties('objective_defers_feature', { deferred_to: 'Q4 2026' })).toEqual([])
    expect(validateEdgeProperties('objective_defers_feature', {})).toEqual([])
    expect(validateEdgeProperties('objective_defers_feature', { bogus: 1 }).length).toBeGreaterThan(0)
  })
})

// ─── deliberate_only flag (0.17.4 keystone) ──────────────────────────────────
//
// The catalog flag that every generic-inference chokepoint (the SDK auto-nest
// inference, the adapter parentage resolvers) derives its skip-set from. Single
// source of truth: flag one edge, it self-excludes everywhere.

describe('deliberate_only flag + derived set', () => {
  it('both defer edges carry deliberate_only: true', () => {
    expect(UPG_EDGE_CATALOG.objective_defers_feature.deliberate_only).toBe(true)
    expect(UPG_EDGE_CATALOG.objective_defers_capability.deliberate_only).toBe(true)
  })

  // 0.17.6: insight → opportunity is a PM-judgment link — which opportunity a
  // finding actually feeds is authored, never inferred from a source's hierarchy.
  // Flagging it stops the latent auto-emission on the generic-inference path.
  it('insight_informs_opportunity carries deliberate_only: true (0.17.6)', () => {
    expect(UPG_EDGE_CATALOG.insight_informs_opportunity.deliberate_only).toBe(true)
  })

  it('isDeliberateOnlyEdge reflects the flag', () => {
    expect(isDeliberateOnlyEdge('objective_defers_feature')).toBe(true)
    expect(isDeliberateOnlyEdge('objective_defers_capability')).toBe(true)
    expect(isDeliberateOnlyEdge('insight_informs_opportunity')).toBe(true)
    // an ordinary edge is not deliberate-only
    expect(isDeliberateOnlyEdge('feature_area_contains_feature')).toBe(false)
    expect(isDeliberateOnlyEdge('__not_a_real_edge__')).toBe(false)
  })

  it('UPG_DELIBERATE_ONLY_EDGE_TYPES is exactly the flagged edges (derived, no drift)', () => {
    const flagged = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, def]) => (def as { deliberate_only?: true }).deliberate_only === true)
      .map(([k]) => k)
      .sort()
    expect([...UPG_DELIBERATE_ONLY_EDGE_TYPES].sort()).toEqual(flagged)
    expect([...UPG_DELIBERATE_ONLY_EDGE_TYPES].sort()).toEqual([
      'insight_informs_opportunity',
      'objective_defers_capability',
      'objective_defers_feature',
    ])
  })
})
