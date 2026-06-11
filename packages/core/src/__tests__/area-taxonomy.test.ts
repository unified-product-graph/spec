/**
 * Area-taxonomy cross-walk integrity (0.9.16, A4). Pins the static structure of
 * UPG_AREA_TAXONOMY against this package's region catalogue. The coverage-key /
 * business-area key sets are pinned against their SDK sources by a companion
 * drift test in the SDK (core cannot import the SDK).
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_AREA_TAXONOMY,
  UPG_AREA_TAXONOMY_BY_COVERAGE_KEY,
  getAreaTaxonomyEntry,
  getCoverageKeysForRegion,
  getBusinessAreasForRegion,
  UPG_REGIONS,
} from '../index.js'

const REGION_IDS = new Set(UPG_REGIONS.map((r) => r.id))

describe('UPG_AREA_TAXONOMY', () => {
  it('covers the 10 digest.coverage keys with unique entries', () => {
    expect(UPG_AREA_TAXONOMY).toHaveLength(10)
    const keys = UPG_AREA_TAXONOMY.map((e) => e.coverage_key)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toEqual([
      'identity', 'understanding', 'discovery', 'validation', 'reaching',
      'converting', 'building', 'sustaining', 'learning', 'operations',
    ])
  })

  it('maps every entry to at least one real region', () => {
    for (const e of UPG_AREA_TAXONOMY) {
      expect(e.regions.length, `${e.coverage_key} has no regions`).toBeGreaterThan(0)
      for (const r of e.regions) {
        expect(REGION_IDS.has(r), `${e.coverage_key} -> unknown region ${r}`).toBe(true)
      }
      // No duplicate region ids within an entry.
      expect(new Set(e.regions).size).toBe(e.regions.length)
    }
  })

  it('only validation and operations lack a business_area', () => {
    const nullBusinessArea = UPG_AREA_TAXONOMY.filter((e) => e.business_area === null).map((e) => e.coverage_key)
    expect(nullBusinessArea.sort()).toEqual(['operations', 'validation'])
  })

  it('the by-key index and getter agree with the array', () => {
    for (const e of UPG_AREA_TAXONOMY) {
      expect(UPG_AREA_TAXONOMY_BY_COVERAGE_KEY[e.coverage_key]).toBe(e)
      expect(getAreaTaxonomyEntry(e.coverage_key)).toBe(e)
    }
    expect(getAreaTaxonomyEntry('not-a-key')).toBeUndefined()
  })

  it('reverse lookups resolve region -> coverage keys / business areas', () => {
    // discovery_research_validation hosts understanding, discovery, validation.
    expect(getCoverageKeysForRegion('discovery_research_validation').sort()).toEqual(
      ['discovery', 'understanding', 'validation'],
    )
    // business areas for that region exclude the null-mapped validation.
    expect(getBusinessAreasForRegion('discovery_research_validation').sort()).toEqual(
      ['discovery', 'understanding'],
    )
    // A region no coverage key maps to returns empty (engineering_platform, foundations).
    expect(getCoverageKeysForRegion('engineering_platform')).toEqual([])
    expect(getCoverageKeysForRegion('foundations')).toEqual([])
  })
})
