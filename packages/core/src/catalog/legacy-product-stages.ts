/**
 * Legacy product-stage aliases.
 *
 * Existing graphs (`entopo.upg`, `sanity.upg`, `maximum-minimum.upg`,
 * `notion-saturated.upg`, etc.) carry `product.stage` values that pre-date
 * the canonical `UPGProductStage` enum
 * (`concept | validation | build | beta | launch | growth | mature |
 * maintenance | sunset`). The `create_product` write path rejects these as
 * legacy; this module surfaces the migration as a pure, reusable helper so
 * loaders can canonicalise them at the read boundary.
 *
 * The richer `coerceProductStage` lives in `intelligence/product-stage-coercion.ts`
 * and returns a structured `{ canonical, wasCoerced, wasUnknown }` shape for
 * load-time warnings. `migrateProductStage` is the simpler shape: take a
 * stage string, return its canonical form (or the input verbatim if it is
 * already canonical and not a known legacy alias).
 *
 * Mapping rationale:
 * - `idea → concept`: pre-canonical alias from early v0.1 product nodes;
 *   matches the v0.2.13 `properties.stage` migration `value_map` and the
 *   `UPG_PRODUCT_STAGE_COERCION_MAP` documented mapping.
 *
 * Future legacy aliases (`mvp → build`, `production → launch`, etc.) should
 * be added here as authoritative one-to-one mappings. Anything fuzzier (case
 * normalisation, multi-source coercion targets) belongs in the
 * `coerceProductStage` helper.
 *
 * @module catalog/legacy-product-stages
 */

import type { UPGProductStage } from '../shapes/document.js'

/**
 * Authoritative legacy → canonical `UPGProductStage` map. Append-only;
 * removing an entry breaks read-side compatibility with existing graphs.
 *
 * Keys are lower-case legacy values; canonical values are the current
 * `UPGProductStage` literals.
 */
export const LEGACY_PRODUCT_STAGES: Readonly<Record<string, UPGProductStage>> =
  Object.freeze({
    idea: 'concept',
  })

/**
 * Canonicalise a stage value via `LEGACY_PRODUCT_STAGES`.
 *
 * - Returns the canonical stage when `stage` is a known legacy alias.
 * - Returns `stage` verbatim when it is not a known legacy alias (the input
 *   may itself already be canonical, or genuinely unknown. The strict
 *   write path is responsible for rejecting genuinely-unknown values).
 * - Returns `undefined` for `undefined` / `null` inputs.
 *
 * Lookups are case-insensitive on the input.
 *
 * @example
 * migrateProductStage('idea')      // → 'concept'
 * migrateProductStage('IDEA')      // → 'concept'
 * migrateProductStage('concept')   // → 'concept'  (already canonical, passthrough)
 * migrateProductStage('launch')    // → 'launch'   (already canonical, passthrough)
 * migrateProductStage('xyz')       // → 'xyz'      (unknown, passthrough; callers decide)
 * migrateProductStage(undefined)   // → undefined
 */
export function migrateProductStage<T extends string | undefined | null>(
  stage: T,
): T extends string ? UPGProductStage | string : undefined {
  if (stage === undefined || stage === null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any
  }
  if (typeof stage !== 'string') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stage as any
  }
  const lower = stage.toLowerCase()
  const mapped = LEGACY_PRODUCT_STAGES[lower]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (mapped ?? stage) as any
}

/**
 * True when `stage` is a known legacy alias (would migrate to a different
 * canonical value). Useful for loaders that want to warn-and-rewrite on
 * legacy data.
 *
 * @example
 * isLegacyProductStage('idea')     // → true
 * isLegacyProductStage('concept')  // → false
 */
export function isLegacyProductStage(stage: unknown): stage is string {
  return typeof stage === 'string' && stage.toLowerCase() in LEGACY_PRODUCT_STAGES
}
