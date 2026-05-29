/**
 * UPG Document Validator. Validates a `UPGDocument` against the spec. Zero dependencies.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGDocument } from '../shapes/document.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { getTypes } from '../registry/domains.js'

/**
 * Cross-product edge types must live in `portfolio.cross_edges[]`, not in a
 * product's `edges[]`. Finding one in `edges[]` is a spec violation. The
 * `migrate_cross_edges` MCP tool moves them to the correct location.
 */
const crossProductEdgeTypeSet: ReadonlySet<string> = new Set(UPG_CROSS_EDGE_TYPES)

export interface UPGValidationError {
  /** JSON-path location of the field that failed validation (e.g. `$.nodes[2].type`) */
  path: string
  /** Human-readable description of the validation failure */
  message: string
}

export interface UPGValidationResult {
  /** Whether the document passed all mandatory spec checks */
  valid: boolean
  /** Spec violations: any entry here means `valid` is false */
  errors: UPGValidationError[]
  /** Best-practice notices: present even when `valid` is true */
  warnings: UPGValidationWarning[]
}

export interface UPGValidationWarning {
  /** JSON-path location of the field that triggered the warning */
  path: string
  /** Human-readable description of the best-practice notice */
  message: string
}

/**
 * Validates a UPGDocument against the UPG v0.2 specification.
 *
 * Returns a result object with `valid`, `errors`, and `warnings`.
 * Errors are spec violations. Warnings are best-practice notices.
 * Unknown node types and edge types produce warnings, not errors.
 *
 * @example
 * const result = validateUPGDocument({
 *   upg_version: '0.2.0',
 *   exported_at: '2026-04-17T10:00:00Z',
 *   source: { tool: 'entopo', tool_version: '0.1.0' },
 *   product: { id: 'p1', title: 'My Product' },
 *   nodes: [{ id: 'n1', type: 'persona', title: 'Creator' }],
 *   edges: [],
 * })
 * // result.valid    === true
 * // result.errors   === []
 * // result.warnings === []   // unless an unknown type slipped in
 */
export function validateUPGDocument(doc: unknown): UPGValidationResult {
  const errors: UPGValidationError[] = []
  const warnings: UPGValidationWarning[] = []

  if (!doc || typeof doc !== 'object') {
    return { valid: false, errors: [{ path: '$', message: 'Document must be an object' }], warnings }
  }

  const d = doc as Record<string, unknown>

  // Required top-level fields
  if (!d.upg_version || typeof d.upg_version !== 'string') {
    errors.push({ path: '$.upg_version', message: 'upg_version is required and must be a string' })
  }
  if (!d.exported_at || typeof d.exported_at !== 'string') {
    errors.push({ path: '$.exported_at', message: 'exported_at is required and must be an ISO 8601 string' })
  }
  if (!d.source || typeof d.source !== 'object') {
    errors.push({ path: '$.source', message: 'source is required and must be an object' })
  } else {
    const source = d.source as Record<string, unknown>
    if (!source.tool || typeof source.tool !== 'string') {
      errors.push({ path: '$.source.tool', message: 'source.tool is required and must be a string' })
    }
  }
  if (!d.product || typeof d.product !== 'object') {
    errors.push({ path: '$.product', message: 'product is required and must be an object' })
  } else {
    const product = d.product as Record<string, unknown>
    if (!product.id || typeof product.id !== 'string') {
      errors.push({ path: '$.product.id', message: 'product.id is required and must be a string' })
    }
    if (!product.title || typeof product.title !== 'string') {
      errors.push({ path: '$.product.title', message: 'product.title is required and must be a string' })
    }
  }

  // Build lookup sets from the registry
  const allKnownTypes = new Set(getTypes())
  const allKnownEdgeTypes = new Set(Object.keys(UPG_EDGE_CATALOG))

  // Nodes
  if (!Array.isArray(d.nodes)) {
    errors.push({ path: '$.nodes', message: 'nodes is required and must be an array' })
  } else {
    const nodeIds = new Set<string>()
    // Lookup by id, used for cross-property referential checks (empty-cell detection).
    const nodesById = new Map<string, Record<string, unknown>>()
    d.nodes.forEach((node: unknown, i: number) => {
      const path = `$.nodes[${i}]`
      if (!node || typeof node !== 'object') {
        errors.push({ path, message: 'Each node must be an object' })
        return
      }
      const n = node as Record<string, unknown>
      if (!n.id || typeof n.id !== 'string') {
        errors.push({ path: `${path}.id`, message: 'Node id is required and must be a string' })
      } else {
        if (nodeIds.has(n.id as string)) {
          errors.push({ path: `${path}.id`, message: `Duplicate node id: ${n.id}` })
        }
        nodeIds.add(n.id as string)
        nodesById.set(n.id as string, n)
      }
      if (!n.type || typeof n.type !== 'string') {
        errors.push({ path: `${path}.type`, message: 'Node type is required and must be a string' })
      } else if (!allKnownTypes.has(n.type as string)) {
        warnings.push({ path: `${path}.type`, message: `Unknown UPG type: "${n.type}". Node will be preserved with its original type.` })
      }
      if (!n.title || typeof n.title !== 'string') {
        errors.push({ path: `${path}.title`, message: 'Node title is required and must be a string' })
      }
    })

    // Edges
    if (!Array.isArray(d.edges)) {
      errors.push({ path: '$.edges', message: 'edges is required and must be an array' })
    } else {
      d.edges.forEach((edge: unknown, i: number) => {
        const path = `$.edges[${i}]`
        if (!edge || typeof edge !== 'object') {
          errors.push({ path, message: 'Each edge must be an object' })
          return
        }
        const e = edge as Record<string, unknown>
        if (!e.id || typeof e.id !== 'string') {
          errors.push({ path: `${path}.id`, message: 'Edge id is required and must be a string' })
        }
        if (typeof e.type === 'string' && crossProductEdgeTypeSet.has(e.type)) {
          errors.push({
            path: `${path}.type`,
            message: `Cross-product edge type "${e.type}" must live in portfolio.cross_edges[], not product edges[].`,
          })
          return
        }
        if (!e.source || typeof e.source !== 'string') {
          errors.push({ path: `${path}.source`, message: 'Edge source is required and must be a string' })
        } else if (!nodeIds.has(e.source as string)) {
          errors.push({ path: `${path}.source`, message: `Edge source references unknown node id: ${e.source}` })
        }
        if (!e.target || typeof e.target !== 'string') {
          errors.push({ path: `${path}.target`, message: 'Edge target is required and must be a string' })
        } else if (!nodeIds.has(e.target as string)) {
          errors.push({ path: `${path}.target`, message: `Edge target references unknown node id: ${e.target}` })
        }
        if (!e.type || typeof e.type !== 'string') {
          errors.push({ path: `${path}.type`, message: 'Edge type is required and must be a string' })
        } else if (!allKnownEdgeTypes.has(e.type as string)) {
          warnings.push({
            path: `${path}.type`,
            message: `Unknown edge type: "${e.type}". Edge preserved but not in the edge registry.`,
          })
        }
      })

      // ── empty_cells referential integrity ────────────────────────
      // For every competitive_analysis carrying `empty_cells`, validate that:
      //   1. Each *_value_ref points at a known node id.
      //   2. The referenced node has type `classification_value`.
      //   3. The two referenced values descend from *distinct*
      //      `classification_axis` parents (axis A × axis B; never axis A × axis A).
      // Axis-parentage is resolved via `classification_axis_includes_classification_value`
      // hierarchy edges, then by `parent_id` (Entopo runtime extension) as a fallback.
      //
      // Soft advisory (warning, not error):
      //   - The parent `competitive_analysis` should be dimensioned by exactly
      //     2 axes (the matrix shape that gives `empty_cells` its meaning).
      const valueToAxis = new Map<string, string>()
      const edgesArr = d.edges as unknown[]
      for (const edge of edgesArr) {
        if (!edge || typeof edge !== 'object') continue
        const e = edge as Record<string, unknown>
        if (e.type === 'classification_axis_includes_classification_value'
            && typeof e.source === 'string'
            && typeof e.target === 'string') {
          valueToAxis.set(e.target, e.source)
        }
      }
      // Fallback: parent_id on the value node (Entopo runtime extension).
      for (const [id, n] of nodesById.entries()) {
        if (n.type !== 'classification_value') continue
        if (valueToAxis.has(id)) continue
        const pid = (n as Record<string, unknown>).parent_id
        if (typeof pid === 'string') {
          const parent = nodesById.get(pid)
          if (parent && parent.type === 'classification_axis') {
            valueToAxis.set(id, pid)
          }
        }
      }
      // Count axes per competitive_analysis (for the soft advisory).
      const axesPerAnalysis = new Map<string, number>()
      for (const edge of edgesArr) {
        if (!edge || typeof edge !== 'object') continue
        const e = edge as Record<string, unknown>
        if (e.type === 'competitive_analysis_dimensioned_by_classification_axis'
            && typeof e.source === 'string') {
          axesPerAnalysis.set(e.source, (axesPerAnalysis.get(e.source) ?? 0) + 1)
        }
      }

      d.nodes.forEach((node: unknown, i: number) => {
        if (!node || typeof node !== 'object') return
        const n = node as Record<string, unknown>
        if (n.type !== 'competitive_analysis') return
        const props = n.properties
        if (!props || typeof props !== 'object') return
        const empty = (props as Record<string, unknown>).empty_cells
        if (!Array.isArray(empty)) return

        // Soft advisory if the analysis is not exactly 2-axis.
        const axisCount = axesPerAnalysis.get((n.id as string) ?? '') ?? 0
        if (axisCount !== 2) {
          warnings.push({
            path: `$.nodes[${i}].properties.empty_cells`,
            message: `empty_cells is meaningful only on a 2-axis competitive_analysis; this node is dimensioned by ${axisCount} classification_axis ${axisCount === 1 ? 'child' : 'children'}.`,
          })
        }

        empty.forEach((cell: unknown, j: number) => {
          const cpath = `$.nodes[${i}].properties.empty_cells[${j}]`
          if (!cell || typeof cell !== 'object') {
            errors.push({ path: cpath, message: 'empty_cells entry must be an object' })
            return
          }
          const c = cell as Record<string, unknown>
          const aRef = c.axis_a_value_ref
          const bRef = c.axis_b_value_ref
          if (typeof aRef !== 'string') {
            errors.push({ path: `${cpath}.axis_a_value_ref`, message: 'axis_a_value_ref is required and must be a string' })
          }
          if (typeof bRef !== 'string') {
            errors.push({ path: `${cpath}.axis_b_value_ref`, message: 'axis_b_value_ref is required and must be a string' })
          }
          if (typeof aRef !== 'string' || typeof bRef !== 'string') return

          const aNode = nodesById.get(aRef)
          const bNode = nodesById.get(bRef)
          if (!aNode) {
            errors.push({ path: `${cpath}.axis_a_value_ref`, message: `Unknown node id: ${aRef}` })
          } else if (aNode.type !== 'classification_value') {
            errors.push({ path: `${cpath}.axis_a_value_ref`, message: `Expected classification_value, found "${String(aNode.type)}" at ${aRef}` })
          }
          if (!bNode) {
            errors.push({ path: `${cpath}.axis_b_value_ref`, message: `Unknown node id: ${bRef}` })
          } else if (bNode.type !== 'classification_value') {
            errors.push({ path: `${cpath}.axis_b_value_ref`, message: `Expected classification_value, found "${String(bNode.type)}" at ${bRef}` })
          }

          // Distinct-axis check: only meaningful if both refs resolve to
          // classification_value AND we know their axes.
          if (aNode && bNode && aNode.type === 'classification_value' && bNode.type === 'classification_value') {
            const aAxis = valueToAxis.get(aRef)
            const bAxis = valueToAxis.get(bRef)
            if (aAxis && bAxis && aAxis === bAxis) {
              errors.push({
                path: cpath,
                message: `empty_cells references two classification_values from the same axis (${aAxis}); axis_a and axis_b must come from distinct classification_axis parents.`,
              })
            }
          }

          // rationale_kind enum check.
          const kind = c.rationale_kind
          if (kind !== undefined && kind !== 'structural' && kind !== 'ideological' && kind !== 'opportunity') {
            errors.push({
              path: `${cpath}.rationale_kind`,
              message: `rationale_kind must be one of 'structural' | 'ideological' | 'opportunity'; got "${String(kind)}".`,
            })
          }
        })
      })
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Type guard: returns true if the document is a valid UPGDocument.
 * Use `validateUPGDocument` for detailed error reporting.
 *
 * @example
 * const raw: unknown = JSON.parse(fileContents)
 * if (isUPGDocument(raw)) {
 *   // raw is now typed as UPGDocument
 *   console.log(`Loaded product "${raw.product.title}" with ${raw.nodes.length} nodes`)
 * }
 */
export function isUPGDocument(doc: unknown): doc is UPGDocument {
  return validateUPGDocument(doc).valid
}
