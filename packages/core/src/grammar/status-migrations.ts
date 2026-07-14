/**
 * UPG Status Migrations. Maps legacy status values to canonical lifecycle
 * phases per entity type, surfacing automated cleanup for the largest single
 * drift class in real product graphs.
 *
 * Sibling to `migrations.ts`. The other migration maps (`UPG_MIGRATIONS`,
 * `UPG_PROPERTY_MIGRATIONS`, `UPG_EDGE_MIGRATIONS`, `UPG_SPLIT_MIGRATIONS`)
 * cover entity-type renames, property-shape evolution, edge-key retargeting,
 * and 1→N splits respectively. This map fills the remaining axis: when a
 * type's lifecycle exists but the graph carries pre-canonical status values
 * the lifecycle never had.
 *
 * Source: live drift in `.upg/entopo.upg`, `.upg/nimbus.upg`, and
 * `.upg/inkling.upg` surveyed during the v0.5 launch train.
 * Highest single drift class: 173 `service` nodes with `status: "active"`
 * against the canonical `[development, staging, production, deprecated]`
 * lifecycle.
 *
 * https://unifiedproductgraph.org/spec | MIT
 */

import type { UPGEntityType } from '../catalog/entity-catalog.js'
import { getLifecycleForType } from './lifecycles.js'

/**
 * Per-entity-type map of legacy status values to canonical lifecycle phases.
 *
 * Each top-level key is an entity type; each inner key is a legacy status
 * value observed in real graphs; the value is the canonical phase id from
 * that type's lifecycle. Entity types absent from this map have no
 * registered status migration; `migrateStatusValue` returns `null` for
 * them, signalling "no automated fix; surface to operator".
 *
 * **Population strategy.** Only mappings that are unambiguous from observed
 * usage are included. Where a legacy value could plausibly map to two
 * different canonical phases, the type is left empty rather than guessing.
 *
 * **Why this is a map of maps rather than a list of rules.** Status values
 * are entity-type-scoped: `"active"` means different things on `service`,
 * `feature`, and `hypothesis`. A flat `[{ from, to, type }]` list would
 * force every lookup to filter; a map of maps gives O(1) `[type][value]`
 * lookup and makes the per-type registry obvious to readers.
 */
export const UPG_STATUS_MIGRATIONS: Partial<Record<UPGEntityType, Record<string, string>>> = {
  // ── Engineering / Operations ─────────────────────────────────────────────
  service: {
    // Lifecycle: [development, staging, production, deprecated]
    // Authoring habit from before lifecycle adoption: every long-lived
    // entity got `active`. For a service, "active" almost always means
    // "live in production" (operators don't tag dev or staging services
    // active).
    active: 'production',
    live: 'production',
    inactive: 'deprecated',
    retired: 'deprecated',
  },

  // ── Product Specification ────────────────────────────────────────────────
  feature: {
    // Lifecycle: [proposed, in_progress, shipped, archived]
    // `active` on a feature is ambiguous between in_progress + shipped;
    // for legacy graphs the most common authoring intent is "this feature
    // is live", which maps to shipped.
    active: 'shipped',
    live: 'shipped',
    done: 'shipped',
    completed: 'shipped',
    inactive: 'archived',
    retired: 'archived',
    deprecated: 'archived',
  },

  feature_area: {
    // Lifecycle: [planned, active, deprecated]
    // `active` IS canonical here, included as an identity mapping so
    // callers don't accidentally re-rewrite it, AND so the only other
    // observed drift values have a target.
    live: 'active',
    inactive: 'deprecated',
    retired: 'deprecated',
  },

  // ── Discovery & Validation ───────────────────────────────────────────────
  // (hypothesis moved to the VALIDATION template fold section below, 0.21.0)
  opportunity: {
    // Lifecycle: [identified, validated, deferred]  (no terminal phases)
    // Common authoring leftovers from pre-canonical Lean Canvas
    // vocabularies.
    new: 'identified',
    open: 'identified',
    discovered: 'identified',
    parked: 'deferred',
    archived: 'deferred',
  },

  initiative: {
    // Lifecycle: [proposed, in_progress, completed, abandoned]
    active: 'in_progress',
    running: 'in_progress',
    done: 'completed',
    shipped: 'completed',
    cancelled: 'abandoned',
    deferred: 'abandoned',
  },

  // ── Decisions: APPROVAL template ─────────────────────────────────────────
  decision: {
    // Lifecycle (APPROVAL): [proposed, reviewing, approved, rejected, deprecated]
    open: 'proposed',
    draft: 'proposed',
    pending: 'reviewing',
    in_review: 'reviewing',
    accepted: 'approved',
    declined: 'rejected',
    superseded: 'deprecated',
  },

  // ── Engineering: deployment ──────────────────────────────────────────────
  deployment: {
    // Lifecycle: [rolling, success, failure]
    // Deployments are events; once terminal they don't move. Most legacy
    // values describe a settled outcome.
    in_progress: 'rolling',
    deploying: 'rolling',
    completed: 'success',
    succeeded: 'success',
    done: 'success',
    failed: 'failure',
    rolled_back: 'failure',
  },

  // ── DevOps: monitor (OPERATIONAL template) ───────────────────────────────
  monitor: {
    // Lifecycle (OPERATIONAL): [planning, active, paused, completed, sunset]
    inactive: 'paused',
    disabled: 'paused',
    archived: 'sunset',
    retired: 'sunset',
  },

  // ── VALIDATION template fold (0.21.0) ───────────────────────────
  // Bespoke claim vocabularies remapped onto VALIDATION
  // [untested, testing, validated, invalidated, archived].
  // `assumption` already matches (untested, testing, validated, invalidated) —
  // no migration entry needed.
  prototype: {
    // was [untested, testing, passed, failed]
    passed: 'validated',
    failed: 'invalidated',
  },
  value_proposition: {
    // was [drafted, testing, validated, invalidated]
    drafted: 'untested',
  },
  hypothesis: {
    // was [drafted, active, validated, invalidated, archived] (HYPOTHESIS_CLAIM
    // const, re-homed to entity_type 'hypothesis' at v0.4.0). The legacy
    // pre-v0.2.8 [untested, testing, resolved] mapping already lived here; it is
    // now consistent with the VALIDATION spine.
    drafted: 'untested',
    active: 'testing',
    // pre-v0.2.8 legacy values (kept from the prior hypothesis migration):
    proposed: 'untested',
    deferred: 'archived',
    resolved: 'validated', // ambiguous historically; prefer validated on resolve
  },

  // ── STUDY template fold (0.21.0) ────────────────────────────────
  // Bespoke run/study vocabularies remapped onto STUDY
  // [planned, running, analysing, complete, abandoned].
  experiment: {
    // was [planned, running, analysing, done]
    done: 'complete',
  },
  experiment_run: {
    // was [in_progress, complete, aborted]
    in_progress: 'running',
    aborted: 'abandoned',
  },
  research_study: {
    // was [planned, in_progress, analysing, complete]
    in_progress: 'running',
  },
  design_sprint: {
    // was [planning, in_progress, completed]
    planning: 'planned',
    in_progress: 'running',
    completed: 'complete',
  },
  feasibility_study: {
    // was [scoped, analysing, concluded, abandoned]
    scoped: 'planned',
    concluded: 'complete',
  },
  ai_experiment: {
    // was [planned, running, analysed, completed, abandoned]
    analysed: 'analysing',
    completed: 'complete',
  },
  eval_run: {
    // was [planned, running, complete, failed]. `failed` = the run did not
    // finish cleanly (errored / killed) → abandoned. A completed run whose
    // result was negative stays `complete` (the verdict lives elsewhere).
    failed: 'abandoned',
  },

  // ── INCIDENT template fold (0.21.0) ─────────────────────────────
  // Bespoke triage vocabularies remapped onto INCIDENT
  // [open, triaged, in_progress, resolved, closed, wont_fix]. `incident` itself
  // is NOT folded (stays bespoke; see the DevOps entry below).
  support_ticket: {
    // was [opened, triaged, in_progress, resolved, closed]
    opened: 'open',
  },
  bug: {
    // was [open, in_progress, fixed, verified, wont_fix]
    fixed: 'in_progress', // fixed-but-not-verified is still work in progress
    verified: 'resolved',
  },
  a11y_issue: {
    // was [open, triaged, in_progress, fixed, verified, accepted]
    fixed: 'in_progress',
    verified: 'resolved',
    accepted: 'resolved', // verified-and-accepted == resolved
  },
  vulnerability: {
    // was [open, triaged, in_progress, mitigated, resolved, accepted]
    mitigated: 'in_progress', // mitigation applied, not yet fully resolved
    accepted: 'resolved',
  },
  hallucination_report: {
    // was [reported, investigating, resolved, accepted]
    reported: 'open',
    investigating: 'in_progress',
    accepted: 'resolved',
  },
  technical_debt_item: {
    // was [identified, acknowledged, in_progress, resolved, accepted]
    identified: 'open',
    acknowledged: 'triaged',
    accepted: 'resolved',
  },
  customer_feedback: {
    // was [received, triaged, actioned, acknowledged]
    received: 'open',
    actioned: 'resolved',
    acknowledged: 'closed', // noted with no action == administratively closed
  },

  // ── DevOps: incident (stays bespoke — richer SRE flow, not folded) ────────
  incident: {
    // Lifecycle: [detected, triaged, contained, resolved, mitigated]
    open: 'detected',
    new: 'detected',
    investigating: 'triaged',
    in_progress: 'triaged',
    closed: 'resolved',
    fixed: 'resolved',
  },

  // ── UX/Design: screen ( Q3/D.3, 0.21.0) — MATURITY → build-pipeline
  // flip. Old lifecycle [alpha, beta, ga, deprecated]; new SCREEN_LIFECYCLE
  // [draft, in_design, built, shipped, deprecated]. `deprecated` IS canonical
  // in both (no rewrite needed); omitted per the no-identity-entries doctrine
  // (see status-migrations.test.ts).
  screen: {
    alpha: 'built',
    beta: 'shipped',
    ga: 'shipped',
  },
}

/**
 * Look up the canonical replacement for a legacy status value on the given
 * entity type. Returns `null` when no migration is registered.
 *
 * Caller contract: only invoke when the current status is known-invalid
 * for the entity's lifecycle. `null` signals "no automated fix is on
 * file; surface to the operator". The presence of a mapping does NOT
 * imply the current status is invalid; checking validity is the caller's
 * job (typically via `getLifecycleForType(entityType).phases`).
 *
 * @example
 * migrateStatusValue('service', 'active')      // → 'production'
 * migrateStatusValue('service', 'unknown_val') // → null
 * migrateStatusValue('persona', 'active')      // → null (no map registered)
 */
export function migrateStatusValue(
  entityType: string,
  currentStatus: string,
): string | null {
  const typeMap = (UPG_STATUS_MIGRATIONS as Record<string, Record<string, string> | undefined>)[entityType]
  if (!typeMap) return null
  return typeMap[currentStatus] ?? null
}

/**
 * Return true when the (entityType, currentStatus) pair has a registered
 * canonical replacement that ALSO differs from the current value.
 *
 * Useful for filter predicates: callers usually only care about migrations
 * that would actually mutate the node. An identity mapping
 * (`active → active` on `feature_area`) is a registered migration but
 * shouldn't trigger a rewrite.
 */
export function hasStatusMigration(
  entityType: string,
  currentStatus: string,
): boolean {
  const replacement = migrateStatusValue(entityType, currentStatus)
  return replacement !== null && replacement !== currentStatus
}

/**
 * Audit helper: enumerate every (entityType, legacyStatus, canonicalStatus)
 * triple in the registry. Useful for changelogs, doc generation, and
 * spec-coverage tests.
 */
export function listStatusMigrations(): Array<{
  entity_type: string
  from: string
  to: string
}> {
  const out: Array<{ entity_type: string; from: string; to: string }> = []
  for (const [entityType, map] of Object.entries(UPG_STATUS_MIGRATIONS)) {
    if (!map) continue
    for (const [from, to] of Object.entries(map)) {
      out.push({ entity_type: entityType, from, to })
    }
  }
  return out
}

/**
 * Spec-coherence helper: returns the entity types in
 * `UPG_STATUS_MIGRATIONS` whose registered canonical replacements are NOT
 * valid phases in the type's lifecycle. Used by the spec-integrity test to
 * catch drift between the migration map and the lifecycle catalog.
 *
 * An empty array means every replacement target resolves to a real phase.
 * Entries here mean either:
 *
 *   - the lifecycle changed but the migration map was not updated, OR
 *   - the lifecycle is missing entirely (template-generated types whose
 *     template id moved).
 *
 * Both cases are spec defects worth surfacing.
 */
export function findInvalidStatusMigrationTargets(): Array<{
  entity_type: string
  from: string
  to: string
  reason: 'no_lifecycle' | 'unknown_phase'
}> {
  const out: Array<{
    entity_type: string
    from: string
    to: string
    reason: 'no_lifecycle' | 'unknown_phase'
  }> = []
  for (const [entityType, map] of Object.entries(UPG_STATUS_MIGRATIONS)) {
    if (!map) continue
    const lifecycle = getLifecycleForType(entityType)
    if (!lifecycle) {
      for (const [from, to] of Object.entries(map)) {
        out.push({ entity_type: entityType, from, to, reason: 'no_lifecycle' })
      }
      continue
    }
    const validPhases = new Set(lifecycle.phases.map((p) => p.id))
    for (const [from, to] of Object.entries(map)) {
      if (!validPhases.has(to)) {
        out.push({ entity_type: entityType, from, to, reason: 'unknown_phase' })
      }
    }
  }
  return out
}
