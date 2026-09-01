/**
 * Surface layer — v0.27.0 (feedback 20f0e46f), extended v0.28.0 (feedback 852a9721)
 *
 * `surface` is the place inside a screen: its occupants, and the rule that
 * arbitrates between them. `feature_area` answers who OWNS a thing and
 * `bounded_context` answers what ARCHITECTURE it belongs to; neither answers
 * "what else occupies the same place?". `screen` is route-level and too coarse
 * for the question. This suite pins the entity, its twelve properties, the
 * thirteen edges with their adjudicated classifications, the nesting grammar, the
 * lifecycle, and the three anti-patterns.
 *
 * 0.28.0 adds four field-data properties (`cardinality`, `instance_scope`,
 * `composition_mode`, `arbitration_state`), the intent-versus-reality edge
 * `surface_deviates_via_technical_debt_item`, and a reworked contention
 * detector. The detector's firing matrix is pinned end-to-end in
 * `intelligence/evaluator.test.ts`; what this file pins is the SHAPE of the
 * condition, so a later edit that quietly removes a branch has to argue here.
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
import {
  getAntiPatternById,
  presenceExceptKey,
  UPG_ANTI_PATTERNS,
  UPG_PRESENCE_EXCEPT_SPECS,
  UPG_EDGE_COUNT_SPECS,
  edgeCountSpecKey,
} from '../intelligence/anti-patterns.js'
import { collectTargetEntities } from '../intelligence/evaluator.js'
import type { IntelligenceCondition } from '../intelligence/intelligence.js'
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

describe('surface properties (eight ratified, four added by field data, four more from a 154-surface audit)', () => {
  const schema = UPG_PROPERTY_SCHEMA['surface']

  it('exposes exactly the sixteen ratified keys', () => {
    expect(Object.keys(schema).sort()).toEqual(
      [
        // 0.27.0
        'arbitration_rule',
        'capacity',
        'dimensional_constraint',
        'extensibility',
        'mutates_content',
        'persistence',
        'surface_kind',
        'visibility_condition',
        // 0.28.0 — feedback 852a9721, from a 30-surface field audit
        'arbitration_state',
        'cardinality',
        'composition_mode',
        'instance_scope',
        // 0.36.0 — feedback 515a0d9f, from a 154-surface field audit. Splits
        // `extensibility` (kept, @deprecated since 0.36.0, removeIn 1.0.0)
        // into independent mechanism/audience/scope/entry-point facts.
        'extension_audience',
        'extension_mechanism',
        'extension_point',
        'extension_scope',
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

  it('cardinality counts INSTANCES in UML multiplicity, where capacity counts occupants', () => {
    // The two are constantly confused, and the confusion is what makes a graph
    // assert "the product has an inspector panel" when the truth is that every
    // document pane owns one. Non-identifier enum values are house-legal:
    // headcount_band ships '1-10', openapi_version ships 'v3.1'.
    expect(schema.cardinality.type).toBe('string')
    expect(schema.cardinality.enum).toEqual(['1', '0..1', '1..n', '0..n'])
    expect(schema.capacity.type).toBe('number')
  })

  it('instance_scope says what an instance belongs to', () => {
    expect(schema.instance_scope.enum).toEqual(['global', 'per_parent'])
  })

  it('composition_mode enumerates the three ways occupants relate', () => {
    expect(schema.composition_mode.enum).toEqual(['exclusive', 'additive', 'chained'])
  })

  it('arbitration_state separates the remediations absence conflates', () => {
    // Absence of arbitration_rule alone cannot tell "enforced in code, never
    // transcribed" (ten minutes) from "never decided" (a meeting) from "safe
    // only because nothing has collided yet" (a guard in code).
    //
    // The fifth member closes a second overload that the first four left open:
    // an unset arbitration_state has always meant "unassessed", and a chained
    // surface with nothing to arbitrate had no way to say so except by using
    // that same emptiness. Certainty and ignorance were indistinguishable.
    // `no_contention_by_design` is a positive claim, so it separates them.
    expect(schema.arbitration_state.enum).toEqual([
      'enforced_documented', 'enforced_undocumented', 'safe_by_coincidence', 'none',
      'no_contention_by_design',
    ])
  })

  // The whole reason the fifth member was cheaper than exempting `chained` from
  // the contention detector's value-keyed branch: that branch matches the
  // LITERAL string 'none', so a new member cannot match it and no evaluator,
  // collector or anti-pattern logic had to change. If this ever fails, the
  // detector has grown a value-keyed exemption arm and the 0.31.0 reasoning
  // needs re-reading before the enum is touched again.
  it('the contention detector matches arbitration_state by literal value, so a new enum member is inert', () => {
    const contention = UPG_ANTI_PATTERNS.find(
      (p) => p.id === 'contended-surface-without-arbitration',
    )
    expect(contention).toBeDefined()
    const valueFilters: string[] = []
    const walk = (n: unknown): void => {
      if (!n || typeof n !== 'object') return
      const node = n as Record<string, unknown>
      const check = node.check as Record<string, unknown> | undefined
      const filter = check?.filter as Record<string, unknown> | undefined
      if (check?.property === 'arbitration_state' || filter?.property === 'arbitration_state') {
        const v = filter?.value
        if (typeof v === 'string') valueFilters.push(v)
      }
      for (const child of (node.checks as unknown[]) ?? []) walk(child)
    }
    walk(contention!.structured_condition)
    expect(valueFilters.sort()).toEqual(['none', 'safe_by_coincidence'])
    expect(valueFilters).not.toContain('no_contention_by_design')
  })

  /**
   * The whole documented meaning of a property, across both tiers.
   *
   * The two-tier convention (0.30.x) splits a property doc into the contract
   * (`description`) and the longform (`notes`), and which tier a given sentence
   * sits in is an editorial call that may change again. What must never change
   * is that the semantics remain DOCUMENTED somewhere, so these tests assert
   * against the union. A test pinned to one tier would fail on a re-split that
   * lost nothing, and pass on a deletion that lost everything.
   */
  const documented = (prop: { description?: string; notes?: string }) =>
    `${prop.description ?? ''} ${prop.notes ?? ''}`

  it('capacity is documented as INTENT, so drift is recorded as debt not by editing it', () => {
    // The whole point of surface_deviates_via_technical_debt_item: a capacity-1
    // banner found rendering four keeps saying 1. Editing the number up to match
    // the bug destroys the only record that a gap exists.
    expect(documented(schema.capacity)).toMatch(/INTENDS|Intent, not observation/)
    expect(documented(schema.capacity)).toContain('surface_deviates_via_technical_debt_item')
  })

  it('capacity is a plain number: absence carries the "unbounded" reading', () => {
    // The proposal asked for `integer | unbounded`. PropertyDefinition.type is a
    // single scalar kind with no union form, so the adjudication is an optional
    // number whose ABSENCE means unbounded, rather than a sentinel value every
    // consumer would have to special-case. Guard the type so a later edit that
    // reaches for a string sentinel has to argue with this test.
    expect(schema.capacity.type).toBe('number')
    expect(schema.capacity.enum).toBeUndefined()
    expect(documented(schema.capacity)).toMatch(/[Aa]bsent means unbounded|ABSENT is unbounded/)
  })

  it('arbitration_rule is free text whose absence is documented as meaningful', () => {
    expect(schema.arbitration_rule.type).toBe('string')
    expect(documented(schema.arbitration_rule)).toMatch(/[Aa]bsence is meaningful/)
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

describe('the thirteen surface edges', () => {
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
    surface_deviates_via_technical_debt_item: ['surface', 'technical_debt_item', 'deviates_via', 'causes_deviation_in', 'cross-domain'],
    // 0.30.0: composition that varies by configuration.
    surface_varies_by_configuration_axis: ['surface', 'configuration_axis', 'varies_by', 'varies', 'cross-domain'],
    // Semantic, alongside `supersedes`: neither surface owns the other, and a
    // hierarchy classification would demand a UPG_VALID_CHILDREN pair that is
    // false. Reverse verb equals forward verb because alternation is symmetric;
    // the direction convention (source is the surface under the axis default)
    // is guidance, deliberately not a validator check, since an axis with no
    // default is legal modelling.
    surface_alternates_with_surface: ['surface', 'surface', 'alternates_with', 'alternates_with', 'semantic'],
  }

  it('registers exactly thirteen, and no more', () => {
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

  it('the other eight stay resident to one graph', () => {
    for (const k of [
      'surface_contains_surface', 'surface_serves_job', 'surface_supersedes_surface',
      'feature_occupies_surface', 'screen_renders_surface', 'decision_affects_surface',
      'journey_step_occurs_on_surface', 'surface_deviates_via_technical_debt_item',
    ]) {
      expect(isCrossProductEligible(k), `${k} should not be cross-eligible`).toBe(false)
    }
  })

  it('deviates_via is cross-domain, not causal and not hierarchy', () => {
    // cross-domain: crossing INTO the debt domain from another ring is the
    // established shape (risk_manifests_as_technical_debt_item).
    // NOT causal: decision_incurs_technical_debt_item is causal because a
    // decision BRINGS the debt into existence; a surface does not cause its own
    // drift, it exhibits it.
    // NOT hierarchy: that would oblige a surface → technical_debt_item pair in
    // UPG_VALID_CHILDREN (G2b), and a surface does not own the debt afflicting
    // it the way a service owns its backlog.
    const def = cat.surface_deviates_via_technical_debt_item
    expect(def.classification).toBe('cross-domain')
    expect(cat.risk_manifests_as_technical_debt_item.classification).toBe('cross-domain')
    expect(UPG_VALID_CHILDREN['surface']).not.toContain('technical_debt_item')
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
  /** Every `filter` in the contention detector, at any nesting depth. The
   *  0.28.0 condition puts its three trigger branches inside a nested `or`, so
   *  a flat scan of the top-level `checks` would miss all of them and pass
   *  vacuously. */
  const allFilters = (): Array<Record<string, unknown>> => {
    const out: Array<Record<string, unknown>> = []
    const walk = (c: unknown): void => {
      if (!c || typeof c !== 'object') return
      const node = c as { operator?: string; checks?: unknown[]; check?: { filter?: unknown } }
      if (node.operator && Array.isArray(node.checks)) {
        for (const child of node.checks) walk(child)
        return
      }
      const f = node.check?.filter
      if (f && typeof f === 'object') out.push(f as Record<string, unknown>)
    }
    walk(getAntiPatternById('contended-surface-without-arbitration')?.structured_condition)
    return out
  }

  /** The contention check's per-node spec, resolved from the derived list so a
   *  change to the condition shows up here rather than drifting past it. */
  const contentionSpec = () => {
    const spec = UPG_EDGE_COUNT_SPECS.find(
      (s) => s.entity_type === 'surface' && s.edge_type === 'feature_occupies_surface',
    )
    expect(spec, 'contention check must declare an edge-count spec').toBeDefined()
    return spec!
  }

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
    // only indexes values that exist. Absence is what makes the detector able to
    // fire at all. 0.29.0 moved this branch to the per-node form, where the
    // absence requirement lives in `node_filter` alongside the capacity
    // comparison, so that both halves are asked of the SAME surface.
    expect(contentionSpec().node_filter).toEqual({
      property: 'arbitration_rule',
      present: false,
    })
  })

  it('the chained exemption is DECLARE-TO-EARN: it lives on the check, not on the population', () => {
    // The exemption must be a property a surface CLAIMS, never a default. A
    // check without the except clause would exempt nobody; one that dropped the
    // absence clause would exempt everybody. Pin both halves.
    const spec = contentionSpec()
    expect(spec.node_filter?.present).toBe(false)
    expect(spec.except_property).toBe('composition_mode')
    expect(spec.except_value).toBe('chained')
  })

  it('capacity is read, and an absent capacity behaves as 1 rather than as unbounded', () => {
    // The 0.29.0 fix (feedback af9ae4c2). Occupancy is compared against the
    // surface's OWN capacity, so a place holding no more than it declared is
    // partitioned rather than contended. The absent-default is the subtle half:
    // absence means unbounded, and it is tempting to read unbounded as "never
    // flag", but a surface that states no limit has stated no answer. Setting
    // the default to 1 keeps every unbounded multi-occupant surface firing,
    // which is where 4 of the reporter's 7 true positives lived.
    const spec = contentionSpec()
    expect(spec.edge_type).toBe('feature_occupies_surface')
    expect(spec.direction).toBe('inbound')
    expect(spec.property).toBe('capacity')
    expect(spec.property_absent_default).toBe(1)
    expect(spec.node_comparison).toBe('gt')
  })

  it('safe_by_coincidence and none each fire on their own, unqualified', () => {
    // These two are the states a written arbitration_rule can MASK: prose that
    // describes disjoint enum values doing the arbitrating with nothing guarding
    // them reads as a filled-in rule to the presence branch. They carry no
    // chained exemption on purpose — declaring either is an admission that
    // outranks any composition claim.
    expect(allFilters()).toContainEqual({
      property: 'arbitration_state', value: 'safe_by_coincidence',
    })
    expect(allFilters()).toContainEqual({ property: 'arbitration_state', value: 'none' })
  })

  it('enforced_undocumented gets no branch of its own, and no suppression', () => {
    // It needs no branch: a surface enforcing an untranscribed rule has no
    // arbitration_rule, so the presence branch already fires. It earns no
    // suppression either — the harm this pattern names is that the settlement is
    // UNRECORDED, which is exactly what the state admits. What it buys is
    // triage, which lives in the remediation text.
    const states = allFilters()
      .filter((f) => f.property === 'arbitration_state')
      .map((f) => f.value)
    expect(states).not.toContain('enforced_undocumented')
    expect(states).not.toContain('enforced_documented')
    const ap = getAntiPatternById('contended-surface-without-arbitration')
    expect(ap?.remediation).toContain('enforced_undocumented')
    expect(ap?.remediation).toContain('safe_by_coincidence')
  })

  it('safe_by_coincidence did NOT get its own anti-pattern', () => {
    // Restraint until evidence. A second detector would fire on the same graphs
    // and double-report through type-keyed attribution, making this family
    // noisier on its first real deployment — the exact failure the chained
    // exemption exists to fix. The reporter did not ask for one.
    const surfaceAps = UPG_ANTI_PATTERNS.filter((ap) => ap.id.includes('surface'))
    expect(surfaceAps.map((ap) => ap.id).sort()).toEqual([
      'contended-surface-without-arbitration',
      'surface-without-job',
      'surface-without-measurement',
    ])
  })

  it('the catalog declares exactly one edge-count spec, and it is the contention check', () => {
    // UPG_EDGE_COUNT_SPECS is derived from the conditions themselves, so it
    // cannot drift from them. Pinning its contents pins the collector contract:
    // the collector computes exactly these per-node tallies and no others.
    expect(UPG_EDGE_COUNT_SPECS).toEqual([
      {
        entity_type: 'surface',
        edge_type: 'feature_occupies_surface',
        direction: 'inbound',
        property: 'capacity',
        property_absent_default: 1,
        node_comparison: 'gt',
        node_filter: { property: 'arbitration_rule', present: false },
        except_property: 'composition_mode',
        except_value: 'chained',
      },
    ])
    // The key is what collector and evaluator must agree on; neither spells it
    // inline, and every discriminating field is in it.
    expect(edgeCountSpecKey(UPG_EDGE_COUNT_SPECS[0]!)).toBe(
      'surface|feature_occupies_surface|inbound|capacity|1|gt|arbitration_rule=absent|composition_mode=chained',
    )
  })

  it('edge_count_vs_property contributes its entity_type to target_entities', () => {
    // Regression guard. `collectTargetEntities` walks the condition for the
    // types a violation is about; a missing case for this check form is masked
    // wherever a sibling check names the same type (as it is in the contention
    // pattern, whose entity_count gate also says `surface`). It bites the first
    // pattern whose ONLY typed check is this form: target_entities comes back
    // empty, and the violation becomes unreachable through the type half of
    // every consumer. Asserted here against a condition built for the purpose,
    // so the mask cannot hide it.
    const pureCondition: IntelligenceCondition = {
      check: {
        type: 'edge_count_vs_property',
        entity_type: 'surface',
        edge_type: 'feature_occupies_surface',
        property: 'capacity',
        property_absent_default: 1,
        node_comparison: 'gt',
        comparison: 'nonzero',
      },
    }
    expect(collectTargetEntities(pureCondition)).toEqual(['surface'])
  })

  it('the except-spec list is now empty, and that is the 0.29.0 move rather than a regression', () => {
    // Its one declarer was this same contention branch, which moved to the
    // per-node form because the aggregate could not ask "over capacity" and "no
    // rule" of the SAME surface. The mechanism stays supported and tested for
    // the next detector that needs an intersection of two marginals; it simply
    // has no declarer today. Pinned so the emptiness is a recorded decision
    // rather than something a reader has to reverse-engineer.
    expect(UPG_PRESENCE_EXCEPT_SPECS).toEqual([])
    expect(presenceExceptKey('arbitration_rule', 'composition_mode', 'chained')).toBe(
      'arbitration_rule!composition_mode=chained',
    )
  })

  it('the two companions are thin-graph advisory; the contention one is not', () => {
    expect(COVERAGE_ANTI_PATTERNS.has('surface-without-job')).toBe(true)
    expect(COVERAGE_ANTI_PATTERNS.has('surface-without-measurement')).toBe(true)
    expect(COVERAGE_ANTI_PATTERNS.has('contended-surface-without-arbitration')).toBe(false)
  })
})
