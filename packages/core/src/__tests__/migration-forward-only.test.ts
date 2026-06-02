/**
 * / DT-MACH-2 — migration runner is forward-only from the graph's
 * stamped spec version.
 *
 * The type-migration registry (`UPG_MIGRATIONS`) intentionally contains
 * round-trip renames across versions:
 *
 *   - 0.2.8: hypothesis           → hypothesis_claim   (the split)
 *   - 0.4.0: hypothesis_claim     → hypothesis         (the revert)
 *
 * If a runner applied the WHOLE registry ignoring each migration's version
 * (`since`), these would OSCILLATE — a node could flip back and forth depending
 * on iteration order, and a node already canonical at the latest spec could be
 * dragged backwards into a deprecated type. The contract that prevents this:
 * the runner applies migrations only in the half-open range
 * `(fromVersion, toVersion]`, treating the graph's STAMPED spec version as a
 * floor. These tests pin that invariant on `getMigrationMap` (the flat map used
 * by loaders) and `migrateNode` (the per-node applier).
 */

import { describe, it, expect } from 'vitest'
import {
  getMigrationMap,
  migrateNode,
  compareVersions,
  UPG_MIGRATIONS,
} from '../grammar/migrations.js'

const LATEST = '99.0.0' // any version at/after every registry key

describe(': migration runner respects `since` as a forward-only floor', () => {
  it('a graph stamped AT/AFTER the revert version does NOT see the earlier reverse rename', () => {
    // From a 0.4.0 floor, the 0.2.8 `hypothesis → hypothesis_claim` rule is
    // BELOW the floor and must be excluded. Only forward (> 0.4.0) rules apply.
    const fromRevert = getMigrationMap('0.4.0', LATEST)
    expect(fromRevert.hypothesis).toBeUndefined()
    expect(fromRevert.hypothesis_claim).toBeUndefined()
  })

  it('a node already canonical at the latest spec is NOT dragged backwards', () => {
    // A `hypothesis` node stamped at the current spec must stay `hypothesis`.
    // If the runner ignored `since`, the 0.2.8 split rule would retype it to the
    // deprecated `hypothesis_claim`.
    const node = { id: 'h1', type: 'hypothesis', properties: {} as Record<string, unknown> }
    const migrated = migrateNode(node, '0.4.0', LATEST)
    expect(migrated.type).toBe('hypothesis')
  })

  it('the flat map does NOT oscillate within a forward window (no key maps to a value that maps back)', () => {
    // Across the FULL history both directions of a round-trip exist in the
    // registry. Proving the floor matters: from genesis the map carries BOTH
    // hypothesis→hypothesis_claim AND hypothesis_claim→hypothesis (the raw
    // round-trip). From any floor at/after the revert, neither survives.
    const fromGenesis = getMigrationMap('0.0.0', LATEST)
    const hasForwardSplit = fromGenesis.hypothesis === 'hypothesis_claim'
    const hasReverseRevert = fromGenesis.hypothesis_claim === 'hypothesis'
    expect(hasForwardSplit && hasReverseRevert).toBe(true) // the latent oscillation

    // But the floored window collapses it — the invariant we rely on.
    const fromRevert = getMigrationMap('0.4.0', LATEST)
    expect(fromRevert.hypothesis).toBeUndefined()
    expect(fromRevert.hypothesis_claim).toBeUndefined()
  })

  it('migrations strictly BELOW the floor are never applied', () => {
    // Pick the earliest and a later version key from the registry and assert a
    // pre-floor migration is excluded for every floor at/after its version.
    const versions = Object.keys(UPG_MIGRATIONS).sort(compareVersions)
    expect(versions.length).toBeGreaterThan(1)

    for (const v of versions) {
      const atFloor = getMigrationMap(v, LATEST)
      // No migration whose version is <= the floor may appear in the result.
      for (const [ver, migrations] of Object.entries(UPG_MIGRATIONS)) {
        if (compareVersions(ver, v) <= 0) {
          for (const m of migrations) {
            // The pre-/at-floor rule must not be the applied mapping for `m.from`
            // UNLESS a strictly-later rule re-introduces the same key. We only
            // assert the rule at-or-below the floor is not the one in effect.
            const applied = atFloor[m.from]
            const reintroducedLater = Object.entries(UPG_MIGRATIONS).some(
              ([laterVer, laterMs]) =>
                compareVersions(laterVer, v) > 0 && laterMs.some((lm) => lm.from === m.from),
            )
            if (!reintroducedLater) {
              expect(applied).toBeUndefined()
            }
          }
        }
      }
    }
  })

  it('versionInRange semantics: floor is EXCLUSIVE, target is INCLUSIVE', () => {
    // A migration AT the floor version is excluded (half-open lower bound);
    // a migration AT the target version is included.
    // hypothesis→hypothesis_claim lives at 0.2.8.
    const exactlyAtFloor = getMigrationMap('0.2.8', LATEST)
    expect(exactlyAtFloor.hypothesis).toBeUndefined() // 0.2.8 rule excluded at floor 0.2.8

    const justBelowFloor = getMigrationMap('0.2.7', '0.2.8')
    expect(justBelowFloor.hypothesis).toBe('hypothesis_claim') // 0.2.8 rule included at target 0.2.8
  })
})
