/**
 * UPG Configuration Drift (0.30.0).
 *
 * Structural checking of the configuration declarations themselves: that an
 * axis is well formed, that every value named anywhere is a value the axis
 * actually declares, that the qualifier appears only where it is legal, and
 * that a declared alternation is consistent with what the declarations imply.
 *
 * DRIFT, NOT AN ANTI-PATTERN. These are contradictions inside the model, the
 * same family as an unknown entity type or a status outside its lifecycle: a
 * graph carrying one is saying something it cannot mean. Anti-patterns are the
 * other thing, judgements about a graph that is internally consistent, and
 * 0.30.0 deliberately mints none of those (a detector with no field evidence
 * behind it is how a check family gets noisy).
 *
 * Runs on the UNION. The declarations are facts about the whole family, so they
 * are checked once, not once per projection. The single exception is
 * `orphaned_under_projection`, which by definition can only be seen by taking
 * one.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import {
  projectGraph,
  readActiveWhen,
  readStringArray,
  ACTIVE_WHEN_PROPERTY,
  PRESENT_UNDER_PROPERTY,
  QUALIFIABLE_EDGE_TYPES,
  VARIES_BY_EDGE,
  type ProjectableEdge,
  type ProjectableNode,
} from './projection.js'

/** The kinds of configuration drift the validator reports. */
export type ConfigurationDriftKind =
  | 'axis_values_empty'
  | 'axis_default_not_a_value'
  | 'present_under_empty'
  | 'present_under_unknown_value'
  | 'qualifier_axis_unresolved'
  | 'qualifier_values_empty'
  | 'qualifier_unknown_value'
  | 'qualifier_on_illegal_edge'
  | 'alternation_axis_mismatch'
  | 'alternation_overlap'
  | 'orphaned_under_projection'

/** One configuration-drift finding. */
export interface ConfigurationDriftFinding {
  kind: ConfigurationDriftKind
  /**
   * `error` means the graph contradicts itself and a projection of it cannot be
   * trusted. `warning` means the graph is coherent but a projection of it has a
   * gap worth looking at.
   */
  severity: 'error' | 'warning'
  /** The node this finding is about, when it is about a node. */
  node_id?: string
  /** The edge this finding is about, when it is about an edge. */
  edge_id?: string
  /** The axis involved, where one is identifiable. */
  axis_id?: string
  /** Human-readable statement of what is wrong. */
  message: string
}

const ALTERNATES_EDGE = 'surface_alternates_with_surface'
const PARENT_EDGE_TYPES = new Set(['surface_contains_surface', 'screen_renders_surface'])

function edgeLabel(edge: ProjectableEdge): string {
  return edge.id ?? `${edge.source} -> ${edge.target}`
}

/**
 * Check every configuration declaration in a graph.
 *
 * @param nodes All nodes in the union.
 * @param edges All edges in the union.
 * @returns Findings, in a stable order: axis checks, then variance, then
 *   qualifiers, then alternation, then the per-projection orphan warning.
 */
export function checkConfigurationDrift(
  nodes: ProjectableNode[],
  edges: ProjectableEdge[],
): ConfigurationDriftFinding[] {
  const findings: ConfigurationDriftFinding[] = []

  // ── Axes ───────────────────────────────────────────────────────────────────
  const axisValues = new Map<string, string[]>()
  for (const node of nodes) {
    if (node.type !== 'configuration_axis') continue
    const values = readStringArray(node.properties, 'values')
    if (!values || values.length === 0) {
      findings.push({
        kind: 'axis_values_empty',
        severity: 'error',
        node_id: node.id,
        axis_id: node.id,
        message:
          'Configuration axis declares no values. An axis with no values selects nothing, so no projection can be taken along it.',
      })
      axisValues.set(node.id, [])
      continue
    }
    axisValues.set(node.id, values)

    const rawDefault = node.properties?.default_value
    if (typeof rawDefault === 'string' && rawDefault.length > 0 && !values.includes(rawDefault)) {
      findings.push({
        kind: 'axis_default_not_a_value',
        severity: 'error',
        node_id: node.id,
        axis_id: node.id,
        message: `default_value "${rawDefault}" is not one of the axis values [${values.join(', ')}]. It names a value of this axis, so it has to be one the axis declares.`,
      })
    }
  }

  // ── Conditional existence ──────────────────────────────────────────────────
  for (const edge of edges) {
    if (edge.type !== VARIES_BY_EDGE) continue
    const values = axisValues.get(edge.target)
    const presentUnder = readStringArray(edge.properties, PRESENT_UNDER_PROPERTY)

    if (!presentUnder || presentUnder.length === 0) {
      findings.push({
        kind: 'present_under_empty',
        severity: 'error',
        edge_id: edge.id,
        node_id: edge.source,
        axis_id: edge.target,
        message: `${edgeLabel(edge)} declares variance without a non-empty present_under. A surface that exists under no configuration should be deleted rather than declared; a surface that exists under all of them should carry no varies_by edge at all.`,
      })
      continue
    }
    if (!values) continue // unresolved axis target: an edge-drift concern, not this one
    for (const value of presentUnder) {
      if (!values.includes(value)) {
        findings.push({
          kind: 'present_under_unknown_value',
          severity: 'error',
          edge_id: edge.id,
          node_id: edge.source,
          axis_id: edge.target,
          message: `present_under names "${value}", which the axis does not declare. Its values are [${values.join(', ')}].`,
        })
      }
    }
  }

  // ── Qualifiers ─────────────────────────────────────────────────────────────
  for (const edge of edges) {
    const hasQualifierKey =
      edge.properties !== undefined &&
      Object.prototype.hasOwnProperty.call(edge.properties, ACTIVE_WHEN_PROPERTY)
    if (!hasQualifierKey) continue

    if (edge.type !== undefined && !QUALIFIABLE_EDGE_TYPES.includes(edge.type)) {
      findings.push({
        kind: 'qualifier_on_illegal_edge',
        severity: 'error',
        edge_id: edge.id,
        message: `active_when is not legal on ${edge.type}. The qualifier is scoped to [${QUALIFIABLE_EDGE_TYPES.join(', ')}] deliberately: conditional composition is the question this release answers, and a general modality system is not.`,
      })
      continue
    }

    const qualifier = readActiveWhen(edge)
    if (!qualifier) {
      // Separate the empty-list case from a structurally broken one. They read
      // identically to the projection operator (both absent, so the edge stays
      // invariant) but they are different author mistakes, and an empty list
      // looks deliberate enough that naming it precisely saves a debugging pass.
      const rawQualifier = edge.properties?.[ACTIVE_WHEN_PROPERTY]
      const rawValues =
        rawQualifier && typeof rawQualifier === 'object' && !Array.isArray(rawQualifier)
          ? (rawQualifier as Record<string, unknown>).values
          : undefined
      if (Array.isArray(rawValues) && rawValues.length === 0) {
        findings.push({
          kind: 'qualifier_values_empty',
          severity: 'error',
          edge_id: edge.id,
          message: `${edgeLabel(edge)} carries an active_when with an empty values list. Read literally that would remove the relationship from every configuration, which is a way to delete an edge by writing a property; it is treated as absent instead. To say a relationship never holds, delete the edge.`,
        })
        continue
      }
      findings.push({
        kind: 'qualifier_axis_unresolved',
        severity: 'error',
        edge_id: edge.id,
        message: `${edgeLabel(edge)} carries a malformed active_when. It must be an object with an axis id and a non-empty values array; anything else reads as absent, which silently makes the relationship invariant.`,
      })
      continue
    }
    const values = axisValues.get(qualifier.axis)
    if (!values) {
      findings.push({
        kind: 'qualifier_axis_unresolved',
        severity: 'error',
        edge_id: edge.id,
        axis_id: qualifier.axis,
        message: `active_when names axis "${qualifier.axis}", which is not a configuration_axis node in this graph.`,
      })
      continue
    }
    for (const value of qualifier.values) {
      if (!values.includes(value)) {
        findings.push({
          kind: 'qualifier_unknown_value',
          severity: 'error',
          edge_id: edge.id,
          axis_id: qualifier.axis,
          message: `active_when names value "${value}", which axis "${qualifier.axis}" does not declare. Its values are [${values.join(', ')}].`,
        })
      }
    }
  }

  // ── Alternation ────────────────────────────────────────────────────────────
  // A declared alternation is checked against what the variance declarations
  // imply. It is never DERIVED from them: disjoint present_under on a shared
  // axis is necessary for alternation and nowhere near sufficient, because two
  // unrelated surfaces gated by the same flag are disjoint without being
  // alternatives to each other. Explicit is what D2 asked for; this is what
  // explicit costs and what it buys.
  const varianceBySource = new Map<string, Array<{ axis: string; values: string[] }>>()
  for (const edge of edges) {
    if (edge.type !== VARIES_BY_EDGE) continue
    const values = readStringArray(edge.properties, PRESENT_UNDER_PROPERTY) ?? []
    const list = varianceBySource.get(edge.source) ?? []
    list.push({ axis: edge.target, values })
    varianceBySource.set(edge.source, list)
  }

  for (const edge of edges) {
    if (edge.type !== ALTERNATES_EDGE) continue
    const left = varianceBySource.get(edge.source) ?? []
    const right = varianceBySource.get(edge.target) ?? []
    if (left.length === 0 || right.length === 0) {
      findings.push({
        kind: 'alternation_axis_mismatch',
        severity: 'error',
        edge_id: edge.id,
        message: `${edgeLabel(edge)} declares an alternation, but at least one endpoint declares no variance at all. Two surfaces that are both always present are not alternatives; they co-exist.`,
      })
      continue
    }
    const sharedAxes = left.filter((l) => right.some((r) => r.axis === l.axis)).map((l) => l.axis)
    if (sharedAxes.length === 0) {
      findings.push({
        kind: 'alternation_axis_mismatch',
        severity: 'error',
        edge_id: edge.id,
        message: `${edgeLabel(edge)} declares an alternation between surfaces that vary on different axes. Alternatives are selected by ONE lever; surfaces on different levers can both be present at once.`,
      })
      continue
    }
    for (const axis of sharedAxes) {
      const leftValues = left.find((l) => l.axis === axis)?.values ?? []
      const rightValues = right.find((r) => r.axis === axis)?.values ?? []
      const overlap = leftValues.filter((v) => rightValues.includes(v))
      if (overlap.length > 0) {
        findings.push({
          kind: 'alternation_overlap',
          severity: 'error',
          edge_id: edge.id,
          axis_id: axis,
          message: `${edgeLabel(edge)} declares an alternation, but both surfaces are present under [${overlap.join(', ')}] on axis "${axis}". They co-exist there, so the graph is asserting "one of these" and "both, together" about the same pair.`,
        })
      }
    }
  }

  // ── Orphaned under projection (the one per-projection check) ───────────────
  // Scoped deliberately: it fires only for a surface that HAS a parent in the
  // union and loses every one of them in some projection. A surface with no
  // parent anywhere is a pre-existing modelling state that has nothing to do
  // with configuration, and lighting it up here would bury the real finding.
  const parentsByChild = new Map<string, number>()
  for (const edge of edges) {
    if (edge.type && PARENT_EDGE_TYPES.has(edge.type)) {
      parentsByChild.set(edge.target, (parentsByChild.get(edge.target) ?? 0) + 1)
    }
  }

  for (const [axisId, values] of axisValues) {
    for (const value of values) {
      const projected = projectGraph(nodes, edges, { [axisId]: value })
      const survivingParents = new Map<string, number>()
      for (const edge of projected.edges) {
        if (edge.type && PARENT_EDGE_TYPES.has(edge.type)) {
          survivingParents.set(edge.target, (survivingParents.get(edge.target) ?? 0) + 1)
        }
      }
      for (const node of projected.nodes) {
        if (node.type !== 'surface') continue
        if ((parentsByChild.get(node.id) ?? 0) === 0) continue
        if ((survivingParents.get(node.id) ?? 0) > 0) continue
        findings.push({
          kind: 'orphaned_under_projection',
          severity: 'warning',
          node_id: node.id,
          axis_id: axisId,
          message: `Surface is present under ${axisId} = "${value}" but every containment parent it has is absent there. Either it needs a parent in that configuration, or it should declare that it is absent from it too.`,
        })
      }
    }
  }

  return findings
}
