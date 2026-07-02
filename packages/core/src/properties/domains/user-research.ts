/**
 * UPG Property Schemas: User Research Domain.
 * ResearchStudy, Observation, Quote, InsightProperties, AffinityCluster,
 * ResearchQuestion, InterviewGuide, SurveyResponse, Participant.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ISODate, Priority, SignalSentiment, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// USER RESEARCH
// ---------------------------------------------------------------------------

/** Structured user research activity.
 *
 * @example
 * const properties: ResearchStudyProperties = {
 *   method: 'interview',
 *   participant_count: 8,
 *   start_date: '2026-04-01',
 * }
 */
export interface ResearchStudyProperties {
  /** Research method used to conduct the study */
  method?: 'interview' | 'usability' | 'survey' | 'diary' | 'analytics'
  /** Number of participants recruited or observed */
  participant_count?: number
  /** ISO date when the study starts */
  start_date?: ISODate
  /** ISO date when the study ends */
  end_date?: ISODate
}

/** Research participant.
 *
 * @example
 * const properties: ParticipantProperties = {
 *   alias: 'primary-alias',
 *   segment: 'power-users',
 *   recruit_source: 'Existing beta waitlist',
 * }
 */
export interface ParticipantProperties {
  /** Anonymous alias for privacy (e.g. "P01") */
  alias?: string
  /** How the participant was recruited */
  recruit_source?: string
  /** Current consent status for data usage */
  consent_status?: 'pending' | 'given' | 'withdrawn'
  /**
   * Stable deep-link to the exact moment this participant appears in the
   * originating recording or transcript. A per-moment locator, not a
   * study-level link. Rot-prone external pointer; treat as `volatile`.
   */
  source_url?: string
}

/** Discrete observation captured during research. Absorbed from the deprecated Highlight entity.
 *
 * @example
 * const properties: ObservationProperties = {
 *   content: 'The full body text of this entity, written as the user would read it.',
 *   source_type: 'quote',
 *   session_ref: 'sess_01HXYZ123456',
 * }
 */
export interface ObservationProperties {
  /** Note or highlight text. */
  content?: string
  /** Producing research method. */
  source_type?: 'quote' | 'behavior' | 'metric'
  /**
   * Capturing session reference. Convenience field; the canonical
   * relationship to study/session is an edge per P14. Retained as a
   * lightweight context anchor for AI inference.
   */
  session_ref?: string
  /** Flagged as a highlight. Absorbed from the deprecated Highlight entity. */
  is_highlighted?: boolean
  /**
   * Free-form highlight type tag.
   * @example "pain", "delight", "behaviour", "moment of clarity"
   */
  highlight_tag?: string
  /**
   * Structured sentiment. Tools like Dovetail and EnjoyHQ converge on these
   * four values. More precise than `highlight_tag` for aggregation.
   */
  sentiment?: SignalSentiment
  /**
   * Stable deep-link to the exact moment this observation was captured in the
   * originating recording or transcript. A per-moment locator, not a
   * study-level link. Distinct from `session_ref`, which holds an opaque
   * session ID for AI inference. Rot-prone external pointer; treat as `volatile`.
   */
  source_url?: string
}

/** Verbatim quote from a participant.
 * Link to the participant via an edge, not a speaker property.
 *
 * @example
 * const properties: QuoteProperties = {
 *   text: 'text',
 *   timestamp: '2026-04-17T09:00:00Z',
 * }
 */
export interface QuoteProperties {
  /** Quoted text */
  text: string
  /** When said (ISO timestamp or session offset) */
  timestamp?: string
  /**
   * Stable deep-link to the exact moment this quote was spoken in the
   * originating recording or transcript. A per-moment locator, not a
   * study-level link. Rot-prone external pointer; treat as `volatile`.
   */
  source_url?: string
}

/** Unified insight, synthesised from evidence and observations.
 *
 * @example
 * const properties: InsightProperties = {
 *   insight_level: 'pattern',
 *   confidence: 'medium',
 *   evidence_count: 42,
 * }
 */
export interface InsightProperties {
  /**
   * Maturity level.
   * `pattern` = recurring observation, not yet interpreted.
   * `finding` = interpreted pattern with a clear meaning.
   * `actionable` = finding with a clear next step.
   * `strategic` = finding that affects product direction.
   */
  insight_level?: 'pattern' | 'finding' | 'actionable' | 'strategic'
  /** Confidence (UPGAssessment on `confidence_5`). Reflects the strength and diversity of supporting evidence. */
  confidence?: UPGAssessment
  /** Supporting observations, quotes, or evidence items. Higher counts increase confidence. */
  evidence_count?: number
  /**
   * Novelty against existing knowledge.
   * `known` = confirms what we already believed.
   * `surprising` = challenges or extends our understanding.
   * `contradictory` = directly conflicts with a prior assumption.
   */
  novelty?: 'known' | 'surprising' | 'contradictory'
  /**
   * Current actionability.
   * `immediate` = clear action, no further research needed.
   * `needs_validation` = promising but requires more evidence.
   * `informational` = important context, no direct action.
   */
  actionability?: 'immediate' | 'needs_validation' | 'informational'
  /**
   * Producing research method.
   * @example "usability_study", "interview_series", "survey"
   */
  source_method?: string
  /**
   * Insight statement in plain language. Write as an active, present-tense assertion.
   * @example "Users consistently skip the tutorial because they trust their ability to explore independently."
   */
  statement?: string
  /** Product implications. The so-what. */
  implications?: string
}

/** Affinity cluster grouping observations.
 *
 * @example
 * const properties: AffinityClusterProperties = {
 *   theme: 'activation',
 *   child_observation_count: 42,
 *   confidence: 'medium',
 * }
 */
export interface AffinityClusterProperties {
  /** Emergent theme label */
  theme?: string
  /** Observations in this cluster */
  child_observation_count?: number
  /** Confidence in the theme's validity (UPGAssessment on `confidence_5`). */
  confidence?: UPGAssessment
}

/** Research question guiding a study.
 *
 * @example
 * const properties: ResearchQuestionProperties = {
 *   question_type: 'exploratory',
 *   priority: 'high',
 * }
 */
export interface ResearchQuestionProperties {
  /** Question classification */
  question_type?: 'exploratory' | 'evaluative' | 'generative'
  /** Importance to answer */
  priority?: Priority
}

/** Interview guide document.
 *
 * @example
 * const properties: InterviewGuideProperties = {
 *   guide_type: 'structured',
 *   question_count: 42,
 *   duration_minutes: 45,
 * }
 */
export interface InterviewGuideProperties {
  /** Format structure */
  guide_type?: 'structured' | 'semi_structured' | 'unstructured'
  /** Total questions */
  question_count?: number
  /** Expected length (minutes) */
  duration_minutes?: number
}

/** Aggregated survey response data.
 *
 * @example
 * const properties: SurveyResponseProperties = {
 *   response_count: 128,
 *   completion_rate: 0.72,
 *   method: 'email',
 * }
 */
export interface SurveyResponseProperties {
  /** Total responses */
  response_count?: number
  /** Completion (0–1) */
  completion_rate?: number
  /** Distribution method */
  method?: 'email' | 'in_app' | 'phone' | 'other'
}
