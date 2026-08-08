/**
 * `status_category` invariants (0.25.1 feedback 1ee70102).
 *
 * Every lifecycle phase carries one of the six near-universal PM-tool buckets
 * (triage / backlog / unstarted / started / completed / cancelled) so external
 * workflow-state mapping never has to re-derive the categorisation by hand.
 * Field presence is compile-enforced (`status_category` is required on
 * `LifecyclePhase`); these tests pin the semantic invariants the type system
 * cannot express.
 */

import { describe, it, expect } from 'vitest'
import { UPG_LIFECYCLES, getLifecycleForType, type StatusCategory } from '../grammar/lifecycles.js'

const CATEGORIES: readonly StatusCategory[] = [
  'triage', 'backlog', 'unstarted', 'started', 'completed', 'cancelled',
]

describe('lifecycle status_category invariants', () => {
  it('every phase carries a valid category', () => {
    for (const lc of UPG_LIFECYCLES) {
      for (const p of lc.phases) {
        expect(CATEGORIES, `${lc.entity_type}.${p.id}`).toContain(p.status_category)
      }
    }
  })

  it('no initial phase is categorised completed or cancelled', () => {
    for (const lc of UPG_LIFECYCLES) {
      const initial = lc.phases.find((p) => p.id === lc.initial_phase)
      expect(initial, `${lc.entity_type} initial phase missing`).toBeDefined()
      expect(
        ['completed', 'cancelled'],
        `${lc.entity_type}.${initial!.id} is the initial phase`,
      ).not.toContain(initial!.status_category)
    }
  })

  it('every lifecycle with terminal phases has ≥1 terminal categorised completed or cancelled', () => {
    // Soft rule by design: SOME terminals are legitimately soft (mission.active
    // stays `started`, role.vacant is `backlog`) — but a lifecycle must always
    // offer at least one true end-bucket so external tools have a Done/Cancelled
    // column to map onto.
    for (const lc of UPG_LIFECYCLES) {
      if (lc.terminal_phases.length === 0) continue
      const terminalCats = lc.phases
        .filter((p) => lc.terminal_phases.includes(p.id))
        .map((p) => p.status_category)
      expect(
        terminalCats.some((c) => c === 'completed' || c === 'cancelled'),
        `${lc.entity_type} terminals [${terminalCats.join(', ')}] lack a completed/cancelled bucket`,
      ).toBe(true)
    }
  })

  it('the WORK_ITEM family maps exactly onto the external six-bucket flow (feedback 25db13af + 1ee70102)', () => {
    // The originating case: mapping task phases onto a PM tool's workflow
    // states. Pin the canonical mapping so it can never silently drift.
    const task = getLifecycleForType('task')!
    const byId = Object.fromEntries(task.phases.map((p) => [p.id, p.status_category]))
    expect(byId).toEqual({
      todo: 'unstarted',
      in_progress: 'started',
      in_review: 'started',
      done: 'completed',
      cancelled: 'cancelled',
    })
  })
})
