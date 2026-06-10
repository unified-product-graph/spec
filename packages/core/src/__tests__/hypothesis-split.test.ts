/**
 * Hypothesis Split (v0.2.8 split 3) — Spec Tests
 *
 * Validates the structural and semantic integrity of the hypothesis →
 * hypothesis_claim + hypothesis_evidence decomposition. Mirrors the shape of
 * `experiment-split.test.ts` (Plan/Run sub-pattern) and
 * `user-story-split.test.ts` (Statement/Implementation sub-pattern). This
 * file covers the third sub-pattern: **Claim/Evidence**.
 *
 * Two layers of assertion:
 *
 * 1. **Structural integrity** — types registered, lifecycles correct (claim
 * has lifecycle, evidence is lifecycle-free), 6 new edges resolve, the
 * 12 incumbent hypothesis-edges are all retargeted to hypothesis_claim,
 * `evidence_supports_hypothesis` dropped (superseded), `experiment` is
 * fully `removed` (not just deprecated — its grace expired).
 *
 * 2. **Migration adapter contract** — the rule in
 * `UPG_SPLIT_MIGRATIONS['0.2.8']` produces a hypothesis_claim for every
 * legacy `hypothesis.status` value. Evidence rows are NOT spawned from
 * legacy data (legacy hypothesis never carried inline evidence; consumers
 * walking dropped `evidence_supports_hypothesis` edges may opt to spawn
 * hypothesis_evidence rows post-migration, but that's adapter logic).
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_SPLIT_MIGRATIONS, getSplitMigrations, type UPGSplitMigration, type UPGSplitRouteTarget, UPG_PROPERTY_MIGRATIONS, migrateNodeProperties } from '../grammar/migrations.js'
import { UPG_LIFECYCLES, getLifecycleForType, UPG_LIFECYCLE_FREE_TYPES } from '../grammar/lifecycles.js'
import { UPG_ENTITY_META, isDeprecatedType, getReplacementType } from '../registry/entity-meta.js'
import { UPG_DOMAINS } from '../registry/domains.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// ─── Structural integrity ──────────────────────────────────────────────────────

describe('Entity registration', () => {
 it('hypothesis_claim and hypothesis_evidence are registered in entity-meta', () => {
 const names = new Set(UPG_ENTITY_META.map((m) => m.name))
 expect(names.has('hypothesis_claim')).toBe(true)
 expect(names.has('hypothesis_evidence')).toBe(true)
 })

 it('hypothesis_claim and hypothesis_evidence are deprecated at v0.4.0 (round-trip)', () => {
 const claim = UPG_ENTITY_META.find((m) => m.name === 'hypothesis_claim')!
 const evidence = UPG_ENTITY_META.find((m) => m.name === 'hypothesis_evidence')!
 expect(claim.type_id).toBe('ent_344')
 expect(evidence.type_id).toBe('ent_345')
 expect(claim.since).toBe('0.2.8')
 expect(evidence.since).toBe('0.2.8')
 expect(claim.maturity).toBe('deprecated')
 expect(evidence.maturity).toBe('deprecated')
 expect(claim.deprecated_in).toBe('0.4.0')
 expect(evidence.deprecated_in).toBe('0.4.0')
 expect(claim.replacement).toBe('hypothesis')
 expect(evidence.replacement).toBe('evidence')
 })

 it('hypothesis is canonical at v0.4.0 (re-promoted; hypothesis_claim is the deprecated alias)', () => {
 expect(isDeprecatedType('hypothesis')).toBe(false)
 expect(getReplacementType('hypothesis')).toBeUndefined()
 expect(isDeprecatedType('hypothesis_claim')).toBe(true)
 expect(getReplacementType('hypothesis_claim')).toBe('hypothesis')
 })

 it('experiment is canonical (— stable, no replacement)', () => {
 const experiment = UPG_ENTITY_META.find((m) => m.name === 'experiment')!
 expect(experiment.maturity).toBe('stable')
 expect(experiment.removed_in).toBeUndefined()
 })

 it('validation domain contains hypothesis (re-promoted) not hypothesis_claim or hypothesis_evidence', () => {
 // v0.4.0: hypothesis re-promoted; hypothesis_claim + hypothesis_evidence removed from domain.
 const validation = UPG_DOMAINS.find((d) => d.id === 'validation')!
 expect(validation.types).toContain('hypothesis')
 expect(validation.types).not.toContain('hypothesis_claim')
 expect(validation.types).not.toContain('hypothesis_evidence')
 })
})

describe('Property interfaces (v0.4.0 state)', () => {
 it('hypothesis schema carries the templated belief fields (re-promoted from hypothesis_claim)', () => {
 const schema = UPG_PROPERTY_SCHEMA['hypothesis']
 expect(schema).toBeDefined()
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['we_believe', 'will_result_in', 'we_know_when', 'risk_if_wrong', 'current_confidence']),
 )
 expect(Object.keys(schema!)).not.toContain('we_test_by')
 })

 it('evidence schema carries the scored-assessment fields (absorbed from hypothesis_evidence)', () => {
 const schema = UPG_PROPERTY_SCHEMA['evidence']
 expect(schema).toBeDefined()
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['evidence_rigor', 'evidence_source', 'direction', 'weight', 'summary', 'observed_at']),
 )
 })

 it('hypothesis and evidence schemas do not overlap on shape-determining fields', () => {
 const hypothesisFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['hypothesis'] ?? {}))
 const evidenceFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['evidence'] ?? {}))
 const hypothesisOnly = ['we_believe', 'will_result_in', 'we_know_when', 'risk_if_wrong', 'current_confidence']
 const evidenceOnly = ['evidence_rigor', 'evidence_source', 'direction', 'weight', 'summary', 'observed_at']
 for (const f of hypothesisOnly) {
 expect(hypothesisFields.has(f), `hypothesis should carry ${f}`).toBe(true)
 expect(evidenceFields.has(f), `evidence must NOT carry ${f}`).toBe(false)
 }
 for (const f of evidenceOnly) {
 expect(evidenceFields.has(f), `evidence should carry ${f}`).toBe(true)
 expect(hypothesisFields.has(f), `hypothesis must NOT carry ${f}`).toBe(false)
 }
 })
})

describe('Lifecycles (v0.4.0 state)', () => {
 it('evidence is lifecycle-free (each row a snapshot of a moment)', () => {
 expect(UPG_LIFECYCLE_FREE_TYPES.has('evidence')).toBe(true)
 expect(getLifecycleForType('evidence')).toBeUndefined()
 })

 it('hypothesis has the 5-phase lifecycle (drafted → active → validated|invalidated|archived)', () => {
 // v0.4.0: HYPOTHESIS_CLAIM_LIFECYCLE re-homed to entity_type: 'hypothesis'.
 const lifecycle = getLifecycleForType('hypothesis')!
 expect(lifecycle).toBeDefined()
 expect(lifecycle.initial_phase).toBe('drafted')
 expect(lifecycle.terminal_phases).toEqual(expect.arrayContaining(['validated', 'invalidated', 'archived']))
 const phaseIds = new Set(lifecycle.phases.map((p) => p.id))
 expect(phaseIds).toEqual(new Set(['drafted', 'active', 'validated', 'invalidated', 'archived']))
 })

 it('hypothesis_evidence is no longer in lifecycle-free types (deprecated at v0.4.0)', () => {
 expect(UPG_LIFECYCLE_FREE_TYPES.has('hypothesis_evidence')).toBe(false)
 })
})

describe('Canonical edges (v0.4.0 state)', () => {
 it('hypothesis_has_evidence is the canonical neutral edge', () => {
 const edge = UPG_EDGE_CATALOG.hypothesis_has_evidence
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('hierarchy')
 expect(edge.source_type).toBe('hypothesis')
 expect(edge.target_type).toBe('evidence')
 expect(edge.forward_verb).toBe('has_evidence')
 })

 it('hypothesis_evidence_supports_hypothesis_claim removed — use hypothesis_has_evidence + evidence.direction', () => {
 const dropped = [
 'hypothesis_evidence_supports_hypothesis_claim',
 'hypothesis_evidence_refutes_hypothesis_claim',
 'hypothesis_evidence_derived_from_experiment_run',
 'hypothesis_evidence_derived_from_insight',
 'hypothesis_evidence_derived_from_observation',
 'hypothesis_evidence_derived_from_metric',
 ]
 for (const key of dropped) {
 expect(
 (UPG_EDGE_CATALOG as Record<string, unknown>)[key],
 `deprecated edge ${key} should NOT be in the catalog`,
 ).toBeUndefined()
 }
 })
})

describe('Canonical hypothesis edges (v0.4.0 state)', () => {
 it('all hypothesis-related edges use the canonical hypothesis type (re-promoted at v0.4.0)', () => {
 const expected = [
 'solution_proposes_hypothesis',
 'hypothesis_requires_experiment_plan',
 // hypothesis_planned_via_test_plan dropped — test_plan re-homed to
 // QA; the stable experiment loop replaces it.
 'hypothesis_tested_by_experiment',
 'experiment_validates_hypothesis',
 'insight_generates_hypothesis',
 'hypothesis_investigated_via_research_plan',
 'learning_updates_hypothesis',
 'assumption_becomes_hypothesis',
 'experiment_run_validates_hypothesis',
 'variant_tests_hypothesis',
 'churn_reason_generates_hypothesis',
 'learning_refines_hypothesis',
 'feature_tests_hypothesis',
 'prototype_tests_hypothesis',
 ]
 for (const key of expected) {
 const edge = UPG_EDGE_CATALOG[key as keyof typeof UPG_EDGE_CATALOG]
 expect(edge, `${key} should be defined`).toBeDefined()
 const touchesHypothesis = edge.source_type === 'hypothesis' || edge.target_type === 'hypothesis'
 expect(touchesHypothesis, `${key} should touch hypothesis`).toBe(true)
 }
 })

 it('hypothesis_claim intermediate edges are removed from the catalog', () => {
 const dropped = [
 'solution_proposes_hypothesis_claim',
 'hypothesis_claim_requires_experiment_plan',
 'hypothesis_claim_planned_via_test_plan',
 'hypothesis_claim_investigated_via_research_plan',
 'learning_updates_hypothesis_claim',
 'assumption_becomes_hypothesis_claim',
 'experiment_run_validates_hypothesis_claim',
 'variant_tests_hypothesis_claim',
 'churn_reason_generates_hypothesis_claim',
 'learning_refines_hypothesis_claim',
 'feature_tests_hypothesis_claim',
 'prototype_tests_hypothesis_claim',
 'evidence_supports_hypothesis',
 ]
 for (const key of dropped) {
 expect(
 (UPG_EDGE_CATALOG as Record<string, unknown>)[key],
 `removed edge ${key} should NOT be in the catalog`,
 ).toBeUndefined()
 }
 })
})

describe('Hierarchy registration (v0.4.0 state)', () => {
 it('hypothesis owns experiment_plan, research_plan, evidence (re-promoted)', () => {
 const children = new Set(UPG_VALID_CHILDREN['hypothesis'] ?? [])
 expect(children.has('experiment_plan')).toBe(true)
 // test_plan re-homed validation → QA; it is no longer a hypothesis child.
 expect(children.has('test_plan')).toBe(false)
 expect(children.has('research_plan')).toBe(true)
 expect(children.has('evidence')).toBe(true)
 // hypothesis_evidence is deprecated — no longer a direct child
 expect(children.has('hypothesis_evidence')).toBe(false)
 })

 it('solution proposes hypothesis (canonical at v0.4.0)', () => {
 expect(UPG_VALID_CHILDREN['solution']).toContain('hypothesis')
 expect(UPG_VALID_CHILDREN['solution']).not.toContain('hypothesis_claim')
 })

 it('hypothesis_claim is not a hierarchy parent (deprecated)', () => {
 expect(UPG_VALID_CHILDREN['hypothesis_claim']).toBeUndefined()
 })
})

// ─── Migration adapter contract ────────────────────────────────────────────────

describe('UPG_SPLIT_MIGRATIONS rule shape', () => {
 it('exposes a single split rule keyed by 0.2.8', () => {
 expect(UPG_SPLIT_MIGRATIONS['0.2.8']).toHaveLength(1)
 expect(UPG_SPLIT_MIGRATIONS['0.2.8'][0].from).toBe('hypothesis')
 })

 it('produces hypothesis (retroactively updated the split target to the re-promoted name)', () => {
 // updated UPG_SPLIT_MIGRATIONS['0.2.8'] produces.type from
 // 'hypothesis_claim' to 'hypothesis', so the split produces the final
 // canonical name directly.
 const rule = UPG_SPLIT_MIGRATIONS['0.2.8'][0]
 const refs = rule.produces.map((p) => p.ref)
 const types = rule.produces.map((p) => p.type)
 expect(refs).toEqual(['claim'])
 expect(types).toEqual(['hypothesis'])
 })

 it('routing table covers all 5 legacy hypothesis status values + resolved core_states', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.8'][0]
 const statuses = Object.keys(rule.routing).sort()
 expect(statuses).toEqual(['invalidated', 'resolved', 'testing', 'untested', 'validated'])
 })

 it('emits no edges from the split rule (evidence migration is consumer-driven)', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.8'][0]
 expect(rule.edges).toHaveLength(0)
 })

 it('getSplitMigrations(0.2.7, 0.2.8) returns the hypothesis split', () => {
 const splits = getSplitMigrations('0.2.7', '0.2.8')
 expect(splits).toHaveLength(1)
 expect(splits[0].from).toBe('hypothesis')
 })

 it('getSplitMigrations(0.2.5, 0.2.8) returns all three UCS splits in version order', () => {
 const splits = getSplitMigrations('0.2.5', '0.2.8')
 expect(splits).toHaveLength(3)
 expect(splits.map((s) => s.from)).toEqual(['experiment', 'user_story', 'hypothesis'])
 })
})

describe('UPG_PROPERTY_MIGRATIONS', () => {
 it('drops we_test_by from legacy hypothesis nodes during 0.2.7 → 0.2.8 migration', () => {
 const node = {
 type: 'hypothesis',
 properties: {
 we_believe: 'something',
 will_result_in: 'something else',
 we_know_when: 'a measurable signal',
 we_test_by: 'A/B test for 2 weeks',
 },
 }
 const { node: migrated, changes } = migrateNodeProperties(node, '0.2.7', '0.2.8')
 const dropped = changes.flatMap((c) => (c.kind === 'dropped' ? [c.key] : []))
 expect(dropped).toContain('we_test_by')
 expect(migrated.properties).toEqual({
 we_believe: 'something',
 will_result_in: 'something else',
 we_know_when: 'a measurable signal',
 })
 })

 it('UPG_PROPERTY_MIGRATIONS has a 0.2.8 entry for hypothesis we_test_by drop', () => {
 expect(UPG_PROPERTY_MIGRATIONS['0.2.8']).toBeDefined()
 const entry = UPG_PROPERTY_MIGRATIONS['0.2.8'][0]
 expect(entry.type).toBe('hypothesis')
 expect(entry.kind).toBe('drop_props')
 expect(entry.kind === 'drop_props' && entry.drop_props.includes('we_test_by')).toBe(true)
 })
})

// ─── Migration adapter runner ──────────────────────────────────────────────────

interface LegacyNode {
 id: string
 type: string
 properties?: Record<string, unknown>
}
interface SpawnedNode {
 id: string
 type: string
 ref: string
 properties: Record<string, unknown>
}
interface SpawnedEdge {
 source: string
 target: string
 type: string
}

function applySplit(node: LegacyNode, rule: UPGSplitMigration): { nodes: SpawnedNode[]; edges: SpawnedEdge[] } {
 if (rule.kind !== 'status_routed') throw new Error(`Unsupported split kind`)
 const status = String(node.properties?.[rule.status_property] ?? '')
 const route = rule.routing[status]
 if (!route) throw new Error(`No routing rule for status="${status}" on ${rule.from}`)
 const spawnSet = new Set<string>(route.spawn)
 const idByRef: Record<string, string> = {}
 const nodes: SpawnedNode[] = []
 let firstSpawned: string | null = null
 for (const target of rule.produces) {
 if (!spawnSet.has(target.ref)) continue
 const inherited: Record<string, unknown> = {}
 for (const k of target.keep_props ?? []) {
 if (k === '__id') continue
 if (node.properties && k in node.properties) inherited[k] = node.properties[k]
 }
 const routeOverride = (route[target.ref] as UPGSplitRouteTarget | undefined)?.defaults ?? {}
 const properties = { ...target.defaults, ...inherited, ...routeOverride }
 const id = firstSpawned === null ? node.id : `${node.id}__${target.ref}`
 if (firstSpawned === null) firstSpawned = target.ref
 idByRef[target.ref] = id
 nodes.push({ id, type: target.type, ref: target.ref, properties })
 }
 const edges: SpawnedEdge[] = []
 for (const e of rule.edges) {
 const shouldEmit = e.when === 'always' || (e.when === 'both_spawned' && spawnSet.has(e.source_ref) && spawnSet.has(e.target_ref))
 if (!shouldEmit) continue
 edges.push({ source: idByRef[e.source_ref], target: idByRef[e.target_ref], type: e.type })
 }
 return { nodes, edges }
}

const RULE = UPG_SPLIT_MIGRATIONS['0.2.8'][0]

describe('ApplySplit() invariants per status', () => {
 it('status=untested → 1 claim (status=drafted), no evidence, no edges', () => {
 const out = applySplit(
 { id: 'h_001', type: 'hypothesis', properties: { status: 'untested', we_believe: 'X', will_result_in: 'Y', we_know_when: 'Z' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].type).toBe('hypothesis') // produces.type updated to 'hypothesis'
 expect(out.nodes[0].properties.status).toBe('drafted')
 expect(out.nodes[0].properties.we_believe).toBe('X')
 expect(out.edges).toHaveLength(0)
 })

 it('status=testing → claim (status=active), no evidence', () => {
 const out = applySplit({ id: 'h_002', type: 'hypothesis', properties: { status: 'testing' } }, RULE)
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].properties.status).toBe('active')
 })

 it('status=validated → claim (status=validated)', () => {
 const out = applySplit({ id: 'h_003', type: 'hypothesis', properties: { status: 'validated' } }, RULE)
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].properties.status).toBe('validated')
 })

 it('status=invalidated → claim (status=invalidated)', () => {
 const out = applySplit({ id: 'h_004', type: 'hypothesis', properties: { status: 'invalidated' } }, RULE)
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].properties.status).toBe('invalidated')
 })

 it('status=resolved (without core_state) → claim (status=active) — resolver decides post-migration', () => {
 const out = applySplit({ id: 'h_005', type: 'hypothesis', properties: { status: 'resolved' } }, RULE)
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].properties.status).toBe('active')
 })

 it('claim preserves source id (legacy reference survival)', () => {
 const out = applySplit({ id: 'h_legacy_id', type: 'hypothesis', properties: { status: 'testing' } }, RULE)
 expect(out.nodes[0].id).toBe('h_legacy_id')
 })

 it('belief properties (we_believe, will_result_in, we_know_when) inherit byte-for-byte to claim', () => {
 const out = applySplit(
 {
 id: 'h_props',
 type: 'hypothesis',
 properties: {
 status: 'testing',
 we_believe: 'We believe statement-evidence linking',
 will_result_in: 'will result in higher decision confidence',
 we_know_when: '60% of decisions cite evidence',
 we_test_by: 'will be dropped via UPG_PROPERTY_MIGRATIONS',
 },
 },
 RULE,
 )
 const claim = out.nodes[0]
 expect(claim.properties.we_believe).toBe('We believe statement-evidence linking')
 expect(claim.properties.will_result_in).toBe('will result in higher decision confidence')
 expect(claim.properties.we_know_when).toBe('60% of decisions cite evidence')
 // we_test_by is in the source but the split rule's keep_props doesn't
 // carry it. (Property migration handles the drop on a separate path.)
 expect(claim.properties.we_test_by).toBeUndefined()
 })
})
