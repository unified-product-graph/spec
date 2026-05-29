/**
 * UPG Framework type definitions.
 *
 * Frameworks are declarative lenses that structure graph data into known
 * product-management patterns (RICE, Lean Canvas, Opportunity Solution Tree).
 * Each framework describes four layers: data, structure, presentation, education.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { FrameworkCategory } from './categories.js'
import type { StructurePattern } from './categories.js'

// ─── Re-export category types for convenience ───────────────────────────────

export type { FrameworkCategory, StructurePattern }

// ─── Slots ──────────────────────────────────────────────────────────────────

/** A named position within a framework's visual structure, populated by an entity type */
export interface FrameworkSlot {
  /** Display label for this slot (e.g. "Key Partners", "Problem", "Reach") */
  label: string
  /** The UPG entity type that fills this slot */
  entityTypeId: string
  /** Explanation of what this slot represents in the framework */
  description?: string
}

// ─── Origin ─────────────────────────────────────────────────────────────────

/** Where the framework came from: attribution and licensing */
export interface FrameworkOrigin {
  /** Whether the framework is from academia, a practitioner, the community, or original to UPG */
  type: 'academic' | 'practitioner' | 'community' | 'custom'
  /** Human-readable attribution (e.g. "Sean Ellis", "Marty Cagan", "Teresa Torres") */
  attribution?: string
  /** Provenance narrative: how the framework came about (e.g. "Published in Business Model Generation") */
  description?: string
  /** URL to the original source or publication */
  url?: string
  /** Year the framework was first published or popularised */
  year?: number
  /** License under which the framework definition is shared */
  license?: string
}

// ─── Data Layer ─────────────────────────────────────────────────────────────

/** Declares which UPG entity type plays which role within a framework */
export interface FrameworkEntityTypeSpec {
  /** The UPG entity type (must be a valid UPGEntityType) */
  type: string
  /** The role this entity plays in the framework (e.g. "root", "item", "branch", "leaf", "bucket") */
  role: string
  /** Minimum number of entities of this type required */
  min_count?: number
  /** Maximum number of entities of this type allowed */
  max_count?: number
  /** Whether to auto-create placeholder entities when the framework is applied */
  auto_scaffold?: boolean
}

/** A property that the framework requires on an entity */
export interface FrameworkPropertyRequirement {
  /** The property key on the entity's properties object */
  property: string
  /** The data type of the property value */
  type: 'number' | 'string' | 'enum' | 'boolean' | 'assessment'
  /** Whether the property must be filled for the framework to function */
  required: boolean
  /** Default value to use when the property is not set */
  default_value?: unknown
  /** Valid values when type is 'enum' */
  enum_values?: string[]
  /** Human-readable label for the property (shown in UI) */
  label?: string
  /** Explanation of what this property represents */
  description?: string
}

/** A property whose value is computed from other properties via a math DSL */
export interface FrameworkComputedProperty {
  /** The property key that will hold the computed result */
  property: string
  /** A simple math expression referencing other properties (e.g. "(reach * impact * confidence) / effort") */
  expression: string
  /** The entity type this computed property applies to */
  entity_type: string
  /** Human-readable label for the computed property */
  label?: string
  /** How to format the computed value in the UI */
  format?: 'number' | 'percentage' | 'currency'
}

/** A fixed entity that the framework scaffolds automatically (e.g. quadrant labels, funnel stages) */
export interface FrameworkConstant {
  /** The UPG entity type for this constant */
  type: string
  /** Display title for the constant */
  title: string
  /** Predefined properties for the constant entity */
  properties: Record<string, unknown>
}

/**
 * Everything the framework needs from the graph's data layer: which entity
 * types play which roles, which properties each type must carry under the
 * lens, and any computed or scaffolded constants.
 *
 * @example
 * // RICE: scores a feature on reach, impact, confidence, effort.
 * const riceData: FrameworkDataSpec = {
 *   entity_types: [
 *     { type: 'feature', role: 'item', min_count: 1 },
 *   ],
 *   required_properties: {
 *     feature: [
 *       { property: 'reach', type: 'number', required: true, label: 'Reach' },
 *       { property: 'impact', type: 'number', required: true, label: 'Impact' },
 *       { property: 'confidence', type: 'number', required: true, label: 'Confidence (%)' },
 *       { property: 'effort', type: 'number', required: true, label: 'Effort (person-weeks)' },
 *     ],
 *   },
 *   computed_properties: [
 *     {
 *       property: 'rice_score',
 *       entity_type: 'feature',
 *       expression: '(reach * impact * confidence) / effort',
 *       label: 'RICE',
 *       format: 'number',
 *     },
 *   ],
 * }
 */
export interface FrameworkDataSpec {
  /** The entity types that participate in this framework and their roles */
  entity_types: FrameworkEntityTypeSpec[]
  /**
   * Properties required on each entity type, keyed by entity type string.
   *
   * **Framework-introduced properties.** A framework may declare
   * property keys that do NOT appear in `UPG_PROPERTY_SCHEMA` for the target
   * entity type. This is by design: frameworks are lenses that layer
   * domain-specific fields on top of canonical entities (RICE adds
   * `reach`/`impact`/`confidence`/`effort` to a feature; Kano adds
   * `functional_response`/`dysfunctional_response`). These fields are NOT
   * universal to the entity; they live inside the framework context.
   *
   * Consumers must read framework-introduced properties from this spec, not
   * from `UPG_PROPERTY_SCHEMA`. Renderers merge both when displaying an
   * entity under a framework. See `src/ARCHITECTURE.md`,
   * "Framework Properties: Lens-Scoped Fields".
   */
  required_properties: Record<string, FrameworkPropertyRequirement[]>
  /** Properties that are derived from other properties via expressions */
  computed_properties?: FrameworkComputedProperty[]
  /** Fixed entities that the framework creates automatically */
  constants?: FrameworkConstant[]
}

// ─── Structure Layer ────────────────────────────────────────────────────────

/** One level in a tree-structured framework */
export interface FrameworkLevel {
  /** Zero-based depth in the tree (0 = root) */
  depth: number
  /** Human-readable name for this level (e.g. "Outcome", "Opportunity") */
  label: string
  /** Which UPG entity types can appear at this level */
  entity_types: string[]
  /** Explanation of what this level represents */
  description: string
  /** The edge type connecting entities at this level to their parent */
  edge_from_parent: string
}

/** A cell in a matrix-structured framework */
export interface MatrixSlot {
  /** Unique identifier for this slot */
  id: string
  /** Display label for the slot */
  label: string
  /** The UPG entity type placed in this slot */
  entity_type: string
  /** Position within the matrix grid */
  position: {
    /** Zero-based row index */
    row: number
    /** Zero-based column index */
    col: number
    /** Number of rows this slot spans */
    rowSpan?: number
    /** Number of columns this slot spans */
    colSpan?: number
  }
}

/** A stage in a funnel-structured framework */
export interface FunnelStage {
  /** Unique identifier for this stage */
  id: string
  /** Display label for the stage */
  label: string
  /** Position in the funnel (0 = top / widest) */
  order: number
  /** The UPG entity type associated with this stage */
  entity_type?: string
  /** The metric tracked at this stage (e.g. "visitors", "signups") */
  metric_name?: string
}

/** A logical grouping of entities within a collection-structured framework */
export interface NamedGroup {
  /** Unique identifier for this group */
  id: string
  /** Display label for the group */
  label: string
  /** Explanation of what this group contains */
  description: string
  /** Which UPG entity types belong to this group */
  entity_types: string[]
}

/** How entities are topologically organised within the framework */
export interface FrameworkStructureSpec {
  /** The visual / topological pattern (tree, table, matrix, etc.) */
  pattern: StructurePattern
  /** Tree levels (only used when pattern is 'tree') */
  levels?: FrameworkLevel[]
  /** Edge types used to connect entities in this framework */
  edge_types?: string[]
  /** Matrix slots (only used when pattern is 'matrix') */
  slots?: MatrixSlot[]
  /** Funnel stages (only used when pattern is 'funnel') */
  stages?: FunnelStage[]
  /** Named groups (only used when pattern is 'collection') */
  groups?: NamedGroup[]
}

// ─── Presentation Layer ─────────────────────────────────────────────────────

/** A column definition for table-layout frameworks */
export interface TableColumn {
  /** The property key to display in this column */
  property: string
  /** Column header label */
  label: string
  /** Column width in pixels (optional) */
  width?: number
  /** Whether the column can be sorted */
  sortable?: boolean
  /** How to render the cell value */
  format?: 'number' | 'bar' | 'badge' | 'score_pill'
}

/**
 * Discriminated union of all supported layout types.
 * Each layout carries its own configuration fields.
 *
 * @example { type: 'tree', direction: 'TB', engine: 'elk' }
 * @example { type: 'table', columns: [{ property: 'reach', label: 'Reach', format: 'score_pill' }] }
 * @example { type: 'matrix', rows: 2, cols: 2, template: 'eisenhower' }
 * @example { type: 'funnel', orientation: 'vertical' }
 * @example { type: 'kanban', columns: ['backlog', 'in_progress', 'done'] }
 * @example { type: 'quadrant', x_axis: 'impact', y_axis: 'effort', x_label: 'Impact', y_label: 'Effort' }
 * @example { type: 'grid', groupBy: 'domain' }
 * @example { type: 'flow', direction: 'LR' }
 */
export type FrameworkLayout =
  | { /** Tree layout */ type: 'tree'; /** Layout direction */ direction: 'TB' | 'LR'; /** Layout engine */ engine?: 'dagre' | 'elk' }
  | { /** Table layout */ type: 'table'; /** Column definitions */ columns: TableColumn[] }
  | { /** Matrix layout */ type: 'matrix'; /** Number of rows */ rows: number; /** Number of columns */ cols: number; /** Optional named template */ template?: string }
  | { /** Funnel layout */ type: 'funnel'; /** Funnel orientation */ orientation: 'vertical' | 'horizontal' }
  | { /** Kanban board layout */ type: 'kanban'; /** Column identifiers */ columns: string[] }
  | { /** Quadrant / 2x2 layout */ type: 'quadrant'; /** X-axis property */ x_axis: string; /** Y-axis property */ y_axis: string; /** X-axis label */ x_label?: string; /** Y-axis label */ y_label?: string }
  | { /** Grouped grid layout */ type: 'grid'; /** Property to group entities by */ groupBy: string }
  | { /** Directed flow layout */ type: 'flow'; /** Flow direction */ direction: 'LR' | 'TB' }

/** How the framework should be rendered in a UI */
export interface FrameworkPresentationSpec {
  /** The layout strategy for rendering */
  layout: FrameworkLayout
  /** Default sort order for entities */
  sort_by?: { /** Property to sort by */ property: string; /** Sort direction */ direction: 'asc' | 'desc' }
  /** Which dimension to use for colour coding */
  colour_by?: 'type' | 'status' | 'score' | 'group' | 'custom'
  /** Which properties to show on entity cards */
  card_fields?: string[]
  /** Whether tree branches can be collapsed */
  collapsible?: boolean
  /** Custom colour map: keys are values of the colour_by dimension, values are CSS colours */
  colour_map?: Record<string, string>
}

// ─── Education Layer ────────────────────────────────────────────────────────

/** One step in a guided walkthrough of how to use a framework */
export interface FrameworkStep {
  /** Step order (1-based) */
  order: number
  /** Human-readable instruction for this step */
  instruction: string
  /** The property this step asks the user to fill */
  property?: string
  /** The entity type this step focuses on */
  entity_type?: string
}

/** Educational context that helps users understand and apply the framework */
export interface FrameworkEducation {
  /** A one-sentence explanation of what the framework does */
  purpose: string
  /** The core question the framework helps answer */
  core_question: string
  /** Situations where this framework is a good fit */
  when_to_use: string[]
  /** Situations where this framework is a poor fit */
  when_not_to_use: string[]
  /** URL to further reading about the framework */
  learn_more_url?: string
  /** Step-by-step guided walkthrough */
  steps?: FrameworkStep[]
}

// ─── Main Interface ─────────────────────────────────────────────────────────

/**
 * A UPG Framework is a declarative, config-driven lens that structures
 * UPG graph data into a well-known product management pattern.
 *
 * Frameworks are pure data; no code. The rendering engine reads the
 * framework definition and produces the appropriate UI.
 *
 * @example
 * // Abbreviated RICE definition, showing the layer split (data / structure
 * // / presentation / education). Real definitions live in
 * // `src/frameworks/definitions/`.
 * const riceFramework: UPGFramework = {
 *   id: 'rice-scoring',
 *   name: 'RICE Scoring',
 *   version: '0.1.0',
 *   description: 'Score features on Reach, Impact, Confidence, Effort to prioritise.',
 *   category: 'prioritisation',
 *   origin: {
 *     type: 'practitioner',
 *     attribution: 'Sean McBride (Intercom)',
 *     year: 2016,
 *     license: 'MIT',
 *   },
 *   tags: ['prioritisation', 'scoring'],
 *   data: {
 *     entity_types: [{ type: 'feature', role: 'item', min_count: 1 }],
 *     required_properties: {
 *       feature: [
 *         { property: 'reach', type: 'number', required: true },
 *         { property: 'impact', type: 'number', required: true },
 *         { property: 'confidence', type: 'number', required: true },
 *         { property: 'effort', type: 'number', required: true },
 *       ],
 *     },
 *   },
 *   structure: { pattern: 'table' },
 *   presentation: {
 *     layout: {
 *       type: 'table',
 *       columns: [
 *         { property: 'title', label: 'Feature' },
 *         { property: 'rice_score', label: 'RICE', format: 'score_pill' },
 *       ],
 *     },
 *     sort_by: { property: 'rice_score', direction: 'desc' },
 *   },
 *   education: {
 *     purpose: 'Rank features by a simple weighted score.',
 *     core_question: 'Which feature gives the most value for the least effort?',
 *     when_to_use: ['A large backlog needs triage', 'Stakeholders argue by intuition'],
 *     when_not_to_use: ['Strategic bets where effort is the wrong denominator'],
 *   },
 * }
 */
export interface UPGFramework {
  /** Unique identifier (kebab-case, e.g. "rice-scoring", "lean-canvas") */
  id: string
  /** Human-readable name (e.g. "RICE Scoring", "Lean Canvas") */
  name: string
  /** Semver version of this framework definition */
  version: string
  /** One-sentence description of the framework */
  description: string
  /** The broad domain this framework belongs to */
  category: FrameworkCategory
  /** Attribution and licensing */
  origin: FrameworkOrigin
  /** Freeform tags for filtering and discovery */
  tags: string[]
  /** Named positions within the framework's visual structure */
  slots?: FrameworkSlot[]
  /** What data the framework needs from the graph */
  data: FrameworkDataSpec
  /** How entities are topologically organised */
  structure: FrameworkStructureSpec
  /** How the framework should be rendered */
  presentation: FrameworkPresentationSpec
  /** Educational context and guided walkthrough */
  education: FrameworkEducation
  /** IDs of other frameworks this one can be composed with */
  composable_with?: string[]
  /** ID of a parent framework this one extends */
  extends?: string
  /**
   * The approaches this framework serves (many-to-many). Each value is a
   * `UPGApproachId` (`'plan' | 'inspect' | 'prioritise' | 'trace' | 'reflect'`).
   * Optional: partial coverage is by design; adding tags later is additive.
   *
   * Type-erased to `string[]` to avoid a circular import with
   * `approaches/types.ts`. Conceptually `readonly UPGApproachId[]`.
   *
   * @see MENTAL-MODEL.md, approach × framework relationship
   */
  approach_ids?: readonly string[]
}

/**
 * Lightweight framework metadata: the identity + origin subset of UPGFramework.
 *
 * Use this type for catalogue listings, site data, and anywhere that needs
 * framework identity without the full data/structure/presentation/education layers.
 * A UPGFrameworkMeta can be progressively enriched into a full UPGFramework.
 */
export interface UPGFrameworkMeta {
  /** Unique identifier (kebab-case, e.g. "rice-scoring", "lean-canvas") */
  id: string
  /** Human-readable name (e.g. "RICE Scoring", "Lean Canvas") */
  name: string
  /** One-sentence description of the framework */
  description: string
  /** The broad domain this framework belongs to */
  category: FrameworkCategory
  /** The visual / topological shape (tree, table, matrix, funnel, etc.) */
  structure_pattern: StructurePattern
  /** Attribution and licensing */
  origin?: FrameworkOrigin
  /** Named positions within the framework's visual structure */
  slots?: FrameworkSlot[]
  /** The UPG entity types that participate in this framework */
  entity_type_ids?: string[]
  /** Freeform tags for filtering and discovery */
  tags?: string[]
}

// ─── Methodology (bundle of frameworks) ─────────────────────────────────────
//
// UPGMethodology + MethodologyStep were removed in v0.2.
// Methodologies are now UPGWorkflow records with all `kind: 'framework'`
// steps, a single primitive with one-to-one coverage. See packages/upg-spec/
// src/workflows/ for the canonical shape.
