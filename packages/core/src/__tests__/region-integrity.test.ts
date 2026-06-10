/**
 * Region integrity gate (F1 · · pattern P-H).
 *
 * `regions/catalog.ts` rolls the 36 atomic domains (`registry/domains.ts`) up
 * into 10 super-domain regions. Before this gate the two drifted constantly:
 * whole domains were absent from `entities[]`, foreign types were filed under
 * the wrong region, and `getRegionForEntityType` *threw* (returned `undefined`)
 * for ~30+ types. The drift was invisible because nothing checked the
 * `composes_atomic_domains ⟷ entities[] ⟷ domain_id` triangle.
 *
 * This suite makes that triangle un-drift-able. It is the structural counterpart
 * to the README §"Validation (to add)" gates, and it would have caught every
 * P-H instance in the domain-wiring audit.
 *
 * Three documented, intentional escape hatches are encoded as explicit constants
 * (NUCLEUS_DOMAINS, SHARED_TYPES) so that an exemption is a deliberate, reviewed
 * choice rather than silent drift. Adding a type to either list is a visible
 * spec decision.
 */
import { describe, it, expect } from 'vitest'
import { UPG_REGIONS, getRegionForEntityType } from '../regions/catalog.js'
import { UPG_DOMAINS, getTypes, UPG_ENTITY_TO_DOMAIN } from '../registry/domains.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

// ── Documented exemptions ───────────────────────────────────────────────────

/**
 * The Nucleus domains (`portfolio`, `workspace`) sit at the centre of the ring
 * model and are deliberately NOT part of the 10 super-domain rollup — a region
 * is a *super-domain* of product work, and neither portfolio (multi-product
 * container) nor workspace (transient thinking surface) is one. Their types
 * therefore have no region home by design. Encoded here so the "every type is
 * in a region" gate can prove it is exhaustive over everything *except* the
 * Nucleus, and so that promoting the Nucleus into a region later is a single,
 * visible edit.
 *
 * OPEN DECISION (flag for Captain / parallel-Spock): whether the Nucleus should
 * eventually get its own region. Until then this exemption is the spec's
 * position of record.
 */
const NUCLEUS_DOMAINS = new Set(['portfolio', 'workspace'])

/**
 * Cross-region "shared citizens": a type whose canonical home is one region but
 * which legitimately appears in a second region because it anchors or seats a
 * structural role there. Each appearance in its non-home region carries a
 * `notes` marker on the membership. `home` is the region of the type's
 * `domain_id`; `sharedIn` are the additional regions it may appear in.
 *
 *  - metric:      home strategy_outcomes; anchors analytics_data (the graph's
 *                 measurement plane).
 *  - participant: home discovery_research_validation (user_research); appears in
 *                 users_needs as the research-resolved persona.
 *  - deployment:  home engineering_platform; surfaced in operations_quality as a
 *                 release event.
 */
const SHARED_TYPES: Record<string, { home: string; sharedIn: string[] }> = {
  metric: { home: 'strategy_outcomes', sharedIn: ['analytics_data'] },
  participant: { home: 'discovery_research_validation', sharedIn: ['users_needs'] },
  deployment: { home: 'engineering_platform', sharedIn: ['operations_quality'] },
}

// ── Derived lookups ─────────────────────────────────────────────────────────

const REGION_IDS = new Set(UPG_REGIONS.map((r) => r.id))
const EDGE_KEYS = new Set(Object.keys(UPG_EDGE_CATALOG))
const ACTIVE_TYPES = getTypes()

// domain_id -> region.id (each composed domain belongs to exactly one region)
const domainToRegion = new Map<string, string>()
for (const r of UPG_REGIONS) for (const d of r.composes_atomic_domains) domainToRegion.set(d, r.id)

// type -> [region ids it is listed in]
const typeToRegions = new Map<string, string[]>()
for (const r of UPG_REGIONS) {
  for (const e of r.entities) {
    const arr = typeToRegions.get(e.type) ?? []
    arr.push(r.id)
    typeToRegions.set(e.type, arr)
  }
}

describe('region integrity — domain composition (each of the 36 domains routed exactly once)', () => {
  it('every composed domain id is a real UPG domain', () => {
    const realDomains = new Set<string>(UPG_DOMAINS.map((d) => d.id))
    for (const r of UPG_REGIONS) {
      for (const d of r.composes_atomic_domains) {
        expect(realDomains.has(d), `region ${r.id} composes unknown domain "${d}"`).toBe(true)
      }
    }
  })

  it('every non-Nucleus domain is composed by exactly one region; Nucleus by none', () => {
    for (const d of UPG_DOMAINS) {
      const region = domainToRegion.get(d.id)
      if (NUCLEUS_DOMAINS.has(d.id)) {
        expect(region, `Nucleus domain "${d.id}" must NOT be composed by any region`).toBeUndefined()
      } else {
        expect(region, `domain "${d.id}" is composed by no region`).toBeTruthy()
      }
    }
  })

  it('no domain is composed by two regions', () => {
    const seen = new Map<string, string>()
    for (const r of UPG_REGIONS) {
      for (const d of r.composes_atomic_domains) {
        const prev = seen.get(d)
        expect(prev, `domain "${d}" composed by both ${prev} and ${r.id}`).toBeUndefined()
        seen.set(d, r.id)
      }
    }
  })
})

describe('region integrity — type membership (a) every active type resolves to a region', () => {
  it('every active type is listed in a region, or is an explicit Nucleus exemption', () => {
    const orphans: string[] = []
    for (const t of ACTIVE_TYPES) {
      const inRegion = (typeToRegions.get(t) ?? []).length > 0
      const domain = UPG_ENTITY_TO_DOMAIN[t as keyof typeof UPG_ENTITY_TO_DOMAIN]
      const exempt = domain ? NUCLEUS_DOMAINS.has(domain) : false
      if (!inRegion && !exempt) orphans.push(`${t} (domain=${domain})`)
    }
    expect(orphans, `active types in no region: ${orphans.join(', ')}`).toEqual([])
  })

  it('getRegionForEntityType resolves for every non-Nucleus active type', () => {
    const unresolved: string[] = []
    for (const t of ACTIVE_TYPES) {
      const domain = UPG_ENTITY_TO_DOMAIN[t as keyof typeof UPG_ENTITY_TO_DOMAIN]
      if (domain && NUCLEUS_DOMAINS.has(domain)) continue
      if (!getRegionForEntityType(t)) unresolved.push(t)
    }
    expect(unresolved, `getRegionForEntityType throws (undefined) for: ${unresolved.join(', ')}`).toEqual([])
  })

  it('a type appears in exactly one region unless it is a declared shared citizen', () => {
    for (const [t, regions] of typeToRegions) {
      if (regions.length === 1) continue
      const shared = SHARED_TYPES[t]
      expect(shared, `type "${t}" is in ${regions.length} regions (${regions.join(', ')}) but is not a declared SHARED_TYPE`).toBeTruthy()
      // its appearances must be exactly {home} ∪ sharedIn
      const allowed = new Set([shared!.home, ...shared!.sharedIn])
      for (const reg of regions) {
        expect(allowed.has(reg), `shared type "${t}" appears in unexpected region "${reg}"`).toBe(true)
      }
    }
  })
})

describe('region integrity — (b) no foreign types', () => {
  it('every entity in a region belongs to a composed domain, or is a declared shared citizen', () => {
    const foreign: string[] = []
    for (const r of UPG_REGIONS) {
      const composed = new Set(r.composes_atomic_domains)
      for (const e of r.entities) {
        const domain = UPG_ENTITY_TO_DOMAIN[e.type as keyof typeof UPG_ENTITY_TO_DOMAIN]
        if (!domain) {
          foreign.push(`${r.id}:${e.type} (not an active type)`)
          continue
        }
        if (composed.has(domain)) continue
        // allowed only if e.type is a declared shared citizen permitted in this region
        const shared = SHARED_TYPES[e.type]
        const permitted = shared && (shared.home === r.id || shared.sharedIn.includes(r.id))
        if (!permitted) foreign.push(`${r.id}:${e.type} (domain=${domain}, belongs in ${domainToRegion.get(domain)})`)
      }
    }
    expect(foreign, `foreign types in regions: ${foreign.join(', ')}`).toEqual([])
  })

  it('shared citizens carry a notes marker on every non-home appearance', () => {
    for (const [t, cfg] of Object.entries(SHARED_TYPES)) {
      for (const r of UPG_REGIONS) {
        if (r.id === cfg.home) continue
        if (!cfg.sharedIn.includes(r.id)) continue
        const membership = r.entities.find((e) => e.type === t)
        expect(membership, `shared type "${t}" missing from its declared region "${r.id}"`).toBeTruthy()
        expect(
          (membership as { notes?: string }).notes,
          `shared type "${t}" in non-home region "${r.id}" must carry a notes marker`,
        ).toBeTruthy()
      }
    }
  })
})

describe('region integrity — (c) every referenced edge id exists', () => {
  it('every intra_edge id is a key in UPG_EDGE_CATALOG', () => {
    const phantom: string[] = []
    for (const r of UPG_REGIONS) {
      for (const id of r.intra_edges) if (!EDGE_KEYS.has(id)) phantom.push(`${r.id}:${id}`)
    }
    expect(phantom, `phantom intra_edges: ${phantom.join(', ')}`).toEqual([])
  })

  it('every boundary_edge id is a key in UPG_EDGE_CATALOG', () => {
    const phantom: string[] = []
    for (const r of UPG_REGIONS) {
      for (const b of r.boundary_edges) if (!EDGE_KEYS.has(b.edge_id)) phantom.push(`${r.id}:${b.edge_id}`)
    }
    expect(phantom, `phantom boundary_edges: ${phantom.join(', ')}`).toEqual([])
  })

  it('every boundary_edge crosses_into a real region id', () => {
    for (const r of UPG_REGIONS) {
      for (const b of r.boundary_edges) {
        expect(REGION_IDS.has(b.crosses_into), `${r.id}: boundary edge ${b.edge_id} crosses into unknown region "${b.crosses_into}"`).toBe(true)
      }
    }
  })
})

describe('region integrity — structural invariants (anchor, roles)', () => {
  it('every region anchor.type appears in entities[] with role "anchor"', () => {
    for (const r of UPG_REGIONS) {
      const anchorMembership = r.entities.find((e) => e.type === r.anchor.type)
      expect(anchorMembership, `region ${r.id} anchor "${r.anchor.type}" not in entities[]`).toBeTruthy()
      expect(anchorMembership!.role, `region ${r.id} anchor "${r.anchor.type}" role`).toBe('anchor')
    }
  })

  it('exactly one entity per region carries role "anchor"', () => {
    for (const r of UPG_REGIONS) {
      const anchors = r.entities.filter((e) => e.role === 'anchor')
      expect(anchors.length, `region ${r.id} has ${anchors.length} anchors (expected 1)`).toBe(1)
    }
  })

  it('no entity type is listed twice within a single region', () => {
    for (const r of UPG_REGIONS) {
      const seen = new Set<string>()
      for (const e of r.entities) {
        expect(seen.has(e.type), `region ${r.id} lists "${e.type}" twice`).toBe(false)
        seen.add(e.type)
      }
    }
  })
})

describe('region integrity — coverage proof (README gate #7)', () => {
  it('the 10 regions cover every active type except the Nucleus (exhaustive)', () => {
    const covered = new Set(typeToRegions.keys())
    const nucleusTypes = new Set(
      UPG_DOMAINS.filter((d) => NUCLEUS_DOMAINS.has(d.id)).flatMap((d) => d.types as readonly string[]),
    )
    const expected = ACTIVE_TYPES.filter((t) => !nucleusTypes.has(t))
    for (const t of expected) {
      expect(covered.has(t), `active type "${t}" is not covered by any region`).toBe(true)
    }
    // and the Nucleus types are genuinely absent (proves the exemption is real)
    for (const t of nucleusTypes) {
      expect(covered.has(t), `Nucleus type "${t}" should not be in any region`).toBe(false)
    }
  })
})
