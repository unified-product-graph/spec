/**
 * Step sequence machinery shared by `UPGPlaybook` and `UPGApproach`.
 *
 * A `sub_sequence` step references either a playbook or an approach by
 * namespace-prefixed id (`playbook:*` / `approach:*`).
 */

import type { IntelligenceCondition } from './intelligence/intelligence.js'

// ─── Step kinds ─────────────────────────────────────────────────────────────

/**
 * Discriminator for step behaviour.
 *
 * - `domain_guide`: resolve creation sequence from `DomainUsageGuide[domain_id]` at runtime
 * - `framework`:    apply a structured framework (BMC, RICE, OST)
 * - `entity_sequence`: explicit list of entity types to create
 * - `sub_sequence`: nest another playbook or approach at this step
 *
 * The `sub_sequence` kind references either a playbook or an approach by
 * namespace-prefixed id (`playbook:*` / `approach:*`).
 */
export type StepKind = 'domain_guide' | 'framework' | 'entity_sequence' | 'sub_sequence'

/** How a playbook or technique is entered. */
export type EntryMode = 'domain' | 'stage' | 'gap' | 'framework'

/** Fields every step carries, independent of kind. */
interface StepBase {
  /** Position in the sequence (1-based) */
  order: number
  /** The phase label this step belongs to (e.g. "Discovery", "Validation") */
  phase: string
  /** Human-readable label for this step */
  name?: string
  /** Optional prompt shown to the user at this step. Structure only, no UI hints. */
  prompt_hint?: string
  /** Machine-evaluable condition that must hold before advancing to the next step */
  transition_condition?: IntelligenceCondition
  /** Sequence to chain into when a gap is detected at this step */
  next_sequence_on_gap?: string
}

/** Step that defers to a domain's `DomainUsageGuide.creation_sequence`. */
export interface DomainGuideStep extends StepBase {
  kind: 'domain_guide'
  /** Domain whose `DomainUsageGuide.creation_sequence` the runtime reads at execution time */
  domain_id: string
}

/** Step that applies a named framework. */
export interface FrameworkInvocationStep extends StepBase {
  kind: 'framework'
  /** ID of the framework to apply (matches an entry in UPG_FRAMEWORKS) */
  framework_id: string
}

/** Step that creates entities of an explicit, fixed list of types. */
export interface EntitySequenceStep extends StepBase {
  kind: 'entity_sequence'
  /** Explicit list of entity types to create at this step */
  entity_types: readonly string[]
}

/** Step that chains into a nested playbook or technique. */
export interface SubSequenceStep extends StepBase {
  kind: 'sub_sequence'
  /** ID of the nested sequence: `playbook:*` or `technique:*` */
  sub_sequence_id: string
}

/**
 * A single step in a playbook or technique, discriminated by `kind`.
 *
 * @example { kind: 'domain_guide', order: 1, phase: 'Discovery', domain_id: 'user' }
 * @example { kind: 'framework', order: 2, phase: 'Prioritisation', framework_id: 'rice-scoring' }
 * @example { kind: 'entity_sequence', order: 3, phase: 'Personas', entity_types: ['persona', 'job'] }
 * @example { kind: 'sub_sequence', order: 4, phase: 'Discovery', sub_sequence_id: 'playbook:users-needs' }
 */
export type Step =
  | DomainGuideStep
  | FrameworkInvocationStep
  | EntitySequenceStep
  | SubSequenceStep

// ─── Surface identifier ─────────────────────────────────────────────────────

/**
 * Surface identifier. Known surfaces are typed; runtimes may register their own
 * identifiers (string fallback) without touching the spec.
 */
export type SurfaceId = 'cli' | 'entopo' | 'mcp_tool' | (string & {})

// ─── Runtime context, output, and run record (shared) ───────────────────────

/** Runtime context handed to `startRun`. Open-ended; each surface adds its own. */
export interface RunContext {
  /** Path to the `.upg` file, for file-backed runtimes */
  graph_path?: string
  /** Product identifier for cloud-backed runtimes */
  product_id?: string
  /** Active user (if authenticated) */
  user_id?: string
  /** Runtime-specific session identifier */
  session_id?: string
  /** Surface-specific extensions */
  [key: string]: unknown
}

/** What a step produced when recorded. */
export type StepOutputKind =
  | 'entities_created'
  | 'entities_updated'
  | 'response'
  | 'skipped'

/** The runtime record of what a single step produced. */
export interface StepOutput {
  /** What category of output the step produced */
  kind: StepOutputKind
  /** IDs of entities created or updated by this step */
  entity_ids?: readonly string[]
  /** Free-form user response captured at this step */
  response_text?: string
  /** Surface-specific metadata (e.g. timing, confidence) */
  metadata?: Record<string, unknown>
}

// ─── Narrowing helpers ──────────────────────────────────────────────────────

export function isDomainGuideStep(step: Step): step is DomainGuideStep {
  return step.kind === 'domain_guide'
}

export function isFrameworkInvocationStep(step: Step): step is FrameworkInvocationStep {
  return step.kind === 'framework'
}

export function isEntitySequenceStep(step: Step): step is EntitySequenceStep {
  return step.kind === 'entity_sequence'
}

export function isSubSequenceStep(step: Step): step is SubSequenceStep {
  return step.kind === 'sub_sequence'
}
