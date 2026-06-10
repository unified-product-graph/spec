/**
 * Ordering-convention gate (F8 · · pattern P-F).
 *
 * standardised journey ordering on explicit `*_order` integer scalars
 * (`journey_step.step_order`, `journey_action.action_order`): a container's
 * ordered children are positioned by a deterministic integer, not by free-text
 * arrays, insertion order, or nothing.
 *
 * The defect (P-F): sibling SEQUENCE types — ordered children of a container —
 * did not follow the precedent, so their siblings were not deterministically
 * orderable. This suite makes the convention non-recurring: every designated
 * sequence-sibling type must carry its `*_order` integer scalar, and the
 * canonical precedents themselves are pinned so the convention cannot silently
 * regress.
 *
 * Scope is encoded as explicit constants (SEQUENCE_TYPES, PRECEDENTS,
 * DEFERRED_TO_ADR) so that the in-scope set, the reference shape, and the two
 * intentional deferrals are a deliberate, reviewed choice rather than silent
 * drift. Adding a type to the convention is a single visible edit here.
 */
import { describe, it, expect } from 'vitest'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// ── Convention scope ─────────────────────────────────────────────────────────

/**
 * Sequence-sibling types brought onto the `*_order` convention by F8, keyed by
 * the runtime entity type (the key `UPG_PROPERTY_SCHEMA` uses) -> the expected
 * order property. Each is a container's ordered child (or an orderable sibling)
 * that previously lacked a deterministic order scalar.
 *
 *  - job_step / step_order:        ordered steps within a job (already compliant
 *                                  pre-F8; pinned so it stays).
 *  - user_flow / flow_order:       flows ordered among sibling flows.
 *  - screen_state / state_order:   states a screen moves through.
 *  - learning_path / path_order:   paths sequenced within a curriculum.
 *  - milestone / milestone_order:  delivery milestones within a project.
 *  - partner_tier / tier_order:    partner tiers (mirrors pricing_tier).
 */
const SEQUENCE_TYPES: Record<string, string> = {
  job_step: 'step_order',
  user_flow: 'flow_order',
  screen_state: 'state_order',
  learning_path: 'path_order',
  milestone: 'milestone_order',
  partner_tier: 'tier_order',
}

/**
 * The canonical precedents the convention derives from. Pinned so that the
 * reference shape ( journey ordering, plus the pricing tier order F8
 * mirrors) cannot be removed without this gate noticing.
 */
const PRECEDENTS: Record<string, string> = {
  journey_step: 'step_order',
  journey_action: 'action_order',
  pricing_tier: 'tier_order',
}

/**
 * Sequence types deliberately NOT handled by F8 because their ordering is owned
 * by a pending ADR. Encoded so the omission is visible and so that when each ADR
 * lands its type moves UP into SEQUENCE_TYPES rather than being rediscovered.
 *
 *  - prompt_version:          prompt_version ordering -> (ai ADR).
 *  - customer_journey_stage:  stage_order -> (customer_success ADR).
 */
const DEFERRED_TO_ADR: Record<string, string> = {
  prompt_version: '',
  customer_journey_stage: '',
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ordering convention: sequence-sibling types carry their *_order scalar', () => {
  for (const [entityType, prop] of Object.entries(SEQUENCE_TYPES)) {
    it(`${entityType} declares an integer ${prop} scalar`, () => {
      const schema = UPG_PROPERTY_SCHEMA[entityType]
      expect(schema, `${entityType} missing from UPG_PROPERTY_SCHEMA`).toBeDefined()
      const def = schema?.[prop]
      expect(def, `${entityType}.${prop} is not present`).toBeDefined()
      // `*_order` props are plain integers (optional), matching the journey
      // precedent — never an assessment/object/enum.
      expect(def?.type, `${entityType}.${prop} must be a number, got "${def?.type}"`).toBe('number')
      expect(def?.enum, `${entityType}.${prop} must not be an enum`).toBeUndefined()
    })
  }
})

describe('ordering convention: canonical precedents stay pinned', () => {
  for (const [entityType, prop] of Object.entries(PRECEDENTS)) {
    it(`${entityType}.${prop} remains a number scalar`, () => {
      const def = UPG_PROPERTY_SCHEMA[entityType]?.[prop]
      expect(def, `${entityType}.${prop} (precedent) is missing`).toBeDefined()
      expect(def?.type).toBe('number')
    })
  }
})

describe('ordering convention: deferred types are tracked, not silently dropped', () => {
  it('every deferred type still exists in the schema (so its ADR follow-up is real)', () => {
    for (const [entityType, adr] of Object.entries(DEFERRED_TO_ADR)) {
      expect(
        UPG_PROPERTY_SCHEMA[entityType],
        `deferred type ${entityType} (owned by ${adr}) is missing from the schema`,
      ).toBeDefined()
    }
  })

  it('no deferred type is also in the active convention set (no double-handling)', () => {
    for (const entityType of Object.keys(DEFERRED_TO_ADR)) {
      expect(
        Object.prototype.hasOwnProperty.call(SEQUENCE_TYPES, entityType),
        `${entityType} is both deferred to an ADR and in SEQUENCE_TYPES`,
      ).toBe(false)
    }
  })
})
