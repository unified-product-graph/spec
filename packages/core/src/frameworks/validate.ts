/**
 * Framework validation: validates UPGFramework objects against the spec.
 */

import { UPG_FRAMEWORK_CATEGORIES, UPG_STRUCTURE_PATTERNS } from './categories.js'
import { resolveRelationalPath } from './relational-paths.js'
import type {
  FrameworkSlotPredicate,
  FrameworkSlotPredicateAtom,
  RelationalEdgeStep,
} from './types.js'

// ─── Validation ─────────────────────────────────────────────────────────────

/** Result of validating a UPGFramework object */
export interface FrameworkValidationResult {
  /** Whether the framework passed all required checks */
  valid: boolean
  /** Spec violations that must be fixed */
  errors: string[]
  /** Best-practice notices that should be reviewed */
  warnings: string[]
}

/**
 * Validates a UPGFramework object against the spec.
 *
 * Checks:
 * - Required top-level fields (id, name, version, category, data, structure, presentation, education)
 * - data.entity_types is a non-empty array
 * - structure.pattern is a valid StructurePattern
 * - computed_properties expressions are syntactically valid (balanced parens, valid tokens)
 * - education has required fields (purpose, core_question, when_to_use, when_not_to_use)
 * - category is a valid FrameworkCategory
 *
 * Returns a result with `valid`, `errors`, and `warnings`.
 *
 * @example
 * const result = validateUPGFramework({
 *   id: 'lean_canvas',
 *   name: 'Lean Canvas',
 *   version: '1.0.0',
 *   description: 'One-page business model canvas by Ash Maurya',
 *   category: 'business_model',
 *   origin: { type: 'published', author: 'Ash Maurya', year: 2010 },
 *   structure: { pattern: 'canvas' },
 *   education: {
 *     purpose: 'Validate early-stage business models',
 *     core_question: 'Is this problem worth solving?',
 *     when_to_use: ['pre-launch', 'pivot analysis'],
 *     when_not_to_use: ['mature product optimisation'],
 *   },
 * })
 * // result.valid  === true
 * // result.errors === []
 */
export function validateUPGFramework(framework: unknown): FrameworkValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!framework || typeof framework !== 'object') {
    return { valid: false, errors: ['Framework must be an object'], warnings }
  }

  const f = framework as Record<string, unknown>

  // ── Required string fields ──────────────────────────────────────────────
  const requiredStrings = ['id', 'name', 'version', 'description'] as const
  for (const field of requiredStrings) {
    if (!f[field] || typeof f[field] !== 'string') {
      errors.push(`"${field}" is required and must be a string`)
    }
  }

  // ── Category ────────────────────────────────────────────────────────────
  if (!f.category || typeof f.category !== 'string') {
    errors.push('"category" is required and must be a string')
  } else if (!(UPG_FRAMEWORK_CATEGORIES as readonly string[]).includes(f.category as string)) {
    errors.push(`"category" must be one of: ${UPG_FRAMEWORK_CATEGORIES.join(', ')}. Got "${f.category}"`)
  }

  // ── Origin ──────────────────────────────────────────────────────────────
  if (!f.origin || typeof f.origin !== 'object') {
    errors.push('"origin" is required and must be an object')
  } else {
    const origin = f.origin as Record<string, unknown>
    if (!origin.type || typeof origin.type !== 'string') {
      errors.push('"origin.type" is required and must be a string')
    }
    if (!origin.attribution || typeof origin.attribution !== 'string') {
      warnings.push('"origin.attribution" should be a string identifying the creator(s)')
    }
  }

  // ── Tags ────────────────────────────────────────────────────────────────
  if (!Array.isArray(f.tags)) {
    warnings.push('"tags" should be an array of strings')
  }

  // ── Data spec ───────────────────────────────────────────────────────────
  if (!f.data || typeof f.data !== 'object') {
    errors.push('"data" is required and must be an object')
  } else {
    const data = f.data as Record<string, unknown>

    if (!Array.isArray(data.entity_types) || data.entity_types.length === 0) {
      errors.push('"data.entity_types" is required and must be a non-empty array')
    } else {
      (data.entity_types as unknown[]).forEach((et, i) => {
        if (!et || typeof et !== 'object') {
          errors.push(`"data.entity_types[${i}]" must be an object`)
          return
        }
        const spec = et as Record<string, unknown>
        if (!spec.type || typeof spec.type !== 'string') {
          errors.push(`"data.entity_types[${i}].type" is required and must be a string`)
        }
        if (!spec.role || typeof spec.role !== 'string') {
          errors.push(`"data.entity_types[${i}].role" is required and must be a string`)
        }
      })
    }

    if (!data.required_properties || typeof data.required_properties !== 'object') {
      errors.push('"data.required_properties" is required and must be an object')
    }

    // Validate computed properties expressions
    if (Array.isArray(data.computed_properties)) {
      (data.computed_properties as unknown[]).forEach((cp, i) => {
        if (!cp || typeof cp !== 'object') {
          errors.push(`"data.computed_properties[${i}]" must be an object`)
          return
        }
        const prop = cp as Record<string, unknown>
        if (!prop.property || typeof prop.property !== 'string') {
          errors.push(`"data.computed_properties[${i}].property" is required and must be a string`)
        }
        if (!prop.expression || typeof prop.expression !== 'string') {
          errors.push(`"data.computed_properties[${i}].expression" is required and must be a string`)
        } else {
          const exprError = validateExpression(prop.expression as string)
          if (exprError) {
            errors.push(`"data.computed_properties[${i}].expression": ${exprError}`)
          }
        }
        if (!prop.entity_type || typeof prop.entity_type !== 'string') {
          errors.push(`"data.computed_properties[${i}].entity_type" is required and must be a string`)
        }
      })
    }
  }

  // ── Structure spec ──────────────────────────────────────────────────────
  if (!f.structure || typeof f.structure !== 'object') {
    errors.push('"structure" is required and must be an object')
  } else {
    const structure = f.structure as Record<string, unknown>
    if (!structure.pattern || typeof structure.pattern !== 'string') {
      errors.push('"structure.pattern" is required and must be a string')
    } else if (!(UPG_STRUCTURE_PATTERNS as readonly string[]).includes(structure.pattern as string)) {
      errors.push(`"structure.pattern" must be one of: ${UPG_STRUCTURE_PATTERNS.join(', ')}. Got "${structure.pattern}"`)
    }
  }

  // ── Presentation spec ───────────────────────────────────────────────────
  if (!f.presentation || typeof f.presentation !== 'object') {
    errors.push('"presentation" is required and must be an object')
  } else {
    const pres = f.presentation as Record<string, unknown>
    if (!pres.layout || typeof pres.layout !== 'object') {
      errors.push('"presentation.layout" is required and must be an object')
    } else {
      const layout = pres.layout as Record<string, unknown>
      if (!layout.type || typeof layout.type !== 'string') {
        errors.push('"presentation.layout.type" is required and must be a string')
      }
    }
  }

  // ── Relational spec (optional) ──────────────────────────────────────────
  //
  // Only validated when present. A framework without a `relational` block is
  // unaffected, which is what makes the block additive.
  //
  // NOTE, and it is load-bearing: there is deliberately NO mutual-exclusivity
  // check across columns. Sibling columns admitting the same entity is the JOIN
  // WORKING, not an authoring bug. Mutual exclusivity is a partition rule and
  // belongs to predicate zones; enforcing it here would forbid the join this
  // block exists to express. Do not "unify" the two validators.
  if (f.relational !== undefined) {
    if (typeof f.relational !== 'object' || f.relational === null || Array.isArray(f.relational)) {
      errors.push('"relational" must be an object when present')
    } else {
      const rel = f.relational as Record<string, unknown>
      errors.push(...validateRelationalSurface(rel))

      // `slots` cannot express an edge path, so a framework that declares a
      // relational surface AND slots is describing its columns twice, in two
      // shapes, one of which is known to be lossy.
      if (Array.isArray(f.slots) && f.slots.length > 0) {
        warnings.push(
          '"relational" and "slots" are both declared. `relational` is authoritative for a join surface; ' +
            'slots cannot express an edge path and will drift. Remove "slots" from this framework.'
        )
      }

      // ONE ROSTER, NOT TWO.
      //
      // When `relational` is present it IS the column declaration, so
      // `presentation.layout.columns` must be empty. This is an error rather
      // than a reconciliation warning on purpose: a roster duplicated in two
      // places and kept in step by hand is exactly how the pre-repoint package
      // copies came to disagree on all five of this framework's columns while
      // every gate stayed green. Policing a duplicate is weaker than not having
      // one.
      const presLayout = (f.presentation as Record<string, unknown> | undefined)?.layout as
        | Record<string, unknown>
        | undefined
      if (presLayout?.type === 'table' && Array.isArray(presLayout.columns) && presLayout.columns.length > 0) {
        errors.push(
          `"presentation.layout.columns" declares ${presLayout.columns.length} columns, but "relational" is ` +
            'the authoritative roster for a join surface. Empty the presentation columns; do not maintain both.'
        )
      }
    }
  }

  // ── Education spec ──────────────────────────────────────────────────────
  if (!f.education || typeof f.education !== 'object') {
    errors.push('"education" is required and must be an object')
  } else {
    const edu = f.education as Record<string, unknown>
    if (!edu.purpose || typeof edu.purpose !== 'string') {
      errors.push('"education.purpose" is required and must be a string')
    }
    if (!edu.core_question || typeof edu.core_question !== 'string') {
      errors.push('"education.core_question" is required and must be a string')
    }
    if (!Array.isArray(edu.when_to_use)) {
      errors.push('"education.when_to_use" is required and must be an array')
    }
    if (!Array.isArray(edu.when_not_to_use)) {
      errors.push('"education.when_not_to_use" is required and must be an array')
    }
  }

  validateSlotPredicates(f.slots, errors)

  return { valid: errors.length === 0, errors, warnings }
}

// ─── Predicate zones ────────────────────────────────────────────────────────

const PREDICATE_SCOPES = ['entity', 'framework'] as const
const PREDICATE_OPS = ['eq', 'in', 'gte', 'lt', 'band'] as const

/**
 * The set of values an atom admits, in one of two shapes.
 *
 * `discrete` — an explicit set (`eq`, `in`).
 * `interval` — a half-open numeric range `[lo, hi)`, with ±Infinity for an
 * unbounded end (`gte` is `[n, ∞)`, `lt` is `(-∞, n)`, `band` is `[min, max)`).
 */
type AdmittedValues =
  | { kind: 'discrete'; values: ReadonlyArray<string | number | boolean> }
  | { kind: 'interval'; lo: number; hi: number }

function admits(atom: FrameworkSlotPredicateAtom): AdmittedValues {
  switch (atom.op) {
    case 'eq':
      return { kind: 'discrete', values: [atom.value] }
    case 'in':
      return { kind: 'discrete', values: atom.value }
    case 'gte':
      return { kind: 'interval', lo: atom.value, hi: Number.POSITIVE_INFINITY }
    case 'lt':
      return { kind: 'interval', lo: Number.NEGATIVE_INFINITY, hi: atom.value }
    case 'band':
      return { kind: 'interval', lo: atom.value[0], hi: atom.value[1] }
  }
}

/**
 * Whether two atoms on the SAME (scope, property) cannot both hold.
 *
 * Proof by empty intersection of admitted values. A discrete value that is not
 * a number can never satisfy a numeric interval, so it counts as outside it —
 * which is the same rule as "absence is not a value", applied to type mismatch.
 */
function atomsCannotBothHold(
  a: FrameworkSlotPredicateAtom,
  b: FrameworkSlotPredicateAtom,
): boolean {
  const x = admits(a)
  const y = admits(b)

  if (x.kind === 'discrete' && y.kind === 'discrete') {
    return !x.values.some((v) => y.values.includes(v))
  }
  if (x.kind === 'interval' && y.kind === 'interval') {
    // Half-open [lo, hi): they overlap iff each starts before the other ends.
    return !(x.lo < y.hi && y.lo < x.hi)
  }
  const set = x.kind === 'discrete' ? x : (y as Extract<AdmittedValues, { kind: 'discrete' }>)
  const range = x.kind === 'interval' ? x : (y as Extract<AdmittedValues, { kind: 'interval' }>)
  return !set.values.some((v) => typeof v === 'number' && v >= range.lo && v < range.hi)
}

/**
 * Whether two sibling predicates are PROVABLY disjoint — the test that decides
 * whether a framework's zones are mutually exclusive.
 *
 * Two conjunctions cannot both hold if they share a `(scope, property)` on
 * which their atoms cannot both hold: one such property is enough, because an
 * entity would have to satisfy both atoms on it simultaneously.
 *
 * Note the direction: this returns `true` only when disjointness is PROVED.
 * An unprovable pair is rejected by the validator, not accepted. Over-rejection
 * costs the author a loud error they fix by adding a discriminating atom;
 * accepted overlap costs a silent misclassification at render time. See
 * Amendment 1 §B of the zone-predicate-hook decision.
 *
 * Exported so the renderer resolves membership with the same rule the validator
 * enforced, rather than a second implementation that can drift from it.
 */
export function predicatesProvablyDisjoint(
  a: FrameworkSlotPredicate,
  b: FrameworkSlotPredicate,
): boolean {
  for (const atomA of a) {
    for (const atomB of b) {
      if (
        atomA.scope === atomB.scope &&
        atomA.property === atomB.property &&
        atomsCannotBothHold(atomA, atomB)
      ) {
        return true
      }
    }
  }
  return false
}

/** Narrow one element of a `predicate` array, collecting shape errors. */
function parseAtom(
  atom: unknown,
  where: string,
  errors: string[],
): FrameworkSlotPredicateAtom | null {
  if (!atom || typeof atom !== 'object' || Array.isArray(atom)) {
    errors.push(`${where} must be an object`)
    return null
  }
  const a = atom as Record<string, unknown>
  let ok = true

  if (typeof a.scope !== 'string' || !PREDICATE_SCOPES.includes(a.scope as never)) {
    errors.push(`${where}.scope must be one of: ${PREDICATE_SCOPES.join(', ')}`)
    ok = false
  }
  if (typeof a.property !== 'string' || a.property.length === 0) {
    errors.push(`${where}.property is required and must be a non-empty string`)
    ok = false
  }
  if (typeof a.op !== 'string' || !PREDICATE_OPS.includes(a.op as never)) {
    errors.push(`${where}.op must be one of: ${PREDICATE_OPS.join(', ')}`)
    return null
  }

  switch (a.op) {
    case 'eq':
      if (!['string', 'number', 'boolean'].includes(typeof a.value)) {
        errors.push(`${where}.value must be a string, number, or boolean for op "eq"`)
        ok = false
      }
      break
    case 'in':
      if (
        !Array.isArray(a.value) ||
        a.value.length === 0 ||
        !a.value.every((v) => typeof v === 'string' || typeof v === 'number')
      ) {
        errors.push(`${where}.value must be a non-empty array of strings or numbers for op "in"`)
        ok = false
      }
      break
    case 'gte':
    case 'lt':
      if (typeof a.value !== 'number' || !Number.isFinite(a.value)) {
        errors.push(`${where}.value must be a finite number for op "${a.op}"`)
        ok = false
      }
      break
    case 'band':
      if (
        !Array.isArray(a.value) ||
        a.value.length !== 2 ||
        !a.value.every((v) => typeof v === 'number' && Number.isFinite(v))
      ) {
        errors.push(`${where}.value must be a [min, max] pair of finite numbers for op "band"`)
        ok = false
      } else if ((a.value as number[])[0] >= (a.value as number[])[1]) {
        errors.push(
          `${where}.value is an empty band: min (${(a.value as number[])[0]}) must be less than max (${(a.value as number[])[1]}). The interval is half-open [min, max)`,
        )
        ok = false
      }
      break
  }

  return ok ? (a as unknown as FrameworkSlotPredicateAtom) : null
}

/**
 * Validate predicate zones: atom shapes, then pairwise mutual exclusivity.
 *
 * Enforces the determinism rules the zone-predicate contract declares. The
 * exclusivity check is load-bearing beyond authoring hygiene: the zone-move
 * write policy (Amendment 2) is safe ONLY because no sibling predicate can
 * admit the value a drag writes. Weaken this check and that policy silently
 * weakens with it.
 */
function validateSlotPredicates(slots: unknown, errors: string[]): void {
  if (!Array.isArray(slots)) return

  const zones: Array<{
    where: string
    entityTypeId: string | null
    predicate: FrameworkSlotPredicate
  }> = []

  slots.forEach((slot, i) => {
    if (!slot || typeof slot !== 'object') return
    const s = slot as Record<string, unknown>
    if (s.predicate === undefined || s.predicate === null) return

    const label = typeof s.label === 'string' && s.label.length > 0 ? ` ("${s.label}")` : ''
    const where = `"slots[${i}]${label}.predicate"`

    if (!Array.isArray(s.predicate)) {
      errors.push(
        `${where} must be an array of atoms. A slot's membership rule is a conjunction, even when it has one atom`,
      )
      return
    }
    if (s.predicate.length === 0) {
      errors.push(
        `${where} must not be empty. A zero-atom predicate matches every entity, which is a catch-all cell — declare the property that decides membership`,
      )
      return
    }

    const atoms = s.predicate.map((atom, j) => parseAtom(atom, `${where}[${j}]`, errors))
    if (atoms.some((a) => a === null)) return

    zones.push({
      where: `slots[${i}]${label}`,
      entityTypeId: typeof s.entityTypeId === 'string' ? s.entityTypeId : null,
      predicate: atoms as FrameworkSlotPredicateAtom[],
    })
  })

  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const a = zones[i]
      const b = zones[j]

      // Slots typed to different entities can never contend for the same
      // entity, so exclusivity is satisfied structurally.
      if (a.entityTypeId && b.entityTypeId && a.entityTypeId !== b.entityTypeId) continue

      if (predicatesProvablyDisjoint(a.predicate, b.predicate)) continue

      const shared = a.predicate
        .filter((x) => b.predicate.some((y) => y.scope === x.scope && y.property === x.property))
        .map((x) => `${x.scope}.${x.property}`)
      const hint = shared.length
        ? `They constrain the same properties (${[...new Set(shared)].join(', ')}) without separating on any of them`
        : `They constrain no property in common, so an entity can satisfy both`

      errors.push(
        `"${a.where}" and "${b.where}" have predicates that are not provably disjoint, so an entity could land in both zones. ${hint}. Add an atom that separates them — for example, a value range on one property that the other excludes`,
      )
    }
  }
}

/**
 * Validates a computed-property math expression.
 *
 * Checks:
 * - Balanced parentheses
 * - Only allowed tokens: identifiers, numbers, operators (+, -, *, /), parens, whitespace
 *
 * Returns null if valid, or an error message string.
 */
function validateExpression(expr: string): string | null {
  // Check for empty expression
  if (expr.trim().length === 0) {
    return 'Expression must not be empty'
  }

  // Check balanced parentheses
  let depth = 0
  for (const ch of expr) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (depth < 0) return 'Unbalanced parentheses: unexpected closing paren'
  }
  if (depth !== 0) {
    return 'Unbalanced parentheses: missing closing paren'
  }

  // Check for valid tokens only: identifiers (a-z, _, digits), numbers, operators, parens, whitespace, dots
  const tokenPattern = /^[\w\s+\-*/().]+$/
  if (!tokenPattern.test(expr)) {
    return `Expression contains invalid characters. Allowed: identifiers, numbers, +, -, *, /, (, ), .`
  }

  return null
}

/**
 * Validates a `relational` surface block.
 *
 * Every failure here is an AUTHORING error and is loud by design: a malformed
 * relational block produces a surface that renders something plausible and wrong
 * (a column of the first member of an unordered set, a cell that is blank
 * whether the edge is missing or merely empty), which is the exact class of
 * defect this block was introduced to remove. Failing at authoring time is the
 * only point at which it is cheap.
 *
 * Returns a list of error strings; empty means valid.
 */
function validateRelationalSurface(rel: Record<string, unknown>): string[] {
  const errors: string[] = []

  // ── Spine ───────────────────────────────────────────────────────────────
  const spine = rel.spine
  if (!spine || typeof spine !== 'string') {
    errors.push('"relational.spine" is required and must be a string (the entity type whose instances are the rows)')
  }

  // ── Columns ─────────────────────────────────────────────────────────────
  if (!Array.isArray(rel.columns) || rel.columns.length === 0) {
    errors.push('"relational.columns" is required and must be a non-empty array')
    return errors
  }

  const seenIds = new Set<string>()

  for (let i = 0; i < rel.columns.length; i++) {
    const col = rel.columns[i]
    const at = `"relational.columns[${i}]"`

    if (!col || typeof col !== 'object' || Array.isArray(col)) {
      errors.push(`${at} must be an object`)
      continue
    }

    const c = col as Record<string, unknown>

    // Stable id, unique within the surface. Labels are display strings and
    // cannot be the reference key: `sort.column` must survive relabelling.
    if (!c.id || typeof c.id !== 'string') {
      errors.push(`${at}.id is required and must be a string`)
    } else if (seenIds.has(c.id)) {
      errors.push(`${at}.id "${c.id}" is duplicated; column ids must be unique within a surface`)
    } else {
      seenIds.add(c.id)
    }

    if (!c.label || typeof c.label !== 'string') {
      errors.push(`${at}.label is required and must be a string`)
    }

    switch (c.kind) {
      case 'field': {
        if (!c.property || typeof c.property !== 'string') {
          errors.push(`${at}.property is required on a field column and must be a string`)
        }
        // A field column reads the ROW's own property, so it must not declare an
        // entity type. Permitting one would re-create the artefact this block
        // removes: a column that looks like a second zone holding the spine type.
        if ('entityTypeId' in c) {
          errors.push(
            `${at} is a field column and must NOT declare "entityTypeId" — its entity is the spine by definition. ` +
              `A field column that names a type is the slot-forced shape this block replaces.`
          )
        }
        if ('path' in c) {
          errors.push(`${at} is a field column and must NOT declare "path"; use kind:"projection" to traverse edges`)
        }
        break
      }

      case 'computed': {
        if (!c.expression || typeof c.expression !== 'string') {
          errors.push(`${at}.expression is required on a computed column and must be a string`)
        } else {
          const exprError = validateExpression(c.expression)
          if (exprError) errors.push(`${at}.expression: ${exprError}`)
        }
        break
      }

      case 'projection': {
        if (!Array.isArray(c.path) || c.path.length === 0) {
          errors.push(
            `${at}.path is required on a projection column and must be a non-empty array of { edge, direction } steps`
          )
        } else {
          let stepShapeOk = true
          for (let s = 0; s < c.path.length; s++) {
            const step = c.path[s]
            if (!step || typeof step !== 'object' || Array.isArray(step)) {
              errors.push(`${at}.path[${s}] must be an object { edge, direction }`)
              stepShapeOk = false
              continue
            }
            const st = step as Record<string, unknown>
            if (!st.edge || typeof st.edge !== 'string') {
              errors.push(`${at}.path[${s}].edge is required and must be a string`)
              stepShapeOk = false
            }
            // Direction is explicit and never inferred: endpoint types cannot
            // disambiguate a self-edge, of which the catalog has several.
            if (st.direction !== 'forward' && st.direction !== 'reverse') {
              errors.push(
                `${at}.path[${s}].direction is required and must be "forward" or "reverse" (never inferred)`
              )
              stepShapeOk = false
            }
          }

          // Type composition: only checkable once the steps are well-shaped and
          // the spine is known.
          if (stepShapeOk && typeof spine === 'string') {
            const resolved = resolveRelationalPath(spine, c.path as RelationalEdgeStep[])
            if (resolved.reason) {
              errors.push(`${at}.path does not compose from spine "${spine}": ${resolved.reason}`)
            }
          }
        }

        if (!Array.isArray(c.fields) || c.fields.length === 0) {
          errors.push(`${at}.fields is required on a projection column and must be a non-empty array of property keys`)
        }

        if (c.limit !== undefined && (typeof c.limit !== 'number' || !Number.isInteger(c.limit) || c.limit < 1)) {
          errors.push(`${at}.limit must be a positive integer when present (it truncates rendering, never membership)`)
        }
        break
      }

      default:
        errors.push(`${at}.kind must be one of: field, computed, projection. Got "${String(c.kind)}"`)
    }
  }

  // ── Sort ────────────────────────────────────────────────────────────────
  // Declared, never inferred. The renderer contributes no default row order, so
  // an unresolvable sort reference is an error rather than a fallback.
  const sort = rel.sort
  if (!sort || typeof sort !== 'object' || Array.isArray(sort)) {
    errors.push('"relational.sort" is required and must be an object { column, direction }')
  } else {
    const s = sort as Record<string, unknown>
    if (!s.column || typeof s.column !== 'string') {
      errors.push('"relational.sort.column" is required and must be a string (a column id)')
    } else if (seenIds.size > 0 && !seenIds.has(s.column)) {
      errors.push(
        `"relational.sort.column" is "${s.column}", which is not a declared column id. ` +
          `Declared ids: ${[...seenIds].join(', ')}`
      )
    }
    if (s.direction !== 'asc' && s.direction !== 'desc') {
      errors.push('"relational.sort.direction" is required and must be "asc" or "desc"')
    }
  }

  return errors
}
