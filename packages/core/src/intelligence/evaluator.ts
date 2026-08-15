/**
 * UPG Anti-Pattern Evaluator. Pure function over pre-computed graph stats.
 * Walks `UPG_ANTI_PATTERNS`, evaluates each `structured_condition` against
 * `AntiPatternInputs`, returns the violations.
 *
 * Synchronous. Collectors live outside this package (`packages/upg-sdk/src/lib/anti-pattern-inputs.ts`).
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
  EdgeCountVsPropertyCheck,
} from './intelligence.js'
import type {
  UPGCuratedAntiPattern,
  UPGAntiPatternSeverity,
} from './anti-patterns.js'
import {
  UPG_ANTI_PATTERNS,
  presenceExceptKey,
  edgeCountSpecKey,
  entityFilterKey,
  checkToEdgeCountSpec,
} from './anti-patterns.js'
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
   * Per-type counts of entities that CARRY a non-empty value for a property
   * (0.27.0). Only required for anti-patterns with a
   * `filter: { property, present }` clause (e.g.
   * `contended-surface-without-arbitration` counts surfaces with NO
   * `arbitration_rule`). Shape: type → property key → count of entities of that
   * type with a value. The evaluator derives the "absent" count by subtracting
   * from `countsByType`, so a collector never has to enumerate absences.
   * Absent input reads as zero, so a stale collector degrades to "nothing
   * carries this property" rather than crashing.
   */
  countsByTypeAndPropertyPresence?: Record<string, Record<string, number>>

  /**
   * As `countsByTypeAndPropertyPresence`, but counted over a population that
   * EXCLUDES entities carrying a declared exemption (0.28.0). Only required for
   * anti-patterns with a `filter: { property, present, except_property,
   * except_value }` clause (currently 1:
   * `contended-surface-without-arbitration`, which exempts surfaces that have
   * declared `composition_mode: 'chained'`).
   *
   * Shape: type → `presenceExceptKey(property, except_property, except_value)`
   * → count of entities of that type that carry a value for `property` AND are
   * NOT exempt. The evaluator derives the absent-and-not-exempt count from this
   * plus `countsByType` and `countsByTypeAndProperty`, so collectors still
   * never enumerate absences.
   *
   * Collectors build it by walking `UPG_PRESENCE_EXCEPT_SPECS` rather than
   * indexing property pairs speculatively, which would be quadratic in
   * properties-per-node for the benefit of one detector. Absent input reads as
   * zero, which makes a stale collector OVER-report (every non-exempt entity
   * reads as missing the property) rather than silently under-report — the safe
   * direction for a check whose job is to notice omissions.
   */
  countsByTypeAndPropertyPresenceExcept?: Record<string, Record<string, number>>

  /**
   * Node ids matching each declared per-node edge-count check (0.29.0). Shape:
   * `edgeCountSpecKey(spec)` → the ids of the nodes that matched.
   *
   * The COUNT is the array length, so this input carries both halves of the
   * check: what fired, and which nodes it fired about. Collectors build it by
   * walking `UPG_EDGE_COUNT_SPECS`, never speculatively.
   *
   * A SEEDED-BUT-EMPTY entry and a MISSING entry mean different things, and
   * collectors must keep them distinct. Empty means "nothing matched" and the
   * check clears. Missing means "this collector predates the spec", and the
   * evaluator falls back to assuming every node of the type matched, preserving
   * the 0.28.0 property that a stale collector over-reports rather than
   * silently retiring the detector. Attribution stays empty on that path: a
   * fabricated node id is worse than an unattributed violation.
   */
  nodesByEdgeCountSpec?: Record<string, string[]>

  /**
   * Node ids matching each declared `entity_count` filter (0.29.0), for
   * ATTRIBUTION ONLY. Shape: `entityFilterKey(entity_type, filter)` → ids.
   *
   * Counts are unaffected: every `entity_count` comparison still reads the
   * aggregate tallies above, exactly as it did before this input existed. This
   * runs alongside purely so a fired violation can name nodes, which means a
   * collector that omits it loses attribution and changes no verdict.
   *
   * Bounded by declaration, like every other spec-driven input here: the whole
   * catalog declares five filters, so this is a handful of predicate
   * evaluations per node rather than an index over every property.
   */
  nodesByEntityFilter?: Record<string, string[]>

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
  /**
   * The specific nodes this violation is about (0.29.0), where the fired
   * condition could name them. Sorted, deduplicated, and drawn only from the
   * branches that actually contributed to the fire.
   *
   * ABSENT MEANS "THIS DETECTOR CANNOT NAME NODES", NOT "NO NODES". Most
   * patterns here are whole-graph approximations of per-node rules: they
   * compare aggregate tallies against constants, so they can say a graph has a
   * problem without knowing where it lives. Only checks that evaluate nodes one
   * at a time attribute, plus the declared `entity_count` filters.
   *
   * ATTRIBUTION IS PARTIAL, AND PARTIAL PER TYPE. A violation may name nodes of
   * one type while saying nothing about another type in `target_entities`: the
   * contention detector names surfaces and never the features occupying them,
   * though both types appear there. So a consumer must NOT read a non-empty
   * list as "these are the only implicated entities".
   *
   * The contract for a reverse lookup is: this list is authoritative for the
   * types it actually covers, and silent about every other type, which must
   * keep resolving through `target_entities`. Reading it as globally
   * authoritative makes entities of the uncovered types unreachable, which is
   * a reachability regression dressed up as precision.
   *
   * Optional so every existing consumer keeps compiling and behaving as before.
   */
  target_node_ids?: string[]
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
      // Attribution runs as a SECOND walk, only on patterns that actually
      // fired. Keeping it out of `evaluateCondition` means the verdict path is
      // byte-identical to its pre-0.29.0 behaviour: attribution can be wrong,
      // absent or stale without ever changing whether a pattern fires.
      const ids = new Set<string>()
      collectAttribution(ap.structured_condition, inputs, ids)
      const violation = buildViolation(ap, concern)
      if (ids.size > 0) violation.target_node_ids = [...ids].sort()
      fires.push(violation)
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

// ─── Attribution ─────────────────────────────────────────────────────────────

/**
 * Walk a FIRED condition tree and collect the node ids the fire is about.
 *
 * Only called after the pattern has already fired, so this never influences a
 * verdict. Two rules decide what contributes:
 *
 *  1. ONLY TRUE BRANCHES. Under `or`, a branch that did not fire says nothing
 *     about any node, so its ids stay out. Under `and`, every child is true by
 *     construction, so every attributing child contributes.
 *  2. ONLY ACCUSING CHECKS. An unfiltered `entity_count` ("this graph has
 *     surfaces") is a population GATE, not an accusation, and attributing every
 *     surface to a violation because the gate passed would reproduce the exact
 *     "whole roster stays lit" problem attribution exists to fix. So bare
 *     counts, relationship shapes, benchmarks and graph-shape checks attribute
 *     nothing; filtered `entity_count` checks and `edge_count_vs_property`
 *     checks attribute.
 */
function collectAttribution(
  cond: IntelligenceCondition,
  inputs: AntiPatternInputs,
  out: Set<string>,
): void {
  if ('operator' in cond) {
    for (const child of cond.checks) {
      // Rule 1: under `or`, skip branches that did not themselves fire.
      if (cond.operator === 'or' && !evaluateCondition(child, inputs)) continue
      collectAttribution(child, inputs, out)
    }
    return
  }
  const check = cond.check
  if (check.type === 'edge_count_vs_property') {
    const key = edgeCountSpecKey(checkToEdgeCountSpec(check))
    for (const id of inputs.nodesByEdgeCountSpec?.[key] ?? []) out.add(id)
    return
  }
  if (check.type === 'entity_count' && check.filter) {
    // Rule 2: filtered counts accuse; bare counts gate.
    const key = entityFilterKey(check.entity_type, check.filter)
    for (const id of inputs.nodesByEntityFilter?.[key] ?? []) out.add(id)
  }
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
  | EdgeCountVsPropertyCheck

function evaluateLeaf(check: LeafCheck, inputs: AntiPatternInputs): boolean {
  switch (check.type) {
    case 'entity_count':
      return evaluateEntityCount(check, inputs)
    case 'edge_count_vs_property':
      return evaluateEdgeCountVsProperty(check, inputs)
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
    | {
        status?: unknown
        property?: unknown
        value?: unknown
        present?: unknown
        except_property?: unknown
        except_value?: unknown
      }
    | undefined

  let count = 0
  if (
    filter &&
    typeof filter.property === 'string' &&
    typeof filter.present === 'boolean' &&
    typeof filter.except_property === 'string' &&
    typeof filter.except_value === 'string'
  ) {
    // Except-qualified presence filter (0.28.0): as the presence filter below,
    // but entities carrying the declared exemption are removed from BOTH sides
    // of the subtraction first. Checked before the plain presence form because
    // it is a strict refinement of it.
    //
    // eligible  = (all of type) - (those declaring the exemption)
    // withValue = those carrying the property, exemption-holders already excluded
    //             (the collector counts over the eligible population)
    const key = presenceExceptKey(filter.property, filter.except_property, filter.except_value)
    const exempt =
      inputs.countsByTypeAndProperty?.[check.entity_type]?.[filter.except_property]?.[
        filter.except_value
      ] ?? 0
    const eligible = Math.max(0, (inputs.countsByType[check.entity_type] ?? 0) - exempt)
    const withValue =
      inputs.countsByTypeAndPropertyPresenceExcept?.[check.entity_type]?.[key] ?? 0
    count = filter.present ? Math.min(withValue, eligible) : Math.max(0, eligible - withValue)
  } else if (filter && typeof filter.property === 'string' && typeof filter.present === 'boolean') {
    // Property-presence filter (0.27.0): count entities of this type that DO
    // (present: true) or DO NOT (present: false) carry a non-empty value for
    // the named property. The absence form is the one a value-keyed filter
    // cannot express, because the collector only indexes values that exist;
    // it is derived as (all of type) - (those carrying a value).
    const withValue =
      inputs.countsByTypeAndPropertyPresence?.[check.entity_type]?.[filter.property] ?? 0
    count = filter.present
      ? withValue
      : Math.max(0, (inputs.countsByType[check.entity_type] ?? 0) - withValue)
  } else if (filter && typeof filter.property === 'string' && typeof filter.value === 'string') {
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

/**
 * Per-node edge-count check (0.29.0). The collector has already done the
 * per-node arithmetic and handed us the ids that matched; the evaluator's job
 * is only the aggregate comparison over how many there were.
 *
 * The division of labour matters for projection (0.30.0): because the matching
 * happens in the collector, over whatever node and edge set the collector was
 * given, running this check against one configuration of a graph costs nothing
 * beyond building the collector on a filtered store. A check that reached past
 * the collector to the live store would be permanently blind to that.
 */
function evaluateEdgeCountVsProperty(
  check: EdgeCountVsPropertyCheck,
  inputs: AntiPatternInputs,
): boolean {
  const key = edgeCountSpecKey(checkToEdgeCountSpec(check))
  const matched = inputs.nodesByEdgeCountSpec?.[key]
  if (matched === undefined) {
    // STALE COLLECTOR, not an honest zero. Collectors SEED every declared spec
    // with an empty array before walking, precisely so these two cases are
    // distinguishable: a present-but-empty entry means "nothing matched", a
    // missing entry means "this collector predates the spec and computed
    // nothing". Reading the second as zero would silently retire the check
    // against any older collector in the tree.
    //
    // So fall back to the worst case the aggregate tallies can support: assume
    // every node of the type matched. That preserves the 0.28.0 property that a
    // stale collector OVER-reports rather than under-reporting, which is the
    // safe failure for a detector whose job is noticing omissions. Attribution
    // deliberately yields nothing in this path: the ids would be guesses, and a
    // fabricated node id is worse than an unattributed violation.
    return compareNumber(
      inputs.countsByType[check.entity_type] ?? 0,
      check.comparison,
      check.threshold,
    )
  }
  return compareNumber(matched.length, check.comparison, check.threshold)
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
 * This is what fills `target_entities`, so it is the type half of every
 * consumer's reachability. A check form missing from the walk produces a
 * violation nothing can find by type, which is why the walk is exported: it is
 * testable in isolation, against conditions built to defeat the masking that
 * hides an omission inside a real multi-check pattern.
 */
export function collectTargetEntities(cond: IntelligenceCondition | undefined): string[] {
  const types = new Set<string>()
  if (!cond) return []
  walk(cond)
  return [...types].sort()

  function walk(c: IntelligenceCondition): void {
    if ('check' in c) {
      const leaf = c.check
      if (
        leaf.type === 'entity_count' ||
        leaf.type === 'benchmark' ||
        leaf.type === 'edge_count_vs_property'
      ) {
        types.add(leaf.entity_type as string)
      } else if (leaf.type === 'relationship') {
        types.add(leaf.source_type as string)
        types.add(leaf.target_type as string)
      }
      // total_entity_count / domain_count / domain_population / orphan_count
      // don't reference a specific entity type; leave them out.
      //
      // `edge_count_vs_property` DOES name one and must be listed above. It is
      // currently masked in the one pattern that uses it, whose sibling checks
      // already contribute `surface`, but a pattern whose only typed check is
      // this form would otherwise report an EMPTY target_entities: no type
      // match, and so unreachable through the type half of any consumer. Every
      // check that names an entity type belongs here, mask or no mask.
      return
    }
    for (const child of c.checks) walk(child)
  }
}
