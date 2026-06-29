/**
 * Per-member-kind validation profiles (0.17.0).
 *
 * A workspace member graph is graded against a profile chosen by its
 * `member_kind`. Before 0.17.0 the only kind-aware behaviour was a single
 * hard-coded `member_kind === 'watched'` branch in the MCP `validate_graph`
 * tool that demoted ALL anti-pattern violations wholesale; `org_rollup` got no
 * relaxation, and the cloud server had no equivalent. This module lifts that into
 * the spec core as a table so every consumer (local MCP, cloud MCP, the site)
 * grades each kind the same way, and a new kind is a row, not a bespoke branch.
 *
 * Two axes per profile:
 * - `evaluate_concerns` — which anti-pattern concern families are RUN + reported.
 * - `gating_concerns` — the subset whose fired violations flip `valid` (the rest
 *   are advisory: reported, non-gating).
 *
 * The concern of each curated anti-pattern is looked up by id from
 * `UPG_ANTI_PATTERN_CONCERNS` (kept here rather than inline on each pattern so the
 * whole classification reads in one place). Unlisted ids default to
 * `product_spine`. Portfolio-scoped patterns are unlisted — the single-graph
 * evaluator skips them regardless.
 *
 * https://unifiedproductgraph.org | MIT
 */

/**
 * The concern family an anti-pattern belongs to — the axis a per-member-kind
 * profile switches on.
 * - `product_spine` — presupposes a shippable product (personas/jobs, features/
 *   hypotheses, roadmap→outcome, competitors, journeys). A category error for a
 *   non-product graph.
 * - `universal` — kind-independent: graph hygiene (orphans, single-domain) and
 *   strategy discipline (objectives→key results). Applies to every kind.
 * - `operating` — operating_function expectation (a metric to operate toward,
 *   real operating content). Only meaningful for that kind.
 */
export type UPGAntiPatternConcern = 'product_spine' | 'universal' | 'operating'

/** Member-kind keys for the profile table. Mirrors the `member_kind` union on
 *  `UPGDocument`; kept as a local literal because the SDK's `UPG_MEMBER_KINDS`
 *  const is downstream of the spec core. */
export type UPGMemberKindKey = 'product' | 'org_rollup' | 'watched' | 'operating_function'

/**
 * Concern family per curated anti-pattern id. Unlisted ids default to
 * `product_spine` (the conservative classification: gated for product, suppressed
 * for operating_function). The single-graph evaluator skips portfolio-scoped
 * patterns, so they are intentionally absent here.
 */
export const UPG_ANTI_PATTERN_CONCERNS: Readonly<Record<string, UPGAntiPatternConcern>> = {
  // universal — kind-independent graph hygiene + strategy discipline
  'objective-without-key-results': 'universal',
  'single-domain-graph': 'universal',
  'orphan-loose-thoughts': 'universal',
  // operating — only evaluated for operating_function graphs
  'operating-function-without-north-star': 'operating',
  'operating-function-without-operating-content': 'operating',
  // everything else defaults to 'product_spine'
}

/** The concern family for a curated anti-pattern id (default `product_spine`). */
export function concernFor(antiPatternId: string): UPGAntiPatternConcern {
  return UPG_ANTI_PATTERN_CONCERNS[antiPatternId] ?? 'product_spine'
}

export interface UPGValidationProfile {
  /** Concern families whose patterns are EVALUATED (run + reported) for this kind. */
  evaluate_concerns: readonly UPGAntiPatternConcern[]
  /** Concern families whose fired violations GATE `valid` (a subset of `evaluate_concerns`). */
  gating_concerns: readonly UPGAntiPatternConcern[]
}

/**
 * The per-member-kind validation profile table.
 *
 * - `product` — the default; evaluates and gates the full product set. Identical
 *   to pre-0.17.0 behaviour.
 * - `watched` — a monitored competitor-intelligence graph: product-thinking
 *   patterns are category errors, so everything is advisory (gates nothing).
 *   Reproduces the old hard-coded watched suppression, now in the core.
 * - `org_rollup` — the company umbrella: product-spine is a category error
 *   (advisory) but universal hygiene still gates. (Pre-0.17.0 it incorrectly
 *   gated product-spine too.)
 * - `operating_function` — a function a team operates: product-spine is not even
 *   evaluated (no noise); universal hygiene and the operating spine gate.
 */
export const UPG_VALIDATION_PROFILES: Readonly<Record<UPGMemberKindKey, UPGValidationProfile>> = {
  product: { evaluate_concerns: ['product_spine', 'universal'], gating_concerns: ['product_spine', 'universal'] },
  watched: { evaluate_concerns: ['product_spine', 'universal'], gating_concerns: [] },
  org_rollup: { evaluate_concerns: ['product_spine', 'universal'], gating_concerns: ['universal'] },
  operating_function: { evaluate_concerns: ['universal', 'operating'], gating_concerns: ['universal', 'operating'] },
}

/** Resolve a member kind to its profile; unknown/absent kinds fall back to
 *  `product` (gate-everything) for back-compat safety. */
export function validationProfileFor(kind: string | undefined): UPGValidationProfile {
  return UPG_VALIDATION_PROFILES[(kind ?? 'product') as UPGMemberKindKey] ?? UPG_VALIDATION_PROFILES.product
}

/** Is an anti-pattern of this concern EVALUATED (run + reported) for this kind? */
export function concernEvaluatedFor(kind: string | undefined, concern: UPGAntiPatternConcern): boolean {
  return validationProfileFor(kind).evaluate_concerns.includes(concern)
}

/** Does a fired violation of this concern GATE `valid` for this kind? */
export function concernGatesFor(kind: string | undefined, concern: UPGAntiPatternConcern): boolean {
  return validationProfileFor(kind).gating_concerns.includes(concern)
}

// ─── Thin-graph softening (0.17.0, companion C) ──────────────────────────────

/**
 * Coverage / benchmark anti-patterns that presuppose a graph has grown enough to
 * expect breadth (multiple domains, several personas, a competitor set). On a
 * brand-new thin graph they fire as false alarms — a 3-node stub is not the same
 * as a drifted product. Below `THIN_GRAPH_THRESHOLD` total entities these are
 * demoted to advisory (reported, non-gating) for every member kind, so an
 * intentionally-thin stub is not indistinguishable from drift.
 */
export const COVERAGE_ANTI_PATTERNS: ReadonlySet<string> = new Set([
  'single-domain-graph',
  'persona-count-below-stage-benchmark',
  'competitors-missing-past-validation',
])

/** A graph with fewer than this many entities is treated as too thin to grade on
 *  coverage breadth. */
export const THIN_GRAPH_THRESHOLD = 8

/** True when a fired coverage anti-pattern should be advisory (not gating) because
 *  the graph is still too thin to expect breadth. */
export function isThinCoverageAdvisory(antiPatternId: string, totalEntityCount: number): boolean {
  return COVERAGE_ANTI_PATTERNS.has(antiPatternId) && totalEntityCount < THIN_GRAPH_THRESHOLD
}
