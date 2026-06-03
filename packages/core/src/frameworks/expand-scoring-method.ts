/**
 * Scoring-method expander.
 *
 * A framework may declare its scoring inputs + formula ONCE via a
 * `data.scoring_method` and list the types it `applies_to`, instead of repeating
 * the identical `required_properties` array and computed formula once per type.
 * `expandFramework` runs at the `definitions/` aggregation boundary and derives
 * the fully-expanded `required_properties` and `computed_properties` from the
 * method, so:
 *
 *   - authored definition files stay DRY (declare the method once), and
 *   - the public surface (`canonical.ts`, `@unified-product-graph/core`) stays
 *     fully expanded — byte-identical to a hand-written expanded definition —
 *     so every downstream consumer is unaffected (additive, zero-change).
 *
 * The method covers the DATA-layer scoring duplication only. `entity_types`
 * (which may interleave scored types with `role: 'item'` context types) and
 * `slots` (framework-specific and irregular) stay hand-authored and pass
 * through untouched.
 *
 * Frameworks without a method pass through unchanged. The function is idempotent
 * for already-expanded frameworks.
 */
import type {
  UPGFramework,
  FrameworkDataSpec,
  FrameworkScoringMethod,
  FrameworkEntityTypeSpec,
  FrameworkComputedProperty,
  FrameworkPropertyRequirement,
  FrameworkConstant,
} from './types.js'

/**
 * Authoring shape: a framework's `data` may declare a `scoring_method` INSTEAD of
 * the per-type `required_properties`/`computed_properties`, which the expander
 * derives. `FrameworkDataSpec` (required `required_properties`) is assignable to
 * this, so already-expanded definitions satisfy it unchanged.
 */
export interface FrameworkDataSource {
  entity_types: FrameworkEntityTypeSpec[]
  required_properties?: Record<string, FrameworkPropertyRequirement[]>
  computed_properties?: FrameworkComputedProperty[]
  constants?: FrameworkConstant[]
  scoring_method?: FrameworkScoringMethod
}

/** A framework as authored, before method expansion. */
export type UPGFrameworkSource = Omit<UPGFramework, 'data'> & { data: FrameworkDataSource }

/** Derive `required_properties` + `computed_properties` from a scoring method. */
function deriveFromMethod(method: FrameworkScoringMethod): {
  required_properties: Record<string, FrameworkPropertyRequirement[]>
  computed_properties: FrameworkComputedProperty[]
} {
  const required_properties: Record<string, FrameworkPropertyRequirement[]> = {}
  for (const type of method.applies_to) required_properties[type] = method.inputs

  const computed = method.computed ?? []
  const computed_properties: FrameworkComputedProperty[] = method.applies_to.flatMap((type) =>
    computed.map((c) => ({
      property: c.property,
      expression: c.expression,
      entity_type: type,
      ...(c.label !== undefined ? { label: c.label } : {}),
      ...(c.format !== undefined ? { format: c.format } : {}),
    })),
  )

  return { required_properties, computed_properties }
}

/**
 * Expand a (possibly method-authored) framework into a fully-expanded
 * `UPGFramework`. Pass-through when there is no `scoring_method`.
 */
export function expandFramework(framework: UPGFrameworkSource): UPGFramework {
  const data = framework.data
  if (!data.scoring_method) {
    // Already expanded (required_properties present) — return as the public type.
    return framework as UPGFramework
  }

  const { required_properties, computed_properties } = deriveFromMethod(data.scoring_method)

  // Key order matches a hand-written expanded definition so the regenerated
  // canonical.ts diff is purely the additive `scoring_method` field:
  // entity_types, required_properties, computed_properties, [constants], scoring_method.
  const expandedData: FrameworkDataSpec = {
    entity_types: data.entity_types,
    required_properties,
    ...(computed_properties.length > 0 ? { computed_properties } : {}),
    ...(data.constants ? { constants: data.constants } : {}),
    scoring_method: data.scoring_method,
  }

  return { ...framework, data: expandedData }
}

/** Expand a list of authored frameworks. */
export function expandFrameworks(frameworks: UPGFrameworkSource[]): UPGFramework[] {
  return frameworks.map(expandFramework)
}
