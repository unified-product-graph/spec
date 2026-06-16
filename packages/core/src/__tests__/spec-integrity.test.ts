/**
 * Spec Integrity Tests
 *
 * Automated consistency checks across all layers of the UPG spec.
 * Every issue found during the v0.2 audit is encoded here as a regression test.
 *
 * Run: npx vitest run src/__tests__/spec-integrity.test.ts
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as url from 'node:url'

// ─── Layer 1: Vocabulary ─────────────────────────────────────────────────────
import type { UPGEntityType } from '../catalog/entity-catalog.js'
import {
 UPG_EDGE_CATALOG,
 UPG_POLYMORPHIC_EDGE_KEYS,
 UPG_WILDCARD_ENDPOINT,
 isPolymorphicEdge,
 isRegisteredPolymorphicEdge,
} from '../catalog/edge-catalog.js'

// ─── Layer 1B: Registry ──────────────────────────────────────────────────────
import { UPG_ENTITY_META, isDeprecatedType } from '../registry/entity-meta.js'
import { UPG_DOMAINS, UPG_ENTITY_TO_DOMAIN, getDomainIdForType, getTypes } from '../registry/domains.js'

// ─── Layer 2: Grammar ────────────────────────────────────────────────────────
import { UPG_VALID_CHILDREN } from '../grammar/hierarchy.js'
import {
 UPG_LIFECYCLES,
 UPG_LIFECYCLE_FREE_TYPES,
 UPG_LIFECYCLE_PLANNED_TYPES,
 isLifecycleFreeType,
 isLifecyclePlannedType,
} from '../grammar/lifecycles.js'
import { UPG_MIGRATIONS } from '../grammar/migrations.js'
import { pickCanonicalEdge, resolveAllEdges, resolveContainmentEdge } from '../index.js'

// ─── Layer 4: Frameworks ────────────────────────────────────────────────────
import { UPG_FRAMEWORKS } from '../frameworks/definitions/index.js'

// ─── Layer 4b: Intelligence ─────────────────────────────────────────────────
import { UPG_COUNT_BENCHMARKS } from '../intelligence/benchmarks/index.js'
import { UPG_PRODUCT_STAGES } from '../intelligence/benchmarks/types.js'
import type { UPGProductStage } from '../shapes/document.js'

// ─── Layer 3: Properties ─────────────────────────────────────────────────────
// property-registry may not exist on all branches
let getPropertySchema: ((type: string) => Record<string, unknown> | undefined) | undefined
try {
 const mod = await import('../properties/property-schema.js')
 getPropertySchema = mod.getPropertySchema
} catch {
 // skip
}

// ─── Computed sets ───────────────────────────────────────────────────────────

const allDomainTypes = getTypes()
const allDomainTypesSet = new Set(allDomainTypes)

const allMetaNames = UPG_ENTITY_META.map((m) => m.name)
const allMetaNamesSet = new Set(allMetaNames)

const activeMetaTypes = UPG_ENTITY_META
 .filter((m) => m.maturity === 'stable' || m.maturity === 'proposed')
 .map((m) => m.name)
const activeMetaTypesSet = new Set(activeMetaTypes)

const deprecatedMetaTypes = UPG_ENTITY_META
 .filter((m) => m.maturity === 'deprecated')
 .map((m) => m.name)
const deprecatedMetaTypesSet = new Set(deprecatedMetaTypes)

// ─────────────────────────────────────────────────────────────────────────────
// 1. Entity Type ↔ Domain consistency
// ─────────────────────────────────────────────────────────────────────────────

describe('Entity Type ↔ Domain consistency', () => {
 it('every domain type exists in entity-meta', () => {
 const missing: string[] = []
 for (const t of allDomainTypes) {
 if (!allMetaNamesSet.has(t)) missing.push(t)
 }
 expect(missing, `Types in domains but not in entity-meta: ${missing.join(', ')}`).toEqual([])
 })

 it('every active entity-meta type exists in exactly one domain', () => {
 const missing: string[] = []
 for (const t of activeMetaTypes) {
 if (!allDomainTypesSet.has(t)) missing.push(t)
 }
 expect(missing, `Active types in entity-meta but not in any domain: ${missing.join(', ')}`).toEqual([])
 })

 it('no deprecated type appears in a domain types array', () => {
 const found: string[] = []
 for (const t of allDomainTypes) {
 if (deprecatedMetaTypesSet.has(t)) found.push(t)
 }
 expect(found, `Deprecated types still in domain arrays: ${found.join(', ')}`).toEqual([])
 })

 it('each type appears in exactly one domain (no duplicates)', () => {
 const seen = new Map<string, string>()
 const dupes: string[] = []
 for (const domain of UPG_DOMAINS) {
 for (const t of domain.types) {
 if (seen.has(t)) dupes.push(`${t} in both ${seen.get(t)} and ${domain.id}`)
 else seen.set(t, domain.id)
 }
 }
 expect(dupes).toEqual([])
 })

 it('UPG_ENTITY_TO_DOMAIN covers every type in UPG_DOMAINS exactly once', () => {
 const missing: string[] = []
 for (const t of allDomainTypes) {
 if (!(t in UPG_ENTITY_TO_DOMAIN)) missing.push(t)
 }
 expect(missing, `Types in UPG_DOMAINS absent from UPG_ENTITY_TO_DOMAIN: ${missing.join(', ')}`).toEqual([])
 expect(Object.keys(UPG_ENTITY_TO_DOMAIN).length).toBe(allDomainTypes.length)
 })

 it('UPG_ENTITY_TO_DOMAIN maps every active entity type to its declared domain', () => {
 const bad: string[] = []
 for (const domain of UPG_DOMAINS) {
 for (const t of domain.types) {
 const mapped = UPG_ENTITY_TO_DOMAIN[t as UPGEntityType]
 if (mapped !== domain.id) {
 bad.push(`${t}: mapped to ${mapped}, declared in ${domain.id}`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('getDomainIdForType agrees with UPG_ENTITY_TO_DOMAIN', () => {
 const disagreements: string[] = []
 for (const t of activeMetaTypes) {
 const direct = UPG_ENTITY_TO_DOMAIN[t as UPGEntityType]
 const helper = getDomainIdForType(t as UPGEntityType)
 if (direct !== helper) {
 disagreements.push(`${t}: map=${direct} helper=${helper}`)
 }
 }
 expect(disagreements).toEqual([])
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. Entity-Meta integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Entity-Meta integrity', () => {
 it('no duplicate type_ids', () => {
 const seen = new Map<string, string>()
 const collisions: string[] = []
 for (const m of UPG_ENTITY_META) {
 if (seen.has(m.type_id)) {
 collisions.push(`${m.type_id} used by both ${seen.get(m.type_id)} and ${m.name}`)
 }
 seen.set(m.type_id, m.name)
 }
 expect(collisions, `Type ID collisions: ${collisions.join('; ')}`).toEqual([])
 })

 it('no duplicate names', () => {
 const seen = new Set<string>()
 const dupes: string[] = []
 for (const m of UPG_ENTITY_META) {
 if (seen.has(m.name)) dupes.push(m.name)
 seen.add(m.name)
 }
 expect(dupes).toEqual([])
 })

 it('every deprecated type has a replacement', () => {
 const missing: string[] = []
 for (const m of UPG_ENTITY_META) {
 if (m.maturity === 'deprecated' && !m.replacement) {
 missing.push(m.name)
 }
 }
 expect(missing, `Deprecated types without replacement: ${missing.join(', ')}`).toEqual([])
 })

 it('every replacement type is active (not itself deprecated)', () => {
 const bad: string[] = []
 for (const m of UPG_ENTITY_META) {
 if (m.maturity === 'deprecated' && m.replacement) {
 if (!activeMetaTypesSet.has(m.replacement)) {
 bad.push(`${m.name} → ${m.replacement} (replacement is not active)`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('all maturity values are valid', () => {
 const valid = new Set(['draft', 'proposed', 'stable', 'deprecated', 'removed'])
 const bad: string[] = []
 for (const m of UPG_ENTITY_META) {
 if (!valid.has(m.maturity)) bad.push(`${m.name}: ${m.maturity}`)
 }
 expect(bad).toEqual([])
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. Edge Registry integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge Registry integrity', () => {
 // 'node' is a valid wildcard type for polymorphic edges (any-to-any relationships)
 const WILDCARD_TYPES = new Set(['node'])
 const allAcceptableTypes = new Set([...activeMetaTypesSet, ...deprecatedMetaTypesSet, ...WILDCARD_TYPES])

 it('every source_type references a known entity type', () => {
 const bad: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (!allAcceptableTypes.has(def.source_type)) {
 bad.push(`${key}: source_type "${def.source_type}" is unknown`)
 }
 }
 expect(bad, `Edges with unknown source_type:\n${bad.join('\n')}`).toEqual([])
 })

 it('every target_type references a known entity type', () => {
 const bad: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (!allAcceptableTypes.has(def.target_type)) {
 bad.push(`${key}: target_type "${def.target_type}" is unknown`)
 }
 }
 expect(bad, `Edges with unknown target_type:\n${bad.join('\n')}`).toEqual([])
 })

 it('no edge source_type or target_type references a deprecated type', () => {
 const bad: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (deprecatedMetaTypesSet.has(def.source_type)) {
 bad.push(`${key}: source_type "${def.source_type}" is deprecated`)
 }
 if (deprecatedMetaTypesSet.has(def.target_type)) {
 bad.push(`${key}: target_type "${def.target_type}" is deprecated`)
 }
 }
 expect(bad, `Edges referencing deprecated types:\n${bad.join('\n')}`).toEqual([])
 })

 it('every edge has valid classification', () => {
 const valid = new Set(['hierarchy', 'causal', 'semantic', 'cross-domain'])
 const bad: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (!valid.has(def.classification)) {
 bad.push(`${key}: classification "${def.classification}"`)
 }
 }
 expect(bad).toEqual([])
 })

 it('every edge has non-empty forward_verb and reverse_verb', () => {
 const bad: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (!def.forward_verb) bad.push(`${key}: missing forward_verb`)
 if (!def.reverse_verb) bad.push(`${key}: missing reverse_verb`)
 }
 expect(bad).toEqual([])
 })

 // ──: product anchors for the user + market_intelligence domains ──
 //
 // The chain validation report (findings F5/F6) showed that fresh
 // graphs produce orphan persona / competitive_analysis nodes because there
 // was no canonical edge from the product to either anchor entity. These
 // tests pin the new edges so a future schema-consolidation pass cannot
 // delete them without also addressing the orphan pattern.

 it('Product → persona is canonical (semantic anchor)', () => {
 const def = UPG_EDGE_CATALOG['product_targets_persona' as keyof typeof UPG_EDGE_CATALOG]
 expect(def).toBeDefined()
 expect(def.source_type).toBe('product')
 expect(def.target_type).toBe('persona')
 // semantic, not hierarchy: a product does not "contain" personas — it
 // targets them. Hierarchy is reserved for ownership/containment.
 expect(def.classification).toBe('semantic')
 })

 it('Product → competitive_analysis is canonical (hierarchy anchor)', () => {
 const def = UPG_EDGE_CATALOG['product_contains_competitive_analysis' as keyof typeof UPG_EDGE_CATALOG]
 expect(def).toBeDefined()
 expect(def.source_type).toBe('product')
 expect(def.target_type).toBe('competitive_analysis')
 // hierarchy: an analysis is owned by / contained in one product, mirrors
 // product_contains_research_study for the research_study anchor.
 expect(def.classification).toBe('hierarchy')
 // Verb choice: plain English `contains` reads more naturally than the
 // programming-flavoured `scopes`.
 expect(def.forward_verb).toBe('contains')
 expect(def.reverse_verb).toBe('contained_by')
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3b. Edge pair uniqueness (prevents silent data loss in Object.fromEntries maps)
// ─────────────────────────────────────────────────────────────────────────────

describe('Edge pair uniqueness', () => {
 it('tracks source_type:target_type pair collisions in UPG_EDGE_CATALOG', () => {
 // Multiple edge types between the same source→target pair are intentional
 // (e.g. persona→job can have both semantic and hierarchy edges).
 // This test documents them so UPG_EDGE_PAIR_MAP consumers know which
 // pairs have multiple edges and only one will survive Object.fromEntries.
 const pairToKeys = new Map<string, string[]>()
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 const pair = `${def.source_type}:${def.target_type}`
 const existing = pairToKeys.get(pair) ?? []
 existing.push(key)
 pairToKeys.set(pair, existing)
 }
 const multiPairs = [...pairToKeys.entries()].filter(([, keys]) => keys.length > 1)

 // Document the count — this is informational, not a failure.
 // If the count changes unexpectedly, the snapshot will flag it for review.
 // lowered 35 → 27 by the duplicate-collapse (13 shadow / near-synonym
 // / inverse edges retired; the inverse flips removed two source:target pairs).
 // 0.9.12 added specification:specification (extends + competes_with) → 28.
 // 0.12.0 P14 conformance added 4 same-pair/different-verb pairs (e.g.
 // model_comparison→ai_model {compares, winner_is}; ai_experiment→ai_model
 // {based_on, uses}; X→metric measurement pairs). Distinct relationships;
 // duplicate + near-synonym gates pass. → 32.
 expect(multiPairs.length).toMatchInlineSnapshot(`32`)
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3c-pre. resolveContainmentEdge — catalogue-aware edge resolver
// The GitHub adapter calls resolveContainmentEdge('release', 'feature') and
// ('release', 'bug') when importing milestone→issue relationships. These
// edges were registered; this section ensures they resolve
// correctly and that the adapter's low-confidence fallback is no longer hit.
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveContainmentEdge', () => {
 it('returns release_contains_feature for release → feature', () => {
 expect(resolveContainmentEdge('release', 'feature')).toBe('release_contains_feature')
 })

 it('returns release_contains_bug for release → bug', () => {
 expect(resolveContainmentEdge('release', 'bug')).toBe('release_contains_bug')
 })

 it('returns the canonical edge for a known non-release pair (regression)', () => {
 expect(resolveContainmentEdge('feature_area', 'feature')).toBe('feature_area_contains_feature')
 })

 it('returns null for an unregistered pair', () => {
 expect(resolveContainmentEdge('release', 'persona')).toBeNull()
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3c-bis. pickCanonicalEdge / resolveAllEdges / G5 collision determinism
// v0.4.1 fix: `UPG_EDGE_PAIR_MAP` is now `Record<string, UPGEdgeType[]>`
// and `pickCanonicalEdge` applies a classification-ranked policy so every
// collision pair resolves deterministically — no more silent last-wins.
// ─────────────────────────────────────────────────────────────────────────────

describe('pickCanonicalEdge / resolveAllEdges (G5)', () => {
 it('resolveAllEdges returns every catalogued edge for a collision pair', () => {
 const edges = resolveAllEdges('learning', 'hypothesis')
 expect(edges).toContain('learning_updates_hypothesis')
 expect(edges).toContain('learning_refines_hypothesis')
 expect(edges.length).toBeGreaterThanOrEqual(2)
 })

 it('resolveAllEdges returns [] for an unregistered pair', () => {
 expect(resolveAllEdges('release', 'persona')).toEqual([])
 })

 it('pickCanonicalEdge with hierarchy hint prefers the hierarchy-class edge', () => {
 // product:decision and product:incident each had a duplicate
 // hierarchy shadow (product_decided_via_decision_hierarchy,
 // product_experiences_incident_hierarchy); both were collapsed into the clean
 // key, so each pair now resolves to its single canonical hierarchy edge.
 expect(pickCanonicalEdge('product', 'decision', 'hierarchy')).toBe(
 'product_decided_via_decision',
 )
 expect(pickCanonicalEdge('product', 'incident', 'hierarchy')).toBe(
 'product_experiences_incident',
 )
 })

 it('pickCanonicalEdge falls back to classification rank when hint has no match', () => {
 // learning:hypothesis has causal + cross-domain edges, no hierarchy.
 // Hint 'hierarchy' should fall through and pick the causal edge.
 expect(pickCanonicalEdge('learning', 'hypothesis', 'hierarchy')).toBe(
 'learning_updates_hypothesis',
 )
 })

 it('pickCanonicalEdge without a hint applies CLASSIFICATION_RANK', () => {
 // insight:opportunity has only cross-domain edges — first declared wins.
 expect(pickCanonicalEdge('insight', 'opportunity')).toBe(
 'insight_informs_opportunity',
 )
 })

 it('every G5 collision pair resolves to a non-null canonical edge', () => {
 // Audit the catalog at runtime — for every pair with > 1 edge, both
 // resolveContainmentEdge and pickCanonicalEdge must return non-null and
 // the returned key must be one of the candidates.
 const pairs = new Map<string, string[]>()
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 const pair = `${def.source_type}:${def.target_type}`
 const existing = pairs.get(pair) ?? []
 existing.push(key)
 pairs.set(pair, existing)
 }
 const failures: string[] = []
 for (const [pair, keys] of pairs.entries()) {
 if (keys.length <= 1) continue
 const [source, target] = pair.split(':') as [string, string]
 const picked = resolveContainmentEdge(source, target)
 if (picked === null) {
 failures.push(`${pair} → null (candidates: ${keys.join(', ')})`)
 continue
 }
 if (!keys.includes(picked)) {
 failures.push(`${pair} → ${picked} (not in candidates: ${keys.join(', ')})`)
 }
 }
 expect(failures, `Collision pairs without a deterministic canonical pick:\n${failures.join('\n')}`).toEqual([])
 })

 it('resolveContainmentEdge is stable across repeated calls (no last-wins drift)', () => {
 // Sample three known collisions — every call must return the same key.
 const samples: Array<[string, string]> = [
 ['learning', 'hypothesis'],
 ['product', 'decision'],
 ['insight', 'opportunity'],
 ['metric', 'metric'],
 ['decision', 'decision'],
 ]
 for (const [s, t] of samples) {
 const a = resolveContainmentEdge(s, t)
 const b = resolveContainmentEdge(s, t)
 const c = resolveContainmentEdge(s, t)
 expect(a).not.toBeNull()
 expect(b).toBe(a)
 expect(c).toBe(a)
 }
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3c. Polymorphic edge allow-list
// Every edge using the `'node'` wildcard endpoint must be registered in
// UPG_POLYMORPHIC_EDGE_KEYS, and every key in the allow-list must actually
// be polymorphic. Divergence is a structural drift bug.
// ─────────────────────────────────────────────────────────────────────────────

describe('Polymorphic edge allow-list', () => {
 it('every wildcard-endpoint edge is in UPG_POLYMORPHIC_EDGE_KEYS', () => {
 const unregistered: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 const usesWildcard =
 def.source_type === UPG_WILDCARD_ENDPOINT ||
 def.target_type === UPG_WILDCARD_ENDPOINT
 if (usesWildcard && !isRegisteredPolymorphicEdge(key as keyof typeof UPG_EDGE_CATALOG)) {
 unregistered.push(key)
 }
 }
 expect(unregistered, `Polymorphic edges missing from UPG_POLYMORPHIC_EDGE_KEYS (see CONTRIBUTING.md, "How to propose a new edge type"):\n${unregistered.join('\n')}`).toEqual([])
 })

 it('every key in UPG_POLYMORPHIC_EDGE_KEYS is actually polymorphic', () => {
 const misclassified: string[] = []
 for (const key of UPG_POLYMORPHIC_EDGE_KEYS) {
 if (!isPolymorphicEdge(key)) {
 misclassified.push(key)
 }
 }
 expect(misclassified, `Keys listed as polymorphic but no wildcard endpoint:\n${misclassified.join('\n')}`).toEqual([])
 })

 it('isPolymorphicEdge matches isRegisteredPolymorphicEdge for every catalog key', () => {
 const divergent: string[] = []
 for (const key of Object.keys(UPG_EDGE_CATALOG) as (keyof typeof UPG_EDGE_CATALOG)[]) {
 if (isPolymorphicEdge(key) !== isRegisteredPolymorphicEdge(key)) {
 divergent.push(key as string)
 }
 }
 expect(divergent, `Edges where derived polymorphism disagrees with allow-list:\n${divergent.join('\n')}`).toEqual([])
 })

 it('UPG_POLYMORPHIC_EDGE_KEYS has a stable shape (14 entries, 6 families)', () => {
 // Bumping this? You added a polymorphic edge — follow the ripple checklist in
 // CONTRIBUTING.md ("How to propose a new edge type") so the fixture, cross-edge
 // registration, and paper move with it.
 expect(
 UPG_POLYMORPHIC_EDGE_KEYS.length,
 'UPG_POLYMORPHIC_EDGE_KEYS count changed — update this assertion AND see CONTRIBUTING.md edge-add checklist',
 ).toBe(14)
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. Hierarchy integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Hierarchy integrity', () => {
 it('every parent type in hierarchy exists in active types', () => {
 const bad: string[] = []
 for (const parentType of Object.keys(UPG_VALID_CHILDREN)) {
 if (!activeMetaTypesSet.has(parentType) && !allDomainTypesSet.has(parentType)) {
 bad.push(parentType)
 }
 }
 expect(bad, `Hierarchy parent types not in active types: ${bad.join(', ')}`).toEqual([])
 })

 it('every child type in hierarchy exists in active types', () => {
 const bad: string[] = []
 for (const [parent, children] of Object.entries(UPG_VALID_CHILDREN)) {
 for (const child of children) {
 if (!activeMetaTypesSet.has(child) && !allDomainTypesSet.has(child)) {
 bad.push(`${parent} → ${child}`)
 }
 }
 }
 expect(bad, `Hierarchy child types not in active types:\n${bad.join('\n')}`).toEqual([])
 })

 // — every edge classified as `hierarchy` must have its source→target
 // pair registered in UPG_VALID_CHILDREN. A hierarchy edge whose parents have
 // forgotten about the child is a drift hazard: the catalog says "parent X
 // contains Y" but the hierarchy grammar rejects Y under X.
 it('every hierarchy-classified edge has a matching UPG_VALID_CHILDREN entry', () => {
 const orphans: string[] = []
 for (const [key, def] of Object.entries(UPG_EDGE_CATALOG)) {
 if (def.classification !== 'hierarchy') continue
 const validChildren = UPG_VALID_CHILDREN[def.source_type] ?? []
 if (!validChildren.includes(def.target_type)) {
 orphans.push(`${key} (${def.source_type} → ${def.target_type})`)
 }
 }
 expect(orphans, `Hierarchy edges without a UPG_VALID_CHILDREN entry:\n${orphans.join('\n')}`).toEqual([])
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4b. Lifecycle structural integrity
// Terminal phases MAY have `transitions_to` entries (late-state / reopen
// paths), but every target must still be a phase in the same lifecycle.
// Non-terminal phases must have at least one forward transition, otherwise
// the phase is a dead-end that should be marked terminal.
// ─────────────────────────────────────────────────────────────────────────────

describe('Lifecycle integrity', () => {
 it('every terminal_phase is a declared phase id', () => {
 const bad: string[] = []
 for (const lc of UPG_LIFECYCLES) {
 const phaseIds = new Set(lc.phases.map((p) => p.id))
 for (const tp of lc.terminal_phases) {
 if (!phaseIds.has(tp)) bad.push(`${lc.entity_type}: terminal="${tp}"`)
 }
 }
 expect(bad).toEqual([])
 })

 it('every initial_phase is a declared phase id', () => {
 const bad: string[] = []
 for (const lc of UPG_LIFECYCLES) {
 const phaseIds = new Set(lc.phases.map((p) => p.id))
 if (!phaseIds.has(lc.initial_phase)) {
 bad.push(`${lc.entity_type}: initial="${lc.initial_phase}"`)
 }
 }
 expect(bad).toEqual([])
 })

 it('every transitions_to target is a phase in the same lifecycle', () => {
 const bad: string[] = []
 for (const lc of UPG_LIFECYCLES) {
 const phaseIds = new Set(lc.phases.map((p) => p.id))
 for (const phase of lc.phases) {
 for (const dest of phase.transitions_to) {
 if (!phaseIds.has(dest)) {
 bad.push(`${lc.entity_type}: ${phase.id} → ${dest}`)
 }
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('non-terminal phases have at least one forward transition', () => {
 const bad: string[] = []
 for (const lc of UPG_LIFECYCLES) {
 const terminalSet = new Set(lc.terminal_phases)
 for (const phase of lc.phases) {
 if (!terminalSet.has(phase.id) && phase.transitions_to.length === 0) {
 bad.push(`${lc.entity_type}: ${phase.id} (non-terminal, no transitions)`)
 }
 }
 }
 expect(bad, `Dead-end non-terminal phases — should either be marked terminal or given transitions:\n${bad.join('\n')}`).toEqual([])
 })

 // — the `product` lifecycle must stay coherent with UPGProductStage.
 // Adding a stage to UPGProductStage in shapes/document.ts without extending
 // PRODUCT_LIFECYCLE (or vice versa) breaks benchmarks that reference stages
 // by name. These tests catch the drift at CI time.
 describe('product lifecycle ↔ UPGProductStage coherence', () => {
 const productLifecycle = UPG_LIFECYCLES.find((lc) => lc.entity_type === 'product')

 it('product has a declared lifecycle in UPG_LIFECYCLES', () => {
 expect(productLifecycle, 'UPG_LIFECYCLES is missing an entry for product').toBeDefined()
 })

 it('product lifecycle phase ids equal UPG_PRODUCT_STAGES tuple', () => {
 expect(productLifecycle).toBeDefined()
 const phaseIds = productLifecycle!.phases.map((p) => p.id) as UPGProductStage[]
 expect(phaseIds).toEqual([...UPG_PRODUCT_STAGES])
 })

 it('product lifecycle covers every UPGProductStage', () => {
 expect(productLifecycle).toBeDefined()
 const phaseIdSet = new Set(productLifecycle!.phases.map((p) => p.id))
 const missing: string[] = []
 for (const stage of UPG_PRODUCT_STAGES) {
 if (!phaseIdSet.has(stage)) missing.push(stage)
 }
 expect(missing).toEqual([])
 })

 it('product lifecycle has `concept` as initial and `sunset` as terminal', () => {
 expect(productLifecycle).toBeDefined()
 expect(productLifecycle!.initial_phase).toBe('concept')
 expect(productLifecycle!.terminal_phases).toEqual(['sunset'])
 })
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4c. Lifecycle coverage (Phase A)
// Every active entity type must be in exactly ONE of:
// - UPG_LIFECYCLES (has lifecycle)
// - UPG_LIFECYCLE_FREE_TYPES (lifecycle-free by design)
// - UPG_LIFECYCLE_PLANNED_TYPES (deferred to Phase B/C/D)
// No overlap, no gaps. Phases B/C/D migrate types out of PLANNED into
// UPG_LIFECYCLES; the PLANNED set trends to zero as enrichment ships.
// ─────────────────────────────────────────────────────────────────────────────

describe('Lifecycle coverage triage', () => {
 const withLifecycle = new Set(UPG_LIFECYCLES.map((l) => l.entity_type))

 it('every active type is in exactly one coverage set', () => {
 const violations: string[] = []
 for (const t of activeMetaTypes) {
 const memberships: string[] = []
 if (withLifecycle.has(t)) memberships.push('lifecycles')
 if (UPG_LIFECYCLE_FREE_TYPES.has(t)) memberships.push('free')
 if (UPG_LIFECYCLE_PLANNED_TYPES.has(t)) memberships.push('planned')
 if (memberships.length !== 1) {
 violations.push(`${t}: [${memberships.join(', ') || 'none'}]`)
 }
 }
 expect(violations, `Types in zero or multiple coverage sets:\n${violations.join('\n')}`).toEqual([])
 })

 it('lifecycle-free set only names active types', () => {
 const bad: string[] = []
 for (const t of UPG_LIFECYCLE_FREE_TYPES) {
 if (!activeMetaTypesSet.has(t)) bad.push(t)
 }
 expect(bad).toEqual([])
 })

 it('planned set only names active types', () => {
 const bad: string[] = []
 for (const t of UPG_LIFECYCLE_PLANNED_TYPES) {
 if (!activeMetaTypesSet.has(t)) bad.push(t)
 }
 expect(bad).toEqual([])
 })

 it('isLifecycleFreeType reflects UPG_LIFECYCLE_FREE_TYPES', () => {
 for (const t of UPG_LIFECYCLE_FREE_TYPES) {
 expect(isLifecycleFreeType(t)).toBe(true)
 }
 expect(isLifecycleFreeType('__not_a_real_type__')).toBe(false)
 })

 it('isLifecyclePlannedType reflects UPG_LIFECYCLE_PLANNED_TYPES', () => {
 for (const t of UPG_LIFECYCLE_PLANNED_TYPES) {
 expect(isLifecyclePlannedType(t)).toBe(true)
 }
 expect(isLifecyclePlannedType('__not_a_real_type__')).toBe(false)
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. Property Map integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Property Map integrity', () => {
 it('every type in property-registry exists in active types', () => {
 if (!getPropertySchema) {
 // property-registry not available on this branch — test cannot run
 expect('skipped: property-registry module not available').toBeTruthy()
 return
 }

 // closed the three known gaps (positioning, data_domain,
 // service_level_agreement). Every active type must now have a property
 // schema — a type with zero properties indicates an empty *Properties
 // interface, which the generator skips and which tools can't render.
 const bad: string[] = []
 for (const t of activeMetaTypes) {
 const schema = getPropertySchema(t)
 if (schema === undefined) {
 bad.push(t)
 }
 }
 expect(bad, `Active types missing from property-registry: ${bad.join(', ')}`).toEqual([])
 })

 // — `outcome` is the O in OKR. It must carry enough properties to
 // express ownership, success criteria, measurement method, and current
 // state. A one-property outcome was a spec smell (tracked).
 it('outcome entity carries at least 6 properties', () => {
 if (!getPropertySchema) return
 const schema = getPropertySchema('outcome')
 expect(schema, 'outcome has no property schema').toBeDefined()
 expect(Object.keys(schema!).length).toBeGreaterThanOrEqual(6)
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. Migration integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Migration integrity', () => {
 it('every entity migration "from" type is deprecated or absent from active types', () => {
 // Re-promoted types: deprecated at one version, then re-promoted at a later version.
 // Their grandfathered migration rules must remain for backward compat with old files,
 // even though the type is now active again.: hypothesis deprecated at v0.2.8
 // (→ hypothesis_claim), then re-promoted at v0.4.0 when hypothesis_claim was reverted.
 const repromotedTypes = new Set(['hypothesis'])
 const bad: string[] = []
 for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
 for (const m of migrations) {
 if (activeMetaTypesSet.has(m.from) && !deprecatedMetaTypesSet.has(m.from) && !repromotedTypes.has(m.from)) {
 bad.push(`${version}: ${m.from} is still active (not deprecated)`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('every entity migration "to" type exists in active types', () => {
 // Grandfathered intermediate types: hypothesis_claim was the target of the v0.2.8
 // hypothesis split, then deprecated at v0.4.0 when hypothesis_claim was reverted to
 // hypothesis. The v0.2.8 rule must remain for backward compat; loaders
 // apply UPG_MIGRATIONS in version order and the chain collapses to a single hop.
 const grandfatheredTargets = new Set(['hypothesis_claim'])
 const bad: string[] = []
 for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
 for (const m of migrations) {
 if (!activeMetaTypesSet.has(m.to) && !grandfatheredTargets.has(m.to)) {
 bad.push(`${version}: ${m.from} → ${m.to} (target not active)`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 // Edge migrations deleted — one-time migration applied to all .upg files
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. No stale references (regression guards)
// ─────────────────────────────────────────────────────────────────────────────

describe('No stale references', () => {
 it('no domain has a tier property', () => {
 for (const domain of UPG_DOMAINS) {
 expect(domain).not.toHaveProperty('tier')
 }
 })

 it('UPGDomain interface has no tier field', () => {
 // Runtime check: if any domain object has 'tier', the interface leaked
 const sample = UPG_DOMAINS[0]
 const keys = Object.keys(sample)
 expect(keys).not.toContain('tier')
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 8. Framework slot entityTypeId integrity (regression guard)
// ─────────────────────────────────────────────────────────────────────────────

describe('Framework slot entityTypeId integrity', () => {
 it('every slot entityTypeId is a valid active entity type', () => {
 const bad: string[] = []
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 for (const slot of fw.slots) {
 if (!activeMetaTypesSet.has(slot.entityTypeId)) {
 bad.push(`${fw.id} → "${slot.label}": entityTypeId "${slot.entityTypeId}" is not an active entity type`)
 }
 }
 }
 expect(bad, `Slots with invalid entityTypeId:\n${bad.join('\n')}`).toEqual([])
 })

 it('no slot entityTypeId references a deprecated type', () => {
 const bad: string[] = []
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 for (const slot of fw.slots) {
 if (deprecatedMetaTypesSet.has(slot.entityTypeId)) {
 bad.push(`${fw.id} → "${slot.label}": entityTypeId "${slot.entityTypeId}" is deprecated`)
 }
 }
 }
 expect(bad, `Slots referencing deprecated types:\n${bad.join('\n')}`).toEqual([])
 })

 it('every slot entityTypeId exists in that framework data.entity_types', () => {
 const bad: string[] = []
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots || !fw.data?.entity_types) continue
 const dataTypes = new Set(fw.data.entity_types.map((et) => et.type))
 for (const slot of fw.slots) {
 if (!dataTypes.has(slot.entityTypeId)) {
 bad.push(`${fw.id} → "${slot.label}": slot type "${slot.entityTypeId}" not in data.entity_types [${[...dataTypes].join(', ')}]`)
 }
 }
 }
 expect(bad, `Slots with entityTypeId not in framework data.entity_types:\n${bad.join('\n')}`).toEqual([])
 })

 // ── Known-bad pattern regression guards ─────────────────────────────────
 // These encode the systematic errors found.
 // If a future migration re-introduces them, these tests will catch it.

 it('no "hypothesis" entityTypeId for slots labelled as features, products, or capabilities', () => {
 const bad: string[] = []
 const featurePattern = /\b(feature|product|capabilit|service)\b/i
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 for (const slot of fw.slots) {
 if (featurePattern.test(slot.label) && slot.entityTypeId === 'hypothesis') {
 bad.push(`${fw.id} → "${slot.label}": mapped to hypothesis instead of feature/service/capability`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('no "observation" entityTypeId for heuristic or guideline slots', () => {
 const bad: string[] = []
 const guidelinePattern = /\b(heuristic|guideline|principle|standard)\b/i
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 for (const slot of fw.slots) {
 if (guidelinePattern.test(slot.label) && slot.entityTypeId === 'observation') {
 bad.push(`${fw.id} → "${slot.label}": mapped to observation instead of a guideline type`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('no "persona" entityTypeId for role/responsibility slots (e.g. RACI)', () => {
 const bad: string[] = []
 const rolePattern = /\b(responsible|accountable|consulted|informed|owner|approver)\b/i
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 for (const slot of fw.slots) {
 if (rolePattern.test(slot.label) && slot.entityTypeId === 'persona') {
 bad.push(`${fw.id} → "${slot.label}": mapped to persona instead of role/stakeholder`)
 }
 }
 }
 expect(bad).toEqual([])
 })

 it('every framework has at least one slot', () => {
 const missing: string[] = []
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots || fw.slots.length === 0) {
 missing.push(fw.id)
 }
 }
 expect(missing, `Frameworks without slots:\n${missing.join('\n')}`).toEqual([])
 })

 it('no duplicate slot labels within a single framework', () => {
 const bad: string[] = []
 for (const fw of UPG_FRAMEWORKS) {
 if (!fw.slots) continue
 const seen = new Set<string>()
 for (const slot of fw.slots) {
 if (seen.has(slot.label)) {
 bad.push(`${fw.id}: duplicate slot label "${slot.label}"`)
 }
 seen.add(slot.label)
 }
 }
 expect(bad, `Frameworks with duplicate slot labels:\n${bad.join('\n')}`).toEqual([])
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 9. Count benchmark range integrity (regression guard)
// ─────────────────────────────────────────────────────────────────────────────

describe('Count benchmark range integrity', () => {
 it('count benchmarks have valid ranges (min <= max) for every non-null stage', () => {
 const stages: UPGProductStage[] = [
 'concept', 'validation', 'build', 'beta', 'launch',
 'growth', 'mature', 'maintenance', 'sunset',
 ]
 for (const b of UPG_COUNT_BENCHMARKS) {
 for (const s of stages) {
 const r = b[s]
 if (r !== null) {
 expect(r.min, `${b.type} @ ${s} min should be <= max`).toBeLessThanOrEqual(r.max)
 }
 }
 }
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 10. Benchmark source structure (regression guard)
// Every benchmark's `source` is one of the four sanctioned variants of
// UPGBenchmarkSource; each variant carries its required discriminator
// field. Protects against regression to free-form strings.
// ─────────────────────────────────────────────────────────────────────────────

describe('Benchmark source vocabulary', () => {
 const VALID_KINDS = new Set(['book', 'practitioner', 'industry_practice', 'fundamental'])

 const allSourced = [...UPG_COUNT_BENCHMARKS] as Array<{ source: unknown }>
 // Import the other benchmark sets lazily to keep the describe block local.

 function assertValidSource(source: unknown, label: string): void {
 expect(source && typeof source === 'object', `${label}: source must be an object`).toBe(true)
 const s = source as { kind?: string } & Record<string, unknown>
 expect(VALID_KINDS.has(s.kind ?? ''), `${label}: unknown source kind "${s.kind}"`).toBe(true)
 if (s.kind === 'book') {
 expect(typeof s.citation, `${label}: book source missing citation`).toBe('string')
 } else if (s.kind === 'practitioner') {
 expect(typeof s.attribution, `${label}: practitioner source missing attribution`).toBe('string')
 } else if (s.kind === 'industry_practice') {
 expect(typeof s.category, `${label}: industry_practice source missing category`).toBe('string')
 }
 // 'fundamental' carries no additional fields.
 }

 it('every count benchmark has a structured source', () => {
 for (const b of allSourced) assertValidSource(b.source, `count:${(b as { type?: string }).type}`)
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 11. Anti-pattern structure (regression guard)
// Every anti_patterns entry in every domain guide is a UPGAntiPattern
// object with at minimum `description`. Protects against regression to
// bare strings.
// ─────────────────────────────────────────────────────────────────────────────

describe('Anti-pattern structure', () => {
 it('every anti-pattern in every domain guide has a non-empty description', async () => {
 const { UPG_DOMAIN_GUIDES } = await import('../intelligence/domain-guides.js')
 const bad: string[] = []
 for (const g of UPG_DOMAIN_GUIDES) {
 for (let i = 0; i < g.anti_patterns.length; i++) {
 const ap = g.anti_patterns[i]
 if (typeof ap !== 'object' || ap === null) {
 bad.push(`${g.domain_id}[${i}]: not an object`)
 continue
 }
 if (typeof ap.description !== 'string' || ap.description.length === 0) {
 bad.push(`${g.domain_id}[${i}]: missing or empty description`)
 }
 }
 }
 expect(bad).toEqual([])
 })
})

// ─────────────────────────────────────────────────────────────────────────────
// 12. Canonical date shapes (Option C regression guard)
// Per properties/PROPERTIES.md: *_date / _deadline / _on fields are ISODate,
// *_at fields are ISODateTime. Raw `string` for any of these indicates drift.
// ─────────────────────────────────────────────────────────────────────────────

describe('Canonical date shapes', () => {
 const here = path.dirname(url.fileURLToPath(import.meta.url))
 const domainsDir = path.resolve(here, '..', 'properties', 'domains')

 function collectFiles(): string[] {
 return fs
 .readdirSync(domainsDir)
 .filter((f) => f.endsWith('.ts'))
 .map((f) => path.join(domainsDir, f))
 }

 it('every *_date / _deadline / _on field is typed ISODate (not raw string)', () => {
 const bad: string[] = []
 for (const file of collectFiles()) {
 const src = fs.readFileSync(file, 'utf-8')
 const lines = src.split('\n')
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i]
 const match = line.match(/^\s*(\w*(?:_date|_deadline|_on))\??:\s*string\s*$/)
 if (match) {
 bad.push(`${path.basename(file)}:${i + 1} ${match[1]} — use ISODate`)
 }
 }
 }
 expect(bad, `Non-canonical date fields found:\n${bad.join('\n')}`).toEqual([])
 })

 it('every *_at field is typed ISODateTime (not raw string)', () => {
 const bad: string[] = []
 for (const file of collectFiles()) {
 const src = fs.readFileSync(file, 'utf-8')
 const lines = src.split('\n')
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i]
 const match = line.match(/^\s*(\w+_at)\??:\s*string\s*$/)
 if (match) {
 bad.push(`${path.basename(file)}:${i + 1} ${match[1]} — use ISODateTime`)
 }
 }
 }
 expect(bad, `Non-canonical timestamp fields found:\n${bad.join('\n')}`).toEqual([])
 })
})
