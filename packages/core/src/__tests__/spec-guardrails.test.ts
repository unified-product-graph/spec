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
 * Shipped here (deterministic, pure-catalog checks):
 *   - T1.1 status-shadows-phase            (14 baseline)
 *   - T1.2 stored-aggregate                (baseline below)
 *   - T1.3 runtime-state-on-definition-entity (baseline below)
 *   - T1.6 hierarchy<->edge-classification (28 baseline)
 *   - T1.7 cross-domain-endpoints-recompute (65 baseline)
 *   - T1.8 no past-window deprecated-property ghosts (zero-tolerance; the
 *     schema-time complement to T1.5. Added with the removal, 0.14.0.)
 *
 * T1.2 / T1.3 read the 0.11.6 `@derived` / `@snapshot` / `@volatile` modifiers
 * through the queryable surface in `properties/property-modifiers.ts` (0.13.0
 * Wave 0): the shape detectors locate derivable / live-shaped properties, and a
 * property carrying the appropriate modifier — or sitting on a record entity —
 * is exempt. Lowering their baselines is the / (Wave 2) ratchet.
 *
 * Deferred (tracked on, not yet enforced — each needs machinery this
 * mechanical gate wave doesn't have):
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
import { UPG_PROPERTY_SCHEMA, type PropertyDefinition } from '../properties/property-schema.js'
import {
  isAggregateShapedProperty,
  isRuntimeStateShapedProperty,
  isRecordEntity,
} from '../properties/property-modifiers.js'
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

// ─── T1.8 — no past-window deprecated-property ghosts ─────────────────────────
//
// The schema-time complement to the (instance-time) T1.5. The 0.9.0 RICE /
// opportunity-sizing scoring inputs were marked "@deprecated 0.9.0 ... Removed
// in 0.9.1" yet sat live in the schema until 0.14.0 — four minor
// versions of ghost. This guard forbids the recurrence: a property whose
// description announces it was "Removed in <version>" must actually be gone.
// (A genuine deprecation notice for a FUTURE removal reads "will be removed in
// <version>" and is not matched.)
describe('T1.8 spec guardrail — no property announces a past-window removal yet lingers', () => {
  const REMOVED_MARKER = /\bRemoved in \d+\.\d+/

  const ghosts: string[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    for (const [name, def] of Object.entries(props as Record<string, { description?: string }>)) {
      if (REMOVED_MARKER.test(def?.description ?? '')) ghosts.push(`${type}.${name}`)
    }
  }

  it('zero properties carry a "Removed in <version>" marker', () => {
    expect(
      ghosts.length,
      `A property announces it was "Removed in <version>" but is still present in the schema. ` +
        `Either delete it (interface + const + fixture + UPG_PROPERTY_MIGRATIONS drop_props) or, ` +
        `if it is a future-dated deprecation, phrase it "will be removed in <version>". ` +
        `Offenders:\n${ghosts.sort().join('\n')}`,
    ).toBe(0)
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
    // Baseline 28 at 2026-06-16 (matches the audit's "28 known"); lowered
    // to 27 on 2026-06-17 ( T0.4, 0.13.0 Wave 1) when the cyclic
    // metric ⊃ outcome containment was dropped. Lower as backing edges are
    // reclassified to `hierarchy` (or the pair is dropped from valid_children);
    // it must not silently grow.
    expect(
      mismatches.length,
      `NEW valid_children pair whose backing canonical edge is not hierarchy-classified. ` +
        `Either classify the backing edge \`hierarchy\`, or do not declare the containment. ` +
        `Offenders:\n${mismatches.sort().join('\n')}`,
    ).toBeLessThanOrEqual(27)
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

// ─── T1.2 — stored-aggregate ──────────────────────────────────────────────────
//
// A numeric property holding a count/rollup derivable from edges or children
// (a `*_count` / `headcount` shape) should be `@derived` — computed at read-time,
// never stored — so a hand-authored value cannot drift from the graph. We freeze
// the current inventory of untagged aggregates and forbid new ones. Tagging an
// offender `modifier: 'derived'` removes it from the set, so the
// baseline ratchets down as the debt is paid. Record entities legitimately store
// their own measured counts (a recorded token/response count is not a graph
// rollup) and are exempt. (property-fit audit Pattern B.)
describe('T1.2 spec guardrail — derivable aggregates are marked @derived', () => {
  const storedAggregates: string[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    if (isRecordEntity(type)) continue
    for (const [name, def] of Object.entries(props as Record<string, PropertyDefinition>)) {
      if (!isAggregateShapedProperty(name, def)) continue
      // @derived = a graph rollup (computed from edges/children); @snapshot = a
      // measured/observed count (e.g. responses received, executions run) — a live
      // reading, not a stored *derivable* aggregate. Either modifier discharges the
      // smell; an untagged `*_count` is the violation.
      if (def.modifier === 'derived' || def.modifier === 'snapshot') continue
      storedAggregates.push(`${type}.${name}`)
    }
  }

  it('the count of untagged stored-aggregate properties has not grown beyond the baseline', () => {
    // Baseline 52 (0.13.0 Wave 0) → 0 on 2026-06-17 (0.13.2): every
    // `*_count` / `headcount` numeric on a definition entity now carries a modifier
    // — @derived for graph rollups, @snapshot for measured counts. The debt is paid;
    // the guardrail is now strict (any NEW untagged aggregate fails). Keep it at 0.
    expect(
      storedAggregates.length,
      `NEW derivable aggregate stored as a plain scalar. A count/rollup belongs to the ` +
        `graph (edges/children) — mark it \`modifier: 'derived'\` (graph rollup) or ` +
        `\`'snapshot'\` (measured count) so a stored value can no longer silently drift. ` +
        `Offenders:\n${storedAggregates.sort().join('\n')}`,
    ).toBeLessThanOrEqual(0)
  })
})

// ─── T1.3 — runtime-state-on-definition-entity ────────────────────────────────
//
// A numeric live reading (a rate, percentage, current value, remaining budget,
// latency percentile, monthly figure, or per-unit rate) on a DEFINITION entity
// is live state masquerading as design knowledge. It should live on a `metric`
// node (by edge) or carry `@snapshot` / `@volatile` with a paired `*_as_of`
// timestamp. Record entities (`RECORD_ENTITY_TYPES`) legitimately hold live
// figures and are exempt. Freeze the untagged set; forbid new ones; lower as
// re-homes or marks them. (property-fit audit Pattern A.)
describe('T1.3 spec guardrail — live readings on definition entities are marked @snapshot/@volatile', () => {
  const runtimeState: string[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    if (isRecordEntity(type)) continue
    for (const [name, def] of Object.entries(props as Record<string, PropertyDefinition>)) {
      if (!isRuntimeStateShapedProperty(name, def)) continue
      if (def.modifier === 'snapshot' || def.modifier === 'volatile') continue
      runtimeState.push(`${type}.${name}`)
    }
  }

  it('the count of untagged runtime-state properties on definition entities has not grown beyond the baseline', () => {
    // Baseline 35 (0.13.0 Wave 0) → 0 on 2026-06-17 (0.13.2): every live
    // numeric reading on a definition entity now carries `@snapshot`. The debt is
    // paid; the guardrail is strict (any NEW untagged live reading fails). Keep at 0.
    // (The heavier re-home-to-`metric`-node refactor stays parked; tagging is the
    // audit-sanctioned lighter fix and is what makes staleness machine-visible.)
    expect(
      runtimeState.length,
      `NEW live reading on a definition entity. Route it to a \`metric\` node (by edge), or ` +
        `mark it \`modifier: 'snapshot'\` / \`'volatile'\` with a \`*_as_of\` stamp. Offenders:\n${runtimeState.sort().join('\n')}`,
    ).toBeLessThanOrEqual(0)
  })
})
