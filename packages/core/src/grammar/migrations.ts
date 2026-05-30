/**
 * UPG Schema Migrations. Version-scoped maps for type renames, merges, and deprecations.
 * https://unifiedproductgraph.org/spec | MIT
 */

// ─── Migration map per version ─────────────────────────────────────────────────

export interface UPGTypeMigration {
  /** The old type name being retired */
  from: string
  /** The new canonical type name */
  to: string
  /** Default designation/property values to set on migrated nodes */
  defaults?: Record<string, unknown>
  /** Human-readable explanation of why this migration exists */
  reason: string
}

/**
 * Version-scoped migration definitions.
 * Key is the version that INTRODUCES the migration (target version).
 * Each entry describes how an old type maps to a new canonical type.
 */
export const UPG_MIGRATIONS: Record<string, UPGTypeMigration[]> = {
  '0.7.0': [
    // (since v0.7.0) story_statement → user_story. The v0.2.7 split
    // correctly separated the templated promise from the engineering work
    // (task), but renamed the surviving statement half to the coined
    // `story_statement`. "User story" is the universally-recognised industry
    // term for exactly that artefact, and UPG's value is being the recognisable
    // canonical vocabulary; the statement is re-canonicalised under
    // `user_story`. Lifecycle-free, same property surface (as_a / i_want_to /
    // so_that / text); no property migration required. The paired `task` and
    // the `task_implements_*` / `epic_specified_by_*` / `*_verified_by_*` /
    // `test_case_covers_*` edges are renamed in UPG_EDGE_MIGRATIONS['0.7.0'].
    {
      from: 'story_statement',
      to: 'user_story',
      reason: 'story_statement re-canonicalised to user_story. The v0.2.7 Statement/Implementation split was sound (it extracted the lifecycle-bearing work into `task`), but the coined `story_statement` name raised the adoption barrier; "user story" is the industry-standard term for the templated promise. Lifecycle-free, identical property surface (as_a / i_want_to / so_that / text); no property migration needed.',
    },
  ],

  '0.4.0': [
    // (since v0.4.0) hypothesis_claim reverts to hypothesis (the simpler
    // canonical name ("claim" is implied). hypothesis_evidence deprecated
    // in favour of canonical evidence entity.
    {
      from: 'hypothesis_claim',
      to: 'hypothesis',
      reason: 'hypothesis_claim renamed back to hypothesis, the canonical name. The "claim" suffix was redundant; a hypothesis is a claim by definition. Properties (we_believe / will_result_in / we_know_when / risk_if_wrong / current_confidence) are identical; no property migration required.',
    },
    {
      from: 'hypothesis_evidence',
      to: 'evidence',
      reason: 'hypothesis_evidence collapsed into canonical evidence entity. evidence gains evidence_rigor (rigor axis) + evidence_source (source axis) + weight (UPGAssessment) to absorb both property surfaces. Relationship to hypothesis expressed via hypothesis_has_evidence edge.',
    },
    // (since v0.4.0) story_task collapsed into canonical task. Audit showed
    // story_task had no unique properties (estimate absorbed into task), no unique
    // edges (story_task_implements_story_statement → task_implements_story_statement),
    // and identical lifecycle (both use WORK_ITEM_TEMPLATE). The additive-vocabulary
    // rule says: if the second half of a split adds no new shape, reuse the existing
    // type. The user_story replacement updates from story_task to task, and the
    // chain collapses.
    {
      from: 'story_task',
      to: 'task',
      reason: 'story_task collapsed into canonical task. Both use the WORK_ITEM lifecycle, neither carries unique properties (estimate is absorbed into task), and no unique edges (implements_story_statement works on task). When two types share the same shape, the additive-vocabulary rule keeps one.',
    },
  ],

  '0.2.8': [
    // hypothesis decomposes into hypothesis_claim
    // (P5 templated-statement, the stable belief) + hypothesis_evidence
    // (P2 scored-assessment, n rows of accruing evidence). Superseded by
    // the v0.4.0 rename of hypothesis_claim back to hypothesis, which also
    // collapses hypothesis_evidence into evidence. The 1→1 alias below
    // is retained for loaders targeting v0.2.8 files; the '0.4.0' aliases
    // above handle the subsequent hop for any system applying migrations in
    // version order.
    {
      from: 'hypothesis',
      to: 'hypothesis_claim',
      reason: 'hypothesis decomposes into hypothesis_claim (templated belief, lifecycle-bearing) + hypothesis_evidence (n rows of accruing evidence, lifecycle-free). Superseded at v0.4.0 by the rename: hypothesis_claim → hypothesis. Apply migrations in version order; a v0.2.8 file will migrate hypothesis → hypothesis_claim → hypothesis, which resolveEntityType collapses to a single hop.',
    },
  ],

  '0.1.0': [
    // ── User layer: pain_point + user_need → need ──────────────────────────
    {
      from: 'pain_point',
      to: 'need',
      defaults: { valence: 'pain' },
      reason: 'Consolidated into neutral "need" type with valence property. Framework labels provide context-specific display names (Problem in Lean Canvas, Struggle in JTBD, etc.)',
    },
    {
      from: 'user_need',
      to: 'need',
      defaults: { valence: 'gap' },
      reason: 'Consolidated into "need" type. user_need was semantically identical to pain_point with different framing.',
    },

    // ── UX Research: insight consolidation ──────────────────────────────────
    {
      from: 'research_insight',
      to: 'insight',
      defaults: {},
      reason: 'Already deprecated. Research insights are insights with research provenance.',
    },
    {
      from: 'finding',
      to: 'insight',
      defaults: { insight_level: 'finding' },
      reason: 'Already deprecated. Findings are insights at the "finding" level.',
    },
    {
      from: 'ux_insight',
      to: 'insight',
      defaults: { source_domain: 'ux' },
      reason: 'UX insights are insights with source_domain=ux. Not a distinct type.',
    },
    {
      from: 'highlight',
      to: 'observation',
      defaults: { is_highlighted: true },
      reason: 'Already deprecated. Highlights are flagged observations.',
    },

    // ── Metrics consolidation ──────────────────────────────────────────────
    {
      from: 'kpi',
      to: 'metric',
      defaults: { designation: 'kpi' },
      reason: 'KPI is a metric role (designation), not a distinct type. Metric.designation already supports "kpi".',
    },
    {
      from: 'north_star_metric',
      to: 'metric',
      defaults: { designation: 'north_star' },
      reason: 'Already deprecated. North star is a metric designation.',
    },
    {
      from: 'input_metric',
      to: 'metric',
      defaults: { designation: 'input' },
      reason: 'Already deprecated. Input metric is a metric designation.',
    },
    {
      from: 'metric_definition',
      to: 'metric',
      defaults: { has_implementation: false },
      reason: 'A metric definition is a metric without implementation. Lifecycle property, not a separate type.',
    },

    // ── Experiment consolidation ────────────────────────────────────────────
    {
      from: 'ab_test',
      to: 'experiment_run',
      defaults: { experiment_type: 'ab_test' },
      reason: 'A/B test is an experiment_run with method=a_b_test. The run carries actual lift, observed reach, and disposition. retargeted from `experiment` to `experiment_run` (each is a run instance, not a planning artefact).',
    },
    {
      from: 'growth_experiment',
      to: 'experiment_run',
      defaults: { experiment_type: 'growth' },
      reason: 'Growth experiment is an experiment_run in growth context. retargeted from `experiment` to `experiment_run` to give loaders a single retarget hop instead of two-hopping through deprecated `experiment`.',
    },
    {
      from: 'pricing_experiment',
      to: 'experiment_run',
      defaults: { experiment_type: 'pricing' },
      reason: 'Pricing experiment is an experiment_run about pricing. retargeted from `experiment` to `experiment_run` (the run is where the data lives).',
    },

    // ── Cross-domain consolidations ────────────────────────────────────────
    {
      from: 'risk_item',
      to: 'risk',
      defaults: { risk_domain: 'program' },
      reason: 'risk_item (Program Mgmt) is identical to risk (Legal). Consolidated with risk_domain property.',
    },
    {
      from: 'security_incident',
      to: 'incident',
      defaults: { incident_type: 'security' },
      reason: 'Security incident is an incident with incident_type=security. Same structure, different context.',
    },
    {
      from: 'defect_report',
      to: 'support_ticket',
      defaults: { ticket_designation: 'defect' },
      reason: 'Defect report is a support ticket with ticket_designation=defect. Same signal interface.',
    },
    {
      from: 'onboarding_flow',
      to: 'user_flow',
      defaults: { flow_type: 'onboarding' },
      reason: 'Onboarding flow is a user flow with flow_type=onboarding. Same structure.',
    },
    {
      from: 'nps_score',
      to: 'nps_campaign',
      defaults: {},
      reason: 'NPS score demoted to a property of nps_campaign, not a standalone entity.',
    },
  ],

  // v0.2.6: no 1→1 type renames. The experiment split
  // is purely additive in v0.2.6 (new entity types `experiment_plan` +
  // `experiment_run` and 4 new edges). The 1→N split rule for migrating
  // legacy `experiment` rows lives in UPG_SPLIT_MIGRATIONS['0.2.6'] below.
  // The 1→1 alias from `experiment` to its canonical replacement is
  // deferred to v0.2.7 alongside the broader deprecation + edge retarget
  // pass.

  '0.2.0': [
    // ── User layer: jtbd → job ──────────────────────────────────────────────
    {
      from: 'jtbd',
      to: 'job',
      reason: 'Renamed for clarity. "job" is the standard JTBD shorthand; "jtbd" was the framework acronym used as a type name.',
    },

    // ── Design layer: how_might_we → design_question ────────────────────────
    {
      from: 'how_might_we',
      to: 'design_question',
      reason: 'Renamed to a framework-neutral name. "how_might_we" was HMW-format specific; design_question covers all design-framing question types.',
    },

    // ── Decision consolidation ──────────────────────────────────────────────
    {
      from: 'design_decision',
      to: 'decision',
      defaults: { layer: 'design' },
      reason: 'design_decision is a decision with layer=design. Consolidated into the single decision type with layer property.',
    },
    {
      from: 'architecture_decision',
      to: 'decision',
      defaults: { layer: 'engineering' },
      reason: 'architecture_decision is a decision with layer=engineering. Consolidated into the single decision type with layer property.',
    },
    {
      from: 'product_decision',
      to: 'decision',
      defaults: { layer: 'product' },
      reason: 'product_decision is a decision with layer=product. Consolidated into the single decision type with layer property.',
    },

    // ── DevOps: acronym expansions ──────────────────────────────────────────
    {
      from: 'sli',
      to: 'service_level_indicator',
      reason: 'Expanded from acronym to full name for readability and discoverability.',
    },
    {
      from: 'slo',
      to: 'service_level_objective',
      reason: 'Expanded from acronym to full name for readability and discoverability.',
    },
    {
      from: 'sla',
      to: 'service_level_agreement',
      reason: 'Expanded from acronym to full name for readability and discoverability.',
    },

    // ── Business Model: _bm suffix removal ────────────────────────────────
    {
      from: 'customer_segment_bm',
      to: 'market_segment',
      reason: 'Removed _bm suffix. Originally renamed to target_customer_segment, then consolidated into market_segment in v0.2.0.',
    },
    {
      from: 'channel_bm',
      to: 'distribution_channel',
      reason: 'Removed _bm suffix. Renamed to distribution_channel, which is more descriptive than the abbreviation.',
    },

    // ── Growth domain: disambiguate generic names ──────────────────────────
    {
      from: 'campaign',
      to: 'growth_campaign',
      reason: 'Too generic; conflicted with marketing_campaign_plan and nps_campaign. Prefixed with growth to clarify domain scope.',
    },
    {
      from: 'segment',
      to: 'behavioral_segment',
      reason: 'Too generic; conflicted with market_segment and target_customer_segment. Renamed to behavioral_segment to clarify this is a behaviour-based user slice.',
    },

    // ── Pricing consolidation ───────────────────────────────────────────
    {
      from: 'package',
      to: 'pricing_tier',
      reason: 'Package and pricing_tier describe the same concept (the plan a customer buys). Consolidated into pricing_tier as the central pricing entity.',
    },

    // ── GTM restructure ─────────────────────────────────────────────
    {
      from: 'target_customer_segment',
      to: 'market_segment',
      reason: 'Target customer segment and market segment describe the same concept, a slice of the addressable market. Consolidated into market_segment.',
    },

    // ── Content consolidation ───────────────────────────────────────
    {
      from: 'internal_doc',
      to: 'document',
      reason: 'Internal doc is a document with audience=internal. Consolidated into document with expanded document_type enum.',
    },
  ],
}

// ─── Migration helpers ─────────────────────────────────────────────────────────

/**
 * Compare two semver-style version strings of the form `MAJOR.MINOR.PATCH`.
 *
 * Returns a negative number if `a < b`, zero if `a === b`, positive if `a > b`.
 * Components are compared numerically (e.g. `0.2.11` is greater than `0.2.8`,
 * not less; naive string comparison gets this backwards because `'11' < '8'`
 * lexicographically).
 *
 * Used by every range-filtered migration helper below
 * (`getMigrationMap`, `getAllMigrations`, `getPropertyMigrations`,
 * `getSplitMigrations`, `getUPGEdgeMigrations`, `migrateNodeProperties`).
 *
 * Previously, those helpers used raw string comparison and silently dropped
 * every v0.2.7+v0.2.8 rule once `UPG_VERSION` crossed `0.2.10` fix.
 *
 * @example
 * compareVersions('0.2.8', '0.2.11')  // → negative (0.2.8 < 0.2.11)
 * compareVersions('0.2.11', '0.2.8')  // → positive (0.2.11 > 0.2.8)
 * compareVersions('0.2.0', '0.2.0')   // → 0
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10))
  const pb = b.split('.').map((n) => Number.parseInt(n, 10))
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0
    const db = pb[i] ?? 0
    if (Number.isNaN(da) || Number.isNaN(db)) {
      // Fall back to string comparison for non-numeric components (e.g. pre-release tags).
      const sa = a.split('.')[i] ?? ''
      const sb = b.split('.')[i] ?? ''
      if (sa < sb) return -1
      if (sa > sb) return 1
      continue
    }
    if (da !== db) return da - db
  }
  return 0
}

/** True if `version` is in the half-open range `(fromVersion, toVersion]`. */
function versionInRange(version: string, fromVersion: string, toVersion: string): boolean {
  return compareVersions(version, fromVersion) > 0 && compareVersions(version, toVersion) <= 0
}

/**
 * Build a flat old→new type name map for a specific version upgrade.
 * Used by TYPE_ALIASES and .upg file readers.
 *
 * @example
 * // Upgrading from v0 (pre-UPG) to v0.2.0: collect every type rename.
 * const map = getMigrationMap('0.0.0', '0.2.0')
 * // map.pain_point === 'need'
 * // map.jtbd       === 'job'
 * // map.package    === 'pricing_tier'
 */
export function getMigrationMap(
  fromVersion: string,
  toVersion: string,
): Record<string, string> {
  const map: Record<string, string> = {}
  // Collect all migrations between fromVersion and toVersion
  for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
    if (versionInRange(version, fromVersion, toVersion)) {
      for (const m of migrations) {
        map[m.from] = m.to
      }
    }
  }
  return map
}

/**
 * Apply migrations to a single node, converting its type and
 * merging default properties.
 *
 * `T` is the caller's node shape, typically `UPGBaseNode` or a narrower
 * app-specific node type. The constraint (`{ type: string; properties?: ... }`)
 * keeps the function node-library-agnostic so adapters, CLI tools, and test
 * fixtures can all reuse it without coupling to `UPGBaseNode` directly.
 *
 * @example
 * // Legacy deprecated type migrates to its canonical replacement.
 * const legacy = { id: 'n1', type: 'pain_point', properties: { description: 'Onboarding is slow' } }
 * const migrated = migrateNode(legacy, '0.0.0', '0.1.0')
 * // migrated.type               === 'need'
 * // migrated.properties.valence === 'pain'       // merged default
 * // migrated.properties.description === 'Onboarding is slow'  // original preserved
 *
 * @example
 * // Non-deprecated type passes through; return shape preserves T.
 * const healthy = { id: 'n2', type: 'persona', properties: { is_primary: true } }
 * const same = migrateNode(healthy, '0.0.0', '0.1.0')
 * // same === healthy  (referentially unchanged)
 */
export function migrateNode<T extends { type: string; properties?: Record<string, unknown> }>(
  node: T,
  fromVersion: string,
  toVersion: string,
): T {
  const migrations = getAllMigrations(fromVersion, toVersion)
  const migration = migrations.find((m) => m.from === node.type)
  if (!migration) return node

  return {
    ...node,
    type: migration.to,
    properties: {
      ...migration.defaults,
      ...node.properties,
    },
  }
}

/**
 * Get all migration entries between two versions.
 */
function getAllMigrations(fromVersion: string, toVersion: string): UPGTypeMigration[] {
  const result: UPGTypeMigration[] = []
  for (const [version, migrations] of Object.entries(UPG_MIGRATIONS)) {
    if (versionInRange(version, fromVersion, toVersion)) {
      result.push(...migrations)
    }
  }
  return result
}

/**
 * Get all deprecated type names (across all versions) as a flat set.
 * Useful for validation warnings.
 *
 * @example
 * const deprecated = getDeprecatedTypes()
 * deprecated.has('pain_point')    // → true (consolidated into 'need')
 * deprecated.has('jtbd')          // → true (renamed to 'job')
 * deprecated.has('persona')       // → false (still canonical)
 */
export function getDeprecatedTypes(): Set<string> {
  const deprecated = new Set<string>()
  for (const migrations of Object.values(UPG_MIGRATIONS)) {
    for (const m of migrations) {
      deprecated.add(m.from)
    }
  }
  return deprecated
}

// ─── Property migrations ──────────────────────────────────
//
// When a type's property surface shifts (drops, renames at the top level,
// lifts from `properties` to top-level `UPGBaseNode` slots, or self-referential
// cleanup), `UPGPropertyMigration` records the change so loaders can clean up
// existing data with one consistent contract instead of each consumer
// inventing its own rules.
//
// History:
// - (v0.2.2) split `metric`: 14 intra-`properties` drops.
// - (v0.2.8) drop `hypothesis.properties.we_test_by`.
// - (v0.2.13) extended to a discriminated union covering top-level
//   field drift surfaced by Wave 3 dogfood: `lifecycle_status → status`,
//   `properties.stage → status` lift, self-referential `source_id` /
//   `source_type` cleanup.
// - (v0.2.14) widen `rename_top_level` to `outcome` (167 residual
//   top_level_drift rows in unified-product-graph.upg after v0.2.13 pass).
//
// **Discriminated-union contract.** Each rule carries a `kind` discriminator
// mirroring `UPGEdgeMigration`. The four kinds are
// orthogonal; a rule does one thing. Compose multiple rules per (version,
// type) when more than one kind applies.

/**
 * A property-level migration applied at load time.
 *
 * Discriminated by `kind`:
 *
 * - `'drop_props'`: remove keys from `node.properties`. The original
 *   shape; the existing v0.2.2 + v0.2.8 entries use this.
 * - `'rename_top_level'`: rename a top-level `UPGBaseNode` field to a
 *   different top-level field, optionally remapping its value. Used when a
 *   pre-canonical custom field (e.g. `lifecycle_status`) shifts to its
 *   canonical slot (`status`).
 * - `'lift_property_to_top_level'`: move a value from `node.properties` to a
 *   top-level field, optionally remapping. Used when a slot that was
 *   pragmatically stuffed in `properties` graduates to a top-level
 *   `UPGBaseNode` slot (e.g. `properties.stage` → top-level `status`).
 * - `'drop_when_self_referential'`: drop top-level fields whose value
 *   equals the node's own `id` or `type` (or another configured
 *   self-reference). Used to clean up redundant round-trip metadata that's
 *   only meaningful when pointing OUT of the node, not at itself.
 */
export type UPGPropertyMigration =
  | {
      kind: 'drop_props'
      /** The entity type whose properties are being migrated. */
      type: string
      /** Property keys to drop from `type.properties`. */
      drop_props: string[]
      /** Human-readable explanation surfaced in load-time warnings. */
      reason: string
    }
  | {
      kind: 'rename_top_level'
      /** The entity type this rule applies to (or `'*'` for all types). */
      type: string
      /** Pre-canonical top-level field name. */
      from: string
      /** Canonical top-level field name. */
      to: string
      /**
       * Optional value remap from old → new. If unset, the value is copied
       * verbatim from `from` to `to`. If set, only entries in the map are
       * remapped; values absent from the map pass through unchanged.
       */
      value_map?: Record<string, string>
      /** Human-readable explanation surfaced in load-time warnings. */
      reason: string
    }
  | {
      kind: 'lift_property_to_top_level'
      /** The entity type this rule applies to (or `'*'` for all types). */
      type: string
      /** Key inside `properties` that should move to top-level. */
      from_property: string
      /** Top-level field that receives the lifted value. */
      to: string
      /** Optional value remap from old → new (same semantics as `rename_top_level`). */
      value_map?: Record<string, string>
      /** Human-readable explanation surfaced in load-time warnings. */
      reason: string
    }
  | {
      kind: 'drop_when_self_referential'
      /** The entity type this rule applies to (or `'*'` for all types). */
      type: string
      /**
       * Top-level fields to inspect. Each is dropped only when its value
       * equals the node's `id` (for fields named like `*_id`) or `type`
       * (for fields named like `*_type`); otherwise preserved.
       */
      fields: string[]
      /** Human-readable explanation surfaced in load-time warnings. */
      reason: string
    }

/**
 * Version-scoped property migrations. Same convention as `UPG_MIGRATIONS`:
 * the key is the version that introduces the migration.
 */
export const UPG_PROPERTY_MIGRATIONS: Record<string, UPGPropertyMigration[]> = {
  // ── v0.8.0: deprecated-property removal pass ───────────────────
  //
  // The seven properties tagged `@deprecated since v0.4.0` that survived the
  // v0.5.0 hygiene pass are removed from the spec in v0.8.0 (a breaking
  // release). Five of the seven already carry a migration:
  //   - `task.task_status` / `bug.bug_status` lift to `UPGBaseNode.status`
  //     (see `UPG_PROPERTY_MIGRATIONS['0.4.0']`, values identical).
  //   - `learning.metric` drops in favour of the `learning_observed_on_metric`
  //     edge (see `UPG_PROPERTY_MIGRATIONS['0.5.0']`).
  // The two remaining property surfaces are migrated here:
  //   - `evidence.strength` (simple `strong | moderate | weak` enum) is
  //     dropped in favour of `weight: UPGAssessment` (scale `weight_5pt`).
  //     Authors carrying the legacy key should copy the value to `weight`
  //     before applying this migration: `strong → 5`, `moderate → 3`,
  //     `weak → 1`, with the old word preserved in `weight.label`.
  //   - `story_task.estimate` / `.effort` / `.priority` drop. `story_task`
  //     itself is deprecated (`UPG_MIGRATIONS['0.4.0']` renames it to the
  //     canonical `task`); the type rename copies every property verbatim,
  //     so the values survive on `task` (`TaskProperties.estimate` /
  //     `.effort` / `.priority`, all live). This rule removes the residue
  //     from any node still typed `story_task` at migration time.
  '0.8.0': [
    {
      kind: 'drop_props',
      type: 'evidence',
      drop_props: ['strength'],
      reason: ' (v0.8.0). evidence.strength was `@deprecated since v0.4.0`; the structured `weight: UPGAssessment` (scale `weight_5pt`) replaces the `strong | moderate | weak` enum to align with the spec-wide scoring pattern. Authors should copy the value to `weight` before applying this migration (strong -> 5, moderate -> 3, weak -> 1; carry the old word in `weight.label`). The migration drops the residue.',
    },
    {
      kind: 'drop_props',
      type: 'story_task',
      drop_props: ['estimate', 'effort', 'priority'],
      reason: ' (v0.8.0). story_task.estimate / .effort / .priority were `@deprecated since v0.4.0`; story_task itself is deprecated (UPG_MIGRATIONS["0.4.0"] renames it to canonical `task`, copying all properties verbatim), so the values survive on TaskProperties.estimate / .effort / .priority (all live). This rule removes the residue from any node still typed `story_task` at migration time.',
    },
  ],

  // ── v0.5.0: deprecation hygiene pass ───────────────────────────
  //
  // Properties tagged `@deprecated since="0.4.0" removeIn="0.5.0"` (and the
  // sibling prose `since v0.4.0, removed in v0.5.0` aliases) are removed
  // from `UPG_PROPERTY_SCHEMA` in v0.5.0. This block migrates existing graphs
  // that still carry the values:
  //
  //   1. `*_status` lifecycle properties → lift to `UPGBaseNode.status` per
  //      `status-convention.md` Rule 1. Value maps preserve every legacy
  //      lifecycle phase verbatim; the property and the canonical slot used
  //      the same enum, so the lift is lossless.
  //   2. Free-text properties replaced by canonical edges (`winner`,
  //      `customer`, `consumers`, `recipients`, `metric`) → drop. The
  //      structural relationship now lives on a typed edge (e.g.
  //      `learning_observed_on_metric`); the free-text echo is residue.
  //   3. Properties renamed to a sibling field (`root_cause.confidence` →
  //      `cause_confidence`; `metric.frequency` → `cadence`;
  //      `key_activity.frequency` / `symptom.frequency` /
  //      `churn_reason.frequency` → `frequency_rating` + `frequency_count` +
  //      `frequency_period`) → drop. The canonical replacements were added
  //      in v0.4.0; the legacy field is removed here.
  //
  // Rule kinds chosen per case: `lift_property_to_top_level` for status
  // lifts, `drop_props` for both free-text-replaced-by-edge and
  // renamed-to-sibling cases. The CHANGELOG entry for v0.5.0 enumerates the
  // full mapping.
  '0.5.0': [
    // ── 1. Status lifts (lift_property_to_top_level) ─────────────────────
    {
      kind: 'lift_property_to_top_level',
      type: 'strategic_theme',
      from_property: 'theme_status',
      to: 'status',
      reason: ' (v0.5.0). theme_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status` per status-convention.md Rule 1. Values (`proposed | active | achieved | abandoned`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'assumption',
      from_property: 'validation_status',
      to: 'status',
      reason: ' (v0.5.0). validation_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`unvalidated | validating | validated | invalidated`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'service',
      from_property: 'service_status',
      to: 'status',
      reason: ' (v0.5.0). service_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`development | staging | production | deprecated`) preserved verbatim. The separate `lifecycle` field (service maturity) stays as a typed property.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'api_contract',
      from_property: 'contract_status',
      to: 'status',
      reason: ' (v0.5.0). api_contract.contract_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`draft | published | deprecated`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'technical_debt_item',
      from_property: 'debt_status',
      to: 'status',
      reason: ' (v0.5.0). debt_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`identified | acknowledged | scheduled | in_progress | resolved`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'investigation',
      from_property: 'investigation_status',
      to: 'status',
      reason: ' (v0.5.0). investigation_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`open | active | paused | resolved | abandoned`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'fix',
      from_property: 'fix_status',
      to: 'status',
      reason: ' (v0.5.0). fix_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`planned | in_progress | deployed | verified | reverted`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'contract',
      from_property: 'contract_status',
      to: 'status',
      reason: ' (v0.5.0). legal.contract.contract_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`draft | in_review | signed | active | expired | terminated`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'threat_model',
      from_property: 'threat_model_status',
      to: 'status',
      reason: ' (v0.5.0). threat_model_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`draft | in_review | approved | stale`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'role',
      from_property: 'role_status',
      to: 'status',
      reason: ' (v0.5.0). role_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`active | backfilling | dormant | retired`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'team_okr',
      from_property: 'okr_status',
      to: 'status',
      reason: ' (v0.5.0). okr_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`draft | committed | active | complete | abandoned`) preserved verbatim.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'partnership',
      from_property: 'partnership_status',
      to: 'status',
      reason: ' (v0.5.0). partnership_status was `@deprecated removeIn="0.5.0"` since v0.4.0; canonical lifecycle belongs on `UPGBaseNode.status`. Values (`proposed | active | paused | ended`) preserved verbatim.',
    },
    // ── 2. Free-text replaced by canonical edges (drop_props) ────────────
    {
      kind: 'drop_props',
      type: 'model_comparison',
      drop_props: ['winner'],
      reason: ' (v0.5.0). model_comparison.winner was `@deprecated removeIn="0.5.0"` since v0.4.0; the canonical edge `model_comparison_winner_is_ai_model` carries the structural relationship. Free-text echo dropped on load.',
    },
    {
      kind: 'drop_props',
      type: 'service_level_agreement',
      drop_props: ['customer'],
      reason: ' (v0.5.0). service_level_agreement.customer was `@deprecated removeIn="0.5.0"` since v0.4.0; the canonical edge `service_level_agreement_covers_account` carries the counterparty relationship. Free-text echo dropped on load.',
    },
    {
      kind: 'drop_props',
      type: 'data_product',
      drop_props: ['consumers'],
      reason: ' (v0.5.0). data_product.consumers was `@deprecated removeIn="0.5.0"` since v0.4.0; the canonical edge `data_product_consumed_by_service` carries each consumer. Free-text echo dropped on load.',
    },
    {
      kind: 'drop_props',
      type: 'report',
      drop_props: ['recipients'],
      reason: ' (v0.5.0). report.recipients was `@deprecated removeIn="0.5.0"` since v0.4.0; the canonical edge `report_distributed_to_team` carries each recipient. Free-text echo dropped on load.',
    },
    {
      kind: 'drop_props',
      type: 'learning',
      drop_props: ['metric'],
      reason: ' (v0.5.0). learning.metric was `@deprecated removeIn="0.5.0"` since v0.4.0; the canonical edge `learning_observed_on_metric` carries the metric relationship. Free-text echo dropped on load.',
    },
    // ── 3. Renamed-to-sibling properties (drop_props) ────────────────────
    {
      kind: 'drop_props',
      type: 'root_cause',
      drop_props: ['confidence'],
      reason: ' (v0.5.0). root_cause.confidence was `@deprecated removed in v0.5.0` since v0.4.0; renamed to `cause_confidence` to disambiguate from the spec-wide `UPGAssessment` confidence axis. Values are unchanged; authors that still carry the legacy key should copy the value to `cause_confidence` before applying this migration. The migration drops the residue.',
    },
    {
      kind: 'drop_props',
      type: 'metric',
      drop_props: ['frequency'],
      reason: ' (v0.5.0). metric.frequency (typed `MetricFrequency`) was `@deprecated removed in v0.5.0` since v0.4.0; replaced by `cadence` (typed `Cadence`). Migration: `realtime → continuous`, all other values map 1:1 to the cadence enum. Authors that still carry the legacy key should copy the value to `cadence` (with the realtime→continuous remap) before applying this migration.',
    },
    {
      kind: 'drop_props',
      type: 'key_activity',
      drop_props: ['frequency'],
      reason: ' (v0.5.0). key_activity.frequency (typed `string`) was `@deprecated removed in v0.5.0` since v0.4.0; replaced by the canonical 4-way frequency split (`cadence`, `frequency_count` + `frequency_period`, or `frequency_rating`).',
    },
    {
      kind: 'drop_props',
      type: 'symptom',
      drop_props: ['frequency'],
      reason: ' (v0.5.0). symptom.frequency was `@deprecated removed in v0.5.0` since v0.4.0; replaced by `frequency_rating` (qualitative tier), `frequency_count` + `frequency_period` (exact rate), or the `Cadence` primitive. Migration of legacy values: `once → rare`, `sporadic → occasional`, `frequent → regular`, `constant → constant`.',
    },
    {
      kind: 'drop_props',
      type: 'churn_reason',
      drop_props: ['frequency'],
      reason: ' (v0.5.0). churn_reason.frequency (typed `number`) was `@deprecated removed in v0.5.0` since v0.4.0; replaced by `frequency_count` + `frequency_period` (exact rate over a known period) or `frequency_rating` (qualitative tier).',
    },
  ],

  '0.4.0': [
    // deprecate task_status + bug_status; lift to UPGBaseNode.status.
    // Values are identical to the canonical lifecycle phases; no value_map needed.
    {
      kind: 'lift_property_to_top_level',
      type: 'task',
      from_property: 'task_status',
      to: 'status',
      value_map: {
        todo:        'todo',
        in_progress: 'in_progress',
        in_review:   'in_review',
        done:        'done',
      },
      reason: 'task_status duplicates UPGBaseNode.status. Canonical lifecycle field wins; property-level shadow deprecated. Values are identical; lift is lossless.',
    },
    {
      kind: 'lift_property_to_top_level',
      type: 'bug',
      from_property: 'bug_status',
      to: 'status',
      value_map: {
        open:        'open',
        in_progress: 'in_progress',
        fixed:       'fixed',
        verified:    'verified',
        wont_fix:    'wont_fix',
      },
      reason: 'bug_status duplicates UPGBaseNode.status. Canonical lifecycle field wins; property-level shadow deprecated. Values are identical; lift is lossless.',
    },
  ],

  '0.2.8': [
    {
      kind: 'drop_props',
      type: 'hypothesis',
      drop_props: [
        // `we_test_by` described the experimental
        // method legacy hypothesis rows intended to use to test themselves.
        // That concept now lives on the paired `experiment_plan.method`
        // (hypothesis_claim links to the plan via
        // `hypothesis_claim_requires_experiment_plan`). Drop the property
        // from legacy nodes during migration; the value can be reconstructed
        // by walking the requires_experiment_plan edge if present, or
        // discarded if no plan was created.
        'we_test_by',
      ],
      reason: 'hypothesis decomposes into hypothesis_claim + hypothesis_evidence. The legacy `we_test_by` property described experimental method, which now lives on the linked experiment_plan.method via the canonical `hypothesis_claim_requires_experiment_plan` edge.',
    },
  ],

  '0.2.2': [
    {
      kind: 'drop_props',
      type: 'metric',
      drop_props: [
        // Moved to metric_quality_assessment. Authors should create
        // a sibling assessment node and link via
        // metric_assessed_by_metric_quality_assessment.
        'quality_correlated', 'quality_actionable', 'quality_sensitive',
        'quality_comparative', 'quality_related', 'quality_score',
        'proxy_reason', 'proxy_confidence', 'proxy_alternatives',
        // Out of canonical spec scope; tool runtime state belongs in
        // tool-extension namespaces (e.g. extensions.entopo.metric_sync).
        'external_metric_id', 'external_query', 'last_synced_at',
        'sync_status', 'sync_error',
      ],
      reason: 'metric decomposed. Quality/proxy props moved to metric_quality_assessment; sync state moved to tool extensions.',
    },
  ],

  // ── top-level field drift surfaced by Wave 3 dogfood ──────────────
  // The two production graphs in this repo (`.upg/entopo.upg` and
  // `.upg/unified-product-graph.upg`) carry pre-canonical node shapes.
  // The four rules below close the drift catalog:
  //
  //   1. `product.properties.stage` (pre-canonical "idea / build /
  //      launched" enum stuffed inside properties) → top-level `status`
  //      (canonical `UPGProductStage` enum: `concept | validation | build |
  //      beta | launch | growth | mature | maintenance | sunset`).
  //   2. `product.lifecycle_status` (pre-canonical top-level field with
  //      "draft / active" values) → top-level `status` with the same
  //      `UPGProductStage` enum.
  //   3. Self-referential `source_id` / `source_type` cleanup; these
  //      fields are for round-trip from external imports (Notion / Linear);
  //      when they self-reference, they're redundant noise.
  //   4. `hypothesis_claim.properties.status` → top-level `status` with
  //      cross-lifecycle remap to the v0.2.8 hypothesis_claim phases.
  //
  // **Conflict resolution within v0.2.13:** rules apply in registry
  // order; for any node carrying BOTH `properties.stage` and
  // `lifecycle_status`, rule #1 lifts first (writes `status` from
  // `stage`), then rule #2 renames lifecycle_status onto `status`,
  // overwriting. `lifecycle_status` wins on conflict because it was
  // the more explicit field at write time (top-level slot >
  // properties-bag slot in pre-v0.2 authoring practice). Production
  // graphs typically carry only one of the two; the conflict path is
  // theoretical but documented for predictability.
  '0.2.13': [
    // 1. Lift properties.stage → status (with value remap to UPGProductStage).
    {
      kind: 'lift_property_to_top_level',
      type: 'product',
      from_property: 'stage',
      to: 'status',
      value_map: {
        // Pre-canonical UPGProductStage aliases from early v0.1 product-node
        // shape. "idea" was the canonical pre-validation phase before the
        // 9-stage UPGProductStage shipped; today that's "concept".
        idea: 'concept',
        // Pass-through: the canonical 9 product stages already exist as
        // UPGProductStage values and need no remap when surfaced inline.
      },
      reason: 'lifecycle phase belongs in top-level `status` per UPGBaseNode contract, not in `properties`. Pre-canonical "idea" alias mapped to canonical `concept` (UPGProductStage[0]).',
    },
    // 2. Rename top-level lifecycle_status → status (with value remap).
    {
      kind: 'rename_top_level',
      type: 'product',
      from: 'lifecycle_status',
      to: 'status',
      value_map: {
        // Pre-canonical lifecycle_status values from early v0.1 product-node
        // shape. Mapped to the closest UPGProductStage equivalent.
        draft: 'concept',
        active: 'launch',
        // archived/retired-style values map to sunset; explicit when seen.
        archived: 'sunset',
        retired: 'sunset',
      },
      reason: '`lifecycle_status` was a pre-canonical top-level field; `UPGBaseNode.status` is the canonical lifecycle slot. Values remapped to UPGProductStage phases.',
    },
    // 3. Drop self-referential source_id / source_type (universal cleanup).
    {
      kind: 'drop_when_self_referential',
      type: '*',
      fields: ['source_id', 'source_type'],
      reason: '`source_id` / `source_type` are round-trip metadata for entities imported from external systems (Notion, Linear). When they equal the node\'s own id/type, they\'re redundant self-references; drop with no information loss.',
    },
    // 4. Lift hypothesis_claim properties.status → top-level status with
    //    cross-lifecycle value remap. Pre-Wave-3
    //    hypothesis nodes carried lifecycle phase in `properties.status`
    //    using the old `untested → testing → resolved` enum. The Wave 3
    //    `migrate_type(hypothesis → hypothesis_claim)` pass renamed the
    //    entity type but left the property bag untouched; legacy
    //    phase values now sit in the wrong slot AND need remapping to
    //    the new hypothesis_claim lifecycle. Value map mirrors the
    //    UPG_SPLIT_MIGRATIONS['0.2.8'] routing table for consistency
    //    (untested→drafted, testing→active, resolved→active fallback,
    //    validated/invalidated identity).
    //
    //    NOTE: type stays 'hypothesis_claim' (not 'hypothesis') because
    //    nodes are typed as hypothesis_claim at v0.2.13 time. The v0.4.0
    //    entity migration later renames hypothesis_claim → hypothesis;
    //    by then the property lift has already been applied.
    {
      kind: 'lift_property_to_top_level',
      type: 'hypothesis_claim',
      from_property: 'status',
      to: 'status',
      value_map: {
        // Legacy hypothesis lifecycle (pre-v0.2.8) → new hypothesis_claim
        // lifecycle (`drafted → active → validated | invalidated | archived`).
        untested: 'drafted',
        testing: 'active',
        // `resolved` was the legacy terminal phase; without an explicit
        // core_state we treat it as `active` (pending the next refinement)
        // matching the UPG_SPLIT_MIGRATIONS routing.
        resolved: 'active',
        // Already-canonical phase values pass through unchanged via the
        // value_map identity entries (explicit so the doctrine is auditable
        // and partial maps don't surprise readers).
        drafted: 'drafted',
        active: 'active',
        validated: 'validated',
        invalidated: 'invalidated',
        archived: 'archived',
      },
      reason: 'pre-Wave-3 hypothesis nodes carried lifecycle phase inside `properties.status` using the legacy `untested → testing → resolved` enum. Wave 3 migrate_type(hypothesis → hypothesis_claim) renamed the entity but left the property untouched. This rule lifts the value to top-level `status` and remaps to the canonical hypothesis_claim lifecycle (drafted | active | validated | invalidated | archived), mirroring UPG_SPLIT_MIGRATIONS["0.2.8"] routing: untested→drafted, testing→active, resolved→active.',
    },
  ],

  // ── v0.2.14: widen `rename_top_level` to cover `outcome` ──────
  //
  // After running `migrate_properties` against unified-product-graph.upg
  // post-v0.2.13, 167 `outcome` nodes remained with a top-level
  // `lifecycle_status` field. The v0.2.13 `rename_top_level` rule was
  // scoped to `type: 'product'` only. The existing DSL stores `type` as a
  // plain string (no array variant), so a parallel rule for `outcome` is the
  // minimum-viable fix; no engine or type changes required.
  '0.2.14': [
    {
      kind: 'rename_top_level',
      type: 'outcome',
      from: 'lifecycle_status',
      to: 'status',
      value_map: {
        // Same value map as the v0.2.13 `product` rule; pre-canonical
        // lifecycle_status values from the v0.1 era.
        draft: 'concept',
        active: 'launch',
        archived: 'sunset',
        retired: 'sunset',
      },
      reason: '`outcome` nodes carried the same pre-canonical `lifecycle_status` top-level field as `product` (v0.1 era). Widening to `outcome` closes the final 167 top_level_drift rows in unified-product-graph.upg. Parallel rule used because the DSL `type` field is a plain string; minimum-viable fix with no engine change.',
    },
  ],
}

/**
 * A single property-migration change applied during `migrateNodeProperties`.
 * Surfaced for one-warning-per-file logging and structured load-time reports.
 */
export type UPGPropertyMigrationChange =
  | { kind: 'dropped'; key: string }
  | { kind: 'renamed_top_level'; from: string; to: string; value_changed: boolean }
  | { kind: 'lifted_to_top_level'; from_property: string; to: string; value_changed: boolean }
  | { kind: 'self_ref_dropped'; field: string }

/**
 * Apply property migrations to a single node. Returns the (possibly new) node
 * along with a structured list of changes so callers can emit warnings,
 * generate audit reports, or skip nodes that don't need rewrites.
 *
 * Operates on top-level `UPGBaseNode` fields (`status`, `lifecycle_status`,
 * `source_id`, `source_type`, …) AND on intra-`properties` keys, dispatching
 * by rule `kind`. The four kinds are orthogonal; rules apply in registry
 * order within a version, and across versions in `(fromVersion, toVersion]`.
 *
 * Backward-compat helper: callers that only care about dropped property keys
 * can derive the old `dropped: string[]` shape via
 * `changes.filter(c => c.kind === 'dropped').map(c => c.key)`.
 *
 * @example
 * // drop_props (unchanged behaviour):
 * const m = { type: 'metric', properties: { quality_score: 4, current_value: 100 } }
 * const { node, changes } = migrateNodeProperties(m, '0.2.0', '0.2.2')
 * // node.properties        === { current_value: 100 }
 * // changes[0].kind        === 'dropped'; changes[0].key === 'quality_score'
 *
 * @example
 * // lift_property_to_top_level:
 * const p = { id: 'p1', type: 'product', properties: { stage: 'idea' } }
 * const { node } = migrateNodeProperties(p, '0.2.12', '0.2.13')
 * // node.status               === 'concept'  (lifted + remapped)
 * // node.properties.stage     === undefined  (removed from properties)
 *
 * @example
 * // drop_when_self_referential (wildcard type):
 * const x = { id: 'x1', type: 'product', source_id: 'x1', source_type: 'product' }
 * const { changes } = migrateNodeProperties(x, '0.2.12', '0.2.13')
 * // changes contains { kind: 'self_ref_dropped', field: 'source_id' }
 * // changes contains { kind: 'self_ref_dropped', field: 'source_type' }
 */
export function migrateNodeProperties<
  T extends {
    id?: string
    type: string
    status?: unknown
    properties?: Record<string, unknown>
    [key: string]: unknown
  },
>(
  node: T,
  fromVersion: string,
  toVersion: string,
): { node: T; changes: UPGPropertyMigrationChange[] } {
  const changes: UPGPropertyMigrationChange[] = []
  // Mutable working copy; only realised back into the result when changes occur.
  let workingNode: Record<string, unknown> = { ...node }
  let mutated = false

  for (const [version, migrations] of Object.entries(UPG_PROPERTY_MIGRATIONS)) {
    if (!versionInRange(version, fromVersion, toVersion)) continue
    for (const m of migrations) {
      if (m.type !== '*' && m.type !== node.type) continue

      switch (m.kind) {
        case 'drop_props': {
          const props = workingNode.properties as Record<string, unknown> | undefined
          if (!props) break
          const next: Record<string, unknown> = {}
          let dirty = false
          for (const [k, v] of Object.entries(props)) {
            if (m.drop_props.includes(k)) {
              changes.push({ kind: 'dropped', key: k })
              dirty = true
            } else {
              next[k] = v
            }
          }
          if (dirty) {
            workingNode.properties = next
            mutated = true
          }
          break
        }

        case 'rename_top_level': {
          if (!(m.from in workingNode)) break
          const oldValue = workingNode[m.from]
          let newValue = oldValue
          if (m.value_map && typeof oldValue === 'string' && oldValue in m.value_map) {
            newValue = m.value_map[oldValue]
          }
          // value_changed reflects actual value mutation, not whether the map
          // had an entry for the input. Identity entries (`'drafted' → 'drafted'`)
          // surface as value_changed: false; the structural change (top-level
          // rename) is signalled by the change kind itself.
          const valueChanged = newValue !== oldValue
          workingNode[m.to] = newValue
          delete workingNode[m.from]
          mutated = true
          changes.push({ kind: 'renamed_top_level', from: m.from, to: m.to, value_changed: valueChanged })
          break
        }

        case 'lift_property_to_top_level': {
          const props = workingNode.properties as Record<string, unknown> | undefined
          if (!props || !(m.from_property in props)) break
          const oldValue = props[m.from_property]
          let newValue = oldValue
          if (m.value_map && typeof oldValue === 'string' && oldValue in m.value_map) {
            newValue = m.value_map[oldValue]
          }
          // See `rename_top_level` above: value_changed reflects mutation,
          // not map-presence. Identity entries surface as false.
          const valueChanged = newValue !== oldValue
          workingNode[m.to] = newValue
          // Remove the property from the inner bag.
          const nextProps: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(props)) {
            if (k !== m.from_property) nextProps[k] = v
          }
          workingNode.properties = nextProps
          mutated = true
          changes.push({ kind: 'lifted_to_top_level', from_property: m.from_property, to: m.to, value_changed: valueChanged })
          break
        }

        case 'drop_when_self_referential': {
          for (const field of m.fields) {
            if (!(field in workingNode)) continue
            const value = workingNode[field]
            // Heuristic: *_id matches the node's id; *_type matches the node's type.
            const isSelfRef =
              (field.endsWith('_id') && typeof value === 'string' && value === node.id) ||
              (field.endsWith('_type') && typeof value === 'string' && value === node.type)
            if (isSelfRef) {
              delete workingNode[field]
              mutated = true
              changes.push({ kind: 'self_ref_dropped', field })
            }
          }
          break
        }
      }
    }
  }

  if (!mutated) return { node, changes }
  return { node: workingNode as T, changes }
}

/**
 * Returns every property migration entry between two versions; useful for
 * load-time warning generation and audit reports.
 */
export function getPropertyMigrations(
  fromVersion: string,
  toVersion: string,
): UPGPropertyMigration[] {
  const result: UPGPropertyMigration[] = []
  for (const [version, migrations] of Object.entries(UPG_PROPERTY_MIGRATIONS)) {
    if (versionInRange(version, fromVersion, toVersion)) {
      result.push(...migrations)
    }
  }
  return result
}

// ─── 1→N split migrations ───────────────────────────────────
//
// When an entity type is **decomposed** into multiple canonical types (not
// renamed (1→1) and not just losing properties (UPG_PROPERTY_MIGRATIONS) but
// genuinely split into N entities linked by canonical edges), `UPGSplitMigration`
// records the rule. First use: experiment → experiment_plan + experiment_run.
//
// **Rule shape: status-routed split (the only `kind` defined today):**
//
// ```
// {
//   kind: 'status_routed',
//   from: 'experiment',
//   status_property: 'status',                  // property to read on source
//   produces: [
//     { ref: 'plan', type: 'experiment_plan', keep_props: [...], defaults: {...} },
//     { ref: 'run',  type: 'experiment_run',  keep_props: [...], defaults: {...} },
//   ],
//   routing: {
//     'draft':     { spawn: ['plan'],          plan: { defaults: { status: 'drafted' } } },
//     'planned':   { spawn: ['plan'],          plan: { defaults: { status: 'scheduled' } } },
//     'running':   { spawn: ['plan', 'run'],   plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'in_progress' } } },
//     'analysing': { spawn: ['plan', 'run'],   plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'in_progress' } } },
//     'done':      { spawn: ['plan', 'run'],   plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'complete' } } },
//     'cancelled': { spawn: ['plan'],          plan: { defaults: { status: 'cancelled' } } },
//     'aborted':   { spawn: ['plan', 'run'],   plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'aborted' } } },
//   },
//   edges: [
//     { source_ref: 'plan', target_ref: 'run', type: 'experiment_plan_ran_as_experiment_run', when: 'both_spawned' },
//   ],
//   reason: '...',
// }
// ```
//
// **Consumer contract.** A loader/migration tool reads the rule, looks up
// the source node's `status_property` value, finds the matching `routing`
// entry, and emits one new node per `spawn` ref + the listed `edges` whose
// `when` condition is satisfied. Each spawned node:
//
// 1. Inherits id strategy: `keep_props` named as `'__id'` preserves source
//    id; otherwise a new uuid is generated. The first spawned ref keeps the
//    source id by default (so legacy references survive).
// 2. Inherits `keep_props` from source.properties (typed-string keys to
//    copy).
// 3. Receives `defaults` merged after the keep, so route-specific defaults
//    win over source values when the field is route-determined (e.g. status).
//
// **Why it lives in spec, not in the MCP server.** The rule is a contract,
// not a runtime. Putting the rule data in `@unified-product-graph/core` lets every consumer
// (mcp-server's `migrate_type` tool, the LSP, adapters, the CLI) execute
// the same translation. Runtime consumers implement the engine that walks
// this data on the MCP side; tests in `@unified-product-graph/core` validate the rule shape.

/** A single produced target within a 1→N split. */
export interface UPGSplitTarget {
  /** Local name (referenced by routing + edges within this rule). */
  ref: string
  /** Canonical entity type to spawn. */
  type: string
  /** Property keys copied from source.properties. Use `'__id'` to inherit source id. */
  keep_props?: readonly string[]
  /** Defaults merged after keep_props (route-specific defaults win). */
  defaults?: Record<string, unknown>
}

/** Per-target route plan: what to spawn and what overrides apply. */
export interface UPGSplitRouteTarget {
  /** Route-specific defaults merged on top of UPGSplitTarget.defaults. */
  defaults?: Record<string, unknown>
}

/** A single routing rule keyed by source status value. */
export interface UPGSplitRoute {
  /** Which target refs to spawn for this status. */
  spawn: readonly string[]
  /**
   * Per-target route overrides. Keys must match `produces[].ref` for
   * targets in `spawn`.
   */
  [targetRef: string]: UPGSplitRouteTarget | readonly string[] | undefined
}

/** A canonical edge to emit between spawned targets, gated by a condition. */
export interface UPGSplitEdge {
  /** Source target ref (from `produces`). */
  source_ref: string
  /** Target target ref (from `produces`). */
  target_ref: string
  /** Edge type key (must exist in UPG_EDGE_CATALOG). */
  type: string
  /**
   * When to emit the edge.
   *
   * - `'both_spawned'`: only emit if both source_ref and target_ref were
   *   spawned by the routing rule.
   * - `'always'`: emit unconditionally (rare; only valid if both refs
   *   appear in every routing entry's `spawn`).
   */
  when: 'both_spawned' | 'always'
}

/** A status-routed 1→N split migration rule. */
export interface UPGSplitMigration {
  /** Discriminator. Only one kind today. */
  kind: 'status_routed'
  /** The deprecated source type being decomposed. */
  from: string
  /** Property name on source.properties whose value drives routing. */
  status_property: string
  /** The N canonical types this rule produces. */
  produces: readonly UPGSplitTarget[]
  /** Per-status routing: keys are values of source[status_property]. */
  routing: Record<string, UPGSplitRoute>
  /** Edges to emit between spawned targets. */
  edges: readonly UPGSplitEdge[]
  /** Human-readable explanation surfaced in load-time warnings. */
  reason: string
}

/**
 * Version-scoped 1→N split migrations. Same convention as `UPG_MIGRATIONS`:
 * the key is the version that introduces the migration.
 */
export const UPG_SPLIT_MIGRATIONS: Record<string, UPGSplitMigration[]> = {
  '0.2.6': [
    // (split 1) experiment → experiment_plan + experiment_run.
    {
      kind: 'status_routed',
      from: 'experiment',
      status_property: 'status',
      produces: [
        {
          ref: 'plan',
          type: 'experiment_plan',
          keep_props: [
            // Plan-shape fields from the legacy experiment.
            '__id', 'method', 'sample_size', 'expected_lift', 'expected_lift_unit',
          ],
          defaults: {},
        },
        {
          ref: 'run',
          type: 'experiment_run',
          keep_props: [
            // Run-shape fields from the legacy experiment.
            'actual_lift', 'start_date', 'end_date',
          ],
          defaults: {},
        },
      ],
      routing: {
        // Pre-run statuses → plan only.
        draft:     { spawn: ['plan'],        plan: { defaults: { status: 'drafted' } } },
        planned:   { spawn: ['plan'],        plan: { defaults: { status: 'scheduled' } } },
        cancelled: { spawn: ['plan'],        plan: { defaults: { status: 'cancelled' } } },
        // In-flight statuses → plan + run, plan settles to approved.
        running:   { spawn: ['plan', 'run'], plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'in_progress' } } },
        analysing: { spawn: ['plan', 'run'], plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'in_progress' } } },
        // Terminal statuses → plan (approved) + run (terminal).
        done:      { spawn: ['plan', 'run'], plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'complete' } } },
        aborted:   { spawn: ['plan', 'run'], plan: { defaults: { status: 'approved' } }, run: { defaults: { status: 'aborted' } } },
      },
      edges: [
        {
          source_ref: 'plan',
          target_ref: 'run',
          type: 'experiment_plan_ran_as_experiment_run',
          when: 'both_spawned',
        },
      ],
      reason:
        'The legacy `experiment` type bundled plan-shape (method, projected reach, success criteria) with run-shape (actual lift, outcome, disposition). The seven status values divided into pre-run (draft/planned/cancelled, plan only), in-flight (running/analysing, plan + run), and terminal (done/aborted, plan + run with run terminal). The plan id keeps the source id so legacy references survive; the run gets a fresh id.',
    },
  ],

  '0.2.7': [
    // (split 2) user_story → story_statement + story_task.
    //
    // Always-spawn-both shape (no status routing; every user_story
    // produces exactly one statement + one task linked by `implements`).
    // The statement carries the "as-a / i-want / so-that" templated
    // promise (lifecycle-free); the task carries the lifecycle and
    // estimation/assignment fields.
    //
    // Every legacy user_story.status value maps to a story_task.status
    // in the WORK_ITEM template; the statement remains lifecycle-free.
    //
    //   user_story.status  → story_task.status
    //   draft              → todo
    //   ready              → todo (acceptance criteria refined; not yet started)
    //   in_progress        → in_progress
    //   done               → done
    {
      kind: 'status_routed',
      from: 'user_story',
      status_property: 'status',
      produces: [
        {
          ref: 'task',
          type: 'task',
          keep_props: [
            // Task-shape fields from the legacy user_story.
            '__id', 'estimate', 'effort', 'priority',
          ],
          defaults: {},
        },
        {
          ref: 'statement',
          type: 'story_statement',
          keep_props: [
            // Statement-shape fields (the templated promise).
            'as_a', 'i_want_to', 'so_that', 'text',
          ],
          defaults: {},
        },
      ],
      routing: {
        // Every legacy status spawns both. The statement is lifecycle-free
        // (no status); only the task takes a status.
        draft:       { spawn: ['task', 'statement'], task: { defaults: { status: 'todo' } } },
        ready:       { spawn: ['task', 'statement'], task: { defaults: { status: 'todo' } } },
        in_progress: { spawn: ['task', 'statement'], task: { defaults: { status: 'in_progress' } } },
        done:        { spawn: ['task', 'statement'], task: { defaults: { status: 'done' } } },
      },
      edges: [
        {
          source_ref: 'task',
          target_ref: 'statement',
          type: 'task_implements_story_statement',
          when: 'both_spawned',
        },
      ],
      reason:
        'The legacy `user_story` type bundled the templated "As X, I want Y so Z" promise (a stable design artefact) with the engineering work to deliver it (a lifecycle-bearing task). Every legacy row produces 1 statement + 1 task linked by `implements`. The task id keeps the source id (legacy references survive); the statement gets a derived id. Statement is lifecycle-free; task uses the WORK_ITEM template.',
    },
  ],

  '0.2.8': [
    // (split 3) hypothesis → hypothesis_claim + hypothesis_evidence.
    //
    // **Always-spawn-claim, never-spawn-evidence-from-legacy** shape.
    // Legacy hypothesis rows only carried the belief properties
    // (we_believe / will_result_in / we_know_when / we_test_by); they
    // never carried inline evidence; evidence was always external,
    // attached via the dropped `evidence_supports_hypothesis` edge from
    // `evidence` rows. So the migration is conceptually a 1→1 rename plus
    // a property cleanup (drop we_test_by, which is about experimental
    // method, which now lives on experiment_plan via
    // `hypothesis_claim_requires_experiment_plan`).
    //
    // The split rule is registered in UPG_SPLIT_MIGRATIONS for symmetry
    // with the other splits and to allow future tools that want to spawn
    // evidence from richer legacy data shapes; the inline applySplit()
    // runner produces a single claim by default.
    //
    // The legacy `untested → testing → resolved (validated|invalidated)`
    // status enum maps to claim lifecycle: untested → drafted, testing →
    // active, resolved → validated|invalidated based on the resolved
    // core_state. archived has no legacy equivalent (claim-specific).
    {
      kind: 'status_routed',
      from: 'hypothesis',
      status_property: 'status',
      produces: [
        {
          ref: 'claim',
          type: 'hypothesis',
          keep_props: [
            // Statement-shape fields preserved byte-for-byte.
            '__id', 'we_believe', 'will_result_in', 'we_know_when',
          ],
          defaults: {},
        },
      ],
      routing: {
        untested:    { spawn: ['claim'], claim: { defaults: { status: 'drafted' } } },
        testing:     { spawn: ['claim'], claim: { defaults: { status: 'active' } } },
        // legacy `resolved` had two core_states (validated/invalidated); the
        // routing key matches the resolved core_state directly when present
        // (loaders emit those as the status value).
        validated:   { spawn: ['claim'], claim: { defaults: { status: 'validated' } } },
        invalidated: { spawn: ['claim'], claim: { defaults: { status: 'invalidated' } } },
        // Catch-all for `resolved` without a core_state; treat as active
        // pending the resolver call to decide validated/invalidated.
        resolved:    { spawn: ['claim'], claim: { defaults: { status: 'active' } } },
      },
      // No edges emitted; the supports/refutes/derived_from edges all
      // attach hypothesis_evidence rows that legacy hypothesis nodes did
      // NOT have. Evidence migration is consumer-driven (Entopo/MCP can
      // walk the dropped `evidence_supports_hypothesis` edges and spawn
      // hypothesis_evidence rows; but that's adapter logic, not spec
      // migration data).
      edges: [],
      reason:
        'Legacy hypothesis rows carry the belief properties; the claim preserves them byte-for-byte. The we_test_by property drops (it described experimental method, which now lives on the linked experiment_plan via hypothesis_claim_requires_experiment_plan). Evidence rows are not spawned from legacy hypothesis data; legacy hypothesis never carried inline evidence. Consumers walking dropped `evidence_supports_hypothesis` edges may opt to spawn hypothesis_evidence rows post-migration, but that\'s out-of-band adapter logic.',
    },
  ],
}

/**
 * Get all 1→N split migrations between two versions.
 *
 * @example
 * const splits = getSplitMigrations('0.2.5', '0.2.6')
 * // splits[0].from === 'experiment'
 * // splits[0].produces.length === 2
 */
export function getSplitMigrations(
  fromVersion: string,
  toVersion: string,
): UPGSplitMigration[] {
  const result: UPGSplitMigration[] = []
  for (const [version, migrations] of Object.entries(UPG_SPLIT_MIGRATIONS)) {
    if (versionInRange(version, fromVersion, toVersion)) {
      result.push(...migrations)
    }
  }
  return result
}

// ─── Edge type migrations ───────────────────────────────────────────
//
// When a canonical edge key is renamed or dropped, `UPG_EDGE_MIGRATIONS`
// records the rule. Mirrors the discriminated-union shape used by
// `UPG_MIGRATIONS` and `UPG_PROPERTY_MIGRATIONS`: each version key maps to
// an array of rules; each rule carries a required `reason` quoting the
// originating CHANGELOG section so load-time warnings and changelog
// generation share one canonical source.
//
// **Composition with node migration.** `UPG_EDGE_MIGRATIONS` runs *after*
// entity migration. The runtime contract is:
//
//   1. Entity migration first via `migrateNode` (1→1 aliases) and/or
//      `applySplit` (1→N rules).
//   2. Edge migration second via `migrateEdge`;
//      `requires_source_type` / `requires_target_type` guards check the
//      *post-migration* endpoint types.
//
// This is what makes the "legacy edges on already-migrated nodes" case
// safe. The 1→N split rules already emit canonical edges between spawned
// targets via `UPG_SPLIT_MIGRATIONS[].edges`; edge migration only handles
// the residue.

/**
 * A single edge-key migration rule. Discriminated by `kind`.
 *
 * `rename` retargets `from` to `to` (optionally swapping endpoints when
 * `flip` is true) and may gate on endpoint identity via
 * `requires_source_type` / `requires_target_type`.
 *
 * `drop` removes the edge entirely (no replacement key); used when a
 * legacy edge has been superseded by a structurally different canonical
 * edge whose endpoints don't match the legacy rule's `from`.
 */
export type UPGEdgeMigration =
  | {
      kind: 'rename'
      /** The old edge type key. */
      from: string
      /** The new canonical edge type key. */
      to: string
      /** When true, swap source/target on each migrated edge. */
      flip?: boolean
      /** Required source-node type (post-migration) for this rule to fire. */
      requires_source_type?: string
      /** Required target-node type (post-migration) for this rule to fire. */
      requires_target_type?: string
      /** Human-readable reason quoting the originating CHANGELOG section. */
      reason: string
    }
  | {
      kind: 'drop'
      /** The old edge type key being removed without replacement. */
      from: string
      /** Human-readable reason quoting the originating CHANGELOG section. */
      reason: string
    }

/**
 * Version-scoped edge migration registry.
 * Key is the version that INTRODUCES the migration (target version).
 */
export const UPG_EDGE_MIGRATIONS: Record<string, UPGEdgeMigration[]> = {
  '0.7.0': [
    // (since v0.7.0) story_statement → user_story re-canon. The four
    // canonical edges that touch the statement are renamed to the user_story
    // form. Endpoint guards reference the POST-migration (user_story) types;
    // edge migration runs after node migration, so by the time these rules
    // apply the statement node has already been renamed story_statement →
    // user_story (UPG_MIGRATIONS['0.7.0']).
    { kind: 'rename', from: 'task_implements_story_statement', to: 'task_implements_user_story', requires_source_type: 'task', requires_target_type: 'user_story', reason: 'story_statement → user_story. Task still implements the statement; edge key updated to the re-canonicalised target type.' },
    { kind: 'rename', from: 'epic_specified_by_story_statement', to: 'epic_specified_by_user_story', requires_source_type: 'epic', requires_target_type: 'user_story', reason: 'story_statement → user_story. Epics specify the statement; edge key updated to the re-canonicalised target type.' },
    { kind: 'rename', from: 'story_statement_verified_by_acceptance_criterion', to: 'user_story_verified_by_acceptance_criterion', requires_source_type: 'user_story', requires_target_type: 'acceptance_criterion', reason: 'story_statement → user_story. Acceptance criteria verify the statement; edge key updated to the re-canonicalised source type.' },
    { kind: 'rename', from: 'test_case_covers_story_statement', to: 'test_case_covers_user_story', requires_source_type: 'test_case', requires_target_type: 'user_story', reason: 'story_statement → user_story. Test cases cover the statement; edge key updated to the re-canonicalised target type.' },
  ],

  '0.4.0': [
    // ── hypothesis_claim → hypothesis reverse rename ───────────────
    // Every edge that was renamed FROM hypothesis_* TO hypothesis_claim_* in
    // v0.2.8 is renamed back. The canonical entity name
    // reverts; "claim" was redundant. hypothesis_evidence_* edges are NOT
    // renamed here; hypothesis_evidence is deprecated; use evidence +
    // hypothesis_has_evidence instead.
    { kind: 'rename', from: 'solution_proposes_hypothesis_claim', to: 'solution_proposes_hypothesis', requires_source_type: 'solution', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'hypothesis_claim_requires_experiment_plan', to: 'hypothesis_requires_experiment_plan', requires_source_type: 'hypothesis', requires_target_type: 'experiment_plan', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'hypothesis_claim_planned_via_test_plan', to: 'hypothesis_planned_via_test_plan', requires_source_type: 'hypothesis', requires_target_type: 'test_plan', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'hypothesis_claim_investigated_via_research_plan', to: 'hypothesis_investigated_via_research_plan', requires_source_type: 'hypothesis', requires_target_type: 'research_plan', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'learning_updates_hypothesis_claim', to: 'learning_updates_hypothesis', requires_source_type: 'learning', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'learning_refines_hypothesis_claim', to: 'learning_refines_hypothesis', requires_source_type: 'learning', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'assumption_becomes_hypothesis_claim', to: 'assumption_becomes_hypothesis', requires_source_type: 'assumption', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'experiment_run_validates_hypothesis_claim', to: 'experiment_run_validates_hypothesis', requires_source_type: 'experiment_run', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'variant_tests_hypothesis_claim', to: 'variant_tests_hypothesis', requires_source_type: 'variant', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'feature_tests_hypothesis_claim', to: 'feature_tests_hypothesis', requires_source_type: 'feature', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'prototype_tests_hypothesis_claim', to: 'prototype_tests_hypothesis', requires_source_type: 'prototype', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    { kind: 'rename', from: 'churn_reason_generates_hypothesis_claim', to: 'churn_reason_generates_hypothesis', requires_source_type: 'churn_reason', requires_target_type: 'hypothesis', reason: 'Reverse of the v0.2.8 rename. hypothesis_claim reverts to hypothesis.' },
    // ── hypothesis_evidence_* → drop (type deprecated) ────────────
    // hypothesis_evidence is deprecated at v0.4.0. All edges sourced from it
    // are dropped; the new pattern is hypothesis_has_evidence + evidence.direction.
    { kind: 'drop', from: 'hypothesis_evidence_supports_hypothesis_claim', reason: 'hypothesis_evidence deprecated; use hypothesis_has_evidence edge + evidence.direction="supports".' },
    { kind: 'drop', from: 'hypothesis_evidence_refutes_hypothesis_claim', reason: 'hypothesis_evidence deprecated; use hypothesis_has_evidence edge + evidence.direction="refutes".' },
    { kind: 'drop', from: 'hypothesis_evidence_derived_from_experiment_run', reason: 'hypothesis_evidence deprecated; evidence.source captures provenance.' },
    { kind: 'drop', from: 'hypothesis_evidence_derived_from_insight', reason: 'hypothesis_evidence deprecated; evidence.source captures provenance.' },
    { kind: 'drop', from: 'hypothesis_evidence_derived_from_observation', reason: 'hypothesis_evidence deprecated; evidence.source captures provenance.' },
    { kind: 'drop', from: 'hypothesis_evidence_derived_from_metric', reason: 'hypothesis_evidence deprecated; evidence.source captures provenance.' },
    // ── story_task → task rename ───────────────────────────────────
    { kind: 'rename', from: 'story_task_implements_story_statement', to: 'task_implements_story_statement', requires_source_type: 'task', requires_target_type: 'story_statement', reason: 'story_task collapsed into task; edge key updated to match canonical source type.' },
  ],

  '0.2.0': [
    // ── jtbd → job edge-key backfill ─────────────────────────────
    // The v0.2.0 entity-type rename `jtbd → job` (UPG_MIGRATIONS['0.2.0'])
    // shipped alongside an edge-key rename pass (the `_has_` → forward_verb
    // sweep) but the runtime translation rules were never landed in this
    // registry. Backfilled here so loaders chasing pre-0.2.0 data get a
    // single retarget hop instead of inventing their own map.
    //
    // Entity migration runs first, so source/target_type guards check the
    // post-migration types (`persona`, `user_journey`, `insight`, `job`,
    // etc.). The reason field cites the v0.2.0 CHANGELOG.
    {
      kind: 'rename',
      from: 'persona_has_jtbd',
      to: 'persona_pursues_job',
      requires_source_type: 'persona',
      requires_target_type: 'job',
      reason: 'Renamed alongside the jtbd→job entity rename and the _has_ → forward_verb sweep. The canonical edge changes verb from has→pursues; pursued_by reverses the relationship. Source remains persona; target migrates jtbd→job via UPG_MIGRATIONS["0.2.0"], so this rule fires after node migration completes.',
    },
    {
      kind: 'rename',
      from: 'journey_addresses_jtbd',
      to: 'user_journey_addresses_job',
      requires_source_type: 'user_journey',
      requires_target_type: 'job',
      reason: 'Renamed alongside the jtbd→job entity rename and the _has_ → forward_verb sweep. Source key prefix `journey` → `user_journey` matches the canonical entity name (no entity-type alias was needed because `journey` was never a registered type; it was an informal key prefix).',
    },
    {
      kind: 'rename',
      from: 'vp_addresses_jtbd',
      to: 'value_proposition_addresses_job',
      requires_source_type: 'value_proposition',
      requires_target_type: 'job',
      reason: 'Renamed alongside the jtbd→job entity rename. Source key prefix `vp` (acronym) expanded to canonical `value_proposition` matching the entity name.',
    },
    {
      kind: 'rename',
      from: 'finding_informs_jtbd',
      to: 'insight_informs_job',
      requires_source_type: 'insight',
      requires_target_type: 'job',
      reason: 'Source `finding` migrated to `insight` in v0.1.0 (UPG_MIGRATIONS["0.1.0"], with insight_level="finding" default); target `jtbd` migrated to `job` in v0.2.0. Edge-migration runs after both node migrations, so the rule fires once endpoints are post-migration.',
    },
    {
      kind: 'rename',
      from: 'quote_evidences_jtbd',
      to: 'quote_evidences_job',
      requires_source_type: 'quote',
      requires_target_type: 'job',
      reason: 'Renamed alongside the jtbd→job entity rename. Verb unchanged.',
    },
    {
      kind: 'rename',
      from: 'learning_validates_jtbd',
      to: 'learning_validates_job',
      requires_source_type: 'learning',
      requires_target_type: 'job',
      reason: 'Renamed alongside the jtbd→job entity rename. Verb unchanged.',
    },

    // ── v0.2.0 backfill: classification-suffix renames ─────────────
    // Pre-v0.2 era graphs annotated edge classification by appending
    // `_causal` / `_semantic` to the edge key. Classification became a
    // catalog property in v0.2.0 (`classification: 'causal' | 'semantic' |
    // 'hierarchy' | 'cross-domain'`), making the suffix redundant. The
    // stem keys are canonical; the suffixed forms are pure renames.
    {
      kind: 'rename',
      from: 'outcome_reveals_opportunity_causal',
      to: 'outcome_reveals_opportunity',
      reason: 'The `_causal` suffix annotated the edge\'s classification before v0.2 moved classification onto the catalog entry itself. Stem `outcome_reveals_opportunity` is canonical (classification: causal). Cross-graph audit: 15 edges across entopo.upg + unified-product-graph.upg.',
    },
    {
      kind: 'rename',
      from: 'persona_pursues_job_semantic',
      to: 'persona_pursues_job',
      reason: 'The `_semantic` suffix annotated the edge\'s classification before v0.2 moved classification onto the catalog entry itself. Stem `persona_pursues_job` is canonical (classification: semantic). Cross-graph audit: 6 edges in unified-product-graph.upg.',
    },

    // ── v0.2.0 cleanup: informal-edge drops ────────────────────────
    //
    // Pre-v0.2 graphs minted `product_contains_<entity>` edges to express
    // graph membership ("this entity belongs to this product"). v0.2 models
    // product membership through portfolio scope + the `upg_product`
    // frontmatter / file association, NOT through typed edges. The
    // `product_contains_*` family in the canonical catalog is intentionally
    // narrow: only `research_study` and `screen` (entities a product
    // structurally owns as artefacts). Everything else is graph-membership
    // noise being cleaned up at the v0.2.0 baseline.
    //
    // Doctrine: a product is a portfolio scope, not an entity container.
    // Structural containment is reserved for entities the product
    // physically owns. If a future v0.3 catalog elevates any of these to
    // canonical, the drop rules below become rename rules; today they're
    // drops with explicit reason.
    //
    // Sources: cross-graph audit (entopo.upg + unified-product-graph.upg)
    // surfaced these as `unmapped_legacy_edges` after `migrate_type` ran.
    {
      kind: 'drop',
      from: 'product_contains_persona',
      reason: 'Cleanup (since v0.2.0). Personas are scoped to a product via portfolio membership, not contained as a typed edge. v0.2 catalog reserves `product_contains_*` for structural artefacts (research_study, screen). Cross-graph audit: 8 edges total.',
    },
    {
      kind: 'drop',
      from: 'product_contains_market_segment',
      reason: 'Cleanup (since v0.2.0). Market segments belong to a product via portfolio scope. Not a structural containment relationship. Cross-graph audit: 5 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_market_trend',
      reason: 'Cleanup (since v0.2.0). Market trends are environmental context, not contained artefacts. Cross-graph audit: 5 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_proof_point',
      reason: 'Cleanup (since v0.2.0). Proof points belong to positioning / value proposition entities, not directly to the product as a container. Cross-graph audit: 7 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_value_proposition',
      reason: 'Cleanup (since v0.2.0). Value propositions are scoped to a product via portfolio membership. Cross-graph audit: 3 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_hypothesis',
      reason: 'Cleanup (since v0.2.0). Hypotheses (now hypothesis_claim post v0.2.8) belong to a product via portfolio scope. Cross-graph audit: 8 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_positioning',
      reason: 'Cleanup (since v0.2.0). Positioning belongs to a product via portfolio scope. Cross-graph audit: 2 edges.',
    },
    // restoration: this edge is being re-introduced as a
    // canonical anchor. The v0.2.0 cleanup retired it on the assumption that
    // "competitive analysis is scoped to a product via portfolio scope", but
    // chain validation showed that assumption produces orphan analyses
    // for any single-product graph. The edge is back in `UPG_EDGE_CATALOG`
    // with `forward_verb: contains`, mirroring `product_contains_research_study`.
    // The historical drop rule is intentionally omitted; keeping it would
    // contradict the catalog and trip the `edge-migrations` invariant test
    // ("drop rule `from` keys are no longer in the canonical catalog").
    {
      kind: 'drop',
      from: 'product_contains_content_strategy',
      reason: 'Cleanup (since v0.2.0). Content strategy is scoped to a product via portfolio scope. Cross-graph audit: 1 edge.',
    },
    {
      kind: 'drop',
      from: 'product_contains_epic',
      reason: 'Cleanup (since v0.2.0). Epics belong to a product via portfolio scope and to features/work-units via hierarchy. Cross-graph audit: 1 edge.',
    },
    {
      kind: 'drop',
      from: 'product_contains_ideal_customer_profile',
      reason: 'Cleanup (since v0.2.0). ICPs are scoped to a product via portfolio scope. Cross-graph audit: 1 edge.',
    },
    {
      kind: 'drop',
      from: 'product_contains_insight',
      reason: 'Cleanup (since v0.2.0). Insights belong to a product via portfolio scope and to research artefacts via hierarchy. Cross-graph audit: 6 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_competitor',
      reason: 'Cleanup (since v0.2.0). Competitors are environmental context scoped to a product, not contained artefacts. Cross-graph audit: 4 edges.',
    },
    {
      kind: 'drop',
      from: 'product_contains_learning',
      reason: 'Cleanup (since v0.2.0). Learnings belong to experiment_run via the canonical `experiment_run_produces_learning` edge, not directly to the product. Cross-graph audit: 2 edges.',
    },
    {
      kind: 'drop',
      from: 'hypothesis_contains_persona',
      reason: 'Cleanup (since v0.2.0). Hypotheses do not contain personas; the relationship is the reverse (personas surface needs that ground hypotheses). Cross-graph audit: 5 edges.',
    },
    {
      kind: 'drop',
      from: 'positioning_contains_content_piece',
      reason: 'Cleanup (since v0.2.0). Positioning is itself a content artefact; "containing" content pieces is informal. The canonical relationship runs through content_strategy. Cross-graph audit: 3 edges.',
    },
    {
      kind: 'drop',
      from: 'feature_contains_feature',
      reason: 'Cleanup (since v0.2.0). Feature self-nesting is handled via UPG_VALID_CHILDREN hierarchy (entity-tree relationship), not as a typed edge. Cross-graph audit: 4 edges.',
    },
    {
      kind: 'drop',
      from: 'parent_of',
      reason: 'Cleanup (since v0.2.0). Parent-child relationships are handled via UPG_VALID_CHILDREN hierarchy at the entity-tree level, not as a typed edge. Cross-graph audit: 1 edge.',
    },
    {
      kind: 'drop',
      from: 'related_to',
      reason: 'Cleanup (since v0.2.0). Generic "related to" has no canonical pair semantics; every real relationship has a specific verb in UPG_EDGE_CATALOG. Cross-graph audit: 1 edge.',
    },

    // ── v0.2.0 cleanup: informal-containment drops for v0.2.6+ children ─
    //
    // Same doctrine as above: `product_contains_*` is a portfolio
    // membership concern, not a typed edge. The original audit
    // covered the entity types in cross-graph data at the time. Several
    // canonical types introduced AFTER v0.2.0 (story_statement v0.2.7,
    // experiment_plan / experiment_run v0.2.6, plus metric / outcome /
    // decision which were always canonical but didn't surface in the
    // original audit) are surfaced by v0.3 round-trip fixtures with the
    // same informal `product_contains_<type>` shape. Add drops so they
    // canonicalise via the same `product is a scope, not a container`
    // rule. Sourced from `.upg/v03-roundtrip.upg` round-trip fixture.
    {
      kind: 'drop',
      from: 'product_contains_metric',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Metrics belong to a product via portfolio scope and to features/outcomes via canonical edges, not as a typed product-containment edge.',
    },
    {
      kind: 'drop',
      from: 'product_contains_outcome',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Outcomes belong to a product via portfolio scope; the canonical chain is opportunity_pursues_outcome / job_motivates_desired_outcome.',
    },
    {
      kind: 'drop',
      from: 'product_contains_decision',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Decisions belong to a product via portfolio scope and use the polymorphic decision_influences_node family for relational links.',
    },
    {
      kind: 'drop',
      from: 'product_contains_story_statement',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Story statements belong to a product via portfolio scope and to story_task via canonical implements edges. Type was introduced in v0.2.7 (post-original-audit).',
    },
    {
      kind: 'drop',
      from: 'product_contains_experiment',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Experiments (canonical alongside experiment_plan / experiment_run) belong to a product via portfolio scope, not as a typed containment edge.',
    },
    {
      kind: 'drop',
      from: 'product_contains_experiment_run',
      reason: 'Cleanup follow-on (since v0.2.0; `product is a scope, not a container` doctrine). Experiment runs belong to experiment_plan via canonical experiment_plan_ran_as_experiment_run, not directly to the product as a containment edge. Type was introduced in v0.2.6 (post-original-audit).',
    },

    // ── v0.2.0 backfill: persona-chain verb canonicalisation ──────────────
    //
    // The persona chain (v0.2 model) settled on the canonical edge
    // verbs `aspires_to` (persona → desired_outcome, hierarchy) and
    // `incurs` (persona → switching_cost, hierarchy). Some pre-canon
    // graphs minted these edges with informal verbs (`seeks`, `faces`)
    // that read more naturally but never made it into the catalog. Rename
    // so the canonical verb set stays the one authority and
    // validate_graph offers a single-hop fix.
    //
    // Sourced from `.upg/v03-roundtrip.upg` round-trip fixture.
    {
      kind: 'rename',
      from: 'persona_seeks_desired_outcome',
      to: 'persona_aspires_to_desired_outcome',
      requires_source_type: 'persona',
      requires_target_type: 'desired_outcome',
      reason: 'The canonical persona-chain verb is `aspires_to` (catalog: classification=hierarchy, source=persona, target=desired_outcome). `seeks` was an informal authoring shorthand; renaming surfaces a single canonical chain.',
    },
    {
      kind: 'rename',
      from: 'persona_faces_switching_cost',
      to: 'persona_incurs_switching_cost',
      requires_source_type: 'persona',
      requires_target_type: 'switching_cost',
      reason: 'The canonical persona-chain verb is `incurs` (catalog: classification=hierarchy, source=persona, target=switching_cost). `faces` was an informal authoring shorthand; renaming surfaces a single canonical chain.',
    },
  ],

  '0.2.7': [
    // ── split 1 closure: 18 experiment-edge retargets ──────────────
    // CHANGELOG v0.2.7 §"Breaking split 1 closure" enumerates
    // the full retarget list. Each rule guards on the canonical
    // post-migration endpoint type so legacy edges on already-migrated
    // nodes (post-applySplit) translate cleanly. `experiment` → `experiment_run`
    // 1→1 alias lives in UPG_MIGRATIONS["0.2.7"]; full plan+run split lives
    // in UPG_SPLIT_MIGRATIONS["0.2.6"].
    {
      kind: 'rename',
      from: 'hypothesis_requires_experiment',
      to: 'hypothesis_requires_experiment_plan',
      requires_source_type: 'hypothesis',
      requires_target_type: 'experiment_plan',
      reason: 'Split 1 closure (since v0.2.7). Hypothesis requires the planning artefact, not the run. Target retargets to experiment_plan; source retargets to hypothesis_claim in v0.2.8 (then registered as hypothesis_claim_requires_experiment_plan).',
    },
    {
      kind: 'rename',
      from: 'growth_campaign_tests_via_experiment',
      to: 'growth_campaign_tests_via_experiment_plan',
      requires_source_type: 'growth_campaign',
      requires_target_type: 'experiment_plan',
      reason: 'Split 1 closure (since v0.2.7). Growth campaigns reference the planning artefact (which experiments the campaign tests via).',
    },
    {
      kind: 'rename',
      from: 'pricing_strategy_tests_experiment',
      to: 'pricing_strategy_tests_experiment_plan',
      requires_source_type: 'pricing_strategy',
      requires_target_type: 'experiment_plan',
      reason: 'Split 1 closure (since v0.2.7). Pricing strategies reference the plan, not the run.',
    },
    {
      kind: 'rename',
      from: 'experiment_targets_behavioral_segment',
      to: 'experiment_plan_targets_behavioral_segment',
      requires_source_type: 'experiment_plan',
      requires_target_type: 'behavioral_segment',
      reason: 'Split 1 closure (since v0.2.7). Targeting is a planning concern (decided pre-execution), so retargets to experiment_plan.',
    },
    {
      kind: 'rename',
      from: 'experiment_produces_learning',
      to: 'experiment_run_produces_learning',
      requires_source_type: 'experiment_run',
      requires_target_type: 'learning',
      reason: 'Split 1 closure (since v0.2.7). Learnings are produced by the run (execution evidence), not the plan.',
    },
    {
      kind: 'rename',
      from: 'experiment_yields_evidence',
      to: 'experiment_run_yields_evidence',
      requires_source_type: 'experiment_run',
      requires_target_type: 'evidence',
      reason: 'Split 1 closure (since v0.2.7). Evidence yields from execution; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'beta_program_runs_experiment',
      to: 'beta_program_runs_experiment_run',
      requires_source_type: 'beta_program',
      requires_target_type: 'experiment_run',
      reason: 'Split 1 closure (since v0.2.7). Beta programs run experiment_run instances (the actual executions).',
    },
    {
      kind: 'rename',
      from: 'experiment_tests_variant',
      to: 'experiment_run_tests_variant',
      requires_source_type: 'experiment_run',
      requires_target_type: 'variant',
      reason: 'Split 1 closure (since v0.2.7). Variant tests happen during run execution; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'cohort_exposed_to_experiment',
      to: 'cohort_exposed_to_experiment_run',
      requires_source_type: 'cohort',
      requires_target_type: 'experiment_run',
      reason: 'Split 1 closure (since v0.2.7). Exposure is a run-time event; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'experiment_tests_pricing_tier',
      to: 'experiment_run_tests_pricing_tier',
      requires_source_type: 'experiment_run',
      requires_target_type: 'pricing_tier',
      reason: 'Split 1 closure (since v0.2.7). Pricing tier tests happen during run execution; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'dashboard_contains_experiment',
      to: 'dashboard_contains_experiment_run',
      requires_source_type: 'dashboard',
      requires_target_type: 'experiment_run',
      reason: 'Split 1 closure (since v0.2.7). Dashboards surface run results (the live data), not plans.',
    },
    {
      kind: 'rename',
      from: 'experiment_tests_feature',
      to: 'experiment_run_tests_feature',
      requires_source_type: 'experiment_run',
      requires_target_type: 'feature',
      reason: 'Split 1 closure (since v0.2.7). Feature tests happen during run execution; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'experiment_measures_metric',
      to: 'experiment_run_measures_metric',
      requires_source_type: 'experiment_run',
      requires_target_type: 'metric',
      reason: 'Split 1 closure (since v0.2.7). Measurement is a run-time concern; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'experiment_guards_metric',
      to: 'experiment_run_guards_metric',
      requires_source_type: 'experiment_run',
      requires_target_type: 'metric',
      reason: 'Split 1 closure (since v0.2.7). Guard-metric checks are a run-time concern; retargets to experiment_run.',
    },
    {
      kind: 'rename',
      from: 'experiment_measured_by_metric',
      to: 'experiment_run_measured_by_metric',
      requires_source_type: 'experiment_run',
      requires_target_type: 'metric',
      reason: 'Split 1 closure (since v0.2.7). Run-level measurement; retargets to experiment_run.',
    },
    // Edge consolidation: experiment_tested_via_experiment + duplicate
    // experiment_tests_experiment both collapse into the single canonical
    // experiment_run_tested_via_experiment_run.
    {
      kind: 'rename',
      from: 'experiment_tested_via_experiment',
      to: 'experiment_run_tested_via_experiment_run',
      requires_source_type: 'experiment_run',
      requires_target_type: 'experiment_run',
      reason: 'Split 1 closure (since v0.2.7). Multi-armed iterations and replications now express run-to-run; CHANGELOG v0.2.7: "the duplicate pair experiment_tested_via_experiment + experiment_tests_experiment consolidates into a single canonical experiment_run_tested_via_experiment_run".',
    },
    {
      kind: 'rename',
      from: 'experiment_tests_experiment',
      to: 'experiment_run_tested_via_experiment_run',
      requires_source_type: 'experiment_run',
      requires_target_type: 'experiment_run',
      reason: 'Split 1 closure (since v0.2.7). Near-duplicate of experiment_tested_via_experiment; consolidated into the canonical run-to-run testing edge.',
    },
    // Drop: experiment_tests_hypothesis superseded by canonical
    // experiment_run_validates_hypothesis (v0.2.6, then retargeted to
    // hypothesis_claim in v0.2.8).
    {
      kind: 'drop',
      from: 'experiment_tests_hypothesis',
      reason: 'Split 1 closure (since v0.2.7). Superseded by the canonical experiment_run_validates_hypothesis (causal) introduced in v0.2.6; the run is what validates the hypothesis, not an abstract experiment. CHANGELOG v0.2.7: "Edge dropped: experiment_tests_hypothesis is removed; superseded by the canonical experiment_run_validates_hypothesis (causal) introduced in v0.2.6."',
    },

    // ── split 2: 5 user_story-edge retargets + 2 drops ─────────────
    // CHANGELOG v0.2.7 §"Breaking split 2" enumerates the full
    // list. user_story → story_task 1→1 alias lives in
    // UPG_MIGRATIONS["0.2.7"]; full statement+task split lives in
    // UPG_SPLIT_MIGRATIONS["0.2.7"].
    {
      kind: 'rename',
      from: 'epic_specified_by_user_story',
      to: 'epic_specified_by_story_statement',
      requires_source_type: 'epic',
      requires_target_type: 'story_statement',
      reason: 'Epics own the spec (statement), not the work (task). Retargets to story_statement.',
    },
    {
      kind: 'rename',
      from: 'user_story_verified_by_acceptance_criterion',
      to: 'story_statement_verified_by_acceptance_criterion',
      requires_source_type: 'story_statement',
      requires_target_type: 'acceptance_criterion',
      reason: 'Acceptance criteria define what done looks like for the spec; retargets source to story_statement.',
    },
    {
      kind: 'rename',
      from: 'test_case_covers_user_story',
      to: 'test_case_covers_story_statement',
      requires_source_type: 'test_case',
      requires_target_type: 'story_statement',
      reason: 'Test cases cover the spec, not the work; retargets target to story_statement.',
    },
    // user_story_broken_into_task drops; consolidated into the implements edge.
    {
      kind: 'drop',
      from: 'user_story_broken_into_task',
      reason: 'Consolidated into the canonical implements edge (the relationship now flows from task to statement directly). CHANGELOG v0.2.7: "user_story_broken_into_task → dropped."',
    },
    // NOTE: the v0.2.7 drop of `task_implements_user_story` was REMOVED at v0.7.0
    //. Re-canonicalising story_statement → user_story makes
    // `task_implements_user_story` the canonical implements edge again, so the
    // name is no longer retired (a drop rule must never name a canonical edge).
    // Legacy pre-0.2.7 instances are reconnected by the v0.2.7 split's emitted
    // implements edge; any residual dangling edge is handled by
    // repair_dangling_edges.
  ],

  '0.2.8': [
    // ── split 3: 12 hypothesis-edge retargets + 1 drop ─────────────
    // PR #1151 diff of UPG_EDGE_CATALOG enumerates the full retarget list.
    // The 12 retargets all change a `hypothesis` endpoint (source or
    // target, occasionally both) to `hypothesis_claim`. The dropped edge
    // (`evidence_supports_hypothesis`) is structurally superseded by
    // `hypothesis_evidence_supports_hypothesis_claim` whose source is a
    // *different* entity type (`hypothesis_evidence`); so it cannot
    // round-trip via a flat rename and is registered as a drop.
    {
      kind: 'rename',
      from: 'solution_proposes_hypothesis',
      to: 'solution_proposes_hypothesis_claim',
      requires_source_type: 'solution',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim (the canonical "hypothesis" is now the claim); source unchanged.',
    },
    {
      kind: 'rename',
      from: 'hypothesis_requires_experiment_plan',
      to: 'hypothesis_claim_requires_experiment_plan',
      requires_source_type: 'hypothesis_claim',
      requires_target_type: 'experiment_plan',
      reason: 'Source hypothesis migrated to hypothesis_claim. (This edge was already retargeted target-side from experiment to experiment_plan in v0.2.7; v0.2.8 closes the source-side retarget.)',
    },
    {
      kind: 'rename',
      from: 'hypothesis_planned_via_test_plan',
      to: 'hypothesis_claim_planned_via_test_plan',
      requires_source_type: 'hypothesis_claim',
      requires_target_type: 'test_plan',
      reason: 'Source hypothesis migrated to hypothesis_claim; target unchanged.',
    },
    {
      kind: 'rename',
      from: 'hypothesis_investigated_via_research_plan',
      to: 'hypothesis_claim_investigated_via_research_plan',
      requires_source_type: 'hypothesis_claim',
      requires_target_type: 'research_plan',
      reason: 'Source hypothesis migrated to hypothesis_claim; target unchanged.',
    },
    {
      kind: 'rename',
      from: 'learning_updates_hypothesis',
      to: 'learning_updates_hypothesis_claim',
      requires_source_type: 'learning',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'assumption_becomes_hypothesis',
      to: 'assumption_becomes_hypothesis_claim',
      requires_source_type: 'assumption',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'experiment_run_validates_hypothesis',
      to: 'experiment_run_validates_hypothesis_claim',
      requires_source_type: 'experiment_run',
      requires_target_type: 'hypothesis_claim',
      reason: 'Closes the deferred target retarget from v0.2.6 (experiment_run_validates_hypothesis was introduced in v0.2.6 with target=hypothesis; v0.2.8 retargets to hypothesis_claim).',
    },
    {
      kind: 'rename',
      from: 'variant_tests_hypothesis',
      to: 'variant_tests_hypothesis_claim',
      requires_source_type: 'variant',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'churn_reason_generates_hypothesis',
      to: 'churn_reason_generates_hypothesis_claim',
      requires_source_type: 'churn_reason',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'learning_refines_hypothesis',
      to: 'learning_refines_hypothesis_claim',
      requires_source_type: 'learning',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'feature_tests_hypothesis',
      to: 'feature_tests_hypothesis_claim',
      requires_source_type: 'feature',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    {
      kind: 'rename',
      from: 'prototype_tests_hypothesis',
      to: 'prototype_tests_hypothesis_claim',
      requires_source_type: 'prototype',
      requires_target_type: 'hypothesis_claim',
      reason: 'Target hypothesis migrated to hypothesis_claim; source unchanged.',
    },
    // Drop: evidence_supports_hypothesis superseded by canonical
    // hypothesis_evidence_supports_hypothesis_claim (different source type).
    {
      kind: 'drop',
      from: 'evidence_supports_hypothesis',
      reason: 'Superseded by the canonical hypothesis_evidence_supports_hypothesis_claim. The source type changes (evidence → hypothesis_evidence, the new dedicated P2 scored-assessment entity), so this is a structural drop rather than a key rename. Consumers walking dropped edges may opt to spawn hypothesis_evidence rows post-migration (out-of-band adapter logic). CHANGELOG v0.2.8: "Edge dropped: evidence_supports_hypothesis; superseded by the canonical hypothesis_evidence_supports_hypothesis_claim."',
    },

    // ── v0.2.8 closure: direction-flip rename ──────────────────────
    // Pre-v0.2 graphs minted `hypothesis_contains_feature` (source=hypothesis,
    // target=feature) to express "this hypothesis is tested by this feature".
    // The canonical relationship runs the OTHER way: `feature_tests_hypothesis_claim`
    // (source=feature, target=hypothesis_claim, classification: cross-domain)
    // because a feature is what tests a claim, not the reverse. After
    // node migration of hypothesis → hypothesis_claim, the legacy edge has
    // post-migration endpoints (source: hypothesis_claim, target: feature);
    // flipping endpoints + retyping produces the canonical edge.
    //
    // First real consumer of `flip: true` since the field was introduced
    // in.
    {
      kind: 'rename',
      from: 'hypothesis_contains_feature',
      to: 'feature_tests_hypothesis_claim',
      flip: true,
      requires_source_type: 'hypothesis_claim',
      requires_target_type: 'feature',
      reason: 'Closure (since v0.2.8). Pre-v0.2 graphs minted hypothesis_contains_feature (source=hypothesis → target=feature). The canonical relationship runs the other way: feature_tests_hypothesis_claim (source=feature → target=hypothesis_claim, cross-domain). Post node migration of hypothesis → hypothesis_claim, this rule flips endpoints and retypes. Cross-graph audit: 10 edges in entopo.upg.',
    },
  ],
}

/**
 * Get all edge migration rules between two versions, in version order.
 *
 * @example
 * // v0.2.0 backfill: six jtbd→job edge renames.
 * const rules = getUPGEdgeMigrations('0.0.0', '0.2.0')
 * rules.length // → 6
 * rules.every(r => r.kind === 'rename') // → true
 *
 * @example
 * // Full v0.2.x range: every rule from v0.2.0 + v0.2.7 + v0.2.8.
 * getUPGEdgeMigrations('0.0.0', '0.2.8').filter(r => r.kind === 'drop').length // → 4
 */
export function getUPGEdgeMigrations(
  fromVersion: string,
  toVersion: string,
): UPGEdgeMigration[] {
  const result: UPGEdgeMigration[] = []
  for (const [version, migrations] of Object.entries(UPG_EDGE_MIGRATIONS)) {
    if (versionInRange(version, fromVersion, toVersion)) {
      result.push(...migrations)
    }
  }
  return result
}

/**
 * Endpoint context for `migrateEdge` guard evaluation.
 *
 * Both `sourceType` and `targetType` should be the *post-migration* node
 * types (i.e. after `migrateNode` / `applySplit` has run on the endpoints).
 * When omitted, rules with `requires_source_type` / `requires_target_type`
 * guards are skipped (safer default; a guard that cannot be evaluated
 * does not fire).
 */
export interface UPGEdgeMigrationEndpoints {
  /** Post-migration source-node type (after `migrateNode` / `applySplit`). */
  sourceType?: string
  /** Post-migration target-node type (after `migrateNode` / `applySplit`). */
  targetType?: string
}

/**
 * Walk the edge-migration chain for `edge_type` until reaching a value that
 * exists in `UPG_EDGE_CATALOG` (the current canonical name) or the chain
 * dead-ends.
 *
 * **Why this exists.** `UPG_EDGE_MIGRATIONS` accumulates rules across the
 * spec's history. A single edge can be renamed multiple times, and the
 * direction can reverse (e.g. v0.2.8 renamed `solution_proposes_hypothesis`
 * → `solution_proposes_hypothesis_claim`, then v0.4.0 renamed the latter
 * back to the former). Naively picking "the first rule whose `from` matches"
 * surfaces a stale migration target. The validator's `edge_drift`
 * suggestions need to land on the *current* canonical name, not whatever
 * intermediate the chain hop happens to be next.
 *
 * **Resolution strategy.** Process all rules across all versions, sorted
 * latest-version first per `from` key. From a given starting key, follow
 * the highest-version `rename` rule whose `from` matches; if the result is
 * in `UPG_EDGE_CATALOG`, return it (canonical). Otherwise re-enter with the
 * new key and continue. Cycles are detected and broken to return a `cycle`
 * outcome rather than loop forever.
 *
 * **Return values.**
 *  - `{ kind: 'canonical', to }`: the walk landed on a key present in
 *    `UPG_EDGE_CATALOG`. Callers should suggest `to` as the migration target.
 *  - `{ kind: 'drop' }`: the walk encountered a `drop` rule. The edge has
 *    no canonical replacement.
 *  - `{ kind: 'dead_end', last }`: no rule matched and `last` is not in
 *    `UPG_EDGE_CATALOG`. The edge is non-canonical with no known migration
 *    target.
 *  - `{ kind: 'cycle', visited }`: a cycle was detected. Returned so
 *    callers can degrade gracefully. Should not happen in practice given
 *    the version-ordered structure of `UPG_EDGE_MIGRATIONS`.
 *
 * **Caller note.** Callers that already know `edge_type` is canonical
 * (i.e. `edge_type in UPG_EDGE_CATALOG`) should NOT call this helper;
 * there's nothing to suggest. The helper is for the case where the edge
 * type is deprecated and the caller needs to find its canonical successor.
 *
 * @example
 * // Single-hop walk: deprecated → canonical in one step.
 * walkMigrationChainToCanonical('solution_proposes_hypothesis_claim', UPG_EDGE_CATALOG)
 * // → { kind: 'canonical', to: 'solution_proposes_hypothesis' }
 *
 * @example
 * // Drop rule short-circuits the walk.
 * walkMigrationChainToCanonical('experiment_tests_hypothesis', UPG_EDGE_CATALOG)
 * // → { kind: 'drop' }
 *
 * @example
 * // Already-canonical edge type: returns dead_end because the helper is
 * // intended for non-canonical callers. The 'canonical' branch fires only
 * // when the chain ENDS on a catalog entry, not when it STARTS on one.
 * // (In practice the validator skips this case before calling.)
 */
export type WalkMigrationChainResult =
  | { kind: 'canonical'; to: string }
  | { kind: 'drop' }
  | { kind: 'dead_end'; last: string }
  | { kind: 'cycle'; visited: readonly string[] }

export function walkMigrationChainToCanonical(
  edge_type: string,
  catalog: Readonly<Record<string, unknown>>,
): WalkMigrationChainResult {
  // Build a deduplicated `from → highest-version rule` map. Sorting versions
  // ascending and overwriting ensures the latest rule wins per `from` key;
  // so a v0.4.0 rule beats a v0.2.8 rule for the same `from`.
  const latestRuleByFrom = new Map<string, UPGEdgeMigration>()
  const sortedVersions = Object.keys(UPG_EDGE_MIGRATIONS).sort(compareVersions)
  for (const version of sortedVersions) {
    for (const rule of UPG_EDGE_MIGRATIONS[version]) {
      latestRuleByFrom.set(rule.from, rule)
    }
  }

  const visited = new Set<string>()
  let current = edge_type
  // Cap iteration as a defensive guard against pathological chains.
  // No real migration chain exceeds a handful of hops; this just bounds the
  // worst case.
  const MAX_HOPS = 32
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    if (visited.has(current)) {
      return { kind: 'cycle', visited: Array.from(visited) }
    }
    visited.add(current)

    // Canonical: we've landed on something the catalog declares; stop.
    if (current in catalog) {
      return { kind: 'canonical', to: current }
    }

    const rule = latestRuleByFrom.get(current)
    if (!rule) {
      // No rule for the current key and it's not canonical; chain dead-ends.
      return { kind: 'dead_end', last: current }
    }
    if (rule.kind === 'drop') {
      return { kind: 'drop' }
    }
    // rename: hop to the next key. Endpoint guards are intentionally
    // ignored here: the walker resolves the *type chain*, not whether a
    // specific edge instance can apply the rule. The caller (validator
    // edge_drift logic) only needs the final canonical name to suggest.
    current = rule.to
  }
  return { kind: 'dead_end', last: current }
}

/**
 * Apply edge migrations to a single edge.
 *
 * Returns:
 *   - the original edge (un-shaped, referentially equal) if no rule matched;
 *   - a new edge with retyped `type` (and possibly swapped `source`/`target`
 *     when the rule sets `flip: true`) if a `rename` rule matched;
 *   - `null` if a `drop` rule matched; caller should remove the edge.
 *
 * Endpoint guards (`requires_source_type` / `requires_target_type`) check
 * the *post-migration* endpoint types provided via `endpoints`. When
 * `endpoints` is omitted, guarded rules are skipped; callers running edge
 * migration in isolation (without endpoint type context) get only the
 * un-guarded rules.
 *
 * `T` is the caller's edge shape; only `type` is required. `source` and
 * `target` are touched only when `flip: true` and are otherwise preserved
 * verbatim.
 *
 * @example
 * // No rule matches; edge passes through unchanged.
 * const edge = { id: 'e1', type: 'persona_pursues_job' }
 * migrateEdge(edge, '0.2.0', '0.2.8') === edge // → true
 *
 * @example
 * // Rename rule matches with endpoint guards satisfied.
 * const legacy = { id: 'e2', source: 'p1', target: 'j1', type: 'persona_has_jtbd' }
 * const migrated = migrateEdge(legacy, '0.0.0', '0.2.0', { sourceType: 'persona', targetType: 'job' })
 * migrated?.type // → 'persona_pursues_job'
 *
 * @example
 * // Drop rule matches; null signals "remove this edge".
 * const dropped = { id: 'e3', type: 'experiment_tests_hypothesis' }
 * migrateEdge(dropped, '0.0.0', '0.2.7') // → null
 */
export function migrateEdge<T extends { type: string; source?: unknown; target?: unknown }>(
  edge: T,
  fromVersion: string,
  toVersion: string,
  endpoints?: UPGEdgeMigrationEndpoints,
): T | null {
  const rules = getUPGEdgeMigrations(fromVersion, toVersion)
  for (const rule of rules) {
    if (rule.from !== edge.type) continue
    if (rule.kind === 'drop') return null
    // rename: evaluate endpoint guards.
    if (rule.requires_source_type !== undefined) {
      if (endpoints?.sourceType !== rule.requires_source_type) continue
    }
    if (rule.requires_target_type !== undefined) {
      if (endpoints?.targetType !== rule.requires_target_type) continue
    }
    if (rule.flip) {
      return { ...edge, type: rule.to, source: edge.target, target: edge.source }
    }
    return { ...edge, type: rule.to }
  }
  return edge
}
