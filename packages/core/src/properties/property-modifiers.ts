/**
 * Property modifiers: the queryable surface ( / 0.13.0 Wave 0).
 *
 * The `modifier` field on `PropertyDefinition` (`'derived' | 'snapshot' |
 * 'volatile'`, shipped in 0.11.6 off the 2026-06-16 property-fit audit) marks a
 * property whose value is NOT authored-and-stable. This module turns that field
 * from "a key on a raw schema dump" into a real, machine-checkable surface:
 * accessors to enumerate modified properties, the record-vs-definition
 * governance line, and the shape detectors that the spec guardrails (and, later,
 * `validate_graph`) consume.
 *
 * It carries no I/O and no graph instance — pure catalog introspection over
 * `UPG_PROPERTY_SCHEMA`. The guardrails in `__tests__/spec-guardrails.test.ts`
 * (T1.2 stored-aggregate, T1.3 runtime-state-on-definition-entity) read from
 * here so there is exactly one definition of each smell.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import { UPG_PROPERTY_SCHEMA, type PropertyDefinition } from './property-schema.js'

/** The three property-modifier values. Single source — derived from the type. */
export type PropertyModifier = NonNullable<PropertyDefinition['modifier']>

/** All modifier values, in canonical order. */
export const PROPERTY_MODIFIERS = ['derived', 'snapshot', 'volatile'] as const

/**
 * Human-readable semantics for each modifier — the same prose the
 * `PropertyDefinition` doc comment carries, exposed as data so renderers,
 * docs, and tooling describe the modifiers consistently.
 */
export const PROPERTY_MODIFIER_SEMANTICS: Record<PropertyModifier, string> = {
  derived:
    'Computed from edges/children at read-time; never hand-authored. A stored value that contradicts the graph is a smell.',
  snapshot:
    'A stale-stamped cache of a live reading; SHOULD pair with a `*_as_of` timestamp. Definition entities carry live state only as a snapshot.',
  volatile:
    'An environment-specific pointer (URL / path / id) that may rot or be stripped on export; not portable modeling knowledge.',
}

/** One modified property, located by entity type + top-level property name. */
export interface ModifiedProperty {
  /** Entity type id (key into `UPG_PROPERTY_SCHEMA`). */
  type: string
  /** Top-level property name. */
  property: string
  /** The modifier carried by the property. */
  modifier: PropertyModifier
}

/**
 * Enumerate every property in the catalog that carries a modifier, optionally
 * filtered to one modifier kind. Top-level properties only — modifiers are a
 * property-level provenance signal and are not applied to nested object keys
 * anywhere in the catalog today.
 */
export function listPropertiesByModifier(modifier?: PropertyModifier): ModifiedProperty[] {
  const out: ModifiedProperty[] = []
  for (const [type, props] of Object.entries(UPG_PROPERTY_SCHEMA)) {
    for (const [property, def] of Object.entries(props as Record<string, PropertyDefinition>)) {
      const m = def?.modifier
      if (!m) continue
      if (modifier && m !== modifier) continue
      out.push({ type, property, modifier: m })
    }
  }
  return out
}

/** The modifier on a single property, or `undefined` if it is plain/authored. */
export function getPropertyModifier(
  entityType: string,
  property: string,
): PropertyModifier | undefined {
  return (UPG_PROPERTY_SCHEMA[entityType] as Record<string, PropertyDefinition> | undefined)?.[
    property
  ]?.modifier
}

/**
 * The modifiers an entity type carries, grouped by kind — `undefined` when the
 * entity has no modified properties. Powers the `property_modifiers` summary on
 * `get_entity_schema`.
 */
export function getEntityModifierSummary(
  entityType: string,
): Record<PropertyModifier, string[]> | undefined {
  const props = UPG_PROPERTY_SCHEMA[entityType] as Record<string, PropertyDefinition> | undefined
  if (!props) return undefined
  const summary: Record<PropertyModifier, string[]> = { derived: [], snapshot: [], volatile: [] }
  let any = false
  for (const [property, def] of Object.entries(props)) {
    const m = def?.modifier
    if (!m) continue
    summary[m].push(property)
    any = true
  }
  return any ? summary : undefined
}

// ─── The record-vs-definition governance line ─────────────────────────────────
//
// The property-fit audit's cleanest governance principle: *definition entities
// describe what is designed/configured; live readings, rolling metrics, and
// execution outcomes live on `metric` nodes (by edge) or on dedicated
// execution/record entities.* The smell (Pattern A) is live data on a
// *definition* entity — NOT on a *record* entity, which is supposed to hold live
// figures. This is the curated allowlist of entities that legitimately carry
// live/aggregate values, so the runtime-state guardrail exempts them.
//
// Grow this set when a genuine record/execution entity is added — never to
// launder live state onto a definition entity (the fix there is an edge to a
// `metric` node or a `@snapshot` modifier, not membership here).
export const RECORD_ENTITY_TYPES: ReadonlySet<string> = new Set<string>([
  'ai_cost_tracker',
  'eval_run',
  'test_result',
  'agent_session',
  'cohort',
  'ai_trace',
  'workflow_run',
])

/** Whether an entity legitimately holds live/aggregate values (a record, not a definition). */
export function isRecordEntity(entityType: string): boolean {
  return RECORD_ENTITY_TYPES.has(entityType)
}

// ─── Shape detectors (consumed by the spec guardrails + future validate_graph) ─
//
// These are intentionally tight, structurally-unambiguous name shapes — not a
// kitchen sink. They power baseline-FREEZE guardrails (the count of untagged
// matches may not grow), so a narrow detector under-counts harmlessly while a
// loose one would inflate the frozen baseline with false positives. The broad
// bulk cleanup of the ~85 audit findings is Wave 2 ( /); these
// detectors guard the dominant cases and forbid NEW ones.

/**
 * Aggregate shape (Pattern B): a numeric count/rollup derivable from edges or
 * children. Tight signal: a `number`-typed property whose name ends in `_count`
 * (or is `headcount`). Such a value should be `@derived`, not stored.
 */
export function isAggregateShapedProperty(name: string, def: PropertyDefinition): boolean {
  if (def?.type !== 'number') return false
  return name.endsWith('_count') || name === 'headcount'
}

/**
 * Runtime-state shape (Pattern A): a numeric live reading — a rate, percentage,
 * current value, remaining budget, latency percentile, monthly figure, or
 * per-unit rate. On a definition entity such a value should live on a `metric`
 * node (by edge) or be marked `@snapshot`. `*_status` enums are intentionally
 * left to the T1.1 status-shadows-phase guardrail; this detector owns the
 * numeric live readings.
 */
export function isRuntimeStateShapedProperty(name: string, def: PropertyDefinition): boolean {
  if (def?.type !== 'number') return false
  return (
    /_rate$/.test(name) ||
    /_pct$/.test(name) ||
    /^current_/.test(name) ||
    /_remaining$/.test(name) ||
    /_p\d+_/.test(name) ||
    /^monthly_/.test(name) ||
    /_per_/.test(name)
  )
}
