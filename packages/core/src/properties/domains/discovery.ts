/**
 * UPG Property Schemas: Discovery Domain
 *
 * Opportunity, Solution, FeasibilityStudy, DesignSprint entity properties.
 *
 * Part of the Unified Product Graph specification.
 * https://unifiedproductgraph.org/spec
 * License: MIT
 */

import type { UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// DISCOVERY
// ---------------------------------------------------------------------------

/** A problem worth solving, grounded in user need and business value
 *
 * @example
 * const properties: OpportunityProperties = {
 *   reach: 4,
 *   frequency: 'monthly',
 *   pain: 4,
 * }
 */
/**
 * Opportunity carries no intrinsic scalar properties: it is defined by its
 * title/description and its edges (to the problems/needs it addresses and the
 * solutions proposed against it). Its former scoring inputs (`reach`,
 * `frequency`, `pain`, `opportunity_score`) were framework-scoped from 0.9.0 —
 * they live on the `framework_exercise` includes-edge of the `opportunity-sizing`
 * framework, not on the entity. Removed from the schema in 0.14.0.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OpportunityProperties {}

/** A proposed response to an opportunity
 *
 * @example
 * const properties: SolutionProperties = {
 *   timeline: 'Kickoff 2026-04-22, results by 2026-05-15.',
 * }
 *
 * RICE scoring inputs (`reach`, `impact`, `confidence`, `effort`) and the
 * computed `rice_score` were framework-scoped from 0.9.0 and removed from the
 * schema in 0.14.0: apply the `rice-scoring` framework and read the
 * score off the `framework_exercise` includes-edge, not the entity.
 */
export interface SolutionProperties {
  /** Estimated delivery or target timeline */
  timeline?: string
}

// ---------------------------------------------------------------------------
// DISCOVERY EXPANSION
// ---------------------------------------------------------------------------

/** FeasibilityStudy entity.
 *
 * @example
 * const properties: FeasibilityStudyProperties = {
 *   study_type: 'technical',
 *   conclusion: 'feasible',
 *   confidence: 'medium',
 * }
 */
export interface FeasibilityStudyProperties {
  /**
   * Type of feasibility being assessed.
   * @example "technical" for assessing engineering viability
   */
  study_type?: 'technical' | 'business' | 'market' | 'resource'
  /** Outcome conclusion of the study */
  conclusion?: 'feasible' | 'not_feasible' | 'conditional' | 'needs_more_data'
  /** Confidence in the conclusion (UPGAssessment on `confidence_5`). */
  confidence?: UPGAssessment
}

/** DesignSprint entity.
 *
 * @example
 * const properties: DesignSprintProperties = {
 *   duration: '5 days',
 *   challenge: 'Cut time-to-first-committed-decision from 7 days to 2.',
 * }
 */
export interface DesignSprintProperties {
  /**
   * Duration of the sprint.
   * @example "5 days"
   */
  duration?: string
  /** The core challenge the sprint addresses */
  challenge?: string
}
