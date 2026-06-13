/**
 * Market-intelligence provenance "mixin" — regression test (UPG 0.9.26).
 *
 * Spec issue #40: an autonomous competitor-watch poller needs a uniform place
 * to stamp when/where/how-sure/by-whom across every market_intelligence type.
 * UPG has no interface inheritance in the generated runtime schema, so the
 * "mixin" is a convention: the same four fields, identically typed, on each
 * type. This test is the enforcement that keeps them from drifting apart.
 *
 * `confidence` is the canonical `confidence_5` assessment (not a bare enum) —
 * it matches the spec-wide convention (scales.ts maps confidence -> confidence_5;
 * discovery.ts types confidence as UPGAssessment) and the v0.8.0 deprecation
 * of the bare `Confidence` string union.
 *
 * Run: npx vitest run src/__tests__/provenance-mixin.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// The types that carry the provenance mixin today. competitor_signal (#41,
// Phase C) joins this list when it lands.
const PROVENANCE_TYPES = [
  'competitor',
  'competitor_feature',
  'market_trend',
  'competitive_analysis',
] as const

describe('market_intelligence provenance mixin', () => {
  for (const t of PROVENANCE_TYPES) {
    it(`${t} carries the four provenance fields with uniform types`, () => {
      const schema = UPG_PROPERTY_SCHEMA[t]
      expect(schema, `${t} should have a registered property schema`).toBeDefined()

      expect(schema.last_updated?.type, `${t}.last_updated`).toBe('string')
      expect(schema.source?.type, `${t}.source`).toBe('string')
      expect(schema.confidence?.type, `${t}.confidence`).toBe('assessment')
      expect(schema.confidence?.scale_id, `${t}.confidence scale`).toBe('confidence_5')
      expect(schema.observed_by?.type, `${t}.observed_by`).toBe('string')
    })
  }

  it('the provenance field shape is identical across all carrier types', () => {
    const fingerprint = (t: string) => {
      const s = UPG_PROPERTY_SCHEMA[t]
      return JSON.stringify({
        last_updated: s.last_updated?.type,
        source: s.source?.type,
        confidence: { type: s.confidence?.type, scale_id: s.confidence?.scale_id },
        observed_by: s.observed_by?.type,
      })
    }
    const shapes = new Set(PROVENANCE_TYPES.map(fingerprint))
    expect(shapes.size, `provenance shape drift: ${[...shapes].join(' vs ')}`).toBe(1)
  })
})
