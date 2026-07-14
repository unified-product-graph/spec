/**
 * dashboard.tool — `omni` enum value (feedback f653bcdf).
 *
 * Omni (omniapp.co) is a warehouse-native BI / semantic-layer tool. Before this
 * it had no structured home in the `dashboard.tool` enum, so a real Omni
 * dashboard had to be modelled as `custom` with the true tool named only in
 * free text — not queryable. This locks the additive enum value in the runtime
 * schema. The interface↔schema sync (data.ts union ↔ UPG_PROPERTY_SCHEMA) is
 * separately enforced by property-schema-coverage.test.ts.
 *
 * Run: npx vitest run src/__tests__/dashboard-tool-omni.test.ts
 */

import { describe, it, expect } from 'vitest'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

describe('f653bcdf — dashboard.tool accepts "omni"', () => {
  it('the dashboard.tool enum includes omni alongside the existing tools', () => {
    const toolProp = UPG_PROPERTY_SCHEMA.dashboard?.tool as { enum?: string[] }
    expect(toolProp?.enum).toBeDefined()
    expect(toolProp.enum).toContain('omni')
    // Additive: the pre-existing values are untouched.
    expect(toolProp.enum).toEqual(
      expect.arrayContaining(['looker', 'amplitude', 'mixpanel', 'posthog', 'omni', 'custom']),
    )
  })
})
