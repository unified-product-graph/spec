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
  /** Which product stages this fits */
  stages: ('idea' | 'mvp' | 'growth' | 'scale')[]
  /** The entities to create */
  entities: EntityTemplate[]
  /** Edges to create between entities (by index) */
  edges?: Array<{ source_index: number; target_index: number }>
  /** Questions to ask the user to fill placeholders */
  prompts?: Record<string, string>
}
