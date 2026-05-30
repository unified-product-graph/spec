/**
 * Canonical `.upg` serialisation tests (ADR Addendum A.8 gates).
 *
 * The contract every writer relies on:
 *   1. Idempotent:      fmt(fmt(x)) === fmt(x) byte-for-byte
 *   2. Round-trip:      parse(fmt(x)) is graph-equivalent to parse(x)
 *   3. Writer-agnostic: input key/array order does not change the output
 *   4. Drift repair:    double-encoded properties/tags are restructured
 *   5. Both envelopes:  single-product AND portfolio
 *   6. Header:          $upg with format_version, spec_version, counts, integrity
 *   7. Integrity:       body checksum stable across a no-op re-export
 */

import { describe, it, expect } from 'vitest'
import {
  serializeCanonical,
  parseUpg,
  formatUpgText,
  isCanonical,
  computeBodyChecksum,
  normalizeDocument,
  UPG_CANONICAL_FORMAT_VERSION,
} from '../format/canonical.js'
import type { UPGDocument, UPGPortfolioDocument } from '../shapes/document.js'

const singleDoc = (): UPGDocument => ({
  upg_version: '0.7.3',
  exported_at: '2026-05-30T10:00:00.000Z',
  source: { tool: 'vitest', tool_version: '1.0.0' },
  product: { id: 'prod-1', title: 'Test Product', stage: 'beta', description: 'A test.\nSecond line.' },
  nodes: [
    { id: 'n-2', type: 'persona', title: 'Beta', tags: ['z', 'a', 'a'], properties: { b: 1, a: 2 } },
    { id: 'n-1', type: 'persona', title: 'Alpha', slug: 'alpha' },
    { id: 'n-3', type: 'feature', title: 'Feat', aliases: ['old-feat', 'older-feat'] },
  ],
  edges: [
    { id: 'e-2', source: 'n-1', target: 'n-3', type: 'persona_pursues_job' },
    { id: 'e-1', source: 'n-1', target: 'n-2', type: 'persona_pursues_job' },
  ],
})

const portfolioDoc = (): UPGPortfolioDocument => ({
  upg_version: '0.4.3',
  type: 'portfolio',
  exported_at: '2026-05-20T00:00:00.000Z',
  source: { tool: 'vitest' },
  organization: { id: 'org-1', title: 'Org', description: 'An org.' },
  product_areas: [],
  portfolios: [],
  products: [
    { id: 'p-b', title: 'B', nodes: [{ id: 'n1', type: 'persona', title: 'X' }], edges: [] },
    { id: 'p-a', title: 'A', nodes: [], edges: [] },
  ],
  cross_edges: [
    { id: 'ce-1', source: 'p-a/n1', target: 'p-b/n1', type: 'shares_persona' },
  ],
})

describe('canonical serialisation — structure', () => {
  it('emits a $upg header with format + spec version, counts, and integrity', () => {
    const out = serializeCanonical(singleDoc())
    const obj = JSON.parse(out)
    expect(obj.$upg.format_version).toBe(UPG_CANONICAL_FORMAT_VERSION)
    expect(obj.$upg.spec_version).toBe('0.7.3')
    expect(obj.$upg.counts).toEqual({ nodes: 3, edges: 2 })
    expect(obj.$upg.integrity.algorithm).toBe('sha256-128')
    expect(obj.$upg.integrity.body).toMatch(/^[0-9a-f]{32}$/)
    expect(obj.$upg.summary).toBe('A test.') // first line only
    // data stays top-level
    expect(obj.product.id).toBe('prod-1')
    expect(Array.isArray(obj.nodes)).toBe(true)
  })

  it('ends with exactly one trailing newline and uses 2-space indent + LF', () => {
    const out = serializeCanonical(singleDoc())
    expect(out.endsWith('}\n')).toBe(true)
    expect(out.endsWith('}\n\n')).toBe(false)
    expect(out).not.toContain('\r')
    expect(out).toContain('\n  "product"') // 2-space top-level indent
  })

  it('$upg is the first key', () => {
    const out = serializeCanonical(singleDoc())
    expect(Object.keys(JSON.parse(out))[0]).toBe('$upg')
  })
})

describe('canonical serialisation — ordering (writer-agnostic)', () => {
  it('sorts nodes by (type, slug??title, id) and edges by (source,target,type,id)', () => {
    const obj = JSON.parse(serializeCanonical(singleDoc()))
    // type: feature(n-3) < persona. Within persona, compare slug??title by CODE UNIT
    // (case-sensitive): n-2 has no slug → title 'Beta' (0x42 'B'); n-1 slug 'alpha' (0x61 'a').
    // Uppercase 'B' < lowercase 'a', so n-2 precedes n-1. This is the deterministic A.2 rule.
    expect(obj.nodes.map((n: { id: string }) => n.id)).toEqual(['n-3', 'n-2', 'n-1'])
    expect(obj.edges.map((e: { id: string }) => e.id)).toEqual(['e-1', 'e-2'])
  })

  it('produces identical output regardless of input node/edge order', () => {
    const a = singleDoc()
    const b = singleDoc()
    b.nodes.reverse()
    b.edges.reverse()
    expect(serializeCanonical(a)).toBe(serializeCanonical(b))
  })

  it('sorts + de-duplicates tags but preserves aliases order', () => {
    const obj = JSON.parse(serializeCanonical(singleDoc()))
    const beta = obj.nodes.find((n: { id: string }) => n.id === 'n-2')
    expect(beta.tags).toEqual(['a', 'z']) // sorted + deduped
    const feat = obj.nodes.find((n: { id: string }) => n.id === 'n-3')
    expect(feat.aliases).toEqual(['old-feat', 'older-feat']) // order preserved
  })

  it('sorts open object (properties) keys', () => {
    const obj = JSON.parse(serializeCanonical(singleDoc()))
    const beta = obj.nodes.find((n: { id: string }) => n.id === 'n-2')
    expect(Object.keys(beta.properties)).toEqual(['a', 'b'])
  })

  it('node identity keys come first, properties last', () => {
    const out = serializeCanonical(singleDoc())
    const block = out.slice(out.indexOf('"id": "n-2"'))
    expect(block.indexOf('"id"')).toBeLessThan(block.indexOf('"properties"'))
  })
})

describe('canonical serialisation — A.8 guarantees', () => {
  it('is idempotent (byte-for-byte)', () => {
    const once = serializeCanonical(singleDoc())
    const twice = formatUpgText(once)
    expect(twice).toBe(once)
  })

  it('round-trips: parse(fmt(x)) preserves the graph', () => {
    const doc = singleDoc()
    const reparsed = parseUpg(serializeCanonical(doc)) as UPGDocument
    expect(reparsed.nodes).toHaveLength(3)
    expect(reparsed.edges).toHaveLength(2)
    expect(reparsed.product.id).toBe('prod-1')
    expect(reparsed.upg_version).toBe('0.7.3')
    expect(reparsed.source.tool).toBe('vitest')
    expect(reparsed.exported_at).toBe('2026-05-30T10:00:00.000Z')
  })

  it('isCanonical: true for canonical text, false for hand-mangled', () => {
    const out = serializeCanonical(singleDoc())
    expect(isCanonical(out)).toBe(true)
    expect(isCanonical(JSON.stringify(JSON.parse(out)))).toBe(false) // compact, no trailing nl
  })

  it('body checksum is stable across a no-op re-export and ignores volatile fields', () => {
    const a = singleDoc()
    const b = singleDoc()
    b.exported_at = '2099-01-01T00:00:00.000Z' // volatile change only
    b.source = { tool: 'other-tool' }
    expect(computeBodyChecksum(a)).toBe(computeBodyChecksum(b))
  })

  it('body checksum CHANGES when the graph changes', () => {
    const a = singleDoc()
    const b = singleDoc()
    b.nodes.push({ id: 'n-4', type: 'need', title: 'New' })
    expect(computeBodyChecksum(a)).not.toBe(computeBodyChecksum(b))
  })
})

describe('canonical serialisation — legacy flat envelope', () => {
  it('parses a legacy flat (no $upg) document', () => {
    const legacy = JSON.stringify(singleDoc())
    const doc = parseUpg(legacy) as UPGDocument
    expect(doc.nodes).toHaveLength(3)
    expect(doc.upg_version).toBe('0.7.3')
  })

  it('upgrades legacy flat → canonical with a single fmt pass', () => {
    const legacy = JSON.stringify(singleDoc())
    const canonical = formatUpgText(legacy)
    expect(JSON.parse(canonical).$upg.format_version).toBe(UPG_CANONICAL_FORMAT_VERSION)
    expect(isCanonical(canonical)).toBe(true)
  })
})

describe('canonical serialisation — drift repair (A.6)', () => {
  it('restructures double-encoded properties/tags strings', () => {
    const doc = singleDoc()
    // simulate the entopo.upg / curlop.upg drift
    ;(doc.nodes[0] as unknown as { properties: string }).properties = '{"unit":"%","status":"on_track"}'
    ;(doc.nodes[0] as unknown as { tags: string }).tags = '["dsl","ops"]'
    const obj = JSON.parse(serializeCanonical(doc))
    const repaired = obj.nodes.find((n: { id: string }) => n.id === 'n-2')
    expect(repaired.properties).toEqual({ status: 'on_track', unit: '%' })
    expect(repaired.tags).toEqual(['dsl', 'ops'])
  })

  it('throws a precise error on a string that is not valid JSON of the expected type', () => {
    const doc = singleDoc()
    ;(doc.nodes[0] as unknown as { properties: string }).properties = 'not json'
    expect(() => serializeCanonical(doc)).toThrow(/n-2\.properties is a string that is not valid JSON/)
  })
})

describe('canonical serialisation — portfolio envelope ($upg header, kind: portfolio)', () => {
  it('emits a $upg header (kind: portfolio) and sorts products canonically', () => {
    const obj = JSON.parse(serializeCanonical(portfolioDoc()))
    expect(obj.$upg.kind).toBe('portfolio')
    expect(obj.$upg.spec_version).toBe('0.4.3')
    expect(obj.$upg.organization.id).toBe('org-1')
    expect(obj.$upg.counts.products).toBe(2)
    expect(obj.$upg.integrity.body).toMatch(/^[0-9a-f]{32}$/)
    // org + collections stay top-level
    expect(obj.organization.id).toBe('org-1')
    expect(obj.products.map((p: { id: string }) => p.id)).toEqual(['p-a', 'p-b'])
  })

  it('is idempotent and round-trips for portfolios', () => {
    const once = serializeCanonical(portfolioDoc())
    expect(formatUpgText(once)).toBe(once)
    const reparsed = parseUpg(once) as UPGPortfolioDocument
    expect(reparsed.type).toBe('portfolio')
    expect(reparsed.products).toHaveLength(2)
    expect(reparsed.cross_edges).toHaveLength(1)
  })
})

describe('normalizeDocument — accepts pre-parsed objects (both envelopes)', () => {
  it('normalises a $upg envelope object to flat', () => {
    const canonicalObj = JSON.parse(serializeCanonical(singleDoc()))
    const flat = normalizeDocument(canonicalObj) as UPGDocument
    expect(flat.upg_version).toBe('0.7.3')
    expect(flat.nodes).toHaveLength(3)
    expect(flat.exported_at).toBe('2026-05-30T10:00:00.000Z')
    // Deliberately NOT reconstructed from $upg.integrity (different checksum
    // algorithm than the legacy field — see normalizeDocument).
    expect(flat._integrity).toBeUndefined()
  })
})
