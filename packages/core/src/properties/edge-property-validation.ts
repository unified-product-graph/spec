/**
 * Edge `properties` validation against a carries-properties edge's
 * `property_schema` (0.10.4). Shared by the writers (create_cross_product_edge,
 * batch_create_cross_product_edges, create_classification_edge) and by
 * validate_graph, so "what a classification edge may carry" has one source of
 * truth: the catalog `property_schema`.
 *
 * Edge types with no `property_schema` return no errors here — they accept an
 * unvalidated bag (the pre-0.10.4 behaviour, e.g. feature_rivals_competitor_feature).
 */
import type { PropertyDefinition } from './property-schema.js'
import { getEdgePropertySchema } from '../catalog/edge-catalog.js'
import { getScale } from '../grammar/scales.js'

/**
 * Validate an edge's `properties` bag against its catalog `property_schema`.
 * Returns human-readable error strings (empty array = valid). Unknown keys are
 * rejected; typed values are checked; an `assessment` is range-checked against
 * its scale and must carry its required keys.
 */
export function validateEdgeProperties(
  edgeType: string,
  properties: Record<string, unknown> | undefined,
): string[] {
  const schema = getEdgePropertySchema(edgeType)
  if (!schema || !properties) return []

  const errors: string[] = []
  const allowed = Object.keys(schema)

  for (const key of Object.keys(properties)) {
    if (!allowed.includes(key)) {
      errors.push(`unknown property "${key}" for edge type "${edgeType}" (allowed: ${allowed.join(', ')})`)
    }
  }

  for (const [key, def] of Object.entries(schema)) {
    const val = properties[key]
    if (val === undefined || val === null) continue
    errors.push(...validateValue(key, def, val))
  }

  return errors
}

function validateValue(key: string, def: PropertyDefinition, val: unknown): string[] {
  const errors: string[] = []
  switch (def.type) {
    case 'string':
      if (typeof val !== 'string') errors.push(`property "${key}" must be a string`)
      break
    case 'number':
      if (typeof val !== 'number') errors.push(`property "${key}" must be a number`)
      break
    case 'boolean':
      if (typeof val !== 'boolean') errors.push(`property "${key}" must be a boolean`)
      break
    case 'assessment': {
      if (typeof val !== 'object' || Array.isArray(val)) {
        errors.push(`property "${key}" must be an assessment object with value and label`)
        break
      }
      const a = val as Record<string, unknown>
      for (const r of def.required ?? ['value', 'label']) {
        if (a[r] === undefined || a[r] === null) errors.push(`assessment "${key}" is missing required "${r}"`)
      }
      if (a.value !== undefined && a.value !== null) {
        if (typeof a.value !== 'number') {
          errors.push(`assessment "${key}".value must be a number`)
        } else {
          const scaleId = (typeof a.scale_id === 'string' ? a.scale_id : undefined) ?? def.scale_id
          const scale = scaleId ? getScale(scaleId) : undefined
          if (scale && (a.value < scale.min || a.value > scale.max)) {
            errors.push(`assessment "${key}".value ${a.value} is out of range ${scale.min}-${scale.max} for scale ${scaleId}`)
          }
        }
      }
      if (typeof a.scale_id === 'string' && def.scale_id !== undefined && a.scale_id !== def.scale_id) {
        errors.push(`assessment "${key}".scale_id "${a.scale_id}" must be "${def.scale_id}"`)
      }
      break
    }
    // string[] / object / object[]: not used by edge property schemas today; no strict check.
  }
  return errors
}
