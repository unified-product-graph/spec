/**
 * UPG canonical tree patterns: the named, server-owned shapes the `get_tree`
 * tool assembles (OST, OKR, user, product, validation, strategy, feature areas).
 *
 * A tree pattern is anchor + a TYPE-DRIVEN child map, NOT a list of edge names.
 * `get_tree` roots at `anchor_type` (falling back through `fallback_anchors` when
 * the anchor has no nodes or yields a childless tree) and walks the live graph:
 * at a node of type T, a neighbour whose type is in `child_map[T]` becomes a
 * child, whatever edge wired them. This is deliberate: the `/upg-show-tree` skill
 * drifted precisely because it hardcoded edge names (e.g. `vision_guides_strategic_theme`)
 * that a real graph did not use (its bets anchored on the product). Following to
 * the next TYPE, not a named edge, is drift-proof: a chain refinement in the edge
 * catalogue cannot rot the pattern.
 *
 * The chains here were authored by resolving every (parent, child) pair against
 * the live catalogue with `pickCanonicalEdge` / `resolveAllEdges` (2026-06-11).
 *
 * https://unifiedproductgraph.org | MIT
 */

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
   * whose type is in `child_map[parent_type]` is a child. Omitted parent types
   * are leaves. Branching is expressed by listing several child types.
   */
  child_map: Record<string, string[]>
  /** The pattern's natural rendering depth (default for get_tree's `depth`). */
  natural_depth: number
}

/**
 * The 7 canonical tree patterns. Every type referenced is an active UPG entity
 * type; integrity tests assert that and that each pattern is reachable from its
 * anchor. Append-only by convention (ids are a public surface).
 */
export const UPG_TREE_PATTERNS: readonly UPGTreePattern[] = [
  {
    id: 'ost',
    label: 'Opportunity Solution Tree',
    description: 'A desired outcome branching into the opportunities under it and the solutions that address them (Teresa Torres).',
    framework_id: 'opportunity-solution-tree',
    anchor_type: 'outcome',
    fallback_anchors: ['desired_outcome', 'opportunity'],
    child_map: {
      outcome: ['opportunity'],
      desired_outcome: ['opportunity'],
      opportunity: ['solution'],
    },
    natural_depth: 3,
  },
  {
    id: 'okr',
    label: 'Objectives and Key Results',
    description: 'Strategic themes containing objectives, each measured by its key results (John Doerr).',
    framework_id: 'okr-framework',
    anchor_type: 'strategic_theme',
    fallback_anchors: ['objective'],
    child_map: {
      strategic_theme: ['objective'],
      objective: ['key_result'],
    },
    natural_depth: 3,
  },
  {
    id: 'user',
    label: 'User chain',
    description: 'A persona and the jobs it pursues, branching into the needs and desired outcomes behind them.',
    anchor_type: 'persona',
    fallback_anchors: ['job'],
    child_map: {
      persona: ['job', 'need', 'desired_outcome'],
      job: ['need', 'desired_outcome'],
    },
    natural_depth: 3,
  },
  {
    id: 'product',
    label: 'Product breakdown',
    description: 'The product organised into feature areas, then features, epics, and user stories.',
    anchor_type: 'product',
    fallback_anchors: ['feature_area', 'feature'],
    child_map: {
      product: ['feature_area'],
      feature_area: ['feature'],
      feature: ['epic'],
      epic: ['user_story'],
    },
    natural_depth: 5,
  },
  {
    id: 'validation',
    label: 'Validation chain',
    description: 'A hypothesis through its experiment plan, experiment, run, and the learning it produced.',
    framework_id: 'build-measure-learn',
    anchor_type: 'hypothesis',
    fallback_anchors: ['experiment_plan', 'experiment'],
    child_map: {
      hypothesis: ['experiment_plan'],
      experiment_plan: ['experiment'],
      experiment: ['experiment_run'],
      experiment_run: ['learning'],
    },
    natural_depth: 5,
  },
  {
    id: 'strategy',
    label: 'Strategy cascade',
    description: 'Vision and mission into the strategic themes (bets), the initiatives that pursue them, and the outcomes they drive. Themes anchor on vision OR the product, whichever the graph wired.',
    anchor_type: 'vision',
    fallback_anchors: ['product', 'strategic_theme'],
    child_map: {
      vision: ['mission', 'strategic_theme'],
      product: ['strategic_theme'],
      mission: ['strategic_theme'],
      strategic_theme: ['initiative'],
      initiative: ['outcome'],
    },
    natural_depth: 4,
  },
  {
    id: 'feature_areas',
    label: 'Feature areas',
    description: 'Feature areas and the features they contain.',
    anchor_type: 'feature_area',
    fallback_anchors: ['feature'],
    child_map: {
      feature_area: ['feature'],
    },
    natural_depth: 2,
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
