/**
 * PREDICATE-zone mutual exclusivity — the overlap-disjointness rule.
 *
 * Enforcement for Amendment 1 §B of
 * the zone-predicate hook ruling (internal decision record, 2026-08-07):
 * sibling predicates must be PROVABLY disjoint, and the validator rejects a
 * framework when disjointness cannot be proved. The burden runs that way
 * deliberately — over-rejection is a loud authoring error the author fixes by
 * adding a discriminating atom, while accepted overlap is a silent
 * misclassification at render time. Offset-windowing is what accepted overlap
 * looks like once it has been normalised.
 *
 * THE COUPLING THIS FILE ALSO GUARDS (Amendment 2 §C): the zone-move
 * lower-bound write policy is safe ONLY because exclusivity is enforced here.
 * A written lower bound satisfies the target predicate by construction; nothing
 * but this check stops a sibling from also admitting it and making the drag
 * land somewhere the user did not aim. If the rejection cases below are ever
 * relaxed, the write policy silently weakens with them — the two rulings hold
 * each other up. See `zone-move.test.ts` for the write-value pins themselves.
 */

import { describe, it, expect } from 'vitest'
import { validateUPGFramework, predicatesProvablyDisjoint } from '../frameworks/validate.js'
import type { FrameworkSlotPredicate } from '../frameworks/types.js'

/** A framework skeleton that passes every check unrelated to predicates. */
function frameworkWithSlots(slots: unknown[]): Record<string, unknown> {
  return {
    id: 'test_framework',
    name: 'Test Framework',
    version: '1.0.0',
    description: 'Fixture for predicate-zone validation',
    category: 'prioritization',
    origin: { type: 'custom' },
    slots,
    data: {
      entity_types: [{ type: 'assumption', role: 'item' }],
      required_properties: {},
    },
    structure: { pattern: 'matrix' },
    presentation: { layout: { type: 'grid' } },
    education: {
      purpose: 'p',
      core_question: 'q',
      when_to_use: ['a'],
      when_not_to_use: ['b'],
    },
  }
}

function slot(label: string, predicate: unknown, entityTypeId = 'assumption') {
  return { label, entityTypeId, predicate }
}

function errorsFor(slots: unknown[]): string[] {
  return validateUPGFramework(frameworkWithSlots(slots)).errors
}

// ─── Disjointness proof coverage, per op pair ───────────────────────────────

describe('predicatesProvablyDisjoint — proves disjointness per op pair', () => {
  const p = (...atoms: unknown[]) => atoms as unknown as FrameworkSlotPredicate
  const atom = (property: string, op: string, value: unknown) => ({ scope: 'entity', property, op, value })

  it('band vs band: adjacent half-open intervals are disjoint, overlapping are not', () => {
    expect(predicatesProvablyDisjoint(p(atom('c', 'band', [1, 3])), p(atom('c', 'band', [3, 5])))).toBe(true)
    expect(predicatesProvablyDisjoint(p(atom('c', 'band', [1, 4])), p(atom('c', 'band', [3, 5])))).toBe(false)
  })

  it('gte vs lt: the same boundary is disjoint, a gap is not', () => {
    // [3, ∞) vs (-∞, 3) — 3 belongs to exactly one of them.
    expect(predicatesProvablyDisjoint(p(atom('c', 'gte', 3)), p(atom('c', 'lt', 3)))).toBe(true)
    // [3, ∞) vs (-∞, 4) — 3.5 satisfies both.
    expect(predicatesProvablyDisjoint(p(atom('c', 'gte', 3)), p(atom('c', 'lt', 4)))).toBe(false)
  })

  it('eq vs eq: different literals are disjoint, the same literal is not', () => {
    expect(predicatesProvablyDisjoint(p(atom('r', 'eq', 'high')), p(atom('r', 'eq', 'low')))).toBe(true)
    expect(predicatesProvablyDisjoint(p(atom('r', 'eq', 'high')), p(atom('r', 'eq', 'high')))).toBe(false)
  })

  it('in vs in: non-intersecting sets are disjoint, a shared member is not', () => {
    expect(predicatesProvablyDisjoint(p(atom('r', 'in', ['high', 'critical'])), p(atom('r', 'in', ['low'])))).toBe(true)
    expect(predicatesProvablyDisjoint(p(atom('r', 'in', ['high', 'critical'])), p(atom('r', 'in', ['high'])))).toBe(false)
  })

  it('eq vs in: membership of the set decides', () => {
    expect(predicatesProvablyDisjoint(p(atom('r', 'eq', 'low')), p(atom('r', 'in', ['high', 'critical'])))).toBe(true)
    expect(predicatesProvablyDisjoint(p(atom('r', 'eq', 'high')), p(atom('r', 'in', ['high', 'critical'])))).toBe(false)
  })

  it('discrete vs interval: a numeric member inside the range defeats the proof', () => {
    expect(predicatesProvablyDisjoint(p(atom('c', 'eq', 5)), p(atom('c', 'band', [1, 3])))).toBe(true)
    expect(predicatesProvablyDisjoint(p(atom('c', 'eq', 2)), p(atom('c', 'band', [1, 3])))).toBe(false)
    expect(predicatesProvablyDisjoint(p(atom('c', 'in', [1, 2])), p(atom('c', 'gte', 4)))).toBe(true)
  })

  it('a non-numeric value can never satisfy a numeric interval', () => {
    // Same rule as absence-is-not-a-value, applied to a type mismatch.
    expect(predicatesProvablyDisjoint(p(atom('c', 'eq', 'high')), p(atom('c', 'gte', 3)))).toBe(true)
  })

  it('scope is part of the identity: the same property name in different scopes proves nothing', () => {
    const entityAtom = { scope: 'entity', property: 'score', op: 'lt', value: 3 }
    const frameworkAtom = { scope: 'framework', property: 'score', op: 'gte', value: 3 }
    expect(predicatesProvablyDisjoint(p(entityAtom), p(frameworkAtom))).toBe(false)
  })

  it('one separating property is enough, whatever the other atoms do', () => {
    const testFirst = p(atom('risk_level', 'eq', 'high'), atom('confidence_5', 'lt', 3))
    const monitor = p(atom('risk_level', 'eq', 'high'), atom('confidence_5', 'gte', 3))
    expect(predicatesProvablyDisjoint(testFirst, monitor)).toBe(true)
  })
})

// ─── The defect that produced Amendment 1 ───────────────────────────────────

describe('the assumption-map quadrants', () => {
  const risk = (v: string) => ({ scope: 'entity', property: 'risk_level', op: 'eq', value: v })
  const conf = (op: string, value: number) => ({ scope: 'entity', property: 'confidence_5', op, value })

  it('declares all four cells without error under conjunction', () => {
    expect(
      errorsFor([
        slot('Test First', [risk('high'), conf('lt', 3)]),
        slot('Monitor', [risk('high'), conf('gte', 3)]),
        slot('Research', [risk('low'), conf('lt', 3)]),
        slot('Accept', [risk('low'), conf('gte', 3)]),
      ]),
    ).toEqual([])
  })

  it('rejects the single-atom shape that made Test First and Monitor identical', () => {
    // The contradiction Amendment 1 was written to resolve: with one property
    // per slot both cells reduce to "risk is high" and match the same entity.
    const errors = errorsFor([slot('Test First', [risk('high')]), slot('Monitor', [risk('high')])])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('not provably disjoint')
    expect(errors[0]).toContain('entity.risk_level')
  })
})

// ─── Rejection cases — an over-permissive regression re-enables the defect ──

describe('rejection — the validator refuses what it cannot prove', () => {
  const atom = (property: string, op: string, value: unknown) => ({ scope: 'entity', property, op, value })

  it('rejects predicates that constrain no property in common', () => {
    // An entity with high risk AND low confidence satisfies both zones.
    const errors = errorsFor([
      slot('A', [atom('risk_level', 'eq', 'high')]),
      slot('B', [atom('confidence_5', 'lt', 3)]),
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('constrain no property in common')
  })

  it('rejects overlapping bands', () => {
    const errors = errorsFor([
      slot('A', [atom('confidence_5', 'band', [1, 4])]),
      slot('B', [atom('confidence_5', 'band', [3, 5])]),
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('not provably disjoint')
  })

  it('names every colliding pair, not just the first', () => {
    const errors = errorsFor([
      slot('A', [atom('r', 'eq', 'high')]),
      slot('B', [atom('r', 'eq', 'high')]),
      slot('C', [atom('r', 'eq', 'high')]),
    ])
    expect(errors).toHaveLength(3) // A/B, A/C, B/C
  })

  it('the error tells the author what to do about it', () => {
    const errors = errorsFor([slot('A', [atom('r', 'eq', 'high')]), slot('B', [atom('r', 'eq', 'high')])])
    expect(errors[0]).toContain('Add an atom that separates them')
  })

  it('does NOT reject slots typed to different entities', () => {
    // Different types cannot contend for the same entity, so exclusivity holds
    // structurally. Rejecting these would break every multi-type framework.
    expect(
      errorsFor([
        slot('A', [atom('r', 'eq', 'high')], 'assumption'),
        slot('B', [atom('r', 'eq', 'high')], 'feature'),
      ]),
    ).toEqual([])
  })

  it('does NOT reject slots without predicates', () => {
    // TYPE-zones and ROLE-zones are unaffected by this rule.
    expect(validateUPGFramework(frameworkWithSlots([
      { label: 'A', entityTypeId: 'assumption', role: 'x' },
      { label: 'B', entityTypeId: 'assumption', role: 'y' },
    ])).errors).toEqual([])
  })
})

// ─── Atom shape ─────────────────────────────────────────────────────────────

describe('predicate shape', () => {
  const ok = { scope: 'entity', property: 'r', op: 'eq', value: 'high' }

  it('rejects an empty predicate as a catch-all in disguise', () => {
    const errors = errorsFor([slot('A', [])])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('catch-all cell')
  })

  it('rejects a bare atom — a membership rule is always a list', () => {
    const errors = errorsFor([slot('A', ok)])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('must be an array of atoms')
  })

  it('rejects an unknown op', () => {
    expect(errorsFor([slot('A', [{ ...ok, op: 'matches' }])])[0]).toContain('op must be one of')
  })

  it('rejects an unknown scope', () => {
    expect(errorsFor([slot('A', [{ ...ok, scope: 'global' }])])[0]).toContain('scope must be one of')
  })

  it('rejects a value whose type does not match its op', () => {
    expect(errorsFor([slot('A', [{ ...ok, op: 'gte', value: 'three' }])])[0]).toContain('finite number')
    expect(errorsFor([slot('A', [{ ...ok, op: 'in', value: [] }])])[0]).toContain('non-empty array')
    expect(errorsFor([slot('A', [{ ...ok, op: 'band', value: [1] }])])[0]).toContain('[min, max] pair')
  })

  it('rejects an inverted band, which admits nothing', () => {
    const errors = errorsFor([slot('A', [{ ...ok, op: 'band', value: [5, 2] }])])
    expect(errors[0]).toContain('empty band')
    expect(errors[0]).toContain('half-open')
  })

  it('names the offending slot and atom by index', () => {
    const errors = errorsFor([slot('Good', [ok]), slot('Bad', [ok, { ...ok, op: 'nope' }])])
    expect(errors[0]).toContain('slots[1]')
    expect(errors[0]).toContain('[1]')
    expect(errors[0]).toContain('"Bad"')
  })
})
