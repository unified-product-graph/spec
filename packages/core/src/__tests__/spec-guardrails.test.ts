/**
 * Tier-1 spec guardrails (parent) — codify the 2026-06-16
 * structure audits as enforcement so the Band-B sweeps can't silently regress.
 *
 * Each guardrail follows the `edge-duplicate-gate` pattern: compute the live
 * violation set from the catalog, FREEZE the current count as a documented
 * baseline, and FAIL if a new edit pushes it higher. The known debt is bounded
 * and trackable; new violations can no longer slip in unnoticed. Lowering a
 * baseline as the debt is paid down (a reclassification / recompute pass) is
 * expected and welcome — drop the number then.
 *
 * Shipped here (deterministic, pure-catalog checks, no modifier dependency):
 *   - T1.1 status-shadows-phase          (14 baseline)
 *   - T1.6 hierarchy<->edge-classification (28 baseline)
 *   - T1.7 cross-domain-endpoints-recompute (65 baseline)
 *
 * Deferred (tracked on, not yet enforced — each needs machinery this
 * mechanical gate wave doesn't have):
 *   - T1.2 stored-aggregate / T1.3 runtime-state-on-definition-entity — depend
 *     on the 0.11.6 `@derived` / `@snapshot` / `@volatile` property modifiers
 *     being represented in UPG_PROPERTY_SCHEMA in a machine-checkable form;
 *     scaffold once the modifier surface is queryable.
 *   - T1.4 scalar-mirrors-edge — the precise P14 enforcement (`spec-principles`
 *     keeps the broad form `it.skip` at ~85% false positives). Needs a curated
 *     FK-shaped-scalar baseline, not a regex; sequence after the P14 sweep
 *     (0.12.0-0.12.4) settles. Pairs with a `dangling_scalar_reference` anti-pattern.
 *   - T1.5 deprecated-property-written — a graph-INSTANCE anti-pattern (a
 *     `@deprecated` prop present on a node payload), so it belongs in the
 *     intelligence/evaluator subsystem that runs against a user .upg, not in
 *     this catalog-introspection gate. Pairs with.
 *
 * Relates (broaden anti-pattern coverage).
 */
import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_LIFECYCLES } from '../grammar/lifecycles.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'
import { getDomainForType } from '../registry/domains.js'
import { pickCanonicalEdge } from '../index.js'

// ─── T1.1 — status-shadows-phase ──────────────────────────────────────────────
//
// A `*_status` enum property whose values are a SUBSET of some entity lifecycle's
// phase set is re-encoding a lifecycle as a property, shadowing the base-node
// `status` field that the lifecycle already drives. (E.g. roadmap_item.item_status
// [planned/in_progress/shipped/deferred] mirrors a roadmap lifecycle.) The fix is
// to drop the property and let `status` carry the phase. We freeze the current
// inventory and forbid new shadows.
describe('T1.1 spec guardrail — *_status enums do not newly shadow a lifecycle phase set', () => {
  const phaseSets = UPG_LIFECYCLES.map((lc) => new Set((lc.phases ?? []).map((p) => p.id))).filter(
    (s) => s.size > 0,
  )
  const isSubsetOfSomePhaseSet = (values: readonly string[]): boolean =>
    phaseSets.some((ps) => values.every((v) => ps.has(v)))

  const shadows: string[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    for (const [name, def] of Object.entries(props as Record<string, { enum?: readonly string[] }>)) {
      if (!name.endsWith('_status')) continue
      const en = def?.enum
      if (!Array.isArray(en) || en.length === 0) continue
      if (isSubsetOfSomePhaseSet(en)) shadows.push(`${type}.${name}`)
    }
  }

  it('the count of status-shadows-phase properties has not grown beyond the baseline', () => {
    // Baseline 14 at 2026-06-16. Lower this as shadows are collapsed
    // into the base-node `status` field; it must not silently grow.
    expect(
      shadows.length,
      `NEW *_status enum shadowing a lifecycle phase set. A status property that mirrors a ` +
        `lifecycle phase ladder duplicates the base-node \`status\` field — drop it and let the ` +
        `lifecycle carry the phase. Offenders:\n${shadows.sort().join('\n')}`,
    ).toBeLessThanOrEqual(14)
  })
})

// ─── T1.6 — hierarchy <-> edge-classification ─────────────────────────────────
//
// Every `valid_children` (containment) pair should be backed by a catalog edge
// classified `hierarchy`. A pair whose canonical edge resolves to semantic /
// causal / cross-domain means the containment claim and the edge taxonomy
// disagree (the tree says "contains", the edge says "relates"). Freeze the
// current mismatches; forbid new ones.
describe('T1.6 spec guardrail — valid_children pairs are backed by hierarchy-classified edges', () => {
  const mismatches: string[] = []
  for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
    for (const child of children) {
      const edge = pickCanonicalEdge(parent, child, 'hierarchy')
      if (!edge) {
        mismatches.push(`${parent}->${child} [no backing edge]`)
        continue
      }
      if (UPG_EDGE_CATALOG[edge]?.classification !== 'hierarchy') {
        mismatches.push(`${parent}->${child} [${edge}=${UPG_EDGE_CATALOG[edge]?.classification}]`)
      }
    }
  }

  it('the count of non-hierarchy-backed containment pairs has not grown beyond the baseline', () => {
    // Baseline 28 at 2026-06-16 (matches the audit's "28 known"). Lower
    // as backing edges are reclassified to `hierarchy` (or the pair is dropped
    // from valid_children); it must not silently grow.
    expect(
      mismatches.length,
      `NEW valid_children pair whose backing canonical edge is not hierarchy-classified. ` +
        `Either classify the backing edge \`hierarchy\`, or do not declare the containment. ` +
        `Offenders:\n${mismatches.sort().join('\n')}`,
    ).toBeLessThanOrEqual(28)
  })
})

// ─── T1.7 — cross-domain endpoints recompute ──────────────────────────────────
//
// An edge classified `cross-domain` whose source and target types live in the
// SAME registry domain contradicts its own classification (it does not cross a
// domain boundary). The classification should be recomputed from the domain map.
// Freeze the current set; forbid new cross-domain edges that stay within a domain.
describe('T1.7 spec guardrail — cross-domain edges do not newly connect same-domain endpoints', () => {
  const sameDomain: string[] = []
  for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
    if (def.classification !== 'cross-domain') continue
    const sd = getDomainForType(def.source_type)?.id
    const td = getDomainForType(def.target_type)?.id
    if (sd && td && sd === td) sameDomain.push(`${key} [${def.source_type}->${def.target_type} in ${sd}]`)
  }

  it('the count of cross-domain edges with same-domain endpoints has not grown beyond the baseline', () => {
    // Baseline 65 at 2026-06-16. These are reclassification debt —
    // a `cross-domain` edge that stays within one domain should be `semantic`
    // (or another in-domain class). Lower as the recompute pass lands; it must
    // not silently grow.
    expect(
      sameDomain.length,
      `NEW cross-domain edge whose endpoints are in the same domain — recompute its ` +
        `classification (within a domain it is not cross-domain). Offenders:\n${sameDomain.sort().join('\n')}`,
    ).toBeLessThanOrEqual(65)
  })
})
