/**
 * Regenerate `src/frameworks/canonical.ts` from the authored definitions.
 *
 * `canonical.ts` is the PUBLIC surface: the curated 34 frameworks re-exported
 * from the package root. They are authored in `src/frameworks/definitions/*.ts`
 * (the full ~182-framework research catalog) and *promoted* into `canonical.ts`
 * one at a time. This script performs that promotion: it preserves the exact
 * set and order of framework ids already in `canonical.ts`, and re-emits each
 * one from its current authored definition — so edits to a definition file flow
 * into the published surface with a single command.
 *
 * Run: tsx scripts/regen-canonical-frameworks.ts   (or: npm run regen:canonical)
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
 * The 34 famous, battle-tested product frameworks that anchor the public
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
writeFileSync(CANONICAL_PATH, header + body + footer)
console.log(`Regenerated canonical.ts with ${frameworks.length} frameworks.`)
