/**
 * Relational / join surface — validator and path-resolution gates.
 *
 * Criteria are written in the D-1 DURABLE CITATION FORM: a criterion naming an
 * exact value is pinned by a named test whose assertion text states the value,
 * so a record can cite `file + test name + assertion text` rather than a
 * `file:line` coordinate that rots the moment lines shift above it.
 *
 * Criterion ids map to `relational-join-adapter-2026-08-07.md` §8 (AC-R*).
 */

import { describe, it, expect } from 'vitest'
import { validateUPGFramework } from '../frameworks/validate.js'
import { resolveRelationalPath, relationalCoveredEntityTypes } from '../frameworks/relational-paths.js'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/definitions/index.js'
import type { UPGFramework } from '../frameworks/types.js'

/** A minimal valid framework, so each test perturbs exactly one thing. */
function baseFramework(relational: unknown): unknown {
  return {
    id: 'test-relational',
    name: 'Test Relational',
    version: '1.0.0',
    description: 'Fixture for relational-block validation.',
    category: 'validation',
    origin: { type: 'practitioner', attribution: 'Fixture' },
    tags: ['validation', 'table'],
    data: {
      entity_types: [{ type: 'experiment_run', role: 'scored_item' }],
      required_properties: {},
    },
    structure: { pattern: 'table' },
    presentation: { layout: { type: 'table', columns: [] } },
    education: {
      purpose: 'p',
      core_question: 'q',
      when_to_use: ['a'],
      when_not_to_use: ['b'],
    },
    relational,
  }
}

const FIELD_COLUMN = { kind: 'field', id: 'experiment', label: 'Experiment', property: 'title' }
const VALID_SORT = { column: 'experiment', direction: 'asc' }

// ─── Path resolution ────────────────────────────────────────────────────────

describe('relational path resolution', () => {
  it('AC-R2: a two-hop REVERSE path from experiment_run lands on hypothesis', () => {
    const resolved = resolveRelationalPath('experiment_run', [
      { edge: 'experiment_plan_ran_as_experiment_run', direction: 'reverse' },
      { edge: 'hypothesis_requires_experiment_plan', direction: 'reverse' },
    ])
    expect(resolved.reason).toBeNull()
    // The intermediate is experiment_plan and the endpoint is hypothesis.
    expect(resolved.steps.map((s) => s.to)).toEqual(['experiment_plan', 'hypothesis'])
    expect(resolved.endpoint).toBe('hypothesis')
  })

  it('a single-hop FORWARD path from experiment_run lands on learning', () => {
    const resolved = resolveRelationalPath('experiment_run', [
      { edge: 'experiment_run_produces_learning', direction: 'forward' },
    ])
    expect(resolved.endpoint).toBe('learning')
    expect(resolved.reason).toBeNull()
  })

  it('direction is READ, never inferred: the same edge reversed lands on the other end', () => {
    const fwd = resolveRelationalPath('experiment_plan', [
      { edge: 'experiment_plan_ran_as_experiment_run', direction: 'forward' },
    ])
    const rev = resolveRelationalPath('experiment_run', [
      { edge: 'experiment_plan_ran_as_experiment_run', direction: 'reverse' },
    ])
    expect(fwd.endpoint).toBe('experiment_run')
    expect(rev.endpoint).toBe('experiment_plan')
  })

  it('a path whose step does not compose fails, naming BOTH types', () => {
    // Walking the plan->run edge FORWARD requires being at experiment_plan.
    const resolved = resolveRelationalPath('experiment_run', [
      { edge: 'experiment_plan_ran_as_experiment_run', direction: 'forward' },
    ])
    expect(resolved.endpoint).toBeNull()
    expect(resolved.failedAt).toBe(0)
    expect(resolved.reason).toContain('enters at "experiment_plan"')
    expect(resolved.reason).toContain('the traversal is at "experiment_run"')
  })

  it('an unknown edge type fails as unknown, not as a type mismatch', () => {
    const resolved = resolveRelationalPath('experiment_run', [
      { edge: 'experiment_run_teleports_to_hypothesis', direction: 'forward' },
    ])
    expect(resolved.reason).toContain('unknown edge type')
  })

  it('covered entity types include INTERMEDIATES, not just endpoints', () => {
    const fw = {
      relational: {
        spine: 'experiment_run',
        columns: [
          {
            kind: 'projection',
            id: 'hypothesis',
            label: 'Hypothesis',
            path: [
              { edge: 'experiment_plan_ran_as_experiment_run', direction: 'reverse' },
              { edge: 'hypothesis_requires_experiment_plan', direction: 'reverse' },
            ],
            fields: ['title'],
          },
        ],
        sort: { column: 'hypothesis', direction: 'asc' },
      },
    } as unknown as UPGFramework
    const covered = relationalCoveredEntityTypes(fw)
    // experiment_plan is passed THROUGH, never landed on, and is still covered.
    expect([...covered].sort()).toEqual(['experiment_plan', 'experiment_run', 'hypothesis'])
  })
})

// ─── Validator: authoring errors ────────────────────────────────────────────

describe('relational block validation — malformed paths', () => {
  it('a projection with an EMPTY path is rejected', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [{ kind: 'projection', id: 'h', label: 'H', path: [], fields: ['title'] }],
        sort: { column: 'h', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('must be a non-empty array of { edge, direction } steps')
  })

  it('a path step with no direction is rejected — direction is never inferred', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [
          {
            kind: 'projection',
            id: 'h',
            label: 'H',
            path: [{ edge: 'experiment_run_produces_learning' }],
            fields: ['title'],
          },
        ],
        sort: { column: 'h', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('must be "forward" or "reverse" (never inferred)')
  })

  it('a path that does not compose from the spine is rejected at authoring time', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [
          {
            kind: 'projection',
            id: 'h',
            label: 'H',
            path: [{ edge: 'hypothesis_requires_experiment_plan', direction: 'forward' }],
            fields: ['title'],
          },
        ],
        sort: { column: 'h', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('does not compose from spine "experiment_run"')
  })

  it('a projection with no fields is rejected', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [
          {
            kind: 'projection',
            id: 'h',
            label: 'H',
            path: [{ edge: 'experiment_run_produces_learning', direction: 'forward' }],
            fields: [],
          },
        ],
        sort: { column: 'h', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('.fields is required on a projection column')
  })

  it('AC-R4: a non-integer or zero limit is rejected — it truncates rendering, never membership', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [
          {
            kind: 'projection',
            id: 'h',
            label: 'H',
            path: [{ edge: 'experiment_run_produces_learning', direction: 'forward' }],
            fields: ['title'],
            limit: 0,
          },
        ],
        sort: { column: 'h', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('must be a positive integer when present')
  })
})

describe('relational block validation — empty columns and spine', () => {
  it('an EMPTY columns array is rejected', () => {
    const result = validateUPGFramework(
      baseFramework({ spine: 'experiment_run', columns: [], sort: VALID_SORT })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('"relational.columns" is required and must be a non-empty array')
  })

  it('a MISSING spine is rejected', () => {
    const result = validateUPGFramework(baseFramework({ columns: [FIELD_COLUMN], sort: VALID_SORT }))
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('"relational.spine" is required')
  })

  it('AC-R1: a FIELD column declaring entityTypeId is rejected — the Status-trap guard', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [{ ...FIELD_COLUMN, entityTypeId: 'experiment_run' }],
        sort: VALID_SORT,
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('must NOT declare "entityTypeId"')
  })

  it('duplicate column ids are rejected', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [FIELD_COLUMN, { ...FIELD_COLUMN, label: 'Other' }],
        sort: VALID_SORT,
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('column ids must be unique within a surface')
  })

  it('an unknown column kind is rejected', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [{ kind: 'bucket', id: 'x', label: 'X' }],
        sort: { column: 'x', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('.kind must be one of: field, computed, projection')
  })

  it('sort.column must reference a declared column id — the order is declared, never inferred', () => {
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [FIELD_COLUMN],
        sort: { column: 'nope', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('is not a declared column id')
  })

  it('a missing sort block is rejected', () => {
    const result = validateUPGFramework(baseFramework({ spine: 'experiment_run', columns: [FIELD_COLUMN] }))
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('"relational.sort" is required')
  })
})

// ─── The divergence from partition semantics ────────────────────────────────

describe('AC-R5: columns are NOT mutually exclusive', () => {
  /**
   * THE GUARD AGAINST GENERALISING THE PARTITION RULE.
   *
   * A predicate zone's siblings must be mutually exclusive; a framework whose
   * predicates overlap is invalid. Columns are the OPPOSITE: two columns
   * admitting the same entity is the join working, and a validator that
   * rejected it would forbid the join this block exists to express.
   *
   * If a future change "unifies" the two validators, this test fails. That is
   * its whole purpose — do not relax it.
   */
  it('two projection columns over the SAME path and type validate cleanly', () => {
    const projection = (id: string) => ({
      kind: 'projection',
      id,
      label: id,
      path: [{ edge: 'experiment_run_produces_learning', direction: 'forward' }],
      fields: ['title'],
    })
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [projection('result_a'), projection('result_b')],
        sort: { column: 'result_a', direction: 'asc' },
      })
    )
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('a projection column may share its endpoint type with the SPINE', () => {
    // experiment_run -> experiment_run via the self-edge. A partition forbids an
    // entity being in two cells; a projection reports the edge and does not.
    const result = validateUPGFramework(
      baseFramework({
        spine: 'experiment_run',
        columns: [
          FIELD_COLUMN,
          {
            kind: 'projection',
            id: 'sub_runs',
            label: 'Sub-runs',
            path: [{ edge: 'experiment_run_tested_via_experiment_run', direction: 'forward' }],
            fields: ['title'],
          },
        ],
        sort: VALID_SORT,
      })
    )
    expect(result.valid).toBe(true)
  })
})

// ─── One roster, not two ────────────────────────────────────────────────────

describe('relational is the authoritative roster', () => {
  it('presentation.layout.columns must be EMPTY when relational is declared', () => {
    const fw = baseFramework({ spine: 'experiment_run', columns: [FIELD_COLUMN], sort: VALID_SORT }) as Record<
      string,
      unknown
    >
    ;(fw.presentation as { layout: { columns: unknown[] } }).layout.columns = [
      { property: 'title', label: 'Experiment' },
    ]
    const result = validateUPGFramework(fw)
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('Empty the presentation columns; do not maintain both')
  })

  it('declaring BOTH relational and slots warns — slots cannot express an edge path', () => {
    const fw = baseFramework({ spine: 'experiment_run', columns: [FIELD_COLUMN], sort: VALID_SORT }) as Record<
      string,
      unknown
    >
    fw.slots = [{ label: 'Experiment', entityTypeId: 'experiment_run' }]
    const result = validateUPGFramework(fw)
    expect(result.warnings.join('\n')).toContain('Remove "slots" from this framework')
  })

  it('a framework with NO relational block is entirely unaffected — the block is additive', () => {
    const fw = baseFramework(undefined) as Record<string, unknown>
    delete fw.relational
    ;(fw.presentation as { layout: { columns: unknown[] } }).layout.columns = [
      { property: 'title', label: 'Anything' },
    ]
    fw.slots = [{ label: 'Experiment', entityTypeId: 'experiment_run' }]
    const result = validateUPGFramework(fw)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })
})

// ─── The shipped declaration ────────────────────────────────────────────────

describe('experiment-tracker: the shipped relational declaration', () => {
  const fw = UPG_FRAMEWORKS_BY_ID['experiment-tracker'] as UPGFramework

  it('declares a relational block and NO slots', () => {
    expect(fw.relational).toBeDefined()
    expect(fw.slots).toBeUndefined()
  })

  it('is spined on experiment_run and validates cleanly', () => {
    expect(fw.relational?.spine).toBe('experiment_run')
    const result = validateUPGFramework(fw)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('Status is split: a "stage" field on status and a "verdict" field on disposition', () => {
    const byId = Object.fromEntries((fw.relational?.columns ?? []).map((c) => [c.id, c]))
    expect(byId.stage).toMatchObject({ kind: 'field', property: 'status' })
    expect(byId.verdict).toMatchObject({ kind: 'field', property: 'disposition' })
  })

  it('the Hypothesis column is a TWO-hop reverse path — the/323 plan/run split is preserved', () => {
    const byId = Object.fromEntries((fw.relational?.columns ?? []).map((c) => [c.id, c]))
    const hypothesis = byId.hypothesis
    expect(hypothesis?.kind).toBe('projection')
    if (hypothesis?.kind !== 'projection') throw new Error('expected a projection column')
    expect(hypothesis.path).toEqual([
      { edge: 'experiment_plan_ran_as_experiment_run', direction: 'reverse' },
      { edge: 'hypothesis_requires_experiment_plan', direction: 'reverse' },
    ])
  })

  it('declares NO computed column — the confidence_score operands do not exist on the spine', () => {
    const kinds = (fw.relational?.columns ?? []).map((c) => c.kind)
    expect(kinds).not.toContain('computed')
  })

  it('every projection path composes from the spine', () => {
    for (const column of fw.relational?.columns ?? []) {
      if (column.kind !== 'projection') continue
      const resolved = resolveRelationalPath(fw.relational!.spine, column.path)
      expect(resolved.reason, `column "${column.id}"`).toBeNull()
    }
  })

  it('every type the paths reach is declared in data.entity_types', () => {
    const declared = new Set(fw.data.entity_types.map((t) => t.type))
    for (const type of relationalCoveredEntityTypes(fw)) {
      expect(declared, `path reaches "${type}"`).toContain(type)
    }
  })
})
