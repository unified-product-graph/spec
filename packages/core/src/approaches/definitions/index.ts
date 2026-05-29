/**
 * approaches/definitions/: the five canonical UPGApproach records.
 *
 * Each record is a definition lookup: id, label, description (cartographic
 * framing), question_answered, signature_hint, framework_id_examples.
 * Structured execution semantics are a forthcoming follow-up; the LLM is the
 * executor today.
 *
 * Order is stable: Plan / Inspect / Prioritise / Trace / Reflect. Matches the
 * cognitive flow: decide what to build, check what's broken, rank what's
 * most important, walk a path through what exists, question what you're
 * assuming.
 *
 * See `../types.ts` for the cartographic-framing JSDoc that anchors the
 * "approach" naming. Read that before touching this file.
 */

import type { UPGApproach } from '../types.js'

// ─── Plan ───────────────────────────────────────────────────────────────────

const PLAN: UPGApproach = {
  id: 'plan',
  label: 'Plan',
  description:
    'The path of arrival to "what should I build next?". Plan engages a region by surveying its entity coverage against canonical expectations and surfacing the missing scaffolding: the entities a healthy region carries that this graph does not. Cartographic sense: you are walking the coastline of a region and noting where the contour is incomplete, not deciding a strategy. Frameworks like Now/Next/Later, MoSCoW, and Wardley Mapping live within Plan as the named techniques for organising the gap-filling sequence.',
  question_answered: "what should I build next?",
  signature_hint: '({ region?: UPGRegionId }) → { missing_entities, coverage_score }',
  framework_id_examples: [
    'now-next-later',
    'moscow',
    'wardley-map',
    'okr-framework',
    'three-horizons',
  ],
}

// ─── Inspect ────────────────────────────────────────────────────────────────

const INSPECT: UPGApproach = {
  id: 'inspect',
  label: 'Inspect',
  description:
    'The path of arrival to "what\'s broken?". Inspect engages a region or a set of entities by running canonical health checks (anti-pattern audits, drift reports, lint passes) and emitting a structured violation list with severity, kind, target entity, description, and fix hint. Cartographic sense: you are surveying the coastline for hazards before approach; the violations are the rocks marked on the chart. The named techniques inside Inspect are the audit catalogues themselves (`UPG_ANTI_PATTERNS` and the lint passes built on the structural rules).',
  question_answered: "what's broken?",
  signature_hint:
    '({ region?: UPGRegionId, entities?: entity_ids[] }) → { violations: [{ severity, kind, entity_id, description, fix_hint }] }',
  framework_id_examples: [
    'heuristic-evaluation',
    'tech-debt-tracker',
    'accessibility-maturity-model',
    'cognitive-walkthrough',
    'blameless-postmortem',
  ],
}

// ─── Prioritise ─────────────────────────────────────────────────────────────

const PRIORITISE: UPGApproach = {
  id: 'prioritise',
  label: 'Prioritise',
  description:
    'The path of arrival to "what\'s most important?". Prioritise engages an explicit candidate set (entity ids the caller passes in) and ranks it by an explicit framework: RICE, ICE, Kano, Cost of Delay. The framework_id is required because prioritisation without a declared scoring lens is incoherent. Cartographic sense: you have a set of charted destinations and you are computing the order of arrival from a chosen vantage. Different frameworks weight the same candidate set differently; the approach delegates the actual ranking math to the named technique (the framework definition).',
  question_answered: "what's most important?",
  signature_hint:
    '({ candidates: entity_ids[], framework_id }) → { ranked: [{ entity_id, score, rationale }], framework_used }',
  framework_id_examples: [
    'rice-scoring',
    'ice-scoring',
    'kano-model',
    'cost-of-delay',
    'moscow',
    'wsjf',
  ],
}

// ─── Trace ──────────────────────────────────────────────────────────────────

const TRACE: UPGApproach = {
  id: 'trace',
  label: 'Trace',
  description:
    'The path of arrival to "walk a meaningful path through existing graph". Trace engages an anchor entity and follows a path expressed as a UPGEntityType[] shorthand. Example: `["persona", "job", "feature"]` walks persona→job→feature using the canonical edge for each pair (resolved via `resolve_edge_for_pair`). An optional `edges_override` array selects non-canonical edges per hop when a pair has multiple resolutions. Cartographic sense: you are tracing a route across charted terrain; anchor is the departure, path is the heading sequence, the canonical edges are the roads. No DSL invented; the shorthand IS the path expression.',
  question_answered: "walk a meaningful path through existing graph",
  signature_hint:
    '({ anchor: entity_id, path: UPGEntityType[], edges_override?: (string | null)[] }) → { trail: [{ depth, entity_id, edge_type_in }], reached: entity_id[] }',
  framework_id_examples: [
    'opportunity-solution-tree',
    'strategic-cascade',
    'metrics-tree',
    'user-journey-map',
    'impact-map',
    'dependency-map',
  ],
}

// ─── Reflect ────────────────────────────────────────────────────────────────

const REFLECT: UPGApproach = {
  id: 'reflect',
  label: 'Reflect',
  description:
    'The path of arrival to "what should I be questioning?". Reflect engages an optional scope (region, entity, or `null` for the whole graph) and emits structured prompts a thinker should consider: assumptions to test, alternatives to weigh, blind-spots to surface, load-bearing claims to verify. Mode is optional; absence is open reflection. Cartographic sense: before approaching the coastline, you are asking which features of your chart you have not actually verified; the prompts mark the parts of the map that may be conjecture. Five Whys, Pre-mortem, Red Team, and Devil\'s Advocate are the named techniques inside this approach.',
  question_answered: "what should I be questioning?",
  signature_hint:
    "({ scope?: UPGRegionId | entity_id | null, mode?: 'assumptions' | 'alternatives' | 'blind-spots' | 'load-bearing' }) → { prompts: [{ kind, question, target_entities? }] }",
  framework_id_examples: [
    // Reflection classics: the five canonical reflect frameworks.
    'five-whys',
    'pre-mortem',
    'red-team',
    'devils-advocate',
    'second-order-thinking',
    // Reflective ceremonies + reflective JTBD lens already in the catalog.
    'retrospective',
    'four-forces-of-progress',
    'assumption-canvas',
    'win-loss-analysis',
  ],
}

// ─── Catalog ────────────────────────────────────────────────────────────────

/**
 * The five canonical approaches. Order is the cognitive flow.
 *
 * `as const` keeps the array length and ids in the type system so consumers
 * that pin against `UPG_APPROACHES.length === 5` get a compile-time guarantee.
 */
export const UPG_APPROACHES = [PLAN, INSPECT, PRIORITISE, TRACE, REFLECT] as const

/** O(1) lookup by id. */
export const UPG_APPROACHES_BY_ID: Record<string, UPGApproach> = Object.fromEntries(
  UPG_APPROACHES.map((a) => [a.id, a]),
)
