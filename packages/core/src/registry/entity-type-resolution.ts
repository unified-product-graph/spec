/**
 * Entity-type alias resolution.
 *
 * Resolves a (possibly deprecated) entity-type input to its canonical
 * `UPG_TYPES` member, carrying the `from → to` alias trail when the input
 * was a deprecated synonym.
 *
 * Lives in `core` (rather than `mcp-tooling`) so every consumer (the SDK,
 * the local + cloud MCP servers, the LSP) shares ONE `UnknownEntityTypeError`
 * class. That makes `instanceof` checks instance-safe across package
 * boundaries (the SDK can throw it and a server can catch it), and gives a
 * single canonical resolution path (`get_entity_schema('jtbd') → job`).
 */
import { getReplacementType } from './entity-meta.js'
import { getTypes } from './domains.js'

const TYPES: readonly string[] = getTypes()
const TYPES_SET: ReadonlySet<string> = new Set(TYPES)

/**
 * Result of resolving a (possibly deprecated) entity-type input.
 * - `canonical`: a canonical `UPG_TYPES` member (the input unchanged
 *   when it was already canonical).
 * - `alias`: set when the input was a deprecated synonym. Carries the
 *   `from → to` trail so callers can surface a warning.
 */
export interface EntityTypeResolution {
  canonical: string
  alias?: { from: string; to: string }
}

/**
 * Thrown when the input type is neither canonical nor a known alias.
 * Carries up to 5 Levenshtein-1 suggestions drawn from `UPG_TYPES`.
 */
export class UnknownEntityTypeError extends Error {
  readonly suggestions: string[]
  readonly rawType: string

  constructor(rawType: string, suggestions: string[]) {
    const suffix = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(', ')}?` : ''
    super(`Unknown entity type: "${rawType}".${suffix}`)
    this.name = 'UnknownEntityTypeError'
    this.rawType = rawType
    this.suggestions = suggestions
  }
}

/**
 * True when `a` and `b` are within edit distance 1. Used for near-miss
 * suggestions when the caller passed a typo.
 */
function withinEditDistance1(a: string, b: string): boolean {
  if (a === b) return true
  const al = a.length
  const bl = b.length
  if (Math.abs(al - bl) > 1) return false
  let i = 0
  let j = 0
  let edits = 0
  while (i < al && j < bl) {
    if (a[i] !== b[j]) {
      if (++edits > 1) return false
      if (al > bl) i++
      else if (bl > al) j++
      else {
        i++
        j++
      }
    } else {
      i++
      j++
    }
  }
  if (i < al || j < bl) edits++
  return edits <= 1
}

/**
 * Validate a raw entity-type string from a caller.
 *
 * Two-tier behaviour:
 *   1. Already canonical: return `{ canonical }` unchanged.
 *   2. Deprecated synonym with a known replacement: return
 *      `{ canonical, alias: { from, to } }` so the caller can warn.
 *   3. Otherwise: throw `UnknownEntityTypeError` with up to 5
 *      Levenshtein-1 suggestions.
 *
 * Every UPG consumer resolves raw caller input through this helper before
 * touching the catalog so deprecated synonyms get the same warning
 * treatment everywhere.
 */
export function resolveEntityType(rawType: unknown): EntityTypeResolution {
  if (typeof rawType !== 'string' || rawType.length === 0) {
    throw new UnknownEntityTypeError(String(rawType ?? ''), [])
  }

  if (TYPES_SET.has(rawType)) {
    return { canonical: rawType }
  }

  const replacement = getReplacementType(rawType)
  if (replacement && TYPES_SET.has(replacement)) {
    return { canonical: replacement, alias: { from: rawType, to: replacement } }
  }

  const suggestions: string[] = []
  for (const t of TYPES) {
    if (withinEditDistance1(t, rawType)) suggestions.push(t)
    if (suggestions.length >= 5) break
  }
  throw new UnknownEntityTypeError(rawType, suggestions)
}
