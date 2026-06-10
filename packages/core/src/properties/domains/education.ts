/**
 * UPG Property Schemas: Customer Education Domain.
 * EducationProgram, Tutorial, Walkthrough, Webinar, Certification,
 * HelpVideo, LearningPath.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { DifficultyLevel, ISODate } from '../primitives.js'

// ---------------------------------------------------------------------------
// CUSTOMER EDUCATION
// ---------------------------------------------------------------------------

/** Education program.
 *
 * @example
 * const properties: EducationProgramProperties = {
 *   program_type: 'onboarding',
 * }
 */
export interface EducationProgramProperties {
  /** Purpose of the education program */
  program_type?: 'onboarding' | 'certification' | 'ongoing' | 'partner'
}

/** Tutorial.
 *
 * @example
 * const properties: TutorialProperties = {
 *   tutorial_format: 'written',
 *   difficulty: 'beginner',
 *   duration_minutes: 45,
 * }
 */
export interface TutorialProperties {
  /** Delivery format of the tutorial */
  tutorial_format?: 'written' | 'video' | 'interactive' | 'code_along'
  /** Skill level required to follow the tutorial */
  difficulty?: DifficultyLevel
  /** Estimated time to complete in minutes */
  duration_minutes?: number
  /** Percentage of users who complete the tutorial */
  completion_rate?: number
}

/** Product walkthrough.
 *
 * @example
 * const properties: WalkthroughProperties = {
 *   walkthrough_type: 'product_tour',
 *   step_count: 42,
 *   trigger: 'User opens the third restricted feature in a session.',
 * }
 */
export interface WalkthroughProperties {
  /** Format of the in-product walkthrough */
  walkthrough_type?: 'product_tour' | 'feature_intro' | 'tooltip_sequence' | 'checklist'
  /** Number of steps in the walkthrough */
  step_count?: number
  /** User action or event that starts the walkthrough */
  trigger?: string
  /** Percentage of users who complete the walkthrough */
  completion_rate?: number
}

/** Webinar.
 *
 * @example
 * const properties: WebinarProperties = {
 *   webinar_type: 'live',
 *   scheduled_date: '2026-04-01',
 *   duration_minutes: 45,
 * }
 */
export interface WebinarProperties {
  /** Delivery format of the webinar */
  webinar_type?: 'live' | 'recorded' | 'hybrid'
  /** Date the webinar is scheduled (ISO format) */
  scheduled_date?: ISODate
  /** Duration of the webinar in minutes */
  duration_minutes?: number
  /** Number of people who registered */
  registrations?: number
  /** Number of people who attended */
  attendance?: number
}

/** Certification.
 *
 * @example
 * const properties: CertificationProperties = {
 *   cert_level: 'foundation',
 *   requirements: ['Encrypt at rest', 'Audit every access'],
 *   validity_months: 42,
 * }
 */
export interface CertificationProperties {
  /** Difficulty level of the certification */
  cert_level?: 'foundation' | 'practitioner' | 'expert'
  /** Prerequisites or requirements to earn the certification */
  requirements?: string[]
  /** How long the certification is valid in months */
  validity_months?: number
  /** Number of people currently holding this certification */
  holders?: number
}

/** Help video.
 *
 * @example
 * const properties: HelpVideoProperties = {
 *   video_type: 'how_to',
 *   duration_seconds: 42,
 *   views: 42,
 * }
 */
export interface HelpVideoProperties {
  /** Purpose of the video */
  video_type?: 'how_to' | 'overview' | 'troubleshooting' | 'best_practice'
  /** Duration of the video in seconds */
  duration_seconds?: number
  /** Total number of views */
  views?: number
  /** URL where the video is hosted */
  url?: string
}

/** Learning path.
 *
 * @example
 * const properties: LearningPathProperties = {
 *   path_difficulty: 'beginner',
 *   item_count: 42,
 *   estimated_hours: 42,
 * }
 */
export interface LearningPathProperties {
  /**
   * Display order of this path within a curriculum or program (0-indexed). The
   * scalar ordering convention shared with `journey_step.step_order` and
   * `journey_action.action_order` ( /). Makes a learning_path a
   * deterministically orderable sequence among sibling paths rather than a star.
   */
  path_order?: number
  /** Overall difficulty level of the learning path */
  path_difficulty?: DifficultyLevel
  /** Number of items (tutorials, videos, etc.) in the path */
  item_count?: number
  /** Estimated total hours to complete the path */
  estimated_hours?: number
  /** Percentage of users who complete the full path */
  completion_rate?: number
}
