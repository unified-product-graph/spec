/**
 * UPG Benchmark type definitions.
 */

import type { UPGEntityType } from '../../catalog/entity-catalog.js'
import type { UPGDomainId } from '../../registry/domains.js'
import type { UPGProductStage } from '../../shapes/document.js'

// ─── Benchmark source: controlled vocabulary ────────────────────────

/**
 * Where a benchmark's range or expectation comes from.
 *
 * Structured so consumers can do "show me every Lean Startup benchmark" or
 * "show me every industry-standard DevOps expectation" without regex-matching
 * against free-form strings. Each variant carries enough metadata to render
 * the citation inline without further lookup.
 *
 * @example { kind: 'book', citation: 'The Lean Startup, Eric Ries (2011), ch. 7' }
 * @example { kind: 'practitioner', attribution: 'Teresa Torres, Continuous Discovery Habits' }
 * @example { kind: 'industry_practice', category: 'devops' }
 * @example { kind: 'fundamental' }
 */
export type UPGBenchmarkSource =
  /** Cited from a named book or published work. */
  | { kind: 'book'; citation: string }
  /** Attributed to a specific practitioner or method author. */
  | { kind: 'practitioner'; attribution: string }
  /**
   * Generally accepted industry practice rather than one citation.
   * `category` groups the benchmark by discipline (agile, devops, security,
   * voice_of_customer, etc.) so consumers can filter by space.
   */
  | { kind: 'industry_practice'; category: string }
  /** Definitional: true by the spec's own construction, not externally sourced. */
  | { kind: 'fundamental' }

// Canonical product stages re-exported for consumer convenience.
export type { UPGProductStage } from '../../shapes/document.js'

/** Ordered stages from earliest to latest (canonical 9-stage model) */
export const UPG_PRODUCT_STAGES = [
  'concept', 'validation', 'build', 'beta', 'launch',
  'growth', 'mature', 'maintenance', 'sunset',
] as const satisfies readonly UPGProductStage[]

// Type-level guard: the runtime tuple must exhaustively cover UPGProductStage.
// If a stage is added to UPGProductStage in shapes/document.ts without being
// added to UPG_PRODUCT_STAGES above (or vice versa), one of these lines fails.
type _UPGProductStagesMissing = Exclude<UPGProductStage, typeof UPG_PRODUCT_STAGES[number]>
type _UPGProductStagesExtra = Exclude<typeof UPG_PRODUCT_STAGES[number], UPGProductStage>
const _assertStagesComplete: [_UPGProductStagesMissing] extends [never] ? true : never = true
const _assertStagesNoExtra: [_UPGProductStagesExtra] extends [never] ? true : never = true
void _assertStagesComplete
void _assertStagesNoExtra

export type StageRange = { min: number; max: number } | null

export interface CountBenchmark {
  /** The entity type this benchmark applies to */
  type: UPGEntityType
  /** The domain this entity type belongs to */
  domain: UPGDomainId
  /** Expected range per stage. null = not expected at this stage */
  concept: StageRange
  /** Expected count range at the validation stage */
  validation: StageRange
  /** Expected count range at the build stage */
  build: StageRange
  /** Expected count range at the beta stage */
  beta: StageRange
  /** Expected count range at the launch stage */
  launch: StageRange
  /** Expected count range at the growth stage */
  growth: StageRange
  /** Expected count range at the mature stage */
  mature: StageRange
  /** Expected count range at the maintenance stage */
  maintenance: StageRange
  /** Expected count range at the sunset stage */
  sunset: StageRange
  /** Attribution for this benchmark's expected ranges */
  source: UPGBenchmarkSource
  /** Why this benchmark exists and how the ranges were determined */
  rationale: string
}

export interface RelationshipBenchmark {
  /** The parent entity type in the relationship */
  parent_type: UPGEntityType
  /** The child entity type connected to the parent */
  child_type: UPGEntityType
  /** Minimum children per parent */
  min_per_parent: number
  /** Stages where this relationship is expected */
  stages: UPGProductStage[]
  /** Attribution for this benchmark's expected relationship counts */
  source: UPGBenchmarkSource
  /** Why this relationship benchmark exists and how the threshold was set */
  rationale: string
}

export interface RatioBenchmark {
  /** Human-readable identifier for this ratio (e.g. "hypothesis-to-experiment") */
  name: string
  /** Entity type(s) forming the numerator of the ratio */
  numerator_type: UPGEntityType | UPGEntityType[]
  /** Entity type(s) forming the denominator of the ratio */
  denominator_type: UPGEntityType | UPGEntityType[]
  /** Minimum acceptable ratio value. Below this signals an imbalance. */
  expected_min: number
  /** Stages where this ratio is meaningful and should be evaluated */
  stages: UPGProductStage[]
  /** Attribution for this ratio benchmark */
  source: UPGBenchmarkSource
  /** Why this ratio matters and how the minimum was determined */
  rationale: string
}

export interface DomainActivation {
  /** The domain being activated */
  domain_id: UPGDomainId
  /** At which stage should this domain have at least 1 entity? */
  expected_from: UPGProductStage
  /** At which stage should this domain be well-populated? */
  expected_mature: UPGProductStage
  /** Attribution for this domain activation expectation */
  source: UPGBenchmarkSource
  /** Why this domain activation timing is expected */
  rationale: string
}
