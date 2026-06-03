/**
 * Scoring-method expander — correctness + regression gate.
 *
 * The six scoring frameworks (rice/ice/cost-of-delay/wsjf/kano-model/raid-log)
 * declare their inputs + formula ONCE via `data.scoring_method` and list the types
 * they `applies_to`; `expandFramework` derives the per-type `required_properties`
 * and `computed_properties` at the `definitions/` aggregation boundary. (kano
 * computes Kano satisfaction coefficients and raid-log a risk severity, not a
 * priority rank — the same inputs-to-computed mechanism.)
 *
 * The proof that the method is a faithful refactor: each expanded scorer, with the
 * new `scoring_method` field removed, must be byte-for-byte equal to the baseline
 * (`fixtures/scoring-method-baseline.json`). If a future edit to a definition or
 * to the expander changes a scorer's expanded shape, this test fails. Note:
 * kano-model's `feature` was intentionally promoted role item -> scored_item as
 * part of the conversion (so the method invariant holds: applies_to types are
 * scored types); its required_properties + computed_properties stay identical.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/definitions/index.js'
import { expandFramework, type UPGFrameworkSource } from '../frameworks/expand-scoring-method.js'
import type { UPGFramework } from '../frameworks/types.js'

const SCORERS = ['rice-scoring', 'ice-scoring', 'cost-of-delay', 'wsjf', 'kano-model', 'raid-log'] as const

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseline: Record<string, UPGFramework> = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'scoring-method-baseline.json'), 'utf8'),
)

// The method derives the DATA layer only; these are the fields it produces.
const DERIVED_KEYS = ['entity_types', 'required_properties', 'computed_properties'] as const

describe('scoring-method — the four scorers expand to the pre-conversion baseline', () => {
  for (const id of SCORERS) {
    it(`${id}: authored with a method; derived data layer matches the pre-method baseline`, () => {
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      expect(fw, `${id} present`).toBeDefined()
      // It is authored with a method...
      expect(fw.data.scoring_method, `${id} has a scoring_method`).toBeDefined()
      // ...and each DERIVED data-layer field is byte-identical to what the
      // framework declared by hand before the method conversion. Other layers
      // (description, slots, presentation, education) are outside the method's
      // scope and may change independently (e.g. editorial truth fixes), so the
      // proof is scoped to exactly what the expander produces.
      for (const key of DERIVED_KEYS) {
        expect(fw.data[key], `${id}.data.${key}`).toEqual(baseline[id].data[key])
      }
    })
  }

  it('every scorer derives required_properties + computed for each applies_to type', () => {
    for (const id of SCORERS) {
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      const method = fw.data.scoring_method!
      // required_properties keys == applies_to, each === inputs.
      expect(Object.keys(fw.data.required_properties)).toEqual(method.applies_to)
      for (const t of method.applies_to) {
        expect(fw.data.required_properties[t]).toEqual(method.inputs)
      }
      // one computed per (applies_to type × method.computed), entity_type filled in.
      const computed = method.computed ?? []
      expect(fw.data.computed_properties ?? []).toHaveLength(method.applies_to.length * computed.length)
      for (const cp of fw.data.computed_properties ?? []) {
        expect(method.applies_to).toContain(cp.entity_type)
      }
    }
  })
})

describe('expandFramework — unit behaviour', () => {
  it('passes a non-method framework through unchanged (idempotent)', () => {
    const expanded = UPG_FRAMEWORKS_BY_ID['moscow'] // not a method framework
    const out = expandFramework(expanded as unknown as UPGFrameworkSource)
    expect(out).toEqual(expanded)
  })

  it('derives required_properties + computed_properties from a synthetic method', () => {
    const src: UPGFrameworkSource = {
      id: 'synthetic',
      approach_ids: [],
      name: 'Synthetic',
      version: '1.0.0',
      description: 'test',
      category: 'prioritization',
      tags: [],
      slots: [],
      data: {
        entity_types: [
          { type: 'feature', role: 'scored_item' },
          { type: 'opportunity', role: 'scored_item' },
        ],
        scoring_method: {
          applies_to: ['feature', 'opportunity'],
          inputs: [{ property: 'x', type: 'number', required: true, scope: 'framework', label: 'X' }],
          computed: [{ property: 'y', expression: 'x * 2', label: 'Y', format: 'number' }],
        },
      },
      structure: { pattern: 'table' },
      presentation: { layout: { type: 'table', columns: [] } },
      education: { purpose: 'p', core_question: 'q', when_to_use: [], when_not_to_use: [] },
    } as unknown as UPGFrameworkSource

    const out = expandFramework(src)
    expect(Object.keys(out.data.required_properties)).toEqual(['feature', 'opportunity'])
    expect(out.data.required_properties.feature).toEqual(out.data.required_properties.opportunity)
    expect(out.data.computed_properties).toEqual([
      { property: 'y', expression: 'x * 2', entity_type: 'feature', label: 'Y', format: 'number' },
      { property: 'y', expression: 'x * 2', entity_type: 'opportunity', label: 'Y', format: 'number' },
    ])
    // method is retained on the expanded output.
    expect(out.data.scoring_method).toEqual(src.data.scoring_method)
  })
})
