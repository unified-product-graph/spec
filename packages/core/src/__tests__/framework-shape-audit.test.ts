/**
 * Framework Shape Audit — Regression Gates
 *
 * Wires `scripts/audit-framework-shape.ts` into vitest as a CI gate.
 *
 *   Blocker-class issues fail the build for the four documented showcase
 *   frameworks:
 *     - rice-scoring
 *     - kano-model
 *     - wardley-map
 *     - business-model-canvas
 *
 *   The full 216-framework sweep is reported via a console.warn but does
 *   not fail the build — wider remediation is tracked separately and is
 *   out of scope for this PR.
 *
 *   A negative test runs the linter against an intentionally-broken
 *   fixture to prove the detector actually fires.
 */

import { describe, it, expect } from 'vitest'
import { runFrameworkShapeAudit } from '../frameworks/audit-shape.js'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/index.js'
import { getPropertySchema } from '../properties/property-schema.js'
import type { UPGFramework } from '../frameworks/types.js'

describe('Framework Shape Audit — showcase frameworks must be clean', () => {
  const SHOWCASE_IDS = [
    'rice-scoring',
    'kano-model',
    'wardley-map',
    'business-model-canvas',
  ] as const

  const result = runFrameworkShapeAudit()
  const byId = new Map(result.reports.map((r) => [r.framework_id, r]))

  for (const id of SHOWCASE_IDS) {
    it(`${id} has zero blocker-class issues`, () => {
      const report = byId.get(id)
      expect(report, `Framework "${id}" missing from UPG_FRAMEWORKS`).toBeDefined()
      const blockers = (report?.issues ?? []).filter((i) => i.severity === 'blocker')
      expect(
        blockers,
        `${id} has blocker issues:\n${blockers.map((b) => `  - [${b.kind}] ${b.location}: ${b.detail}`).join('\n')}`,
      ).toEqual([])
    })
  }
})

describe('Framework Shape Audit — sweep report', () => {
  it('records baseline blocker count for the wider catalog (warn-only)', () => {
    // This test is informational. It does NOT fail when blockers exist in
    // non-showcase frameworks — wider remediation lives in a follow-up PR.
    // We assert only that the audit ran and produced numeric counts.
    const result = runFrameworkShapeAudit()
    expect(result.summary.total_frameworks).toBeGreaterThan(0)
    expect(result.summary.by_severity.blocker).toBeGreaterThanOrEqual(0)

    if (result.summary.by_severity.blocker > 0) {
      console.warn(
        `[framework-shape-audit] ${result.summary.by_severity.blocker} blocker issues across ` +
          `${result.summary.total_frameworks - result.summary.clean_frameworks} non-clean frameworks. ` +
          `Showcase frameworks are gated; wider sweep is deferred.`,
      )
    }
  })

  it('PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE is zero across all frameworks (bulk fix gate)', () => {
    // bulk fix: all 212 column-drift frameworks repaired.
    // This category must stay at zero — any regression here is a blocker.
    const result = runFrameworkShapeAudit()
    const count = result.summary.by_kind.PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE
    const offenders = result.reports
      .filter((r) => r.issues.some((i) => i.kind === 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE'))
      .map((r) => `  - ${r.framework_id}: ${r.issues.filter((i) => i.kind === 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE').map((i) => i.location).join(', ')}`)
    expect(
      count,
      `${count} PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE blocker(s) still present:\n${offenders.join('\n')}`,
    ).toBe(0)
  })
})

describe('Framework Shape Audit — Seam 2 required-property renames (DT class A)', () => {
  // The free renames: the entity already carries the property under another
  // name, so the framework's required_property must point at the REAL key.
  // These assert the rename landed and the stale name is gone.
  it('pirate-metrics-aarrr requires metric.metric_category (not lifecycle_stage)', () => {
    const fw = UPG_FRAMEWORKS_BY_ID['pirate-metrics-aarrr']
    const props = (fw.data?.required_properties?.metric ?? []).map((p) => p.property)
    expect(props).toContain('metric_category')
    expect(props).not.toContain('lifecycle_stage')
    expect(getPropertySchema('metric')).toHaveProperty('metric_category')
  })

  it('north-star-metric requires metric.designation (not metric_role)', () => {
    const fw = UPG_FRAMEWORKS_BY_ID['north-star-metric']
    const props = (fw.data?.required_properties?.metric ?? []).map((p) => p.property)
    expect(props).toContain('designation')
    expect(props).not.toContain('metric_role')
    expect(getPropertySchema('metric')).toHaveProperty('designation')
  })

  it('raid-log severity closes over real risk properties (probability, impact)', () => {
    const fw = UPG_FRAMEWORKS_BY_ID['raid-log']
    const riskProps = (fw.data?.required_properties?.risk ?? []).map((p) => p.property)
    expect(riskProps).toEqual(expect.arrayContaining(['probability', 'impact']))
    const dataTypes = (fw.data?.entity_types ?? []).map((e) => e.type)
    expect(dataTypes).toContain('risk')
    const riskSchema = getPropertySchema('risk')!
    expect(riskSchema).toHaveProperty('probability')
    expect(riskSchema).toHaveProperty('impact')
  })

  it('the resolved-rename frameworks emit no REQUIRED_PROPERTY_NOT_ON_ENTITY for their renamed prop', () => {
    const result = runFrameworkShapeAudit()
    const byId = new Map(result.reports.map((r) => [r.framework_id, r]))
    const renamed: Record<string, string> = {
      'pirate-metrics-aarrr': 'lifecycle_stage',
      'north-star-metric': 'metric_role',
    }
    for (const [id, staleProp] of Object.entries(renamed)) {
      const issues = byId.get(id)?.issues ?? []
      const stale = issues.filter(
        (i) => i.kind === 'REQUIRED_PROPERTY_NOT_ON_ENTITY' && i.location.includes(staleProp),
      )
      expect(stale, `${id} still references stale property "${staleProp}"`).toEqual([])
    }
  })

  it('exempts framework-scoped scoring inputs from the entity-schema check', () => {
    // A `scope: 'framework'` required_property is a framework-scoped scoring
    // input, not an intrinsic entity property. The audit must NOT flag it even
    // though the entity schema does not define it — that is the whole point of
    // the scoping mechanism (replaces the old DEFERRED_REQUIRED_PROPERTY_FRAMEWORKS
    // allow-list). Same key, marked entity-scoped, MUST flag.
    const frameworkScoped: UPGFramework = {
      id: 'fixture-framework-scoped-input',
      name: 'Framework Scoped Input',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {
          feature: [
            // `made_up_score` is NOT a feature property, but it is declared as a
            // framework-scoped scoring input → exempt by design.
            { property: 'made_up_score', type: 'number', required: true, scope: 'framework' },
          ],
        },
      },
      structure: { pattern: 'collection' },
      presentation: { layout: { type: 'grid', groupBy: 'type' } },
      education: { purpose: '', core_question: '', when_to_use: [], when_not_to_use: [] },
    }
    const exempt = runFrameworkShapeAudit([frameworkScoped]).reports[0].issues
    expect(
      exempt.find((i) => i.kind === 'REQUIRED_PROPERTY_NOT_ON_ENTITY'),
      'framework-scoped input must not be flagged as a missing entity property',
    ).toBeUndefined()

    // Same key, entity-scoped (default), MUST flag — the rule still bites for
    // intrinsic claims.
    const entityScoped: UPGFramework = {
      ...frameworkScoped,
      id: 'fixture-entity-scoped-input',
      data: {
        ...frameworkScoped.data,
        required_properties: {
          feature: [{ property: 'made_up_score', type: 'number', required: true, scope: 'entity' }],
        },
      },
    }
    const flagged = runFrameworkShapeAudit([entityScoped]).reports[0].issues
    expect(
      flagged.find((i) => i.kind === 'REQUIRED_PROPERTY_NOT_ON_ENTITY'),
      'entity-scoped input absent from schema must still flag',
    ).toBeDefined()
  })

  it('canonical scoring frameworks pass with zero blockers, scoring inputs are framework-scoped (/)', () => {
    // rice/kano/moscow/wardley + the promoted ice/wsjf/cost-of-delay declare
    // their scoring inputs (reach/impact/…, functional_response/…, moscow,
    // evolution_stage/visibility, impact/confidence/ease, user_value/…/job_size,
    // cost_of_delay/job_size). None are intrinsic entity properties; all must
    // carry scope:'framework' and the audit must pass by design (no blockers,
    // no REQUIRED_PROPERTY gap).
    const result = runFrameworkShapeAudit()
    const byId = new Map(result.reports.map((r) => [r.framework_id, r]))
    for (const id of [
      'rice-scoring',
      'kano-model',
      'moscow',
      'wardley-map',
      'ice-scoring',
      'wsjf',
      'cost-of-delay',
    ]) {
      const report = byId.get(id)
      expect(report, `${id} missing from canonical UPG_FRAMEWORKS`).toBeDefined()
      const blockers = (report?.issues ?? []).filter((i) => i.severity === 'blocker')
      expect(blockers, `${id} blockers:\n${blockers.map((b) => `  - [${b.kind}] ${b.location}`).join('\n')}`).toEqual([])
      const reqGaps = (report?.issues ?? []).filter((i) => i.kind === 'REQUIRED_PROPERTY_NOT_ON_ENTITY')
      expect(reqGaps, `${id} should have no entity-property gaps (inputs are framework-scoped)`).toEqual([])
      // Assert every declared required_property on these frameworks is framework-scoped.
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      for (const props of Object.values(fw.data?.required_properties ?? {})) {
        for (const p of props) {
          expect(p.scope, `${id}.${p.property} must be scope:'framework'`).toBe('framework')
        }
      }
    }
  })

  it('detector flags a required_property absent from the entity schema', () => {
    const fixture: UPGFramework = {
      id: 'fixture-missing-required-prop',
      name: 'Missing Required Prop',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {
          feature: [
            // BAD: `definitely_not_a_feature_prop` is not in feature's schema
            { property: 'definitely_not_a_feature_prop', type: 'string', required: true },
          ],
        },
      },
      structure: { pattern: 'collection' },
      presentation: { layout: { type: 'grid', groupBy: 'type' } },
      education: { purpose: '', core_question: '', when_to_use: [], when_not_to_use: [] },
    }
    const result = runFrameworkShapeAudit([fixture])
    const issue = result.reports[0].issues.find(
      (i) => i.kind === 'REQUIRED_PROPERTY_NOT_ON_ENTITY',
    )
    expect(issue).toBeDefined()
    expect(issue?.detail).toContain('definitely_not_a_feature_prop')
  })
})

describe('Framework Shape Audit — negative tests (detector self-check)', () => {
  it('flags a column that references an entity type instead of a property', () => {
    const fixture: UPGFramework = {
      id: 'fixture-bad-column',
      name: 'Bad Column Fixture',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {
          feature: [
            { property: 'reach', type: 'number', required: true },
          ],
        },
      },
      structure: { pattern: 'table' },
      presentation: {
        layout: {
          type: 'table',
          columns: [
            // BAD: should be `reach` (the declared property), not `metric` (an entity type)
            { property: 'metric', label: 'Reach' },
          ],
        },
      },
      education: {
        purpose: '',
        core_question: '',
        when_to_use: [],
        when_not_to_use: [],
      },
    }

    const result = runFrameworkShapeAudit([fixture])
    const issues = result.reports[0].issues
    expect(issues.some((i) => i.kind === 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE')).toBe(true)
    expect(issues.find((i) => i.kind === 'PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE')?.severity).toBe(
      'blocker',
    )
  })

  it('flags a computed_property expression referencing an undefined identifier', () => {
    const fixture: UPGFramework = {
      id: 'fixture-bad-expression',
      name: 'Bad Expression Fixture',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {
          feature: [
            { property: 'reach', type: 'number', required: true },
          ],
        },
        computed_properties: [
          {
            property: 'score',
            // BAD: `impact` is not declared
            expression: 'reach * impact',
            entity_type: 'feature',
          },
        ],
      },
      structure: { pattern: 'table' },
      presentation: {
        layout: { type: 'table', columns: [{ property: 'reach', label: 'Reach' }] },
      },
      education: {
        purpose: '',
        core_question: '',
        when_to_use: [],
        when_not_to_use: [],
      },
    }

    const result = runFrameworkShapeAudit([fixture])
    const issues = result.reports[0].issues
    const undef = issues.find((i) => i.kind === 'COMPUTED_EXPRESSION_UNDEFINED_VARIABLE')
    expect(undef).toBeDefined()
    expect(undef?.severity).toBe('blocker')
    expect(undef?.detail).toContain('impact')
  })

  it('flags a slot whose entityTypeId is missing from data.entity_types', () => {
    const fixture: UPGFramework = {
      id: 'fixture-slot-data-drift',
      name: 'Slot Drift Fixture',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      slots: [
        // BAD: persona slot but persona is not in data.entity_types
        { label: 'Anchor', entityTypeId: 'persona' },
      ],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {},
      },
      structure: { pattern: 'collection' },
      presentation: {
        layout: { type: 'grid', groupBy: 'type' },
      },
      education: {
        purpose: '',
        core_question: '',
        when_to_use: [],
        when_not_to_use: [],
      },
    }

    const result = runFrameworkShapeAudit([fixture])
    const issues = result.reports[0].issues
    const drift = issues.find(
      (i) => i.kind === 'SLOT_DATA_DRIFT' && i.severity === 'blocker',
    )
    expect(drift).toBeDefined()
    expect(drift?.detail).toContain('persona')
  })

  it('does not flag a clean framework', () => {
    const fixture: UPGFramework = {
      id: 'fixture-clean',
      name: 'Clean Fixture',
      version: '0.0.0',
      description: '',
      category: 'prioritization',
      origin: { type: 'custom' },
      tags: [],
      slots: [{ label: 'Items', entityTypeId: 'feature' }],
      data: {
        entity_types: [{ type: 'feature', role: 'item' }],
        required_properties: {
          feature: [
            { property: 'reach', type: 'number', required: true },
            { property: 'impact', type: 'number', required: true },
          ],
        },
        computed_properties: [
          {
            property: 'score',
            expression: 'reach * impact',
            entity_type: 'feature',
          },
        ],
      },
      structure: { pattern: 'table' },
      presentation: {
        layout: {
          type: 'table',
          columns: [
            { property: 'title', label: 'Item' },
            { property: 'reach', label: 'Reach' },
            { property: 'impact', label: 'Impact' },
            { property: 'score', label: 'Score' },
          ],
        },
      },
      education: {
        purpose: '',
        core_question: '',
        when_to_use: [],
        when_not_to_use: [],
      },
    }

    const result = runFrameworkShapeAudit([fixture])
    const blockers = result.reports[0].issues.filter((i) => i.severity === 'blocker')
    expect(blockers).toEqual([])
  })
})
