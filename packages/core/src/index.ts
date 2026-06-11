/**
 * @unified-product-graph/core: Unified Product Graph Specification
 *
 * The open specification and TypeScript SDK for product knowledge graphs.
 *
 * https://unifiedproductgraph.org
 * License: MIT
 */

import { UPG_DOMAINS, getTypes } from './registry/domains.js'
import { UPG_ENTITY_META } from './registry/entity-meta.js'
import { UPG_EDGE_CATALOG } from './catalog/edge-catalog.js'
import type { UPGEdgeType } from './shapes/edges.js'

export * from './catalog/index.js'
export * from './shapes/index.js'
export * from './registry/index.js'
export * from './grammar/index.js'
export * from './properties/index.js'
export * from './presentation/index.js'
export * from './intelligence/index.js'
export * from './playbooks/index.js'
export * from './approaches/index.js'
export * from './regions/index.js'
export * from './frameworks/index.js'
export * from './format/index.js'

/**
 * The current spec version implemented by this package.
 * MUST stay in lockstep with the package.json version of the publish train —
 * it stamps the `upg_version` field of every `.upg` file written by the SDK.
 * The `check:version-lockstep` gate enforces this at release time.
 */
export const UPG_VERSION = '0.9.23' as const

/**
 * The `.upg` JSON document format version. Written to the `upg_version` field.
 * Evolves independently from `UPG_VERSION` (the catalogue version).
 */
export const UPG_FORMAT_VERSION = '0.4.0' as const

/**
 * The `.upg.md` format version. Reference: `spec/UPG-MARKDOWN-v0.1.md`.
 * Reference implementation: `@unified-product-graph/markdown`.
 */
export const MARKDOWN_FORMAT_VERSION = '0.1' as const

// ─── Entity types (computed from domain registry) ─────────────────────────────

/** Every active entity type in the spec. Computed from domains, so it never drifts. */
export const UPG_TYPES: readonly string[] = getTypes()

/** O(1) lookup set for validation and filtering */
export const UPG_TYPES_SET: ReadonlySet<string> = new Set(UPG_TYPES)

/** Human-readable display names: snake_case → Title Case. Handles known abbreviations. */
export const UPG_TYPE_NAMES: Record<string, string> = Object.fromEntries(
  UPG_TYPES.map((t) => [
    t,
    t
      .split('_')
      .map((w) => {
        if (['kpi', 'okr', 'sli', 'slo', 'sla', 'api', 'ci', 'ip', 'qa', 'ai', 'ml', 'nps', 'seo', 'gtm'].includes(w)) return w.toUpperCase()
        if (w === 'a11y') return 'A11y'
        return w.charAt(0).toUpperCase() + w.slice(1)
      })
      .join(' '),
  ]),
)

// ─── Edge types (computed from edge catalog) ─────────────────────────────────

/** Every edge type key in the spec. Computed from the edge catalog. */
export const UPG_EDGE_TYPES: readonly UPGEdgeType[] = Object.keys(
  UPG_EDGE_CATALOG,
) as UPGEdgeType[]

/**
 * Lookup map: `"source_type:target_type"` → ordered list of canonical edge keys.
 *
 * Computed from the edge catalog. Multiple edges may share a `(source, target)`
 * pair, e.g. `learning_updates_hypothesis` (causal) and `learning_refines_hypothesis`
 * (cross-domain) both connect `learning → hypothesis`. Prior to v0.4.1 this map
 * was a `Record<string, UPGEdgeType>` populated by `Object.fromEntries`, which
 * silently dropped every collision but the last (35 pairs).
 *
 * The value is now a list, ordered as edges appear in `UPG_EDGE_CATALOG`. Use
 * `pickCanonicalEdge` for a single deterministic answer and `resolveAllEdges`
 * for the full candidate set.
 */
export const UPG_EDGE_PAIR_MAP: Record<string, UPGEdgeType[]> = (() => {
  const map: Record<string, UPGEdgeType[]> = {}
  for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
    const pair = `${def.source_type}:${def.target_type}`
    ;(map[pair] ??= []).push(key as UPGEdgeType)
  }
  return map
})()

// ─── Catalogue-aware edge resolver ───────────────────────────────────────────

/**
 * Edge classification used as the canonical-pick hint and policy axis.
 * Mirrors `UPGEdgeDefinition.classification` in `catalog/edge-catalog.ts`.
 */
export type UPGEdgePickHint = 'hierarchy' | 'causal' | 'semantic' | 'cross-domain'

/**
 * Deterministic precedence used when no hint is given, or when the hinted
 * classification yields no match for the pair.
 *
 * Containment (hierarchy) wins: adapters and importers almost always mean
 * "parent contains child" when they ask for an edge. Causal beats lateral
 * (semantic / cross-domain) because cause/effect is structurally stronger
 * than association. Cross-domain is last, as it is a deliberate "bridge"
 * marker and should never silently win over an intra-domain edge.
 */
const CLASSIFICATION_RANK: Record<UPGEdgePickHint, number> = {
  hierarchy: 0,
  causal: 1,
  semantic: 2,
  'cross-domain': 3,
}

/**
 * Return every catalogued edge for the given `(source, target)` pair.
 *
 * Order matches `UPG_EDGE_CATALOG` declaration order. Returns `[]` when the
 * pair is not in the catalogue.
 *
 * @example
 * resolveAllEdges('learning', 'hypothesis')
 * // → ['learning_updates_hypothesis', 'learning_refines_hypothesis']
 */
export function resolveAllEdges(
  sourceType: string,
  targetType: string,
): UPGEdgeType[] {
  return UPG_EDGE_PAIR_MAP[`${sourceType}:${targetType}`] ?? []
}

/**
 * Pick the canonical `UPGEdgeType` for a `(source, target)` pair under an
 * explicit policy.
 *
 * **Policy:**
 * 1. If `hint` is provided and an edge with that `classification` exists for
 *    the pair, return it (first declared wins for sub-collisions inside a
 *    single classification, declaration order is the canonical tiebreaker).
 * 2. Otherwise, return the highest-ranked classification edge available,
 *    using `CLASSIFICATION_RANK` (hierarchy ≻ causal ≻ semantic ≻ cross-domain).
 * 3. If the pair has no catalogued edges, return `null`.
 *
 * **Determinism:** for any `(source, target)` the picked edge is stable across
 * runs and never changes unless the catalog is edited. This is the v0.4.1 fix:
 * pair collisions are no longer last-wins.
 *
 * @example
 * pickCanonicalEdge('product', 'decision', 'hierarchy')
 * // → 'product_decided_via_decision'  (the hierarchy-class edge)
 *
 * pickCanonicalEdge('learning', 'hypothesis')
 * // → 'learning_updates_hypothesis'   (causal beats cross-domain)
 */
export function pickCanonicalEdge(
  sourceType: string,
  targetType: string,
  hint?: UPGEdgePickHint,
): UPGEdgeType | null {
  const candidates = UPG_EDGE_PAIR_MAP[`${sourceType}:${targetType}`]
  if (!candidates || candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]!

  // Try the explicit hint first.
  if (hint) {
    for (const key of candidates) {
      if (UPG_EDGE_CATALOG[key].classification === hint) return key
    }
  }

  // Deterministic fallback: lowest-ranked classification wins; declaration
  // order breaks ties inside a classification.
  let best: UPGEdgeType = candidates[0]!
  let bestRank = CLASSIFICATION_RANK[
    UPG_EDGE_CATALOG[best].classification as UPGEdgePickHint
  ]
  for (let i = 1; i < candidates.length; i++) {
    const key = candidates[i]!
    const rank = CLASSIFICATION_RANK[
      UPG_EDGE_CATALOG[key].classification as UPGEdgePickHint
    ]
    if (rank < bestRank) {
      best = key
      bestRank = rank
    }
  }
  return best
}

/**
 * Resolve the canonical `UPGEdgeType` for a containment relationship.
 *
 * Import adapters need to emit edges like "epic contains user_story" but
 * cannot safely construct raw `${parent}_contains_${child}` template strings,
 * because that union is closed and most pairs are not registered. This function looks
 * up the canonical edge for the given parent→child pair using
 * `pickCanonicalEdge` with the `'hierarchy'` hint, falling back through the
 * standard precedence when no hierarchy-class edge exists for the pair.
 *
 * **v0.4.1 contract change:**
 * - If the pair has any catalogued edge, a deterministic canonical pick is
 *   returned (hierarchy-class preferred; otherwise causal ≻ semantic ≻
 *   cross-domain). All 35 collision pairs from the v0.4.0 audit now return
 *   non-null, fixing silent last-wins behaviour.
 * - If the pair has no catalogued edge at all, `null` is returned so the
 *   caller can fall back to `node_informs_node` or skip the edge entirely.
 *
 * **Design note:** the `hint` argument is omitted from this function for
 * back-compat. All in-tree callers (Markdown, Notion, Linear, GitHub
 * adapters) are containment-only. Callers that need a different classification
 * should call `pickCanonicalEdge(source, target, hint)` directly.
 *
 * @param parentType - Source entity type string (e.g. `'epic'`)
 * @param childType  - Target entity type string (e.g. `'user_story'`)
 * @returns Canonical `UPGEdgeType` key, or `null` if the pair has no edges.
 *
 * @example
 * resolveContainmentEdge('feature_area', 'feature')  // → 'feature_area_contains_feature'
 * resolveContainmentEdge('release', 'persona')       // → null (no edge for pair)
 * resolveContainmentEdge('product', 'decision')      // → 'product_decided_via_decision' (hierarchy)
 */
export function resolveContainmentEdge(
  parentType: string,
  childType: string,
): UPGEdgeType | null {
  return pickCanonicalEdge(parentType, childType, 'hierarchy')
}

// ─── Counts (computed) ────────────────────────────────────────────────────────
//
// Two entity-type counts exist and they intentionally differ; each states its
// filter so consumers (and introspection tools) can never conflate them
// (DT-SPEC-2):
//
//   UPG_ENTITY_COUNT — ACTIVE, NON-DEPRECATED types only. Computed from
//     `getTypes()` over `UPG_DOMAINS` (every type is assigned to exactly one
//     domain; deprecated aliases are not). This is what `get_spec_version`,
//     `list_type_labels`, and any "how many types can I create?" surface should
//     report. Currently 312.
//
//   UPG_META_COUNT — EVERY entry in the meta registry, INCLUDING deprecated
//     aliases (kpi, jtbd, pain_point, user_need, research_insight,
//     hypothesis_claim, hypothesis_evidence, …). This is what `list_entity_types`
//     reports because it must surface deprecated types so migrations can
//     resolve them. Currently 349.
//
// The numbers are correct as-is; the difference (349 − 312) is exactly the
// deprecated-alias set. Do NOT "reconcile" them to a single number — they
// answer two different questions.

/**
 * Total number of ACTIVE (non-deprecated) entity types.
 * Filter: types present in `UPG_DOMAINS` via `getTypes()`. Excludes deprecated
 * aliases. This is the canonical "creatable types" count (`get_spec_version`,
 * `list_type_labels`).
 */
export const UPG_ENTITY_COUNT = UPG_TYPES.length

/** Total number of semantic domains */
export const UPG_DOMAIN_COUNT = UPG_DOMAINS.length

/** Total number of edge types */
export const UPG_EDGE_COUNT = UPG_EDGE_TYPES.length

/**
 * Total number of entity-type entries in the meta registry, INCLUDING
 * deprecated aliases. Filter: every `UPG_ENTITY_META` row, no exclusions. This
 * is the `list_entity_types` count and is strictly ≥ `UPG_ENTITY_COUNT`; the
 * gap is the deprecated-alias set.
 */
export const UPG_META_COUNT = UPG_ENTITY_META.length
