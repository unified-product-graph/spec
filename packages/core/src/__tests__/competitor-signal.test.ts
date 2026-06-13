/**
 * competitor_signal entity type + edges (spec issue #41, UPG 0.10.0).
 *
 * An append-only dated competitor move (feature launch / pricing change /
 * acquisition / partnership / market entry) emitted by a competitor and mapped
 * onto our portfolio. Lives in a watched competitor-intelligence graph; its
 * maps_to_feature / surfaces_opportunity edges cross into our product graph.
 */
import { describe, it, expect } from 'vitest'
import {
  UPG_ENTITY_META,
  resolveContainmentEdge,
  getRegionForEntityType,
  UPG_CROSS_EDGE_TYPES,
  UPG_LIFECYCLE_FREE_TYPES,
  UPG_PROPERTY_SCHEMA,
} from '../index.js'

describe('competitor_signal entity (#41)', () => {
  it('is a registered active entity type', () => {
    const m = UPG_ENTITY_META.find((e) => e.name === 'competitor_signal')
    expect(m).toBeDefined()
    expect(m?.maturity).not.toBe('removed')
  })

  it('all three signal edges resolve via resolve_edge_for_pair', () => {
    expect(resolveContainmentEdge('competitor', 'competitor_signal')).toBe('competitor_emits_competitor_signal')
    expect(resolveContainmentEdge('competitor_signal', 'feature')).toBe('competitor_signal_maps_to_feature')
    expect(resolveContainmentEdge('competitor_signal', 'opportunity')).toBe('competitor_signal_surfaces_opportunity')
  })

  it('signal->feature and signal->opportunity are dual-registered cross-edges', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('competitor_signal_maps_to_feature')
    expect(UPG_CROSS_EDGE_TYPES).toContain('competitor_signal_surfaces_opportunity')
  })

  it('lives in market_competitive and is lifecycle-free (append-only)', () => {
    expect(getRegionForEntityType('competitor_signal')?.id).toBe('market_competitive')
    expect(UPG_LIFECYCLE_FREE_TYPES.has('competitor_signal')).toBe(true)
  })

  it('carries the provenance mixin and a typed signal_type enum', () => {
    expect(UPG_PROPERTY_SCHEMA.competitor_signal?.confidence?.scale_id).toBe('confidence_5')
    expect(UPG_PROPERTY_SCHEMA.competitor_signal?.signal_type?.enum).toContain('feature_launch')
  })
})
