/**
 * reshape_value_to_assessment migration (0.10.2 — the #43 property-registry tail).
 *
 * The v0.10.0 generator fix corrected market_trend.impact / relevance to the
 * UPGAssessment shape their interfaces always declared; a pre-0.10.0 graph that
 * stored a bare number is now invalid. This migration wraps the number on its
 * canonical scale (impact_5 / importance_5), deriving the qualitative label, and
 * is idempotent on an already-correct assessment object.
 */
import { describe, it, expect } from 'vitest'
import { migrateNodeProperties, UPG_PROPERTY_MIGRATIONS } from '../grammar/migrations.js'

describe('reshape_value_to_assessment (#43 tail, 0.10.2)', () => {
  it('registers the market_trend reshape rules under 0.10.2', () => {
    const rules = UPG_PROPERTY_MIGRATIONS['0.10.2'] ?? []
    const reshapes = rules.filter((r) => r.kind === 'reshape_value_to_assessment')
    expect(reshapes.map((r) => (r as { property: string }).property).sort()).toEqual(['impact', 'relevance'])
  })

  it('wraps bare market_trend.impact / relevance numbers on their canonical scales', () => {
    const node = { id: 'mt1', type: 'market_trend', title: 'AI everywhere', properties: { impact: 4, relevance: 5 } }
    const { node: out, changes } = migrateNodeProperties(node, '0.10.1', '0.10.2')
    expect(out.properties).toEqual({
      impact: { value: 4, label: 'High', scale_id: 'impact_5' },
      relevance: { value: 5, label: 'Critical', scale_id: 'importance_5' },
    })
    expect(changes.filter((c) => c.kind === 'reshaped_to_assessment')).toHaveLength(2)
  })

  it('is idempotent: an existing assessment object passes through untouched', () => {
    const existing = { value: 4, label: 'High', scale_id: 'impact_5' }
    const node = { id: 'mt2', type: 'market_trend', title: 'X', properties: { impact: { ...existing } } }
    const { node: out, changes } = migrateNodeProperties(node, '0.10.1', '0.10.2')
    expect((out.properties as Record<string, unknown>).impact).toEqual(existing)
    expect(changes.some((c) => c.kind === 'reshaped_to_assessment')).toBe(false)
  })

  it('accepts a numeric string', () => {
    const node = { id: 'mt3', type: 'market_trend', title: 'X', properties: { impact: '3' } }
    const { node: out } = migrateNodeProperties(node, '0.10.1', '0.10.2')
    expect((out.properties as Record<string, unknown>).impact).toEqual({ value: 3, label: 'Moderate', scale_id: 'impact_5' })
  })

  it('does not touch the same property name on other entity types', () => {
    const node = { id: 'f1', type: 'feature', title: 'F', properties: { impact: 4 } }
    const { node: out, changes } = migrateNodeProperties(node, '0.10.1', '0.10.2')
    expect((out.properties as Record<string, unknown>).impact).toBe(4)
    expect(changes.some((c) => c.kind === 'reshaped_to_assessment')).toBe(false)
  })
})
