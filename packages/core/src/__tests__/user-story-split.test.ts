/**
 * User Story (v0.2.7 split 2 + v0.7.0 re-canon) — Spec Tests
 *
 * Validates the structural and semantic integrity of the Statement/Implementation
 * pattern: a lifecycle-free `user_story` (the templated "As X, I want Y so Z"
 * promise) + a lifecycle-bearing `task` (the work), linked by
 * `task_implements_user_story`.
 *
 * History: v0.2.7 split the bundled `user_story` into `story_statement` + a work
 * type (story_task → task at v0.4.0). v0.7.0 re-canonicalised the
 * statement back to its industry-standard name `user_story`; `story_statement`
 * is now a deprecated alias. The split itself is unchanged — the v0.2.7 rule
 * still produces `story_statement`, which the v0.7.0 type migration renames
 * forward to `user_story`.
 *
 * Three layers of assertion:
 *
 * 1. **Structural integrity** — user_story is canonical + lifecycle-free,
 * story_statement is the deprecated alias, the four canonical edges are the
 * user_story form, the property schema + hierarchy use user_story.
 *
 * 2. **v0.7.0 re-canon migration** — UPG_MIGRATIONS + UPG_EDGE_MIGRATIONS carry
 * story_statement → user_story (type) and the four edge renames; the
 * split → rename chain converges on user_story.
 *
 * 3. **Migration adapter contract** — the 1→N split rule in
 * `UPG_SPLIT_MIGRATIONS['0.2.7']` (retained as the historical record) produces
 * the expected target nodes + edges for every legacy `user_story.status` value.
 *
 * The migration adapter itself lives in the MCP server. This test file is the
 * executable contract that adapter runtime must satisfy.
 */

import { describe, it, expect } from 'vitest'
import { UPG_EDGE_CATALOG } from '../catalog/edge-catalog.js'
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import {
  UPG_SPLIT_MIGRATIONS,
  getSplitMigrations,
  UPG_MIGRATIONS,
  UPG_EDGE_MIGRATIONS,
  getMigrationMap,
  getUPGEdgeMigrations,
  type UPGSplitMigration,
  type UPGSplitRouteTarget,
} from '../grammar/migrations.js'
import { UPG_LIFECYCLES, getLifecycleForType, UPG_LIFECYCLE_FREE_TYPES } from '../grammar/lifecycles.js'
import { UPG_ENTITY_META, isDeprecatedType, getReplacementType } from '../registry/entity-meta.js'
import { UPG_DOMAINS } from '../registry/domains.js'
import { UPG_PROPERTY_SCHEMA } from '../properties/property-schema.js'

// ─── Structural integrity ──────────────────────────────────────────────────────

describe('Entity registration', () => {
 it('user_story, story_statement and story_task are registered in entity-meta', () => {
 const names = new Set(UPG_ENTITY_META.map((m) => m.name))
 expect(names.has('user_story')).toBe(true)
 expect(names.has('story_statement')).toBe(true)
 expect(names.has('story_task')).toBe(true)
 })

 it('user_story is canonical again (ent_073, stable, not deprecated) —, graduated 0.12.6', () => {
 const userStory = UPG_ENTITY_META.find((m) => m.name === 'user_story')!
 expect(userStory.type_id).toBe('ent_073')
 // Graduated proposed -> stable in 0.12.6 (Captain lifted the freeze; the
 // re-canon is settled and the type is in active use). Canonical + not-deprecated
 // remains the load-bearing invariant.
 expect(userStory.maturity).toBe('stable')
 expect(isDeprecatedType('user_story')).toBe(false)
 expect(userStory.deprecated_in).toBeUndefined()
 expect(userStory.replacement).toBeUndefined()
 })

 it('story_statement is now the deprecated alias → user_story (v0.7.0)', () => {
 const statement = UPG_ENTITY_META.find((m) => m.name === 'story_statement')!
 expect(statement.type_id).toBe('ent_342')
 expect(statement.maturity).toBe('deprecated')
 expect(statement.deprecated_in).toBe('0.7.0')
 expect(statement.replacement).toBe('user_story')
 expect(isDeprecatedType('story_statement')).toBe(true)
 expect(getReplacementType('story_statement')).toBe('user_story')
 })

 it('story_task remains deprecated at v0.4.0 (collapse into task)', () => {
 const storyTask = UPG_ENTITY_META.find((m) => m.name === 'story_task')!
 expect(storyTask.type_id).toBe('ent_343')
 expect(storyTask.maturity).toBe('deprecated')
 expect(storyTask.deprecated_in).toBe('0.4.0')
 expect(storyTask.replacement).toBe('task')
 })

 it('product_spec domain contains user_story + task but not the deprecated aliases', () => {
 const productSpec = UPG_DOMAINS.find((d) => d.id === 'product_spec')!
 expect(productSpec.types).toContain('user_story')
 expect(productSpec.types).toContain('task')
 expect(productSpec.types).not.toContain('story_task')
 expect(productSpec.types).not.toContain('story_statement')
 })
})

describe('Property interfaces', () => {
 it('user_story schema has the templated promise fields', () => {
 const schema = UPG_PROPERTY_SCHEMA['user_story']
 expect(schema).toBeDefined()
 expect(Object.keys(schema!)).toEqual(
 expect.arrayContaining(['as_a', 'i_want_to', 'so_that', 'text']),
 )
 })

 it('story_statement (deprecated alias) carries no schema of its own', () => {
 expect(UPG_PROPERTY_SCHEMA['story_statement']).toBeUndefined()
 })

 it('task schema absorbed estimate from story_task (v0.4.0)', () => {
 const schema = UPG_PROPERTY_SCHEMA['task']
 expect(schema).toBeDefined()
 expect(Object.keys(schema!)).toContain('estimate')
 })

 it('statement and task schemas do not overlap on shape-determining fields', () => {
 const statementFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['user_story'] ?? {}))
 const taskFields = new Set(Object.keys(UPG_PROPERTY_SCHEMA['task'] ?? {}))
 const statementOnly = ['as_a', 'i_want_to', 'so_that', 'text']
 const taskOnly = ['estimate', 'effort', 'priority']
 for (const f of statementOnly) {
 expect(statementFields.has(f), `statement should carry ${f}`).toBe(true)
 expect(taskFields.has(f), `task must NOT carry ${f}`).toBe(false)
 }
 for (const f of taskOnly) {
 expect(taskFields.has(f), `task should carry ${f}`).toBe(true)
 expect(statementFields.has(f), `statement must NOT carry ${f}`).toBe(false)
 }
 })
})

describe('Lifecycles', () => {
 it('user_story is lifecycle-free (the templated promise is a stable design artefact)', () => {
 expect(UPG_LIFECYCLE_FREE_TYPES.has('user_story')).toBe(true)
 expect(getLifecycleForType('user_story')).toBeUndefined()
 })

 it('task has its own lifecycle with todo→done phases (story_task lifecycle removed)', () => {
 // task has a hand-authored lifecycle (TASK_LIFECYCLE) — same phases as WORK_ITEM template.
 // story_task lifecycle was template-derived; now merged into task.
 const lifecycle = getLifecycleForType('task')!
 expect(lifecycle).toBeDefined()
 expect(lifecycle.initial_phase).toBe('todo')
 expect(lifecycle.terminal_phases).toEqual(['done'])
 expect(getLifecycleForType('story_task')).toBeUndefined()
 })

 it('UPG_LIFECYCLES registry has task but not the lifecycle-free/deprecated types', () => {
 const types = new Set(UPG_LIFECYCLES.map((l) => l.entity_type))
 expect(types.has('story_task')).toBe(false)
 expect(types.has('task')).toBe(true)
 expect(types.has('user_story')).toBe(false) // lifecycle-free
 expect(types.has('story_statement')).toBe(false)
 })
})

describe('Canonical edges (v0.7.0 user_story form)', () => {
 it('task_implements_user_story is the canonical implements edge', () => {
 const edge = UPG_EDGE_CATALOG.task_implements_user_story
 expect(edge).toBeDefined()
 expect(edge.classification).toBe('cross-domain')
 expect(edge.source_type).toBe('task')
 expect(edge.target_type).toBe('user_story')
 expect(edge.forward_verb).toBe('implements')
 })

 it('epic_specified_by_user_story is canonical (epic → user_story)', () => {
 const edge = UPG_EDGE_CATALOG.epic_specified_by_user_story
 expect(edge).toBeDefined()
 expect(edge.source_type).toBe('epic')
 expect(edge.target_type).toBe('user_story')
 })

 it('user_story_verified_by_acceptance_criterion is canonical', () => {
 const edge = UPG_EDGE_CATALOG.user_story_verified_by_acceptance_criterion
 expect(edge).toBeDefined()
 expect(edge.source_type).toBe('user_story')
 expect(edge.target_type).toBe('acceptance_criterion')
 })

 it('test_case_covers_user_story is canonical', () => {
 const edge = UPG_EDGE_CATALOG.test_case_covers_user_story
 expect(edge).toBeDefined()
 expect(edge.source_type).toBe('test_case')
 expect(edge.target_type).toBe('user_story')
 })

 it('the story_statement-form edges are no longer in the catalog', () => {
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).epic_specified_by_story_statement).toBeUndefined()
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).story_statement_verified_by_acceptance_criterion).toBeUndefined()
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).task_implements_story_statement).toBeUndefined()
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).test_case_covers_story_statement).toBeUndefined()
 // and the original pre-0.2.7 names that were genuinely dropped stay gone
 expect((UPG_EDGE_CATALOG as Record<string, unknown>).user_story_broken_into_task).toBeUndefined()
 })
})

describe('Hierarchy registration', () => {
 it('epic owns user_story (the spec) — not story_statement/story_task', () => {
 expect(UPG_VALID_CHILDREN['epic']).toContain('user_story')
 expect(UPG_VALID_CHILDREN['epic']).not.toContain('story_statement')
 expect(UPG_VALID_CHILDREN['epic']).not.toContain('story_task')
 })

 it('user_story owns acceptance_criterion (criteria define what done looks like)', () => {
 expect(UPG_VALID_CHILDREN['user_story']).toContain('acceptance_criterion')
 })

 it('feature owns task (story_task removed — v0.4.0)', () => {
 expect(UPG_VALID_CHILDREN['feature']).toContain('task')
 expect(UPG_VALID_CHILDREN['feature']).not.toContain('story_task')
 })

 it('story_task is no longer a hierarchy parent (deprecated)', () => {
 expect(UPG_VALID_CHILDREN['story_task']).toBeUndefined()
 })
})

// ─── v0.7.0 re-canonicalisation ───────────────────────────────────────

describe('v0.7.0 re-canon: story_statement → user_story', () => {
 it('UPG_MIGRATIONS["0.7.0"] renames story_statement → user_story', () => {
 const rule = UPG_MIGRATIONS['0.7.0']?.find((m) => m.from === 'story_statement')
 expect(rule).toBeDefined()
 expect(rule!.to).toBe('user_story')
 })

 it('getMigrationMap up to 0.7.0 resolves story_statement → user_story', () => {
 const map = getMigrationMap('0.6.2', '0.7.0')
 expect(map.story_statement).toBe('user_story')
 })

 it('UPG_EDGE_MIGRATIONS["0.7.0"] renames the four statement edges to user_story form', () => {
 const rules = UPG_EDGE_MIGRATIONS['0.7.0'] ?? []
 const byFrom = Object.fromEntries(rules.map((r) => [r.from, r])) as Record<string, { to?: string }>
 expect(byFrom['task_implements_story_statement']?.to).toBe('task_implements_user_story')
 expect(byFrom['epic_specified_by_story_statement']?.to).toBe('epic_specified_by_user_story')
 expect(byFrom['story_statement_verified_by_acceptance_criterion']?.to).toBe('user_story_verified_by_acceptance_criterion')
 expect(byFrom['test_case_covers_story_statement']?.to).toBe('test_case_covers_user_story')
 })

 it('getUPGEdgeMigrations(0.6.2, 0.7.0) returns exactly the four re-canon renames', () => {
 const rules = getUPGEdgeMigrations('0.6.2', '0.7.0')
 expect(rules).toHaveLength(4)
 for (const r of rules) {
 expect(r.kind).toBe('rename')
 expect(r.from).toContain('story_statement')
 expect((r as { to: string }).to).toContain('user_story')
 }
 })

 it('chain converges: the split emits story_statement, which the 0.7.0 map renames to user_story', () => {
 // The v0.2.7 split (historical) still produces a `story_statement` node;
 // applying the 0.7.0 type map carries it forward to the canonical user_story.
 const splitStatementType = UPG_SPLIT_MIGRATIONS['0.2.7'][0].produces.find((p) => p.ref === 'statement')!.type
 expect(splitStatementType).toBe('story_statement')
 const map = getMigrationMap('0.2.7', '0.7.0')
 expect(map[splitStatementType]).toBe('user_story')
 })
})

// ─── Migration adapter contract ────────────────────────────────────────────────

describe('UPG_SPLIT_MIGRATIONS rule shape', () => {
 it('exposes a single split rule keyed by 0.2.7', () => {
 expect(UPG_SPLIT_MIGRATIONS['0.2.7']).toHaveLength(1)
 expect(UPG_SPLIT_MIGRATIONS['0.2.7'][0].from).toBe('user_story')
 })

 it('rule.kind is status_routed', () => {
 expect(UPG_SPLIT_MIGRATIONS['0.2.7'][0].kind).toBe('status_routed')
 })

 it('produces task (not story_task — retroactively updated) and story_statement', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.7'][0]
 const refs = rule.produces.map((p) => p.ref)
 const types = rule.produces.map((p) => p.type)
 expect(refs).toEqual(['task', 'statement'])
 expect(types).toEqual(['task', 'story_statement'])
 })

 it('routing table covers all 4 legacy user_story status values, all spawn both targets', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.7'][0]
 const statuses = Object.keys(rule.routing).sort()
 expect(statuses).toEqual(['done', 'draft', 'in_progress', 'ready'])
 for (const status of statuses) {
 const route = rule.routing[status]
 expect(route.spawn).toEqual(expect.arrayContaining(['task', 'statement']))
 }
 })

 it('always emits implements edge from task to statement', () => {
 const rule = UPG_SPLIT_MIGRATIONS['0.2.7'][0]
 expect(rule.edges).toHaveLength(1)
 const edge = rule.edges[0]
 expect(edge.source_ref).toBe('task')
 expect(edge.target_ref).toBe('statement')
 expect(edge.type).toBe('task_implements_story_statement')
 expect(edge.when).toBe('both_spawned')
 })

 it('getSplitMigrations(0.2.6, 0.2.7) returns the user_story split', () => {
 const splits = getSplitMigrations('0.2.6', '0.2.7')
 expect(splits).toHaveLength(1)
 expect(splits[0].from).toBe('user_story')
 })

 it('getSplitMigrations(0.2.5, 0.2.7) returns both v0.2.6 and v0.2.7 splits in version order', () => {
 const splits = getSplitMigrations('0.2.5', '0.2.7')
 expect(splits).toHaveLength(2)
 expect(splits[0].from).toBe('experiment')
 expect(splits[1].from).toBe('user_story')
 })
})

// ─── Migration adapter runner ──────────────────────────────────────────────────
//
// Same shape as the experiment-split inline runner — generic over rule
// data, so a single implementation covers all current and future splits.
// This is the executable contract for the MCP-side `migrate_type` runtime.

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

 const edges: SpawnedEdge[] = []
 for (const e of rule.edges) {
 const shouldEmit =
 e.when === 'always' ||
 (e.when === 'both_spawned' && spawnSet.has(e.source_ref) && spawnSet.has(e.target_ref))
 if (!shouldEmit) continue
 edges.push({ source: idByRef[e.source_ref], target: idByRef[e.target_ref], type: e.type })
 }

 return { nodes, edges }
}

const RULE = UPG_SPLIT_MIGRATIONS['0.2.7'][0]

describe('ApplySplit() invariants per status', () => {
 it('status=draft → 1 task (status=todo) + 1 statement + implements edge', () => {
 const out = applySplit(
 { id: 'us_001', type: 'user_story', properties: { status: 'draft', as_a: 'pm', i_want_to: 'see metrics', so_that: 'I can decide' } },
 RULE,
 )
 expect(out.nodes).toHaveLength(2)
 const task = out.nodes.find((n) => n.ref === 'task')!
 const statement = out.nodes.find((n) => n.ref === 'statement')!
 expect(task.type).toBe('task') // story_task → task
 expect(task.properties.status).toBe('todo')
 expect(statement.type).toBe('story_statement')
 expect(statement.properties.as_a).toBe('pm')
 expect(out.edges).toHaveLength(1)
 expect(out.edges[0].type).toBe('task_implements_story_statement')
 })

 it('status=ready → task (status=todo) + statement + edge', () => {
 const out = applySplit(
 { id: 'us_002', type: 'user_story', properties: { status: 'ready' } },
 RULE,
 )
 expect(out.nodes.find((n) => n.ref === 'task')!.properties.status).toBe('todo')
 expect(out.edges).toHaveLength(1)
 })

 it('status=in_progress → task (status=in_progress) + statement + edge', () => {
 const out = applySplit(
 { id: 'us_003', type: 'user_story', properties: { status: 'in_progress' } },
 RULE,
 )
 expect(out.nodes.find((n) => n.ref === 'task')!.properties.status).toBe('in_progress')
 })

 it('status=done → task (status=done) + statement + edge', () => {
 const out = applySplit(
 { id: 'us_004', type: 'user_story', properties: { status: 'done' } },
 RULE,
 )
 expect(out.nodes.find((n) => n.ref === 'task')!.properties.status).toBe('done')
 })

 it('task (first ref) preserves source id; statement gets derived id', () => {
 const out = applySplit(
 { id: 'us_legacy_id', type: 'user_story', properties: { status: 'in_progress' } },
 RULE,
 )
 expect(out.nodes.find((n) => n.ref === 'task')!.id).toBe('us_legacy_id')
 expect(out.nodes.find((n) => n.ref === 'statement')!.id).toBe('us_legacy_id__statement')
 // Edge points task → statement using the new id pair
 expect(out.edges[0].source).toBe('us_legacy_id')
 expect(out.edges[0].target).toBe('us_legacy_id__statement')
 })

 it('statement-shape source props (as_a, i_want_to, so_that, text) only land on statement', () => {
 const out = applySplit(
 {
 id: 'us_props',
 type: 'user_story',
 properties: {
 status: 'in_progress',
 as_a: 'product manager',
 i_want_to: 'compare metrics',
 so_that: 'I can prioritise',
 text: 'As a PM, I want to compare metrics so that I can prioritise.',
 estimate: '5',
 effort: 5,
 priority: 'high',
 },
 },
 RULE,
 )
 const task = out.nodes.find((n) => n.ref === 'task')!
 const statement = out.nodes.find((n) => n.ref === 'statement')!
 expect(statement.properties.as_a).toBe('product manager')
 expect(statement.properties.i_want_to).toBe('compare metrics')
 expect(statement.properties.so_that).toBe('I can prioritise')
 expect(statement.properties.text).toContain('As a PM')
 expect(statement.properties.estimate).toBeUndefined()
 expect(statement.properties.effort).toBeUndefined()
 expect(statement.properties.priority).toBeUndefined()
 expect(task.properties.estimate).toBe('5')
 expect(task.properties.effort).toBe(5)
 expect(task.properties.priority).toBe('high')
 expect(task.properties.as_a).toBeUndefined()
 expect(task.properties.text).toBeUndefined()
 })
})
