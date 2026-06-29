/**
 * UPG Anti-Pattern Evaluator. Pure function over pre-computed graph stats.
 * Walks `UPG_ANTI_PATTERNS`, evaluates each `structured_condition` against
 * `AntiPatternInputs`, returns the violations.
 *
 * Synchronous. Collectors live per server (`packages/upg-mcp-server/src/lib/anti-pattern-inputs.ts`).
 * Covers every leaf check type in `IntelligenceCondition`; composes recursively.
 *
 * https://unifiedproductgraph.org | MIT
 */

import type {
  IntelligenceCondition,
  EntityCheck,
  RelationshipCheck,
  BenchmarkCheck,
  TotalEntityCountCheck,
  DomainCountCheck,
  DomainPopulationCheck,
  OrphanCheck,
} from './intelligence.js'
import type {
  UPGCuratedAntiPattern,
  UPGAntiPatternSeverity,
} from './anti-patterns.js'
import { UPG_ANTI_PATTERNS } from './anti-patterns.js'
import { getBenchmark } from './benchmarks/index.js'
import type { UPGProductStage } from './benchmarks/types.js'
import { concernFor, concernEvaluatedFor } from './validation-profiles.js'
import type { UPGAntiPatternConcern } from './validation-profiles.js'

// ─── Inputs ──────────────────────────────────────────────────────────────────

/**
 * Pre-computed graph statistics consumed by the evaluator.
 *
 * Per-server collectors derive this from their own store: in-memory walks for
 * the local mcp-server, SQL queries for the cloud server. The evaluator
 * doesn't care which.
 *
 * Severity / id filters live on the evaluator's `options` arg, not here, so
 * callers can re-filter the same inputs without recollecting.
 */
export interface AntiPatternInputs {
  /** Per-type entity counts. Example: `{ persona: 4, job: 2, feature: 0 }` */
  countsByType: Record<string, number>

  /**
   * Per-type counts filtered by `status`. Only required for anti-patterns with
   * a `filter.status` clause (currently 1: `untested-hypothesis-pile-up`).
   * Example: `{ hypothesis: { drafted: 5, active: 2 } }`.
   */
  countsByTypeAndStatus?: Record<string, Record<string, number>>

  /**
   * Per-type counts filtered by a property value (0.17.0). Only required for
   * anti-patterns with a `filter: { property, value }` clause (e.g.
   * `operating-function-without-north-star` counts `metric` where
   * `designation === 'north_star'`). Shape: type → property key → value → count.
   */
  countsByTypeAndProperty?: Record<string, Record<string, Record<string, number>>>

  /**
   * Boolean presence per `(source_type, edge_type, target_type)` tuple.
   * Key format: `${source_type}|${edge_type}|${target_type}`.
   * `true` iff at least one edge of that exact shape exists in the graph.
   */
  edgePresence: Record<string, boolean>

  /**
   * Per-domain population. `true` iff the domain has at least one entity.
   * Example: `{ product_spec: true, validation: false, ... }`.
   */
  domainPopulation: Record<string, boolean>

  /** Total node count in the graph. */
  totalEntityCount: number

  /** Number of distinct domains with at least one entity. */
  domainCount: number

  /** Nodes with zero in-edges AND zero out-edges. */
  orphanCount: number

  /**
   * Active product stage. Used to filter `UPG_ANTI_PATTERNS[i].stages[]`.
   * If undefined, the evaluator runs all patterns regardless of stage gating
   * (safer default: surface everything when stage is unknown).
   */
  productStage?: UPGProductStage

  /**
   * Workspace member kind (0.17.0). Selects the validation profile that decides
   * which anti-pattern concern families are evaluated for this graph. Absent =
   * `product` (evaluate the full product set; back-compat).
   */
  memberKind?: string
}

// ─── Output ──────────────────────────────────────────────────────────────────

/**
 * One fired anti-pattern, lifted from the catalog with prose attached.
 *
 * `target_entities` is filled from the catalog's referenced entity-type
 * strings. Phase 1 keeps these as types; Phase 1.x will promote to specific
 * entity ids once the input collector tracks them.
 */
export interface AntiPatternViolation {
  anti_pattern_id: string
  name: string
  severity: UPGAntiPatternSeverity
  /** The concern family this pattern belongs to (0.17.0). Lets callers partition
   *  fired violations into gating vs advisory per the member-kind profile. */
  concern: UPGAntiPatternConcern
  /** Entity-type strings the catalog references. Phase 1: types, not ids. */
  target_entities: string[]
  description: string
  why_it_matters: string
  remediation: string
  source?: UPGCuratedAntiPattern['source']
}

// ─── Options ─────────────────────────────────────────────────────────────────

export interface EvaluateAntiPatternsOptions {
  /** Filter to one severity tier. */
  severity?: UPGAntiPatternSeverity
  /** Restrict evaluation to a subset of anti-pattern ids. */
  anti_pattern_ids?: string[]
}

// ─── Severity ordering ──────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<UPGAntiPatternSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

// ─── Public entry point ──────────────────────────────────────────────────────

/**
 * Evaluate the curated anti-pattern catalog against a graph's pre-computed
 * stats. Returns the violations, sorted high → medium → low, then by id asc.
 *
 * @param inputs The pre-computed graph stats (see `AntiPatternInputs`).
 * @param options Optional filters: `severity`, `anti_pattern_ids` subset.
 *
 * @example
 *   const violations = evaluateAntiPatterns(inputs)
 *   const highOnly = evaluateAntiPatterns(inputs, { severity: 'high' })
 *   const subset = evaluateAntiPatterns(inputs, {
 *     anti_pattern_ids: ['features-without-hypotheses', 'orphan-loose-thoughts'],
 *   })
 */
export function evaluateAntiPatterns(
  inputs: AntiPatternInputs,
  options?: EvaluateAntiPatternsOptions,
): AntiPatternViolation[] {
  const severityFilter = options?.severity
  const idFilter = options?.anti_pattern_ids
    ? new Set(options.anti_pattern_ids)
    : undefined

  const fires: AntiPatternViolation[] = []
  for (const ap of UPG_ANTI_PATTERNS) {
    // Portfolio-scoped patterns are evaluated by portfolio_validate with
    // cross-product + registry context this single-graph evaluator cannot
    // express. Skip them here so one graph is never flipped invalid by a
    // portfolio pattern. The guard also defends a missing structured_condition.
    if (ap.scope === 'portfolio' || !ap.structured_condition) continue
    if (severityFilter && ap.severity !== severityFilter) continue
    if (idFilter && !idFilter.has(ap.id)) continue
    // Stage gating: when productStage is provided, skip patterns that don't
    // declare it. When undefined, run all (safer default, see docstring).
    if (
      inputs.productStage &&
      !ap.stages.includes(inputs.productStage)
    ) {
      continue
    }
    // Member-kind profile gating (0.17.0): only evaluate the concern families the
    // member kind's profile includes. A product graph (default) evaluates
    // product_spine + universal — the full existing set, so behaviour is
    // unchanged — while an operating_function graph skips product-spine entirely
    // and evaluates the operating spine instead.
    const concern = concernFor(ap.id)
    if (!concernEvaluatedFor(inputs.memberKind, concern)) continue

    if (evaluateCondition(ap.structured_condition, inputs)) {
      fires.push(buildViolation(ap, concern))
    }
  }

  // Stable sort: high → medium → low, then by anti_pattern_id asc.
  fires.sort((a, b) => {
    const sd = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (sd !== 0) return sd
    return a.anti_pattern_id.localeCompare(b.anti_pattern_id)
  })

  return fires
}

// ─── Condition dispatch ──────────────────────────────────────────────────────

function evaluateCondition(
  cond: IntelligenceCondition,
  inputs: AntiPatternInputs,
): boolean {
  if ('check' in cond) {
    return evaluateLeaf(cond.check, inputs)
  }
  // Compound: 'and' | 'or' over `checks: []`.
  if (cond.operator === 'and') {
    for (const child of cond.checks) {
      if (!evaluateCondition(child, inputs)) return false
    }
    return true
  }
  // 'or'
  for (const child of cond.checks) {
    if (evaluateCondition(child, inputs)) return true
  }
  return false
}

type LeafCheck =
  | EntityCheck
  | RelationshipCheck
  | BenchmarkCheck
  | TotalEntityCountCheck
  | DomainCountCheck
  | DomainPopulationCheck
  | OrphanCheck

function evaluateLeaf(check: LeafCheck, inputs: AntiPatternInputs): boolean {
  switch (check.type) {
    case 'entity_count':
      return evaluateEntityCount(check, inputs)
    case 'relationship':
      return evaluateRelationship(check, inputs)
    case 'benchmark':
      return evaluateBenchmark(check, inputs)
    case 'total_entity_count':
      return evaluateTotalEntityCount(check, inputs)
    case 'domain_count':
      return evaluateDomainCount(check, inputs)
    case 'domain_population':
      return evaluateDomainPopulation(check, inputs)
    case 'orphan_count':
      return evaluateOrphanCount(check, inputs)
    default: {
      // Exhaustiveness: if a new check type lands without a handler, this
      // assignment fails to type-check. At runtime, treat as a no-fire.
      const _exhaustive: never = check
      void _exhaustive
      return false
    }
  }
}

// ─── Numeric comparison helper ───────────────────────────────────────────────

type NumericComparison =
  | 'eq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'zero'
  | 'nonzero'

function compareNumber(
  value: number,
  comparison: NumericComparison,
  threshold: number | undefined,
): boolean {
  switch (comparison) {
    case 'zero':
      return value === 0
    case 'nonzero':
      return value !== 0
    case 'eq':
      return threshold !== undefined && value === threshold
    case 'gt':
      return threshold !== undefined && value > threshold
    case 'lt':
      return threshold !== undefined && value < threshold
    case 'gte':
      return threshold !== undefined && value >= threshold
    case 'lte':
      return threshold !== undefined && value <= threshold
    default:
      return false
  }
}

// ─── Per-check type handlers ─────────────────────────────────────────────────

function evaluateEntityCount(
  check: EntityCheck,
  inputs: AntiPatternInputs,
): boolean {
  const filter = check.filter as
    | { status?: unknown; property?: unknown; value?: unknown }
    | undefined

  let count = 0
  if (filter && typeof filter.property === 'string' && typeof filter.value === 'string') {
    // Property-value filter (0.17.0): count entities of this type whose property
    // equals the value, e.g. metric where designation == 'north_star'.
    count = inputs.countsByTypeAndProperty?.[check.entity_type]?.[filter.property]?.[filter.value] ?? 0
  } else if (filter && typeof filter.status === 'string') {
    count = inputs.countsByTypeAndStatus?.[check.entity_type]?.[filter.status] ?? 0
  } else {
    count = inputs.countsByType[check.entity_type] ?? 0
  }
  return compareNumber(count, check.comparison, check.threshold)
}

function relationshipKey(
  source_type: string,
  edge_type: string,
  target_type: string,
): string {
  return `${source_type}|${edge_type}|${target_type}`
}

function evaluateRelationship(
  check: RelationshipCheck,
  inputs: AntiPatternInputs,
): boolean {
  const key = relationshipKey(check.source_type, check.edge_type, check.target_type)
  const present = inputs.edgePresence[key] ?? false
  switch (check.comparison) {
    case 'exists':
      return present
    case 'not_exists':
      return !present
    case 'count_gt':
    case 'count_lt':
      // Phase 1 ships boolean presence only. None of the 12 curated
      // anti-patterns use `count_gt` / `count_lt` against a relationship;
      // promote to per-edge counts when a future pattern needs it.
      return false
    default:
      return false
  }
}

function evaluateBenchmark(
  check: BenchmarkCheck,
  inputs: AntiPatternInputs,
): boolean {
  // Without a productStage, the benchmark range is undefined. Treat as
  // 'no benchmark applicable here, no fire'. The catalog's stages[] gating
  // would normally suppress this anyway; the guard keeps the evaluator pure.
  if (!inputs.productStage) return false
  const range = getBenchmark(check.entity_type, inputs.productStage)
  if (!range) {
    // No expected range at this stage. `'missing'` interprets that as a fire;
    // the other comparisons treat it as "nothing to compare" → no fire.
    return check.comparison === 'missing'
  }
  const count = inputs.countsByType[check.entity_type] ?? 0
  switch (check.comparison) {
    case 'below_min':
      return count < range.min
    case 'above_max':
      return count > range.max
    case 'within_range':
      return count >= range.min && count <= range.max
    case 'missing':
      // Range exists for this stage → not 'missing'.
      return false
    default:
      return false
  }
}

function evaluateTotalEntityCount(
  check: TotalEntityCountCheck,
  inputs: AntiPatternInputs,
): boolean {
  return compareNumber(inputs.totalEntityCount, check.comparison, check.threshold)
}

function evaluateDomainCount(
  check: DomainCountCheck,
  inputs: AntiPatternInputs,
): boolean {
  return compareNumber(inputs.domainCount, check.comparison, check.threshold)
}

function evaluateDomainPopulation(
  check: DomainPopulationCheck,
  inputs: AntiPatternInputs,
): boolean {
  const populated = inputs.domainPopulation[check.domain_id] ?? false
  switch (check.comparison) {
    case 'zero':
      return !populated
    case 'nonzero':
      return populated
    case 'gt':
    case 'lt':
      // Phase 1 ships boolean population only. None of the 12 curated
      // anti-patterns use gt/lt against domain_population.
      return false
    default:
      return false
  }
}

function evaluateOrphanCount(
  check: OrphanCheck,
  inputs: AntiPatternInputs,
): boolean {
  return compareNumber(inputs.orphanCount, check.comparison, check.threshold)
}

// ─── Violation construction ──────────────────────────────────────────────────

function buildViolation(ap: UPGCuratedAntiPattern, concern: UPGAntiPatternConcern): AntiPatternViolation {
  return {
    anti_pattern_id: ap.id,
    name: ap.name,
    severity: ap.severity,
    concern,
    target_entities: collectTargetEntities(ap.structured_condition),
    description: ap.description,
    why_it_matters: ap.why_it_matters,
    remediation: ap.remediation,
    source: ap.source,
  }
}

/**
 * Walk the condition and return the unique entity-type strings it references.
 *
 * Phase 1: target_entities = entity-type strings, not specific ids. Phase 1.x
 * will promote to ids once collectors track them.
 */
function collectTargetEntities(cond: IntelligenceCondition | undefined): string[] {
  const types = new Set<string>()
  if (!cond) return []
  walk(cond)
  return [...types].sort()

  function walk(c: IntelligenceCondition): void {
    if ('check' in c) {
      const leaf = c.check
      if (leaf.type === 'entity_count' || leaf.type === 'benchmark') {
        types.add(leaf.entity_type as string)
      } else if (leaf.type === 'relationship') {
        types.add(leaf.source_type as string)
        types.add(leaf.target_type as string)
      }
      // total_entity_count / domain_count / domain_population / orphan_count
      // don't reference a specific entity type; leave them out.
      return
    }
    for (const child of c.checks) walk(child)
  }
}
