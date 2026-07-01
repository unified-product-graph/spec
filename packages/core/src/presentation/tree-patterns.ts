/**
 * UPG canonical tree patterns: the named, server-owned shapes the `get_tree`
 * tool assembles (OST, OKR, user, product, validation, strategy, feature areas,
 * delivery, architecture, journey, design system, commercial, north star, org) —
 * one per tree-shaped region (or, for `architecture`/`commercial`/`org`, the
 * tree-shaped containment subset of a DAG/multi-hub region).
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

import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'

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
  /**
   * The node property `get_tree` sorts this slot's children by (ascending,
   * nodes lacking it last). Ordering is a property of the DATA, not the viewer,
   * so the server returns children pre-sorted rather than leaving every client
   * to re-sort ( sequence scalars: `phase_order`, `step_order`,
   * `action_order`, `state_order`). Omitted -> children keep declared slot order.
   */
  order_by?: string
  /**
   * Spine resolution for a DAG. When this slot reaches the SAME node redundantly
   * with a path through a sibling type (e.g. `user_journey -> journey_step`
   * directly AND `user_journey -> journey_phase -> journey_step`), name that
   * sibling type here. A child also reachable as a grandchild through a
   * `prefer_via`-typed child renders under that spine, NOT here -- collapsing the
   * redundant path so the node is neither silently dropped (G5) nor
   * double-counted (J1). A child not on the spine still renders here, so the
   * direct path remains the fallback when the grouping layer is absent.
   */
  prefer_via?: string
}

/** How a pattern decides what counts as a structural gap. */
export type UPGTreeGapPolicy = 'required-children-only' | 'all-optional'

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
  /**
   * The canonical region this pattern is the tree view of (ties pattern ->
   * region -> its `shape`). A region may afford several patterns (e.g.
   * `product_delivery` has product, feature_areas, and delivery).
   */
  region: string
  /**
   * `required-children-only`: a node missing a required child type is a gap.
   * `all-optional`: a browse view; nothing is gap-flagged (heterogeneous wiring
   * where gap-flagging would be noise). Descriptive; the assembler already
   * derives gaps from the per-child `required` flags.
   */
  gap_policy: UPGTreeGapPolicy
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

/** Sugar for a required child slot (optionally ordered by a node scalar). */
const req = (type: string, order_by?: string): UPGTreeChild =>
  order_by ? { type, required: true, order_by } : { type, required: true }
/** Sugar for an optional child slot (optionally ordered by a node scalar). */
const opt = (type: string, order_by?: string): UPGTreeChild =>
  order_by ? { type, order_by } : { type }

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
    region: 'discovery_research_validation',
    gap_policy: 'required-children-only',
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
    region: 'strategy_outcomes',
    gap_policy: 'required-children-only',
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
    region: 'users_needs',
    gap_policy: 'required-children-only',
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
    region: 'product_delivery',
    gap_policy: 'required-children-only',
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
    region: 'discovery_research_validation',
    gap_policy: 'required-children-only',
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
    region: 'strategy_outcomes',
    gap_policy: 'required-children-only',
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
    region: 'product_delivery',
    gap_policy: 'all-optional',
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
    region: 'product_delivery',
    gap_policy: 'all-optional',
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
    region: 'engineering_platform',
    gap_policy: 'all-optional',
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
      aggregate: [opt('domain_entity'), opt('value_object'), opt('command'), opt('domain_event')],
    },
    natural_depth: 3,
  },
  {
    id: 'journey',
    label: 'User journey',
    description: 'A user journey over time: its phases and steps, the actions within each step, and the screens those steps surface. Falls back to a user_flow when journeys are not yet mapped.',
    region: 'experience_design_brand',
    gap_policy: 'all-optional',
    anchor_type: 'user_journey',
    fallback_anchors: ['user_flow'],
    child_map: {
      // The phase is the grouping layer: a step reachable through a phase
      // renders under the phase, not twice (J1). `prefer_via` collapses the
      // redundant direct path; a step in NO phase still renders here. Children
      // are returned in `*_order` sequence (J2), not storage order.
      user_journey: [
        opt('journey_phase', 'phase_order'),
        { type: 'journey_step', prefer_via: 'journey_phase', order_by: 'step_order' },
      ],
      journey_phase: [opt('journey_step', 'step_order')],
      journey_step: [opt('journey_action', 'action_order'), opt('screen')],
      user_flow: [opt('screen')],
      screen: [opt('screen_state', 'state_order')],
    },
    natural_depth: 3,
  },
  {
    id: 'design_system',
    label: 'Design system',
    description: 'A design system broken into its components, their nested sub-components (atom to molecule to organism), and the design tokens they consume.',
    region: 'experience_design_brand',
    gap_policy: 'all-optional',
    anchor_type: 'design_system',
    fallback_anchors: ['design_component'],
    child_map: {
      design_system: [opt('design_component'), opt('design_token')],
      design_component: [opt('design_component'), opt('design_token')],
    },
    natural_depth: 3,
  },
  {
    id: 'commercial',
    label: 'Commercial / money model',
    description: 'The business-model spine: how the product captures value. The business model branches into its revenue streams, cost structure, and unit economics; a stream into its pricing tiers, the metrics that measure it, and the pricing strategy that prices it; and metrics decompose into their components (the MRR waterfall, NRR composition). A pricing tier reached from both its stream and its pricing strategy renders once, then as a shared reference.',
    // The sustaining money-model captures value as a containment hierarchy, so it
    // earns a tree even though business_gtm_growth is a multi-hub region: a pattern
    // is a curated spanning tree over a SUBSET of a region (cf. `architecture` over
    // the engineering_platform DAG). The GTM/value flow (positioning -> messaging
    // -> funnel) is deliberately NOT here — a tree would misrepresent it; it wants
    // sibling flow instruments. Company-grain financial metrics (CAC, LTV, runway)
    // hang off the product, not a single stream/cost, so they live in the okr/
    // strategy views, not this money-structure spine.
    region: 'business_gtm_growth',
    gap_policy: 'all-optional',
    anchor_type: 'business_model',
    // Fallback is the product alone, and product is deliberately NOT a child_map
    // parent: were business_model listed under product, the product would be a
    // superset of the money spine and the most-nodes anchor rule would root there
    // (the same trap delivery hit with product -> roadmap). With product childless,
    // business_model always out-nodes it and wins; a graph with no business_model
    // falls back to a bare product root, reported anchor_resolved_from: business_model.
    fallback_anchors: ['product'],
    child_map: {
      business_model: [opt('revenue_stream'), opt('cost_structure'), opt('unit_economics')],
      revenue_stream: [opt('pricing_tier'), opt('metric'), opt('pricing_strategy')],
      cost_structure: [opt('metric')],
      pricing_strategy: [opt('pricing_tier')],
      // Self-nesting: a metric decomposes into its component metrics (Net New MRR ->
      // New/Expansion/Contraction/Churned). The assembler's `seen` set terminates
      // the recursion for free (a metric met again becomes a shared reference).
      metric: [opt('metric')],
    },
    // Default to 3 tiers (business_model -> stream/cost -> tier/metric) for a
    // readable money-model overview; `depth` extends into the metric -> metric
    // decomposition waterfall.
    natural_depth: 3,
  },
  {
    id: 'north_star',
    label: 'North Star impact',
    description: 'A north-star metric, the input/sub-metrics it decomposes into, and the outcomes it drives. The metric-rooted, leading-indicator view: outcomes hang off the metric by influence (the causal `drives` edge), distinct from the OKR view where the outcome sits on top and the metric measures it.',
    framework_id: 'north-star-metric',
    region: 'strategy_outcomes',
    gap_policy: 'all-optional',
    anchor_type: 'metric',
    // A north-star tree roots at a metric by definition; no fallback (no metric =
    // no north-star view, honestly empty rather than rooting elsewhere).
    fallback_anchors: [],
    child_map: {
      // A metric decomposes into its input/sub-metrics (the `metric_decomposes_into_metric`
      // hierarchy) AND drives the outcomes it predicts (the causal `metric_drives_outcome`).
      // The outcome is a child by INFLUENCE, not containment — the leading-to-lagging chain.
      // Following the causal edge by type-adjacency (cf. `strategy`'s initiative -> outcome)
      // is how the metric-rooted view renders without re-creating the metric ⊃ outcome
      // containment cycle removed in T0.4. The assembler's `seen` set terminates the
      // metric -> metric recursion for free.
      metric: [opt('metric'), opt('outcome')],
    },
    natural_depth: 3,
  },
  {
    id: 'org',
    label: 'Org chart',
    description: 'Departments and the teams they contain, plus the sub-teams nested within those teams. The people-structure org chart, walked by containment (department_contains_team, then team_contains_team). Distinct from product_area, which is the product classification axis, not the org.',
    region: 'operations_quality',
    gap_policy: 'all-optional',
    anchor_type: 'department',
    // A graph with no department roots at the team (team -> sub-team), reported
    // anchor_resolved_from: department. A sub-team also renders as a bare team
    // root when its parent department is not modelled.
    fallback_anchors: ['team'],
    child_map: {
      // department -> team (department_contains_team) is the first level; team ->
      // team (team_contains_team, 0.17.2) is the second, so a sub-team nested one
      // level deeper than department_contains_team renders under its parent team.
      // Self-nesting: the assembler's `seen` set terminates a team -> team cycle
      // for free (a team met again becomes a shared reference).
      department: [opt('team')],
      team: [opt('team')],
    },
    // Default to 3 tiers (department -> team -> sub-team); `depth` extends into
    // deeper team_contains_team nesting.
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

/**
 * One resolved edge in a pattern's child map: the (parent -> child) pair plus
 * the canonical edge that wires it, resolved LIVE from the edge catalogue (not
 * stored on the pattern). `via`/`kind` are null only if the grammar has no edge
 * for the pair, which the drift-check forbids. A reader gets the real edge
 * without reverse-engineering it from behaviour.
 */
export interface UPGTreePatternEdge {
  parent: string
  child: string
  /** Canonical edge type wiring parent -> child, or null if ungrounded. */
  via: string | null
  /** The edge's classification (hierarchy, semantic, cross-domain, ...), or null. */
  kind: string | null
  required: boolean
  /** Node scalar this slot's children are sorted by, when declared (J2). */
  order_by?: string
  /** Sibling type whose path is the canonical spine for this child (J1), when declared. */
  prefer_via?: string
}

/** A pattern with its child map resolved to concrete edges (for introspection). */
export interface UPGTreePatternDetail extends UPGTreePattern {
  /** The child_map flattened to (parent, child, via, kind, required) rows. */
  edges: UPGTreePatternEdge[]
}

/** A pattern summary row (no child_map) for list_tree_patterns. */
export interface UPGTreePatternSummary {
  id: string
  label: string
  description: string
  framework_id?: string
  region: string
  anchor_type: string
  fallback_anchors: string[]
  natural_depth: number
  gap_policy: UPGTreeGapPolicy
  /** Number of (parent -> child) slots in the child map. */
  slot_count: number
}

/**
 * The canonical edge wiring `source -> target`, resolved from the edge
 * catalogue. Returns the FIRST catalogue edge whose endpoints match (a pair is
 * wired by at most one canonical within-product edge). null when the grammar
 * has no such edge.
 */
function resolvePatternEdge(source: string, target: string): { via: string; kind: string } | null {
  for (const [id, def] of Object.entries(UPG_EDGE_CATALOG)) {
    if (def.source_type === source && def.target_type === target) {
      return { via: id, kind: def.classification }
    }
  }
  return null
}

/** Flatten a pattern's child_map to resolved (parent, child, via, kind) edges. */
export function resolveTreePatternEdges(pattern: UPGTreePattern): UPGTreePatternEdge[] {
  const out: UPGTreePatternEdge[] = []
  for (const [parent, children] of Object.entries(pattern.child_map)) {
    for (const c of children) {
      const e = resolvePatternEdge(parent, c.type)
      const row: UPGTreePatternEdge = { parent, child: c.type, via: e?.via ?? null, kind: e?.kind ?? null, required: !!c.required }
      if (c.order_by) row.order_by = c.order_by
      if (c.prefer_via) row.prefer_via = c.prefer_via
      out.push(row)
    }
  }
  return out
}

/**
 * The full declarative record for one pattern: the pattern plus its child_map
 * resolved to concrete edges. The `via`/`kind` are derived from the live edge
 * catalogue at call time, so they cannot drift from the grammar.
 */
export function describeTreePattern(id: string): UPGTreePatternDetail | undefined {
  const p = getTreePattern(id)
  if (!p) return undefined
  return { ...p, fallback_anchors: [...p.fallback_anchors], edges: resolveTreePatternEdges(p) }
}

/** Every pattern as a summary row (the list_tree_patterns surface). */
export function listTreePatternSummaries(): UPGTreePatternSummary[] {
  return UPG_TREE_PATTERNS.map((p) => ({
    id: p.id,
    label: p.label,
    description: p.description,
    framework_id: p.framework_id,
    region: p.region,
    anchor_type: p.anchor_type,
    fallback_anchors: [...p.fallback_anchors],
    natural_depth: p.natural_depth,
    gap_policy: p.gap_policy,
    slot_count: Object.values(p.child_map).reduce((n, cs) => n + cs.length, 0),
  }))
}
