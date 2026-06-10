/**
 * Canonical `.upg` serialisation, the `upg fmt` reference implementation.
 *
 * The same logical graph always serialises to byte-identical output, regardless
 * of which tool wrote it. This is the linchpin of: every writer (MCP
 * server, CLI, SDK, cloud export, AI agents via MCP) calls this one serialiser,
 * so git diffs reflect MEANING, not formatting.
 *
 * Anchored on RFC 8785 (JSON Canonicalization Scheme) for the
 * object-internal rules, with two deliberate deviations for the git-review
 * lifecycle: (1) pretty-print (2-space, one element per line, LF) rather than
 * JCS's compact single line; (2) semantic sort of the set-like arrays
 * (`nodes`, `edges`, `cross_edges`, `tags`) rather than JCS's preserve-as-is.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import { createHash } from 'node:crypto'
import type { UPGBaseNode } from '../shapes/base-node.js'
import type { UPGEdge } from '../shapes/edges.js'
import type {
  UPGDocument,
  UPGPortfolioDocument,
  UPGCrossEdge,
  UPGProduct,
  UPGProductStage,
} from '../shapes/document.js'

/**
 * The on-disk canonical serialisation version, written to `$upg.format_version`.
 * Distinct from `UPG_VERSION` (the catalogue/spec version, written to
 * `$upg.spec_version`): the *serialisation* can evolve independently of the
 * *schema*. Bumped to 1.0.0 for the canonical-form + `$upg` header release
 *, the first format version actually written to disk.
 */
export const UPG_CANONICAL_FORMAT_VERSION = '1.0.0' as const

/** Underlying cryptographic hash primitive used to compute the digest. */
const INTEGRITY_HASH_PRIMITIVE = 'sha256' as const
/** Hex chars of digest retained: 32 hex = 128 bits (a truncation of SHA-256). */
const INTEGRITY_DIGEST_HEX = 32
/**
 * Public label for the integrity digest, recorded in `$upg.integrity.algorithm`.
 * It is SHA-256 truncated to 128 bits, so the label must say so: a reader that
 * recomputes a full `sha256` would get 64 chars and never match the stored 32.
 * The "sha256-128" form mirrors the SHA-512/256 truncation convention.
 */
const INTEGRITY_ALGORITHM = 'sha256-128' as const

// ─── The `$upg` header ──────────────────────────────────────────────────────

/** Provenance block inside the `$upg` header. Holds the volatile fields. */
export interface UPGHeaderProvenance {
  /** The tool that produced this document */
  tool: string
  /** Optional tool version */
  tool_version?: string
  /** ISO 8601 timestamp of export (volatile, excluded from the integrity body) */
  exported_at?: string
  /** Optional workspace/project identifier in the source tool */
  workspace_id?: string
}

/** Integrity block inside the `$upg` header, checksum of the canonical BODY. */
export interface UPGHeaderIntegrity {
  /** Hash algorithm label, e.g. "sha256-128" (SHA-256 truncated to 128 bits) */
  algorithm: string
  /** Hex checksum of the canonical serialisation of the body (product + nodes + edges) */
  body: string
}

/**
 * The reserved `$upg` header object. Consolidates the previously-scattered
 * metadata (`upg_version`, `source`, `exported_at`, `_integrity`) into one
 * leading object so a reader gets instant orientation and tools can read
 * metadata without parsing the whole graph.
 */
export interface UPGHeader {
  /** Serialisation/format version (this serialiser's contract) */
  format_version: string
  /** Spec (catalogue) version the graph conforms to */
  spec_version: string
  /** "portfolio" for portfolio documents; omitted for single-product */
  kind?: 'portfolio'
  /** Summary mirror of the root product (single-product docs) */
  product?: { id: string; title: string; stage?: string }
  /** Summary mirror of the organisation (portfolio docs) */
  organization?: { id: string; title: string }
  /** One-line description, mirrored from the product/org for at-a-glance orientation */
  summary?: string
  /** Element counts, for cheap size reads without walking the graph */
  counts: Record<string, number>
  /** Provenance, who/what last wrote this, and when (volatile) */
  provenance: UPGHeaderProvenance
  /** Tamper-evidence over the canonical body */
  integrity: UPGHeaderIntegrity
}

// ─── JCS-style canonicalisation of open values ───────────────────────────────

/**
 * Recursively canonicalise an arbitrary JSON value per RFC 8785 object rules:
 * object keys sorted ascending by UTF-16 code unit; array element ORDER
 * preserved (arrays are meaningful sequences); scalars untouched. Used for
 * open objects (`properties`) and any nested value we do not pin by hand.
 */
function canonicalizeOpen(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalizeOpen)
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as Record<string, unknown>).sort(byCodeUnit)) {
      out[key] = canonicalizeOpen((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

/** Code-unit (UTF-16) ascending comparison, NEVER locale-aware (must be stable across machines). */
function byCodeUnit(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** True when a value is "empty" and should be omitted from canonical output (ADR A.5). */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

/**
 * Build an object with keys emitted in `keyOrder` first (skipping empty
 * optionals), then any remaining keys JCS-sorted. `forceKeys` are emitted even
 * when empty (the required identity fields). Values for keys named in
 * `openKeys` are canonicalised recursively (open objects like `properties`).
 */
function orderedObject(
  source: Record<string, unknown>,
  keyOrder: string[],
  opts: { forceKeys?: string[]; openKeys?: string[] } = {},
): Record<string, unknown> {
  const force = new Set(opts.forceKeys ?? [])
  const open = new Set(opts.openKeys ?? [])
  const out: Record<string, unknown> = {}
  const emit = (key: string) => {
    if (!(key in source)) return
    const raw = source[key]
    if (!force.has(key) && isEmpty(raw)) return
    out[key] = open.has(key) ? canonicalizeOpen(raw) : raw
  }
  for (const key of keyOrder) emit(key)
  for (const key of Object.keys(source).sort(byCodeUnit)) {
    if (!keyOrder.includes(key)) emit(key)
  }
  return out
}

// ─── Drift repair (ADR A.6) ──────────────────────────────────────────────────

/**
 * Repair double-encoded JSON drift: some historical writers stored
 * `properties`/`tags` as JSON *strings* instead of structured values. If a
 * field that must be an object/array holds a string that parses to the
 * expected type, restructure it (idempotent). Otherwise throw, never guess.
 */
function repairNodeDrift(node: UPGBaseNode): UPGBaseNode {
  const out: UPGBaseNode = { ...node }
  if (typeof out.properties === 'string') {
    out.properties = parseDriftString(out.properties, 'object', `node ${node.id}.properties`) as Record<
      string,
      unknown
    >
  }
  if (typeof (out.tags as unknown) === 'string') {
    out.tags = parseDriftString(out.tags as unknown as string, 'array', `node ${node.id}.tags`) as string[]
  }
  return out
}

function parseDriftString(raw: string, expect: 'object' | 'array', where: string): unknown {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`[upg fmt] ${where} is a string that is not valid JSON: ${truncate(raw)}`)
  }
  const ok = expect === 'array' ? Array.isArray(parsed) : parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
  if (!ok) throw new Error(`[upg fmt] ${where} is a string that does not parse to a JSON ${expect}: ${truncate(raw)}`)
  return parsed
}

function truncate(s: string): string {
  return s.length > 60 ? s.slice(0, 57) + '...' : s
}

/**
 * Derive the one-line `$upg.summary` from a description: first non-empty line,
 * capped. Kept short on purpose, the header is orientation, not a copy of the
 * product body. Always re-derived on serialise, so it cannot drift.
 */
function deriveSummary(description?: string): string | undefined {
  if (!description) return undefined
  const firstLine = description.split('\n').map((l) => l.trim()).find((l) => l.length > 0)
  if (!firstLine) return undefined
  return firstLine.length > 200 ? firstLine.slice(0, 197) + '...' : firstLine
}

// ─── Element ordering for the set-like arrays (ADR A.2) ──────────────────────

function sortNodes(nodes: UPGBaseNode[]): UPGBaseNode[] {
  return [...nodes].sort((a, b) =>
    byCodeUnit(a.type ?? '', b.type ?? '') ||
    byCodeUnit(a.slug ?? a.title ?? '', b.slug ?? b.title ?? '') ||
    byCodeUnit(a.id ?? '', b.id ?? ''),
  )
}

function sortEdges<T extends { source: string; target: string; type: string; id: string }>(edges: T[]): T[] {
  return [...edges].sort((a, b) =>
    byCodeUnit(a.source ?? '', b.source ?? '') ||
    byCodeUnit(a.target ?? '', b.target ?? '') ||
    byCodeUnit(a.type ?? '', b.type ?? '') ||
    byCodeUnit(a.id ?? '', b.id ?? ''),
  )
}

// ─── Per-object canonical key order (ADR A.1) ────────────────────────────────

const NODE_KEY_ORDER = [
  'id', 'type', 'title', 'slug', 'aliases', 'description', 'tags', 'status',
  'lifecycle_status', 'source_id', 'source_type', 'mapping_confidence',
  'external_tool', 'external_ref', 'external_id', 'sort_order', 'properties',
]
const EDGE_KEY_ORDER = ['id', 'source', 'target', 'type', 'mapping_confidence', 'properties']
const CROSS_EDGE_KEY_ORDER = ['id', 'source', 'target', 'type', 'source_product_id', 'target_product_id', 'mapping_confidence']
const PRODUCT_KEY_ORDER = ['id', 'title', 'description', 'stage', 'properties']

function canonicalNode(node: UPGBaseNode): Record<string, unknown> {
  const repaired = repairNodeDrift(node) as unknown as Record<string, unknown>
  // tags: sort + de-duplicate (unordered label set). aliases: preserve order (append-only history).
  if (Array.isArray(repaired.tags)) {
    repaired.tags = [...new Set(repaired.tags as string[])].sort(byCodeUnit)
  }
  return orderedObject(repaired, NODE_KEY_ORDER, { forceKeys: ['id', 'type', 'title'], openKeys: ['properties'] })
}

function canonicalEdge(edge: UPGEdge): Record<string, unknown> {
  return orderedObject(edge as unknown as Record<string, unknown>, EDGE_KEY_ORDER, {
    forceKeys: ['id', 'source', 'target', 'type'],
    openKeys: ['properties'],
  })
}

function canonicalCrossEdge(edge: UPGCrossEdge): Record<string, unknown> {
  return orderedObject(edge as unknown as Record<string, unknown>, CROSS_EDGE_KEY_ORDER, {
    forceKeys: ['id', 'source', 'target', 'type'],
  })
}

function canonicalProduct(product: Record<string, unknown>): Record<string, unknown> {
  return orderedObject(product, PRODUCT_KEY_ORDER, { forceKeys: ['id', 'title'], openKeys: ['properties'] })
}

/**
 * Reconcile the root product summary against its canonical node.
 *
 * The product lives in two places: the root `doc.product` summary (mirrored into
 * the `$upg` header) and, once graph tools operate on it, a `type: 'product'`
 * node in `doc.nodes` sharing the product's id. Graph edits (`update_node`, batch
 * ops) touch the node, so the root summary and the header drift, a product can
 * read `concept` / "304 types" in the header while the node already says `launch`
 * / "313 types". Treat the node as the source of truth and overlay its live
 * title, description, and stage onto the root, so the body block, the derived
 * summary, and the header all re-derive from current data on every write. This
 * is self-healing: a file that already drifted is corrected on its next write.
 * No matching node (product is root-only): returned unchanged.
 */
function effectiveRootProduct(doc: UPGDocument): UPGProduct {
  const node = doc.nodes?.find((n) => n.type === 'product' && n.id === doc.product.id)
  if (!node) return doc.product
  return {
    ...doc.product,
    title: node.title ?? doc.product.title,
    description: node.description ?? doc.product.description,
    // A product's lifecycle status IS its stage, the same axis (grammar/lifecycles).
    stage: (node.status as UPGProductStage | undefined) ?? doc.product.stage,
  }
}

// ─── Body assembly + checksum ────────────────────────────────────────────────

/** The canonical body of a single-product doc: product + sorted nodes + sorted edges. */
function singleBody(doc: UPGDocument): Record<string, unknown> {
  return {
    product: canonicalProduct(effectiveRootProduct(doc) as unknown as Record<string, unknown>),
    nodes: sortNodes(doc.nodes ?? []).map(canonicalNode),
    edges: sortEdges(doc.edges ?? []).map(canonicalEdge),
  }
}

/** The canonical body of a portfolio doc. */
function portfolioBody(doc: UPGPortfolioDocument): Record<string, unknown> {
  const products = [...(doc.products ?? [])]
    .sort((a, b) => byCodeUnit(a.id ?? '', b.id ?? ''))
    .map((p) => {
      const { nodes, edges, ...rest } = p
      return {
        ...canonicalProduct(rest as unknown as Record<string, unknown>),
        nodes: sortNodes(nodes ?? []).map(canonicalNode),
        edges: sortEdges(edges ?? []).map(canonicalEdge),
      }
    })
  return {
    organization: orderedObject(doc.organization as unknown as Record<string, unknown>, ['id', 'title', 'description', 'logo_url', 'industry'], { forceKeys: ['id', 'title'] }),
    product_areas: [...(doc.product_areas ?? [])]
      .sort((a, b) => byCodeUnit(a.id ?? '', b.id ?? ''))
      .map((a) => orderedObject(a as unknown as Record<string, unknown>, ['id', 'title', 'description', 'parent_area_id', 'strategic_priority', 'products'], { forceKeys: ['id', 'title'] })),
    portfolios: [...(doc.portfolios ?? [])]
      .sort((a, b) => byCodeUnit(a.id ?? '', b.id ?? ''))
      .map((p) => orderedObject(p as unknown as Record<string, unknown>, ['id', 'title', 'description', 'parent_portfolio_id', 'hierarchy_model', 'products'], { forceKeys: ['id', 'title'] })),
    products,
    cross_edges: sortEdges(doc.cross_edges ?? []).map(canonicalCrossEdge),
    // Registry tier (shared vocabulary). Emitted only when non-empty so existing
    // portfolio files without a registry stay byte-identical. Canonical entities
    // are normal nodes, serialised with the same node/edge canonical rules.
    ...(doc.registry && doc.registry.nodes.length > 0
      ? {
          registry: {
            nodes: sortNodes(doc.registry.nodes).map(canonicalNode),
            ...(doc.registry.edges && doc.registry.edges.length > 0
              ? { edges: sortEdges(doc.registry.edges).map(canonicalEdge) }
              : {}),
          },
        }
      : {}),
  }
}

/**
 * Deterministic checksum of the canonical body (volatile fields excluded by
 * construction, the body has no timestamps). Hex, first 32 chars.
 */
export function computeBodyChecksum(doc: UPGDocument | UPGPortfolioDocument): string {
  const body = isPortfolio(doc) ? portfolioBody(doc) : singleBody(doc as UPGDocument)
  // JSON.stringify with no indent: the hash input only needs to be deterministic,
  // and key order is already canonical from the body builders.
  const content = JSON.stringify(body)
  return createHash(INTEGRITY_HASH_PRIMITIVE).update(content).digest('hex').slice(0, INTEGRITY_DIGEST_HEX)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function isPortfolio(doc: UPGDocument | UPGPortfolioDocument): doc is UPGPortfolioDocument {
  return (doc as UPGPortfolioDocument).type === 'portfolio' || 'cross_edges' in doc
}

export interface SerializeOptions {
  /** Override the export timestamp (default: omitted; writers set provenance.exported_at). */
  exportedAt?: string
  /** Who/what is writing (maps to provenance). Falls back to the doc's `source`. */
  source?: { tool: string; tool_version?: string; workspace_id?: string }
}

/**
 * Serialise a UPG document to its canonical on-disk form (the `$upg` header
 * envelope). Idempotent and writer-agnostic: the same logical graph always
 * yields byte-identical output. Always ends with a single trailing newline.
 */
export function serializeCanonical(
  doc: UPGDocument | UPGPortfolioDocument,
  opts: SerializeOptions = {},
): string {
  if (isPortfolio(doc)) return serializePortfolioWithHeader(doc as UPGPortfolioDocument, opts)
  return serializeSingleWithHeader(doc as UPGDocument, opts)
}

/** Build the volatile-aware provenance block shared by both envelopes. */
function buildProvenance(doc: UPGDocument | UPGPortfolioDocument, opts: SerializeOptions): Record<string, unknown> {
  const source = opts.source ?? doc.source ?? { tool: 'unknown' }
  return orderedObject(
    {
      tool: source.tool,
      tool_version: source.tool_version,
      workspace_id: source.workspace_id,
      exported_at: opts.exportedAt ?? doc.exported_at,
    },
    ['tool', 'tool_version', 'workspace_id', 'exported_at'],
    { forceKeys: ['tool'] },
  )
}

/** Single-product canonical form: the `$upg` header envelope (Layer 1 + Layer 2). */
function serializeSingleWithHeader(doc: UPGDocument, opts: SerializeOptions): string {
  const body = singleBody(doc)
  const product = effectiveRootProduct(doc)
  const header: Record<string, unknown> = {
    format_version: UPG_CANONICAL_FORMAT_VERSION,
    spec_version: doc.upg_version,
    product: orderedObject(
      { id: product.id, title: product.title, stage: product.stage },
      ['id', 'title', 'stage'],
      { forceKeys: ['id', 'title'] },
    ),
  }
  const summary = deriveSummary(product.description)
  if (summary) header.summary = summary
  header.counts = { nodes: doc.nodes?.length ?? 0, edges: doc.edges?.length ?? 0 }
  header.provenance = buildProvenance(doc, opts)
  header.integrity = { algorithm: INTEGRITY_ALGORITHM, body: computeBodyChecksum(doc) }

  return JSON.stringify({ $upg: header, ...body }, null, 2) + '\n'
}

/** Portfolio canonical form: the `$upg` header envelope (kind: "portfolio"). */
function serializePortfolioWithHeader(doc: UPGPortfolioDocument, opts: SerializeOptions): string {
  const body = portfolioBody(doc)
  const org = doc.organization
  const header: Record<string, unknown> = {
    format_version: UPG_CANONICAL_FORMAT_VERSION,
    spec_version: doc.upg_version,
    kind: 'portfolio',
    organization: orderedObject(
      { id: org.id, title: org.title },
      ['id', 'title'],
      { forceKeys: ['id', 'title'] },
    ),
  }
  const summary = deriveSummary(org.description)
  if (summary) header.summary = summary
  header.counts = {
    products: doc.products?.length ?? 0,
    product_areas: doc.product_areas?.length ?? 0,
    portfolios: doc.portfolios?.length ?? 0,
    cross_edges: doc.cross_edges?.length ?? 0,
  }
  header.provenance = buildProvenance(doc, opts)
  header.integrity = { algorithm: INTEGRITY_ALGORITHM, body: computeBodyChecksum(doc) }

  return JSON.stringify({ $upg: header, ...body }, null, 2) + '\n'
}

/**
 * Parse a `.upg` file's text into the in-memory `UPGDocument` /
 * `UPGPortfolioDocument` (flat) shape, accepting BOTH the canonical `$upg`
 * envelope and the legacy flat envelope. Drift (A.6) is repaired on the way in,
 * so a parse → serialise round-trip is clean. This is the one read path.
 */
export function parseUpg(text: string): UPGDocument | UPGPortfolioDocument {
  return normalizeDocument(JSON.parse(text))
}

/**
 * Normalise an already-parsed object (canonical `$upg` envelope OR legacy flat)
 * into the flat in-memory document shape, repairing drift.
 */
export function normalizeDocument(obj: unknown): UPGDocument | UPGPortfolioDocument {
  const raw = obj as Record<string, unknown>
  const header = raw.$upg as UPGHeader | undefined

  // Resolve the metadata regardless of envelope.
  const upg_version = (header?.spec_version ?? raw.upg_version) as string
  const provenance = header?.provenance
  const exported_at = (provenance?.exported_at ?? raw.exported_at) as string | undefined
  const source = provenance
    ? { tool: provenance.tool, tool_version: provenance.tool_version, workspace_id: provenance.workspace_id }
    : (raw.source as UPGDocument['source'])
  // For canonical ($upg) files, integrity lives in `$upg.integrity.body` and is
  // recomputed on every serialise, we deliberately do NOT reconstruct the
  // legacy `_integrity` field here (its checksum uses a different algorithm; a
  // mismatch would falsely flag the file as tampered). Legacy flat files keep
  // their `_integrity` untouched so the existing tamper-detection path is intact.
  const _integrity = header ? undefined : (raw._integrity as UPGDocument['_integrity'])

  const isPortfolioDoc = raw.type === 'portfolio' || header?.kind === 'portfolio' || 'cross_edges' in raw

  if (isPortfolioDoc) {
    const out: UPGPortfolioDocument = {
      upg_version,
      type: 'portfolio',
      exported_at: exported_at ?? '',
      source: (source as UPGPortfolioDocument['source']) ?? { tool: 'unknown' },
      organization: raw.organization as UPGPortfolioDocument['organization'],
      product_areas: (raw.product_areas as UPGPortfolioDocument['product_areas']) ?? [],
      portfolios: (raw.portfolios as UPGPortfolioDocument['portfolios']) ?? [],
      products: ((raw.products as UPGPortfolioDocument['products']) ?? []).map((p) => ({
        ...p,
        nodes: (p.nodes ?? []).map((n) => repairNodeDrift(n)),
        edges: p.edges ?? [],
      })),
      cross_edges: (raw.cross_edges as UPGPortfolioDocument['cross_edges']) ?? [],
    }
    // Registry tier: read back when present, repairing node drift on the
    // canonical entities the same way product nodes are repaired. Absent on
    // legacy portfolios — left undefined so the field stays optional.
    const rawRegistry = raw.registry as
      | { nodes?: UPGBaseNode[]; edges?: UPGEdge[] }
      | undefined
    if (rawRegistry && Array.isArray(rawRegistry.nodes)) {
      out.registry = {
        nodes: rawRegistry.nodes.map((n) => repairNodeDrift(n)),
        ...(Array.isArray(rawRegistry.edges) ? { edges: rawRegistry.edges } : {}),
      }
    }
    return out
  }

  const out: UPGDocument = {
    upg_version,
    exported_at: exported_at ?? '',
    source: (source as UPGDocument['source']) ?? { tool: 'unknown' },
    product: raw.product as UPGDocument['product'],
    nodes: ((raw.nodes as UPGBaseNode[]) ?? []).map((n) => repairNodeDrift(n)),
    edges: (raw.edges as UPGEdge[]) ?? [],
  }
  if (_integrity) out._integrity = _integrity
  return out
}

/**
 * The `upg fmt` operation on raw text: parse (either envelope) → re-serialise
 * canonical. Idempotent: `formatUpgText(formatUpgText(x)) === formatUpgText(x)`.
 */
export function formatUpgText(text: string, opts: SerializeOptions = {}): string {
  return serializeCanonical(parseUpg(text), opts)
}

/** True iff `text` is already in canonical form (used by `upg fmt --check`). */
export function isCanonical(text: string): boolean {
  // Preserve the existing provenance so the check does not flag a benign
  // timestamp/source difference as non-canonical.
  const parsed = parseUpg(text)
  return text === serializeCanonical(parsed)
}
