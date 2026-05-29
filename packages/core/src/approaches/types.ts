/**
 * UPG Approach primitive: the cognitive *path of arrival* to a region.
 *
 * Five canonical approaches: Plan, Inspect, Prioritise, Trace, Reflect.
 * The catalog is closed. New techniques land as frameworks under existing
 * approaches.
 *
 * @see {@link UPG_APPROACHES} for the canonical five
 * @see {@link UPGFramework.approach_ids} for the bridge to frameworks
 */

import type { Step, EntryMode, RunContext, StepOutput, SurfaceId } from '../step-sequence.js'
import type { UPGRegionId } from '../regions/types.js'
import type { FrameworkOrigin } from '../frameworks/types.js'

// ─── Approach identity ──────────────────────────────────────────────────────

/**
 * The five canonical approach ids. Closed catalog: adding a sixth is a
 * coordinated breaking-shape change.
 *
 * Source of truth for `UPGFramework.approach_ids` and the MCP tool dispatch
 * keys (`plan`, `inspect`, `prioritise`, `trace`, `reflect`).
 */
export type UPGApproachId =
  | 'plan'
  | 'inspect'
  | 'prioritise'
  | 'trace'
  | 'reflect'

// ─── Approach (structure) ───────────────────────────────────────────────────

/**
 * A definition record describing a cognitive engagement category exposed as
 * a verb-led MCP tool (`plan` / `inspect` / `prioritise` / `trace` / `reflect`).
 *
 * Today these ship as definition lookups: the MCP handler returns the
 * approach record + invocation parameters; the LLM is the executor.
 * Structured execution is forward-declared (see `ApproachRuntime`) and is
 * a forthcoming follow-up.
 *
 * @example
 * // The Prioritise approach: "what's most important?"
 * const prioritise: UPGApproach = {
 *   id: 'prioritise',
 *   label: 'Prioritise',
 *   description: 'Rank a candidate set by an explicit framework: RICE, ICE, Kano, Cost of Delay.',
 *   question_answered: "what's most important?",
 *   signature_hint: '({ candidates: entity_ids[], framework_id }) → { ranked, framework_used }',
 *   framework_id_examples: ['rice-scoring', 'ice-scoring', 'kano-model', 'cost-of-delay'],
 * }
 */
export interface UPGApproach {
  /**
   * Unique identifier: bare verb, matches the MCP tool name. One of
   * `'plan' | 'inspect' | 'prioritise' | 'trace' | 'reflect'`.
   */
  id: UPGApproachId
  /** Human-readable label (Title Case): `'Plan'`, `'Inspect'`, etc. */
  label: string
  /** One-paragraph description of the cognitive engagement category. */
  description: string
  /**
   * The single question this approach answers, read as the user's intent in
   * plain language. Drives natural-language → MCP-tool routing.
   */
  question_answered: string
  /**
   * Compact signature reminder: `(args) → return-shape`. Documents the
   * structured-execution shape; today the MCP handler returns the approach
   * record + invocation parameters (definition lookup).
   */
  signature_hint: string
  /**
   * 3-5 canonical framework ids inside this approach (`UPGFramework.id`),
   * a discoverability surface, not exhaustive coverage. Full reverse-lookup
   * is via `UPGFramework.approach_ids`.
   */
  framework_id_examples?: readonly string[]
}

// ─── Reflect-mode vocabulary ────────────────────────────────────────────────

/**
 * Canonical reflect modes: the 4 nouns the `reflect` approach accepts as an
 * optional `mode` parameter. Absence of `mode` is open reflection.
 *
 * Locked vocabulary; agent-facing. Users speak natural language; the LLM
 * translates `"what assumptions are we making?"` → `mode: 'assumptions'`.
 */
export type ReflectMode =
  | 'assumptions'
  | 'alternatives'
  | 'blind-spots'
  | 'load-bearing'

/** Closed list, useful for tool input-schema enums. */
export const REFLECT_MODES: readonly ReflectMode[] = [
  'assumptions',
  'alternatives',
  'blind-spots',
  'load-bearing',
] as const

// ─── Family-resemblance envelope ────────────────────────────────────────────

/**
 * Shared envelope every approach handler returns. The handler-specific
 * payload spreads into `...payload`; see each approach's `signature_hint`
 * for the per-id shape.
 */
export interface UPGApproachEnvelope {
  /** The approach id this envelope is wrapping. */
  approach_id: UPGApproachId
  /**
   * Approach-specific scope: a region id (Plan, Inspect, Reflect), an
   * anchor entity id (Trace), an entity id array (Prioritise candidates),
   * or `null` (open invocation). Typed `unknown` because the shape varies
   * by approach.
   */
  scope: unknown
  /** ISO-8601 datetime when the handler produced the envelope. */
  generated_at: string
}

// ─── Forward-declared runtime / binding shapes ──────────────────────────────
//
// These mirror legacy technique shapes for forward-compat. Forward-declared
// (no current surface uses them) so the structured-execution authoring pass
// lands additively.

/** Per-surface experience binding for a `UPGApproach`. Forward-declared. */
export interface ApproachBinding {
  /** The `UPGApproach.id` this binding renders */
  approach_id: UPGApproachId
  /** Surface this binding targets */
  surface: SurfaceId
  /** Identifier the runtime maps to a component or handler */
  renderer: string
  /** Per-step renderer overrides, keyed by `Step.order` */
  step_renderers?: Record<number, string>
  /** Surface-specific step kinds the runtime handles */
  custom_step_kinds?: readonly string[]
  /** Lifecycle hook id: runtime-resolved, fires when an invocation starts */
  on_start?: string
  /** Lifecycle hook id: runtime-resolved, fires after each step */
  on_step_complete?: string
  /** Lifecycle hook id: runtime-resolved, fires when an invocation completes */
  on_run_complete?: string
}

/** Narrowing filter for `listApproaches`. All fields AND together. */
export interface ApproachFilter {
  /** Filter to approaches whose framework_id_examples include this id */
  framework_id?: string
  /** Filter to approaches relevant to a specific region (forward-compat; all five are cross-region today) */
  region?: UPGRegionId
  /** Filter to approaches reachable via a specific entry mode (forward-compat) */
  entry_mode?: EntryMode
}

/**
 * A concrete invocation of a `UPGApproach`. Forward-declared: the MCP
 * handlers are stateless definition lookups today; structured execution
 * with run tracking is a forthcoming follow-up.
 */
export interface ApproachRun {
  /** Unique identifier for this run */
  id: string
  /** The `UPGApproach.id` this run is executing */
  approach_id: UPGApproachId
  /** ISO 8601 datetime */
  started_at: string
  /** ISO 8601 datetime, set when the run completes */
  completed_at?: string
  /** Order of the step currently in progress, if any */
  current_step_order?: number
  /** Runtime context passed when the run was started */
  context: RunContext
}

/**
 * Forward-declared interface for a future structured-execution runtime. No
 * current surface implements it; the MCP tools ship as definition lookups.
 */
export interface ApproachRuntime {
  /** Return all approaches matching an optional filter */
  listApproaches(filter?: ApproachFilter): readonly UPGApproach[]
  /** Return a single approach by id, or null if not found */
  getApproach(id: UPGApproachId): UPGApproach | null
  /** Start a new run of an approach, returning the in-progress `ApproachRun` */
  startRun(approach_id: UPGApproachId, context: RunContext): ApproachRun
  /** Record the output of a completed step against an in-progress run */
  recordStep(run_id: string, step_order: number, output: StepOutput): void
}

// ─── Re-export forward-compat references ───────────────────────────────────

// `FrameworkOrigin` and `Step` are unused by approach records today but
// re-exported so the structured-execution authoring pass can extend
// `UPGApproach` (e.g. `origin?: FrameworkOrigin`, `steps?: readonly Step[]`)
// without a re-import sweep.
export type { Step, EntryMode, RunContext, StepOutput, SurfaceId, FrameworkOrigin }
