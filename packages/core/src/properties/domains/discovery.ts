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
export interface OpportunityProperties {
  /** How many users experience this problem */
  reach?: UPGAssessment
  /** How often users experience this problem */
  frequency?: UPGAssessment
  /** How painful it is when unaddressed */
  pain?: UPGAssessment
  /** Computed: normalized_reach x normalized_frequency x normalized_pain (0-1) */
  opportunity_score?: number
}

/** A proposed response to an opportunity
 *
 * @example
 * const properties: SolutionProperties = {
 *   timeline: 'Kickoff 2026-04-22, results by 2026-05-15.',
 *   reach: 4,
 *   impact: 4,
 * }
 */
export interface SolutionProperties {
  /** Estimated delivery or target timeline */
  timeline?: string
  /** How many users this solution reaches (1 = few, 5 = most) */
  reach?: UPGAssessment
  /** Expected impact on the target outcome (1 = minimal, 5 = transformative) */
  impact?: UPGAssessment
  /** How confident the team is in this solution (1 = speculative, 5 = proven) */
  confidence?: UPGAssessment
  /** Level of effort required to implement (1 = trivial, 5 = very large) */
  effort?: UPGAssessment
  /** Computed: (reach × impact × confidence) / effort */
  rice_score?: number
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
