/**
 * UPG Domain Rings: 7 concentric groupings of the 36 UPG domains.
 *
 * Defines the ring assignment for every domain and the canonical ring metadata.
 *
 * The rings radiate outward from the product nucleus:
 *   Nucleus → Understand → Define → Build → Grow → Operate → Extend
 *
 * This is the single source of truth for the OUTWARD ORDER and grouping of the
 * domains across every UPG surface (e.g. the /docs domain grid). The flattened
 * ring order — `ringOrderedDomainIds()` — replaces any hand-maintained domain
 * sequence. A module-init invariant asserts ring membership exactly covers the
 * canonical `UPG_DOMAINS` set, so a missing or extra domain fails loudly here
 * rather than silently dropping out of a downstream grid.
 */

import { UPG_DOMAINS } from '../registry/domains.js'

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
    // `business_model` lives in the `define` ring (foundational "what are we
    // building & how it sustains"), not in `grow`. This is an intentional
    // ring-vs-region divergence: UPG_REGIONS still groups business_model under
    // `business_gtm_growth` (region membership is a separately-tracked decision).
    domain_ids: ['strategy', 'product_spec', 'business_model', 'ux_design', 'design_system', 'brand', 'legal'],
  },
  {
    id: 'build',
    label: 'Build',
    description: 'How do we construct it?',
    domain_ids: ['engineering', 'foundations', 'ai', 'automation', 'data_analytics', 'testing', 'devops', 'security', 'accessibility'],
  },
  {
    id: 'grow',
    label: 'Grow',
    description: 'How do we make money?',
    domain_ids: ['pricing', 'go_to_market', 'sales', 'marketing', 'growth'],
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
    domain_ids: ['team_org', 'program_mgmt', 'ecosystem', 'localisation', 'compliance'],
  },
]

// ─── Ring ↔ domain coverage invariant ─────────────────────────────────────────
//
// The rings are the single source of truth for domain order and grouping. That
// only holds if every canonical domain appears in exactly one ring, and no ring
// names a domain that does not exist. We assert it at module init so a drift —
// a domain added to the registry but not slotted into a ring, a typo'd id, or a
// duplicate — fails loudly the moment core is imported, instead of silently
// dropping a domain from (or duplicating one in) every downstream grid.
function assertRingsPartitionDomains(): void {
  const ringDomainIds: string[] = UPG_DOMAIN_RINGS.flatMap((r) => [...r.domain_ids])
  const canonical = new Set<string>(UPG_DOMAINS.map((d) => d.id))
  const ringSet = new Set<string>(ringDomainIds)

  const duplicates = ringDomainIds.filter((id, i) => ringDomainIds.indexOf(id) !== i)
  const unknown = [...ringSet].filter((id) => !canonical.has(id))
  const unassigned = [...canonical].filter((id) => !ringSet.has(id))

  if (duplicates.length || unknown.length || unassigned.length) {
    const parts: string[] = []
    if (unassigned.length) parts.push(`domains in no ring: [${unassigned.join(', ')}]`)
    if (unknown.length) parts.push(`ring domains not in UPG_DOMAINS: [${unknown.join(', ')}]`)
    if (duplicates.length) parts.push(`domains in multiple rings: [${[...new Set(duplicates)].join(', ')}]`)
    throw new Error(
      `UPG_DOMAIN_RINGS must partition UPG_DOMAINS exactly: ${parts.join('; ')}. ` +
        `Slot every domain into exactly one ring in domain-rings.ts.`,
    )
  }
}

assertRingsPartitionDomains()

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

/**
 * Every domain id in canonical ring order (nucleus outward, then within-ring
 * order). The single source of truth for the OUTWARD ORDER of the domains —
 * use this instead of a hand-maintained sequence. The coverage invariant above
 * guarantees this is a permutation of `UPG_DOMAINS` with no gaps or duplicates.
 *
 * @example
 * ringOrderedDomainIds().slice(0, 3)   // → ['portfolio', 'workspace', 'user']
 */
export function ringOrderedDomainIds(): string[] {
  return UPG_DOMAIN_RINGS.flatMap((ring) => [...ring.domain_ids])
}
