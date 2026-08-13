/**
 * Surface layer — v0.27.0 (feedback 20f0e46f)
 *
 * `surface` is the place inside a screen: its occupants, and the rule that
 * arbitrates between them. `feature_area` answers who OWNS a thing and
 * `bounded_context` answers what ARCHITECTURE it belongs to; neither answers
 * "what else occupies the same place?". `screen` is route-level and too coarse
 * for the question. This suite pins the entity, its eight properties, the ten
 * edges with their adjudicated classifications, the nesting grammar, the
 * lifecycle, and the three anti-patterns.
 *
 * Run: npx vitest run src/__tests__/surface-layer.test.ts
 */

import { describe, it, expect } from 'vitest'
import {
  UPG_EDGE_CATALOG,
  isCrossProductEligible,
  type UPGEdgeDefinition,
} from '../catalog/edge-catalog.js'
import { crossProductScope } from '../grammar/cross-scope.js'
import { UPG_ACTIVE_TYPES, UPG_ENTITY_META_BY_NAME, isPortfolioSharedType } from '../registry/entity-meta.js'
import { getDomainIdForType } from '../registry/domains.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_LIFECYCLES } from '../grammar/lifecycles.js'
import { ENTITY_EMOJI } from '../presentation/entity-emoji.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import { getAntiPatternById } from '../intelligence/anti-patterns.js'
import { COVERAGE_ANTI_PATTERNS } from '../intelligence/validation-profiles.js'

const cat = UPG_EDGE_CATALOG as Record<string, UPGEdgeDefinition>

// ─── The entity ──────────────────────────────────────────────────────────────

describe('surface is a full roster entity', () => {
  it('is an active entity type in the ux_design domain', () => {
    expect(UPG_ACTIVE_TYPES).toContain('surface')
    expect(getDomainIdForType('surface')).toBe('ux_design')
  })

  it('carries registry metadata: proposed, since 0.27.0, ent_359', () => {
    const meta = UPG_ENTITY_META_BY_NAME.get('surface')
    expect(meta).toBeDefined()
    expect(meta?.type_id).toBe('ent_359')
    expect(meta?.maturity).toBe('proposed')
    expect(meta?.since).toBe('0.27.0')
  })

  it('is NOT portfolio_shared — a place belongs to one product UI', () => {
    expect(isPortfolioSharedType('surface')).toBe(false)
  })

  it('has a presentation emoji', () => {
    expect(ENTITY_EMOJI['surface']).toBeTruthy()
  })
})

// ─── The eight properties ────────────────────────────────────────────────────

describe('surface properties (the ratified eight)', () => {
  const schema = UPG_PROPERTY_SCHEMA['surface']

  it('exposes exactly the eight ratified keys', () => {
    expect(Object.keys(schema).sort()).toEqual(
      [
        'arbitration_rule',
        'capacity',
        'dimensional_constraint',
        'extensibility',
        'mutates_content',
        'persistence',
        'surface_kind',
        'visibility_condition',
      ].sort(),
    )
  })

  it('surface_kind enumerates the nine kinds, outermost to innermost', () => {
    expect(schema.surface_kind.type).toBe('string')
    expect(schema.surface_kind.enum).toEqual([
      'shell', 'tool', 'pane', 'region', 'slot', 'gutter', 'action_bar', 'overlay', 'ambient',
    ])
  })

  it('persistence and extensibility are closed enums', () => {
    expect(schema.persistence.enum).toEqual(['always', 'conditional', 'on_demand', 'transient'])
    expect(schema.extensibility.enum).toEqual(['closed', 'plugin_registerable', 'user_configurable'])
  })

  it('capacity is a plain number: absence carries the "unbounded" reading', () => {
    // The proposal asked for `integer | unbounded`. PropertyDefinition.type is a
    // single scalar kind with no union form, so the adjudication is an optional
    // number whose ABSENCE means unbounded, rather than a sentinel value every
    // consumer would have to special-case. Guard the type so a later edit that
    // reaches for a string sentinel has to argue with this test.
    expect(schema.capacity.type).toBe('number')
    expect(schema.capacity.enum).toBeUndefined()
    expect(schema.capacity.description).toContain('ABSENT MEANS UNBOUNDED')
  })

  it('arbitration_rule is free text whose absence is documented as meaningful', () => {
    expect(schema.arbitration_rule.type).toBe('string')
    expect(schema.arbitration_rule.description).toContain('ABSENCE IS MEANINGFUL')
  })

  it('mutates_content is the boolean selector/mutator discriminator', () => {
    expect(schema.mutates_content.type).toBe('boolean')
  })

  it('dimensional_constraint is free text (units are the design system\'s to choose)', () => {
    expect(schema.dimensional_constraint.type).toBe('string')
    expect(schema.dimensional_constraint.enum).toBeUndefined()
  })
})

// ─── The ten edges ───────────────────────────────────────────────────────────

describe('the ten surface edges', () => {
  // key → [source, target, forward, reverse, classification]
  const EXPECTED: Record<string, [string, string, string, string, string]> = {
    surface_contains_surface: ['surface', 'surface', 'contains', 'belongs_to', 'hierarchy'],
    surface_serves_job: ['surface', 'job', 'serves', 'served_by', 'cross-domain'],
    surface_governed_by_design_guideline: ['surface', 'design_guideline', 'governed_by', 'governs', 'cross-domain'],
    surface_renders_design_component: ['surface', 'design_component', 'renders', 'rendered_on', 'hierarchy'],
    surface_measured_by_metric: ['surface', 'metric', 'measured_by', 'measures', 'semantic'],
    surface_supersedes_surface: ['surface', 'surface', 'supersedes', 'superseded_by', 'semantic'],
    feature_occupies_surface: ['feature', 'surface', 'occupies', 'occupied_by', 'cross-domain'],
    screen_renders_surface: ['screen', 'surface', 'renders', 'rendered_by', 'hierarchy'],
    decision_affects_surface: ['decision', 'surface', 'affects', 'affected_by', 'cross-domain'],
    journey_step_occurs_on_surface: ['journey_step', 'surface', 'occurs_on', 'hosts', 'semantic'],
  }

  it('registers exactly ten, and no more', () => {
    const surfaceEdges = Object.entries(cat)
      .filter(([, d]) => d.source_type === 'surface' || d.target_type === 'surface')
      .map(([k]) => k)
      .sort()
    expect(surfaceEdges).toEqual(Object.keys(EXPECTED).sort())
  })

  it.each(Object.entries(EXPECTED))(
    '%s pins its endpoints, verb pair, and classification',
    (key, [source, target, forward, reverse, classification]) => {
      const def = cat[key]
      expect(def, `${key} missing from the catalog`).toBeDefined()
      expect(def.source_type).toBe(source)
      expect(def.target_type).toBe(target)
      expect(def.forward_verb).toBe(forward)
      expect(def.reverse_verb).toBe(reverse)
      expect(def.classification).toBe(classification)
    },
  )

  it('measured_by takes the SEMANTIC half of the *_measured_by_metric convention', () => {
    // outcome / objective / strategic_pillar are `hierarchy` because they OWN
    // their metrics as children (each has a UPG_VALID_CHILDREN entry, which the
    // hierarchy-integrity guardrail enforces). A surface owns no metric, so it
    // takes the revenue_stream / cost_structure half. Classifying it `hierarchy`
    // would oblige surface → metric containment, which is false.
    expect(cat.surface_measured_by_metric.classification).toBe('semantic')
    expect(cat.revenue_stream_measured_by_metric.classification).toBe('semantic')
    expect(UPG_VALID_CHILDREN['surface']).not.toContain('metric')
  })

  it('the three design-system-facing edges are cross_product_eligible', () => {
    // A guideline, a component, and a metric definition commonly live in a
    // shared graph while the surface stays product-local.
    expect(isCrossProductEligible('surface_governed_by_design_guideline')).toBe(true)
    expect(isCrossProductEligible('surface_renders_design_component')).toBe(true)
    expect(isCrossProductEligible('surface_measured_by_metric')).toBe(true)
  })

  it('the other seven stay resident to one graph', () => {
    for (const k of [
      'surface_contains_surface', 'surface_serves_job', 'surface_supersedes_surface',
      'feature_occupies_surface', 'screen_renders_surface', 'decision_affects_surface',
      'journey_step_occurs_on_surface',
    ]) {
      expect(isCrossProductEligible(k), `${k} should not be cross-eligible`).toBe(false)
    }
  })

  it('all three cross-eligible edges classify as curated', () => {
    for (const k of [
      'surface_governed_by_design_guideline',
      'surface_renders_design_component',
      'surface_measured_by_metric',
    ]) {
      expect(crossProductScope(k), `${k}`).toBe('curated')
    }
  })

  it('journey_step_occurs_on_surface mirrors its screen-level sibling\'s classification', () => {
    expect(cat.journey_step_occurs_on_surface.classification).toBe(
      cat.journey_step_shown_on_screen.classification,
    )
  })

  it('surface_renders_design_component mirrors screen_renders_design_component verbatim', () => {
    const a = cat.surface_renders_design_component
    const b = cat.screen_renders_design_component
    expect(a.forward_verb).toBe(b.forward_verb)
    expect(a.reverse_verb).toBe(b.reverse_verb)
    expect(a.classification).toBe(b.classification)
    expect(a.cross_product_eligible).toBe(b.cross_product_eligible)
  })
})

// ─── Nesting grammar ─────────────────────────────────────────────────────────

describe('surface nesting', () => {
  it('self-nests and holds design components, nothing else', () => {
    expect(UPG_VALID_CHILDREN['surface']).toEqual(['surface', 'design_component'])
  })

  it('is reached through the screen that renders it', () => {
    expect(UPG_VALID_CHILDREN['screen']).toContain('surface')
  })

  it('is NOT a top-level product child', () => {
    // Every UPG_VALID_CHILDREN pair must be backed by a hierarchy-classified
    // edge (guardrail G2b), and the ratified ten contain no product→surface
    // verb. An app-shell surface hangs off the screen that mounts it.
    expect(UPG_VALID_CHILDREN['product']).not.toContain('surface')
  })

  it('every declared containment pair is backed by a hierarchy edge', () => {
    for (const child of UPG_VALID_CHILDREN['surface']) {
      const backing = Object.values(cat).find(
        (d) => d.source_type === 'surface' && d.target_type === child && d.classification === 'hierarchy',
      )
      expect(backing, `surface → ${child} has no hierarchy-classified edge`).toBeDefined()
    }
  })
})

// ─── Lifecycle ───────────────────────────────────────────────────────────────

describe('surface lifecycle', () => {
  const lc = UPG_LIFECYCLES.find((l) => l.entity_type === 'surface')
  const screenLc = UPG_LIFECYCLES.find((l) => l.entity_type === 'screen')

  it('exists and runs the build pipeline, not a maturity ladder', () => {
    expect(lc).toBeDefined()
    expect(lc?.initial_phase).toBe('draft')
    expect(lc?.terminal_phases).toEqual(['deprecated'])
    expect(lc?.phases.map((p) => p.id)).toEqual([
      'draft', 'in_design', 'built', 'shipped', 'deprecated',
    ])
  })

  it('shares the screen ladder exactly, so a screen and its surfaces report on one vocabulary', () => {
    expect(lc?.phases.map((p) => p.id)).toEqual(screenLc?.phases.map((p) => p.id))
    expect(lc?.phases.map((p) => p.status_category)).toEqual(
      screenLc?.phases.map((p) => p.status_category),
    )
  })
})

// ─── Anti-patterns ───────────────────────────────────────────────────────────

describe('the three surface anti-patterns', () => {
  it('the contention pattern leads, the two companions sit a tier below', () => {
    const main = getAntiPatternById('contended-surface-without-arbitration')
    const job = getAntiPatternById('surface-without-job')
    const measured = getAntiPatternById('surface-without-measurement')
    expect(main?.severity).toBe('medium')
    expect(job?.severity).toBe('low')
    expect(measured?.severity).toBe('low')
  })

  it('all three are graph-scoped, carry a detector, and are stamped 0.27.0', () => {
    for (const id of [
      'contended-surface-without-arbitration', 'surface-without-job', 'surface-without-measurement',
    ]) {
      const ap = getAntiPatternById(id)
      expect(ap, id).toBeDefined()
      expect(ap?.scope ?? 'graph').toBe('graph')
      expect(ap?.structured_condition, `${id} needs a machine-evaluable detector`).toBeDefined()
      expect(ap?.since).toBe('0.27.0')
    }
  })

  it('the contention detector keys on arbitration_rule ABSENCE, not on a value', () => {
    // A value-keyed filter cannot express "nobody filled this in": the collector
    // only indexes values that exist. The presence filter is what makes the
    // ratified detector able to fire at all.
    const cond = getAntiPatternById('contended-surface-without-arbitration')
      ?.structured_condition as { checks: Array<{ check?: Record<string, unknown> }> }
    const filters = cond.checks
      .map((c) => c.check?.filter as Record<string, unknown> | undefined)
      .filter(Boolean)
    expect(filters).toContainEqual({ property: 'arbitration_rule', present: false })
  })

  it('the two companions are thin-graph advisory; the contention one is not', () => {
    expect(COVERAGE_ANTI_PATTERNS.has('surface-without-job')).toBe(true)
    expect(COVERAGE_ANTI_PATTERNS.has('surface-without-measurement')).toBe(true)
    expect(COVERAGE_ANTI_PATTERNS.has('contended-surface-without-arbitration')).toBe(false)
  })
})
