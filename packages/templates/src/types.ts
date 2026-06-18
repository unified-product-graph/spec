/** A template for a single entity */
export interface EntityTemplate {
  /** Entity type (e.g. "persona", "hypothesis") */
  type: string
  /** Template for the title (can include {{placeholders}}) */
  title_template: string
  /** Template for description */
  description_template?: string
  /** Pre-filled properties */
  default_properties?: Record<string, unknown>
  /** Pre-filled tags */
  default_tags?: string[]
  /** Pre-filled status */
  default_status?: string
}

/** A template set: multiple related entities created together */
export interface TemplateSet {
  /** Template ID */
  id: string
  /** Human-readable name */
  name: string
  /** Description shown in picker */
  description: string
  /** Which industries this applies to */
  industries: string[]
  /**
   * Which product stages this fits. Canonical UPG product stages
   * (`UPG_PRODUCT_STAGES` in core) — the conformance gate asserts each value is
   * a member, so this can never drift back to the legacy idea/mvp/scale vocab.
   */
  stages: ('concept' | 'validation' | 'build' | 'beta' | 'launch' | 'growth' | 'mature' | 'maintenance' | 'sunset')[]
  /** The entities to create */
  entities: EntityTemplate[]
  /**
   * Edges to create between entities (by index). `type` is the canonical UPG
   * edge type for the (source entity type → target entity type) pair; the
   * conformance gate asserts it matches `pickCanonicalEdge` from core, so an
   * edge can never silently drift from the spec.
   */
  edges?: Array<{ source_index: number; target_index: number; type: string }>
  /** Questions to ask the user to fill placeholders */
  prompts?: Record<string, string>
}

/**
 * A minimal, placeholder-free seed node for `upg init` quickstarts. Distinct
 * from the rich, prompt-driven {@link TemplateSet} library: starter seeds must
 * instantiate non-interactively (e.g. `upg init --template saas --yes`), so they
 * carry no `{{placeholders}}`. This package is the single source of truth for
 * starter graphs — the CLI consumes {@link STARTER_SEEDS} rather than defining
 * its own.
 */
export interface SeedNode {
  /** Entity type (must be a valid UPG type) */
  type: string
  /** Node title */
  title: string
  /** Optional description */
  description?: string
}

/** The starter-graph roster shared by the CLI `upg init --template` flag. */
export type StarterKey = 'blank' | 'saas' | 'marketplace' | 'mobile' | 'oss' | 'agency'
