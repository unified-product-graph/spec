/**
 * — Top-level field drift property migrations.
 *
 * Validates the four `UPGPropertyMigration` kinds (`drop_props`,
 * `rename_top_level`, `lift_property_to_top_level`,
 * `drop_when_self_referential`) and the v0.2.13 product-node drift rules
 * surfaced by the Wave 3 dogfood (`.upg/entopo.upg` +
 * `.upg/unified-product-graph.upg`).
 */

import { describe, it, expect } from 'vitest'
import {
 migrateNodeProperties,
 getPropertyMigrations,
 UPG_PROPERTY_MIGRATIONS,
 type UPGPropertyMigration,
} from '../grammar/migrations.js'

// ─── Per-kind shape ──────────────────────────────────────────────────────────

describe('UPGPropertyMigration discriminated-union shape', () => {
 it('every entry carries a `kind` discriminator', () => {
 for (const [version, rules] of Object.entries(UPG_PROPERTY_MIGRATIONS)) {
 for (const rule of rules) {
 expect(rule.kind, `${version} rule missing kind`).toBeTruthy()
 expect(['drop_props', 'rename_top_level', 'lift_property_to_top_level', 'drop_when_self_referential', 'remap_property_value', 'reshape_value_to_assessment'])
 .toContain(rule.kind)
 }
 }
 })

 it('v0.2.13 carries three top-level drift rules (1× lift + rename + self-ref)', () => {
 // The product properties.stage → status lift (formerly rule #1) was retired
 // in 0.9.10 (batch-6 #33):/661 re-canonicalised product stage to
 // properties.stage, so lifting it flagged a fresh product as drift. The one
 // surviving lift is the hypothesis_claim properties.status → status rule.
 const v0213 = UPG_PROPERTY_MIGRATIONS['0.2.13']
 expect(v0213).toBeDefined()
 expect(v0213.length).toBe(3)
 const kinds = v0213.map((r) => r.kind)
 expect(kinds.filter((k) => k === 'lift_property_to_top_level').length).toBe(1)
 expect(kinds).toContain('rename_top_level')
 expect(kinds).toContain('drop_when_self_referential')
 })

 it('every entry carries a non-empty reason citing or precedent ticket', () => {
 for (const rules of Object.values(UPG_PROPERTY_MIGRATIONS)) {
 for (const rule of rules) {
 expect(rule.reason.length).toBeGreaterThan(20)
 }
 }
 })
})

// ─── lift_property_to_top_level — properties.stage → status ──────────────────

describe('Product properties.stage is canonical, not lifted (/661, batch-6 #33)', () => {
 it('does NOT lift a canonical product properties.stage to top-level status', () => {
 const node = {
 id: 'p1',
 type: 'product',
 title: 'Entopo',
 properties: { stage: 'build', other: 'preserved' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).status).toBeUndefined()
 expect(migrated.properties).toEqual({ stage: 'build', other: 'preserved' })
 const lifted = changes.find((c) => c.kind === 'lifted_to_top_level')
 expect(lifted).toBeUndefined()
 })

 it('leaves a legacy properties.stage="idea" in place (read-path coerces it)', () => {
 // Legacy "idea" is normalised to "concept" on READ by coerceProductStage,
 // not by a migration lift, so the value stays in properties.stage on disk
 // and a freshly-created product is born valid against its own validator.
 const node = {
 id: 'p2',
 type: 'product',
 title: 'X',
 properties: { stage: 'idea' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).status).toBeUndefined()
 expect(migrated.properties).toEqual({ stage: 'idea' })
 const lifted = changes.find((c) => c.kind === 'lifted_to_top_level')
 expect(lifted).toBeUndefined()
 })

 it('is a no-op when properties.stage is absent', () => {
 const node = { id: 'p3', type: 'product', title: 'X', properties: { other: 'x' } }
 const { node: out, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect(out).toBe(node)
 expect(changes.find((c) => c.kind === 'lifted_to_top_level')).toBeUndefined()
 })
})

// ─── A2 (0.9.14): key_result kr_status twin lifts to status ───────────────────

describe('A2: key_result.kr_status lifts to lifecycle status (0.9.14)', () => {
 it('lifts an authored kr_status to top-level status and removes the property', () => {
 const node = {
 id: 'kr1',
 type: 'key_result',
 title: 'Activation rate 40%',
 status: 'on_track',
 properties: { kr_status: 'at_risk', target_value: 40 },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.9.13', '0.9.14')
 expect((migrated as Record<string, unknown>).status).toBe('at_risk')
 expect((migrated.properties as Record<string, unknown>).kr_status).toBeUndefined()
 expect((migrated.properties as Record<string, unknown>).target_value).toBe(40)
 expect(changes.find((c) => c.kind === 'lifted_to_top_level')).toBeDefined()
 })

 it('is a no-op when kr_status is absent (status preserved)', () => {
 const node = { id: 'kr2', type: 'key_result', title: 'X', status: 'achieved', properties: { target_value: 1 } }
 const { node: out, changes } = migrateNodeProperties(node, '0.9.13', '0.9.14')
 expect((out as Record<string, unknown>).status).toBe('achieved')
 expect(changes.find((c) => c.kind === 'lifted_to_top_level')).toBeUndefined()
 })
})

// ─── rename_top_level — lifecycle_status → status ────────────────────────────

describe('Rename_top_level (lifecycle_status → status)', () => {
 it('renames lifecycle_status="draft" to status="concept" (with value remap)', () => {
 const node = {
 id: 'p1',
 type: 'product',
 title: 'UPG',
 lifecycle_status: 'draft',
 properties: {},
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).status).toBe('concept')
 expect((migrated as Record<string, unknown>).lifecycle_status).toBeUndefined()
 const renamed = changes.find((c) => c.kind === 'renamed_top_level')
 expect(renamed).toBeDefined()
 if (renamed?.kind === 'renamed_top_level') {
 expect(renamed.from).toBe('lifecycle_status')
 expect(renamed.to).toBe('status')
 expect(renamed.value_changed).toBe(true)
 }
 })

 it('renames "active" → "launch", "archived" → "sunset"', () => {
 const a = { id: 'a', type: 'product', title: 'A', lifecycle_status: 'active' }
 const b = { id: 'b', type: 'product', title: 'B', lifecycle_status: 'archived' }
 const aOut = migrateNodeProperties(a, '0.2.12', '0.2.13').node as Record<string, unknown>
 const bOut = migrateNodeProperties(b, '0.2.12', '0.2.13').node as Record<string, unknown>
 expect(aOut.status).toBe('launch')
 expect(bOut.status).toBe('sunset')
 })

 it('passes unmapped values through verbatim (value_map is partial)', () => {
 const node = { id: 'p', type: 'product', title: 'P', lifecycle_status: 'unknown_value' }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).status).toBe('unknown_value') // copied verbatim
 const renamed = changes.find((c) => c.kind === 'renamed_top_level')
 if (renamed?.kind === 'renamed_top_level') {
 expect(renamed.value_changed).toBe(false)
 }
 })

 it('value_changed reports actual mutation, not map-presence (identity entries)', () => {
 // hypothesis_claim value_map contains identity entries
 // (`'drafted' → 'drafted'`) so the rule explicitly handles
 // already-canonical values. Confirm value_changed is false in that case
 // — the `lifted_to_top_level` change kind itself signals the structural
 // move; the boolean is reserved for actual value rewrites.
 // Note: type is 'hypothesis_claim' — nodes were typed as such at v0.2.13.
 // v0.4.0 renames hypothesis_claim → hypothesis as a later step.
 const node = {
 id: 'h1',
 type: 'hypothesis_claim',
 properties: { status: 'drafted' }, // identity: drafted → drafted
 }
 const { changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 const lifted = changes.find(
 (c) => c.kind === 'lifted_to_top_level' && c.from_property === 'status',
 )
 expect(lifted).toBeDefined()
 if (lifted?.kind === 'lifted_to_top_level') {
 expect(lifted.value_changed).toBe(false)
 }
 })

 it('is a no-op when lifecycle_status is absent', () => {
 const node = { id: 'p', type: 'product', title: 'P', properties: {} }
 const { node: out, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect(out).toBe(node)
 expect(changes.find((c) => c.kind === 'renamed_top_level')).toBeUndefined()
 })
})

// ─── drop_when_self_referential — source_id / source_type cleanup ────────────

describe('Drop_when_self_referential (source_id / source_type)', () => {
 it('drops source_id and source_type when they self-reference', () => {
 const node = {
 id: 'x1',
 type: 'product',
 title: 'X',
 source_id: 'x1', // self-referential
 source_type: 'product', // self-referential
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).source_id).toBeUndefined()
 expect((migrated as Record<string, unknown>).source_type).toBeUndefined()
 const fields = changes
 .filter((c) => c.kind === 'self_ref_dropped')
 .map((c) => (c.kind === 'self_ref_dropped' ? c.field : ''))
 expect(fields.sort()).toEqual(['source_id', 'source_type'])
 })

 it('preserves source_id when it points elsewhere (legitimate import metadata)', () => {
 const node = {
 id: 'x1',
 type: 'product',
 title: 'X',
 source_id: 'notion-page-abc123', // genuine cross-system reference
 source_type: 'notion_page', // genuine cross-system reference
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).source_id).toBe('notion-page-abc123')
 expect((migrated as Record<string, unknown>).source_type).toBe('notion_page')
 expect(changes.find((c) => c.kind === 'self_ref_dropped')).toBeUndefined()
 })

 it('applies to any type via the `*` wildcard', () => {
 const node = {
 id: 'persona-1',
 type: 'persona',
 source_id: 'persona-1',
 source_type: 'persona',
 }
 const { node: migrated } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).source_id).toBeUndefined()
 expect((migrated as Record<string, unknown>).source_type).toBeUndefined()
 })
})

// ─── Composition — multiple kinds in one pass ────────────────────────────────

describe('Composition (multiple kinds in one migration pass)', () => {
 it('applies lift + rename + self-ref drops together against unified-product-graph fixture', () => {
 // Mirror of the actual unified-product-graph.upg product node shape.
 const node = {
 id: 'upg-product',
 type: 'product',
 title: 'Unified Product Graph',
 lifecycle_status: 'draft',
 source_id: 'upg-product',
 source_type: 'product',
 properties: { stage: 'idea' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.0.0', '0.2.13')

 // status comes from the rename of lifecycle_status='draft' → 'concept'
 // (rule #2). The product properties.stage lift was retired in 0.9.10
 // (batch-6 #33), so properties.stage stays in place — no lifted_to_top_level.
 expect((migrated as Record<string, unknown>).status).toBe('concept')
 expect((migrated as Record<string, unknown>).lifecycle_status).toBeUndefined()
 expect((migrated as Record<string, unknown>).source_id).toBeUndefined()
 expect((migrated as Record<string, unknown>).source_type).toBeUndefined()
 expect(migrated.properties).toEqual({ stage: 'idea' })

 const kinds = changes.map((c) => c.kind).sort()
 expect(kinds).not.toContain('lifted_to_top_level')
 expect(kinds).toContain('renamed_top_level')
 expect(kinds.filter((k) => k === 'self_ref_dropped').length).toBe(2)
 })

 it('is a no-op against the entopo-graph fixture (properties.stage preserved)', () => {
 // Mirror of the actual entopo.upg product node shape. With the product
 // stage lift retired (0.9.10, batch-6 #33), no 0.2.13 rule applies:
 // properties.stage stays put and the node is born valid.
 const node = {
 id: 'entopo-product',
 type: 'product',
 title: 'Entopo',
 properties: { stage: 'idea' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.0.0', '0.2.13')

 expect((migrated as Record<string, unknown>).status).toBeUndefined()
 expect(migrated.properties).toEqual({ stage: 'idea' })

 const kinds = changes.map((c) => c.kind)
 expect(kinds).not.toContain('lifted_to_top_level')
 expect(kinds).not.toContain('renamed_top_level')
 expect(kinds).not.toContain('self_ref_dropped')
 })
})

// ─── hypothesis_claim properties.status lift + cross-lifecycle remap (§Update §1) ──

describe('§Update §1 — hypothesis_claim properties.status lift', () => {
 it('lifts properties.status="untested" to top-level status="drafted"', () => {
 // Mirror of the actual hypothesis_claim node shape in production graphs
 // post Wave 3 migrate_type(hypothesis → hypothesis_claim).
 const node = {
 id: 'h1',
 type: 'hypothesis_claim',
 title: '30-second application drives daily habit',
 properties: {
 we_believe: '...',
 will_result_in: '...',
 we_know_when: '...',
 status: 'untested',
 },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 const out = migrated as Record<string, unknown>
 expect(out.status).toBe('drafted')
 expect(migrated.properties).toEqual({
 we_believe: '...',
 will_result_in: '...',
 we_know_when: '...',
 })
 const lifted = changes.find(
 (c) => c.kind === 'lifted_to_top_level' && c.from_property === 'status',
 )
 expect(lifted).toBeDefined()
 if (lifted?.kind === 'lifted_to_top_level') {
 expect(lifted.value_changed).toBe(true)
 }
 })

 it.each([
 ['untested', 'drafted'],
 ['testing', 'active'],
 ['resolved', 'active'],
 ['validated', 'validated'],
 ['invalidated', 'invalidated'],
 ['drafted', 'drafted'],
 ['active', 'active'],
 ['archived', 'archived'],
 ])('value remap: properties.status="%s" → status="%s"', (from, to) => {
 const node = {
 id: 'h1',
 type: 'hypothesis_claim',
 properties: { status: from },
 }
 const { node: migrated } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 expect((migrated as Record<string, unknown>).status).toBe(to)
 })

 it('does not affect non-hypothesis_claim types (rule is type-scoped)', () => {
 const node = {
 id: 'p1',
 type: 'persona',
 properties: { status: 'untested' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.12', '0.2.13')
 // No rule fires for persona — properties.status passes through unchanged.
 expect(migrated.properties).toEqual({ status: 'untested' })
 expect(
 changes.find((c) => c.kind === 'lifted_to_top_level' && c.from_property === 'status'),
 ).toBeUndefined()
 })
})

// ─── Backward-compat — existing + entries still work ─────────

describe('Backward compat (drop_props kind still applies)', () => {
 it('Metric drops still fire', () => {
 const node = {
 id: 'm1',
 type: 'metric',
 properties: { quality_score: 4, current_value: 100 },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.0', '0.2.2')
 expect(migrated.properties).toEqual({ current_value: 100 })
 const dropped = changes.flatMap((c) => (c.kind === 'dropped' ? [c.key] : []))
 expect(dropped).toContain('quality_score')
 })

 it('Hypothesis we_test_by drop still fires', () => {
 const node = {
 id: 'h1',
 type: 'hypothesis',
 properties: { we_believe: 'a', we_test_by: 'b' },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.7', '0.2.8')
 expect(migrated.properties).toEqual({ we_believe: 'a' })
 expect(changes.find((c) => c.kind === 'dropped' && c.key === 'we_test_by')).toBeDefined()
 })
})

// ─── Range filter via fixed semver helper (dependency) ───────────────

describe('Range filter reaches v0.2.13 rules from any starting version', () => {
 it('getPropertyMigrations(0.0.0, 0.2.13) returns all three eras', () => {
 const all = getPropertyMigrations('0.0.0', '0.2.13')
 const byKind = all.reduce<Record<string, number>>((acc, r) => {
 acc[r.kind] = (acc[r.kind] ?? 0) + 1
 return acc
 }, {})
 expect(byKind.drop_props).toBe(2) // metric (0.2.2) + hypothesis (0.2.8)
 expect(byKind.lift_property_to_top_level).toBe(1) // hypothesis_claim.status (product.stage lift retired in 0.9.10)
 expect(byKind.rename_top_level).toBe(1)
 expect(byKind.drop_when_self_referential).toBe(1)
 })

 it('getPropertyMigrations(0.0.0, 0.2.12) excludes v0.2.13 rules', () => {
 const upTo212 = getPropertyMigrations('0.0.0', '0.2.12')
 expect(upTo212.find((r) => r.kind === 'lift_property_to_top_level')).toBeUndefined()
 expect(upTo212.find((r) => r.kind === 'rename_top_level')).toBeUndefined()
 expect(upTo212.find((r) => r.kind === 'drop_when_self_referential')).toBeUndefined()
 })
})

// ─── — rename_top_level for `outcome` (v0.2.14) ─────────────────────

describe('Rename_top_level outcome (lifecycle_status → status)', () => {
 it('renames outcome.lifecycle_status="draft" to status="concept"', () => {
 const node = {
 id: 'o1',
 type: 'outcome',
 title: 'Increase retention',
 lifecycle_status: 'draft',
 properties: {},
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.13', '0.2.14')
 expect((migrated as Record<string, unknown>).status).toBe('concept')
 expect((migrated as Record<string, unknown>).lifecycle_status).toBeUndefined()
 const renamed = changes.find((c) => c.kind === 'renamed_top_level')
 expect(renamed).toBeDefined()
 if (renamed?.kind === 'renamed_top_level') {
 expect(renamed.from).toBe('lifecycle_status')
 expect(renamed.to).toBe('status')
 expect(renamed.value_changed).toBe(true)
 }
 })

 it('renames "active" → "launch", "archived" → "sunset", "retired" → "sunset"', () => {
 const a = { id: 'o-a', type: 'outcome', title: 'A', lifecycle_status: 'active' }
 const b = { id: 'o-b', type: 'outcome', title: 'B', lifecycle_status: 'archived' }
 const c = { id: 'o-c', type: 'outcome', title: 'C', lifecycle_status: 'retired' }
 const aOut = migrateNodeProperties(a, '0.2.13', '0.2.14').node as Record<string, unknown>
 const bOut = migrateNodeProperties(b, '0.2.13', '0.2.14').node as Record<string, unknown>
 const cOut = migrateNodeProperties(c, '0.2.13', '0.2.14').node as Record<string, unknown>
 expect(aOut.status).toBe('launch')
 expect(bOut.status).toBe('sunset')
 expect(cOut.status).toBe('sunset')
 })

 it('passes unmapped values through verbatim', () => {
 const node = { id: 'o1', type: 'outcome', title: 'O', lifecycle_status: 'unknown_value' }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.13', '0.2.14')
 expect((migrated as Record<string, unknown>).status).toBe('unknown_value')
 const renamed = changes.find((c) => c.kind === 'renamed_top_level')
 if (renamed?.kind === 'renamed_top_level') {
 expect(renamed.value_changed).toBe(false)
 }
 })

 it('is a no-op when lifecycle_status is absent on outcome', () => {
 const node = { id: 'o1', type: 'outcome', title: 'O', properties: {} }
 const { node: out, changes } = migrateNodeProperties(node, '0.2.13', '0.2.14')
 expect(out).toBe(node)
 expect(changes.find((c) => c.kind === 'renamed_top_level')).toBeUndefined()
 })

 it('does NOT affect non-outcome types (rule is type-scoped)', () => {
 // A `persona` node with lifecycle_status should not be touched by the
 // outcome-specific v0.2.14 rule.
 const node = { id: 'persona-1', type: 'persona', lifecycle_status: 'active' }
 const { node: out, changes } = migrateNodeProperties(node, '0.2.13', '0.2.14')
 expect((out as Record<string, unknown>).lifecycle_status).toBe('active')
 expect((out as Record<string, unknown>).status).toBeUndefined()
 expect(changes.find((c) => c.kind === 'renamed_top_level')).toBeUndefined()
 })

 it('v0.2.14 bucket contains exactly one rule of kind rename_top_level for outcome', () => {
 const v0214 = UPG_PROPERTY_MIGRATIONS['0.2.14']
 expect(v0214).toBeDefined()
 expect(v0214.length).toBe(1)
 const rule = v0214[0]
 expect(rule.kind).toBe('rename_top_level')
 if (rule.kind === 'rename_top_level') {
 expect(rule.type).toBe('outcome')
 expect(rule.from).toBe('lifecycle_status')
 expect(rule.to).toBe('status')
 }
 })

 it('getPropertyMigrations(0.0.0, 0.2.14) includes 2× rename_top_level (product + outcome)', () => {
 const all = getPropertyMigrations('0.0.0', '0.2.14')
 const renames = all.filter((r) => r.kind === 'rename_top_level')
 expect(renames.length).toBe(2)
 const types = renames.map((r) => (r.kind === 'rename_top_level' ? r.type : '')).sort()
 expect(types).toEqual(['outcome', 'product'])
 })

 it('getPropertyMigrations(0.0.0, 0.2.13) still returns only 1× rename_top_level (no regression)', () => {
 const upTo213 = getPropertyMigrations('0.0.0', '0.2.13')
 const renames = upTo213.filter((r) => r.kind === 'rename_top_level')
 expect(renames.length).toBe(1)
 if (renames[0]?.kind === 'rename_top_level') {
 expect(renames[0].type).toBe('product')
 }
 })
})

// ─── Type-only smoke check ───────────────────────────────────────────────────

const _typeCheck: UPGPropertyMigration = {
 kind: 'rename_top_level',
 type: 'product',
 from: 'lifecycle_status',
 to: 'status',
 reason: 'compile-time only',
}
void _typeCheck
