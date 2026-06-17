/**
 * UPG Property Schemas: Design System Domain.
 * DesignComponent, DesignToken, DesignSystem, DesignPattern, DesignGuideline.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { RuleStrength } from '../primitives.js'

// ---------------------------------------------------------------------------
// DESIGN SYSTEM
// ---------------------------------------------------------------------------

/** Design system component.
 *
 * @example
 * const properties: DesignComponentProperties = {
 *   atomic_level: 'atom',
 *   code_url: 'https://github.com/arkheiev/entopo/tree/main/packages/ui/src/Button',
 *   documentation_url: 'https://entopo.app/docs/components/button',
 * }
 */
export interface DesignComponentProperties {
  /** Atomic design level */
  atomic_level?: 'atom' | 'molecule' | 'organism' | 'template'
  /** Code implementation URL */
  code_url?: string
  /** Documentation / usage page URL */
  documentation_url?: string
  /** Component version (independent of the wider design system version) */
  component_version?: string
  /** Distribution readiness */
  component_status?: 'draft' | 'beta' | 'stable' | 'deprecated'
  /** Component-specific accessibility guidance */
  accessibility_notes?: string
}

/** Design token.
 *
 * @example
 * const properties: DesignTokenProperties = {
 *   value: '65%',
 *   category: 'color',
 *   css_variable: '--color-primary-500',
 * }
 */
export interface DesignTokenProperties {
  /** Category */
  category?: 'color' | 'spacing' | 'typography' | 'radius' | 'motion'
  /** Resolved value */
  value: string
  /** CSS custom property name */
  css_variable?: string
}

/** Design system as a whole.
 *
 * @example
 * const properties: DesignSystemProperties = {
 *   version: '0.3.1',
 *   repo_path: 'packages/ui/src/Button',
 *   maintainer: 'platform-team',
 * }
 */
export interface DesignSystemProperties {
  /** Current version */
  version?: string
  /** Code repository or package path */
  repo_path?: string
  /** Maintaining person or team. Promote to a `node_owned_by_team` edge if ownership must be queryable. */
  maintainer?: string
  /** Open-source license, if public */
  license?: string
  /** Documentation homepage. Public-facing entry point. */
  homepage_url?: string
}

/** Reusable design pattern.
 *
 * @example
 * const properties: DesignPatternProperties = {
 *   pattern_category: 'navigation',
 *   usage_context: 'Primary call-to-action in signup flow',
 *   pattern_status: 'proposed',
 * }
 */
export interface DesignPatternProperties {
  /** Category */
  pattern_category?: 'navigation' | 'input' | 'display' | 'feedback' | 'layout'
  /** When and where to use */
  usage_context?: string
  /** Adoption status inside the system */
  pattern_status?: 'proposed' | 'adopted' | 'experimental' | 'deprecated'
  /** Common mis-applications or lookalikes to avoid */
  anti_patterns?: string
  /** Real-world usages: screens, components, flows */
  examples?: string
}

/** Design guideline.
 *
 * @example
 * const properties: DesignGuidelineProperties = {
 *   guideline_category: 'spacing',
 *   applies_to: 'All customer-facing surfaces',
 *   rationale: 'Reduces support burden and lifts activation, both priorities this quarter.',
 * }
 */
export interface DesignGuidelineProperties {
  /** Category covered */
  guideline_category?: 'spacing' | 'color' | 'typography' | 'layout' | 'interaction' | 'content'
  /** Applicable elements or contexts */
  applies_to?: string
  /** Reasoning. Why this rule exists. */
  rationale?: string
  /** Imperative force. (Superseded the removed `strictness` field in 0.14.0.) */
  rule_strength?: RuleStrength
  /** Exception request or documentation process */
  exception_policy?: string
}
