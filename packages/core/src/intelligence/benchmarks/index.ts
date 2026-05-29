/**
 * benchmarks/ Product management wisdom as structured data.
 *
 * Encodes expected entity counts, relationships, ratios, and domain activation
 * thresholds per product stage. All 9 stages populated.
 */

export * from './types.js'
export { UPG_COUNT_BENCHMARKS } from './count-benchmarks.js'
export { UPG_RELATIONSHIP_BENCHMARKS } from './relationship-benchmarks.js'
export { UPG_RATIO_BENCHMARKS } from './ratio-benchmarks.js'
export { UPG_DOMAIN_ACTIVATION } from './domain-activations.js'

import type { CountBenchmark, StageRange, UPGProductStage } from './types.js'
import type { UPGEntityType } from '../../catalog/entity-catalog.js'
import type { UPGDomainId } from '../../registry/domains.js'
import { UPG_COUNT_BENCHMARKS } from './count-benchmarks.js'

/**
 * Look up the expected range for a type at a given stage.
 *
 * Returns `null` when the type is unknown OR when the type exists but is not
 * expected at that stage (e.g. `sales` activity at `concept`).
 *
 * @example
 * getBenchmark('product', 'concept')   // → { min: 1, max: 1 }
 * getBenchmark('persona', 'build')     // → { min: 2, max: 5 }  (example range)
 * getBenchmark('not_a_type', 'growth') // → null
 */
export function getBenchmark(entityType: UPGEntityType | string, stage: UPGProductStage): StageRange {
  const bm = UPG_COUNT_BENCHMARKS.find((b) => b.type === entityType)
  if (!bm) return null
  return bm[stage]
}

/**
 * Get all benchmarks for a given domain.
 *
 * @example
 * const userBenchmarks = getBenchmarksByDomain('user')
 * // userBenchmarks.map(b => b.type)
 * //   → ['persona', 'job', 'need', 'desired_outcome', ...]
 */
export function getBenchmarksByDomain(domain: UPGDomainId | string): CountBenchmark[] {
  return UPG_COUNT_BENCHMARKS.filter((b) => b.domain === domain)
}
