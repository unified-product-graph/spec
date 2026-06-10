/**
 * Edge duplicate / shadow gate (F3 · · pattern P-G).
 *
 * "Same relationship modelled 2+ times" — the resolver (`pickCanonicalEdge`)
 * picks one, the rest are dead wiring. The audit found a class of these:
 * byte-identical definitions under two keys (e.g. `metric_measures_metric` vs
 * `metric_measures_metric_cross_domain`) and tense-twins
 * (`metric_decomposes_into_metric` vs `metric_decomposed_into_metric`).
 *
 * Collapsing the existing shadows is a coordinated, breaking change: the dead
 * keys are referenced by name across the monorepo (regions/catalog.ts,
 * spec-integrity + near-synonym tests, the generated Entopo/site/playground
 * mirrors, UI fixtures, and committed .upg fixtures) and need
 * `UPG_EDGE_MIGRATIONS` + a downstream regen wave. That dedup is therefore
 * sequenced as a dedicated release (FLAGGED for Captain / parallel-Spock), NOT
 * part of the mechanical gate wave.
 *
 * What this gate DOES, here and now, is make the class un-recurrable: it freezes
 * the current shadow inventory as an explicit baseline and FAILS if a new
 * byte-identical duplicate or a new (source,target,classification) collision is
 * introduced. New shadows can no longer slip in unnoticed; the known debt is
 * documented and trackable.
 *
 * Complements (does not duplicate) the near-synonym audit test, which
 * *documents* the multi-edge pairs; this gate *bounds* them.
 */
import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

type Def = (typeof UPG_EDGE_CATALOG)[keyof typeof UPG_EDGE_CATALOG]
const ENTRIES = Object.entries(UPG_EDGE_CATALOG) as [string, Def][]

// ── Baseline: the byte-identical duplicate groups present at the time this gate
// was written. Each was a true shadow (same source, target, both verbs, and
// classification under two keys); the second key was dead wiring that
// `pickCanonicalEdge` never returned.
//
// The five baseline shadow groups were COLLAPSED — each suffixed twin
// was retired and dual-read to its clean key (UPG_EDGE_MIGRATIONS['0.9.9']). The
// baseline is now empty: no byte-identical shadow remains. This gate still FAILS
// loudly if a NEW byte-identical shadow is introduced.
const KNOWN_BYTE_IDENTICAL_GROUPS: ReadonlyArray<readonly [string, string]> = []

function byteIdenticalSignature(def: Def): string {
  return `${def.source_type}|${def.target_type}|${def.forward_verb}|${def.reverse_verb}|${def.classification}`
}

describe('edge duplicate gate — no NEW byte-identical shadow edges', () => {
  // Compute the live byte-identical groups.
  const bySig = new Map<string, string[]>()
  for (const [key, def] of ENTRIES) {
    const sig = byteIdenticalSignature(def)
    const arr = bySig.get(sig) ?? []
    arr.push(key)
    bySig.set(sig, arr)
  }
  const liveGroups = [...bySig.values()].filter((keys) => keys.length > 1).map((keys) => keys.sort())

  it('the set of byte-identical duplicate groups has not grown beyond the documented baseline', () => {
    const baselineSet = new Set(KNOWN_BYTE_IDENTICAL_GROUPS.map((g) => [...g].sort().join('+')))
    const newGroups = liveGroups
      .map((keys) => keys.join('+'))
      .filter((sig) => !baselineSet.has(sig))
    expect(
      newGroups,
      `NEW byte-identical duplicate edge group(s) introduced — these are dead wiring (one key never resolves). ` +
        `Either give the second edge a distinct verb/classification, or do not add it:\n${newGroups.join('\n')}`,
    ).toEqual([])
  })

  it('the documented baseline is still real (no stale entries)', () => {
    const liveSet = new Set(liveGroups.map((keys) => keys.join('+')))
    for (const g of KNOWN_BYTE_IDENTICAL_GROUPS) {
      const sig = [...g].sort().join('+')
      // A baseline group that has been collapsed (the dedup follow-up landed) is
      // a GOOD outcome — surface it so this allow-list is pruned alongside.
      expect(
        liveSet.has(sig),
        `baseline shadow group "${sig}" is no longer byte-identical — the dedup likely landed; remove it from KNOWN_BYTE_IDENTICAL_GROUPS.`,
      ).toBe(true)
    }
  })
})

describe('edge duplicate gate — (source,target,classification) collisions are bounded', () => {
  it('the number of (source,target,classification) collision groups has not grown', () => {
    // A collision = >1 edge sharing all three of (source_type, target_type,
    // classification). Most are intentional near-synonyms with distinct verbs
    // (e.g. outcome→metric measured_by/tracked_by); a few are the byte-identical
    // shadows above. We bound the COUNT so a new collision must be a deliberate,
    // reviewed addition (which moves this number and forces a look).
    const by3 = new Map<string, string[]>()
    for (const [key, def] of ENTRIES) {
      const k = `${def.source_type}|${def.target_type}|${def.classification}`
      const arr = by3.get(k) ?? []
      arr.push(key)
      by3.set(k, arr)
    }
    const collisionGroups = [...by3.values()].filter((keys) => keys.length > 1).length
    // Baseline lowered 36 → 26 by the duplicate-collapse (13 shadow /
    // near-synonym / inverse edges retired). Reducing this further (via a future
    // dedup) is expected and welcome — lower it then. It must not silently
    // increase.
    expect(
      collisionGroups,
      'a new (source,target,classification) collision was introduced; if intentional (distinct verbs), update this baseline.',
    ).toBeLessThanOrEqual(26)
  })
})
