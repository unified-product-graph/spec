/**
 * Spec-integrity: the `UPGViewQuery` clause shape and its 0.33.0 addendum arms.
 *
 * NO EVALUATOR EXISTS. Nothing in the workspace, the SDK or the app executes a
 * `UPGViewQuery`, so these are shape assertions rather than behaviour ones, and
 * they are worth having for exactly that reason: the shape is invisible to every
 * gate in the repo. `member_query` and `presentation` are opaque `type: 'object'`
 * in the runtime property mirror, so a nested field never reaches the property
 * registry, never reaches `check:doc-weight`, never moves `check:count-drift`,
 * and never trips `check:editorial`'s fingerprint. This file is the only thing
 * that will notice if one of these arms is dropped or renamed.
 */
import { describe, it, expect } from 'vitest'
import type {
  UPGViewQuery,
  UPGViewClause,
  UPGViewEdgeClause,
  UPGViewPresentation,
  UPGTimeWindow,
} from '../index.js'

describe('F-3 — the viewer designation on the person axis', () => {
  it('selects the reader by role, holding no id', () => {
    const mine: UPGViewEdgeClause = {
      edge_type: 'node_assigned_to_person',
      direction: 'out',
      target_designation: 'viewer',
    }
    expect(mine.target_designation).toBe('viewer')
    // The point of the field: no identity anywhere in the clause.
    expect(mine.target_ids).toBeUndefined()
  })

  it('is the person-axis parallel of the cadence axis, and both are id-free', () => {
    // These two clauses answer the same KIND of question ("the moving target,
    // named by what it is to the reader") on two different axes. If a later
    // change makes one of them hold an id, this pairing is where it shows.
    const cadence: UPGViewEdgeClause = {
      edge_type: 'planning_cycle_schedules_work_item',
      direction: 'in',
      target_status: ['active'],
    }
    const person: UPGViewEdgeClause = {
      edge_type: 'node_assigned_to_person',
      direction: 'out',
      target_designation: 'viewer',
    }
    for (const clause of [cadence, person]) {
      expect(clause.target_ids, 'a designation clause must not carry ids').toBeUndefined()
    }
  })

  it('carries the designation as a clause, so a whole selection stays id-free', () => {
    const q: UPGViewQuery = {
      types: ['task', 'bug'],
      clauses: [
        { dimension: 'edge', edge: { edge_type: 'node_assigned_to_person', direction: 'out', target_designation: 'viewer' } },
      ],
    }
    const serialised = JSON.stringify(q)
    // The sentinel this field exists to replace must not survive anywhere in a
    // spec-shaped selection. A tool may still serialise '@me' at its own
    // boundary; the format stores the designation.
    expect(serialised).not.toContain('@me')
    expect(serialised).toContain('viewer')
  })
})

describe('F-2 — the unbounded depth arm', () => {
  it('accepts a named transitive arm and a finite number', () => {
    const transitive: UPGViewQuery = {
      from_focus: { edge_types: ['epic_decomposes_into_task'], direction: 'out', depth: 'unbounded' },
    }
    const finite: UPGViewQuery = {
      from_focus: { edge_types: ['epic_decomposes_into_task'], direction: 'out', depth: 2 },
    }
    expect(transitive.from_focus?.depth).toBe('unbounded')
    expect(finite.from_focus?.depth).toBe(2)
  })

  it('distinguishes transitive intent from a large number', () => {
    // The defect the arm replaces: a surface wanting transitivity picked 64,
    // which is indistinguishable from a caller who meant 64. Assert the two are
    // different values, so a "helpful" future normalisation of 'unbounded' to a
    // number fails here rather than silently truncating a deeper graph.
    const sentinel: UPGViewQuery['from_focus'] = { edge_types: ['x'], direction: 'out', depth: 64 }
    const named: UPGViewQuery['from_focus'] = { edge_types: ['x'], direction: 'out', depth: 'unbounded' }
    expect(named?.depth).not.toBe(sentinel?.depth)
    expect(typeof named?.depth).toBe('string')
  })

  it('leaves absent depth absent, which still means one hop', () => {
    const one: UPGViewQuery['from_focus'] = { edge_types: ['x'], direction: 'in' }
    expect(one?.depth).toBeUndefined()
  })
})

describe('F-1 — the tree layout and nest_by', () => {
  it('accepts the tree family and nests by edge types, outermost first', () => {
    const p: UPGViewPresentation = {
      layout: 'tree',
      nest_by: ['product_organised_into_department', 'department_contains_team'],
    }
    expect(p.layout).toBe('tree')
    expect(p.nest_by?.[0]).toBe('product_organised_into_department')
  })

  it('keeps every pre-existing layout family accepted', () => {
    // A widened enum must not narrow. Named explicitly so removing one is a
    // deliberate edit to this line rather than a quiet drop.
    for (const layout of ['board', 'table', 'list', 'cards', 'timeline', 'gallery', 'tree'] as const) {
      const p: UPGViewPresentation = { layout }
      expect(p.layout).toBe(layout)
    }
  })

  it('stays advisory: a presentation carries no selection', () => {
    const p: UPGViewPresentation = { layout: 'tree', nest_by: ['team_contains_team'] }
    // Presentation must never grow a selection field; that is UPGViewQuery's job
    // and the split is what keeps "views are queries" literally true.
    expect(p).not.toHaveProperty('types')
    expect(p).not.toHaveProperty('clauses')
  })
})

describe('the superset law — the persisted app shape still maps by rename at most', () => {
  it('maps every app clause form onto one spec clause', () => {
    // dimension/operator/values/window/negate, the five fields the field app
    // persists. If a mapping here needs more than a rename, the law is broken.
    const negated: UPGViewClause = { dimension: 'tag', values: ['spike'], negate: true }
    const windowed: UPGViewClause = {
      dimension: 'date',
      field: 'target_date',
      window: { kind: 'calendar', anchor: 'current', unit: 'quarter' } satisfies UPGTimeWindow,
    }
    const assignee: UPGViewClause = {
      dimension: 'edge',
      edge: { edge_type: 'node_assigned_to_person', direction: 'out', target_designation: 'viewer' },
    }
    expect(negated.negate).toBe(true)
    expect(windowed.window?.kind).toBe('calendar')
    expect(assignee.edge?.target_designation).toBe('viewer')
  })
})
