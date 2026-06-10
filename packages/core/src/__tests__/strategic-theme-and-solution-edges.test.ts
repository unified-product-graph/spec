/**
 * strategic_theme wiring + solution graduation — v0.5.4 ( +)
 *
 * adds three edges that lift strategic_theme from structural isolation
 * (1 outgoing: strategic_theme_pursues_initiative) to a conceptually central
 * strategy node with direct causal links to outcomes and key results, plus an
 * incoming hierarchy edge from objectives:
 *
 *   - strategic_theme_delivers_outcome         (strategy · causal)
 *   - strategic_theme_measured_by_key_result   (strategy · causal)
 *   - strategic_theme_contains_objective       (strategy · hierarchy; rename)
 *
 * adds the explicit Solution Tree graduation moment:
 *
 *   - solution_becomes_feature                 (discovery · causal)
 *
 * Together they close:
 *
 *   opportunity → solution → feature
 *   strategic_pillar → strategic_theme → objective → key_result (full cascade)
 *
 * Run: npx vitest run src/__tests__/strategic-theme-and-solution-edges.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import {
  UPG_EDGE_PAIR_MAP,
  resolveContainmentEdge,
} from '../index.js'

// ───: strategic_theme_delivers_outcome ───────────────────────────────

describe(' — strategic_theme_delivers_outcome', () => {
  it('exists in UPG_EDGE_CATALOG with correct shape', () => {
    const def = UPG_EDGE_CATALOG.strategic_theme_delivers_outcome
    expect(def).toBeDefined()
    expect(def.source_type).toBe('strategic_theme')
    expect(def.target_type).toBe('outcome')
    expect(def.classification).toBe('causal')
    expect(def.forward_verb).toBe('delivers')
    expect(def.reverse_verb).toBe('delivered_by')
  })

  it('UPG_EDGE_PAIR_MAP indexes the strategic_theme → outcome pair', () => {
    expect(UPG_EDGE_PAIR_MAP['strategic_theme:outcome']).toContain(
      'strategic_theme_delivers_outcome',
    )
  })
})

// ───: strategic_theme_measured_by_key_result ─────────────────────────

describe(' — strategic_theme_measured_by_key_result', () => {
  it('exists in UPG_EDGE_CATALOG with correct shape', () => {
    const def = UPG_EDGE_CATALOG.strategic_theme_measured_by_key_result
    expect(def).toBeDefined()
    expect(def.source_type).toBe('strategic_theme')
    expect(def.target_type).toBe('key_result')
    expect(def.classification).toBe('causal')
    expect(def.forward_verb).toBe('measured_by')
    expect(def.reverse_verb).toBe('measures')
  })

  it('UPG_EDGE_PAIR_MAP indexes the strategic_theme → key_result pair', () => {
    expect(UPG_EDGE_PAIR_MAP['strategic_theme:key_result']).toContain(
      'strategic_theme_measured_by_key_result',
    )
  })
})

// ─── /: strategic_theme_contains_objective ───────────────────
//
// UPG hierarchy convention: source = parent, target = child.
// strategic_theme is the parent; objective is the child.
// Edge direction: strategic_theme → objective.
// Renamed from the malformed `objective_rolls_up_to_strategic_theme`
// to the source-first `strategic_theme_contains_objective`; the forward verb is
// the clean `contains` (was `contains_objective`); reverse_verb `rolls_up_to`
// still captures the upward-rollup read.

describe(' / — strategic_theme_contains_objective', () => {
  it('exists in UPG_EDGE_CATALOG with correct shape', () => {
    const def = UPG_EDGE_CATALOG.strategic_theme_contains_objective
    expect(def).toBeDefined()
    // UPG hierarchy convention: source = parent, target = child
    expect(def.source_type).toBe('strategic_theme')
    expect(def.target_type).toBe('objective')
    expect(def.classification).toBe('hierarchy')
    expect(def.forward_verb).toBe('contains')
    expect(def.reverse_verb).toBe('rolls_up_to')
  })

  it('the renamed-from key is gone from the catalog', () => {
    expect(
      (UPG_EDGE_CATALOG as Record<string, unknown>).objective_rolls_up_to_strategic_theme,
    ).toBeUndefined()
  })

  it('UPG_EDGE_PAIR_MAP indexes the strategic_theme → objective pair', () => {
    expect(UPG_EDGE_PAIR_MAP['strategic_theme:objective']).toContain(
      'strategic_theme_contains_objective',
    )
  })

  it('resolveContainmentEdge("strategic_theme","objective") returns the canonical hierarchy edge', () => {
    // strategic_theme_contains_objective is the hierarchy edge for this pair.
    expect(resolveContainmentEdge('strategic_theme', 'objective')).toBe(
      'strategic_theme_contains_objective',
    )
  })
})

// ───: solution_becomes_feature ───────────────────────────────────────

describe(' — solution_becomes_feature', () => {
  it('exists in UPG_EDGE_CATALOG with correct shape', () => {
    const def = UPG_EDGE_CATALOG.solution_becomes_feature
    expect(def).toBeDefined()
    expect(def.source_type).toBe('solution')
    expect(def.target_type).toBe('feature')
    expect(def.classification).toBe('causal')
    expect(def.forward_verb).toBe('becomes')
    expect(def.reverse_verb).toBe('evolved_from')
  })

  it('UPG_EDGE_PAIR_MAP indexes the solution → feature pair', () => {
    expect(UPG_EDGE_PAIR_MAP['solution:feature']).toContain(
      'solution_becomes_feature',
    )
  })
})

// ─── structural isolation audit ──────────────────────────────────────────────

describe(' — strategic_theme outgoing-edge count', () => {
  it('strategic_theme now has at least 4 outgoing edges (was 1)', () => {
    // Note: `strategic_theme_contains_objective` has source_type=strategic_theme
    // (UPG parent → child convention), so it also counts as an outgoing edge.
    const outgoing = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, def]) => def.source_type === 'strategic_theme')
      .map(([key]) => key)
    // pre-existing
    expect(outgoing).toContain('strategic_theme_pursues_initiative')
    // v0.5.4 additions
    expect(outgoing).toContain('strategic_theme_delivers_outcome')
    expect(outgoing).toContain('strategic_theme_measured_by_key_result')
    expect(outgoing).toContain('strategic_theme_contains_objective')
    expect(outgoing.length).toBeGreaterThanOrEqual(4)
  })
})

describe(' — solution now has explicit conversion path to feature', () => {
  it('solution has solution_becomes_feature as an outgoing edge', () => {
    const outgoing = Object.entries(UPG_EDGE_CATALOG)
      .filter(([, def]) => def.source_type === 'solution')
      .map(([key]) => key)
    expect(outgoing).toContain('solution_becomes_feature')
  })
})

// ─── no semantic duplicates ───────────────────────────────────────────────────

describe('semantic overlap guard', () => {
  it('strategic_theme_pursues_initiative (pre-existing) is still intact', () => {
    // The pre-existing outgoing edge is unaffected.
    const def = UPG_EDGE_CATALOG.strategic_theme_pursues_initiative
    expect(def).toBeDefined()
    expect(def.source_type).toBe('strategic_theme')
    expect(def.target_type).toBe('initiative')
  })

  it('solution_becomes_feature does not duplicate capability_implemented_by_feature', () => {
    // capability_implemented_by_feature: capability → feature (structural)
    // solution_becomes_feature: solution → feature (causal graduation)
    // Different source types and semantics — both must exist.
    expect(UPG_EDGE_CATALOG.capability_implemented_by_feature).toBeDefined()
    expect(UPG_EDGE_CATALOG.solution_becomes_feature).toBeDefined()
    expect(UPG_EDGE_CATALOG.capability_implemented_by_feature.source_type).toBe('capability')
    expect(UPG_EDGE_CATALOG.solution_becomes_feature.source_type).toBe('solution')
  })

  it('all four new edges are between distinct types — no self-loops', () => {
    const newKeys = [
      'strategic_theme_delivers_outcome',
      'strategic_theme_measured_by_key_result',
      'strategic_theme_contains_objective',
      'solution_becomes_feature',
    ] as const
    for (const key of newKeys) {
      const def = UPG_EDGE_CATALOG[key]
      expect(def.source_type).not.toBe(def.target_type)
    }
  })
})
