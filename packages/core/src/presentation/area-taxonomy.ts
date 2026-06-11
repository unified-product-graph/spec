/**
 * UPG area-taxonomy cross-walk (0.9.16). Three overlapping "area" groupings ship
 * across the stack, and skills repeatedly conflated them, computing coverage
 * against a stale denominator:
 *
 *   1. `get_graph_digest.coverage` -> 10 stage-oriented coverage keys
 *      (identity, understanding, discovery, validation, reaching, converting,
 *       building, sustaining, learning, operations). Source of truth:
 *      `BUSINESS_AREAS` in the SDK's lib/tools.ts.
 *   2. `list_regions` -> 11 canonical super-domain regions (this package's
 *      regions/catalog.ts: strategy_outcomes ... foundations).
 *   3. the shared docs' "8 business areas" (identity ... learning). Source of
 *      truth: `BusinessArea` / `BUSINESS_AREA_META` in the SDK's classification.ts.
 *
 * This table is the documented, introspectable correspondence between them, so a
 * skill can translate any direction instead of guessing. It is keyed by the 10
 * `digest.coverage` keys (the denominator skills hit most): each entry names the
 * matching "8 business area" (null for `validation` and `operations`, which the
 * 8-area grouping folds into discovery / omits) and the canonical region ids the
 * key's entities live in (primary first).
 *
 * Drift guard: a test in the SDK pins `coverage_key` against the live
 * `BUSINESS_AREAS` keys and `business_area` against `BUSINESS_AREA_META`, so this
 * table cannot silently fall out of step with the runtime denominators. Region
 * ids are validated against `UPG_REGIONS` by the test in this package.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

/** One row of the area-taxonomy cross-walk, keyed by a `digest.coverage` key. */
export interface UPGAreaTaxonomyEntry {
  /** The `get_graph_digest.coverage` key (one of the 10). */
  coverage_key: string
  /** Human label. */
  label: string
  /**
   * The matching "8 business area" id, or null when the 8-area grouping has no
   * direct equivalent (`validation` folds into `discovery`; `operations` is not
   * one of the 8).
   */
  business_area: string | null
  /** Canonical region ids whose entities this coverage key draws from (primary first). */
  regions: string[]
}

/**
 * The cross-walk. Append/edit in lockstep with the SDK `BUSINESS_AREAS` (coverage
 * keys) and `classification.ts` (business areas); the SDK drift test enforces it.
 */
export const UPG_AREA_TAXONOMY: readonly UPGAreaTaxonomyEntry[] = [
  { coverage_key: 'identity',      label: 'Identity',      business_area: 'identity',      regions: ['strategy_outcomes'] },
  { coverage_key: 'understanding', label: 'Understanding', business_area: 'understanding', regions: ['users_needs', 'discovery_research_validation'] },
  { coverage_key: 'discovery',     label: 'Discovery',     business_area: 'discovery',     regions: ['discovery_research_validation', 'market_competitive'] },
  { coverage_key: 'validation',    label: 'Validation',    business_area: null,            regions: ['discovery_research_validation'] },
  { coverage_key: 'reaching',      label: 'Reaching',      business_area: 'reaching',      regions: ['business_gtm_growth'] },
  { coverage_key: 'converting',    label: 'Converting',    business_area: 'converting',    regions: ['business_gtm_growth'] },
  { coverage_key: 'building',      label: 'Building',      business_area: 'building',      regions: ['product_delivery', 'experience_design_brand'] },
  { coverage_key: 'sustaining',    label: 'Sustaining',    business_area: 'sustaining',    regions: ['business_gtm_growth'] },
  { coverage_key: 'learning',      label: 'Learning',      business_area: 'learning',      regions: ['strategy_outcomes', 'analytics_data', 'operations_quality'] },
  { coverage_key: 'operations',    label: 'Operations',    business_area: null,            regions: ['operations_quality'] },
] as const

/** O(1) lookup by `digest.coverage` key. */
export const UPG_AREA_TAXONOMY_BY_COVERAGE_KEY: Readonly<Record<string, UPGAreaTaxonomyEntry>> =
  Object.fromEntries(UPG_AREA_TAXONOMY.map((e) => [e.coverage_key, e]))

/** The cross-walk row for a `digest.coverage` key, or undefined. */
export function getAreaTaxonomyEntry(coverageKey: string): UPGAreaTaxonomyEntry | undefined {
  return UPG_AREA_TAXONOMY_BY_COVERAGE_KEY[coverageKey]
}

/** The `digest.coverage` keys whose entities live (partly) in a given region. */
export function getCoverageKeysForRegion(regionId: string): string[] {
  return UPG_AREA_TAXONOMY.filter((e) => e.regions.includes(regionId)).map((e) => e.coverage_key)
}

/** The "8 business area" ids that map to a given region (deduped). */
export function getBusinessAreasForRegion(regionId: string): string[] {
  const out: string[] = []
  for (const e of UPG_AREA_TAXONOMY) {
    if (e.regions.includes(regionId) && e.business_area && !out.includes(e.business_area)) {
      out.push(e.business_area)
    }
  }
  return out
}
