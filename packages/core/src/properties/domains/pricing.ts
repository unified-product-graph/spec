/**
 * UPG Property Schemas: Pricing & Packaging Domain.
 * PricingStrategy, DiscountStrategy, TrialConfig, Paywall.
 *
 * Note: `package` was consolidated into `pricing_tier` in v0.2.0 and moved to
 * `DeprecatedUPGEntityType` for string-level migration support (`migrations.ts`).
 * Use `PricingTierProperties` for the canonical shape.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { Cadence } from '../primitives.js'

// ---------------------------------------------------------------------------
// PRICING & PACKAGING
// ---------------------------------------------------------------------------

/** Pricing strategy.
 *
 * @example
 * const properties: PricingStrategyProperties = {
 *   strategy_type: 'value_based',
 *   review_cadence: 'quarterly',
 *   last_change: '2026-02-15',
 * }
 */
export interface PricingStrategyProperties {
  /** Pricing methodology used */
  strategy_type?: 'value_based' | 'cost_plus' | 'competitor_based' | 'penetration' | 'freemium'
  /** How often pricing is reviewed. Uses the shared `Cadence` scale. */
  review_cadence?: Cadence
  /** Date of the last pricing change (ISO format) */
  last_change?: string
}

/** Discount strategy.
 *
 * @example
 * const properties: DiscountStrategyProperties = {
 *   discount_type: 'percentage',
 *   discount_percentage: 25,
 *   valid_until: '2026-12-31',
 * }
 */
export interface DiscountStrategyProperties {
  /** How the discount is applied */
  discount_type?: 'percentage' | 'fixed' | 'tiered' | 'bundle'
  /** Discount amount as a percentage (0-100) */
  discount_percentage?: number
  /** Expiration date of the discount (ISO format) */
  valid_until?: string
  /** Number of times this discount has been redeemed */
  redemption_count?: number
}

/** Trial configuration.
 *
 * @example
 * const properties: TrialConfigProperties = {
 *   trial_type: 'time_limited',
 *   duration_days: 14,
 *   conversion_rate: 0.08,
 * }
 */
export interface TrialConfigProperties {
  /** How the trial is limited */
  trial_type?: 'time_limited' | 'feature_limited' | 'usage_limited' | 'reverse'
  /** Length of the trial period in days */
  duration_days?: number
  /** Percentage of trial users who convert to paid */
  conversion_rate?: number
}

/** Paywall.
 *
 * @example
 * const properties: PaywallProperties = {
 *   paywall_type: 'hard',
 *   trigger: 'User opens the third restricted feature in a session.',
 *   conversion_rate: 0.08,
 * }
 */
export interface PaywallProperties {
  /** How restrictive the paywall is */
  paywall_type?: 'hard' | 'soft' | 'metered' | 'freemium_gate'
  /** User action or threshold that triggers the paywall */
  trigger?: string
  /** Percentage of users who convert at this paywall */
  conversion_rate?: number
}
