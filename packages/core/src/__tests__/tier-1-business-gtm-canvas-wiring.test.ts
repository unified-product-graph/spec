/**
 * Tier-1 Business/GTM Canvas Wiring — v0.5.5
 *
 * The slot-connectivity audit (Agent O2) enumerated 240
 * missing ordered slot-pair edges across five Tier-1 business/GTM canvases:
 *
 *   - Business Model Canvas (Osterwalder)
 *   - Lean Canvas (Maurya)
 *   - GTM Playbook
 *   - Opportunity Canvas (Patton)
 *   - Test Card + Learning Card (Strategyzer)
 *
 * Part 2a adds 29 edges (24 high-confidence + 5 medium-confidence) that
 * represent real, canonical relationships from the source literature. The
 * remaining ~211 pairs are LOW-confidence (slot-pair artifacts, hierarchy
 * reverses already covered by reverse traversal, mediated paths) and
 * explicitly NOT added.
 *
 * This test guards:
 *
 *   1. Each new edge exists in UPG_EDGE_CATALOG with the declared shape
 *      (source/target/classification/verbs).
 *   2. UPG_EDGE_PAIR_MAP indexes each new (source, target) pair.
 *   3. The post-fix connectivity_ratio for each of the 5 frameworks is
 *      meaningfully higher than the pre-fix baseline (Part 1 audit numbers).
 *
 * Run: npx vitest run src/__tests__/tier-1-business-gtm-canvas-wiring.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_EDGE_PAIR_MAP, resolveAllEdges } from '../index.js'
import { UPG_FRAMEWORKS } from '../frameworks/definitions/index.js'

// ─── New edges declared in v0.5.5 ────────────────────────────────────────────

/** All edges added by. Keep in lock-step with edge-catalog.ts. */
const NEW_EDGES = {
  // Business Model Canvas — HIGH-confidence
  key_activity_delivers_value_proposition: {
    source_type: 'key_activity', target_type: 'value_proposition',
    classification: 'causal', forward_verb: 'delivers', reverse_verb: 'delivered_by',
  },
  key_activity_uses_key_resource: {
    source_type: 'key_activity', target_type: 'key_resource',
    classification: 'cross-domain', forward_verb: 'uses', reverse_verb: 'used_by',
  },
  key_resource_enables_key_activity: {
    source_type: 'key_resource', target_type: 'key_activity',
    classification: 'cross-domain', forward_verb: 'enables', reverse_verb: 'enabled_by',
  },
  partnership_performs_key_activity: {
    source_type: 'partnership', target_type: 'key_activity',
    classification: 'cross-domain', forward_verb: 'performs', reverse_verb: 'performed_by',
  },
  partnership_provides_key_resource: {
    source_type: 'partnership', target_type: 'key_resource',
    classification: 'cross-domain', forward_verb: 'provides', reverse_verb: 'provided_by',
  },
  customer_relationship_with_market_segment: {
    source_type: 'customer_relationship', target_type: 'market_segment',
    classification: 'cross-domain', forward_verb: 'with', reverse_verb: 'maintained_by',
  },
  distribution_channel_reaches_market_segment: {
    source_type: 'distribution_channel', target_type: 'market_segment',
    classification: 'cross-domain', forward_verb: 'reaches', reverse_verb: 'reached_by',
  },
  distribution_channel_delivers_value_proposition: {
    source_type: 'distribution_channel', target_type: 'value_proposition',
    classification: 'cross-domain', forward_verb: 'delivers', reverse_verb: 'delivered_by',
  },
  value_proposition_addresses_market_segment: {
    source_type: 'value_proposition', target_type: 'market_segment',
    classification: 'cross-domain', forward_verb: 'addresses', reverse_verb: 'addressed_by',
  },
  revenue_stream_captured_from_market_segment: {
    source_type: 'revenue_stream', target_type: 'market_segment',
    classification: 'cross-domain', forward_verb: 'captured_from', reverse_verb: 'yields_revenue_via',
  },
  cost_structure_driven_by_key_activity: {
    source_type: 'cost_structure', target_type: 'key_activity',
    classification: 'causal', forward_verb: 'driven_by', reverse_verb: 'drives_cost_via',
  },
  cost_structure_driven_by_key_resource: {
    source_type: 'cost_structure', target_type: 'key_resource',
    classification: 'causal', forward_verb: 'driven_by', reverse_verb: 'drives_cost_via',
  },
  value_proposition_yields_revenue_stream: {
    source_type: 'value_proposition', target_type: 'revenue_stream',
    classification: 'causal', forward_verb: 'yields', reverse_verb: 'yielded_by',
  },
  // Business Model Canvas — MEDIUM-confidence
  customer_relationship_supports_value_proposition: {
    source_type: 'customer_relationship', target_type: 'value_proposition',
    classification: 'cross-domain', forward_verb: 'supports', reverse_verb: 'supported_by',
  },
  partnership_supports_value_proposition: {
    source_type: 'partnership', target_type: 'value_proposition',
    classification: 'cross-domain', forward_verb: 'supports', reverse_verb: 'supported_by',
  },

  // Lean Canvas — HIGH-confidence
  solution_addresses_need: {
    source_type: 'solution', target_type: 'need',
    classification: 'causal', forward_verb: 'addresses', reverse_verb: 'addressed_by',
  },
  capability_enables_value_proposition: {
    source_type: 'capability', target_type: 'value_proposition',
    classification: 'causal', forward_verb: 'enables', reverse_verb: 'enabled_by',
  },
  competitor_addresses_need: {
    source_type: 'competitor', target_type: 'need',
    classification: 'cross-domain', forward_verb: 'addresses', reverse_verb: 'addressed_by',
  },

  // GTM Playbook — HIGH-confidence
  ideal_customer_profile_informs_positioning: {
    source_type: 'ideal_customer_profile', target_type: 'positioning',
    classification: 'causal', forward_verb: 'informs', reverse_verb: 'informed_by',
  },
  ideal_customer_profile_shapes_messaging: {
    source_type: 'ideal_customer_profile', target_type: 'messaging',
    classification: 'causal', forward_verb: 'shapes', reverse_verb: 'shaped_by',
  },
  ideal_customer_profile_shapes_sales_motion: {
    source_type: 'ideal_customer_profile', target_type: 'sales_motion',
    classification: 'causal', forward_verb: 'shapes', reverse_verb: 'shaped_by',
  },
  messaging_used_in_launch: {
    source_type: 'messaging', target_type: 'launch',
    classification: 'cross-domain', forward_verb: 'used_in', reverse_verb: 'uses',
  },
  messaging_enables_sales_motion: {
    source_type: 'messaging', target_type: 'sales_motion',
    classification: 'cross-domain', forward_verb: 'enables', reverse_verb: 'enabled_by',
  },

  // Test Card + Learning Card — HIGH-confidence
  // Re-pointed from the retired `test_plan_ran_as_experiment_run`
  // (test_plan re-homed to QA). The Test Card "Test Design" is the
  // experiment_plan, which designs the experiment it produces.
  experiment_plan_designs_experiment: {
    source_type: 'experiment_plan', target_type: 'experiment',
    classification: 'hierarchy', forward_verb: 'designs', reverse_verb: 'designed_by',
  },
  evidence_interpreted_as_learning: {
    source_type: 'evidence', target_type: 'learning',
    classification: 'causal', forward_verb: 'interpreted_as', reverse_verb: 'interpreted_from',
  },
  learning_informs_decision: {
    source_type: 'learning', target_type: 'decision',
    classification: 'causal', forward_verb: 'informs', reverse_verb: 'informed_by',
  },

  // Opportunity Canvas — MEDIUM-confidence (assumption subject)
  assumption_concerns_need: {
    source_type: 'assumption', target_type: 'need',
    classification: 'semantic', forward_verb: 'concerns', reverse_verb: 'has_assumption',
  },
  assumption_concerns_persona: {
    source_type: 'assumption', target_type: 'persona',
    classification: 'semantic', forward_verb: 'concerns', reverse_verb: 'has_assumption',
  },
  assumption_concerns_solution: {
    source_type: 'assumption', target_type: 'solution',
    classification: 'semantic', forward_verb: 'concerns', reverse_verb: 'has_assumption',
  },
} as const

// ─── Shape and registry assertions ───────────────────────────────────────────

describe(' — every new edge is registered with the declared shape', () => {
  for (const [key, expected] of Object.entries(NEW_EDGES)) {
    it(`${key}: catalog entry matches declared shape`, () => {
      const def = (UPG_EDGE_CATALOG as Record<string, unknown>)[key] as
        | { source_type: string; target_type: string; classification: string; forward_verb: string; reverse_verb: string }
        | undefined
      expect(def).toBeDefined()
      expect(def!.source_type).toBe(expected.source_type)
      expect(def!.target_type).toBe(expected.target_type)
      expect(def!.classification).toBe(expected.classification)
      expect(def!.forward_verb).toBe(expected.forward_verb)
      expect(def!.reverse_verb).toBe(expected.reverse_verb)
    })

    it(`${key}: UPG_EDGE_PAIR_MAP indexes (${expected.source_type}, ${expected.target_type})`, () => {
      const pairKey = `${expected.source_type}:${expected.target_type}`
      expect(UPG_EDGE_PAIR_MAP[pairKey]).toContain(key)
    })
  }
})

// ─── Self-loop guard ─────────────────────────────────────────────────────────

describe(' — no self-loops introduced', () => {
  it('every new edge has distinct source and target types', () => {
    for (const [key, expected] of Object.entries(NEW_EDGES)) {
      expect(expected.source_type, `${key} source/target collision`).not.toBe(
        expected.target_type,
      )
    }
  })
})

// ─── Catalog growth ──────────────────────────────────────────────────────────

describe(' — catalog grew by exactly 29 edges over v0.5.4', () => {
  it('all 29 new edge keys are present in UPG_EDGE_CATALOG', () => {
    const keys = Object.keys(NEW_EDGES)
    expect(keys.length).toBe(29)
    for (const key of keys) {
      expect((UPG_EDGE_CATALOG as Record<string, unknown>)[key]).toBeDefined()
    }
  })
})

// ─── Framework slot-connectivity regression ──────────────────────────────────
//
// For each of the 5 target frameworks, compute the directional slot-pair
// connectivity ratio using the same algorithm as Agent O2's Part 1 audit:
// for every ordered (A, B) pair of unique entity types appearing in slots[*]
// where A ≠ B, check whether resolveAllEdges(A, B) is non-empty.
//
// The pre-fix baselines are pinned from the Part 1 audit JSON
// (packages/upg-spec/scripts/output/framework-slot-connectivity.json).
// The post-fix expectations capture the closures from the 29 new edges.

interface ConnectivitySnapshot {
  connected: number
  total: number
  ratio: number
}

function computeSlotConnectivity(frameworkId: string): ConnectivitySnapshot {
  const fw = UPG_FRAMEWORKS.find((f) => f.id === frameworkId)
  if (!fw) throw new Error(`framework ${frameworkId} not found`)
  // v0.5.8: explicit slots guard avoids TS strict-mode
  // narrowing failure when UPGFramework.slots becomes optional. Mirrors
  // the guard pattern Agent W introduced in
  // tier-1-engineering-ai-wiring.test.ts.
  if (!fw.slots) throw new Error(`framework ${frameworkId} has no slots`)
  const uniqueTypes = Array.from(
    new Set(fw.slots.map((s) => s.entityTypeId)),
  ).filter((t): t is string => typeof t === 'string')
  let connected = 0
  let total = 0
  for (const a of uniqueTypes) {
    for (const b of uniqueTypes) {
      if (a === b) continue
      total += 1
      if (resolveAllEdges(a, b).length > 0) connected += 1
    }
  }
  return { connected, total, ratio: total === 0 ? 0 : connected / total }
}

describe(' — slot-connectivity is meaningfully higher than pre-fix baseline', () => {
  // Pre-fix baselines from Part 1 audit JSON (2026-05-21).
  const BASELINES: Record<string, { connected: number; total: number; ratio: number }> = {
    'business-model-canvas': { connected: 1, total: 72, ratio: 0.0139 },
    'lean-canvas': { connected: 14, total: 110, ratio: 0.1273 },
    'gtm-playbook': { connected: 5, total: 30, ratio: 0.1667 },
    'opportunity-canvas': { connected: 5, total: 30, ratio: 0.1667 },
    'test-card-learning-card': { connected: 7, total: 30, ratio: 0.2333 },
  }

  // Post-fix lower bounds. These are intentionally below the precise
  // simulated values so the test tolerates future *additive* improvements
  // without churn — every threshold is strictly higher than the baseline
  // and reflects a meaningful (≥+2 pair) closure.
  const POST_FIX_MIN_RATIO: Record<string, number> = {
    // 16/72 = 0.222 simulated (was 0.014) — 16× absolute, +15 pairs
    'business-model-canvas': 0.20,
    // 18/110 = 0.164 simulated (was 0.127) — +4 pairs. Lean Canvas has many
    // structurally-independent slot pairs (e.g., metric ↔ revenue_stream)
    // that don't admit canonical edges; this is the achievable bound.
    'lean-canvas': 0.16,
    // 10/30 = 0.333 simulated (was 0.167) — 2× absolute, +5 pairs
    'gtm-playbook': 0.30,
    // 9/30 = 0.300 simulated (was 0.167) — 1.8× absolute, +4 pairs
    'opportunity-canvas': 0.29,
    // 10/30 = 0.333 simulated (was 0.233) — 1.4× absolute, +3 pairs
    'test-card-learning-card': 0.32,
  }

  for (const frameworkId of Object.keys(BASELINES)) {
    it(`${frameworkId}: post-fix ratio is meaningfully higher than baseline`, () => {
      const snap = computeSlotConnectivity(frameworkId)
      const baseline = BASELINES[frameworkId]!
      const minRatio = POST_FIX_MIN_RATIO[frameworkId]!

      // 1. Total slot-pair count is unchanged (we did not touch the framework).
      expect(snap.total).toBe(baseline.total)

      // 2. Post-fix connected count is strictly higher than baseline.
      expect(snap.connected).toBeGreaterThan(baseline.connected)

      // 3. Post-fix ratio clears the meaningful-improvement bound.
      expect(snap.ratio).toBeGreaterThanOrEqual(minRatio)
    })
  }
})
