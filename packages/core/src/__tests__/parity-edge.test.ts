/**
 * Parity edge `feature_rivals_competitor_feature` (spec issue #38, UPG 0.10.0).
 *
 * Turns competitive parity from a free-text node property into a traversable,
 * metadata-carrying relationship. Dual-registered: a catalog edge (so
 * resolve_edge_for_pair resolves it and within-graph is the degenerate case)
 * AND a cross-edge (so it spans our product graph and a separate watched
 * competitor-intelligence graph).
 */
import { describe, it, expect } from 'vitest'
import {
  resolveContainmentEdge,
  edgeCarriesProperties,
  UPG_CROSS_EDGE_TYPES,
  UPG_EDGE_CATALOG,
} from '../index.js'

describe('parity edge feature_rivals_competitor_feature (#38)', () => {
  it('resolve_edge_for_pair(feature -> competitor_feature) resolves (was null pre-0.10.0)', () => {
    expect(resolveContainmentEdge('feature', 'competitor_feature')).toBe('feature_rivals_competitor_feature')
  })

  it('carries the parity assessment as edge metadata', () => {
    expect(edgeCarriesProperties('feature_rivals_competitor_feature')).toBe(true)
  })

  it('is dual-registered as a cross-edge for the cross-product case', () => {
    expect(UPG_CROSS_EDGE_TYPES).toContain('feature_rivals_competitor_feature')
  })

  it('is a within-graph catalog edge feature -> competitor_feature', () => {
    const def = UPG_EDGE_CATALOG['feature_rivals_competitor_feature']
    expect(def?.source_type).toBe('feature')
    expect(def?.target_type).toBe('competitor_feature')
    expect(def?.forward_verb).toBe('rivals')
  })
})
