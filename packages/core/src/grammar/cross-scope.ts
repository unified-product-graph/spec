/**
 * Cross-product edge scope — the derived 3-state model (0.18.0). Layer 2: it
 * bridges the cross-product facts that already live split across lower layers —
 * `UPG_CROSS_EDGE_TYPES` (shapes/document), the catalog `cross_product_eligible`
 * flags (catalog/edge-catalog), and `portfolio_shared` (registry/entity-meta).
 *
 * Cross-product eligibility is NOT cleanly derivable from a single per-edge signal:
 * endpoint entity-TIER is necessary but not sufficient (a "≥1 shared endpoint ⇒
 * eligible" rule over-admits ~5×, because portfolio-shared types also anchor rich
 * within-graph decomposition). So eligibility is a two-layer model:
 *
 *  - **curated**     — the blessed canonical set (`UPG_CROSS_EDGE_TYPES`, 59 types:
 *                      21 portfolio-native + 38 catalog-flagged `cross_product_eligible`).
 *                      Hard-allow at the write surface, no warning.
 *  - **provisional** — an unflagged catalog edge that PASSES the shared-tier gate
 *                      (≥1 endpoint `portfolio_shared`). Allowed at the write surface
 *                      WITH a warning, and never added to the canonical set — it only
 *                      materialises as a warning if actually authored. This is what
 *                      removes the per-edge catalog-PR friction: modelling a genuinely
 *                      cross relationship no longer needs a spec change mid-session.
 *                      The warning is WRITE-TIME only — `portfolio_validate` does not
 *                      re-surface it and is not an eligibility backstop.
 *  - **resident**    — no shared endpoint and not curated. Hard-rejected cross-product;
 *                      the containment guardrail (persona↔job↔need decompositions,
 *                      product-local reasoning) that must stay in-graph.
 *
 * The gate (`isCrossCapable`) is DERIVED from `EntityTypeMeta.portfolio_shared`, so
 * the guardrail is self-maintaining: a new persona/job/need internal edge is
 * auto-rejected with no list to touch. The canonical `UPG_CROSS_EDGE_TYPES` snapshot
 * is UNCHANGED (adapters / portfolio_query / list_cross_edge_types keep reading 59);
 * `crossProductScope` is a separate predicate the write + read surfaces consult.
 */

import { UPG_EDGE_CATALOG, type UPGEdgeDefinition } from '../catalog/edge-catalog.js'
import { isPortfolioSharedType } from '../registry/entity-meta.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'

/** The three cross-product states a directed relationship can occupy. */
export type CrossProductScope = 'curated' | 'provisional' | 'resident'

const CURATED_CROSS_EDGE_SET: ReadonlySet<string> = new Set(UPG_CROSS_EDGE_TYPES)

/**
 * The shared-tier GATE: is a directed edge between these endpoint types authorable
 * across product graphs at all? True iff ≥1 endpoint type is `portfolio_shared`.
 * A `node`-wildcard endpoint never qualifies on its own (it is not shared), so the
 * decision rides on the concrete other endpoint — exactly the polymorphic
 * `node_owned_by_team` / `node_classified_as_classification_value` case.
 *
 * This is a NECESSARY condition, not sufficient: a gate-pass edge that is not curated
 * is `provisional`, not eligible. Failing the gate is the hard guardrail.
 *
 * @example
 * isCrossCapable('objective', 'metric')  // → true  (both shared)
 * isCrossCapable('node', 'team')         // → true  (team shared)
 * isCrossCapable('persona', 'job')       // → false (neither shared → resident)
 */
export function isCrossCapable(sourceType: string, targetType: string): boolean {
  return isPortfolioSharedType(sourceType) || isPortfolioSharedType(targetType)
}

/**
 * True if this cross-edge type is in the curated canonical set (`UPG_CROSS_EDGE_TYPES`,
 * the 59). Distinct from the catalog's `isCrossProductEligible` (the 38 dual-registered
 * flags only): this also covers the 21 portfolio-native cross-only types.
 *
 * @example
 * isCuratedCrossEligible('shares_persona')                     // → true (portfolio-native)
 * isCuratedCrossEligible('strategic_theme_contains_objective') // → true (flagged)
 * isCuratedCrossEligible('experiment_run_measures_metric')     // → false (provisional, not curated)
 */
export function isCuratedCrossEligible(edgeType: string): boolean {
  return CURATED_CROSS_EDGE_SET.has(edgeType)
}

/**
 * Classify an edge TYPE into the 3-state cross-product model. The single classifier
 * consulted by the write surfaces (curated → allow, provisional → allow+warn,
 * resident → reject) and the read surfaces (`resolve_edge_for_pair`,
 * `get_entity_schema`), so model-time guidance and write-time enforcement agree.
 *
 * Type-based (not instance-based): for a catalog edge the gate reads the DECLARED
 * endpoint types, matching how the write handlers gate on `edge.type`. A portfolio-
 * native cross-only type (no catalog def) is curated by membership.
 *
 * @example
 * crossProductScope('product_pursues_outcome')        // → 'curated'
 * crossProductScope('experiment_run_measures_metric') // → 'provisional' (metric shared)
 * crossProductScope('persona_pursues_job')            // → 'resident'
 */
export function crossProductScope(edgeType: string): CrossProductScope {
  if (CURATED_CROSS_EDGE_SET.has(edgeType)) return 'curated'
  const def = (UPG_EDGE_CATALOG as Record<string, UPGEdgeDefinition>)[edgeType]
  if (def && isCrossCapable(def.source_type, def.target_type)) return 'provisional'
  return 'resident'
}
