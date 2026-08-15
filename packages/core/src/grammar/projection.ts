/**
 * UPG Configuration Projection (0.30.0).
 *
 * The stored graph is the UNION of a configuration family. A single
 * configuration is a PROJECTION of it, and this is the operator that takes one.
 *
 * π(G, C) drops what a named configuration does not contain and leaves
 * everything else exactly as it was. Facts that carry no configuration
 * qualification are invariant: they belong to every member of the family, which
 * is why a graph written before this existed projects to itself under every C
 * and needs no migration.
 *
 * PURE, AND DELIBERATELY STORE-FREE. It takes node and edge arrays and returns
 * node and edge arrays, so the local file store, the cloud SQL store and a
 * synthetic store built for validation preview all reuse one definition of what
 * a projection IS. A projection implemented twice is two projections.
 *
 * READ-ONLY. Nothing writes a projected graph back. The union is the file.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

/** The minimum a node must expose to be projected. */
export interface ProjectableNode {
  id: string
  type?: string
  properties?: Record<string, unknown> | undefined
}

/** The minimum an edge must expose to be projected. */
export interface ProjectableEdge {
  id?: string
  source: string
  target: string
  type?: string
  properties?: Record<string, unknown> | undefined
}

/**
 * A configuration: axis node id to the single value that holds on it.
 *
 * PARTIAL BY DESIGN. An axis absent from the map is not applied, so every fact
 * qualified on it is retained. Projecting on nothing returns the union, which
 * makes a configuration a strictly narrowing filter an agent can apply
 * incrementally rather than an all-or-nothing mode.
 */
export type Configuration = Readonly<Record<string, string>>

/** The edge that declares conditional existence. */
export const VARIES_BY_EDGE = 'surface_varies_by_configuration_axis'

/** The property carried by that edge. */
export const PRESENT_UNDER_PROPERTY = 'present_under'

/** The qualifier property carried by the two composition edges. */
export const ACTIVE_WHEN_PROPERTY = 'active_when'

/**
 * The only edge types on which `active_when` is legal (D3).
 *
 * Scope is enforced, not merely documented: `validate_graph`'s
 * `configuration_drift` scope reports the qualifier on any other edge type as
 * an error. The projection operator itself is deliberately permissive here (it
 * honours a qualifier wherever it finds one) so that a graph carrying an
 * illegal qualifier still projects predictably while the validator names the
 * problem. Silently ignoring it would make the drift invisible in the one view
 * where its effect shows.
 */
export const QUALIFIABLE_EDGE_TYPES: readonly string[] = [
  'surface_contains_surface',
  'feature_occupies_surface',
]

/** Result of a projection: the surviving nodes and edges, plus what it dropped. */
export interface ProjectionResult<
  N extends ProjectableNode = ProjectableNode,
  E extends ProjectableEdge = ProjectableEdge,
> {
  nodes: N[]
  edges: E[]
  /** Node ids dropped because the configuration excluded them. */
  excluded_node_ids: string[]
  /** Count of edges dropped because their own qualifier excluded them. */
  deactivated_edge_count: number
  /** Count of edges dropped because an endpoint was excluded. */
  dangling_edge_count: number
}

/**
 * Read a string array property defensively; anything else reads as absent.
 *
 * Exported so the drift checker and the read-tool view share one reading of
 * what a list-valued configuration property is. Three copies of this drifting
 * apart is how a value the validator accepts becomes a value the projection
 * ignores.
 */
export function readStringArray(
  properties: Record<string, unknown> | undefined,
  key: string,
): string[] | undefined {
  const raw = properties?.[key]
  if (!Array.isArray(raw)) return undefined
  return raw.filter((v): v is string => typeof v === 'string')
}

/**
 * Read an `active_when` qualifier, or undefined when the edge carries none or
 * carries something malformed.
 *
 * A malformed qualifier reads as ABSENT rather than as "excludes everything".
 * Absence means the relationship is invariant, so a broken qualifier leaves the
 * edge in every projection: the graph shows too much rather than too little,
 * and `configuration_drift` reports the malformation by name. The alternative
 * would let one bad property silently delete structure from every view.
 */
export function readActiveWhen(
  edge: ProjectableEdge,
): { axis: string; values: string[] } | undefined {
  const raw = edge.properties?.[ACTIVE_WHEN_PROPERTY]
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const axis = (raw as Record<string, unknown>).axis
  const values = readStringArray(raw as Record<string, unknown>, 'values')
  // An EMPTY values list is malformed, not "holds under nothing". Honouring it
  // literally would deactivate the edge in every projection AND in the union,
  // which is a way to delete a relationship from the whole graph by writing a
  // property. Treated as absent here (so the edge stays invariant) and reported
  // by `configuration_drift` as `qualifier_values_empty`.
  if (typeof axis !== 'string' || axis.length === 0 || !values || values.length === 0) {
    return undefined
  }
  return { axis, values }
}

/**
 * Project a graph onto one configuration.
 *
 * Applied in order, ONCE. The operator is a filter, not a solver:
 *
 *  1. NODE EXCLUSION. A node is dropped when it declares variance on an axis
 *     named in `configuration` and the chosen value is not in its
 *     `present_under`. A node that says nothing about a named axis is retained,
 *     because silence means invariant.
 *  2. EDGE DEACTIVATION. An edge is dropped when its own `active_when` names an
 *     axis in `configuration` and the chosen value is not among its values.
 *  3. DANGLING REMOVAL. Any surviving edge with an endpoint dropped in step 1
 *     goes too.
 *
 * NO CASCADE, AND THIS IS THE SUBTLE PART. A child surface is NOT dropped
 * because its parent was. The motivating field case is precisely a surface
 * whose PARENT changes under the flag (a navigation row splits in two and an
 * occupant moves into the new row), so cascading would delete a surface that is
 * genuinely present. A surface that survives with no containment parent in that
 * projection is a modelling gap for the validator to report, not a deletion for
 * the operator to guess at.
 *
 * COMMUTATIVE ACROSS AXES. Each axis's predicate reads only that axis, so
 * projecting on two axes in either order, or both at once, gives the same
 * result. Multi-axis projection therefore needs no ordering rule.
 *
 * @example
 * // A graph where the inspector exists only under the split-nav flag.
 * projectGraph(nodes, edges, { axis_nav: 'legacy_nav' }).nodes
 * // → every node except the split-nav-only surfaces
 */
export function projectGraph<
  N extends ProjectableNode = ProjectableNode,
  E extends ProjectableEdge = ProjectableEdge,
>(nodes: N[], edges: E[], configuration: Configuration): ProjectionResult<N, E> {
  const axes = Object.keys(configuration)
  // Identity fast path. A projection that names no axis, or a graph that
  // declares no variance, returns the union unchanged. This is the
  // zero-migration guarantee in code: nothing written before 0.30.0 can be
  // altered by a projection.
  if (axes.length === 0) {
    return {
      nodes: [...nodes],
      edges: [...edges],
      excluded_node_ids: [],
      deactivated_edge_count: 0,
      dangling_edge_count: 0,
    }
  }

  // Step 1: node exclusion, driven by the varies_by edges.
  const excluded = new Set<string>()
  for (const edge of edges) {
    if (edge.type !== VARIES_BY_EDGE) continue
    const chosen = configuration[edge.target]
    if (chosen === undefined) continue // axis not named: nothing to apply
    const presentUnder = readStringArray(edge.properties, PRESENT_UNDER_PROPERTY)
    // A varies_by edge with no readable `present_under` states a dependency
    // without saying what it depends on. Treated as invariant (the node stays)
    // so a malformed declaration cannot silently delete a surface; the
    // validator reports it as drift instead.
    if (!presentUnder) continue
    if (!presentUnder.includes(chosen)) excluded.add(edge.source)
  }

  const survivingNodes = excluded.size === 0 ? [...nodes] : nodes.filter((n) => !excluded.has(n.id))

  // Steps 2 and 3: edge deactivation, then dangling removal.
  let deactivated = 0
  let dangling = 0
  const survivingEdges: E[] = []
  for (const edge of edges) {
    const qualifier = readActiveWhen(edge)
    if (qualifier) {
      const chosen = configuration[qualifier.axis]
      if (chosen !== undefined && !qualifier.values.includes(chosen)) {
        deactivated++
        continue
      }
    }
    if (excluded.has(edge.source) || excluded.has(edge.target)) {
      dangling++
      continue
    }
    survivingEdges.push(edge)
  }

  return {
    nodes: survivingNodes,
    edges: survivingEdges,
    excluded_node_ids: [...excluded].sort(),
    deactivated_edge_count: deactivated,
    dangling_edge_count: dangling,
  }
}

/**
 * Every configuration this graph can be projected onto, one axis at a time.
 *
 * PER-AXIS, NOT CARTESIAN. The list is the union (an empty configuration) plus
 * one entry per declared value of each axis: `1 + Σ|values|`, linear in the
 * declarations. The cartesian product across axes is combinatorial and buys
 * nothing here, because every v1 qualifier reads a single axis and every check
 * that consumes a projection is surface-local. Cross-axis interaction is a
 * stated non-goal; when a detector needs it, this is the function that grows.
 */
export function enumerateProjections(
  nodes: ProjectableNode[],
): Array<{ axis?: string; value?: string; configuration: Configuration }> {
  const out: Array<{ axis?: string; value?: string; configuration: Configuration }> = [
    { configuration: {} },
  ]
  for (const node of nodes) {
    if (node.type !== 'configuration_axis') continue
    const values = readStringArray(node.properties, 'values')
    if (!values) continue
    for (const value of values) {
      out.push({ axis: node.id, value, configuration: { [node.id]: value } })
    }
  }
  return out
}
