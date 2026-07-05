/**
 * Experiment Split (v0.2.6 split 1) — Spec Tests
 *
 * Validates the structural and semantic integrity of the experiment →
 * experiment_plan + experiment_run decomposition.
 *
 * Two layers of assertion:
 *
 * 1. **Structural integrity** — the new types are registered, have property
 * interfaces + lifecycles, and the 4 new edges resolve via the canonical
 * catalog.
 *
 * 2. **Migration adapter contract** — the 1→N split rule in
 * `UPG_SPLIT_MIGRATIONS['0.2.6']` produces the expected target nodes +
 * edges for every legacy `experiment.status` value, per the routing
 * table §experiment.
 *
 * The migration adapter itself lives in the MCP server. This test file
 * is the executable contract that adapter runtime must satisfy. A small
 * inline runner replays the routing table here so the spec change is
 * testable without depending on the MCP
 * server build.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import { UPG_SPLIT_MIGRATIONS, getSplitMigrations, type UPGSplitMigration, type UPGSplitRouteTarget } from '../grammar/migrations.js'
import { UPG_LIFECYCLES, getLifecycleForType } from '../grammar/lifecycles.js'
import { UPG_ENTITY_META, getReplacementType } from '../registry/entity-meta.js'
import { UPG_DOMAINS } from '../registry/domains.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// ─── Structural integrity ──────────────────────────────────────────────────────

describe('Entity registration', () => {
 it('experiment_plan and experiment_run are registered in entity-meta', () => {
 const names = new Set(UPG_ENTITY_META.map((m) => m.name))
 expect(names.has('experiment_plan')).toBe(true)
 expect(names.has('experiment_run')).toBe(true)
 })

 it('experiment_plan and experiment_run carry stable type_ids since 0.2.6', () => {
 const plan = UPG_ENTITY_META.find((m) => m.name === 'experiment_plan')!
 const run = UPG_ENTITY_META.find((m) => m.name === 'experiment_run')!
 expect(plan.type_id).toBe('ent_340')
 expect(run.type_id).toBe('ent_341')
 expect(plan.since).toBe('0.2.6')
 expect(run.since).toBe('0.2.6')
 // experiment_plan graduated proposed → stable: it is the canonical
 // validation PLAN type (absorbed test_plan's planning props). experiment_run
 // graduated proposed → stable in 0.12.6 (Captain lifted the defer; it
 // passes the rubric and is in active use).
 expect(plan.maturity).toBe('stable')
 expect(run.maturity).toBe('stable')
 })

 it('experiment is canonical (— stable, no replacement)', () => {
 const experiment = UPG_ENTITY_META.find((m) => m.name === 'experiment')!
 expect(experiment.maturity).toBe('stable')
 expect(experiment.deprecated_in).toBeUndefined()
 expect(experiment.removed_in).toBeUndefined()
 expect(experiment.replacement).toBeUndefined()
 })

 it('both new types appear in the validation domain', () => {
 const validation = UPG_DOMAINS.find((d) => d.id === 'validation')!
 expect(validation.types).toContain('experiment_plan')
 expect(validation.types).toContain('experiment_run')
 })

 it('experiment appears in the validation domain', () => {
 const validation = UPG_DOMAINS.find((d) => d.id === 'validation')!
 expect(validation.types).toContain('experiment')
 })
})

// ─── — experiment is canonical ─────────────────────────────────────────

describe('Experiment is canonical', () => {
 it('getReplacementType("experiment") returns undefined (no replacement)', () => {
 expect(getReplacementType('experiment')).toBeUndefined()
 })

 it('UPG_PROPERTY_SCHEMA.experiment is present with its concrete field set', () => {
 const schema = UPG_PROPERTY_SCHEMA['experiment']
 expect(schema).toBeDefined()
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['method', 'start_date', 'end_date', 'sample_size', 'expected_lift']),
 )
 })
})

describe('Property interfaces', () => {
 it('experiment_plan has a property schema in UPG_PROPERTY_SCHEMA', () => {
 const schema = UPG_PROPERTY_SCHEMA['experiment_plan']
 expect(schema).toBeDefined()
 // Plan-shape fields the renderer relies on
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['method', 'success_criteria', 'projected_reach', 'planned_start_date']),
 )
 })

 it('experiment_run has a property schema in UPG_PROPERTY_SCHEMA', () => {
 const schema = UPG_PROPERTY_SCHEMA['experiment_run']
 expect(schema).toBeDefined()
 // Run-shape fields the renderer relies on
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['actual_start_date', 'actual_end_date', 'outcome_summary', 'disposition']),
 )
 })

 it('plan and run schemas do not overlap on shape-determining fields', () => {
 // The whole point of the split: pre-event fields live on plan, post-event
 // fields live on run. If they overlap on shape-determining fields, the
 // split is incomplete.
 const planFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['experiment_plan'] ?? {}))
 const runFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['experiment_run'] ?? {}))
 const planShapeOnly = ['method', 'success_criteria', 'projected_reach', 'projected_impact', 'cost_estimate', 'planned_start_date', 'planned_end_date']
 const runShapeOnly = ['actual_start_date', 'actual_end_date', 'actual_reach', 'outcome_summary', 'severity_of_finding', 'learning', 'disposition']
 for (const f of planShapeOnly) {
 expect(planFields.has(f), `plan should carry ${f}`).toBe(true)
 expect(runFields.has(f), `run must NOT carry ${f}`).toBe(false)
 }
 for (const f of runShapeOnly) {
 expect(runFields.has(f), `run should carry ${f}`).toBe(true)
 expect(planFields.has(f), `plan must NOT carry ${f}`).toBe(false)
 }
 })
})

describe('Lifecycles', () => {
 it('experiment_plan has a plan-shape lifecycle (drafted → scheduled → approved | cancelled)', () => {
 const lifecycle = getLifecycleForType('experiment_plan')!
 expect(lifecycle).toBeDefined()
 expect(lifecycle.initial_phase).toBe('drafted')
 expect(lifecycle.terminal_phases).toEqual(expect.arrayContaining(['approved', 'cancelled']))
 const phaseIds = new Set(lifecycle.phases.map((p) => p.id))
 expect(phaseIds).toEqual(new Set(['drafted', 'scheduled', 'approved', 'cancelled']))
 })

 it('experiment_run has a run-shape lifecycle (STUDY: planned → running → analysing → complete | abandoned)', () => {
 // (0.21.0): experiment_run folded off its bespoke
 // [in_progress, complete, aborted] singleton onto the shared STUDY template.
 // The legacy values remap via UPG_STATUS_MIGRATIONS (in_progress→running,
 // aborted→abandoned). The run-shape identity is preserved (still a time-boxed
 // run distinct from experiment_plan's approval shape — see the dual-shape test).
 const lifecycle = getLifecycleForType('experiment_run')!
 expect(lifecycle).toBeDefined()
 expect(lifecycle.template_id).toBe('STUDY')
 expect(lifecycle.initial_phase).toBe('planned')
 expect(lifecycle.terminal_phases).toEqual(expect.arrayContaining(['complete', 'abandoned']))
 const phaseIds = new Set(lifecycle.phases.map((p) => p.id))
 expect(phaseIds).toEqual(new Set(['planned', 'running', 'analysing', 'complete', 'abandoned']))
 })

 it('plan and run lifecycles do not share any phase ids (the dual-shape test)', () => {
 const plan = getLifecycleForType('experiment_plan')!
 const run = getLifecycleForType('experiment_run')!
 const planPhases = new Set(plan.phases.map((p) => p.id))
 const runPhases = new Set(run.phases.map((p) => p.id))
 const overlap = [...planPhases].filter((p) => runPhases.has(p))
 expect(overlap, `plan/run lifecycles must not share phase ids: ${overlap.join(', ')}`).toEqual([])
 })

 it('UPG_LIFECYCLES registry includes both new lifecycles', () => {
 const types = new Set(UPG_LIFECYCLES.map((l) => l.entity_type))
 expect(types.has('experiment_plan')).toBe(true)
 expect(types.has('experiment_run')).toBe(true)
 })
})

describe('Canonical edges', () => {
 it('experiment_plan_ran_as_experiment_run resolves with hierarchy classification', () => {
 const edge = UPG_EDGE_CATALOG.experiment_plan_ran_as_experiment_run
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('hierarchy')
 expect(edge.source_type).toBe('experiment_plan')
 expect(edge.target_type).toBe('experiment_run')
 expect(edge.forward_verb).toBe('ran_as')
 })

 it('experiment_run_validates_hypothesis resolves with causal classification (re-promoted at v0.4.0)', () => {
 // v0.4.0: hypothesis_claim reverted to hypothesis. Edge renamed back.
 const edge = UPG_EDGE_CATALOG.experiment_run_validates_hypothesis
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('causal')
 expect(edge.source_type).toBe('experiment_run')
 expect(edge.target_type).toBe('hypothesis')
 // v0.2.8 intermediate name now in edge migrations as a rename rule
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).experiment_run_validates_hypothesis_claim).toBeUndefined()
 })

 it('experiment_run_produced_insight_insight resolves as cross-domain', () => {
 const edge = UPG_EDGE_CATALOG.experiment_run_produced_insight_insight
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('cross-domain')
 expect(edge.source_type).toBe('experiment_run')
 expect(edge.target_type).toBe('insight')
 })

 it('experiment_run_informed_decision_decision resolves as cross-domain', () => {
 const edge = UPG_EDGE_CATALOG.experiment_run_informed_decision_decision
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('cross-domain')
 expect(edge.source_type).toBe('experiment_run')
 expect(edge.target_type).toBe('decision')
 })
})

describe('Hierarchy registration', () => {
 it('experiment_plan owns experiment as a hierarchy child ( chain)', () => {
 // The plan designs the experiment it produces; the validation chain
 // is hypothesis ▷ experiment_plan ▷ experiment ▷ experiment_run.
 expect(UPG_VALID_CHILDREN['experiment_plan']).toContain('experiment')
 })

 it('experiment owns experiment_run as a hierarchy child', () => {
 expect(UPG_VALID_CHILDREN['experiment']).toContain('experiment_run')
 })

 it('experiment_run owns learning, evidence, metric children', () => {
 const runChildren = new Set(UPG_VALID_CHILDREN['experiment_run'] ?? [])
 expect(runChildren.has('learning')).toBe(true)
 expect(runChildren.has('evidence')).toBe(true)
 expect(runChildren.has('metric')).toBe(true)
 })

 it('hypothesis can contain experiment_plan (canonical at v0.4.0, after re-promotion)', () => {
 // v0.4.0: hypothesis_claim reverted to hypothesis. Hierarchy key is now `hypothesis`.
 expect(UPG_VALID_CHILDREN['hypothesis']).toContain('experiment_plan')
 // hypothesis_claim is deprecated — no longer a valid hierarchy parent
 expect(UPG_VALID_CHILDREN['hypothesis_claim']).toBeUndefined()
 })
})

// ─── Migration adapter contract ────────────────────────────────────────────────

describe('UPG_SPLIT_MIGRATIONS rule shape', () => {
 it('exposes a single split rule keyed by 0.2.6', () => {
 expect(UPG_SPLIT_MIGRATIONS['0.2.6']).toHaveLength(1)
 expect(UPG_SPLIT_MIGRATIONS['0.2.6'][0].from).toBe('experiment')
 })

 it('rule.kind is status_routed (the only kind defined today)', () => {
 expect(UPG_SPLIT_MIGRATIONS['0.2.6'][0].kind).toBe('status_routed')
 })

 it('produces both experiment_plan and experiment_run', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.6'][0]
 const refs = rule.produces.map((p) => p.ref)
 const types = rule.produces.map((p) => p.type)
 expect(refs).toEqual(['plan', 'run'])
 expect(types).toEqual(['experiment_plan', 'experiment_run'])
 })

 it('routing table covers all 7 legacy experiment status values', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.6'][0]
 expect(Object.keys(rule.routing).sort()).toEqual(
 ['aborted', 'analysing', 'cancelled', 'done', 'draft', 'planned', 'running'],
 )
 })

 it('emits canonical ran_as edge when both plan and run are spawned', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.6'][0]
 expect(rule.edges).toHaveLength(1)
 const edge = rule.edges[0]
 expect(edge.source_ref).toBe('plan')
 expect(edge.target_ref).toBe('run')
 expect(edge.type).toBe('experiment_plan_ran_as_experiment_run')
 expect(edge.when).toBe('both_spawned')
 })

 it('getSplitMigrations(0.2.5, 0.2.6) returns the experiment split', () => {
 const splits = getSplitMigrations('0.2.5', '0.2.6')
 expect(splits).toHaveLength(1)
 expect(splits[0].from).toBe('experiment')
 })

 it('getSplitMigrations(0.2.6, 0.2.6) returns no splits (range is exclusive at fromVersion)', () => {
 const splits = getSplitMigrations('0.2.6', '0.2.6')
 expect(splits).toHaveLength(0)
 })
})

// ─── Migration adapter runner — replays the rule on legacy nodes ──────────────
//
// Inline runner that consumes a UPGSplitMigration and applies it to a single
// legacy node. The MCP server's `migrate_type` tool will implement the same
// contract. Keeping it inline here means the spec change is tested
// end-to-end without depending on mcp-server build.

interface LegacyNode {
 id: string
 type: string
 title?: string
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

interface SplitResult {
 nodes: SpawnedNode[]
 edges: SpawnedEdge[]
}

function applySplit(node: LegacyNode, rule: UPGSplitMigration): SplitResult {
 if (rule.kind !== 'status_routed') {
 throw new Error(`Unsupported split kind: ${rule.kind}`)
 }
 const status = String(node.properties?.[rule.status_property] ?? '')
 const route = rule.routing[status]
 if (!route) {
 throw new Error(`No routing rule for status="${status}" on ${rule.from}`)
 }
 const spawnSet = new Set<string>(route.spawn)
 const idByRef: Record<string, string> = {}
 const nodes: SpawnedNode[] = []

 // Spawn each ref in `produces` order; the FIRST spawned ref keeps the
 // source id (so legacy references survive); subsequent refs get a
 // deterministic derived id.
 let firstSpawned: string | null = null
 for (const target of rule.produces) {
 if (!spawnSet.has(target.ref)) continue

 // Inherit `keep_props` from source; defaults from target; route-specific
 // defaults win last.
 const inherited: Record<string, unknown> = {}
 for (const k of target.keep_props ?? []) {
 if (k === '__id') continue // id strategy, not a property
 if (node.properties && k in node.properties) inherited[k] = node.properties[k]
 }
 const routeOverride = (route[target.ref] as UPGSplitRouteTarget | undefined)?.defaults ?? {}
 const properties = {
 ...target.defaults,
 ...inherited,
 ...routeOverride,
 }

 // ID strategy
 let id: string
 if (firstSpawned === null) {
 id = node.id
 firstSpawned = target.ref
 } else {
 id = `${node.id}__${target.ref}`
 }
 idByRef[target.ref] = id
 nodes.push({ id, type: target.type, ref: target.ref, properties })
 }

 // Emit edges per `when` condition
 const edges: SpawnedEdge[] = []
 for (const e of rule.edges) {
 const shouldEmit =
 e.when === 'always' ||
 (e.when === 'both_spawned' && spawnSet.has(e.source_ref) && spawnSet.has(e.target_ref))
 if (!shouldEmit) continue
 edges.push({
 source: idByRef[e.source_ref],
 target: idByRef[e.target_ref],
 type: e.type,
 })
 }

 return { nodes, edges }
}

const RULE = UPG_SPLIT_MIGRATIONS['0.2.6'][0]

describe('ApplySplit() invariants per status', () => {
 it('status=draft → 1 plan only, no run, no ran_as edge', () => {
 const node: LegacyNode = {
 id: 'exp_001',
 type: 'experiment',
 properties: { status: 'draft', method: 'a_b_test' },
 }
 const out = applySplit(node, RULE)
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].type).toBe('experiment_plan')
 expect(out.nodes[0].properties.status).toBe('drafted')
 expect(out.nodes[0].properties.method).toBe('a_b_test')
 expect(out.edges).toHaveLength(0)
 })

 it('status=planned → 1 plan only (status=scheduled), no run, no edge', () => {
 const out = applySplit(
 { id: 'exp_002', type: 'experiment', properties: { status: 'planned' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].type).toBe('experiment_plan')
 expect(out.nodes[0].properties.status).toBe('scheduled')
 expect(out.edges).toHaveLength(0)
 })

 it('status=cancelled → 1 plan only (status=cancelled), no run, no edge', () => {
 const out = applySplit(
 { id: 'exp_003', type: 'experiment', properties: { status: 'cancelled' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(1)
 expect(out.nodes[0].type).toBe('experiment_plan')
 expect(out.nodes[0].properties.status).toBe('cancelled')
 expect(out.edges).toHaveLength(0)
 })

 it('status=running → plan (approved) + run (in_progress) + ran_as edge', () => {
 const out = applySplit(
 { id: 'exp_004', type: 'experiment', properties: { status: 'running', actual_lift: 0.06 } },
 RULE,
 )
 expect(out.nodes).toHaveLength(2)
 const plan = out.nodes.find((n) => n.ref === 'plan')!
 const run = out.nodes.find((n) => n.ref === 'run')!
 expect(plan.type).toBe('experiment_plan')
 expect(plan.properties.status).toBe('approved')
 expect(run.type).toBe('experiment_run')
 expect(run.properties.status).toBe('in_progress')
 // Run inherits actual_lift from source (run-shape)
 expect(run.properties.actual_lift).toBe(0.06)
 // Plan does NOT inherit actual_lift
 expect(plan.properties.actual_lift).toBeUndefined()
 // ran_as edge linking plan to run
 expect(out.edges).toHaveLength(1)
 expect(out.edges[0].type).toBe('experiment_plan_ran_as_experiment_run')
 expect(out.edges[0].source).toBe(plan.id)
 expect(out.edges[0].target).toBe(run.id)
 })

 it('status=analysing → plan (approved) + run (in_progress) + ran_as edge', () => {
 const out = applySplit(
 { id: 'exp_005', type: 'experiment', properties: { status: 'analysing' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(2)
 expect(out.nodes.find((n) => n.ref === 'plan')!.properties.status).toBe('approved')
 expect(out.nodes.find((n) => n.ref === 'run')!.properties.status).toBe('in_progress')
 expect(out.edges).toHaveLength(1)
 })

 it('status=done → plan (approved) + run (complete) + ran_as edge', () => {
 const out = applySplit(
 { id: 'exp_006', type: 'experiment', properties: { status: 'done' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(2)
 expect(out.nodes.find((n) => n.ref === 'plan')!.properties.status).toBe('approved')
 expect(out.nodes.find((n) => n.ref === 'run')!.properties.status).toBe('complete')
 expect(out.edges).toHaveLength(1)
 })

 it('status=aborted → plan (approved) + run (aborted) + ran_as edge', () => {
 const out = applySplit(
 { id: 'exp_007', type: 'experiment', properties: { status: 'aborted' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(2)
 expect(out.nodes.find((n) => n.ref === 'plan')!.properties.status).toBe('approved')
 expect(out.nodes.find((n) => n.ref === 'run')!.properties.status).toBe('aborted')
 expect(out.edges).toHaveLength(1)
 })

 it('first spawned ref preserves source id (legacy reference survival)', () => {
 const out = applySplit(
 { id: 'exp_legacy_id', type: 'experiment', properties: { status: 'done' } },
 RULE,
 )
 const plan = out.nodes.find((n) => n.ref === 'plan')!
 expect(plan.id).toBe('exp_legacy_id')
 // Run gets a derived id
 const run = out.nodes.find((n) => n.ref === 'run')!
 expect(run.id).toBe('exp_legacy_id__run')
 })

 it('plan-shape source props (method, sample_size) only land on plan', () => {
 const out = applySplit(
 {
 id: 'exp_props',
 type: 'experiment',
 properties: {
 status: 'done',
 method: 'qual_interview',
 sample_size: 12,
 actual_lift: 0.04,
 start_date: '2026-04-01',
 end_date: '2026-04-15',
 },
 },
 RULE,
 )
 const plan = out.nodes.find((n) => n.ref === 'plan')!
 const run = out.nodes.find((n) => n.ref === 'run')!
 expect(plan.properties.method).toBe('qual_interview')
 expect(plan.properties.sample_size).toBe(12)
 expect(plan.properties.actual_lift).toBeUndefined()
 expect(plan.properties.start_date).toBeUndefined()
 expect(run.properties.actual_lift).toBe(0.04)
 expect(run.properties.start_date).toBe('2026-04-01')
 expect(run.properties.end_date).toBe('2026-04-15')
 expect(run.properties.method).toBeUndefined()
 })
})
