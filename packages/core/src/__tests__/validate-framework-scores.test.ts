/**
 * — framework-score validation, plus (non-object `properties`)
 * and (non-array `nodes`/`edges`).
 *
 * Severity contract (spec-evolution discipline):
 *   - framework-score finding   -> WARNING (rule 'framework-score'); a drifted
 *                                  exercise still LOADS. `verify` re-classifies
 *                                  the tagged warning to a policy violation
 *                                  (exit 2) via CONTENT_DEPTH_WARNING_RULES.
 *   - non-object `properties`    -> ERROR; the field is malformed,
 *                                  not merely drifted.
 *   - non-array `nodes`/`edges`  -> ERROR; a present-but-wrong-type
 *                                  array would otherwise throw a raw TypeError
 *                                  downstream.
 *
 * A framework_exercise persists each entity's score on its
 * `framework_exercise_includes_node` edge `properties`. These are checked
 * against the framework's OWN input spec (`data.required_properties[type]`):
 * MoSCoW = enum bucket; RICE = 1..5 assessment with `effort` as a divisor;
 * WSJF = raw numbers with `job_size` as a divisor.
 */

import { describe, it, expect } from 'vitest'
import {
  validateUPGDocument,
  CONTENT_DEPTH_WARNING_RULES,
  type UPGValidationWarning,
} from '../grammar/validate.js'

const baseDoc = (
  nodes: Array<Record<string, unknown>>,
  edges: Array<Record<string, unknown>> = [],
) => ({
  upg_version: '0.2.4',
  exported_at: '2026-04-27T20:00:00Z',
  source: { tool: 'test', tool_version: '0.0.0' },
  product: { id: 'p_test', title: 'Test product' },
  nodes,
  edges,
})

const scoreWarnings = (warnings: UPGValidationWarning[]) =>
  warnings.filter((w) => w.rule === 'framework-score')

/**
 * Build a document with one framework_exercise of `frameworkId`, one scored
 * `feature`, and an includes-edge carrying `score` as its edge properties.
 */
const exerciseDoc = (frameworkId: string, score: Record<string, unknown>) =>
  baseDoc(
    [
      {
        id: 'ex1',
        type: 'framework_exercise',
        title: `${frameworkId} run`,
        properties: { framework_id: frameworkId },
      },
      { id: 'f1', type: 'feature', title: 'A feature' },
    ],
    [
      {
        id: 'inc1',
        type: 'framework_exercise_includes_node',
        source: 'ex1',
        target: 'f1',
        properties: score,
      },
    ],
  )

describe('framework-score validation', () => {
  describe('MoSCoW enum buckets', () => {
    it('warns on an invalid moscow bucket', () => {
      const result = validateUPGDocument(exerciseDoc('moscow', { moscow: 'maybe' }))
      const findings = scoreWarnings(result.warnings)
      expect(findings.length).toBe(1)
      expect(findings[0].path).toBe('$.edges[0].properties.moscow')
      expect(findings[0].message).toContain('"maybe"')
      expect(findings[0].message).toContain('must')
    })

    it('accepts a valid moscow bucket', () => {
      const result = validateUPGDocument(exerciseDoc('moscow', { moscow: 'must' }))
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('warns when an enum bucket is a non-string', () => {
      const result = validateUPGDocument(exerciseDoc('moscow', { moscow: 3 }))
      const findings = scoreWarnings(result.warnings)
      expect(findings.length).toBe(1)
      expect(findings[0].message).toContain('number')
    })

    it('does NOT flip valid for a framework-score finding (warning, not error)', () => {
      const result = validateUPGDocument(exerciseDoc('moscow', { moscow: 'maybe' }))
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })
  })

  describe('RICE assessment scales + divisor', () => {
    it('warns on an off-scale reach value', () => {
      // reach is a 1..5 assessment (reach_5); 800 is the classic raw-number bug.
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', { reach: 800, impact: 3, confidence: 4, effort: 2 }),
      )
      const findings = scoreWarnings(result.warnings)
      expect(findings.some((w) => w.path.endsWith('.reach'))).toBe(true)
      const reach = findings.find((w) => w.path.endsWith('.reach'))!
      expect(reach.message).toContain('800')
      expect(reach.message).toContain('reach_5')
    })

    it('warns on effort: 0 (zero divisor in the RICE formula)', () => {
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', { reach: 3, impact: 3, confidence: 4, effort: 0 }),
      )
      const findings = scoreWarnings(result.warnings)
      const effort = findings.find((w) => w.path.endsWith('.effort'))
      expect(effort).toBeDefined()
      // 0 is below the effort_5 floor of 1, so the range message fires.
      expect(effort!.message).toContain('effort')
    })

    it('accepts in-scale RICE inputs', () => {
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', { reach: 3, impact: 4, confidence: 5, effort: 2 }),
      )
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('accepts an assessment object with a numeric value field', () => {
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', {
          reach: { value: 3, label: 'High' },
          impact: { value: 4, label: 'High' },
          confidence: { value: 5, label: 'Certain' },
          effort: { value: 2, label: 'Low' },
        }),
      )
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('warns when an assessment input is a non-numeric string', () => {
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', { reach: 'lots', impact: 3, confidence: 4, effort: 2 }),
      )
      const findings = scoreWarnings(result.warnings)
      expect(findings.some((w) => w.path.endsWith('.reach'))).toBe(true)
    })
  })

  describe('WSJF raw-number inputs + divisor', () => {
    it('warns on job_size: 0 (zero divisor in the WSJF formula)', () => {
      const result = validateUPGDocument(
        exerciseDoc('wsjf', {
          user_value: 5,
          time_criticality: 3,
          risk_reduction: 2,
          job_size: 0,
        }),
      )
      const findings = scoreWarnings(result.warnings)
      const jobSize = findings.find((w) => w.path.endsWith('.job_size'))
      expect(jobSize).toBeDefined()
      expect(jobSize!.message).toContain('divisor')
    })

    it('warns on a negative numeric input', () => {
      const result = validateUPGDocument(
        exerciseDoc('wsjf', {
          user_value: -3,
          time_criticality: 3,
          risk_reduction: 2,
          job_size: 5,
        }),
      )
      const findings = scoreWarnings(result.warnings)
      const userValue = findings.find((w) => w.path.endsWith('.user_value'))
      expect(userValue).toBeDefined()
      expect(userValue!.message).toContain('negative')
    })

    it('accepts well-formed WSJF numbers', () => {
      const result = validateUPGDocument(
        exerciseDoc('wsjf', {
          user_value: 8,
          time_criticality: 3,
          risk_reduction: 2,
          job_size: 5,
        }),
      )
      expect(scoreWarnings(result.warnings)).toEqual([])
    })
  })

  describe('Kano parenthesised-sum denominator (no false positive)', () => {
    // Kano's satisfaction coefficient divides by a SUM:
    // `(delighter_count + performance_count + must_be_count + indifferent_count)`.
    // No single count is a must-not-be-zero divisor — any one can be 0 while the
    // sum stays positive. The old heuristic captured the first term and flagged a
    // legitimate `delighter_count: 0`; it must not.
    it('does NOT flag delighter_count: 0 as a zero divisor', () => {
      const result = validateUPGDocument(
        exerciseDoc('kano-model', {
          functional_response: 'i_like_it',
          dysfunctional_response: 'i_dislike_it',
          delighter_count: 0,
          performance_count: 5,
          must_be_count: 3,
          indifferent_count: 2,
        }),
      )
      expect(scoreWarnings(result.warnings)).toEqual([])
    })
  })

  describe('conservative skips (no false positives)', () => {
    it('skips an unknown framework_id rather than flagging', () => {
      const result = validateUPGDocument(exerciseDoc('not-a-framework-xyz', { moscow: 'maybe' }))
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('skips a missing (absent) score input', () => {
      // moscow not provided at all: required-property absence is out of scope
      // for this depth check (apply/score surfaces missing_properties).
      const result = validateUPGDocument(exerciseDoc('moscow', {}))
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('skips an includes-edge with no score properties', () => {
      const doc = baseDoc(
        [
          { id: 'ex1', type: 'framework_exercise', title: 'run', properties: { framework_id: 'moscow' } },
          { id: 'f1', type: 'feature', title: 'A feature' },
        ],
        [{ id: 'inc1', type: 'framework_exercise_includes_node', source: 'ex1', target: 'f1' }],
      )
      const result = validateUPGDocument(doc)
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('skips a scored entity type the framework does not declare inputs for', () => {
      // MoSCoW declares inputs for `feature` only; a `persona` target has no
      // requirement list, so nothing is checked.
      const doc = baseDoc(
        [
          { id: 'ex1', type: 'framework_exercise', title: 'run', properties: { framework_id: 'moscow' } },
          { id: 'p1', type: 'persona', title: 'A persona' },
        ],
        [
          {
            id: 'inc1',
            type: 'framework_exercise_includes_node',
            source: 'ex1',
            target: 'p1',
            properties: { moscow: 'maybe' },
          },
        ],
      )
      const result = validateUPGDocument(doc)
      expect(scoreWarnings(result.warnings)).toEqual([])
    })

    it('tags every framework-score finding with the recognised rule code', () => {
      const result = validateUPGDocument(
        exerciseDoc('rice-scoring', { reach: 800, impact: 3, confidence: 4, effort: 0 }),
      )
      const findings = scoreWarnings(result.warnings)
      expect(findings.length).toBeGreaterThanOrEqual(2)
      for (const w of findings) {
        expect(CONTENT_DEPTH_WARNING_RULES.has(w.rule!)).toBe(true)
      }
    })
  })
})

describe('non-object node properties', () => {
  it('errors when properties is a number', () => {
    const result = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A', properties: 42 }]))
    expect(result.valid).toBe(false)
    const err = result.errors.find((e) => e.path === '$.nodes[0].properties')
    expect(err).toBeDefined()
    expect(err!.message).toContain('plain object')
    expect(err!.message).toContain('number')
  })

  it('errors when properties is an array', () => {
    const result = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A', properties: [1, 2, 3] }]))
    expect(result.valid).toBe(false)
    const err = result.errors.find((e) => e.path === '$.nodes[0].properties')
    expect(err).toBeDefined()
    expect(err!.message).toContain('array')
  })

  it('errors when properties is a boolean', () => {
    const result = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A', properties: true }]))
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.path === '$.nodes[0].properties')).toBe(true)
  })

  it('accepts a well-formed object (and null/absent) properties', () => {
    const withObj = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A', properties: {} }]))
    expect(withObj.errors.some((e) => e.path === '$.nodes[0].properties')).toBe(false)

    const withNull = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A', properties: null }]))
    expect(withNull.errors.some((e) => e.path === '$.nodes[0].properties')).toBe(false)

    const absent = validateUPGDocument(baseDoc([{ id: 'n1', type: 'persona', title: 'A' }]))
    expect(absent.errors.some((e) => e.path === '$.nodes[0].properties')).toBe(false)
  })
})

describe('non-array nodes / edges', () => {
  it('errors with a clear message when nodes is present but not an array', () => {
    const doc = {
      upg_version: '0.2.4',
      exported_at: '2026-04-27T20:00:00Z',
      source: { tool: 'test', tool_version: '0.0.0' },
      product: { id: 'p_test', title: 'Test product' },
      nodes: 42,
      edges: [],
    }
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    const err = result.errors.find((e) => e.path === '$.nodes')
    expect(err).toBeDefined()
    expect(err!.message).toContain('must be an array')
    expect(err!.message).toContain('number')
  })

  it('errors when edges is present but not an array', () => {
    const doc = {
      upg_version: '0.2.4',
      exported_at: '2026-04-27T20:00:00Z',
      source: { tool: 'test', tool_version: '0.0.0' },
      product: { id: 'p_test', title: 'Test product' },
      nodes: [{ id: 'n1', type: 'persona', title: 'A' }],
      edges: { not: 'an array' },
    }
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    const err = result.errors.find((e) => e.path === '$.edges')
    expect(err).toBeDefined()
    expect(err!.message).toContain('must be an array')
    expect(err!.message).toContain('object')
  })

  it('still reports the missing case as required', () => {
    const doc = {
      upg_version: '0.2.4',
      exported_at: '2026-04-27T20:00:00Z',
      source: { tool: 'test', tool_version: '0.0.0' },
      product: { id: 'p_test', title: 'Test product' },
      edges: [],
    }
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    const err = result.errors.find((e) => e.path === '$.nodes')
    expect(err).toBeDefined()
    expect(err!.message).toContain('required')
  })
})
