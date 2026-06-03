/**
 * frameworks/: Layer 4c: Framework Library.
 *
 * The public surface ships the **canonical frameworks** in
 * `canonical.ts`: famous, universally-taught product frameworks curated
 * for editorial confidence (42 at present; promoted one at a time).
 *
 * `definitions/` is the single source of truth for framework content: the
 * full research catalog (~182 additional definitions) plus the canonical
 * subset. It is used by internal consumers (label vocabulary, tier-1 wiring
 * tests, the shape audit), excluded from public mirrors via
 * `scripts/sync-oss-repos.sh`, and not re-exported from the package entry
 * point. `canonical.ts` is a generated projection of `definitions/`:
 * frameworks are promoted into it one at a time as each is reviewed; see
 * `scripts/regen-canonical-frameworks.ts` (`npm run regen:canonical`).
 */

export * from './types.js'
export * from './categories.js'
export * from './validate.js'
export * from './canonical.js'
