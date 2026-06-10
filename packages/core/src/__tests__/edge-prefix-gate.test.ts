/**
 * Edge-prefix gate (F2 · · pattern P-I).
 *
 * A canonical edge key MUST begin with its `source_type` (token-aware), so the
 * edge resolves from the correct side and is visible on the source entity's
 * card. The domain-wiring audit found a class of "mis-typed" edges whose key
 * named one type but whose `source_type`/`target_type` pointed at another — e.g.
 * the `funnel_step_*` family was typed against `funnel`, breaking the required
 * growth↔ux bridge from the funnel_step side. A single invariant catches the
 * whole class.
 *
 * Token-aware matters: `funnel` is a raw string-prefix of `funnel_step_...`, so
 * a naive `key.startsWith(source_type)` would pass the very bug it must catch.
 * We require the key's leading underscore-delimited token-run to EQUAL the
 * source_type.
 */
import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG, UPG_WILDCARD_ENDPOINT } from '../catalog/edge-catalog.js'
import { UPG_POLYMORPHIC_EDGE_KEYS } from '../catalog/edge-catalog.js'

/**
 * Documented allow-list: edge keys whose leading token-run is intentionally NOT
 * the source_type. Each entry must record WHY.
 *
 *  - Polymorphic edges keyed `node_*` (and the `decision_*_node` / `framework_
 *    exercise_includes_node` family) have a wildcard source and are registered
 *    in UPG_POLYMORPHIC_EDGE_KEYS; their key prefix is the wildcard token, not a
 *    concrete source_type. They are exempted en masse below.
 *
 * The former `objective_rolls_up_to_strategic_theme` exception is
 * RESOLVED: the edge was renamed to `strategic_theme_contains_objective`
 * (source-first key, clean `contains` forward verb), so it now satisfies the
 * prefix gate on its own and no longer needs an exception.
 */
const KNOWN_VERBOSE_KEY_EXCEPTIONS = new Set<string>([])

/** A key's leading token-run equals `source_type` (token-aware prefix). */
function keyPrefixMatchesSource(key: string, sourceType: string): boolean {
  if (key === sourceType) return true
  return key.startsWith(sourceType + '_')
}

const polymorphic = new Set<string>(UPG_POLYMORPHIC_EDGE_KEYS as readonly string[])

describe('edge-prefix gate — every edge key starts with its source_type (token-aware)', () => {
  it('the funnel_step family is typed against funnel_step (regression for the known P-I bug)', () => {
    for (const k of [
      'funnel_step_maps_to_journey_step',
      'customer_journey_stage_contains_funnel_step',
      'sales_motion_qualifies_via_funnel_step',
    ]) {
      const def = UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG]
      expect(def, `${k} missing`).toBeTruthy()
    }
    // the one whose source is funnel_step
    expect(UPG_EDGE_CATALOG.funnel_step_maps_to_journey_step.source_type).toBe('funnel_step')
    // the two whose target is funnel_step
    expect(UPG_EDGE_CATALOG.customer_journey_stage_contains_funnel_step.target_type).toBe('funnel_step')
    expect(UPG_EDGE_CATALOG.sales_motion_qualifies_via_funnel_step.target_type).toBe('funnel_step')
  })

  it('no edge key mismatches its source_type prefix (outside the documented allow-list)', () => {
    const violations: string[] = []
    for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
      // Polymorphic-source edges: key prefix is the wildcard, not a concrete type.
      if (def.source_type === UPG_WILDCARD_ENDPOINT || polymorphic.has(key)) continue
      if (KNOWN_VERBOSE_KEY_EXCEPTIONS.has(key)) continue
      if (!keyPrefixMatchesSource(key, def.source_type)) {
        violations.push(`${key}  (source_type="${def.source_type}", target_type="${def.target_type}")`)
      }
    }
    expect(violations, `edge keys whose leading token-run is not the source_type:\n${violations.join('\n')}`).toEqual([])
  })

  it('the allow-list contains only still-present keys (no stale exemptions)', () => {
    for (const k of KNOWN_VERBOSE_KEY_EXCEPTIONS) {
      expect(UPG_EDGE_CATALOG[k as keyof typeof UPG_EDGE_CATALOG], `stale allow-list entry: ${k}`).toBeTruthy()
    }
  })
})
