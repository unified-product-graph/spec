/**
 * Playbook tests.
 *
 * Locks the W1 (restated) invariant on `UPG_PLAYBOOKS`:
 * 1. Coverage — every region has at least one playbook.
 * 2. Canonical uniqueness — exactly one canonical playbook per region.
 * 3. Region validity — every `playbook.region` resolves in `UPG_REGIONS`.
 * 4. Framework reference validity — every `framework_id` resolves in `UPG_FRAMEWORKS`.
 * 5. ID uniqueness — every `playbook.id` is unique.
 *
 * Replaces the v0.2.x `domain-workflows.test.ts` + `workflow-types.test.ts`.
 */

import { describe, it, expect } from 'vitest'
import {
  UPG_PLAYBOOKS,
  UPG_REGIONS,
  getPlaybookById,
  getCanonicalPlaybookForRegion,
  getPlaybooksForRegion,
  resolveAllEdges,
} from '../index.js'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/index.js'
import { isEntitySequenceStep } from '../step-sequence.js'

describe('UPG_PLAYBOOKS — W1 (restated) invariant', () => {
  it('ships 12 playbooks at v0.3.0', () => {
    expect(UPG_PLAYBOOKS).toHaveLength(12)
  })

  it('every region has at least one playbook (coverage)', () => {
    for (const region of UPG_REGIONS) {
      const matches = UPG_PLAYBOOKS.filter((p) => p.region === region.id)
      expect(
        matches.length,
        `Region "${region.id}" has no playbook — W1 (restated) coverage violation`,
      ).toBeGreaterThan(0)
    }
  })

  it('every region has exactly one canonical playbook (canonical uniqueness)', () => {
    for (const region of UPG_REGIONS) {
      const canonicals = UPG_PLAYBOOKS.filter(
        (p) => p.region === region.id && p.is_canonical === true,
      )
      expect(
        canonicals.length,
        `Region "${region.id}" has ${canonicals.length} canonical playbooks — must be exactly 1`,
      ).toBe(1)
    }
  })

  it('every playbook.region resolves to a real region', () => {
    const regionIds = new Set(UPG_REGIONS.map((r) => r.id))
    for (const p of UPG_PLAYBOOKS) {
      expect(
        regionIds.has(p.region),
        `Playbook "${p.id}" references unknown region "${p.region}"`,
      ).toBe(true)
    }
  })

  it('every playbook.framework_id resolves in UPG_FRAMEWORKS', () => {
    for (const p of UPG_PLAYBOOKS) {
      if (!p.framework_id) continue
      expect(
        UPG_FRAMEWORKS_BY_ID[p.framework_id],
        `Playbook "${p.id}" references unknown framework "${p.framework_id}"`,
      ).toBeDefined()
    }
  })

  it('every playbook id is unique', () => {
    const seen = new Set<string>()
    for (const p of UPG_PLAYBOOKS) {
      expect(seen.has(p.id), `Duplicate playbook id: "${p.id}"`).toBe(false)
      seen.add(p.id)
    }
  })

  it('every playbook id is namespace-prefixed (`playbook:*`)', () => {
    for (const p of UPG_PLAYBOOKS) {
      expect(p.id.startsWith('playbook:'), `Playbook "${p.id}" missing 'playbook:' prefix`).toBe(true)
    }
  })

  it('every playbook has at least one step', () => {
    for (const p of UPG_PLAYBOOKS) {
      expect(p.creation_sequence.length, `Playbook "${p.id}" has empty creation_sequence`).toBeGreaterThan(0)
    }
  })
})

describe('UPG_PLAYBOOKS — counts (settled per §3.7 / §6.6)', () => {
  it('10 canonical playbooks (one per region)', () => {
    const canonicals = UPG_PLAYBOOKS.filter((p) => p.is_canonical === true)
    expect(canonicals).toHaveLength(10)
  })

  it('2 specialised playbooks', () => {
    const specialised = UPG_PLAYBOOKS.filter((p) => p.is_canonical !== true)
    expect(specialised).toHaveLength(2)
  })

  //: no playbook is framework-anchored anymore; anchors live on related_framework_ids.
  it('no playbook carries a framework_id', () => {
    const anchored = UPG_PLAYBOOKS.filter((p) => p.framework_id)
    expect(anchored).toHaveLength(0)
  })
})

// ─── DT-PB step-connectivity invariant ───────────────────────────────────────
//
// A playbook's creation_sequence should not strand an entity-sequence step as a
// structural ISLAND: a step whose entity types share NO canonical edge (in
// either direction) with any entity type in any OTHER step of the same
// playbook. Such a step always forces an orphan no matter what order the user
// follows. DT-PB-1 (experiment → experiment_run) is now fixed, so the
// discovery playbook's test step connects.
//
// The remaining islands are GENUINE CATALOG GAPS, not ordering bugs: the
// entities simply have no canonical edge to the rest of their playbook. They
// are allow-listed here with the missing-edge note so this test pins the
// current state and any NEW island (a regression) fails loudly. Removing an
// allowlist entry is the acceptance test for the catalog edge that closes it.
//
// cleared all three previously-allowlisted islands:
//   - `playbook:operations-quality` "Customer Support" — closed by the new
//     `incident_generates_support_ticket` edge (incident → support_ticket,
//     ITIL/ITSM), binding `support_ticket` to the incident/ops spine.
//   - `playbook:operations-quality` "Quality Gates" — re-scoped as a delivery
//     concern; `feature`/`bug` join the step and connect out via the existing
//     `incident_affects_feature` edge (no new catalog edge).
//   - `playbook:market-competitive` "Moves" — re-anchored on
//     `competitive_battle_card`, which connects to the Competitors step via the
//     existing `competitive_battle_card_references_competitor` edge.
// The allowlist is now empty: every entity-sequence step in every playbook
// connects to another step. Any NEW island regresses loudly.
const KNOWN_ISLAND_STEPS: Record<string, string[]> = {}

function stepEntities(p: (typeof UPG_PLAYBOOKS)[number]): { phase: string; types: readonly string[] }[] {
  return p.creation_sequence
    .filter(isEntitySequenceStep)
    .map((s) => ({ phase: s.phase, types: s.entity_types }))
}

function pairResolves(a: string, b: string): boolean {
  return resolveAllEdges(a, b).length > 0 || resolveAllEdges(b, a).length > 0
}

describe('UPG_PLAYBOOKS — step connectivity (DT-PB-2)', () => {
  it('no entity-sequence step is a structural island beyond the documented catalog-gap allowlist', () => {
    const unexpected: string[] = []
    for (const p of UPG_PLAYBOOKS) {
      const steps = stepEntities(p)
      if (steps.length < 2) continue
      const allowed = new Set(KNOWN_ISLAND_STEPS[p.id] ?? [])
      for (let i = 0; i < steps.length; i++) {
        const here = steps[i]
        const connectsToOtherStep = steps.some(
          (other, j) =>
            j !== i &&
            here.types.some((a) => other.types.some((b) => pairResolves(a, b))),
        )
        if (!connectsToOtherStep && !allowed.has(here.phase)) {
          unexpected.push(`${p.id} step "${here.phase}" [${here.types.join(', ')}] is an undocumented island`)
        }
      }
    }
    expect(unexpected, unexpected.join('\n')).toEqual([])
  })

  it('the discovery playbook test step links to its hypothesis step (DT-PB-1 regression guard)', () => {
    const pb = getPlaybookById('playbook:discovery-research-validation')!
    const steps = stepEntities(pb)
    const hypoStep = steps.find((s) => s.phase === 'Hypothesis')!
    const testStep = steps.find((s) => s.phase === 'Test')!
    // experiment_run_validates_hypothesis (reverse) must resolve.
    const linked = hypoStep.types.some((h) => testStep.types.some((t) => pairResolves(h, t)))
    expect(linked, 'Test step must connect to Hypothesis step via a canonical edge').toBe(true)
    // and the obsolete bare `experiment` must be gone.
    expect(testStep.types).not.toContain('experiment')
    expect(testStep.types).toContain('experiment_run')
  })
})

describe('Playbook accessors', () => {
  it('getPlaybookById returns the canonical record', () => {
    const p = getPlaybookById('playbook:strategy-outcomes')
    expect(p).toBeDefined()
    expect(p?.region).toBe('strategy_outcomes')
    expect(p?.is_canonical).toBe(true)
  })

  it('getPlaybookById returns undefined for an unknown id', () => {
    expect(getPlaybookById('playbook:does-not-exist')).toBeUndefined()
  })

  it('getCanonicalPlaybookForRegion returns the canonical playbook', () => {
    const p = getCanonicalPlaybookForRegion('users_needs')
    expect(p?.id).toBe('playbook:users-needs')
    expect(p?.is_canonical).toBe(true)
  })

  it('getPlaybooksForRegion returns canonical + specialised', () => {
    const list = getPlaybooksForRegion('business_gtm_growth')
    //: Region 8 ships 3 playbooks (1 canonical + 2 specialised).
    expect(list).toHaveLength(3)
    const canonical = list.filter((p) => p.is_canonical === true)
    expect(canonical).toHaveLength(1)
  })
})
