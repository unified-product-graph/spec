/**
 * Planning cadence — v0.20.0
 *
 * The cadence axis of the product-delivery region. One self-nesting
 * `planning_cycle` entity (with a `cadence_kind` discriminator) stands in for
 * sprint / iteration / quarter / program-increment / cooldown, plus the edges
 * that schedule work through it and scope objectives to it. This batch also adds
 * the polymorphic work-item issue links, the dual-band `workflow_state`, the
 * user_story planning-field lift, and the `strategic_theme.time_horizon`
 * promotion.
 *
 * Run: npx vitest run src/__tests__/planning-cadence.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  UPG_EDGE_CATALOG,
  isCrossProductEligible,
  isDeliberateOnlyEdge,
  isPolymorphicEdge,
  isRegisteredPolymorphicEdge,
  type UPGEdgeDefinition,
} from '../catalog/edge-catalog.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { crossProductScope, isCrossCapable } from '../grammar/cross-scope.js'
import { UPG_ACTIVE_TYPES, UPG_ENTITY_META_BY_NAME, isPortfolioSharedType } from '../registry/entity-meta.js'
import { getDomainIdForType } from '../registry/domains.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_LIFECYCLES } from '../grammar/lifecycles.js'
import { ENTITY_EMOJI } from '../presentation/entity-emoji.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import { resolveContainmentEdge } from '../index.js'
import { getAntiPatternById } from '../intelligence/anti-patterns.js'

// ─── The planning_cycle entity ───────────────────────────────────────────────

describe('planning_cycle is a full roster entity', () => {
  it('is an active entity type', () => {
    expect(UPG_ACTIVE_TYPES).toContain('planning_cycle')
  })

  it('carries the expected identity metadata (ent_358, proposed, since 0.20.0, portfolio_shared)', () => {
    const meta = UPG_ENTITY_META_BY_NAME.get('planning_cycle')
    expect(meta).toBeDefined()
    expect(meta!.type_id).toBe('ent_358')
    expect(meta!.maturity).toBe('proposed')
    expect(meta!.since).toBe('0.20.0')
    // RATIFIED (call 03): a coarse cycle is an org-shared interval, so it is a
    // portfolio_shared type — this is what makes its cross-scope edges provisional.
    expect(meta!.portfolio_shared).toBe(true)
    expect(isPortfolioSharedType('planning_cycle')).toBe(true)
  })

  it('lives in the product_spec domain', () => {
    expect(getDomainIdForType('planning_cycle')).toBe('product_spec')
  })

  it('has the typed cadence property schema (cadence_kind enum + interval fields)', () => {
    const schema = UPG_PROPERTY_SCHEMA.planning_cycle
    expect(schema).toBeDefined()
    for (const key of ['cadence_kind', 'cadence_label', 'starts_on', 'ends_on', 'sequence', 'goal', 'appetite']) {
      expect(schema[key], `missing property ${key}`).toBeDefined()
    }
    expect(schema.cadence_kind.enum).toEqual(['period', 'iteration', 'buffer'])
    expect(schema.starts_on.type).toBe('string')
    expect(schema.sequence.type).toBe('number')
    // No shadow `*_status`: status IS the node lifecycle.
    expect(schema.planning_cycle_status).toBeUndefined()
  })

  it('has a planned -> active -> closed lifecycle (status is the node lifecycle)', () => {
    const lc = UPG_LIFECYCLES.find((l) => l.entity_type === 'planning_cycle')
    expect(lc).toBeDefined()
    expect(lc!.initial_phase).toBe('planned')
    expect(lc!.terminal_phases).toContain('closed')
    expect(lc!.phases.map((p) => p.id).sort()).toEqual(['active', 'closed', 'planned'])
  })

  it('has an explicit emoji glyph (no fallback)', () => {
    expect(ENTITY_EMOJI.planning_cycle).toBeTruthy()
  })

  it('self-nests and attaches under product, but does not contain user_story', () => {
    expect(UPG_VALID_CHILDREN.planning_cycle).toEqual(['planning_cycle'])
    expect(UPG_VALID_CHILDREN.product).toContain('planning_cycle')
    // scheduling is an edge, not containment: a story keeps its feature/epic parent.
    expect(UPG_VALID_CHILDREN.planning_cycle).not.toContain('user_story')
  })
})

// ─── E1: self-nesting containment ────────────────────────────────────────────

describe('E1 — planning_cycle_contains_planning_cycle', () => {
  it('is a self-nesting hierarchy edge (mirrors team_contains_team)', () => {
    const def = UPG_EDGE_CATALOG.planning_cycle_contains_planning_cycle
    expect(def).toBeDefined()
    expect(def.source_type).toBe('planning_cycle')
    expect(def.target_type).toBe('planning_cycle')
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe('contains')
    expect(def.reverse_verb).toBe('belongs_to')
  })

  it('is the canonical containment edge for the self-nest and is NOT cross-eligible', () => {
    expect(resolveContainmentEdge('planning_cycle', 'planning_cycle')).toBe('planning_cycle_contains_planning_cycle')
    expect(isCrossProductEligible('planning_cycle_contains_planning_cycle')).toBe(false)
    expect(UPG_CROSS_EDGE_TYPES).not.toContain('planning_cycle_contains_planning_cycle')
    expect(isDeliberateOnlyEdge('planning_cycle_contains_planning_cycle')).toBe(false)
  })
})

// ─── E2: objective cycle-scoping (the G5 anchor) ─────────────────────────────

describe('E2 — objective_scoped_to_planning_cycle (provisional cross-scope)', () => {
  it('is a semantic objective -> planning_cycle edge', () => {
    const def = UPG_EDGE_CATALOG.objective_scoped_to_planning_cycle
    expect(def).toBeDefined()
    expect(def.source_type).toBe('objective')
    expect(def.target_type).toBe('planning_cycle')
    expect(def.classification).toBe('semantic')
    expect(def.forward_verb).toBe('scoped_to')
    expect(def.reverse_verb).toBe('scopes')
  })

  it('ships PROVISIONAL, not curated: no cross_product_eligible flag, but passes the shared-tier gate', () => {
    // The catalog flag would make it curated; it deliberately carries none.
    expect((UPG_EDGE_CATALOG.objective_scoped_to_planning_cycle as UPGEdgeDefinition).cross_product_eligible).toBeUndefined()
    expect(isCrossProductEligible('objective_scoped_to_planning_cycle')).toBe(false)
    expect(UPG_CROSS_EDGE_TYPES).not.toContain('objective_scoped_to_planning_cycle')
    // planning_cycle is portfolio_shared, so the gate passes -> provisional.
    expect(isCrossCapable('objective', 'planning_cycle')).toBe(true)
    expect(crossProductScope('objective_scoped_to_planning_cycle')).toBe('provisional')
  })
})

// ─── E3: scheduling work into a cycle ────────────────────────────────────────

describe('E3 — planning_cycle_schedules_user_story (deliberate-only)', () => {
  it('is a semantic, deliberate-only planning_cycle -> user_story edge', () => {
    const def = UPG_EDGE_CATALOG.planning_cycle_schedules_user_story
    expect(def).toBeDefined()
    expect(def.source_type).toBe('planning_cycle')
    expect(def.target_type).toBe('user_story')
    expect(def.classification).toBe('semantic')
    expect(def.forward_verb).toBe('schedules')
    expect(def.reverse_verb).toBe('scheduled_in')
    expect(def.deliberate_only).toBe(true)
    expect(isDeliberateOnlyEdge('planning_cycle_schedules_user_story')).toBe(true)
  })

  it('is not curated: deliberate_only and cross-scope are orthogonal', () => {
    // deliberate_only governs INFERENCE (auto-nest skips it); cross-scope governs
    // cross-product authoring. planning_cycle is portfolio_shared, so the source
    // endpoint passes the gate and the edge is provisional (allowed cross-product
    // with a warning) even though it is never curated and never auto-inferred.
    expect(isCrossProductEligible('planning_cycle_schedules_user_story')).toBe(false)
    expect(crossProductScope('planning_cycle_schedules_user_story')).toBe('provisional')
  })
})

// ─── Gap 2: polymorphic work-item issue links ────────────────────────────────

describe('Gap 2 — polymorphic work-item issue links', () => {
  const links: Array<[string, string, string, string]> = [
    ['work_item_blocks_work_item', 'causal', 'blocks', 'blocked_by'],
    ['work_item_relates_to_work_item', 'semantic', 'relates_to', 'relates_to'],
    ['work_item_duplicates_work_item', 'semantic', 'duplicates', 'duplicated_by'],
  ]

  for (const [key, classification, fwd, rev] of links) {
    it(`${key} is a node -> node, deliberate-only, registered-polymorphic edge`, () => {
      const def = UPG_EDGE_CATALOG[key as keyof typeof UPG_EDGE_CATALOG] as UPGEdgeDefinition
      expect(def, `${key} missing`).toBeDefined()
      expect(def.source_type).toBe('node')
      expect(def.target_type).toBe('node')
      expect(def.classification).toBe(classification)
      expect(def.forward_verb).toBe(fwd)
      expect(def.reverse_verb).toBe(rev)
      expect(def.deliberate_only).toBe(true)
      expect(isDeliberateOnlyEdge(key)).toBe(true)
      // node -> node means polymorphic; it must be registered.
      expect(isPolymorphicEdge(key as never)).toBe(true)
      expect(isRegisteredPolymorphicEdge(key as never)).toBe(true)
      // polymorphic issue links are within-graph, never cross-product.
      expect(isCrossProductEligible(key)).toBe(false)
    })
  }
})

// ─── F: strategic_theme.time_horizon promotion ───────────────────────────────

describe('F — strategic_theme_scoped_to_planning_cycle (mirrors E2)', () => {
  it('is a semantic strategic_theme -> planning_cycle edge, provisional cross-scope', () => {
    const def = UPG_EDGE_CATALOG.strategic_theme_scoped_to_planning_cycle
    expect(def).toBeDefined()
    expect(def.source_type).toBe('strategic_theme')
    expect(def.target_type).toBe('planning_cycle')
    expect(def.classification).toBe('semantic')
    expect(def.forward_verb).toBe('scoped_to')
    expect(def.reverse_verb).toBe('scopes')
    expect((def as UPGEdgeDefinition).cross_product_eligible).toBeUndefined()
    expect(crossProductScope('strategic_theme_scoped_to_planning_cycle')).toBe('provisional')
  })

  it('additive-deprecate: strategic_theme.time_horizon is KEPT, marked @deprecated', () => {
    const th = UPG_PROPERTY_SCHEMA.strategic_theme.time_horizon
    expect(th).toBeDefined()
    expect(th.description).toContain('@deprecated')
    // the durable pillar horizon is genuinely open-ended and stays as-is.
    expect(UPG_PROPERTY_SCHEMA.strategic_pillar.time_horizon).toBeDefined()
    expect(UPG_PROPERTY_SCHEMA.strategic_pillar.time_horizon.description).not.toContain('@deprecated')
  })
})

// ─── Gap 3 + Gap 4: dual-band workflow_state + user_story field lift ──────────

describe('Gap 3 — dual-band workflow_state on the work-item set', () => {
  for (const t of ['feature', 'epic', 'user_story', 'task', 'bug']) {
    it(`${t} carries workflow_state + workflow_state_category (freeform, non-canonical)`, () => {
      const schema = UPG_PROPERTY_SCHEMA[t]
      expect(schema.workflow_state).toBeDefined()
      expect(schema.workflow_state.type).toBe('string')
      // freeform / opaque: NOT an enum (the source tool's raw label).
      expect(schema.workflow_state.enum).toBeUndefined()
      expect(schema.workflow_state_category).toBeDefined()
    })
  }
})

describe('Gap 4 — user_story gains the task-level planning fields', () => {
  it('user_story carries priority / effort / assignee / due_date', () => {
    const schema = UPG_PROPERTY_SCHEMA.user_story
    expect(schema.priority.enum).toEqual(['urgent', 'high', 'medium', 'low', 'none'])
    expect(schema.effort.type).toBe('string')
    expect(schema.assignee.type).toBe('string')
    expect(schema.due_date.type).toBe('string')
  })
})

// ─── The anti-pattern ────────────────────────────────────────────────────────

describe('planning-cycle-without-scheduled-work anti-pattern', () => {
  it('is registered, low-severity, since 0.20.0', () => {
    const ap = getAntiPatternById('planning-cycle-without-scheduled-work')
    expect(ap).toBeDefined()
    expect(ap!.severity).toBe('low')
    expect(ap!.since).toBe('0.20.0')
  })
})
