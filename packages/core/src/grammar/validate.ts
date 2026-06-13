/**
 * UPG Document Validator. Validates a `UPGDocument` against the spec. Zero dependencies.
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGDocument } from '../shapes/document.js'
import { UPG_CROSS_EDGE_TYPES } from '../shapes/document.js'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { getTypes } from '../registry/domains.js'
import { getPropertySchema, type PropertyDefinition } from '../properties/property-schema.js'
import { UPG_FRAMEWORKS_BY_ID } from '../frameworks/canonical.js'
import type { UPGFramework, FrameworkPropertyRequirement } from '../frameworks/types.js'
import { getScale } from './scales.js'

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
  /**
   * Stable machine-readable category for the warning, when it belongs to one
   * of the content-depth checks. Lets consumers (e.g. the CLI `verify`
   * command) select a specific class of finding without parsing `message`.
   *
   * These are surfaced as warnings (not errors) on purpose: the document
   * LOAD path throws on any `errors[]` entry, and real graphs already carry
   * known drift (non-canonical enum values, primitive-where-assessment).
   * Promoting them to errors would brick those graphs on load. `verify`
   * re-runs the validator and re-classifies these as policy violations so a
   * CI gate still fails, without making the parser refuse to read the file.
   */
  rule?: 'property-type' | 'property-enum' | 'self-loop' | 'framework-score'
}

/**
 * Warning `rule` codes for the content-depth checks.
 * `verify`/`check` treat a document carrying any of these as a policy
 * violation (exit 2) even though they never block the load path.
 *
 * - `property-type` / `property-enum` / `self-loop` —.
 * - `framework-score` —. A `framework_exercise`'s persisted per-entity
 *   result (carried on its `framework_exercise_includes_node` edge properties)
 *   that violates the framework's own input spec: an invalid enum bucket, a
 *   non-numeric / out-of-scale / negative score, or a zero in a divisor input
 *   (e.g. RICE `effort`, WSJF `job_size`). A WARNING, not an error: a drifted
 *   exercise still LOADS, consistent with the severity discipline above. See
 *   `validateFrameworkScores`.
 */
export const CONTENT_DEPTH_WARNING_RULES: ReadonlySet<NonNullable<UPGValidationWarning['rule']>> = new Set([
  'property-type',
  'property-enum',
  'self-loop',
  'framework-score',
])

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
  // (defense-in-depth): `nodes` must be an array. A present-but-non-array
  // value (`nodes: 42`, `nodes: {}`) would otherwise reach a downstream `.map`
  // and throw a raw, location-less TypeError on the load path. Distinguish the
  // missing case from the wrong-type case so the failure is self-explaining.
  // (The SDK load path also guards before `.map`; this is the validator layer.)
  if (!Array.isArray(d.nodes)) {
    errors.push({
      path: '$.nodes',
      message: d.nodes === undefined
        ? 'nodes is required and must be an array'
        : `nodes must be an array, got ${describeKind(d.nodes)}`,
    })
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
      } else if (n.title.trim().length === 0) {
        // Trim before the required-title check so whitespace-only titles
        // (e.g. "   ") are caught symmetrically with the empty string "".
        // A truthy-but-blank title is still a missing title. Mirrors the CLI
        // write-side guard (PR #1935 /).
        errors.push({ path: `${path}.title`, message: 'Node title must not be blank (whitespace-only)' })
      }

      // ── properties container shape ────────────────────────
      // `properties`, when present, must be a non-null plain object. A node
      // built with `--data` type confusion can carry `properties: 42`,
      // `properties: [1,2,3]`, or `properties: true`; today those slip
      // through (the per-property checks below silently skip a non-object)
      // and `verify` reports "all checks passed". This is a STRUCTURAL error
      // (not a content-depth warning): the field is malformed, not merely
      // drifted, so both reads and `verify` should surface it (exit 2).
      if (n.properties !== undefined && n.properties !== null) {
        if (typeof n.properties !== 'object' || Array.isArray(n.properties)) {
          errors.push({
            path: `${path}.properties`,
            message: `Node properties must be a plain object when present, got ${describeKind(n.properties)}.`,
          })
        }
      }

      // ── property type + enum depth ( / F5) ───────────────────
      // Validate each present property against the entity schema's declared
      // type and enum membership. Emitted as WARNINGS, never errors: real
      // graphs carry known drift and the load path throws on any error.
      if (typeof n.type === 'string') {
        validateNodeProperties(n, `${path}`, warnings)
      }
    })

    // Edges
    // (defense-in-depth): same array-shape guard as `nodes` above.
    if (!Array.isArray(d.edges)) {
      errors.push({
        path: '$.edges',
        message: d.edges === undefined
          ? 'edges is required and must be an array'
          : `edges must be an array, got ${describeKind(d.edges)}`,
      })
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
        // ── self-loop detection ( / F8) ────────────────────────
        // An edge whose source and target are the same node is almost always
        // an authoring error. Surfaced as a WARNING (not an error) so it does
        // not throw on the load path; `verify` re-classifies it as a policy
        // violation. See CONTENT_DEPTH_WARNING_RULES.
        if (typeof e.source === 'string' && typeof e.target === 'string' && e.source === e.target) {
          warnings.push({
            path: `${path}`,
            message: `Self-loop edge: source and target are the same node ("${e.source}"). A node related to itself is almost always an error.`,
            rule: 'self-loop',
          })
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

      // ── framework score validation ─────────────────────────
      // A framework_exercise persists each entity's result on its
      // `framework_exercise_includes_node` edge `properties`. Validate those
      // stored scores against the framework's OWN input spec. Findings are
      // WARNINGS (rule 'framework-score'): a drifted exercise still loads,
      // and `verify` re-classifies to exit 2.
      validateFrameworkScores(d.nodes as unknown[], d.edges as unknown[], warnings)
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}

/**
 *: validate the per-entity scores a `framework_exercise` persists on its
 * `framework_exercise_includes_node` edge `properties` against the framework's
 * own declared input spec (`data.required_properties[<targetType>]`).
 *
 * Why on the edge, not the node: a framework_exercise records each scored
 * entity's result on the includes-edge (a MoSCoW bucket, RICE reach/impact/
 * confidence/effort, a WSJF job_size), because the value is a fact about that
 * run, not an intrinsic entity property. Today garbage persists undetected: an
 * invalid `moscow` bucket, an off-scale or negative RICE input, a non-numeric
 * score, or `effort: 0` (a zero divisor that makes the RICE score blow up).
 *
 * What we check, grounded ONLY in the framework definition (no invented rules):
 *   - enum input        → value must be a string in the requirement's
 *                         `enum_values`.
 *   - assessment input  → value (scalar, or an object's numeric `.value`) must
 *                         be a finite number within the declared `scale_id`'s
 *                         [min, max]. Falls back to a >0 sanity check when the
 *                         scale id is unknown.
 *   - number input      → value must be a finite, non-negative number.
 *   - divisor inputs    → a lone divisor identifier in any computed expression
 *                         (`… / effort`, `… / job_size`) must not be zero. A
 *                         parenthesised sum denominator (Kano) is not flagged.
 *
 * Conservative by design (mirrors the F5 property checks): only inputs the
 * framework actually declares for the scored entity's type are checked; an
 * unknown framework_id, a missing input value, or an entity type the framework
 * does not score is skipped, not flagged. WARNINGS only — never errors — so a
 * drifted exercise still loads. The CLI `verify` command re-classifies these
 * (see CONTENT_DEPTH_WARNING_RULES).
 */
function validateFrameworkScores(
  nodes: unknown[],
  edges: unknown[],
  warnings: UPGValidationWarning[],
): void {
  // Index nodes by id and collect the framework_exercise nodes.
  const nodeById = new Map<string, Record<string, unknown>>()
  const exercises: Array<{ id: string; framework: UPGFramework }> = []
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const n = node as Record<string, unknown>
    if (typeof n.id === 'string') nodeById.set(n.id, n)
    if (n.type !== 'framework_exercise') continue
    const props = n.properties
    if (!props || typeof props !== 'object' || Array.isArray(props)) continue
    const frameworkId = (props as Record<string, unknown>).framework_id
    if (typeof frameworkId !== 'string') continue
    const framework = UPG_FRAMEWORKS_BY_ID[frameworkId]
    // Unknown framework_id: not this rule's concern — skip rather than
    // false-flag (a frozen exercise may reference an evolved/removed id).
    if (!framework) continue
    if (typeof n.id === 'string') exercises.push({ id: n.id, framework })
  }
  if (exercises.length === 0) return
  const exerciseById = new Map(exercises.map((e) => [e.id, e.framework]))

  // Walk every includes-edge from a resolved exercise and check its score.
  edges.forEach((edge: unknown, i: number) => {
    if (!edge || typeof edge !== 'object') return
    const e = edge as Record<string, unknown>
    if (e.type !== 'framework_exercise_includes_node') return
    if (typeof e.source !== 'string' || typeof e.target !== 'string') return
    const framework = exerciseById.get(e.source)
    if (!framework) return
    const score = e.properties
    if (!score || typeof score !== 'object' || Array.isArray(score)) return

    const targetNode = nodeById.get(e.target)
    const targetType = typeof targetNode?.type === 'string' ? (targetNode.type as string) : undefined
    if (!targetType) return

    const requirements = framework.data?.required_properties?.[targetType]
    if (!requirements || requirements.length === 0) return

    const divisors = divisorInputs(framework)
    const path = `$.edges[${i}].properties`
    const scoreObj = score as Record<string, unknown>

    for (const req of requirements) {
      const value = scoreObj[req.property]
      if (value === undefined || value === null) continue // missing input: not a depth concern here
      const finding = checkScoreValue(req, value, divisors.has(req.property), framework.id)
      if (finding) {
        warnings.push({
          path: `${path}.${req.property}`,
          message: finding,
          rule: 'framework-score',
        })
      }
    }
  })
}

/**
 * The set of input keys that appear as a *lone* denominator in any of a
 * framework's computed expressions. Framework-agnostic: RICE's `effort`
 * (`… / effort`), WSJF's `job_size` (`… / job_size`), `value / effort`. A zero
 * in one of these makes the computed score diverge, so it is always invalid.
 *
 * A parenthesised multi-term denominator is intentionally NOT decomposed. In
 * Kano's `(…) / (delighter_count + performance_count + must_be_count +
 * indifferent_count)` no single count is a must-not-be-zero divisor: any one can
 * be 0 while the sum stays positive, so flagging individual terms (the old
 * heuristic flagged the first, `delighter_count`) was a false positive. Only a
 * bare `/ ident` or a lone `/(ident)` counts.
 */
function divisorInputs(framework: UPGFramework): ReadonlySet<string> {
  const exprs = (framework.data?.computed_properties ?? [])
    .map((c) => c?.expression)
    .filter((e): e is string => typeof e === 'string' && e.length > 0)
  if (exprs.length === 0) return EMPTY_STRING_SET
  const out = new Set<string>()
  // `/` (not `//`) followed by a lone divisor identifier: a bare `/ effort`, or
  // a single identifier wrapped in parens `/(job_size)`. A `/ (a + b + …)`
  // multi-term denominator matches neither branch and is left alone.
  const re = /\/\s*(?:\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)|([A-Za-z_][A-Za-z0-9_]*))/g
  for (const expr of exprs) {
    let m: RegExpExecArray | null
    while ((m = re.exec(expr)) !== null) out.add(m[1] ?? m[2])
  }
  return out
}

const EMPTY_STRING_SET: ReadonlySet<string> = new Set<string>()

/**
 * Validate a single persisted score `value` against one framework input
 * requirement. Returns a human-readable finding string, or `null` if the value
 * is acceptable. The check is keyed on the requirement's declared `type`.
 */
function checkScoreValue(
  req: FrameworkPropertyRequirement,
  value: unknown,
  isDivisor: boolean,
  frameworkId: string,
): string | null {
  switch (req.type) {
    case 'enum': {
      const allowed = req.enum_values ?? []
      if (typeof value !== 'string') {
        return `${frameworkId} score "${req.property}" must be one of ${allowed.join(', ')}; got ${describeKind(value)}.`
      }
      if (allowed.length > 0 && !allowed.includes(value)) {
        return `${frameworkId} score "${req.property}" has value "${value}" outside its allowed set: ${allowed.join(', ')}.`
      }
      return null
    }
    case 'assessment': {
      const num = numericScore(value)
      if (num === null) {
        return `${frameworkId} score "${req.property}" must be a number; got ${describeKind(value)}.`
      }
      const scale = req.scale_id ? getScale(req.scale_id) : undefined
      if (scale) {
        if (num < scale.min || num > scale.max) {
          return `${frameworkId} score "${req.property}" is ${num}, outside the ${req.scale_id} scale range [${scale.min}, ${scale.max}].`
        }
      } else if (num <= 0) {
        // No resolvable scale: fall back to the universal "scores are positive"
        // sanity bound so 0/negative still get caught.
        return `${frameworkId} score "${req.property}" must be greater than 0; got ${num}.`
      }
      if (isDivisor && num === 0) {
        return `${frameworkId} score "${req.property}" must not be 0 (it is a divisor in the framework's formula).`
      }
      return null
    }
    case 'number': {
      const num = numericScore(value)
      if (num === null) {
        return `${frameworkId} score "${req.property}" must be a number; got ${describeKind(value)}.`
      }
      if (isDivisor && num === 0) {
        return `${frameworkId} score "${req.property}" must not be 0 (it is a divisor in the framework's formula).`
      }
      if (num < 0) {
        return `${frameworkId} score "${req.property}" must not be negative; got ${num}.`
      }
      return null
    }
    case 'boolean': {
      if (typeof value !== 'boolean') {
        return `${frameworkId} score "${req.property}" must be a boolean; got ${describeKind(value)}.`
      }
      return null
    }
    case 'string': {
      if (typeof value !== 'string') {
        return `${frameworkId} score "${req.property}" must be a string; got ${describeKind(value)}.`
      }
      return null
    }
    default:
      return null
  }
}

/**
 * Coerce a persisted assessment/number score to a finite number, or `null`.
 * Accepts a bare number, a numeric string (scores are sometimes serialised as
 * strings), or an assessment object with a numeric `value` field
 * (`{ value: 3, label: 'High' }`). Mirrors how `executePrioritise` reads
 * scores via `collectNumericScope`, so the validator and the scorer agree on
 * what counts as a usable number.
 */
function numericScore(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const n = Number.parseFloat(value)
    return Number.isFinite(n) ? n : null
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const v = (value as Record<string, unknown>).value
    if (typeof v === 'number') return Number.isFinite(v) ? v : null
  }
  return null
}

/**
 * Returns the JavaScript-runtime category a value falls into, expressed in the
 * `PropertyDefinition['type']` vocabulary, or `null` if it cannot be mapped.
 *
 * `assessment` and `object` are both backed by plain objects at runtime, so a
 * non-null, non-array object satisfies either. Arrays map to `string[]` (the
 * only array-shaped property type in the schema); element types are not
 * inspected here.
 */
function runtimeKind(val: unknown): PropertyDefinition['type'] | 'array' | null {
  if (val === null || val === undefined) return null
  if (Array.isArray(val)) return 'string[]'
  switch (typeof val) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      // assessment and object are both plain objects at runtime; report the
      // broader `object` and let the caller accept either.
      return 'object'
    default:
      return null
  }
}

/**
 * True when `val` is shape-compatible with the declared property `type`.
 * `assessment` accepts any plain object (its nested `{value,label}` shape is
 * not deep-checked here, to stay conservative against real-world drift).
 */
function valueMatchesType(defType: PropertyDefinition['type'], val: unknown): boolean {
  const kind = runtimeKind(val)
  if (kind === null) return true // null/undefined: treated as "absent", not a mismatch
  switch (defType) {
    case 'string':
      return kind === 'string'
    case 'number':
      return kind === 'number'
    case 'boolean':
      return kind === 'boolean'
    case 'string[]':
    case 'object[]':
      // runtimeKind reports any array as 'string[]'; element types are not
      // inspected here (the write-time validator does the deeper check).
      return kind === 'string[]'
    case 'object':
    case 'assessment':
      // Both are plain objects at runtime. Arrays are not objects here.
      return kind === 'object'
    default:
      return true
  }
}

/**
 * A human-readable name for a value's runtime kind, for warning messages.
 */
function describeKind(val: unknown): string {
  if (Array.isArray(val)) return 'array'
  return typeof val
}

/**
 * (F5): validate a node's `properties` against the entity schema's
 * declared property TYPE and ENUM membership. Findings are pushed as WARNINGS
 * (tagged with a `rule` code), never errors, so they never block the load path.
 *
 * Conservative by design — false positives on a real graph become spurious
 * warnings, so we only check what is unambiguous:
 *   - Only properties that exist in the entity schema are checked (unknown
 *     extras are author/runtime extensions and are left alone).
 *   - Only present (non-null, non-undefined) values are checked.
 *   - Type checks accept `assessment`/`object` for any plain object without
 *     deep-checking nested shape.
 *   - Enum checks only fire when the value is a string not in the closed set.
 *
 * Entity types with no typed schema (or non-canonical / alias types) are
 * skipped entirely.
 */
function validateNodeProperties(
  node: Record<string, unknown>,
  basePath: string,
  warnings: UPGValidationWarning[],
): void {
  const type = node.type
  if (typeof type !== 'string') return
  const schema = getPropertySchema(type)
  if (!schema) return // no typed properties (or alias/unknown type): nothing to check

  const props = node.properties
  if (!props || typeof props !== 'object' || Array.isArray(props)) return

  for (const [key, value] of Object.entries(props as Record<string, unknown>)) {
    const def = schema[key]
    if (!def) continue // author/runtime extension property: not in the spec schema
    if (value === null || value === undefined) continue // absent: not a violation

    // Type check.
    if (!valueMatchesType(def.type, value)) {
      warnings.push({
        path: `${basePath}.properties.${key}`,
        message: `Property "${key}" on ${type} should be ${def.type}, got ${describeKind(value)}.`,
        rule: 'property-type',
      })
      // A type-mismatched value cannot meaningfully be enum-checked; skip.
      continue
    }

    // Enum membership check (only for string-typed, closed-set properties).
    if (def.enum && typeof value === 'string' && !def.enum.includes(value)) {
      warnings.push({
        path: `${basePath}.properties.${key}`,
        message: `Property "${key}" on ${type} has value "${value}" outside its allowed set: ${def.enum.join(', ')}.`,
        rule: 'property-enum',
      })
    }
  }
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
