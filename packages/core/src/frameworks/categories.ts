/**
 * Framework categories and structure patterns. `FrameworkCategory` is the
 * discipline a framework belongs to. `StructurePattern` is the visual
 * topology of its output.
 */

// ─── Categories ─────────────────────────────────────────────────────────────

/** The broad domain a framework belongs to */
export type FrameworkCategory =
  // Core Product
  | 'prioritization'
  | 'strategy'
  | 'discovery'
  | 'business_model'
  | 'metrics'
  | 'validation'
  | 'planning'
  | 'competitive'
  // Design & Research
  | 'design'
  | 'ux_research'
  | 'user_understanding'
  | 'research'
  | 'accessibility'
  | 'feedback_voc'
  // Engineering & Ops
  | 'engineering'
  | 'devops'
  | 'security'
  | 'qa_testing'
  | 'ai_ml'
  | 'agentic'
  // Growth & GTM
  | 'growth'
  | 'marketing'
  | 'go_to_market'
  | 'sales'
  | 'pricing'
  // Data, Legal & Ops
  | 'data_analytics'
  | 'legal_compliance'
  | 'customer_success'
  | 'team_process'
  | 'program_mgmt'
  // Content & Portfolio
  | 'content'
  | 'education'
  | 'partnerships'
  | 'localisation'
  | 'portfolio'

/** All valid framework categories as a runtime array */
export const UPG_FRAMEWORK_CATEGORIES: readonly FrameworkCategory[] = [
  // Core Product
  'prioritization',
  'strategy',
  'discovery',
  'business_model',
  'metrics',
  'validation',
  'planning',
  'competitive',
  // Design & Research
  'design',
  'ux_research',
  'user_understanding',
  'research',
  'accessibility',
  'feedback_voc',
  // Engineering & Ops
  'engineering',
  'devops',
  'security',
  'qa_testing',
  'ai_ml',
  'agentic',
  // Growth & GTM
  'growth',
  'marketing',
  'go_to_market',
  'sales',
  'pricing',
  // Data, Legal & Ops
  'data_analytics',
  'legal_compliance',
  'customer_success',
  'team_process',
  'program_mgmt',
  // Content & Portfolio
  'content',
  'education',
  'partnerships',
  'localisation',
  'portfolio',
] as const

// ─── Structure Patterns ─────────────────────────────────────────────────────

/** The visual / topological shape a framework's structure takes */
export type StructurePattern =
  | 'tree'
  | 'table'
  | 'matrix'
  | 'funnel'
  | 'collection'
  | 'quadrant'
  | 'flow'

/** All valid structure patterns as a runtime array */
export const UPG_STRUCTURE_PATTERNS: readonly StructurePattern[] = [
  'tree',
  'table',
  'matrix',
  'funnel',
  'collection',
  'quadrant',
  'flow',
] as const
