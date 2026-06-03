/**
 * Regenerate `src/frameworks/canonical.ts` from the authored definitions.
 *
 * `definitions/` is the SINGLE SOURCE OF TRUTH for framework content.
 * `canonical.ts` is the PUBLIC surface: the curated subset re-exported from the
 * package root and shipped by `@unified-product-graph/core`. It is a generated
 * projection of `definitions/` — it preserves the exact set and order of
 * framework ids already declared in `canonical.ts` and re-emits each one from
 * its current authored definition, so an edit to a definition file flows into
 * the published surface with a single command. Never hand-edit a framework body
 * in canonical.ts; edit the definition and regenerate.
 *
 * Run:   npm run regen:canonical      (writes canonical.ts)
 * Check: npm run check:canonical      (--check: fails if canonical.ts is stale,
 *                                       writes nothing)
 *
 * `--check` is the sync gate: it computes what canonical.ts *should* be from the
 * current definitions and exits non-zero if the committed file differs. It is
 * wired into core's `prepublishOnly`, so a drifted canonical can never be
 * published — which is what lets `definitions/` be the one source of truth.
 *
 * To promote a NEW framework into the canonical set, add its id to the array in
 * canonical.ts (anywhere, in the order you want) and re-run; the body is filled
 * from definitions automatically.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { UPG_FRAMEWORKS_BY_ID as DEFS_BY_ID } from '../src/frameworks/definitions/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CANONICAL_PATH = join(__dirname, '..', 'src', 'frameworks', 'canonical.ts')

// ── 1. Extract the ordered list of canonical ids from the current file ──
const current = readFileSync(CANONICAL_PATH, 'utf8')
const arrayBody = current.split('] as UPGFramework[]')[0]
// Match ONLY top-level framework ids: a JSON.stringify(arr, null, 2) framework
// object key sits at exactly 4-space indent. Nested `id` fields (e.g. inside
// structure.stages) are deeper-indented and must not be picked up.
const ids = [...arrayBody.matchAll(/^ {4}"id": "([^"]+)"/gm)].map((m) => m[1])
if (ids.length === 0) {
  throw new Error('No framework ids found in canonical.ts — aborting to avoid wiping the file.')
}

// ── 2. Pull the fresh authored definition for each id ──
const missing: string[] = []
const frameworks = ids.map((id) => {
  const def = DEFS_BY_ID[id]
  if (!def) {
    missing.push(id)
    return null
  }
  return def
})
if (missing.length > 0) {
  throw new Error(
    `Canonical ids missing from definitions/ (cannot promote): ${missing.join(', ')}`,
  )
}

// ── 3. Re-emit canonical.ts (header + JSON literals + derived exports) ──
const header = `/**
 * Canonical Framework Library: v1 public surface.
 *
 * The famous, battle-tested product frameworks that anchor the public
 * Unified Product Graph framework catalog. Curated for editorial confidence
 * over breadth: every name here is universally recognised and actively
 * taught in product education.
 *
 * The fuller research catalog (~182 additional definitions) lives in the
 * \`definitions/\` directory and is promoted into this canonical set
 * incrementally as each framework is reviewed and validated.
 *
 * THIS FILE IS GENERATED. See scripts/regen-canonical-frameworks.ts.
 */

import type { UPGFramework } from './types.js'

export const UPG_FRAMEWORKS: UPGFramework[] = `

const footer = ` as UPGFramework[]

/** Framework lookup by ID */
export const UPG_FRAMEWORKS_BY_ID: Record<string, UPGFramework> = Object.fromEntries(
  UPG_FRAMEWORKS.map((fw) => [fw.id, fw]),
)

/** Frameworks grouped by category */
export const UPG_FRAMEWORKS_BY_CATEGORY: Record<string, UPGFramework[]> = {}
for (const fw of UPG_FRAMEWORKS) {
  if (!UPG_FRAMEWORKS_BY_CATEGORY[fw.category]) UPG_FRAMEWORKS_BY_CATEGORY[fw.category] = []
  UPG_FRAMEWORKS_BY_CATEGORY[fw.category].push(fw)
}
`

const body = JSON.stringify(frameworks, null, 2)
const output = header + body + footer

// ── 4. Either check sync (gate mode) or write (regen mode) ──
if (process.argv.includes('--check')) {
  if (current !== output) {
    console.error(
      'canonical.ts is OUT OF SYNC with definitions/.\n' +
        'A framework body in canonical.ts no longer matches its definition\n' +
        '(or a definition changed without regenerating). canonical.ts is generated:\n' +
        'fix the source in definitions/ and run `npm run regen:canonical`, then commit.',
    )
    process.exit(1)
  }
  console.log(`canonical.ts in sync with definitions/ (${frameworks.length} frameworks).`)
} else {
  writeFileSync(CANONICAL_PATH, output)
  console.log(`Regenerated canonical.ts with ${frameworks.length} frameworks.`)
}
