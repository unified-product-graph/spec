/**
 * Cross-product edge validation — post-portfolio-migration rules.
 *
 * After the portfolio-document migration, cross-product edge types
 * are illegal inside a product's `edges[]`. They must live exclusively in
 * `portfolio.cross_edges[]`.
 *
 * The validator now emits an error (not a warning, not a silent pass) when it
 * finds a cross-product edge type in `edges[]`.
 */

import { describe, it, expect } from 'vitest'
import { validateUPGDocument } from '../grammar/validate.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'

const baseDoc = (edges: Array<Record<string, unknown>>) => ({
  upg_version: '0.2.4',
  exported_at: '2026-04-27T20:00:00Z',
  source: { tool: 'test', tool_version: '0.0.0' },
  product: { id: 'p_test', title: 'Test product' },
  nodes: [
    { id: 'n1', type: 'persona', title: 'Local persona' },
    { id: 'n2', type: 'persona', title: 'Another persona' },
  ],
  edges,
})

describe('cross-product edge validation', () => {
  it('exposes the seven canonical cross-product edge types', () => {
    expect(UPG_CROSS_EDGE_TYPES).toEqual([
      'shares_persona',
      'shares_competitor',
      'shares_metric',
      'depends_on_product',
      'cannibalises',
      'succeeds',
      'hosts',
    ])
  })

  it('rejects a cross-product edge type in product edges[]', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'shares_persona' },
    ])
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.message.includes('portfolio.cross_edges'))).toBe(true)
  })

  it('emits the error on the edge type path', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'shares_persona' },
    ])
    const result = validateUPGDocument(doc)
    const typeError = result.errors.find((e) => e.path === '$.edges[0].type')
    expect(typeError).toBeDefined()
    expect(typeError?.message).toContain('portfolio.cross_edges[]')
  })

  it('rejects all seven cross-product edge types in edges[]', () => {
    for (const crossType of UPG_CROSS_EDGE_TYPES) {
      const doc = baseDoc([
        { id: 'e1', source: 'n1', target: 'n2', type: crossType },
      ])
      const result = validateUPGDocument(doc)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.message.includes('portfolio.cross_edges'))).toBe(true)
    }
  })

  it('still rejects normal edges with unknown endpoints', () => {
    const doc = baseDoc([
      {
        id: 'e_bad',
        source: 'n1',
        target: 'n_does_not_exist',
        type: 'persona_pursues_job',
      },
    ])
    const result = validateUPGDocument(doc)
    expect(result.valid).toBe(false)
    const targetError = result.errors.find((e) => e.path === '$.edges[0].target')
    expect(targetError?.message).toContain('unknown node id')
  })

  it('accepts a valid product edge between known nodes', () => {
    const doc = baseDoc([
      { id: 'e1', source: 'n1', target: 'n2', type: 'persona_pursues_job' },
    ])
    const result = validateUPGDocument(doc)
    // persona_pursues_job may not be in catalog — that produces a warning, not an error
    expect(result.errors).toHaveLength(0)
  })
})
