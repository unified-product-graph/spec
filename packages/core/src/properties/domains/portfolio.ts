/**
 * UPG Property Schemas: Portfolio Domain
 *
 * Organization, Portfolio, and ProductArea entity properties.
 *
 * Part of the Unified Product Graph specification.
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */

import type { Priority } from '../primitives.js'

// ---------------------------------------------------------------------------
// PORTFOLIO LAYER
// ---------------------------------------------------------------------------

/** Organization entity.
 *
 * @example
 * const properties: OrganizationProperties = {
 *   logo_url: 'https://arkheiev.com/logo.svg',
 *   billing_plan: 'business-annual',
 *   industry: 'Developer Tools',
 * }
 */
export interface OrganizationProperties {
  /** URL of the organisation's logo */
  logo_url?: string
  /** Current billing / subscription plan */
  billing_plan?: string
  /** Industry vertical the organisation operates in */
  industry?: string
}

/** Portfolio entity.
 *
 * @example
 * const properties: PortfolioProperties = {
 *   hierarchy_model: 'nested',
 *   strategy_type: 'horizon-2-bets',
 *   explore_exploit_target: { explore: 30, exploit: 70 },
 * }
 */
export interface PortfolioProperties {
  /** How products are structured within the portfolio */
  hierarchy_model?: 'flat' | 'nested' | 'matrix'
  /** High-level strategy archetype */
  strategy_type?: string
  /**
   * Explore vs exploit investment target (percentages, should sum to 100).
   * @example { explore: 30, exploit: 70 }
   */
  explore_exploit_target?: { explore: number; exploit: number }
}

/** ProductArea entity.
 *
 * @example
 * const properties: ProductAreaProperties = {
 *   strategic_priority: 'high',
 *   description: 'Shared platform services consumed by every customer-facing product.',
 * }
 */
export interface ProductAreaProperties {
  /** Number of products within this area */
  /** Strategic priority assigned to this area */
  strategic_priority?: Priority
  /** Narrative description of what this area covers */
  description?: string
  /** Person or team that owns this area */
  owner?: string
}
