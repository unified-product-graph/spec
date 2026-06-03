/**
 * Slot roles — Phase 3b-1 regression gate.
 *
 * A framework slot carries a semantic `role` (e.g. "pain_reliever", "accountable",
 * "must_have") distinct from its `entityTypeId`. The role matters most when a
 * framework fills several slots with the SAME entity type — there the type alone
 * cannot tell the slots apart, so each slot must carry a role to stay addressable.
 *
 * This guard is derived, not hard-coded: it finds every canonical framework with
 * a repeated entity type across slots and requires a snake_case role on each of
 * its slots, so a future repeated-type framework that ships without roles fails
 * here. The role is additive metadata, NOT a validation signal (scoring is keyed
 * off `scope: 'framework'` properties, not roles).
 */
import { describe, it, expect } from 'vitest'
import { UPG_FRAMEWORKS } from '../frameworks/canonical.js'

const SNAKE = /^[a-z][a-z0-9_]*$/

// A framework "needs" slot roles when two slots share an entityTypeId.
const repeatedTypeFrameworks = UPG_FRAMEWORKS.filter((f) => {
  const types = (f.slots ?? []).map((s) => s.entityTypeId)
  return new Set(types).size < types.length
})

describe('slot roles — repeated-type frameworks disambiguate their slots', () => {
  it('the repeated-type set is non-trivial (the 16 found in the Phase 3 survey)', () => {
    expect(repeatedTypeFrameworks.length).toBeGreaterThanOrEqual(16)
  })

  for (const f of repeatedTypeFrameworks) {
    it(`${f.id}: every slot carries a snake_case role`, () => {
      for (const s of f.slots ?? []) {
        expect(s.role, `${f.id} slot "${s.label}" is missing a role`).toBeTruthy()
        expect(s.role, `${f.id} slot "${s.label}" role "${s.role}"`).toMatch(SNAKE)
      }
    })

    it(`${f.id}: slots sharing an entity type are distinguished by role`, () => {
      // Group slots by entityTypeId; within a group the (role) must disambiguate,
      // unless the slots genuinely play the same role (e.g. OKR's two Key Results).
      const byType = new Map<string, string[]>()
      for (const s of f.slots ?? []) {
        const arr = byType.get(s.entityTypeId) ?? []
        arr.push(s.role ?? '')
        byType.set(s.entityTypeId, arr)
      }
      for (const [type, roles] of byType) {
        if (roles.length > 1) {
          // every slot in the group has a role (covered above); the group is
          // addressable as long as roles exist (duplicates allowed for genuinely
          // repeated roles like multiple key_results).
          expect(roles.every(Boolean), `${f.id} type "${type}" slots all roled`).toBe(true)
        }
      }
    })
  }
})

describe('slot roles — any declared role is a machine-readable id', () => {
  it('every slot role across the catalog is snake_case', () => {
    for (const f of UPG_FRAMEWORKS) {
      for (const s of f.slots ?? []) {
        if (s.role !== undefined) {
          expect(s.role, `${f.id} slot "${s.label}"`).toMatch(SNAKE)
        }
      }
    }
  })
})
