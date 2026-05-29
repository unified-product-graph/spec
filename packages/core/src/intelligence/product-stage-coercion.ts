/**
 * `UPGProductStage` validation and soft-coercion.
 *
 * Strategy: soft-coerce on read, strict on write. Existing `.upg` files
 * carrying legacy stage values (`idea`, `discovery`, `mvp`) load with an
 * in-memory coercion to the nearest canonical equivalent and a deprecation
 * warning. New writes via `create_product` and `update_node` reject
 * non-canonical values.
 *
 * @module intelligence/product-stage-coercion
 */

import type { UPGProductStage } from '../shapes/document.js'
import { UPG_PRODUCT_STAGES } from './benchmarks/types.js'

/**
 * Documented mapping from known-bad legacy stage values to the closest
 * canonical UPGProductStage. Keys are lowercased. Matching is
 * case-insensitive at the call boundary.
 *
 * Mapping rationale:
 * - `idea` → `concept`: pre-canonical alias from early v0.1 product nodes.
 *   Matches the v0.2.13 `properties.stage` migration value_map.
 * - `discovery` → `validation`: "discovery" was used pre-v0.2 to mean the
 *   pre-build research / customer-discovery phase. UPGProductStage does not
 *   have a separate "discovery" phase. The closest canonical equivalent is
 *   `validation` (testing demand, talking to users: the discovery activity).
 * - `mvp` → `build`: minimum viable product, actively building v1.
 * - `production` → `launch`: generally available shipped product.
 * - `draft` → `concept`: mirrors the v0.2.13 `lifecycle_status` migration.
 * - `active` → `launch`: mirrors the v0.2.13 `lifecycle_status` migration.
 * - `archived`, `retired`, `deprecated` → `sunset`: winding down or done.
 */
export const UPG_PRODUCT_STAGE_COERCION_MAP: Readonly<Record<string, UPGProductStage>> = Object.freeze({
  idea: 'concept',
  discovery: 'validation',
  mvp: 'build',
  production: 'launch',
  draft: 'concept',
  active: 'launch',
  archived: 'sunset',
  retired: 'sunset',
  deprecated: 'sunset',
  // Pass-through duplicates for safety, keeps the matcher table unsurprising
  // when a caller passes the canonical value but expects coercion to confirm.
  // We intentionally do NOT list every canonical value here; the canonical
  // check happens before the coercion lookup.
})

const UPG_PRODUCT_STAGES_SET: ReadonlySet<UPGProductStage> = new Set(UPG_PRODUCT_STAGES)

/**
 * True when `value` is a canonical UPGProductStage.
 *
 * Use this as the strict guard on the write path. Readers should prefer
 * `coerceProductStage` so legacy values still resolve.
 */
export function isCanonicalProductStage(value: unknown): value is UPGProductStage {
  return typeof value === 'string' && UPG_PRODUCT_STAGES_SET.has(value as UPGProductStage)
}

/**
 * Result of a soft-coercion attempt on a product `stage` value.
 *
 * - `canonical`: the canonical UPGProductStage to use, or `undefined` when
 *   the input was unrecognised (no entry in the coercion map AND not already
 *   canonical). Callers can choose to fall back to a default (typically
 *   `'concept'`) or surface the unknown value.
 * - `originalValue`: the raw input, for warning messages and audit trails.
 * - `wasCoerced`: `true` if the input was a known legacy value that was
 *   mapped to a canonical equivalent. `false` if the input was already
 *   canonical or unrecognised.
 * - `wasUnknown`: `true` if the input was non-canonical AND not in the
 *   coercion map. Callers should fall back to a default and log loudly.
 */
export interface ProductStageCoercion {
  canonical: UPGProductStage | undefined
  originalValue: unknown
  wasCoerced: boolean
  wasUnknown: boolean
}

/**
 * Soft-coerce a stage value to canonical UPGProductStage, falling back to
 * the documented mapping for known legacy values. Used at `.upg` load time
 * so existing graphs keep working.
 *
 * @example
 * coerceProductStage('idea')
 * // → { canonical: 'concept', originalValue: 'idea', wasCoerced: true, wasUnknown: false }
 *
 * @example
 * coerceProductStage('concept')
 * // → { canonical: 'concept', originalValue: 'concept', wasCoerced: false, wasUnknown: false }
 *
 * @example
 * coerceProductStage('xyz')
 * // → { canonical: undefined, originalValue: 'xyz', wasCoerced: false, wasUnknown: true }
 */
export function coerceProductStage(value: unknown): ProductStageCoercion {
  if (value === undefined || value === null) {
    return { canonical: undefined, originalValue: value, wasCoerced: false, wasUnknown: false }
  }
  if (typeof value !== 'string') {
    return { canonical: undefined, originalValue: value, wasCoerced: false, wasUnknown: true }
  }
  // Already canonical: pass through.
  if (UPG_PRODUCT_STAGES_SET.has(value as UPGProductStage)) {
    return { canonical: value as UPGProductStage, originalValue: value, wasCoerced: false, wasUnknown: false }
  }
  // Known legacy alias: coerce.
  const lower = value.toLowerCase()
  const mapped = UPG_PRODUCT_STAGE_COERCION_MAP[lower]
  if (mapped) {
    return { canonical: mapped, originalValue: value, wasCoerced: true, wasUnknown: false }
  }
  // Truly unknown: caller decides what to do.
  return { canonical: undefined, originalValue: value, wasCoerced: false, wasUnknown: true }
}

/**
 * Strict validator for the write path. Returns `null` when `value` is a
 * canonical UPGProductStage, otherwise a structured error message
 * including the canonical set and any documented coercion target.
 *
 * Intended for `create_product` and `update_node({ type: 'product', ... })`.
 * Callers should reject the operation when this returns non-null.
 *
 * @example
 * validateProductStageStrict('idea')
 * // → "Invalid product stage: \"idea\". Canonical UPGProductStage values: ..."
 */
export function validateProductStageStrict(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (isCanonicalProductStage(value)) return null

  const coerced = coerceProductStage(value)
  const canonicalList = UPG_PRODUCT_STAGES.join(' | ')

  if (coerced.wasCoerced && coerced.canonical) {
    return (
      `Invalid product stage: ${JSON.stringify(value)}. ` +
      `This looks like a legacy value. Pass ${JSON.stringify(coerced.canonical)} instead. ` +
      `Canonical UPGProductStage values: ${canonicalList}.`
    )
  }

  return (
    `Invalid product stage: ${JSON.stringify(value)}. ` +
    `Expected one of: ${canonicalList}.`
  )
}
