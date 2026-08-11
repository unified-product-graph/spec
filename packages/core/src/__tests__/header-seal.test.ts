/**
 * `checkHeaderSeal` — is a `.upg` file's `$upg` header true to its own body?
 *
 * `$upg.counts` and `$upg.integrity.body` are derived at write time, and
 * `normalizeDocument` drops both on the way in, so the in-memory document has no
 * memory of what the file CLAIMED. Nothing read either field back until this
 * checker, which is how a git-merged file could declare one fewer node than it
 * holds and pass every check clean (feedback 1bb903bf).
 *
 * The load-bearing property below is ROUND-TRIP STABILITY: a freshly serialised
 * document must verify clean after parse → normalise → recompute. Without it the
 * checker would be a false-positive generator on every healthy file.
 */
import { describe, it, expect } from 'vitest'
import {
  serializeCanonical,
  checkHeaderSeal,
  checkHeaderSealText,
  deriveCounts,
  deriveSingleCounts,
  derivePortfolioCounts,
  UPG_CANONICAL_FORMAT_VERSION,
} from '../format/canonical.js'
import type { UPGDocument, UPGPortfolioDocument } from '../shapes/document.js'

const singleDoc = (): UPGDocument =>
  ({
    upg_version: '0.26.0',
    exported_at: '2026-08-12T00:00:00.000Z',
    source: { tool: 'vitest' },
    product: { id: 'p-1', title: 'P', stage: 'concept' },
    nodes: [
      { id: 'n1', type: 'persona', title: 'X' },
      { id: 'n2', type: 'feature', title: 'Y' },
      { id: 'n3', type: 'feature', title: 'Z' },
    ],
    edges: [{ id: 'e1', source: 'n2', target: 'n1', type: 'feature_serves_persona' }],
  }) as unknown as UPGDocument

const portfolioDoc = (): UPGPortfolioDocument =>
  ({
    upg_version: '0.26.0',
    type: 'portfolio',
    exported_at: '2026-08-12T00:00:00.000Z',
    source: { tool: 'vitest' },
    organization: { id: 'org-1', title: 'Org' },
    product_areas: [{ id: 'area-1', title: 'Area' }],
    portfolios: [],
    products: [
      { id: 'p-a', title: 'A', nodes: [{ id: 'n1', type: 'persona', title: 'X' }], edges: [] },
      { id: 'p-b', title: 'B', nodes: [], edges: [] },
      { id: 'p-w', title: 'W', member_kind: 'watched', nodes: [], edges: [] },
    ],
    cross_edges: [],
  }) as unknown as UPGPortfolioDocument

/** Serialise, then corrupt the parsed JSON the way a bad merge or hand-edit would. */
function sealed(
  doc: UPGDocument | UPGPortfolioDocument,
  mutate?: (json: Record<string, any>) => void,
): Record<string, unknown> {
  const json = JSON.parse(serializeCanonical(doc))
  mutate?.(json)
  return json
}

describe('checkHeaderSeal — round-trip stability', () => {
  it('a freshly serialised single-product document verifies clean', () => {
    const report = checkHeaderSeal(sealed(singleDoc()))
    expect(report.header_present).toBe(true)
    expect(report.counts_checked).toBe(true)
    expect(report.integrity_checked).toBe(true)
    expect(report.counts_drift).toEqual([])
    expect(report.integrity_drift).toEqual([])
    expect(report.skipped_reason).toBeUndefined()
  })

  it('a freshly serialised portfolio document verifies clean', () => {
    const report = checkHeaderSeal(sealed(portfolioDoc()))
    expect(report.counts_drift).toEqual([])
    expect(report.integrity_drift).toEqual([])
  })

  it('checkHeaderSealText tolerates a leading BOM', () => {
    const text = '﻿' + serializeCanonical(singleDoc())
    expect(checkHeaderSealText(text).counts_drift).toEqual([])
  })
})

describe('checkHeaderSeal — counts drift', () => {
  it('catches the bad-merge case (declared lags the body by one)', () => {
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.counts.nodes -= 1
      }),
    )
    expect(report.counts_drift).toEqual([{ field: 'nodes', declared: 2, actual: 3 }])
    // The body was untouched, so the checksum must still verify.
    expect(report.integrity_drift).toEqual([])
  })

  it('reports every drifted field, sorted, not just the first', () => {
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.counts.nodes = 99
        j.$upg.counts.edges = 42
      }),
    )
    expect(report.counts_drift).toEqual([
      { field: 'edges', declared: 42, actual: 1 },
      { field: 'nodes', declared: 99, actual: 3 },
    ])
  })

  it('catches portfolio-specific counts fields', () => {
    const report = checkHeaderSeal(
      sealed(portfolioDoc(), (j) => {
        j.$upg.counts.products = 5
        j.$upg.counts.cross_edges = 3
      }),
    )
    expect(report.counts_drift).toEqual([
      { field: 'cross_edges', declared: 3, actual: 0 },
      { field: 'products', declared: 5, actual: 2 },
    ])
  })

  it('catches a header key that is no longer derived (stale at zero)', () => {
    // The serialiser omits watched_products when zero, so a leftover key is
    // drift even though nothing in the body contradicts a number.
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.counts.org_rollups = 2
      }),
    )
    expect(report.counts_drift).toEqual([{ field: 'org_rollups', declared: 2, actual: 0 }])
  })

  it('catches a derived key the header never mentions', () => {
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        delete j.$upg.counts.edges
      }),
    )
    expect(report.counts_drift).toEqual([{ field: 'edges', declared: 0, actual: 1 }])
  })
})

describe('checkHeaderSeal — integrity drift', () => {
  it('catches a body edit that leaves cardinality untouched', () => {
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.nodes[0].title = 'tampered'
      }),
    )
    expect(report.counts_drift).toEqual([])
    expect(report.integrity_drift).toHaveLength(1)
    expect(report.integrity_drift[0].algorithm).toBe('sha256-128')
    expect(report.integrity_drift[0].declared).not.toBe(report.integrity_drift[0].computed)
  })

  it('does not treat a provenance/timestamp change as body drift', () => {
    // The integrity body deliberately excludes the volatile fields; a re-export
    // that only rewrites `exported_at` must not read as tampering.
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.provenance.exported_at = '2099-01-01T00:00:00.000Z'
      }),
    )
    expect(report.integrity_drift).toEqual([])
  })
})

describe('checkHeaderSeal — what it declines to judge', () => {
  it('a legacy flat file declares nothing and so drifts in neither class', () => {
    const report = checkHeaderSeal(singleDoc() as unknown as Record<string, unknown>)
    expect(report.header_present).toBe(false)
    expect(report.counts_checked).toBe(false)
    expect(report.integrity_checked).toBe(false)
    expect(report.counts_drift).toEqual([])
    expect(report.integrity_drift).toEqual([])
  })

  it('skips both checks on an unrecognised format_version', () => {
    // Counts keys and body layout are contracts OF a format version, so a future
    // bump must degrade to "not checked", never to a wall of false positives.
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.format_version = '9.9.9'
        j.$upg.counts.nodes = 0
      }),
    )
    expect(report.counts_checked).toBe(false)
    expect(report.integrity_checked).toBe(false)
    expect(report.counts_drift).toEqual([])
    expect(report.skipped_reason).toContain('9.9.9')
  })

  it('skips the checksum on an unrecognised algorithm rather than crying tamper', () => {
    const report = checkHeaderSeal(
      sealed(singleDoc(), (j) => {
        j.$upg.integrity.algorithm = 'blake3'
      }),
    )
    expect(report.integrity_checked).toBe(false)
    expect(report.integrity_drift).toEqual([])
    expect(report.skipped_reason).toContain('blake3')
    // counts is independent and still checked
    expect(report.counts_checked).toBe(true)
  })
})

describe('counts derivation is shared with the serialiser', () => {
  // The whole point of extracting deriveCounts: writer and verifier read from
  // one definition, so they cannot disagree about what the counts should be.
  it('deriveCounts reproduces exactly what serializeCanonical stamps (single)', () => {
    const doc = singleDoc()
    expect(JSON.parse(serializeCanonical(doc)).$upg.counts).toEqual(deriveCounts(doc))
    expect(deriveSingleCounts(doc)).toEqual({ nodes: 3, edges: 1 })
  })

  it('deriveCounts reproduces exactly what serializeCanonical stamps (portfolio)', () => {
    const doc = portfolioDoc()
    expect(JSON.parse(serializeCanonical(doc)).$upg.counts).toEqual(deriveCounts(doc))
    expect(derivePortfolioCounts(doc)).toEqual({
      products: 2, // p-w is `watched`, not a product under management
      watched_products: 1,
      product_areas: 1,
      portfolios: 0,
      cross_edges: 0,
    })
  })

  it('the gate constant the checks key off is this serialiser version', () => {
    expect(JSON.parse(serializeCanonical(singleDoc())).$upg.format_version).toBe(
      UPG_CANONICAL_FORMAT_VERSION,
    )
  })
})
