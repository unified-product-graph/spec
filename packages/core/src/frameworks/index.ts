/**
 * frameworks/: Layer 4c: Framework Library.
 *
 * The public surface ships the **canonical frameworks** in
 * `canonical.ts`: famous, universally-taught product frameworks curated
 * for editorial confidence (42 at present; promoted one at a time).
 *
 * The full research catalog (~182 additional definitions) lives in
 * `definitions/` and is used by internal consumers (label vocabulary,
 * tier-1 wiring tests). It is excluded from public mirrors via
 * `scripts/sync-oss-repos.sh` and is not re-exported from the package
 * entry point. Frameworks are promoted into `canonical.ts` one at a time
 * as each is reviewed; see `scripts/regen-canonical-frameworks.mjs`.
 */

export * from './types.js'
export * from './categories.js'
export * from './validate.js'
export * from './canonical.js'
