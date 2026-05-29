/**
 * UPG Domain Rings: 7 concentric groupings of the 36 UPG domains.
 *
 * Defines the ring assignment for every domain and the canonical ring metadata.
 *
 * The rings radiate outward from the product nucleus:
 *   Nucleus → Understand → Define → Build → Grow → Operate → Extend
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UPGDomainRing {
  /** Machine-readable ring identifier */
  id: string
  /** Human-readable label */
  label: string
  /** The question this ring answers */
  description: string
  /** Domain IDs that belong to this ring */
  domain_ids: readonly string[]
}

// ─── Data ───────────────────────────────────────────────────────────────────

export const UPG_DOMAIN_RINGS: readonly UPGDomainRing[] = [
  {
    id: 'nucleus',
    label: 'Product',
    description: 'The seed',
    domain_ids: ['portfolio', 'workspace'],
  },
  {
    id: 'understand',
    label: 'Understand',
    description: 'Who are we building for?',
    domain_ids: ['user', 'user_research', 'market_intelligence', 'discovery', 'validation', 'feedback'],
  },
  {
    id: 'define',
    label: 'Define',
    description: 'What are we building?',
    domain_ids: ['strategy', 'product_spec', 'legal', 'ux_design', 'design_system', 'brand'],
  },
  {
    id: 'build',
    label: 'Build',
    description: 'How do we construct it?',
    domain_ids: ['engineering', 'devops', 'testing', 'security', 'accessibility', 'data_analytics', 'ai', 'automation'],
  },
  {
    id: 'grow',
    label: 'Grow',
    description: 'How do we make money?',
    domain_ids: ['business_model', 'growth', 'go_to_market', 'pricing', 'sales', 'marketing'],
  },
  {
    id: 'operate',
    label: 'Operate',
    description: 'How do we serve?',
    domain_ids: ['customer_success', 'content', 'education'],
  },
  {
    id: 'extend',
    label: 'Extend',
    description: 'How do we scale?',
    domain_ids: ['team_org', 'program_mgmt', 'localisation', 'ecosystem', 'compliance'],
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Look up which ring a domain belongs to.
 *
 * @example
 * const ring = getRingForDomain('user')
 * // ring?.id    === 'understand'
 * // ring?.label === 'Understand'
 *
 * @example
 * getRingForDomain('engineering')?.id   // → 'build'
 * getRingForDomain('not_a_domain')      // → undefined
 */
export function getRingForDomain(domainId: string): UPGDomainRing | undefined {
  return UPG_DOMAIN_RINGS.find((ring) => ring.domain_ids.includes(domainId))
}

/**
 * Get all domain IDs in a given ring.
 *
 * @example
 * getDomainsInRing('understand')
 * // → ['user', 'user_research', 'market_intelligence', 'discovery', 'validation', 'feedback']
 *
 * @example
 * getDomainsInRing('not_a_ring')   // → []
 */
export function getDomainsInRing(ringId: string): string[] {
  const ring = UPG_DOMAIN_RINGS.find((r) => r.id === ringId)
  return ring ? [...ring.domain_ids] : []
}
