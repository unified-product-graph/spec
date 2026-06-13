/**
 * Workspace member_kind serialization (spec issue #45, UPG 0.10.0).
 *
 * A graph carries its posture in `$upg.member_kind` (source of truth):
 * `product` (default/omitted), `org_rollup` (company umbrella), or `watched`
 * (monitored intelligence graph). The portfolio header's `counts.products`
 * counts only product-kind members, so watched competitor graphs and the
 * org-rollup graph no longer inflate the product count.
 */
import { describe, it, expect } from 'vitest'
import { serializeCanonical, parseUpg } from '../index.js'

function productDoc(memberKind?: 'product' | 'org_rollup' | 'watched') {
  return {
    upg_version: '0.10.0',
    exported_at: '2026-06-13T00:00:00Z',
    source: { tool: 'test' },
    product: { id: 'p_x', title: 'X' },
    nodes: [{ id: 'p_x', type: 'product' as const, title: 'X' }],
    edges: [],
    ...(memberKind ? { member_kind: memberKind } : {}),
  }
}

describe('member_kind serialization (#45)', () => {
  it('round-trips $upg.member_kind for watched / org_rollup graphs', () => {
    for (const k of ['watched', 'org_rollup'] as const) {
      const text = serializeCanonical(productDoc(k))
      const env = JSON.parse(text)
      expect(env.$upg.member_kind).toBe(k)
      const back = parseUpg(text) as { member_kind?: string }
      expect(back.member_kind).toBe(k)
    }
  })

  it('omits member_kind for ordinary products (back-compat clean)', () => {
    const env = JSON.parse(serializeCanonical(productDoc(undefined)))
    expect(env.$upg.member_kind).toBeUndefined()
  })

  it('portfolio counts.products counts only product-kind members', () => {
    const pdoc = {
      upg_version: '0.10.0',
      type: 'portfolio' as const,
      exported_at: '2026-06-13T00:00:00Z',
      source: { tool: 'test' },
      organization: { id: 'org_x', title: 'Org' },
      product_areas: [],
      portfolios: [],
      products: [
        { id: 'p1', title: 'A' }, // default = product
        { id: 'p2', title: 'B', member_kind: 'product' },
        { id: 'c1', title: 'Contentful', member_kind: 'watched' },
        { id: 'roll', title: 'Umbrella', member_kind: 'org_rollup' },
      ],
      cross_edges: [],
    }
    const env = JSON.parse(serializeCanonical(pdoc as never))
    expect(env.$upg.counts.products).toBe(2)
    expect(env.$upg.counts.watched_products).toBe(1)
    expect(env.$upg.counts.org_rollups).toBe(1)
  })
})
