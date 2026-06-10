/**
 * UPG Property Schemas: Partners & Ecosystem Domain.
 * PartnerProgram, PartnerTier, ApiEcosystem, MarketplaceListing,
 * DeveloperPortal, IntegrationPartner, PartnerRevenueShare.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ---------------------------------------------------------------------------
// PARTNERS & ECOSYSTEM
// ---------------------------------------------------------------------------

/** Partner program.
 *
 * @example
 * const properties: PartnerProgramProperties = {
 *   program_type: 'referral',
 * }
 */
export interface PartnerProgramProperties {
  /** Category of the partner program */
  program_type?: 'referral' | 'reseller' | 'technology' | 'consulting' | 'marketplace'
  /** Operational status of the program */
  /** Number of partners enrolled */
}

/** Partner tier.
 *
 * @example
 * const properties: PartnerTierProperties = {
 *   tier_level: 42,
 *   requirements: ['Encrypt at rest', 'Audit every access'],
 *   benefits: ['Single source of truth', 'Lower onboarding cost'],
 * }
 */
export interface PartnerTierProperties {
  /**
   * Display order of this tier among sibling partner tiers (1 = first tier
   * shown). Mirrors `pricing_tier.tier_order`; part of the spec-wide `*_order`
   * sequence convention ( /). Distinct from `tier_level`, which
   * is a prestige rank, not a presentation order.
   */
  tier_order?: number
  /** Numeric rank of the tier (higher = more prestigious) */
  tier_level?: number
  /** What a partner must achieve to reach this tier */
  requirements?: string[]
  /** Benefits granted at this tier level */
  benefits?: string[]
}

/** API ecosystem.
 *
 * @example
 * const properties: ApiEcosystemProperties = {
 *   api_style: 'rest',
 *   developer_count: 42,
 *   app_count: 42,
 * }
 */
export interface ApiEcosystemProperties {
  /** Primary API architecture style */
  api_style?: 'rest' | 'graphql' | 'grpc' | 'webhook' | 'mixed'
  /** Number of registered developers */
  developer_count?: number
  /** Number of apps built on the API */
  app_count?: number
  /** Maturity stage of the API ecosystem */
}

/** Marketplace listing.
 *
 * @example
 * const properties: MarketplaceListingProperties = {
 *   listing_type: 'app',
 *   installs: 42,
 *   rating: 42,
 * }
 */
export interface MarketplaceListingProperties {
  /** Category of the marketplace listing */
  listing_type?: 'app' | 'integration' | 'template' | 'plugin'
  /** Number of installations */
  installs?: number
  /** Average user rating (e.g. 1-5 stars) */
  rating?: number
  /** Publication status of the listing */
}

/** Developer portal.
 *
 * @example
 * const properties: DeveloperPortalProperties = {
 *   portal_url: 'https://partners.entopo.app',
 *   doc_count: 42,
 *   sandbox_available: true,
 * }
 */
export interface DeveloperPortalProperties {
  /** URL of the developer portal */
  portal_url?: string
  /** Number of documentation pages */
  doc_count?: number
  /** Whether a sandbox environment is available */
  sandbox_available?: boolean
}

/** Integration partner.
 *
 * @example
 * const properties: IntegrationPartnerProperties = {
 *   integration_type: 'native',
 * }
 */
export interface IntegrationPartnerProperties {
  /** Name of the integration partner */
  /** How the integration is implemented */
  integration_type?: 'native' | 'webhook' | 'api' | 'embedded'
  /** Current status of the integration partnership */
}

/** Partner revenue share.
 *
 * @example
 * const properties: PartnerRevenueShareProperties = {
 *   share_model: 'percentage',
 *   share_percentage: 42,
 *   annual_revenue: 42,
 * }
 */
export interface PartnerRevenueShareProperties {
  /** How revenue is split with the partner */
  share_model?: 'percentage' | 'flat_fee' | 'tiered' | 'hybrid'
  /** Partner's share as a percentage (0-100) */
  share_percentage?: number
  /** Annual revenue generated through this partner */
  annual_revenue?: number
}
