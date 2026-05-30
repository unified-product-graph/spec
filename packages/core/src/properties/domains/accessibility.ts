/**
 * UPG Property Schemas: Accessibility Domain.
 * A11yStandard, A11yGuideline, A11yAudit, A11yIssue, A11yAnnotation.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { ConformanceLevel, ISODate, Priority, RuleStrength, UPGAssessment } from '../primitives.js'

// ---------------------------------------------------------------------------
// ACCESSIBILITY
// ---------------------------------------------------------------------------

/** Accessibility standard.
 *
 * @example
 * const properties: A11yStandardProperties = {
 *   version: '0.3.1',
 *   conformance_level: 'A',
 * }
 */
export interface A11yStandardProperties {
  /** Name of the standard (e.g. "WCAG", "Section 508") */
  /** Version of the standard (e.g. "2.1", "2.2") */
  version?: string
  /** Target conformance level */
  conformance_level?: ConformanceLevel
}

/** Accessibility guideline.
 *
 * @example
 * const properties: A11yGuidelineProperties = {
 *   principle: 'perceivable',
 *   guideline_number: 'DS-014',
 *   level: 'A',
 * }
 */
export interface A11yGuidelineProperties {
  /** WCAG principle this guideline falls under */
  principle?: 'perceivable' | 'operable' | 'understandable' | 'robust'
  /** Guideline reference number (e.g. "1.1", "2.4") */
  guideline_number?: string
  /** WCAG conformance level required */
  level?: ConformanceLevel
  /** Imperative force of this guideline. */
  rule_strength?: RuleStrength
}

/** Accessibility audit.
 *
 * @example
 * const properties: A11yAuditProperties = {
 *   method: 'automated',
 *   scope: 'Covers in-product onboarding; excludes lifecycle email.',
 *   conformance_result: 'pass',
 * }
 */
export interface A11yAuditProperties {
  /** How the audit was conducted */
  method?: 'automated' | 'manual' | 'assistive_tech' | 'expert'
  /** What was audited (e.g. "homepage", "checkout flow") */
  scope?: string
  /** Overall conformance result */
  conformance_result?: 'pass' | 'partial' | 'fail'
  /** Number of accessibility violations found */
  violations_count?: number
  /** Number of checks that passed */
  passes_count?: number
  /** Number of checks that could not be completed */
  incomplete_count?: number
  /** Aggregate accessibility score (0-100) */
  score?: number
  /** Tool used to perform the audit */
  tool?: 'axe-core' | 'lighthouse' | 'wave' | 'manual' | 'other'
  /** Version of the audit tool */
  tool_version?: string
  /** URL of the page tested */
  url_tested?: string
  /** Date the audit was conducted (ISO format) */
  audit_date?: ISODate
}

/** Accessibility issue.
 *
 * @example
 * const properties: A11yIssueProperties = {
 *   severity: 'minor',
 *   wcag_criterion: '1.4.3: Contrast (Minimum)',
 *   rule_id: 'dqr_nodes_no_null_title',
 * }
 */
export interface A11yIssueProperties {
  /**
   * Impact severity (UPGAssessment on the `severity_5` scale). Migrated from
   * the inline axe-core 4-level enum (`minor|moderate|serious|critical`)
   * ( Option C): map `critical` -> 5, `serious` -> 4, `moderate` -> 3,
   * `minor` -> 2; carry the old word in `label`.
   */
  severity?: UPGAssessment
  /** WCAG success criterion violated (e.g. "1.1.1", "2.4.7") */
  wcag_criterion?: string
  /** Identifier of the rule that flagged the issue */
  rule_id?: string
  /** URL to documentation explaining the issue and how to fix it */
  help_url?: string
  /** Description of the affected UI element */
  affected_element?: string
  /** CSS selector targeting the affected element */
  css_selector?: string
  /** HTML snippet containing the violation */
  html_snippet?: string
  /** Tags from the audit tool (e.g. "wcag2aa", "cat.color") */
  tags?: string[]
  /** Recommended fix for the issue */
  remediation?: string
  /** Description of the user impact */
  impact_description?: string
  /** Page or component where the issue was found */
  discovered_in?: string
}

/** Accessibility annotation.
 *
 * @example
 * const properties: A11yAnnotationProperties = {
 *   category: 'focus_order',
 *   target_component: 'OnboardingChecklist',
 *   requirement: 'All customer data must be encrypted at rest and in transit.',
 * }
 */
export interface A11yAnnotationProperties {
  /**
   * Category of accessibility annotation.
   * Expanded from the original 5-value enum to cover the full range of a11y annotation types.
   */
  category?: 'focus_order' | 'alt_text' | 'heading_level' | 'aria_label' | 'colour_contrast' | 'keyboard_nav' | 'screen_reader' | 'motion_preference' | 'other'
  /** Component or element this annotation applies to */
  target_component?: string
  /** Specific accessibility requirement described */
  requirement?: string
  /** WCAG success criterion this annotation relates to */
  wcag_criterion?: string
  /** Priority for implementing this annotation */
  annotation_priority?: Priority
  /** Whether the annotation has been implemented */
  applied?: boolean
}
