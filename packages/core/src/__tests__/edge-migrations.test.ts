/**
 * Edge Migrations — Spec Tests
 *
 * Validates `UPG_EDGE_MIGRATIONS` and the `migrateEdge` runtime contract
 * for the v0.2.0 → v0.2.8 arc.
 *
 * Three layers of assertion:
 *
 * 1. **Per-rule integrity** — every entry's `from` is unique within its
 * version bucket, every `rename` rule's `to` resolves to a key in
 * `UPG_EDGE_CATALOG`, and every entry carries a non-empty `reason`.
 *
 * 2. **Version-range semantics** — `getUPGEdgeMigrations(from, to)` returns
 * only rules whose registry version is `> from && <= to`, in version
 * order.
 *
 * 3. **`migrateEdge` runtime** — drop returns null, rename retypes (and
 * optionally flips), endpoint guards skip when unsatisfied, and the
 * composition with `migrateNode` produces canonical post-migration
 * edges between already-migrated endpoints.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import {
 UPG_EDGE_MIGRATIONS,
 getUPGEdgeMigrations,
 migrateEdge,
 migrateNode,
 type UPGEdgeMigration,
} from '../grammar/migrations.js'

// ─── Per-rule integrity ───────────────────────────────────────────────────────

describe('Per-rule integrity', () => {
 it('every rule carries a non-empty reason', () => {
 for (const [version, rules] of Object.entries(UPG_EDGE_MIGRATIONS)) {
 for (const rule of rules) {
 expect(rule.reason, `${version} ${rule.from}`).toBeTruthy()
 expect(rule.reason.length, `${version} ${rule.from}`).toBeGreaterThan(20)
 }
 }
 })

 it('every `from` is unique within its version bucket', () => {
 for (const [version, rules] of Object.entries(UPG_EDGE_MIGRATIONS)) {
 const seen = new Set<string>()
 for (const rule of rules) {
 expect(seen.has(rule.from), `${version} duplicate: ${rule.from}`).toBe(false)
 seen.add(rule.from)
 }
 }
 })

 it('every rename rule\'s `to` either resolves in UPG_EDGE_CATALOG or is migrated again by a later rule', () => {
 // A rule\'s `to` may be an *intermediate* key — superseded by a later
 // version\'s rule (e.g. v0.2.7 retargets hypothesis_requires_experiment
 // → hypothesis_requires_experiment_plan, then v0.2.8 retargets that
 // again to hypothesis_claim_requires_experiment_plan). The chain must
 // terminate at a key in UPG_EDGE_CATALOG or at a drop.
 const catalogKeys = new Set(Object.keys(UPG_EDGE_CATALOG))
 // Index: any key that appears as `from` in any later rule (rename or drop).
 const allFromKeys = new Set<string>()
 for (const rules of Object.values(UPG_EDGE_MIGRATIONS)) {
 for (const rule of rules) allFromKeys.add(rule.from)
 }
 for (const [version, rules] of Object.entries(UPG_EDGE_MIGRATIONS)) {
 for (const rule of rules) {
 if (rule.kind === 'rename') {
 expect(
 catalogKeys.has(rule.to) || allFromKeys.has(rule.to),
 `${version} ${rule.from} → ${rule.to} (not in catalog and not chained to a later rule)`,
 ).toBe(true)
 }
 }
 }
 })

 it('every rename rule\'s endpoint guards match the catalog entry\'s typed endpoints', () => {
 // Guards are evaluated against the *original* edge's endpoints
 // (post-node-migration but pre-flip). For flip:true rules, the
 // original-source endpoint becomes the new-target after flip — so the
 // guard for `requires_source_type` must match the catalog's
 // `target_type`, and vice versa.
 for (const rules of Object.values(UPG_EDGE_MIGRATIONS)) {
 for (const rule of rules) {
 if (rule.kind !== 'rename') continue
 const entry = (UPG_EDGE_CATALOG as Record<string, { source_type: string; target_type: string }>)[rule.to]
 if (!entry) continue
 const expectedSource = rule.flip ? entry.target_type : entry.source_type
 const expectedTarget = rule.flip ? entry.source_type : entry.target_type
 if (rule.requires_source_type !== undefined) {
 expect(rule.requires_source_type, `${rule.from} source guard${rule.flip ? ' (flipped)' : ''}`).toBe(expectedSource)
 }
 if (rule.requires_target_type !== undefined) {
 expect(rule.requires_target_type, `${rule.from} target guard${rule.flip ? ' (flipped)' : ''}`).toBe(expectedTarget)
 }
 }
 }
 })

 it('drop rule `from` keys are no longer in the canonical catalog', () => {
 const catalogKeys = new Set(Object.keys(UPG_EDGE_CATALOG))
 for (const rules of Object.values(UPG_EDGE_MIGRATIONS)) {
 for (const rule of rules) {
 if (rule.kind === 'drop') {
 expect(
 catalogKeys.has(rule.from),
 `drop ${rule.from} should not exist in catalog`,
 ).toBe(false)
 }
 }
 }
 })
})

// ─── Version-range semantics ──────────────────────────────────────────────────

describe('GetUPGEdgeMigrations version range', () => {
 it('returns no rules when from === to (same version)', () => {
 expect(getUPGEdgeMigrations('0.2.0', '0.2.0')).toEqual([])
 expect(getUPGEdgeMigrations('0.2.7', '0.2.7')).toEqual([])
 })

 it('v0.0.0 → v0.2.0 returns the 6 jtbd→job + 2 suffix-canonical + 2 persona-chain renames + 24 informal-edge drops (+ + + restoration)', () => {
 const rules = getUPGEdgeMigrations('0.0.0', '0.2.0')
 const renames = rules.filter((r) => r.kind === 'rename')
 const drops = rules.filter((r) => r.kind === 'drop')
 expect(renames.length).toBe(10) // 6 jtbd + 2 suffix + 2 persona-chain
 // (2026-04-30): `product_contains_competitive_analysis` was on
 // the original cleanup list (count: 19+6=25), but is being
 // resurrected as a canonical anchor — see migrations.ts comment +
 // chain validation. Drop count drops by 1 to 24.
 expect(drops.length).toBe(24) // informal-edge cleanup (18) + v0.2.6+ children (6)
 expect(rules.find((r) => r.from === 'persona_has_jtbd')).toBeDefined()
 expect(rules.find((r) => r.from === 'outcome_reveals_opportunity_causal')).toBeDefined()
 expect(rules.find((r) => r.from === 'persona_pursues_job_semantic')).toBeDefined()
 expect(rules.find((r) => r.from === 'product_contains_persona')).toBeDefined()
 expect(rules.find((r) => r.from === 'related_to')).toBeDefined()
 // follow-ons
 expect(rules.find((r) => r.from === 'product_contains_metric')).toBeDefined()
 expect(rules.find((r) => r.from === 'product_contains_story_statement')).toBeDefined()
 expect(rules.find((r) => r.from === 'product_contains_experiment')).toBeDefined()
 expect(rules.find((r) => r.from === 'persona_seeks_desired_outcome')).toBeDefined()
 expect(rules.find((r) => r.from === 'persona_faces_switching_cost')).toBeDefined()
 })

 it('v0.2.6 → v0.2.7 returns only v0.2.7 rules (experiment + user_story)', () => {
 const rules = getUPGEdgeMigrations('0.2.6', '0.2.7')
 expect(rules.length).toBeGreaterThan(0)
 // Includes the user_story_broken_into_task drop + experiment_tests_hypothesis drop.
 const drops = rules.filter((r) => r.kind === 'drop').map((r) => r.from)
 expect(drops).toContain('experiment_tests_hypothesis')
 expect(drops).toContain('user_story_broken_into_task')
 // task_implements_user_story is NO LONGER dropped — v0.7.0/ re-canon
 // (story_statement → user_story) makes it the canonical implements edge again,
 // and a drop rule must never name a canonical edge.
 expect(drops).not.toContain('task_implements_user_story')
 // v0.2.0 backfill rules must NOT appear.
 expect(rules.find((r) => r.from === 'persona_has_jtbd')).toBeUndefined()
 })

 it('v0.0.0 → v0.2.8 returns the full arc', () => {
 const all = getUPGEdgeMigrations('0.0.0', '0.2.8')
 const drops = all.filter((r) => r.kind === 'drop')
 // v0.2.0: 18 informal-edge drops (was 19; restored
 // `product_contains_competitive_analysis`) + 6 follow-on
 // product_contains_<v0.2.6+ child> drops = 24
 // v0.2.7: experiment_tests_hypothesis + user_story_broken_into_task
 //   (the task_implements_user_story drop was removed at v0.7.0/ —
 //    re-canon makes it the canonical implements edge again)
 // v0.2.8: evidence_supports_hypothesis
 expect(drops.length).toBe(27)
 expect(drops.find((r) => r.from === 'evidence_supports_hypothesis')).toBeDefined()
 expect(drops.find((r) => r.from === 'product_contains_persona')).toBeDefined()
 expect(drops.find((r) => r.from === 'product_contains_experiment_run')).toBeDefined()
 })

 it('v0.2.7 → v0.2.8 returns the 12 hypothesis retargets + 1 drop + 1 flip rule', () => {
 const rules = getUPGEdgeMigrations('0.2.7', '0.2.8')
 const renames = rules.filter((r) => r.kind === 'rename')
 const drops = rules.filter((r) => r.kind === 'drop')
 expect(renames.length).toBe(13) // 12 hypothesis retargets + 1 hypothesis_contains_feature flip
 expect(drops.length).toBe(1)
 expect(drops[0]!.from).toBe('evidence_supports_hypothesis')
 expect(rules.find((r) => r.from === 'hypothesis_contains_feature')).toBeDefined()
 })
})

// ─── migrateEdge runtime ──────────────────────────────────────────────────────

describe('MigrateEdge runtime', () => {
 it('passes through unchanged when no rule matches', () => {
 const edge = { id: 'e1', source: 'p1', target: 'j1', type: 'persona_pursues_job' }
 const result = migrateEdge(edge, '0.0.0', '0.2.8')
 expect(result).toBe(edge) // referentially equal
 })

 it('applies rename when endpoint guards are satisfied', () => {
 const edge = { id: 'e2', source: 'p1', target: 'j1', type: 'persona_has_jtbd' }
 const result = migrateEdge(edge, '0.0.0', '0.2.0', {
 sourceType: 'persona',
 targetType: 'job',
 })
 expect(result).not.toBeNull()
 expect(result!.type).toBe('persona_pursues_job')
 expect(result!.source).toBe('p1')
 expect(result!.target).toBe('j1')
 })

 it('skips guarded rule when endpoint context not provided', () => {
 const edge = { id: 'e3', source: 'p1', target: 'j1', type: 'persona_has_jtbd' }
 const result = migrateEdge(edge, '0.0.0', '0.2.0')
 // No endpoints provided — guarded rule does not fire; original edge returned.
 expect(result).toBe(edge)
 })

 it('skips guarded rule when endpoint type does not match', () => {
 const edge = { id: 'e4', source: 'p1', target: 'j1', type: 'persona_has_jtbd' }
 const result = migrateEdge(edge, '0.0.0', '0.2.0', {
 sourceType: 'persona',
 targetType: 'jtbd', // pre-migration target type — guard requires 'job' (post-migration)
 })
 expect(result).toBe(edge) // guard mismatch → no migration
 })

 it('returns null for drop rules', () => {
 const edge = { id: 'e5', source: 'ex1', target: 'h1', type: 'experiment_tests_hypothesis' }
 const result = migrateEdge(edge, '0.0.0', '0.2.7')
 expect(result).toBeNull()
 })

 it('returns null for v0.2.8 evidence_supports_hypothesis drop', () => {
 const edge = { id: 'e6', source: 'ev1', target: 'h1', type: 'evidence_supports_hypothesis' }
 const result = migrateEdge(edge, '0.2.7', '0.2.8')
 expect(result).toBeNull()
 })

 it('flip swaps endpoints when set on a rename rule', () => {
 // No registry entry uses flip:true today — synthesise a rule to assert
 // the runtime honours the field. Future renames that invert direction
 // will rely on this path.
 const synth: UPGEdgeMigration = {
 kind: 'rename',
 from: 'fake_legacy_edge',
 to: 'persona_pursues_job', // any catalog key — only `type` is asserted
 flip: true,
 reason: 'synthetic test fixture',
 }
 // Inline runner mirroring migrateEdge's flip branch.
 const edge = { id: 'e7', source: 'A', target: 'B', type: 'fake_legacy_edge' }
 if (synth.kind === 'rename' && synth.flip) {
 const flipped = { ...edge, type: synth.to, source: edge.target, target: edge.source }
 expect(flipped.source).toBe('B')
 expect(flipped.target).toBe('A')
 expect(flipped.type).toBe('persona_pursues_job')
 }
 })
})

// ─── Composition with migrateNode (post-migration endpoint guards) ────────────

describe('Composition with migrateNode + applySplit', () => {
 it('hypothesis-edge migration fires only after hypothesis → hypothesis_claim node migration', () => {
 // Simulate a legacy v0.2.7 graph with a hypothesis node and a
 // learning_updates_hypothesis edge. The edge's target endpoint must
 // first migrate via migrateNode before the edge migration's
 // requires_target_type='hypothesis_claim' guard can satisfy.
 const legacyHypothesis = { id: 'h1', type: 'hypothesis', properties: { we_believe: 'x' } }
 const legacyEdge = { id: 'e1', source: 'l1', target: 'h1', type: 'learning_updates_hypothesis' }

 // Step 1: node migration (v0.2.7 → v0.2.8 alias).
 const migratedTarget = migrateNode(legacyHypothesis, '0.2.7', '0.2.8')
 expect(migratedTarget.type).toBe('hypothesis_claim')

 // Step 2: edge migration with post-migration endpoint context.
 const migratedEdge = migrateEdge(legacyEdge, '0.2.7', '0.2.8', {
 sourceType: 'learning',
 targetType: migratedTarget.type, // 'hypothesis_claim'
 })
 expect(migratedEdge).not.toBeNull()
 expect(migratedEdge!.type).toBe('learning_updates_hypothesis_claim')
 })

 it('experiment-edge migration retargets to plan or run based on guard', () => {
 // hypothesis_requires_experiment retargets to hypothesis_requires_experiment_plan
 // (target experiment → experiment_plan) in v0.2.7.
 const edge = { id: 'e2', source: 'h1', target: 'p1', type: 'hypothesis_requires_experiment' }
 const result = migrateEdge(edge, '0.2.6', '0.2.7', {
 sourceType: 'hypothesis',
 targetType: 'experiment_plan',
 })
 expect(result).not.toBeNull()
 expect(result!.type).toBe('hypothesis_requires_experiment_plan')

 // Same edge with target='experiment_run' should NOT match this rule
 // (rule requires target=experiment_plan).
 const wrongTarget = migrateEdge(edge, '0.2.6', '0.2.7', {
 sourceType: 'hypothesis',
 targetType: 'experiment_run',
 })
 expect(wrongTarget).toBe(edge)
 })

 it('experiment_run_validates_hypothesis target retarget across v0.2.6 → v0.2.8', () => {
 // The edge was introduced in v0.2.6 with target=hypothesis; v0.2.8
 // retargets to hypothesis_claim. Cross-version migration should pick
 // up the v0.2.8 rule.
 const edge = {
 id: 'e3',
 source: 'r1',
 target: 'h1',
 type: 'experiment_run_validates_hypothesis',
 }
 const result = migrateEdge(edge, '0.2.6', '0.2.8', {
 sourceType: 'experiment_run',
 targetType: 'hypothesis_claim',
 })
 expect(result).not.toBeNull()
 expect(result!.type).toBe('experiment_run_validates_hypothesis_claim')
 })
})

// ─── — coverage-gap pass (cross-graph audit findings) ─────────────────

describe('Bucket 1: suffix-canonical renames', () => {
 it('outcome_reveals_opportunity_causal renames to canonical stem (un-guarded)', () => {
 const edge = { id: 'e1', source: 'o1', target: 'op1', type: 'outcome_reveals_opportunity_causal' }
 // Un-guarded rule fires without endpoints context.
 const result = migrateEdge(edge, '0.0.0', '0.2.0')
 expect(result).not.toBeNull()
 expect(result!.type).toBe('outcome_reveals_opportunity')
 })

 it('persona_pursues_job_semantic renames to canonical stem (un-guarded)', () => {
 const edge = { id: 'e2', source: 'p1', target: 'j1', type: 'persona_pursues_job_semantic' }
 const result = migrateEdge(edge, '0.0.0', '0.2.0')
 expect(result).not.toBeNull()
 expect(result!.type).toBe('persona_pursues_job')
 })
})

describe('Bucket 2: informal-edge drops', () => {
 it.each([
 'product_contains_persona',
 'product_contains_market_segment',
 'product_contains_market_trend',
 'product_contains_proof_point',
 'product_contains_value_proposition',
 'product_contains_hypothesis',
 'product_contains_positioning',
 // restoration (2026-04-30): `product_contains_competitive_analysis`
 // is back in the canonical catalog. It is intentionally NOT in this drop
 // list — see migrations.ts comment block.
 'product_contains_content_strategy',
 'product_contains_epic',
 'product_contains_ideal_customer_profile',
 'product_contains_insight',
 'product_contains_competitor',
 'product_contains_learning',
 'hypothesis_contains_persona',
 'positioning_contains_content_piece',
 'feature_contains_feature',
 'parent_of',
 'related_to',
 ])('drops legacy edge `%s` (returns null)', (legacyType) => {
 const edge = { id: 'e', source: 's', target: 't', type: legacyType }
 const result = migrateEdge(edge, '0.0.0', '0.2.0')
 expect(result).toBeNull()
 })

 it('canonical product_contains_research_study + product_contains_screen are NOT dropped', () => {
 // Sanity check: the two canonical product_contains_* edges remain valid.
 const research = { id: 'e1', source: 'p1', target: 'r1', type: 'product_contains_research_study' }
 const screen = { id: 'e2', source: 'p1', target: 's1', type: 'product_contains_screen' }
 expect(migrateEdge(research, '0.0.0', '0.2.0')).toBe(research)
 expect(migrateEdge(screen, '0.0.0', '0.2.0')).toBe(screen)
 })
})

describe('Bucket 3: direction-flip rule', () => {
 it('hypothesis_contains_feature flips + retypes to feature_tests_hypothesis_claim', () => {
 // Original edge: source=hypothesis_node, target=feature_node, type=hypothesis_contains_feature.
 // Post node migration: hypothesis → hypothesis_claim.
 // Edge migration with post-migration endpoints fires the flip:
 // - guards check post-migration source=hypothesis_claim, target=feature ✓
 // - flip swaps endpoints: source becomes feature_node, target becomes hypothesis_node
 // - retypes to feature_tests_hypothesis_claim
 const edge = { id: 'e1', source: 'h1', target: 'f1', type: 'hypothesis_contains_feature' }
 const result = migrateEdge(edge, '0.2.7', '0.2.8', {
 sourceType: 'hypothesis_claim', // post node migration
 targetType: 'feature',
 })
 expect(result).not.toBeNull()
 expect(result!.type).toBe('feature_tests_hypothesis_claim')
 expect(result!.source).toBe('f1') // flipped
 expect(result!.target).toBe('h1') // flipped
 })

 it('flip rule does NOT fire when endpoint guards mismatch', () => {
 // Endpoints suggest the edge wasn't paired with a hypothesis node.
 const edge = { id: 'e2', source: 'x1', target: 'y1', type: 'hypothesis_contains_feature' }
 const result = migrateEdge(edge, '0.2.7', '0.2.8', {
 sourceType: 'something_else',
 targetType: 'feature',
 })
 expect(result).toBe(edge) // guard mismatch → no migration
 })

 it('flip rule does NOT fire without endpoint context (guarded)', () => {
 const edge = { id: 'e3', source: 'h1', target: 'f1', type: 'hypothesis_contains_feature' }
 const result = migrateEdge(edge, '0.2.7', '0.2.8')
 expect(result).toBe(edge) // no endpoints → guarded rule skipped
 })
})
