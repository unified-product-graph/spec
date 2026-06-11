/**
 * UPG canonical tree patterns: the named, server-owned shapes the `get_tree`
 * tool assembles (OST, OKR, user, product, validation, strategy, feature areas,
 * delivery, architecture, journey, design system) — one per tree-shaped region.
 *
 * A tree pattern is anchor + a TYPE-DRIVEN child map, NOT a list of edge names.
 * `get_tree` roots at `anchor_type` (falling back through `fallback_anchors` when
 * the anchor has no nodes or yields a childless tree) and walks the live graph:
 * at a node of type T, a neighbour whose type is in `child_map[T]` becomes a
 * child, whatever edge wired them. This is deliberate: the `/upg-show-tree` skill
 * drifted precisely because it hardcoded edge names (e.g. `vision_guides_strategic_theme`)
 * that a real graph did not use (its bets anchored on the product). Following to
 * the next TYPE, not a named edge, is drift-proof: a chain refinement in the edge
 * catalogue cannot rot the pattern. Polymorphic parentage is native: a child type
 * is simply listed under every parent type that can hold it (a `strategic_theme`
 * appears under `vision`, `product`, and `strategic_pillar`).
 *
 * Each child carries a `required` flag. Only a MISSING required child produces a
 * `gap`; optional children render when present and are silent when absent. This
 * is what separates a real structural hole (a bet with no initiative) from noise
 * (a feature with no epic, where the epic tier is optional).
 *
 * The chains here were authored by resolving every (parent, child) pair against
 * the live catalogue (2026-06-11), and corrected against a post-ship report from
 * field-testing on a real 304-node graph (G1-G7).
 *
 * https://unifiedproductgraph.org | MIT
 */

/** One child slot in a pattern: a child entity type and whether it is gap-worthy. */
export interface UPGTreeChild {
  /** The child entity type. */
  type: string
  /**
   * When true, a parent of this slot's owning type that has NO child of `type`
   * is reported as a structural gap. Optional (default false) children render
   * when present and are silent when absent.
   */
  required?: boolean
}

/** A canonical tree shape for `get_tree`. */
export interface UPGTreePattern {
  /** Stable id (the `pattern` argument to get_tree). */
  id: string
  /** Display name. */
  label: string
  /** One-line description of what the tree shows. */
  description: string
  /** The framework this pattern realises, where one maps (else undefined). */
  framework_id?: string
  /** Canonical root entity type. */
  anchor_type: string
  /**
   * Root types tried, in order, when `anchor_type` has no nodes OR the assembled
   * tree reaches no descendants (the "wrong root, empty tree" case). The anchor
   * actually used is reported back in the get_tree metadata.
   */
  fallback_anchors: string[]
  /**
   * Type-driven adjacency: for a node of type `parent_type`, a graph neighbour
   * whose type is one of `child_map[parent_type]`'s slots is a child. Omitted
   * parent types are leaves. Branching is expressed by listing several slots; a
   * child type listed under several parents is polymorphically parented.
   */
  child_map: Record<string, UPGTreeChild[]>
  /** The pattern's natural rendering depth (default for get_tree's `depth`). */
  natural_depth: number
}

/** Sugar for a required child slot. */
const req = (type: string): UPGTreeChild => ({ type, required: true })
/** Sugar for an optional child slot. */
const opt = (type: string): UPGTreeChild => ({ type })

/**
 * The canonical tree patterns. Every type referenced is an active UPG entity
 * type; integrity tests assert that and that each pattern is reachable from its
 * anchor. Append-only by convention (ids are a public surface).
 */
export const UPG_TREE_PATTERNS: readonly UPGTreePattern[] = [
  {
    id: 'ost',
    label: 'Opportunity Solution Tree',
    description: 'A desired outcome branching into the opportunities under it, the solutions that address them, and the hypotheses + experiment plans that validate them (Teresa Torres).',
    framework_id: 'opportunity-solution-tree',
    anchor_type: 'outcome',
    fallback_anchors: ['desired_outcome', 'opportunity'],
    child_map: {
      outcome: [req('opportunity')],
      desired_outcome: [req('opportunity')],
      opportunity: [req('solution')],
      solution: [opt('hypothesis')],
      hypothesis: [opt('experiment_plan')],
    },
    natural_depth: 5,
  },
  {
    id: 'okr',
    label: 'Objectives and Key Results',
    description: 'Strategic themes containing objectives, each measured by its key results and the metric that quantifies them (John Doerr).',
    framework_id: 'okr-framework',
    anchor_type: 'strategic_theme',
    fallback_anchors: ['objective'],
    child_map: {
      strategic_theme: [req('objective')],
      objective: [req('key_result')],
      key_result: [opt('metric')],
    },
    natural_depth: 4,
  },
  {
    id: 'user',
    label: 'User chain',
    description: 'A persona and the jobs it pursues, branching into the needs and desired outcomes behind them.',
    anchor_type: 'persona',
    fallback_anchors: ['job'],
    child_map: {
      persona: [req('job'), opt('need'), opt('desired_outcome')],
      job: [opt('need'), opt('desired_outcome')],
    },
    natural_depth: 3,
  },
  {
    id: 'product',
    label: 'Product breakdown',
    description: 'The product organised into feature areas, then features, and the optional epic + user story tiers beneath them.',
    anchor_type: 'product',
    fallback_anchors: ['feature_area', 'feature'],
    child_map: {
      product: [opt('feature_area')],
      feature_area: [req('feature')],
      feature: [opt('epic')],
      epic: [opt('user_story')],
    },
    natural_depth: 5,
  },
  {
    id: 'validation',
    label: 'Validation chain',
    description: 'A hypothesis through its experiment plan, the experiment (or its runs), and the learning it produced.',
    framework_id: 'build-measure-learn',
    anchor_type: 'hypothesis',
    fallback_anchors: ['experiment_plan', 'experiment'],
    child_map: {
      hypothesis: [req('experiment_plan')],
      experiment_plan: [req('experiment'), req('experiment_run')],
      experiment: [opt('experiment_run'), opt('learning')],
      experiment_run: [opt('learning')],
    },
    natural_depth: 5,
  },
  {
    id: 'strategy',
    label: 'Strategy cascade',
    description: 'Vision and mission into the strategic themes (bets), the initiatives that pursue them, and the outcomes they drive. Themes are polymorphically parented: they hang off vision, the product, or a strategic pillar, whichever the graph wired.',
    anchor_type: 'vision',
    fallback_anchors: ['product', 'strategic_theme'],
    child_map: {
      vision: [opt('mission'), opt('strategic_theme')],
      mission: [opt('strategic_pillar')],
      strategic_pillar: [opt('strategic_theme')],
      product: [opt('strategic_theme')],
      strategic_theme: [req('initiative')],
      initiative: [opt('outcome')],
    },
    natural_depth: 5,
  },
  {
    id: 'feature_areas',
    label: 'Feature areas',
    description: 'Feature areas and the features they contain.',
    anchor_type: 'feature_area',
    fallback_anchors: ['feature'],
    child_map: {
      feature_area: [opt('feature')],
    },
    natural_depth: 2,
  },
  {
    id: 'delivery',
    label: 'Delivery roadmap',
    description: 'How product work is scheduled and shipped: the roadmap and its themes/items, the releases they schedule, the features (and the changelog + bugs) those releases deliver, and the feature areas a theme spans. Optional epic + user story tiers appear on request.',
    anchor_type: 'roadmap',
    // Fallback is the product alone: a graph with no roadmap roots at the
    // product (product -> release -> feature), reported as anchor_resolved_from:
    // roadmap. `release` is deliberately NOT a fallback root — a 32-release
    // forest would out-node the product and shadow it under the most-nodes rule.
    fallback_anchors: ['product'],
    child_map: {
      // product holds releases directly (the delivery axis without a roadmap),
      // but NOT the roadmap: listing roadmap here made the product a superset of
      // the roadmap, so the most-nodes anchor rule rooted delivery at the product
      // even when a roadmap existed. Dropping it lets the roadmap win when present.
      product: [opt('release')],
      roadmap: [opt('roadmap_theme'), opt('roadmap_item'), opt('release')],
      roadmap_theme: [opt('feature'), opt('feature_area')],
      roadmap_item: [opt('feature')],
      release: [opt('feature'), opt('changelog'), opt('bug')],
      feature: [opt('epic')],
      epic: [opt('user_story')],
    },
    // Default to 3 tiers (roadmap -> theme/item/release -> feature) for a
    // readable overview on a many-release roadmap; `depth` extends into
    // epic -> user_story.
    natural_depth: 3,
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'The engineering platform: services and the API contracts, endpoints, schemas, queues, deployments, and dependencies they own, grouped by bounded context, with domain aggregates and their members. A DAG (a schema or queue shared by several services renders once, then as a reference).',
    anchor_type: 'service',
    fallback_anchors: ['bounded_context'],
    child_map: {
      bounded_context: [
        opt('service'), opt('external_api'), opt('data_flow'), opt('integration_pattern'),
        opt('code_repository'), opt('api_contract'), opt('aggregate'), opt('domain_event'),
      ],
      service: [
        opt('api_contract'), opt('api_endpoint'), opt('database_schema'), opt('queue_topic'),
        opt('deployment'), opt('build_artifact'), opt('library_dependency'), opt('feature_flag'),
      ],
      aggregate: [opt('domain_entity'), opt('value_object'), opt('command'), opt('read_model'), opt('domain_event')],
    },
    natural_depth: 3,
  },
  {
    id: 'journey',
    label: 'User journey',
    description: 'A user journey over time: its phases and steps, the actions within each step, and the screens those steps surface. Falls back to a user_flow when journeys are not yet mapped.',
    anchor_type: 'user_journey',
    fallback_anchors: ['user_flow'],
    child_map: {
      user_journey: [opt('journey_phase'), opt('journey_step')],
      journey_phase: [opt('journey_step')],
      journey_step: [opt('journey_action'), opt('screen')],
      user_flow: [opt('screen')],
      screen: [opt('screen_state')],
    },
    natural_depth: 3,
  },
  {
    id: 'design_system',
    label: 'Design system',
    description: 'A design system broken into its components, their nested sub-components (atom to molecule to organism), and the design tokens they consume.',
    anchor_type: 'design_system',
    fallback_anchors: ['design_component'],
    child_map: {
      design_system: [opt('design_component'), opt('design_token')],
      design_component: [opt('design_component'), opt('design_token')],
    },
    natural_depth: 3,
  },
] as const

/** O(1) lookup by pattern id. */
export const UPG_TREE_PATTERNS_BY_ID: Record<string, UPGTreePattern> = Object.fromEntries(
  UPG_TREE_PATTERNS.map((p) => [p.id, p]),
)

/** Look up a tree pattern by id. */
export function getTreePattern(id: string): UPGTreePattern | undefined {
  return UPG_TREE_PATTERNS_BY_ID[id]
}
