/**
 * UPG Playbook primitive. Bootstraps a region with an ordered creation
 * sequence. Region-scoped: one canonical playbook per region, plus optional
 * framework-anchored specialised playbooks.
 *
 * @see {@link UPG_PLAYBOOKS} for the catalog
 */

import type { Step, EntryMode, RunContext, StepOutput } from '../step-sequence.js'
import type { UPGRegionId } from '../regions/types.js'

// ─── Playbook (structure) ───────────────────────────────────────────────────

/**
 * The canonical playbook primitive. Structure only. Surface-specific
 * presentation lives in per-surface bindings.
 */
export interface UPGPlaybook {
  /** Unique identifier. Namespace-prefixed: `playbook:<region-shorthand>[-variant]`. */
  id: string
  /** Human-readable name. Shown in CLI, Entopo, and MCP responses. */
  name: string
  /** Semver version of this playbook definition */
  version: string
  /** One-sentence description */
  description: string
  /** REQUIRED: the region this playbook anchors */
  region: UPGRegionId
  /**
   * Marks the canonical playbook for this region. Exactly one canonical per
   * region (W1 restated). Specialised playbooks omit this field or set false.
   */
  is_canonical?: boolean
  /**
   * Optional: the framework this playbook is anchored on. References
   * `UPGFramework.id`. Specialised playbooks are typically framework-anchored;
   * the canonical playbook usually is not.
   */
  framework_id?: string
  /**
   * Optional: frameworks relevant to this playbook's region, surfaced as
   * "related reading" without implying they are invoked as steps (unlike
   * `framework_id` / framework-kind steps). Each references a `UPGFramework.id`.
   * Lets consumers show a region's signature frameworks even when the
   * creation sequence is pure `entity_sequence`. (.)
   */
  related_framework_ids?: readonly string[]
  /**
   * The single named outcome entity this playbook produces. Defaults to the
   * region's anchor entity if omitted.
   */
  target_anchor_entity?: string
  /**
   * Ordered creation sequence, typically one `DomainGuideStep` per atomic
   * domain composed by the region, OR a framework-driven sequence when
   * `framework_id` is set.
   */
  creation_sequence: readonly Step[]
}

// ─── Binding (experience) ───────────────────────────────────────────────────

import type { SurfaceId } from '../step-sequence.js'

/** Per-surface experience binding for a `UPGPlaybook`. */
export interface PlaybookBinding {
  /** The `UPGPlaybook.id` this binding renders */
  playbook_id: string
  /** Surface this binding targets */
  surface: SurfaceId
  /** Identifier the runtime maps to a component or handler */
  renderer: string
  /** Per-step renderer overrides, keyed by `Step.order` */
  step_renderers?: Record<number, string>
  /** Surface-specific step kinds the runtime handles beyond the canonical ones */
  custom_step_kinds?: readonly string[]
  /** Lifecycle hook id: runtime-resolved, fires when a run starts */
  on_start?: string
  /** Lifecycle hook id: runtime-resolved, fires after each step */
  on_step_complete?: string
  /** Lifecycle hook id: runtime-resolved, fires when a run completes */
  on_run_complete?: string
}

// ─── Runtime contract ───────────────────────────────────────────────────────

/**
 * Narrowing filter for `listPlaybooks`. All fields AND together.
 */
export interface PlaybookFilter {
  /** Filter to playbooks anchored at a specific region */
  region?: UPGRegionId
  /** Filter to playbooks marked canonical (or specialised when false) */
  is_canonical?: boolean
  /** Filter to playbooks anchored on a specific framework */
  framework_id?: string
  /** Filter to playbooks reachable via a specific entry mode (always 'domain' for playbooks) */
  entry_mode?: EntryMode
  /** Filter to playbooks producing a specific anchor entity type */
  target_anchor_entity?: string
}

/** A concrete execution of a `UPGPlaybook`. */
export interface PlaybookRun {
  /** Unique identifier for this run */
  id: string
  /** The `UPGPlaybook.id` this run is executing */
  playbook_id: string
  /** Version the run was started against */
  playbook_version: string
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
 * The minimum interface a playbook runtime must expose. CLI, Entopo, and any
 * future surface implement these methods with identical signatures.
 */
export interface PlaybookRuntime {
  /** Return all playbooks matching an optional filter */
  listPlaybooks(filter?: PlaybookFilter): readonly UPGPlaybook[]
  /** Return a single playbook by ID, or null if not found */
  getPlaybook(id: string): UPGPlaybook | null
  /** Return the single canonical playbook for a region (the "start here" path) */
  getCanonicalPlaybookForRegion(region: UPGRegionId): UPGPlaybook | null
  /** Return all playbooks (canonical + specialised) anchored at a region */
  getPlaybooksForRegion(region: UPGRegionId): readonly UPGPlaybook[]
  /** Start a new run of a playbook, returning the in-progress `PlaybookRun` */
  startRun(playbook_id: string, context: RunContext): PlaybookRun
  /** Record the output of a completed step against an in-progress run */
  recordStep(run_id: string, step_order: number, output: StepOutput): void
}
