/**
 * Approach tests.
 *
 * Five approaches: Plan / Inspect / Prioritise / Trace / Reflect. Records
 * ship as definition lookups (id, label, description with cartographic
 * framing, question_answered, signature_hint, framework_id_examples).
 * The five-record contract is the stable shape; adding a sixth approach
 * is a breaking change.
 */

import { describe, it, expect } from 'vitest'
import {
  UPG_APPROACHES,
  UPG_APPROACHES_BY_ID,
  REFLECT_MODES,
  type UPGApproachId,
} from '../approaches/index.js'
// `framework_id_examples` is now DERIVED from `framework.approach_ids` over the
// CANONICAL public surface (what `get_framework` serves), so the examples MUST
// resolve against canonical — the DT-SEAM-1 contract. The wider approach-tagging
// assertions (reflection classics live in the full catalog) still read the full
// research catalog.
import { UPG_FRAMEWORKS_BY_ID as CANONICAL_FRAMEWORKS_BY_ID } from '../frameworks/canonical.js'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/definitions/index.js'

describe('UPG_APPROACHES — five canonical approaches at v0.3.0', () => {
  it('exposes exactly 5 approaches', () => {
    expect(UPG_APPROACHES).toBeDefined()
    expect(Array.isArray(UPG_APPROACHES)).toBe(true)
    expect(UPG_APPROACHES).toHaveLength(5)
  })

  it('the five canonical ids are present in order', () => {
    const expected: UPGApproachId[] = [
      'plan',
      'inspect',
      'prioritise',
      'trace',
      'reflect',
    ]
    expect(UPG_APPROACHES.map((a) => a.id)).toEqual(expected)
  })

  it('every approach carries id, label, description, question_answered, signature_hint', () => {
    for (const a of UPG_APPROACHES) {
      expect(a.id).toBeTypeOf('string')
      expect(a.label).toBeTypeOf('string')
      expect(a.description.length).toBeGreaterThan(40)
      expect(a.question_answered.length).toBeGreaterThan(0)
      expect(a.signature_hint).toMatch(/→/)
    }
  })

  it('every framework_id_example resolves in the CANONICAL surface (DT-SEAM-1 contract)', () => {
    // DT-SEAM-1: `framework_id_examples` is consumed programmatically by skills
    // that then call get_framework(id) — which serves the canonical surface. An
    // example that resolves only in the full research catalog (e.g. five-whys,
    // ice-scoring) is a broken contract. Every example must resolve in CANONICAL.
    for (const a of UPG_APPROACHES) {
      for (const fwId of a.framework_id_examples ?? []) {
        expect(
          CANONICAL_FRAMEWORKS_BY_ID[fwId],
          `approach ${a.id} references framework_id ${fwId} that does not resolve in get_framework (canonical surface)`,
        ).toBeDefined()
      }
    }
  })

  it('every approach has at least one framework_id_example (derived from approach_ids)', () => {
    for (const a of UPG_APPROACHES) {
      expect(
        (a.framework_id_examples ?? []).length,
        `approach ${a.id} has no resolving framework_id_examples — inspect was previously empty/dead`,
      ).toBeGreaterThan(0)
    }
  })

  it('cartographic framing — descriptions reference "path of arrival"', () => {
    // Lock the cartographic framing — every approach description must invoke
    // the cartographic sense, not the strategy-meeting sense. See
    // approaches/types.ts for the full framing rationale.
    for (const a of UPG_APPROACHES) {
      expect(
        a.description.toLowerCase(),
        `approach ${a.id} description missing cartographic framing`,
      ).toMatch(/path of arrival|cartographic sense/)
    }
  })

  it('UPG_APPROACHES_BY_ID is a complete O(1) lookup', () => {
    expect(Object.keys(UPG_APPROACHES_BY_ID).sort()).toEqual([
      'inspect',
      'plan',
      'prioritise',
      'reflect',
      'trace',
    ])
    for (const a of UPG_APPROACHES) {
      expect(UPG_APPROACHES_BY_ID[a.id]).toBe(a)
    }
  })

  it('REFLECT_MODES exposes the four canonical nouns (no `open` literal)', () => {
    expect(REFLECT_MODES).toEqual([
      'assumptions',
      'alternatives',
      'blind-spots',
      'load-bearing',
    ])
  })
})

describe(' — 8 frameworks promoted into canonical (get_framework resolves)', () => {
  const PROMOTED = [
    // prioritise scoring frameworks (framework-scoped inputs per)
    'ice-scoring',
    'wsjf',
    'cost-of-delay',
    // reflect reasoning classics (no entity props)
    'five-whys',
    'pre-mortem',
    'red-team',
    'devils-advocate',
    'second-order-thinking',
  ] as const

  it('all 8 promoted ids resolve in the canonical surface (get_framework)', () => {
    for (const id of PROMOTED) {
      expect(
        CANONICAL_FRAMEWORKS_BY_ID[id],
        `${id} was promoted but does not resolve in get_framework (canonical surface)`,
      ).toBeDefined()
    }
  })

  it("prioritise's framework_id_examples include ice-scoring/wsjf/cost-of-delay and all resolve (target 8/8)", () => {
    const prioritise = UPG_APPROACHES_BY_ID['prioritise']
    const examples = prioritise.framework_id_examples ?? []
    for (const id of ['ice-scoring', 'wsjf', 'cost-of-delay']) {
      expect(examples, `prioritise examples missing ${id}`).toContain(id)
    }
    // Every prioritise example must resolve in get_framework — 8/8.
    expect(examples.length).toBeGreaterThan(0)
    for (const id of examples) {
      expect(
        CANONICAL_FRAMEWORKS_BY_ID[id],
        `prioritise example ${id} does not resolve in get_framework`,
      ).toBeDefined()
    }
  })

  it("reflect's framework_id_examples include all 5 classics and all resolve (target 5/5)", () => {
    const reflect = UPG_APPROACHES_BY_ID['reflect']
    const examples = reflect.framework_id_examples ?? []
    for (const id of ['five-whys', 'pre-mortem', 'red-team', 'devils-advocate', 'second-order-thinking']) {
      expect(examples, `reflect examples missing ${id}`).toContain(id)
    }
    for (const id of examples) {
      expect(
        CANONICAL_FRAMEWORKS_BY_ID[id],
        `reflect example ${id} does not resolve in get_framework`,
      ).toBeDefined()
    }
  })
})

describe('UPGFramework.approach_ids — partial tagging coverage', () => {
  it('every tagged approach_id is a valid UPGApproachId', () => {
    const validIds = new Set<string>(['plan', 'inspect', 'prioritise', 'trace', 'reflect'])
    for (const fw of Object.values(UPG_FRAMEWORKS_BY_ID)) {
      if (!fw.approach_ids) continue
      for (const id of fw.approach_ids) {
        expect(
          validIds.has(id),
          `framework ${fw.id} carries invalid approach_id ${id}`,
        ).toBe(true)
      }
    }
  })

  it('partial coverage — at least 50 frameworks tagged at v0.3.0', () => {
    const tagged = Object.values(UPG_FRAMEWORKS_BY_ID).filter(
      (fw) => fw.approach_ids && fw.approach_ids.length > 0,
    )
    // Authoring target: ~110 obvious mappings. Floor at 50 so a regression
    // that nukes tagging is caught without a brittle exact-count assertion.
    expect(tagged.length).toBeGreaterThanOrEqual(50)
  })

  it('canonical prioritisation frameworks are tagged', () => {
    for (const id of ['rice-scoring', 'ice-scoring', 'kano-model', 'cost-of-delay']) {
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      expect(fw, `framework ${id} not in catalog`).toBeDefined()
      expect(fw.approach_ids, `${id} missing approach_ids`).toContain('prioritise')
    }
  })

  it('canonical planning frameworks are tagged', () => {
    for (const id of ['now-next-later', 'wardley-map', 'okr-framework']) {
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      expect(fw, `framework ${id} not in catalog`).toBeDefined()
      expect(fw.approach_ids, `${id} missing approach_ids`).toContain('plan')
    }
  })

  // ── Reflection classics ────────────────────────────────────────
  // Five canonical reflect frameworks: Five Whys, Pre-mortem, Red Team,
  // Devil's Advocate, Second-order Thinking. All live under team_process
  // and carry approach_ids anchored on 'reflect'. Retained by Gold
  // List decision — these are thinking-mode frameworks, not specialist tools.

  it('canonical reflection frameworks are present and tagged', () => {
    for (const id of [
      'five-whys',
      'pre-mortem',
      'red-team',
      'devils-advocate',
      'second-order-thinking',
    ]) {
      const fw = UPG_FRAMEWORKS_BY_ID[id]
      expect(fw, `framework ${id} not in catalog`).toBeDefined()
      expect(fw.approach_ids, `${id} missing approach_ids`).toBeDefined()
      expect(fw.approach_ids, `${id} not tagged with reflect`).toContain('reflect')
    }
  })

  it('Reflect.framework_id_examples is derived from canonical reflect-tagged frameworks (DT-SEAM-1)', () => {
    // The five reflection classics (five-whys, pre-mortem, …) live in the full
    // research catalog and are tagged `reflect` there, but they are NOT in the
    // canonical public surface. Since framework_id_examples is now derived from
    // approach_ids over CANONICAL (so it can't advertise non-resolving ids), the
    // examples are exactly the canonical frameworks tagged `reflect`. Every one
    // must resolve in get_framework. (The classics are surfaced via the
    // approach_ids tagging assertion above, to be promoted into canonical later.)
    const reflect = UPG_APPROACHES_BY_ID['reflect']
    expect(reflect).toBeDefined()
    const examples = reflect.framework_id_examples ?? []
    expect(examples.length).toBeGreaterThan(0)
    const expected = Object.values(CANONICAL_FRAMEWORKS_BY_ID)
      .filter((fw) => (fw.approach_ids ?? []).includes('reflect'))
      .map((fw) => fw.id)
    expect([...examples].sort()).toEqual([...expected].sort())
    for (const id of examples) {
      expect(
        CANONICAL_FRAMEWORKS_BY_ID[id],
        `Reflect example ${id} must resolve in the canonical surface`,
      ).toBeDefined()
    }
  })
})
