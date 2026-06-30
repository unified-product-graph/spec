/**
 * constraint_origin — provenance sub-role on constraint (0.17.2, E-nicety).
 *
 * `constraint` models qualitative guardrails in place of a separate principle
 * type. `constraint_origin` records where a guardrail comes from, orthogonal to
 * `constraint_kind` (category), `constraint_status` (in-effect state), and
 * `rule_strength` (enforcement): `internal` = self-imposed (a principle or
 * operating tenet the team commits to), `external` = imposed on us (a limit,
 * requirement, or ceiling). Optional and additive.
 */
import { describe, it, expect } from 'vitest'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

describe('constraint_origin', () => {
  it('is registered on the constraint property schema as an internal/external enum', () => {
    const schema = UPG_PROPERTY_SCHEMA.constraint as Record<string, { type: string; enum?: string[] }>
    expect(schema.constraint_origin).toBeDefined()
    expect(schema.constraint_origin.type).toBe('string')
    expect(schema.constraint_origin.enum).toEqual(['internal', 'external'])
  })

  it('sits alongside the existing constraint axes, not replacing them', () => {
    const schema = UPG_PROPERTY_SCHEMA.constraint as Record<string, unknown>
    // origin (provenance) is orthogonal to kind (category), status (in-effect),
    // and rule_strength (enforcement) — all coexist.
    for (const key of ['constraint_kind', 'constraint_status', 'rule_strength', 'constraint_origin']) {
      expect(schema[key], `constraint should keep ${key}`).toBeDefined()
    }
  })
})
