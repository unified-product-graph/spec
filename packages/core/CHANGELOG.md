# Changelog

All notable changes to `@unified-product-graph/core` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.16] - 2026-06-11

**get_tree reaches the cloud, the show-tree skill calls it, and the three "area" taxonomies get a documented cross-walk.** 0.9.15 shipped `get_tree` local-only and left the show-tree skill on its interim hardcoded chains; this release finishes the loop and closes the deferred A4 introspection gap.

### Added
- **`get_tree` on the cloud server** (cloud tools 94 to 95; local unchanged at 121). The assembler (`assembleTree` + the `GraphReader` interface) moved to the shared `@unified-product-graph/mcp-tooling` package, so the local file-backed server and the cloud Postgres-backed server assemble byte-identical trees from one source. The cloud handler builds an in-memory `GraphReader` from a one-shot product node+edge load. `get_tree` leaves the CLOUD_NA parity list.
- **`UPG_AREA_TAXONOMY`** (core): the documented cross-walk between the three overlapping "area" groupings that skills kept conflating into a stale coverage denominator: the 10 `get_graph_digest.coverage` keys, the 11 canonical regions, and the 8 "business areas". Keyed by coverage key; each row names the matching business area (null for `validation` and `operations`, which the 8-area grouping folds into discovery / omits) and the region ids its entities live in. Helpers `getCoverageKeysForRegion` / `getBusinessAreasForRegion`. Surfaced on `list_regions` (an `area_taxonomy` block plus per-region `coverage_keys` / `business_areas`) and `get_region` (per-region `coverage_keys` / `business_areas`), local and cloud. An SDK drift test pins the key sets against the runtime sources (`BUSINESS_AREAS`, `BUSINESS_AREA_META`).

### Changed
- **`/upg-show-tree` calls `get_tree`** instead of building traverse chains and resolving edge names. The skill now renders the returned roots / children, surfaces `gaps`, and notes anchor fallback; it no longer carries the edge-name chains that drifted (the exact failure `get_tree` exists to prevent). Adds the `feature_areas` pattern. Skills ship in the mcp-server package, so this reaches users with the release.

No entity, domain, region, playbook, framework, or edge-count change, and no change to the local tool surface (entities 315, edges 980, local tools 121, regions 11).

---

## [0.9.15] - 2026-06-11

**get_tree: server-side tree assembly.** Tree views (OST, OKR, user, product, validation, strategy, feature areas) were assembled client-side by the show-tree skill out of multiple query calls and hardcoded edge chains that drifted with the spec. This release relocates assembly to the server, which owns the catalogue.

### Added
- **`UPG_TREE_PATTERNS`** (core): 7 canonical tree patterns, each an anchor type + a TYPE-DRIVEN `child_map` (parent type to allowed child types), not a list of edge names. A pattern follows the live graph to a neighbour of the next expected type, whatever edge wired them, so a chain refinement in the edge catalogue cannot rot it (the failure mode that drifted the skill's hardcoded chains). Chains authored by resolving every pair against the live catalogue.
- **`get_tree`** (tools 120 to 121, local only): assembles a pattern from the active product graph and returns NESTED data plus structural `gaps` (a node whose pattern expects children the graph lacks: a bet with no initiative, an objective with no key result). Roots at the pattern anchor, falling back through `fallback_anchors` when the anchor has no nodes or reaches nothing (the "wrong root, empty tree" case), and reports the substitution (`anchor_resolved_from` / `anchor_used`). `max_nodes` summarises rather than silently truncating. Rendering (emoji, ASCII) stays in the client; the tool composes with `query` rather than replacing it.

### Notes
- `query.traverse` is unchanged: its set-vs-positional semantics is a separate concern, and flipping it would break path-walk callers, so `get_tree` encapsulates the branching multi-pass internally instead.
- A cloud-server parallel of `get_tree` is a follow-up (it needs a Postgres-store traversal); v1 is local, where the primary consumer (the show-tree skill) runs.

No entity, domain, region, playbook, framework, or edge-count change (entities 315, edges 980, tools 121).

---

## [0.9.14] - 2026-06-11

**Introspection completeness: make the live surface complete and honest so clients can stop hardcoding.** A diagnostic of the skill suite found shared docs pointing skills at an introspection field that did not exist, two redundant status fields, a silent mis-parenting path, and four expected frameworks that hard-errored. This release closes those gaps.

### Added
- **`emoji` on every type label** (the A1 keystone). `UPGTypeLabel` gains a required `emoji` field, surfaced live by `get_type_label({type})` and `list_type_labels`. One distinct glyph per active entity type (315), authored once in `entity-emoji.ts` as the single source of truth. The shared rendering docs already cited `get_type_label().emoji` as authoritative; the field now exists, so renderers can derive emojis live instead of hardcoding a partial table.
- **Three canonical frameworks** (catalog 43 to 46): `value-vs-effort` and `eisenhower-matrix` (prioritise) and `four-forces-of-progress` (JTBD, reflect). All three are real, widely-taught frameworks that `get_framework` previously hard-errored on. Promoted from `definitions/` with disambiguating slot roles.

### Changed
- **Dropped the `key_result` kr_status / status twin** (A2). `key_result` carried both a lifecycle `status` and a `kr_status` property with the identical enum (`on_track | at_risk | behind | achieved`). The redundant property is removed; `UPG_PROPERTY_MIGRATIONS['0.9.14']` lifts any authored `kr_status` to `UPGBaseNode.status` verbatim.
- **`create_node` / `batch_create_nodes` warn on a non-containment `parent_id`** (A3). A `parent_id` / `parent_ref` whose pair has no canonical containment edge did not nest as expected (it resolved a silent lateral edge or orphaned the node while suppressing the orphan hint). The create path now emits a warning (never a refusal), on the single write and on batch `validate_only`, naming the non-containment parent and pointing at `create_edge` vs a valid containment parent.

### Deferred
- A4 (reconcile the three "area" taxonomies into an introspectable mapping) and a cloud-server parallel of the A3 warning are deferred to a follow-up.

Counts: frameworks 43 to 46; no entity, domain, region, playbook, edge, or tool-count change (entities 315, tools 120, edges 980).

---

## [0.9.13] - 2026-06-11

**Foundations follow-ups: a registry-edge authoring path, specification stewardship, and three portfolio-scoped anti-patterns.** The deferred half of the foundations work (0.9.12) lands: canonical entities can now relate to one another in the registry, a specification can name its steward, and the registry surfaces the ways a foundations tier goes wrong across a portfolio.

### Added
- **`create_registry_edge`** (tools 119 to 120, local only): the authoring path for canonical-internal edges between registry entities, activating the reserved `registry.edges`. A registry `specification` can now be `governed_by` a registry `organization`, a `primitive` `defined_by` a `specification`, a `specification` extend another, all without touching a product graph. Validates that both endpoints exist in the registry, the type is a real catalogue edge, and the catalogue source and target types match the pair. Idempotent.
- **`specification_governed_by_organization`** catalogue edge (edge count 979 to 980): a registry specification's stewardship, an organization as its governing body. Organizations are registry-hostable canonicals (`define_canonical_entity` already accepts the type), so the steward is a first-class entity, not a free-text field.
- **Three portfolio-scoped anti-patterns** (`scope: 'portfolio'`, evaluated by `portfolio_validate`, surfaced in a new `portfolio_anti_patterns` block): `specification-without-implementer` (a registry specification no product, feature, or api_contract implements or conforms to), `primitive-scattered-without-canonical` (the same primitive title appears as a product-local node in two or more products with no registry canonical unifying them), and `product-reimplements-specification` (two or more products independently implement the same registry specification). These read the registry plus cross-product edges, context a single graph cannot express.

### Changed
- **`UPGCuratedAntiPattern` gains an optional `scope`** (`'graph'` default, or `'portfolio'`), and `structured_condition` is now optional. The single-graph evaluator skips portfolio-scoped patterns, so a portfolio pattern can never flip one product graph invalid; their detectors live in `portfolio_validate` instead. Anti-pattern count 15 to 18.

No entity, domain, region, or playbook count change (entities 315, domains 37, regions 11, playbooks 13).

---

## [0.9.12] - 2026-06-10

**Foundations: a first-class `specification` and `primitive` entity, plus a technical-domain enum widening.** Two governance moats that product orgs usually mismodel as products or scatter across features now have a home, and four engineering enums that real authoring outgrew are widened.

### Added
- **`specification` and `primitive` entity types** (entity count 313 to 315) in a new **`foundations`** domain and region. A `specification` is a governed spec a product implements, exposes, or conforms to (a query language, protocol, data format, encoding); a `primitive` is the compositional unit a specification defines (a block, a reference, a query value). Both are registry-hostable canonicals (`define_canonical_entity` accepts them), so a spec scattered across N products becomes one canonical that product instances link to via `instance_of`. `specification` carries a lifecycle (draft, active, deprecated, superseded); `primitive` is lifecycle-free. Both ship at `proposed` maturity, with a canonical playbook and a domain guide.
- **11 foundations edges.** Four registry-internal catalogue edges: `specification_extends_specification` (a dialect or superset), `specification_competes_with_specification`, `primitive_defined_by_specification`, `primitive_composes_primitive`. Seven portfolio cross-edges from a product-graph entity to a registry canonical (the `instance_of` shape): `product_implements_specification`, `product_exposes_specification`, `feature_conforms_to_specification`, `api_contract_speaks_specification`, `product_exposes_primitive`, `feature_manipulates_primitive`, `primitive_stored_as_data_type`.
- **`data_flow.orientation`** (`inbound`, `outbound`, `internal`): a separate axis from `direction` (cardinality), so a flow can be one-way and inbound at once.
- **A `remap_property_value` migration kind** that remaps a properties-bag enum value in place, optionally splitting it into a sibling property.

### Changed
- **Four engineering enums widened** to fit real authoring: `service.service_type` gains `cli`; `api_contract.protocol` gains `SSE`; `integration_pattern.pattern_type` gains `adapter`, `client_library`, `host_embedding`, `pipes_and_filters`, `data_sync`.

### Migrations (`UPG_PROPERTY_MIGRATIONS['0.9.12']`, dual-read on load)
- `data_flow.direction` values `inbound` / `outbound` / `internal` move to the new `orientation` property; `direction` resets to `unidirectional`.
- `integration_pattern.pattern_type`: `"data sync"` to `data_sync`, `backend_client` to `client_library`.
- `service.service_type`: `backend` to `api`.
- `api_contract.protocol`: `HTTP` to `REST`, `HTTP/SSE` to `SSE`.

Edge-catalogue count 975 to 979; region count 10 to 11; domain count 36 to 37. No new tools (119).

---

## [0.9.11] - 2026-06-10

**Tooling DX (batch 6, part 2): status pre-flight + anti-pattern visibility.** Two discoverability fixes from the same real portfolio session, plus a self-trip fix.

### Added
- **`list_status_values(entity_type)`** (tools 118 to 119, on both the local and cloud servers): the valid `status` values a type can hold, as a focused pre-flight lookup so an author no longer learns the set only from a rejected write. Returns lifecycle phases as `{ status, label, terminal }` plus `initial_status` / `terminal_statuses`, or `lifecycle_free: true` with empty `values`. Sourced from `UPG_LIFECYCLES` (exactly what the write validator checks): the low-token sibling of `get_lifecycle`.
- **Anti-pattern version tracking.** `UPGCuratedAntiPattern` gains an optional `since` field, and `get_spec_version` now reports `anti_patterns: { total, versioned }`. A consumer can see which validators are newer than the version a graph was authored under, so a spec upgrade no longer silently flips a clean graph invalid with no heads-up.

### Changed
- **A drafted hypothesis is auto-promoted to `active`** when it gains a `hypothesis_requires_experiment_plan` edge (via `create_edge` / `batch_create_edges`). Pairing a hypothesis with a plan is what activates it; this stops the documented structural-spine recipe (hypotheses paired with plans) from self-tripping the `untested-hypothesis-pile-up` anti-pattern. Best-effort: a promotion failure never fails the edge.

No entity, domain, or edge-catalogue count change (tool count 118 to 119).

---

## [0.9.10] - 2026-06-10

**Tooling DX + a born-valid product (batch 6, part 1) + a release-test gate.** Polish from a real multi-graph portfolio session: parity and discoverability fixes, one model correction, and — the headline — the release train now runs the unit suites, after they were found to have been silently red across a release.

### Changed
- **Product `properties.stage` is canonical.** The stale `UPG_PROPERTY_MIGRATIONS['0.2.13']` lift of a product node's `properties.stage` to top-level `status` is retired: it contradicted the current convention the whole runtime uses (a product node's lifecycle stage lives in `properties.stage`), so a freshly-created product read as `property_drift` against its own validator. A new product is now born valid. Legacy values are still normalised on read by `coerceProductStage`. Decision: `2026-06-10-product-stage-properties-canonical.md`.
- **`get_nodes` resolves cross-product ids.** A qualified `{product_id}/{node_id}` (the form `list_registry` / `export_edges` / cross-edges return) now reads that product's graph (read-only for non-active products), so a connective pass fetches node content across the portfolio without a `switch_product` sweep. Results carry a `product_id`.
- **`create_edge` / `batch_create_edges` accept the `p_` product-header** where the in-graph product node is expected, resolving it to the `type:"product"` node (older graphs carry a distinct `n_…` product node).
- **`did_you_mean` for a mistyped edge type** now falls back to the closest catalogue key by name (edit distance) when the endpoints don't resolve to a canonical pair — so a typo always gets a concrete suggestion.
- **`batch_create_cross_product_edges` reaches enum parity** with `create_cross_product_edge` (both now derive their type list from one spec source, so the batch tool can no longer lag a release behind — it had been missing `rolls_up_to`).
- **`batch_register_instance` echoes** `aliased` / `alias_updated` per result, so a bulk sanction pass is visible without a second `portfolio_validate`.

### Fixed
- **Release-test gate.** The publish train now runs the train packages' unit suites (`gate:tests`) as a hard pre-flight; a red test aborts the train. This closes the gap that let a prior release ship with several silently-red suites — including import adapters that emitted edge types a rename had retired (now corrected), stale compiled test copies, and fixtures referencing retired edges.

No new tools (118) and no entity / domain / edge-catalogue count change.

---

## [0.9.9] - 2026-06-10

**Structural-integrity forks: validation, AI-prompt, and journey models corrected; duplicate edges collapsed.** A spec-model cut that fixes several long-standing structural mismodels and retires shadow edges. Every renamed or retired edge ships a dual-read migration (`UPG_EDGE_MIGRATIONS['0.9.9']`), so stored graphs upgrade automatically on load. No new tools (118) and no entity-count change; the within-product edge catalogue settles at 975 after the duplicate collapse.

### Changed
- **Validation experiment-model reshape.** The validation chain is corrected to the single-parent line `hypothesis → experiment_plan → experiment → experiment_run`. The plan-to-experiment containment inverts: `experiment_has_plan` becomes `experiment_plan_designs_experiment` (the plan designs the experiment it owns), and `experiment` gains its stable hypothesis loop (`hypothesis_tested_by_experiment`, `experiment_validates_hypothesis`).
- **`test_plan` re-homed validation → QA.** `test_plan` is now a QA artefact rather than a validation planner; its planning role is absorbed by `experiment_plan`. New QA edges `product_plans_qa_via_test_plan`, `test_plan_executed_by_test_suite`, and `test_plan_specifies_test_environment`; the validation-side `hypothesis_planned_via_test_plan` and `test_plan_ran_as_experiment_run` are dropped.
- **AI prompt-model correction.** The prompt abstraction is inverted to the correct `ai_model → prompt_template → prompt_version` containment (`ai_model_defines_prompt_template`, `prompt_template_contains_prompt_version`, `prompt_version_supersedes_prompt_version`), with the evaluation, tracing, and provenance bridges (`eval_run_evaluates_ai_model`, `eval_run_scores_prompt_version`, `ai_trace_executed_prompt_version`, `hallucination_report_traces_to_ai_trace`, `hallucination_report_caused_by_root_cause`, `ai_dataset_sourced_from_data_source`). The backwards/obsolete prompt edges are dropped.
- **Strategic-theme containment edge renamed.** `objective_rolls_up_to_strategic_theme` → `strategic_theme_contains_objective` (source-first key, clean `contains` verb; endpoints unchanged).
- **`touchpoint_channel` constrained to a medium enum** (`in_app` | `email` | `phone` | `chat` | `sms` | `in_person` | `mail`), disambiguating the interaction *medium* from a go-to-market *channel* (`marketing_channel` / `acquisition_channel` / `distribution_channel`).
- **Journey-model de-duplication** and **duplicate / shadow edge collapse**: byte-identical shadows, tense/suffix twins, and near-synonym edges collapse onto their surviving canonical keys (each dual-read), lowering the edge-duplicate collision bound. `UPG_EDGE_COUNT` 979 → 975.

### Migration
- **`UPG_EDGE_MIGRATIONS['0.9.9']`** dual-reads every renamed or dropped edge key, so a graph written by an earlier version resolves to the new canonical edges on load. Renames with an inverted direction carry a `flip`; superseded edges with no structural replacement are `drop`ped.

---

## [0.9.8] - 2026-06-10

**Registry lifecycle + portfolio-tier audience and metric edges (batch 5).** Closes the lifecycle gaps found while standing up a real shared-entity registry: canonicals can now be edited, batch-created, and promoted from existing nodes; deliberate name divergences can be sanctioned; and two new portfolio edges connect the org axis to its audience and complete the measurement cascade.

### Added
- **Three cross-edge types** (`UPG_CROSS_EDGE_TYPES` 9 to 12): `area_serves_persona` and `area_targets_market_segment` (a `product_area` to a canonical registry persona / market_segment, carrying optional primary/secondary `relevance` and an `audience_role`), and `rolls_up_to` (a product metric feeds a company/portfolio metric: the measurement cascade, mirroring `contributes_to` for the OKR cascade).
- **Optional `UPGCrossEdge` qualifiers**: `alias` (sanction a deliberate instance title divergence), `relevance`, and `audience_role`. The canonical serialiser round-trips all three.
- **Five MCP tools** (113 to 118): `update_canonical_entity` (edit a canonical without disturbing its instances), `batch_define_canonical_entity` and `batch_register_instance` (atomic registry stand-up), `promote_to_canonical` (lift an existing node into the registry), and `link_area_to_audience` (create the area audience edges with qualifiers).
- **`get_node` resolves `registry/{id}`**: registry entities are first-class for reads, returning the canonical plus its instances.

### Changed
- **`register_instance` accepts `alias`**, and `portfolio_validate`'s `registry_drift` honours it: a sanctioned divergence leaves the drift count (a new `sanctioned` tally), so `clean: true` means "no unexpected drift".
- **`create_edge` / `batch_create_edges` error hints**: a `p_` product-header id used where an in-graph node id is expected returns a targeted identity error, and an unknown explicit edge type returns a `did_you_mean` resolved from the endpoint types.
- **Generic `create_cross_product_edge`** accepts `rolls_up_to` and rejects the registry/area edge types (directing to `register_instance` / `link_area_to_audience`).

No entity, domain, or within-product edge-catalogue count change. The area-anchored edges carry a portfolio `product_area` id as their source: the only cross-edge source that is not a `{product_id}/{node_id}` pair.

---

## [0.9.7] - 2026-06-10

**Domain-wiring remediation (passes F1–F8) + saturated-fixture refresh.** A spec-integrity hardening cut: eight remediation passes from a 36-domain wiring audit, each shipping its own machine-checkable gate so the class of drift it fixes cannot silently recur. No new tools and no breaking API surface — additive edges/properties plus integrity gates.

### Added
- **Region/manifest integrity gate** (F1): `region-integrity.test.ts` proves the 10 canonical regions cover every active entity type exactly once, with the Nucleus tier explicitly exempt via `NUCLEUS_DOMAINS` / `SHARED_TYPES`. Reconciles all 10 region rosters against the domain registry (un-orphaning the entities that had drifted out of their region — the P-H pattern) and corrects 7 phantom intra/boundary edge references. Decisions: `2026-06-10-nucleus-region-exemption.md` plus three model-reconciliation ADRs.
- **Edge-prefix + duplicate-edge gates** (F2/F3): `edge-prefix-gate.test.ts` enforces that every edge key's leading token-run equals its `source_type` (token-aware); `edge-duplicate-gate.test.ts` bounds byte-identical and `(source, target, classification)` collision groups against a frozen baseline.
- **Anti-pattern detectors** (F5): two prose anti-patterns promoted to machine-checkable detectors (`insights-without-evidence`, `feature-requests-without-provenance`); `UPG_ANTI_PATTERNS` 13 → 15, surfaced via `validate_graph`.
- **28 forward-bridge / dead-end-leaf edges** (F6): closes 0-outbound leaves and missing semantic bridges from the audit (`UPG_EDGE_COUNT` → 979); `affinity_cluster` gains `observation` as a valid child.
- **Five `*_order` sequence scalars** (F8): `user_flow.flow_order`, `screen_state.state_order`, `learning_path.path_order`, `milestone.milestone_order`, `partner_tier.tier_order`, propagating the `*_order` presentation convention; `ordering-convention.test.ts` pins the set.

### Changed
- **`funnel_step` edge endpoints corrected** (F2/F3): three `funnel_step_*` edges retyped from `funnel` to `funnel_step` (key-stable; no migration needed — stored graphs reference edges by key).
- **alt_labels collision sweep** (F4): 14 cross-type alt-label collisions removed and bare tokens qualified (`channel`, `segment`, …); `alias-collision.test.ts` guards against recurrence.
- **Five types graduated `proposed` → `stable`** (F7): `metric_quality_assessment`, `classification_axis`, `classification_value`, `brand_logo`, `brand_imagery`. No entity-count change (the count is domain-membership-gated, not maturity-gated).

### Fixed
- **SATURATED fixture refreshed**: propagated the `theme` → `roadmap_theme` (0.9.0) and `journey_phase_has_step` → `journey_phase_spans_journey_step` (0.9.2) renames into `.upg/notion-saturated.upg`, and added instances for the new edge types, restoring full saturation coverage.

---

## [0.9.6] - 2026-06-10

**Canonical shared-entity registry + drift detection (canonical-registry initiative, Phases 2–3).** The core of the registry: a portfolio can now define a shared entity ONCE and have every product's local copy link to it as a canonical instance, with drift surfaced automatically. Decision: `2026-06-10-canonical-shared-entity-registry.md`.

### Added
- **`instance_of` cross-edge** (9th member of `UPG_CROSS_EDGE_TYPES`): a directed *product entity → canonical (registry) entity* relationship — "this product node is an instance of that shared, authoritative node." Endpoints must share a type (a `persona` instance_of a `persona`); the target is addressed as `registry/{node_id}`. Distinct from the symmetric `shares_*` peer edges and coexists with them (canonical-to-instance vs peer-equivalence; neither deprecates the other). Unlocks rollup ("every Developer instance and its per-surface jobs"), cross-instance diff, and drift detection.
- **`registry` section on the portfolio document** (`UPGPortfolioDocument.registry`, shape `UPGRegistry`): the shared-vocabulary tier that sits above products. Canonical entities are normal `UPGBaseNode`s (no new type, no flag — canonical-ness is conferred by living in the registry). Optional and additive: portfolios without a registry stay valid and byte-identical; an empty registry is omitted on serialise. `REGISTRY_PRODUCT_ID = 'registry'` is the reserved pseudo product-id used to qualify registry references; product creation rejects it.
- (SDK) `UPGPortfolioStore` registry accessors: `getRegistry` / `ensureRegistry` / `addRegistryNode` / `getRegistryNode` / `listRegistryNodes(type?)` / `removeRegistryNode`. The canonical serialiser round-trips the registry section (write + normalise).
- (MCP server) three local registry tools: **`define_canonical_entity`** (create a canonical node in the registry), **`register_instance`** (create an `instance_of` edge from a product node to a canonical, enforcing the same-type constraint and the `registry/` target), and **`list_registry`** (list canonical entities, optionally with their instances). Tool surface 110 → 113. Local-only (portfolio.upg is a workspace concept; no cloud analogue).
- (MCP server) **registry drift detection in `portfolio_validate`** (Phase 3): flags an `instance_of` edge whose target is missing from the registry, whose endpoints disagree on type, or whose instance title diverges from its canonical (off-canon rename). The payoff of the registry — a renamed-off-canon instance is now *detectable*, not silent.

### Changed
- `create_cross_product_edge` and `batch_create_cross_product_edges` reject `instance_of`, directing callers to `register_instance` (single enforcement path for the registry's same-type + `registry/` target rules). `list_cross_edge_types` now reports nine types.

### Notes
- Phase 4 (`primitive` / `standard` type for foundational shared tech) remains deferred pending a coverage pass against existing `dependency` / `capability`; it must not block the registry core. No entity / domain / edge-catalogue count change (cross-edges are a separate union from `UPG_EDGE_CATALOG`).

---

## [0.9.5] - 2026-06-10

**Persona `audience_role` (canonical-registry initiative, Phase 1).** A small, independent property change — the first cut of the canonical shared-entity registry initiative. Decision: `2026-06-10-canonical-shared-entity-registry.md`.

### Added
- `PersonaProperties.audience_role`: optional enum `'buyer' | 'user' | 'champion' | 'influencer' | 'partner'` — the decision-making-unit (buying-committee) split. A portfolio must separate the economic **buyer** (who signs) from the practitioner **user** (who uses); they are distinct personas with distinct jobs, and flattening them loses the most important B2B distinction. Closed set so roles compare across products. Backward-compatible: optional, existing personas unaffected. No entity / edge / tool count change.

### Notes
- This unblocks the registry initiative's stopgap migration (each canonical persona gets tagged with `audience_role`). The registry core — an `instance_of` cross-edge + portfolio-tier canonical hosting + drift detection — is designed (Phases 2–4) and sequenced for later cuts.

**Cross-product structure clone + pre-commit preview + target-profile coverage (batch-4, part 2).** No core spec change — one new local MCP tool plus two opt-in parameters. Decision: `2026-06-09-cross-product-structure-clone.md`.

### Added
- (MCP server) **`clone_structure`** (batch-4 #17): copies the SHAPE of one product (typed nodes + canonical edges + hierarchy, with `TODO:` placeholder titles tagged `stub`) into another — the single biggest lever for multi-product structural parity, replacing a near-identical per-product skeleton rebuild. Content (descriptions, properties, real titles, statuses) never crosses; only structure does. `from_product` is the read-only exemplar; `into` is the write target and **defaults to the active product**, but naming a non-active product writes there directly with **no `switch_product`** (the cross-product write deferred from batch-3, scoped to shape-only). `regions` scopes the clone; `dry_run: true` previews. Atomic-with-rollback on commit; non-canonical source edges are skipped and reported, not fatal. Tool surface 109 → 110. Local-only.
- (MCP server) **`validate_graph` pre-commit preview** (batch-4 #18): `pending_nodes` / `pending_edges` evaluate anti-patterns against the CURRENT graph PLUS a proposed delta WITHOUT writing, and return which violations the delta would **newly trigger or resolve** (`delta.newly_triggered` / `newly_resolved`). Lets an agent converge to clean in one pass instead of write → validate → patch cycles. Pending edges reference existing node ids or `$N` indexes into `pending_nodes`; edge type is inferred from endpoints when omitted. Evaluated in a synthetic read-only view — never mutates or persists.
- (MCP server + SDK) **`coverage_profile`** on `get_graph_digest` and `portfolio_digest` (batch-4 #22): score coverage against a caller-chosen region set (keys of the `coverage` block) instead of the product-stage default. A deliberately-scoped product (e.g. a structural spine) reads its parity via `coverage.profile_summary.overall_pct` without out-of-scope regions (GTM / pricing / business) dragging the headline down. `portfolio_digest` adds a per-product `coverage_profile_pct`, making "is this product at parity?" a direct read across the portfolio.

### Notes
- Batch-4 is complete with this cut. The `instantiate_spine({ profile })` variant (a predefined-skeleton catalogue) remains a possible future addition if a profile surface proves worth the spec cost.

---

## [0.9.3] - 2026-06-09

**Multi-product authoring safety pack (batch-4, part 1).** No core spec changes — a DX + safety release for the MCP server and SDK, surfaced from bringing an entire product org to structural-spine parity through one single-active-product server (~850 nodes / ~1,259 edges across 12 graphs). Every change is additive and backward-compatible. Decision: `2026-06-09-multiproduct-authoring-safety.md`.

### Added
- (MCP server + SDK) **`validate_only` dry-run** on `batch_create_nodes` and `batch_create_edges` (batch-4 #15): run the full validation pass (types, status, refs, edge directions/pairs) and report `{ valid, errors, would_create_* }` WITHOUT writing. Errors now ACCUMULATE across the whole batch, so an agent fixes every bad item in one pass instead of losing the batch to the first. Folds in batch-4 #21 (status-vocabulary footguns are caught pre-commit).
- (MCP server + SDK) **`ref` aliases** for `batch_create_nodes` (batch-4 #16): a node may declare a batch-local `ref`, referenceable from `parent_ref` / `edges[].from_ref` / `to_ref` in place of a positional `$N` — removing the index-counting that was the #1 cause of failed batches. A stray `$`-prefixed token that resolves to neither a valid `$N` nor a declared alias is now rejected explicitly (was silently treated as a node id); failures echo the alias `ref_map`.
- (MCP server) **`portfolio_validate`** (batch-4 #19): run `validate_graph` across every product in scope in one call — the audit counterpart to `portfolio_digest`. Replaces the `switch_product` + `validate_graph` round-trip per product; reuses the single-product code path verbatim so per-product verdicts can never diverge. Tool surface 108 → 109. Local-only (no cloud analogue).
- (MCP server) **`expect_product` guard + `active_product` echo** on active-product writes (batch-4 #20): every write to the active product's graph echoes `active_product: { id, title }`, and accepts an optional `expect_product` arg that aborts before writing if the active product isn't the one named — cheap insurance against a forgotten `switch_product` writing into the wrong graph in a multi-product session.

### Notes
- Cross-product WRITE (content propagation into product internals) and the structure-template / `clone_structure` operation (batch-4 #17), pre-commit anti-pattern preview (#18), and coverage profiles (#22) are scoped for the 0.9.4 cut.

---

## [0.9.2] - 2026-06-09

**Journey-model disambiguation.** The four Experience-Design journey types (`user_journey`, `journey_phase`, `journey_step`, `journey_action`) had a coherent concept but broken wiring: there was no deterministic answer to "what are the steps of this journey?". A `journey_phase` is now a temporal band that **spans** steps, not a container that **owns** them, mirroring the marketing precedent `customer_journey_stage_spans_journey_step`. Steps stay owned by `user_journey` (the stable 0.1.0 spine), so each step has exactly one containment parent and the journey renders one canonical step list. Additive plus one edge rename (dual-read via `UPG_EDGE_MIGRATIONS['0.9.2']`). Decision: `2026-06-09-journey-model-disambiguation.md`.

### Added
- `journey_action_surfaces_need` and `journey_action_realised_by_feature` edges: `journey_action` previously had zero outbound edges despite carrying `pain_score` / `opportunity_score` "to drive opportunity discovery". Opportunity discovery now routes through `need` (which reaches `opportunity` via `opportunity_addresses_need`), mirroring `journey_step_reveals_need` one level deeper.
- `JourneyStepProperties.step_order` and `JourneyActionProperties.action_order`: scalar ordering, completing a single `*_order` convention across phase / step / action (matching the existing `phase_order` and `customer_journey_stage.stage_order`). `journey_step_precedes_journey_step` remains the explicit-chain option for branching journeys.
- `journey-phases-without-canonical-steps` curated anti-pattern (high severity): fires when phases span steps but no journey owns them via `user_journey_contains_journey_step`, so `validate_graph` surfaces a journey with no canonical step spine.

### Changed
- **`journey_phase_has_step` → `journey_phase_spans_journey_step`** (paired, via `UPG_EDGE_MIGRATIONS['0.9.2']`): the phase-to-step edge becomes non-owning (verb `has_step` to `spans`, classification `hierarchy` to `cross-domain`). `journey_phase` is removed as a containment parent of `journey_step` in the hierarchy; `user_journey` keeps `journey_step` (owned spine) and `journey_phase` (band overlay).
- `properties/domains/ux-design.ts` JSDoc reconciled to the actual edge names (removed six phantom edges that the spec documented but never shipped).
- `presentation/labels.ts` alt-label collisions removed: `user_journey` drops `"customer journey"` (collided with `customer_journey_stage`); `journey_step` drops `"touchpoint"` and `"journey phase"` (distinct entity surfaces).
- `intelligence/domain-guides.ts` UX creation sequence reordered so `journey_step` precedes its child `journey_action`.

### Notes
- `journey_phase` and `journey_action` remain `proposed` (the v0.2 Experience-Design extension over the stable 0.1.0 journey/step spine); not promoted to `stable` in this pass.

---

## [0.9.1] - 2026-06-09

**Cross-product read layer + an OKR-alignment edge + a workspace-resolution fix.** One core spec addition (the `contributes_to` cross-product edge), the read counterpart to 0.8.16's portfolio write tier (server tooling), and a `switch_product` bug fix. From batch-3 dogfooding (portfolio strategy reasoning across the full multi-product workspace). All additive; existing files stay valid.

### Added
- `contributes_to` cross-product edge type in `UPG_CROSS_EDGE_TYPES` (union 7 → 8): the directional OKR rollup / alignment edge, subordinate → superior (product `objective` → company `objective`, product `key_result` → company `key_result`, product `outcome` → company `outcome`). Unlike the symmetric `shares_*` peer edges it is hierarchical, so a portfolio can answer "which company objective is this product serving?" and "which company KRs have no product driving them?". Additive; existing files stay valid. Decision: `2026-06-09-cross-product-okr-alignment-edge.md` (batch-3 #14).
- (MCP server, not core spec) `portfolio_query` + `portfolio_digest`: read node content and health digests ACROSS products in one call — the multi-product `query` / `get_graph_digest` — without `switch_product`. The read counterpart to the 0.8.16 portfolio write tier. Read-only and parallel-safe: the active product is read from the live store, every other product via a transient read-only load. Tool surface 106 → 108 (batch-3 #13).
- (SDK) `UPGFileStore.loadReadOnly()`: parse + normalise + index a `.upg` without starting a file watcher or taking a lock, for transient cross-product reads.

### Fixed
- (MCP server) `switch_product` bare-name resolution now anchors to the workspace `.upg/` directory first and requires a regular file, so a bare product name (e.g. `sanity`) that collides with a sibling source directory (`sanity/`) loads `.upg/sanity.upg` instead of throwing `EISDIR` (batch-3 #12).

### Deferred
- Cross-product **write** (writing nodes/edges into non-active products without `switch_product`) is tracked as batch-4 — the write counterpart to this read layer. Strategic linkage across products is already expressible today via `contributes_to` cross-edges (no switching required); only content propagation into product internals is outstanding.

---

## [0.9.0] - 2026-06-09

**Breaking type rename (with migration) + framework-scoped scoring completion.** Two coordinated spec changes ship in this cut, both additive + deprecate (existing `.upg` files dual-read via `UPG_MIGRATIONS['0.9.0']`): the `theme` → `roadmap_theme` rename (completing the N6 four-way theme-family disambiguation) and the framework-scoped scoring migration for `solution` + `opportunity` (completing). Decisions: `2026-06-09-theme-roadmap-theme-rename.md`, `2026-06-05-framework-scoped-scoring-completion.md`.

### Added
- `roadmap_theme` entity type (`ent_351`), the canonical successor to `theme`. Same property surface (`theme_scope`, `priority`); no property migration.
- `strategic_theme_realised_by_roadmap_theme` edge: a semantic (not hierarchy) soft bridge from the annual strategy focus area to the roadmap grouping that realises it. The two sit on different spines (strategy cascade vs roadmap cascade), so it is a cross-reference, not containment.
- `opportunity-sizing` framework (Reach, Frequency, Pain to Opportunity Score): the discovery-prioritisation method that previously lived as native `opportunity` fields, now modelled like RICE with `scope: 'framework'` inputs, promoted into the canonical (public) catalog. (Distinct from the existing Ulwick `opportunity-scoring`, which scores importance vs satisfaction.)
- `solution` added to `rice-scoring`'s `applies_to` / slots / scored entity types. Solutions are now RICE-scored through the framework, not via native columns.
- `EntityTypeMeta.default_frameworks?: string[]`: a declarative, type-level pointer to the frameworks usually applied to a type. Set on `opportunity` (`['opportunity-sizing', 'rice-scoring']`) and `solution` (`['rice-scoring']`).

### Changed
- **`theme` → `roadmap_theme`** across the catalog: union, `EntityTypeMeta`, hierarchy (`roadmap → roadmap_theme → feature`), labels, region anchors, playbooks, domain guides, and `RoadmapThemeProperties` (was `ThemeProperties`).
- Edge renames (paired, via `UPG_EDGE_MIGRATIONS['0.9.0']`): `product_categorises_by_theme → product_categorises_by_roadmap_theme`, `roadmap_categorised_by_theme → roadmap_categorised_by_roadmap_theme`, `theme_groups_feature → roadmap_theme_groups_feature`, `theme_spans_feature_area → roadmap_theme_spans_feature_area`.
- Terminology: prose standardised on **"framework-scoped"** (the code has always said `scope: 'framework'`); "lens" is reserved for the read-time role projection (`presentation/lenses.ts`). Renamed the `ARCHITECTURE.md` "Framework Properties" section and the `frameworks/` + `properties/` READMEs accordingly. No behavioural change.

### Deprecated
- `theme` (`ent_080`): retained in the type union and resolvable via the migration map for the 0.9.x dual-read window; `replacement: 'roadmap_theme'`. Loaders retarget old nodes and the four old edge keys automatically.
- `solution`: `reach`, `impact`, `confidence`, `effort`, `rice_score` (apply `rice-scoring`). `timeline` is unaffected (intrinsic).
- `opportunity`: `reach`, `frequency`, `pain`, `opportunity_score` (apply `opportunity-sizing`).
- Native scoring fields are signalled deprecated via `@deprecated` JSDoc (flowing into the generated `UPG_PROPERTY_SCHEMA` descriptions) and stay dual-read for 0.9.x. Removal plus the `migrate_properties` lift onto `framework_exercise` includes-edges lands in a later 0.9.x cut (originally earmarked 0.9.1; 0.9.1 became the batch-3 read layer), **after** consumers read from the edge (never before: a premature data move silently flattens sort/quadrant surfaces to zero).
- Follow-up (0.9.x): a machine-readable `PropertyDefinition.deprecated` field so the property-registry generator emits it and the public GraphQL generator can mark removed scalars `@deprecated` rather than dropping them silently.

---

## [0.8.16] - 2026-06-09

### Added
- `hosts` cross-product edge type in `UPG_CROSS_EDGE_TYPES`: composition / hosting, directed host → hosted (matching the spec's container → contained convention; distinct from `depends_on_product`, a runtime dependency). Additive; existing files stay valid. Decision: `2026-06-09-cross-product-composition-edge.md`. Shipped with the local MCP portfolio edit/cleanup tier (server tooling, not core spec): `update_area`, `remove_product_from_area`, `detach_product_from_portfolio`, `delete_area`, `move_product_to_area`, `delete_cross_product_edge`, `batch_create_cross_product_edges`.

---

## [0.8.15] - 2026-06-09

### Added
- `owner?: string` declared on the `product_area` shape and `ProductAreaProperties` (the person or team that owns the area). Previously accepted by `create_area` but silently dropped. §C.

### Changed
- `UPGProductArea.strategic_priority` reconciled to the canonical `Priority` scale (`urgent | high | medium | low | none`); legacy `critical` coerces to `urgent` on the write path..

---

## [0.8.13] - 2026-06-04

A co-versioned patch. The catalogue is unchanged. The agent-facing cloud `list_frameworks` tool description shipped a stale literal (`351 total at v0.3.0`); de-numbered to mirror the local server, and refreshed the generated tool-reference snapshots.

### Changed
- `cloud-server` `list_frameworks` description de-numbered (no behavioural change). The live manifest reflects it on the next cloud redeploy.

---

## [0.8.12] - 2026-06-04

A co-versioned patch. The catalogue is unchanged; the fix is in the canonical serialiser.

### Fixed
- `serializeCanonical` now reconciles the root product summary from its canonical `type: 'product'` node when one is present. The product is denormalised twice (the root `doc.product`, mirrored into the `$upg` header, and a product node sharing its id); graph edits touched the node while the root summary and header drifted (e.g. a header reading `stage: concept` while the node already said `launch`). The header, the derived summary, and the body product block now re-derive from the node's live title/description/stage on every write, with the integrity checksum kept consistent. Self-healing on the next write; root-only products are unchanged. (#1981)

## [0.8.11] - 2026-06-03

A co-versioned patch. The catalogue, entity types, and edges are unchanged; the fix lands in `@unified-product-graph/mcp-server`.

### Fixed
- MCP server startup no longer prints an inverted deprecation warning for canonical types. The check sourced deprecation from the historical migration union, which still lists `hypothesis` from the v0.2.8 split even though it was re-promoted to canonical-stable at v0.4.0, so graphs holding canonical `hypothesis` nodes were flagged and pointed at a deprecated type. Detection and the suggested replacement now read from entity-meta (`isDeprecatedType` / `getReplacementType`), the source of truth for current maturity. (#1976)

## [0.8.10] - 2026-06-03

A patch release. Fixes a false-positive in framework-score validation.

### Fixed
- Framework-score validation no longer flags a zero in a parenthesised **sum** denominator as an illegal divisor. Kano's satisfaction coefficient divides by `(delighter_count + performance_count + must_be_count + indifferent_count)`; the old heuristic captured the first term and warned that a legitimate `delighter_count: 0` "must not be 0". Only a lone divisor (`/ effort`, `/(job_size)`) is flagged now, and every computed expression is scanned, not just the first. RICE, WSJF, and Cost of Delay divisors still flag a 0 as before.

## [0.8.9] - 2026-06-03

Completes the framework composition model and frees the "lens" vocabulary. `UPG_VERSION` moves to `0.8.9` in lockstep with the package train (a release guard now enforces this; the published 0.8.8 had left it at 0.8.7).

### Added
- `slot_role` on the `framework_exercise_includes_node` edge: an entity in a framework exercise can record which slot role it plays (e.g. `pain_reliever`), on the same edge as its scores. Validated against the framework's declared slot roles (warn-only). [Phase 3b-2]

### Changed
- Renamed the framework-authoring field `scoring_lens` → `scoring_method` (type `FrameworkScoringLens` → `FrameworkScoringMethod`), freeing "lens" for the perspective-lens system and aligning with the "a framework is a method" framing. The expanded `required_properties`/`computed_properties` surface is unchanged.

## [0.8.8] - 2026-06-03

Framework composition model + scoring-lens completion. `UPG_VERSION` stays `0.8.7`: the catalogue (entities, edges, scales, regions, domains) is unchanged; these are framework-authoring and validator additions.

### Added
- First-class `role` on `FrameworkSlot`: a stable machine-readable semantic id (e.g. `pain_reliever`, `accountable`, `must_have`) distinct from `entityTypeId`, so frameworks that fill several slots with the same entity type are addressable by the part each slot plays. Populated across the 16 repeated-type frameworks. Additive and optional; not a validation signal.
- Framework-score validation as WARNINGS (`rule: 'framework-score'`, in `CONTENT_DEPTH_WARNING_RULES`): a `framework_exercise`'s persisted per-entity scores are checked against the framework's own input spec (enum bucket, in-scale assessment, non-negative number, non-zero divisor). A drifted exercise still loads; `verify`/`check` escalate to exit 2.

### Changed
- `kano-model` and `raid-log` now declare their derivations via `scoring_lens` (kano's `feature` promoted to `role: scored_item`), so all six computing frameworks use one authoring model. Derived `required_properties`/`computed_properties` are byte-identical.

### Fixed
- Structural validation now rejects a malformed `properties` container (non-object) as an error, and reports a present-but-non-array `nodes`/`edges` with a self-explaining message instead of a downstream `.map` crash (/641).

## [0.8.7] - 2026-06-03

Framework-surface consolidation + the CLI-hardening and cross-surface QA wave. `UPG_VERSION` is now `0.8.7`. (Co-versions the 0.8.6 train, whose changelog entry was skipped.)

### Added
- `scoring_lens` (optional) on `FrameworkDataSpec`: declare a framework's scoring inputs + formula once and list the entity types it `applies_to`; a build-time expander derives the per-type `required_properties`/`computed_properties`, so the public surface stays fully expanded. The four scorers (RICE/ICE/WSJF/cost-of-delay) now use it.
- Content-depth validation as WARNINGS (never load-blocking errors): `property-type`, `property-enum`, and `self-loop` checks, plus `CONTENT_DEPTH_WARNING_RULES` so `verify`/`check` re-classify them to a CI failure while the load path stays permissive. Whitespace-only node titles are now an error (symmetric with empty).

### Changed
- `canonical.ts` is now a generated projection of `definitions/` (single source of truth), with a `regen:canonical --check` sync gate wired into `prepublishOnly`.
- `team-health-check`: `team` is now `role: 'item'` (it carried no scoring inputs); added a `SCORED_ITEM_WITHOUT_INPUTS` shape-audit guard (gated to zero on the canonical surface). Refreshed RICE and cost-of-delay descriptions for the broadened scored-type sets.

## [0.8.5] - 2026-06-02

Co-version with the @unified-product-graph/* 0.8.5 fast-follow (skill_audit source resolution, CLI/docs consistency, npx-cache fix, exercise-aware prioritise hint). No spec/catalogue change; `UPG_VERSION` stays `0.8.4`.

## [0.8.4] - 2026-06-02

Framework exercises. `UPG_VERSION` is now `0.8.4` (catalogue change). Folds the 0.8.3 patch train (CLI/MCP wiring fixes; no catalogue change).

### Added
- `framework_exercise` entity type (Workspace domain): one run of a framework over a set of entities. Containment-free, with a draft/active/archived lifecycle and `framework_id` + `inputs_snapshot` properties.
- `framework_exercise_includes_node` edge (`includes` / `included_in`, polymorphic target): links an exercise to each entity it scores and carries the framework's per-entity result (a MoSCoW bucket, a RICE score, a canvas slot, a funnel stage) as edge properties.
- Gated edge properties: `UPGEdge.properties` plus a `carries_properties` capability flag on edge definitions. Only edges that opt in may carry a payload; the canonical serializer round-trips it byte-stably. New `edgeCarriesProperties(type)` helper.

## [0.8.2] - 2026-06-02

Co-version with the @unified-product-graph/* 0.8.2 release train.

### Added
- Eight additional frameworks promoted to the canonical set (34 -> 42), with full scoring-input and approach coverage.

### Changed
- Framework scoring inputs are now marked with an explicit `framework` scope, keeping entity properties intrinsic (scoring criteria belong to the framework, not the entity).
- Framework input renames and closure fixes for internal consistency.
- `UPG_VERSION` -> `0.8.2`.

## [Unreleased]

## [0.7.5] - 2026-05-30

### Added — canonical `.upg` serialisation (`upg fmt`) + `$upg` header

**Additive patch release.** The new serialiser, header types, and read path are purely additive
over 0.7.4 — no exports removed, no breaking changes — so this ships as `0.7.5`. The breaking
`0.8.0` is reserved for the deprecated-property removal. `UPG_VERSION` (catalogue version)
stays `'0.7.3'`; the on-disk `format_version` is `'1.0.0'`.
A single shared serialiser in core, `serializeCanonical(doc) → string`, so the same logical graph
always produces byte-identical output regardless of which tool wrote it — git then diffs *meaning*,
not formatting. Anchored on RFC 8785 (JSON Canonicalization Scheme) for object-internal rules, with
two deliberate deviations for the review lifecycle: pretty-print (2-space, one element per line, LF)
and semantic sorting of the set-like arrays (`nodes`, `edges`, `cross_edges`, `tags`; `aliases`
order preserved as append-only history).

New exports from `@unified-product-graph/core`: `serializeCanonical`, `parseUpg`,
`normalizeDocument`, `formatUpgText`, `isCanonical`, `computeBodyChecksum`,
`UPG_CANONICAL_FORMAT_VERSION` (`'1.0.0'`), plus the `$upg` header types.

- **Single-product** files adopt the canonical `$upg`-header envelope: consolidated metadata
  (`format_version`, `spec_version`, product summary, counts, provenance, body integrity) in one
  leading object; `product`/`nodes`/`edges` stay top-level.
- **Portfolio** files also adopt the canonical `$upg` envelope (`$upg.kind: "portfolio"`);
  organisation + collections stay top-level. The portfolio store (and every MCP portfolio tool
  through it) reads via `normalizeDocument`, accepting both `$upg` and legacy flat portfolios.
- **Drift repair:** double-encoded JSON in `properties`/`tags` (found in real dogfood graphs) is
  restructured on serialise, or rejected with a precise error.
- **Read path:** `parseUpg`/`normalizeDocument` accept both the `$upg` and legacy flat envelopes →
  the flat in-memory `UPGDocument`. Wired into the SDK store (load/save/merge), workspace create,
  the MCP server init writes, and the CLI `init`/`import` writers, so every writer is co-canonical.
- **New CLI command:** `upg fmt [files...]` rewrites to canonical form; `upg fmt --check` is a CI gate.
- Backward-compatible reads; no catalogue/schema/API removals. `UPG_VERSION` unchanged.

---

## [0.7.4] - 2026-05-29

**Patch.** Em-dash-free sweep completed across the published packages and their bundled
dependencies. Two PRs: #1842 swept the remaining published packages (`sdk`, `cli`, `mcp-server`,
`cloud-server`, `adapters`, `markdown`, plus private `templates` / `mcp-tooling` for mirror parity);
#1845 swept the private `frameworks` package, whose content is bundled (via tsup) into the `sdk` /
`cli` / `mcp-server` / `cloud-server` dists, so its em-dashes had been riding into those four
published bundles. Package descriptions, JSDoc, and tool reference text only. No catalogue, schema,
or API changes; `UPG_VERSION` stays `'0.7.3'`. All seven packages republished at 0.7.4 so the
cleaned text ships and the family stays co-versioned. (`core`/`spec` content was already swept at
0.7.3 via #1834; remaining em-dashes in shipped bytes are the documented `catalog.ts` wire-format
delimiter and incidental JSDoc in third-party bundled dependencies, neither UPG-authored prose.)

---

## [0.7.3] — 2026-05-29

**Em dash removal across the published spec.** All em dashes in JSDoc and
descriptions (frameworks, properties, grammar, intelligence, catalog,
presentation, playbooks, approaches, registry, regions, shapes, plus
`ARCHITECTURE.md`, `README.md`, `spec/*.md`, and `spec/examples/*`) were
replaced with context-appropriate punctuation, meaning preserved. Load-bearing
string tokens (type / edge / entity IDs, enum values, union members) were left
untouched. Description-only; no spec semantics or structure changed.

**Field adoption (partial).** Additive, backward-compatible (optional
fields only, no migration):

- `version?: string` added to `agent_definition` and `workflow_template` (they
  carry a release/version label but had no field for it).
- `start_date?: ISODate` added to `partnership`.

Scoped down from the original sweep after re-deriving against 0.7.2:

- `owner` promotion to `UPGBaseNode` was **dropped**. Ownership is already
  modelled by the polymorphic `node_owned_by_{person,team,role,stakeholder,department}`
  edges, the graph-native and queryable path; a free-text base field would
  duplicate that weakly.
- `severity` / `confidence` / `priority` adoption **deferred**. Fixture usage
  is inconsistent across types (number vs enum vs vocab), so each needs a
  per-type modelling decision rather than a mechanical add.
- `library_dependency` (`dep_version`) and `prompt_version` (`version_number`)
  already carry a version field under a clearer name; the plain-`version` key
  seen in fixtures is a fixture-alignment item, not a spec gap. `dependency`
  (a work/blocking dependency) does not warrant a version field.

---

## [0.7.2] — 2026-05-29

**Patch.** Region edge-completeness ( §1). Adds 8 canonical edge types to
`UPG_EDGE_CATALOG` so previously-isolated region members connect to a sibling
within their super-domain region. No renames, drops, or property changes —
purely additive, backward-compatible (no migration required). Catalogue version
`UPG_VERSION` → `'0.7.2'`.

New edges:
- `competitor_competes_in_territory` (market_competitive — connects `territory`)
- `forecast_projects_metric` (analytics_data — connects `forecast`)
- `deployment_triggers_incident` (operations_quality — connects `deployment`)
- `monitor_measures_service_level_indicator` (operations_quality — connects `monitor`)
- `participant_represents_persona` (users_needs — connects `participant`)
- `content_theme_organizes_content_piece` (experience_design_brand — connects `content_theme` + `content_piece`)
- `attribution_model_credits_acquisition_channel` (business_gtm_growth — connects `attribution_model`)
- `growth_loop_fuels_acquisition_channel` (business_gtm_growth — connects `growth_loop`)

Region isolation: 10 isolated members → 1. The sole remaining unconnected member,
`document` (experience_design_brand), is **intentional**: it is a cross-cutting
"describes" hub whose canonical targets all lie outside its home region; no
in-region edge is forced on it. Edge type count 938 → 946.

---

## [0.7.1] — 2026-05-28

**Patch.** Metadata fix: `UPG_VERSION` was `'0.6.0'` in the published 0.7.0 — it
should track the catalogue version (`'0.7.0'`). Corrected in source (#1827) and
republished. Because consumers that **bundle** core (`sdk`, `mcp-server`, `cli`)
baked the stale value, those are republished at 0.7.1 too so their bundled
`UPG_VERSION` is correct; `cloud-server` / `adapters` / `markdown` keep core
external and pick up the fix via resolution. No catalogue/API changes —
`UPG_VERSION` stays `'0.7.0'` (the catalogue version, decoupled from the npm
package version by design).

---

## [0.7.0] — 2026-05-28

**Minor.** Re-canonicalise the user story. `story_statement` → `user_story`.

### Changed

- **`story_statement` → `user_story`.** The v0.2.7 Statement/Implementation split was sound — it extracted the lifecycle-bearing work into `task` — but renamed the surviving statement half to the coined `story_statement`. "User story" is the universally-recognised industry term for the templated "As X, I want Y so Z" promise, and UPG's value is being the recognisable canonical vocabulary — so the statement is re-canonicalised under `user_story`. The split itself is unchanged: the canonical shape remains a lifecycle-free `user_story` (statement) + a `task` (work), linked by `task_implements_user_story`.
  - `user_story` (`ent_073`) is canonical again (`proposed`, lifecycle-free); `story_statement` (`ent_342`) is now deprecated (`replacement: user_story`).
  - Four edges renamed: `epic_specified_by_story_statement` → `epic_specified_by_user_story`; `story_statement_verified_by_acceptance_criterion` → `user_story_verified_by_acceptance_criterion`; `task_implements_story_statement` → `task_implements_user_story`; `test_case_covers_story_statement` → `test_case_covers_user_story`.

### Migration

- `UPG_MIGRATIONS['0.7.0']`: `story_statement` → `user_story` (1→1 type rename; identical property surface `as_a` / `i_want_to` / `so_that` / `text` — no property migration).
- `UPG_EDGE_MIGRATIONS['0.7.0']`: the four edge renames above (endpoint guards target the post-migration `user_story` type).
- The v0.2.7 `user_story` → statement + task split is retained as the historical record. Legacy graphs migrate `user_story` (bundle) → `story_statement` + `task` at 0.2.7, then `story_statement` → `user_story` at 0.7.0 — converging on the canonical `user_story` (statement) + `task`.

---

## [0.6.2] — 2026-05-27

**Patch.** Sync `FrameworkCategory` with the framework library.

### Fixed

- `FrameworkCategory` was missing 6 values (`security`, `qa_testing`, `legal_compliance`, `content`, `education`, `localisation`) that framework definitions already referenced — which broke the TypeScript build in downstream consumers (e.g. the docs site's `FrameworksView`). Purely additive; no existing value changed.

## [0.6.1] — 2026-05-26

**Patch.** Metadata only: `UPG_VERSION` spec constant aligned to 0.6.x and `repository` repointed to the public `unified-product-graph/spec` mirror. No API or schema changes.

---

## [0.6.0] — 2026-05-22

**Minor.** v1 editorial cut: the public framework surface is narrowed to the 34 canonical, famous frameworks (Wardley Map, BMC, OST, RICE, JTBD, North Star, OKR, AARRR, Porter Five Forces, RACI, C4, etc.) — one entry per famous-author archetype, balanced across the six lifecycle bands. The broader research catalog of 182 additional definitions is retained internally for tier-1 wiring tests and future promotion but is no longer re-exported from the package entry point or shipped in mirrors. Also lands the status-migrations axis prepared during the unreleased window.

### Changed — breaking for set-iterating consumers (framework cut)

- `UPG_FRAMEWORKS`, `UPG_FRAMEWORKS_BY_ID`, `UPG_FRAMEWORKS_BY_CATEGORY` now reflect the 34 canonical frameworks only. Previously 216.
- `UPG_TYPE_LABELS[].framework_labels` keys are now scoped to the canonical 34. Label vocabulary for research-library frameworks moves to the internal-only `@unified-product-graph/frameworks` workspace.
- `presentation/labels.ts` now sources frameworks from `canonical.js` to keep the published bundle aligned with the public surface.

### Added — canonical framework infrastructure

- New `packages/upg-spec/src/frameworks/canonical.ts` — generated single file holding the 34 canonical `UPGFramework` records. Public surface for `@unified-product-graph/core`.
- New `scripts/regen-canonical-frameworks.mjs` — regen script driven by a `CANONICAL_IDS` allowlist. Future promotions are one allowlist edit + one rerun.
- `scripts/sync-oss-repos.sh` per-pkg-excludes `src/frameworks/definitions` from the public `core` mirror so the internal research library never lands in the GitHub repo.

### Added — `UPG_STATUS_MIGRATIONS` axis

- **`UPG_STATUS_MIGRATIONS` map + `migrateStatusValue` / `hasStatusMigration` / `listStatusMigrations` / `findInvalidStatusMigrationTargets` helpers** (`grammar/status-migrations.ts`) — a new migration axis parallel to `UPG_MIGRATIONS` (type renames) and `UPG_PROPERTY_MIGRATIONS` (property-shape evolution): per-entity-type maps of legacy status values to canonical lifecycle phases. Initial coverage spans the highest-volume drift observed across `entopo.upg`, `sanity.upg`, and `inkling.upg`: `service`, `feature`, `feature_area`, `hypothesis`, `opportunity`, `initiative`, `decision`, `deployment`, `monitor`, `incident`. The companion `migrate_status` MCP tool in `@unified-product-graph/mcp-server` consumes this map; `validate_graph` lifecycle_drift entries now carry `suggested_migration` when the map resolves.

---

## [0.5.8] — 2026-05-21

**Patch.** Three additive contributions: (1) 22 edges that close the slot-connectivity gaps in five Tier-1 strategy, research, and feedback canvas frameworks surfaced by the audit; (2) five skeleton canonical playbooks promoted to rich multi-phase playbooks; (3) a Tier-1 connectivity regression gate that pins the v0.5.8 canonical-edge slot-pair floors for all 20 Tier-1 famous frameworks. No removals, no renames, no breaking shape changes.

### Added — Tier-1 strategy / research / feedback canvas wiring (22 edges)

**McKinsey 7S (4 edges)**

The 7S canvas — Strategy, Structure, Systems, Shared Values, Style, Staff, Skills — forms a network of mutual influence. The catalog already had `strategic_pillar` and `capability` but no 7S-specific wiring. The central "Shared Values" node (shared_value entity, team_org domain) acts as the hub.

- **`strategic_pillar_guided_by_shared_value`** (strategy ↔ team_org · cross-domain) — verbs `guided_by` / `guides`. 7S: Strategy aligns to Shared Values.
- **`team_influences_shared_value`** (team_org · causal) — verbs `influences` / `influenced_by`. 7S: Staff shapes the Shared Values over time.
- **`capability_expressed_through_skill`** (strategy ↔ team_org · cross-domain) — verbs `expressed_through` / `expresses`. 7S: Skills are the executable form of a capability. `skill` gains a hierarchy relationship from `capability`.
- **`shared_value_aligns_team`** (team_org · causal) — verbs `aligns` / `aligned_by`. 7S: Shared Values bind team behaviour. Reverse of `team_influences_shared_value` but at the organisational level — teams are the object of alignment.

**Jobs-to-be-Done / Four Forces (4 edges)**

Christensen/Klement/Moesta four-forces canvas: Push (pain), Pull (attraction), Inertia (habit), Anxiety (fear). The catalog already had `persona_experiences_need`, `persona_pursues_job`, `job_motivates_desired_outcome`, and `switching_cost`. Missing: the force-attribution edges that map the canvas slots to entities.

- **`need_creates_push_toward_solution`** (user ↔ discovery · cross-domain) — verbs `creates_push_toward` / `pulled_by`. Four Forces: a pain or frustration (need with `valence='pain'`) creates the push force toward a solution.
- **`desired_outcome_creates_pull_toward_solution`** (user ↔ discovery · cross-domain) — verbs `creates_pull_toward` / `pulled_by`. Four Forces: the desired outcome is the magnet — what the user is pulled toward.
- **`switching_cost_creates_inertia`** (user · causal) — verbs `creates_inertia` / `inertia_from`. Four Forces: switching costs are the concrete mechanism of inertia. Causal because the cost literally prevents switching.
- **`assumption_creates_anxiety_about_solution`** (validation ↔ discovery · cross-domain) — verbs `creates_anxiety_about` / `anxiety_resolved_by`. Four Forces: the Anxiety force maps to unvalidated assumptions about the new solution.

**North Star Framework (3 edges)**

Amplitude's North Star framework: north_star_metric → input_metric → feature. The catalog had `metric` but no north-star-specific hierarchy. `north_star_metric` and `input_metric` are specialised metric subtypes defined in `MetricProperties.designation`.

- **`north_star_metric_composed_of_input_metric`** (strategy · hierarchy) — verbs `composed_of` / `component_of`. The North Star is defined as a function of 3-5 input metrics. `north_star_metric` gains `input_metric` as a valid child.
- **`input_metric_driven_by_feature`** (product ↔ strategy · cross-domain) — verbs `driven_by` / `drives`. Features move the needle on the input metrics. Causal in the North Star sense — the feature is what the team ships to shift the input metric.
- **`initiative_moves_north_star_metric`** (strategy · causal) — verbs `moves` / `moved_by`. Initiatives are the strategic bets that move the north star metric. Cross-level: an initiative aggregates multiple features each of which drives input metrics.

**OKR Canvas (3 edges)**

Doerr/Wodtke's OKR canvas slots: company-level → team OKR → key result → initiative. The catalog already had the basic OKR spine (`product_targets_objective`, `objective_achieved_through_key_result`). Missing: the team-OKR alignment wiring and the initiative link from key result.

- **`team_okr_aligned_with_key_result`** (team_org ↔ strategy · cross-domain) — verbs `aligned_with` / `aligns`. OKR canvas: team OKRs align with (but are not hierarchically contained by) company-level key results.
- **`key_result_driven_by_initiative`** (strategy · causal) — verbs `driven_by` / `drives`. Key results are moved by the initiatives that fund the work.
- **`team_okr_contributes_to_objective`** (team_org ↔ strategy · cross-domain) — verbs `contributes_to` / `has_contributing_team_okr`. Team-level OKRs roll up to product-level objectives; `contributes_to` is softer than `rolls_up_to` (team OKRs partially contribute; they are not the same objective re-stated).

**Voice-of-Customer Program (4 edges)**

The VoC canvas wires feedback_session → survey_response → nps_campaign → churn_reason → customer_health_score. The catalog already had `nps_campaign`, `survey_response`, `churn_reason`, and `customer_health_score` but no lateral connections.

- **`feedback_session_surfaces_churn_reason`** (customer_success ↔ feedback · cross-domain) — verbs `surfaces` / `surfaced_in`. VoC: exit interviews and feedback sessions are the primary source for churn reasons.
- **`nps_campaign_reveals_churn_reason`** (feedback · causal) — verbs `reveals` / `revealed_by`. Detractor NPS responses are strong predictors of churn; the survey makes the risk visible.
- **`churn_reason_degrades_customer_health_score`** (customer_success · causal) — verbs `degrades` / `degraded_by`. Customer health scoring models incorporate churn-risk signals; a documented churn reason is an input that lowers the score.
- **`survey_response_informs_nps_campaign`** (feedback · causal) — verbs `informs` / `informed_by`. Individual survey responses are the raw data that the NPS campaign aggregates into its score. Causal direction: responses → campaign score (not vice versa).

**Wardley + McKinsey strategic context (4 edges)**

Two Wardley-style edges and two McKinsey-ecosystem links missed by the earlier passes.

- **`capability_shapes_strategic_pillar`** (strategy · causal) — verbs `shapes` / `shaped_by`. A canonical capability is the organizational foundation for a strategic pillar. In 7S terms, Skills/Capabilities anchor Strategy.
- **`value_stream_delivers_outcome`** (strategy · causal) — verbs `delivers` / `delivered_by`. Value streams are the end-to-end flow that produces a business outcome. Closes the gap between operational flows (value_stream) and strategic results (outcome).
- **`initiative_funded_by_revenue_stream`** (strategy ↔ business_model · cross-domain) — verbs `funded_by` / `funds`. Strategic initiatives are funded by the revenue streams they ultimately grow or protect. Connects the business model layer (revenue_stream) to the strategy layer (initiative).
- **`strategic_pillar_operationalised_by_value_stream`** (strategy · causal) — verbs `operationalised_by` / `operationalises`. A strategic pillar is made real through the value streams that deliver it. Closes the strategy-to-execution chain: `strategic_pillar → value_stream → outcome`.

### Hierarchy grammar (Part 2d)

- `north_star_metric` gains `input_metric` as a valid child (North Star Framework: the NSM is defined as a function of input metrics).
- `capability` gains `skill` as a valid child (7S Framework: skills are the executable expression of a capability).

### Pairs NOT added (LOW-confidence — explicit decisions, Part 2d)

The Part 1 audit surfaced 240+ missing pairs across the five canvases; 22 are added above. Patterns excluded: reverse-already-covered (e.g. `shared_value → strategic_pillar`, `solution → need`), slot-pair artifacts with no canonical relationship (e.g. `shared_value → capability`, `key_result → team_okr`), and already-mediated paths (e.g. `initiative → key_result` mediated via `key_result_driven_by_initiative` reverse).

### Connectivity (post-fix, Part 2d)

- mckinsey-7s: 0 → 4 new edges
- four-forces: 0 → 4 new edges
- north-star-framework: 0 → 3 new edges
- okr-canvas: baseline → +3 new edges
- voice-of-customer-program: 0 → 4 new edges (+ 3 Wardley/strategic-context edges)

### Catalog size (Part 2d)

- Edges: 916 → 938 (+22)
- `UPG_VERSION`: `0.5.7` → `0.5.8`

---

### Added — Rich playbooks for the 5 former skeletons

**Patch.** Five of ten canonical playbooks were skeletons — single-phase `domain_guide` records that just deferred to a domain creation sequence. They are now rich multi-phase `entity_sequence` playbooks with per-phase `prompt_hint`s, matching the voice and shape of the existing five rich playbooks (`users-needs`, `discovery-research-validation`, `experience-design-brand`, `engineering-platform`, `business-gtm-growth`). Surfaced by the 2026-05-21 higher-order constructs audit (Pass 7).

Each playbook bumps `version` 0.1.0 → 0.2.0 and grows from one step to 6–7:

- **`playbook:strategy-outcomes`** — 7 phases: Vision & Mission → Themes → Outcomes → Objectives → Key Results → Initiatives & Capabilities → Assumptions & Decisions. Preserves the chain into `playbook:discovery-validation-hypothesis-cycle` via the final step's `next_sequence_on_gap`.
- **`playbook:market-competitive`** — 6 phases: Market → Competitors → Their offerings → Trends → Analysis → Moves.
- **`playbook:product-delivery`** — 6 phases: Features → Epics → Stories → Tasks & Dependencies → Releases & Milestones → Themes & Changelog.
- **`playbook:analytics-data`** — 6 phases: Data Sources → Event Schemas → Pipelines & Models → Metrics → Dashboards → Data Quality. No longer marked "skeleton playbook; content depth is in progress".
- **`playbook:operations-quality`** — 7 phases: DevOps Backbone → Monitoring & SLOs → Incident Response → Security → Quality Gates → Compliance & Accessibility → Customer Support. No longer marked "skeleton playbook; content depth is in progress".

### Helper update

`seqStep()` helper in `playbooks/definitions/index.ts` now accepts an optional `{ next_sequence_on_gap }` parameter to support chaining between rich playbooks (mirroring `domainGuideStep`).

### Audit coverage

- Rich canonical playbooks: 5 → 10 (every canonical playbook is now multi-phase).
- Skeleton playbooks remaining: 0 of 10 canonical.

---

### Tests — Tier-1 connectivity regression gate

**Additive only.** New vitest file `src/__tests__/tier-1-connectivity-regression-gate.test.ts` pins the v0.5.8 (post-Tier-1-sweep) canonical-edge slot-pair connectivity for the 20 Tier-1 famous frameworks as a strict integer floor (`min_connected / total`). If any framework's connected-pair count drops below its pinned floor — e.g. via accidental edge consolidation in, a refactor, or a silent deprecation — CI fails with an actionable message that lists both remediation paths (restore the edge, or update the floor + document in `CHANGELOG.md`). No catalog changes, no edges added or removed, no framework definitions touched, no version bump. Locks in the 77 canonical Tier-1 edges shipped across Batches 1-4. Test count: 781 → 803 (+22 = 20 framework floors + 2 sanity meta-tests).

---

## [0.5.7] — 2026-05-21

**Patch.** 11 high-confidence edges that close the slot-connectivity gaps in four Tier-1 engineering + AI canvas frameworks surfaced by the audit: Bounded Context Canvas (Nick Tune / DDD Crew), LLM Evaluation Framework (NLP community), API Design First (OpenAPI Initiative), and Multi-Agent Orchestration (AutoGen / CrewAI / LangGraph). Additive only — no removals, no renames, no breaking shape changes.

### Context

The Part 1 audit (Agent O2) re-run on Agent V's v0.5.6 base showed 94 missing ordered slot-pair edges across the four canvases. Many were already closed by Agent S (v0.5.3 — DDD/CQRS event chain) and Agent K (v0.5.2 — Wardley capability properties). Of the remaining gaps, most are reverse-traversals already covered by an existing forward edge, slot-pair artifacts with no canonical relationship in source literature, or paths already mediated through a third entity. This patch adds the 11 edges that map to explicitly-named relationships in the canonical engineering / AI literature. Continues the Part 2a/2b discipline: quality of the catalog over score on the audit.

### Added — Bounded Context Canvas (2 edges)

DDD canon: Nick Tune's canvas captures purpose, ubiquitous language, inbound/outbound communication, and key domain roles. The catalog already had the Agent S v0.5.3 chain (`bounded_context_modelled_as_aggregate`, `bounded_context_emits_domain_event`, `aggregate_contains_domain_entity`, `aggregate_emits_domain_event`, `aggregate_handles_command`, `command_produces_domain_event`). Missing: the BC-level published-language link and the saga / process-manager reaction loop.

- **`bounded_context_publishes_api_contract`** (engineering · hierarchy) — verbs `publishes` / `published_by`. DDD's "published language" at the BC level. `api_contract` gains a second valid hierarchy parent (service AND bounded_context); both paths coexist intentionally — services expose per-service contracts, the BC publishes their union as its public surface.
- **`domain_event_triggers_command`** (engineering · causal) — verbs `triggers` / `triggered_by`. CQRS saga / process-manager pattern (Vernon, Young): an event handler issues a new command in response to an event. Closes the reactive loop that the existing `command_produces_domain_event` only covers in one direction.

### Added — LLM Evaluation Framework (2 edges)

The canvas presents Accuracy (eval_benchmark), Coherence (eval_run), Safety (ai_guardrail), Latency (metric), and Cost (ai_cost_tracker) as evaluation dimensions of an ai_model. The catalog already had `ai_model_benchmarked_by_eval_benchmark`, `ai_model_constrained_by_ai_guardrail`, `ai_model_costed_by_ai_cost_tracker`, and `eval_benchmark_executed_as_eval_run`. Missing: the metric-output edges from benchmark and run.

- **`eval_run_produces_metric`** (ai_ml · causal) — verbs `produces` / `produced_by`. Every benchmark execution writes a result row of (metric, value, timestamp). Causal because the run is what creates the metric reading.
- **`eval_benchmark_defines_metric`** (ai_ml · hierarchy) — verbs `defines` / `defined_by`. HELM, MLPerf, BIG-bench all specify their metric set. Mirrors `data_source_defines_metric` (same verb, same classification). `metric` gains another hierarchy parent (already has outcome / objective / key_result / solution / data_source as parents).

### Added — API Design First (4 edges)

The OpenAPI / Swagger workflow threads contract → endpoint → review (decision) → mock (domain_entity) → implementation (data_flow). Agent S's v0.5.1 work landed `api_contract_contains_api_endpoint`. Missing: the typed-payload edges and the design-decision attachment that the canvas slots imply.

- **`api_endpoint_references_domain_entity`** (engineering · semantic) — verbs `references` / `referenced_by`. Endpoints bind to entity types by name in request/response payloads — semantic, not hierarchy, because the entity is not contained.
- **`api_contract_records_decision`** (engineering ↔ strategy · cross-domain) — verbs `records` / `recorded_in`. API design decisions (auth scheme, versioning policy, REST vs gRPC, pagination) are recorded against the contract during the OpenAPI review step. Parallel to `bounded_context_decided_via_decision` but at the contract grain.
- **`data_flow_transports_domain_entity`** (engineering · causal) — verbs `transports` / `transported_by`. DFD canonical: the arrow on a data-flow diagram carries a named payload.
- **`api_endpoint_participates_in_data_flow`** (engineering · semantic) — verbs `participates_in` / `involves`. Endpoints are DFD nodes that emit / consume flows. Semantic because participation is associational membership, not containment.

### Added — Multi-Agent Orchestration (3 edges)

The AutoGen / CrewAI / LangGraph canvas wires agent_definition → workflow_template → workflow_run → workflow_artifact with agent_hook and review_gate as cross-cutting concerns. The existing catalog covers the template-level structure (`agent_definition_orchestrates_workflow_template`, `workflow_template_executed_as_workflow_run`, `workflow_template_gated_by_review_gate`, `workflow_run_produces_workflow_artifact`, `agent_definition_triggered_via_agent_hook`). Missing: the runtime / execution facts the canvas surfaces under "Handoff Rules", "Conflict Resolution", and "Aggregation".

- **`agent_definition_produces_workflow_artifact`** (agentic · causal) — verbs `produces` / `produced_by`. Agents are the logical authors of artifacts; runs are their structural carrier. Polysemic with `workflow_run_produces_workflow_artifact` (already in catalog) by design — same pattern as the v0.5.3 `aggregate_emits_domain_event` + `command_produces_domain_event` polysemy.
- **`agent_hook_fires_during_workflow_run`** (agentic · causal) — verbs `fires_during` / `fires_via`. The runtime attribution for hook firing. The existing `agent_definition_triggered_via_agent_hook` covers the hook→agent registration; this adds the hook→run execution context.
- **`workflow_run_passes_through_review_gate`** (agentic · causal) — verbs `passes_through` / `gates_run`. Run-level gate traversal — distinct from the existing template-level `workflow_template_gated_by_review_gate`. Required for queries asking "which runs blocked on this gate?".

### Hierarchy grammar

Two `UPG_VALID_CHILDREN` updates:

- `bounded_context` gains `api_contract` as a child (BCs publish their union of contracts as published language; service-level exposure remains).
- `eval_benchmark` gains `metric` as a child (benchmarks define their metric set).

### Pairs NOT added (LOW-confidence — explicit decisions)

Across the four canvases, 83 ordered slot pairs are LOW-confidence and explicitly NOT added. Five patterns:

1. **Reverse-already-covered.** `domain_entity → aggregate`, `command → aggregate`, `metric → eval_run`, `decision → api_contract`, `workflow_artifact → workflow_run`, `review_gate → workflow_run` — reverses of edges added here or already in catalog.
2. **Slot-pair artifacts with no canonical relationship.** `domain_entity → domain_event`, `ai_guardrail → metric` (Coherence ↔ Safety), `api_contract → domain_entity` (mediated through endpoint), `agent_hook → workflow_artifact`, `review_gate → workflow_artifact` — both on the canvas but no named relationship in source literature.
3. **Already-mediated paths.** `bounded_context → command` (mediated through aggregate), `bounded_context → domain_entity` (mediated through aggregate), `ai_model → eval_run` (mediated through eval_benchmark), `agent_definition → workflow_run` (mediated through workflow_template), `workflow_template → workflow_artifact` (mediated through workflow_run), `bounded_context → api_endpoint` (mediated through api_contract).
4. **Wrong-direction abstractions.** `domain_event → bounded_context`, `aggregate → bounded_context`, `api_contract → bounded_context` — children don't structurally reach up to their parent; reverse traversal of the existing forward edge handles "what BC does this belong to".
5. **Conceptually loose canvas mappings.** Bounded Context Canvas labels `api_contract` as "Business Decisions" and `command` as "Outbound Communication" — both stretch the entity types. Adding edges that honour the stretch (e.g., `api_contract → command`) would import the looseness into the catalog.

### Connectivity (post-fix vs Part 1 baseline, re-run on Agent V's v0.5.6 base)

- bounded-context-canvas: 6→8 of 30 (0.200→0.267 · +2)
- llm-evaluation-framework: 4→6 of 30 (0.133→0.200 · +2)
- api-design-first: 1→5 of 20 (0.050→0.250 · +4)
- multi-agent-orchestration: 5→8 of 30 (0.167→0.267 · +3)

Strictly higher than baseline for all four frameworks. Per Part 2a/2b discipline: the audit's "every directional pair must resolve" metric overstates how connected canvases actually are (most slot pairs are not canonical relationships in source literature); the relevant test is strictly-higher-than-baseline, not a magic ratio target.

### Tests

- `src/__tests__/tier-1-engineering-ai-wiring.test.ts` — guards each edge's shape, PAIR_MAP indexing, no self-loops, catalog growth, and post-fix connectivity per framework.
- All 694 v0.5.6 tests continue to pass.

### Catalog size

- Edges: 905 → 916 (+11)
- Hierarchy grammar entries: +2 (bounded_context → api_contract, eval_benchmark → metric)
- SATURATED fixture: +11 synthetic `e_synthetic_upg528_2c_*` instances

### Migration notes

None. All 11 edges are additive. Existing graphs and adapters are unaffected. Two `UPG_VALID_CHILDREN` extensions widen the legal parent set for `api_contract` (gains `bounded_context`) and `metric` (gains `eval_benchmark`); no existing parent-child relationship is removed or invalidated.

---

## [0.5.6] — 2026-05-21

**Patch.** 15 edges (13 high-confidence + 2 medium-confidence) that close the slot-connectivity gaps in three Tier-1 design/UX canvas frameworks surfaced by the audit: Lean UX Canvas (Gothelf), Persona Canvas (Cooper/Pichler), and Design Sprint (Knapp/GV). Additive only — no removals, no renames, no breaking shape changes.

### Context

The Part 1 audit (Agent O2) enumerated 75 missing ordered slot-pair edges across the three canvases. Most are slot-pair artifacts (no canonical relationship in the source literature) or hierarchy-reverses already covered by reverse traversal of an existing edge. This patch adds the 15 edges that map to explicitly-named relationships in the canonical source literature and explicitly does NOT add the artifact-only pairs. Continues the Part 2a discipline: quality of the catalog over score on the audit.

### Added — Lean UX Canvas (7 edges)

Closes Gothelf's hypothesis template, which binds hypothesis → feature → persona → outcome in one sentence: "We believe [feature] for [persona] will result in [outcome]." The catalog already had `feature_tests_hypothesis` (reverse), `experiment_run_validates_hypothesis`, `outcome_delivered_by_feature` (reverse), `persona_experiences_need`, and the Part 2a `assumption_concerns_*` family. Missing: the forward subject arrows of the hypothesis template, the outcome-side measurement loop, and pattern completion for `assumption_concerns_*`.

- **`hypothesis_targets_outcome`** (validation · causal) — verbs `targets` / `targeted_by`. The "will result in [outcome]" clause of Gothelf's template.
- **`hypothesis_concerns_persona`** (validation · semantic) — verbs `concerns` / `has_hypothesis`. The "for [persona]" clause. Mirrors `assumption_concerns_persona` shape.
- **`feature_addresses_need`** (product · cross-domain) — verbs `addresses` / `addressed_by`. Parallel to `feature_addresses_job` — features address both jobs and needs (Lean UX block 5 ↔ block 1).
- **`experiment_run_measures_outcome`** (validation · cross-domain) — verbs `measures` / `measured_by`. Parallel to `experiment_run_measures_metric` — outcomes are the higher-level business measure (Lean UX block 8 ↔ block 2).
- **`persona_pursues_outcome`** (user · semantic) — verbs `pursues` / `pursued_by`. Lean UX block 4 (User Outcomes & Benefits) ties persona to outcome. Same verb as `persona_pursues_job` — lateral within the user domain.
- **`assumption_concerns_outcome`** (validation · semantic) — verbs `concerns` / `has_assumption`. MEDIUM-confidence: pattern-completion of's `assumption_concerns_*` family. Flagged for review.
- **`assumption_concerns_feature`** (validation · semantic) — verbs `concerns` / `has_assumption`. MEDIUM-confidence: same family, same review flag.

### Added — Persona Canvas (3 edges)

Pichler/Cooper canvas slots: `{persona, desired_outcome, need, observation, job, quote}`. The catalog already had `persona_pursues_job`, `persona_experiences_need`, `persona_aspires_to_desired_outcome`, `job_motivates_desired_outcome`, `observation_characterises_persona`, `observation_evidenced_by_quote`, `quote_evidences_need`, and `observation_reveals_need`. Missing: the verbal-evidence direction from persona's mouth, the Ulwick need ↔ desired_outcome link, and the parallel observation-reveals edge for jobs.

- **`quote_voices_persona`** (research · cross-domain) — verbs `voices` / `voiced_by`. Persona Canvas's Quotes slot is explicitly "what the persona says". Parallel to `observation_characterises_persona` but for verbal evidence.
- **`need_measured_by_desired_outcome`** (user · causal) — verbs `measured_by` / `measures`. Ulwick's outcome-driven innovation: a need is measured by the desired outcomes that quantify its satisfaction. Reverse traversal closes `desired_outcome → need` from this one edge.
- **`observation_reveals_job`** (research · cross-domain) — verbs `reveals` / `revealed_by`. Parallel to `observation_reveals_need`. Persona Canvas Behaviours slot surfaces jobs the persona performs.

### Added — Design Sprint (5 edges, 1 medium-confidence)

Knapp/GV's five-day flow: design_question (Map) → design_concept (Sketch) → decision (Decide) → user_flow (Prototype) → observation (Test). The catalog already had `design_question_answered_by_design_concept` (Day 1 → Day 2), `design_concept_realised_as_prototype`, `design_concept_sketched_in_wireframe`, and `learning_informs_decision`. Missing: the Day 3-5 closures.

- **`design_question_resolved_by_decision`** (design · causal) — verbs `resolved_by` / `resolves`. Day 3 Decide — the HMW question gets a commitment-level resolution. Parallel to but stronger than `_answered_by_design_concept`.
- **`decision_selects_design_concept`** (design · causal) — verbs `selects` / `selected_by`. Day 3 picks the winning sketch. The sprint's canonical "Decide" action.
- **`user_flow_validated_by_observation`** (design · causal) — verbs `validated_by` / `validates`. Day 5 Test — observations validate (or invalidate) the prototype's flow. Parallel to `experiment_run_validates_hypothesis`.
- **`design_concept_realised_as_user_flow`** (design · causal) — verbs `realised_as` / `realises`. MEDIUM-confidence (polysemy): widens grammar so concepts can be prototypes OR flows depending on sprint fidelity. Could be argued as redundant with the existing prototype edge. Flagged for review.
- **`observation_informs_decision`** (research · cross-domain) — verbs `informs` / `informed_by`. MEDIUM-confidence (subsumed by learning?): `learning_informs_decision` already covers the synthesised-insight path. This adds the direct observation → decision link for cases where a sprint observation immediately changes commitment without intermediate synthesis. Flagged for review.

### Hierarchy grammar

No changes. All 15 edges are causal / semantic / cross-domain — none are hierarchy classification, so `UPG_VALID_CHILDREN` is unchanged.

### Pairs NOT added (LOW-confidence — explicit decisions)

The Part 1 audit surfaced 75 missing pairs across the three canvases; 15 are added above. The remaining 60 are LOW-confidence and explicitly NOT added. Three patterns:

1. **Reverse-already-covered.** E.g., `decision → design_concept` is the reverse of the new `decision_selects_design_concept`; `desired_outcome → need` is the reverse of `need_measured_by_desired_outcome`; `assumption → need/persona/solution` are reverses of existing `assumption_concerns_*` (forward already exists). Adding both directions pollutes the catalog.
2. **Slot-pair artifacts with no canonical relationship.** E.g., `outcome → persona`, `quote → desired_outcome`, `experiment_run → assumption`, `design_question → user_flow`, `design_question → observation` — both on the same canvas but no named relationship in source literature.
3. **Already-mediated paths.** E.g., `decision → user_flow` (mediated via decision → design_concept → user_flow), `feature → outcome` (mediated via outcome_delivered_by_feature reverse), `hypothesis → need` (mediated via hypothesis → feature → need).

The Part 2b report enumerates the full list and reason per pair.

### Connectivity-ratio movement (post-fix vs Part 1 audit baseline)

Measured against the Part 1 audit baseline (pre-Part-2a). The Part 2a `assumption_concerns_need` and `assumption_concerns_persona` edges also incidentally close two lean-ux-canvas pairs, so its gain looks larger than the +7 directly attributable to Part 2b.

- `lean-ux-canvas` — connected 6→15 of 42 pairs · ratio 0.143 → 0.357 (+9 pairs total, of which +7 from Part 2b)
- `persona-canvas` — connected 10→13 of 30 pairs · ratio 0.333 → 0.433 (+3 pairs)
- `design-sprint` — connected 1→6 of 20 pairs · ratio 0.050 → 0.300 (+5 pairs, 6× absolute)

These are the achievable upper bounds for these canvases given the discipline of adding only canonical edges. The remaining null pairs are deliberate non-additions, not gaps.

### Catalog growth

- `UPG_EDGE_CATALOG`: 881 → 896 keys (+15)
- `UPG_VERSION`: `0.5.5` → `0.5.6` (patch)
- `UPG_FORMAT_VERSION`: unchanged (`0.4.0`)

### Migration impact

None. Additive only. Existing edge keys, classifications, and verbs are unchanged.

---

## [0.5.5] — 2026-05-21

**Patch.** Two additive contributions: (1) 29 edges (24 high-confidence + 5 medium-confidence) that close the slot-connectivity gaps in five Tier-1 business/GTM canvas frameworks surfaced by the audit; (2) 3 causal edges that complete the DDD/CQRS event-flow spine ( C1). No removals, no renames, no breaking shape changes.

### Added — Business/GTM canvas wiring (29 edges)

The Part 1 audit (Agent O2) enumerated 240 missing ordered slot-pair edges across five canvases: Business Model Canvas, Lean Canvas, GTM Playbook, Opportunity Canvas, and Test Card + Learning Card. Most are artifacts of the canvas declaring too many slot types — but ~29 represent real, named relationships from the canonical source literature (Osterwalder, Maurya, Patton, Strategyzer, GTM practice). This patch adds the canonical ones and explicitly does NOT add the artifact-only pairs.

#### Business Model Canvas (15 edges, all causal/cross-domain)

Closes the structural spine of Osterwalder's 9-block canvas — the named flows between value proposition, segments, channels, relationships, key activities, key resources, partnerships, costs, and revenues.

- **`key_activity_delivers_value_proposition`** (business_model · causal) — verbs `delivers` / `delivered_by`. Activities are what the business *does* to produce its VP.
- **`key_activity_uses_key_resource`** (business_model · cross-domain) — verbs `uses` / `used_by`.
- **`key_resource_enables_key_activity`** (business_model · cross-domain) — verbs `enables` / `enabled_by`.
- **`partnership_performs_key_activity`** (business_model · cross-domain) — verbs `performs` / `performed_by`. Outsourced activities; canonical BMC partnership rationale.
- **`partnership_provides_key_resource`** (business_model · cross-domain) — verbs `provides` / `provided_by`. Resource-providing partnerships.
- **`customer_relationship_with_market_segment`** (business_model · cross-domain) — verbs `with` / `maintained_by`. Each relationship targets specific segments.
- **`distribution_channel_reaches_market_segment`** (business_model · cross-domain) — verbs `reaches` / `reached_by`.
- **`distribution_channel_delivers_value_proposition`** (business_model · cross-domain) — verbs `delivers` / `delivered_by`. Channels are the delivery mechanism for the VP.
- **`value_proposition_addresses_market_segment`** (business_model · cross-domain) — verbs `addresses` / `addressed_by`. Each VP targets specific segments.
- **`revenue_stream_captured_from_market_segment`** (business_model · cross-domain) — verbs `captured_from` / `yields_revenue_via`. Different segments yield different streams.
- **`cost_structure_driven_by_key_activity`** (business_model · causal) — verbs `driven_by` / `drives_cost_via`. Activities are the operational cost drivers.
- **`cost_structure_driven_by_key_resource`** (business_model · causal) — verbs `driven_by` / `drives_cost_via`. Resources are the asset cost drivers.
- **`value_proposition_yields_revenue_stream`** (business_model · causal) — verbs `yields` / `yielded_by`. Revenue is captured value.
- **`customer_relationship_supports_value_proposition`** (business_model · cross-domain) — verbs `supports` / `supported_by`. MEDIUM-confidence (verb-naming): `supports` is one of several plausible choices. Flagged for review.
- **`partnership_supports_value_proposition`** (business_model · cross-domain) — verbs `supports` / `supported_by`. MEDIUM-confidence (verb-naming): same note. Flagged for review.

#### Lean Canvas (3 edges)

- **`solution_addresses_need`** (discovery · causal) — verbs `addresses` / `addressed_by`. The direct problem-solution-fit link (complements pre-existing `opportunity_drives_solution` and `value_proposition_solves_need`).
- **`capability_enables_value_proposition`** (strategy · causal) — verbs `enables` / `enabled_by`. The lean-canvas "unfair advantage" — a capability that uniquely enables the VP.
- **`competitor_addresses_need`** (market · cross-domain) — verbs `addresses` / `addressed_by`. Closes the Lean Canvas "Existing Alternatives" slot — a competitor exists *because* it addresses the same underlying need.

#### GTM Playbook (5 edges)

The catalog already had `gtm_strategy` fanning out to all six children. Missing was the lateral flow ICP → positioning → messaging → launch/sales.

- **`ideal_customer_profile_informs_positioning`** (gtm · causal) — verbs `informs` / `informed_by`.
- **`ideal_customer_profile_shapes_messaging`** (gtm · causal) — verbs `shapes` / `shaped_by`.
- **`ideal_customer_profile_shapes_sales_motion`** (gtm · causal) — verbs `shapes` / `shaped_by`.
- **`messaging_used_in_launch`** (gtm · cross-domain) — verbs `used_in` / `uses`. Messaging is the artifact that launches use.
- **`messaging_enables_sales_motion`** (gtm · cross-domain) — verbs `enables` / `enabled_by`. Messaging arms the sales motion.

#### Test Card + Learning Card (3 edges)

The Strategyzer validation flow: hypothesis → test_plan → experiment_run → evidence → learning → decision.

- **`test_plan_ran_as_experiment_run`** (validation · hierarchy) — verbs `ran_as` / `ran_for`. Mirrors `experiment_plan_ran_as_experiment_run` for the Test Card pair. **Hierarchy update:** `test_plan` gains `experiment_run` as a valid child.
- **`evidence_interpreted_as_learning`** (validation · causal) — verbs `interpreted_as` / `interpreted_from`. The interpretation step on the Learning Card.
- **`learning_informs_decision`** (validation · causal) — verbs `informs` / `informed_by`. The commit step on the Learning Card.

#### Opportunity Canvas (3 edges, all MEDIUM-confidence)

Patton's Opportunity Canvas Assumptions slot is meant to capture the riskiest beliefs about each of the other slots. The catalog already had `assumption_becomes_hypothesis` (the test flow) and `initiative_assumes_assumption` (the owner side). Missing: the *subject* of the assumption.

- **`assumption_concerns_need`** (validation · semantic) — verbs `concerns` / `has_assumption`. MEDIUM-confidence (verb-naming): `concerns` is one of several plausible verbs. Flagged for review.
- **`assumption_concerns_persona`** (validation · semantic) — verbs `concerns` / `has_assumption`. MEDIUM-confidence: same note.
- **`assumption_concerns_solution`** (validation · semantic) — verbs `concerns` / `has_assumption`. MEDIUM-confidence: same note.

#### Hierarchy grammar (Part 2a)

- `test_plan` gains `experiment_run` as a valid child — the Test Card maps to one or more experiment runs (mirrors `experiment_plan: ['experiment_run']`).

#### Pairs NOT added (Part 2a)

The Part 1 audit surfaced 240 missing pairs; 29 are added above. The remaining ~211 are LOW-confidence and explicitly NOT added. Three patterns:

1. **Hierarchy-reverse pairs already reachable via reverse traversal.** E.g., `revenue_stream → value_proposition` is the reverse of the new `value_proposition_yields_revenue_stream`. Adding both directions would pollute the catalog with duplicates.
2. **Canvas-only slot artifacts with no real semantic link.** E.g., `cost_structure → persona`, `metric → cost_structure`, `revenue_stream → competitor` — both on the same canvas but no canonical relationship.
3. **Already-mediated paths.** E.g., `solution → capability` (mediated via `solution → feature ← capability`), `gtm_strategy → messaging` (mediated via `gtm_strategy → positioning → messaging`).

#### Audit coverage (Part 2a)

- Edge count: 861 → 890 (+29).
- Slot-connectivity ratios (pre → post) for the 5 target frameworks:
  - business-model-canvas: 0.014 → 0.222 (+15 pairs closed; **16× improvement**)
  - lean-canvas: 0.127 → 0.164 (+4 pairs closed)
  - gtm-playbook: 0.167 → 0.333 (+5 pairs closed; **2× improvement**)
  - opportunity-canvas: 0.167 → 0.300 (+4 pairs closed; **1.8× improvement**)
  - test-card-learning-card: 0.233 → 0.333 (+3 pairs closed)

---

### Added — DDD/CQRS event-flow spine (3 edges C1)

Three causal edges that complete the DDD/CQRS event-flow spine. The pre-existing structural edges (`aggregate_contains_domain_entity`, `aggregate_contains_value_object`, `aggregate_handles_command`, `bounded_context_modelled_as_aggregate`, `bounded_context_emits_domain_event`) cover who owns what; these three carry the temporal cause-and-effect that makes event-driven and CQRS architectures expressible.

- **`command_produces_domain_event`** (engineering · causal) — verbs `produces` / `produced_by`. A command handle emits exactly one domain event per successful invocation; the command is the trigger.
- **`aggregate_emits_domain_event`** (engineering · causal) — verbs `emits` / `emitted_by`. The aggregate is the source of the event — same event as `command_produces_domain_event`, viewed from its emitter rather than its trigger. Coexists with `bounded_context_emits_domain_event` (the bounded-context-level rollup, structural hierarchy).
- **`domain_event_projected_to_read_model`** (engineering · causal) — verbs `projected_to` / `projected_from`. The CQRS read-side projection: domain events drive read-model updates. Composes with `aggregate_emits_domain_event` to express the full command-side → event → read-side path.

#### Composes into the canonical CQRS chain

```
command
  ─ command_produces_domain_event ─→ domain_event
                                       ↑
                                       │ aggregate_emits_domain_event
                                       │
                                    aggregate
                                       │
                                       │ aggregate_handles_command (existing, hierarchy)
                                       ↓
                                    command

domain_event
  ─ domain_event_projected_to_read_model ─→ read_model
```

#### Self-loop note (DDD/CQRS)

None of the three are same-type edges. They compose cleanly with the self-loop refusal (`A → A` refused by default) — every relation is between distinct types.

#### Polysemy on `domain_event`

A single `domain_event` instance is simultaneously `produced_by` a command and `emitted_by` an aggregate. This is the intended shape in DDD/CQRS: commands are *triggers*, aggregates are *sources*. Both views are addressable in the catalog without duplicating the event.

#### Scope discipline ( C1)

The C1 brief proposed eight edges. Five of those collided with edges already in the catalog at v0.5.1 / pre-existing:

- `aggregate_contains_domain_entity`, `aggregate_contains_value_object`, `aggregate_handles_command` — shipped at v0.5.1.
- `bounded_context_contains_aggregate` — overlaps with the canonical `bounded_context_modelled_as_aggregate`.
- `bounded_context_contains_service` — overlaps with the canonical `bounded_context_deploys_service`.

The remaining three (causal event-flow) had no prior canonical edges and are the actual gap.

#### Audit coverage ( C1)

- Edge count: 857 → 861 (merged total with Part 2a: 857 → 890, but these three are the C1 contribution adding to the 0.5.4 base of 857).
- `command` outgoing-edge count: 0 → 1 (no longer a pure terminal — `aggregate_handles_command` was incoming only).
- `domain_event` outgoing-edge count: 0 → 1.
- `aggregate` outgoing-edge count: 3 → 4.

---

## [0.5.4] — 2026-05-21

**Patch.** Four edges across two tickets: three strategic_theme wiring edges that lift `strategic_theme` from structural isolation to a conceptually central strategy node, and one solution-to-feature graduation edge that closes the Teresa Torres Solution Tree chain. Additive only — no removals, no renames, no breaking shape changes.

### Added

** — strategic_theme wiring (3 causal / hierarchy edges)**

- **`strategic_theme_delivers_outcome`** (strategy · causal) — verbs `delivers` / `delivered_by`. A strategic theme produces a business outcome; this causal link makes the delivery intent explicit.
- **`strategic_theme_measured_by_key_result`** (strategy · causal) — verbs `measured_by` / `measures`. Themes are broad; key results make them measurable. Direct link means a dashboard can surface KRs next to the theme without traversing objective.
- **`objective_rolls_up_to_strategic_theme`** (strategy · hierarchy) — verbs `rolls_up_to` / `contains_objective`. OKR containment direction — an objective is the specific quarterly bet *within* a theme. `strategic_theme` is the broader multi-quarter focus area; `objective` is subordinate. Mirrors the real-world usage and completes the strategic cascade: `strategic_pillar → strategic_theme → objective → key_result`.

** — solution graduation (1 causal edge)**

- **`solution_becomes_feature`** (discovery · causal) — verbs `becomes` / `evolved_from`. The explicit graduation moment in Teresa Torres' Solution Tree — a solution that has been validated and committed to delivery becomes a feature. Closes the chain: `opportunity → solution → feature`. Distinct from `capability_implemented_by_feature` (structural realisation) — this captures the *transition* from exploration to delivery commitment.

### Hierarchy grammar

- `strategic_theme` gains `objective` as a valid child — objectives are structurally subordinate to themes in the OKR cascade.

### Semantic overlap check

No duplicates introduced:
- `strategic_theme_pursues_initiative` (pre-existing) — outgoing to `initiative`. New edges target `outcome`, `key_result`, and (incoming from) `objective`. No overlap.
- `capability_implemented_by_feature` — structural realisation edge. `solution_becomes_feature` is a causal graduation edge. Different semantics, different source types.
- `outcome_delivered_by_feature` (pre-existing) — `outcome → feature` reverse direction. `solution_becomes_feature` is `solution → feature`. No overlap.

### Audit coverage

- Edge count: 857 → 861.
- `strategic_theme` outgoing-edge count: 1 → 3 (adds `delivers_outcome`, `measured_by_key_result`; gains 1 incoming from `objective_rolls_up_to`).
- `solution` outgoing-edge count: +1 (adds `solution_becomes_feature`).

---

## [0.5.3] — 2026-05-21

**Patch.** Framework-layer integrity sweep: framework shape linter + four canonical-example fixes, 66 SLOT_DATA_DRIFT warnings resolved, 212 framework column-drift corrections. No public-API or schema changes, no edge additions.

### Added — Framework Shape Audit

- **Framework Shape Audit** (`src/frameworks/audit-shape.ts` + `scripts/audit-framework-shape.ts`) — linter that walks `UPG_FRAMEWORKS` and reports five issue kinds:
  - `PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE` (blocker) — table column references an entity-type name instead of a declared property.
  - `PRESENTATION_COLUMN_UNKNOWN_PROPERTY` (warning) — column references an undeclared identifier.
  - `COMPUTED_EXPRESSION_UNDEFINED_VARIABLE` (blocker) — `computed_properties[*].expression` references an identifier that resolves to nothing.
  - `SLOT_DATA_DRIFT` (blocker / warning) — `slots[*].entityTypeId` missing from `data.entity_types` (blocker), or vice-versa (warning).
  - `WHEN_TO_USE_BOILERPLATE` (warning) — `education.when_to_use` bullets >50% identical to other frameworks in the same category.
- **CI gate** (`src/__tests__/framework-shape-audit.test.ts`) — vitest suite that fails on blocker-class issues for the four showcase frameworks (rice-scoring · kano-model · wardley-map · business-model-canvas) and reports the wider-catalog blocker count as a warn-only signal. Includes negative-test fixtures proving each detector fires.

### Fixed — Framework canonical examples

- **`rice-scoring`** — `presentation.layout.columns` rewritten to reference the four declared scoring properties (`reach`, `impact`, `confidence`, `effort`) and the `rice_score` computed property, instead of unrelated entity-type names (`metric`, `outcome`, `assumption`, `epic`). Default sort moved to `rice_score desc` so the showcase actually surfaces priorities.
- **`kano-model`** — (1) `functional_response` / `dysfunctional_response` now declare the standard Kano enum (`i_like_it | i_expect_it | i_am_neutral | i_can_tolerate_it | i_dislike_it`). (2) `delighter_count` / `performance_count` / `must_be_count` / `indifferent_count` declared as `number` so the `satisfaction_coefficient` and `dissatisfaction_coefficient` expressions resolve. (3) Layout changed from generic value/effort `quadrant` to Kano `matrix` (5x5 response classification). (4) `when_to_use` rewritten in Kano-specific terms.
- **`wardley-map`** — `evolution_stage` (enum: `genesis | custom | product | commodity`) and `visibility` (number 0-1) declared on each entity type that the framework slots over (`capability`, `feature`, `competitor`, `need`). Layout changed from `flow LR` to `quadrant` with `x_axis: evolution_stage` and `y_axis: visibility`. `structure.pattern` and `tags` updated to match.
- **`business-model-canvas`** — removed the orphan `persona` entry from `data.entity_types` (it had no corresponding slot). The framework now satisfies the slot/data consistency check.

### Fixed — Slot ↔ data.entity_types alignment

- **65 removals** — incidental entity types removed from `data.entity_types` in frameworks where the type appeared in data but had no corresponding slot and was not referenced in `required_properties` or `computed_properties`. Affected frameworks: `story-map`, `value-proposition-canvas`, `assumption-canvas`, `four-forces-of-progress`, `channel-model-fit`, `validation-board`, `experiment-card`, `empathy-map`, `opportunity-canvas`, `goal-oriented-roadmap`, `story-map-release-slicing`, `competitive-battlecard`, `competitor-profile`, `competitive-response-matrix`, `blue-ocean-strategy`, `jobs-to-be-done-canvas`, `balanced-scorecard`, `business-model-environment`, `raci-matrix`, `retrospective`, `blameless-postmortem`, `model-card`, `agent-evaluation-matrix`, `usability-test-plan`, `mixed-methods-matrix`, `user-needs-matrix`, `jobs-atlas`, `mental-model-diagram`, `user-segmentation-matrix`, `customer-forces-canvas`, `value-proposition-fit`, `voice-of-customer-program`, `nps-analysis-framework`, `customer-advisory-board-framework`, `icp-canvas`, `account-planning`, `monetisation-strategy`, `ge-mckinsey-matrix`.
- **1 addition** — `opportunity-scoring`: added `Scored Outcomes` slot (`entityTypeId: outcome`) to match the existing `outcome` entry in `data.entity_types` (required because `computed_properties[0].entity_type` references `outcome`).
- **Post-fix linter baseline**: `SLOT_DATA_DRIFT` → 0 (was 66). All other category counts unchanged.

### Fixed — Column drift bulk repair

- **212 frameworks across 21 definition files** — `presentation.layout.columns` entries that referenced an entity-type name (e.g. `metric`, `outcome`, `epic`, `feature`, `competitor`, `hypothesis`) instead of a declared property have been corrected. Every column now references either a universal node field (`title`, `description`, `status`), a `data.required_properties` key, or a `data.computed_properties` name. The renderer will no longer receive entity instances in the wrong column slot.
  - Files touched: `accessibility.ts`, `agentic.ts`, `ai-ml.ts`, `competitive.ts`, `customer-success.ts`, `design.ts`, `devops.ts`, `discovery.ts`, `engineering.ts`, `feedback-voc.ts`, `go-to-market.ts`, `growth.ts`, `metrics.ts`, `planning.ts`, `pricing.ts`, `prioritization.ts`, `program-mgmt.ts`, `strategy.ts`, `team-process.ts`, `user-understanding.ts`, `validation.ts`.
- **CI gate strengthened** — added a hard-fail assertion that `PRESENTATION_COLUMN_REFERENCES_ENTITY_TYPE` is zero across all 216 frameworks (previously warn-only for non-showcase frameworks). Any regression will fail the build immediately.
- **`prioritization.ts`** — fixed a smart-quote syntax error (`Won't Have`) that caused the TypeScript transform to fail at compile time.

---

## [0.5.2] — 2026-05-21

**Patch.** Four canonical Wardley edges + two `CapabilityProperties` fields that complete Wardley-style value-chain decomposition. Additive only — no removals, no renames, no breaking shape changes.

### Added

Four edges that complete the `need → capability → capability → feature` Wardley spine and let competitors share that spine:

- **`need_fulfilled_by_capability`** (cross-domain · hierarchy) — verbs `fulfilled_by` / `fulfils`. Anchors a value chain to a user need.
- **`capability_depends_on_capability`** (strategy · hierarchy) — verbs `depends_on` / `depended_on_by`. The intra-capability value-chain spine. Same-type edge — see "Self-loop note" below.
- **`capability_implemented_by_feature`** (cross-domain · hierarchy) — verbs `implemented_by` / `implements`. The chain terminates at user-facing features.
- **`competitor_offers_capability`** (market_intelligence → strategy · cross-domain) — verbs `offers` / `offered_by`. Competitors map onto the same capability vocabulary the team uses, so a Wardley map can compare positions across the same chain.

Two optional `CapabilityProperties` fields driven by the `wardley-map` framework (`packages/upg-spec/src/frameworks/definitions/strategy.ts`):

- **`evolution_stage`** — `'genesis' | 'custom' | 'product' | 'commodity'`. Position on the Wardley evolution axis. Orthogonal to `maturity_level` (which measures the team's internal practice).
- **`visibility`** — `number` in `[0.0, 1.0]`. Position on the visibility axis from deepest dependency to user-visible anchor. Drives the y-axis of a Wardley map.

### Hierarchy grammar

- `need` gains `capability` as a valid child (cross-domain hierarchy: Wardley starts from a need).
- `capability` enters `UPG_VALID_CHILDREN` for the first time with `['capability', 'feature']` (self-nesting + implementation).

### Self-loop note

`capability_depends_on_capability` is a same-type edge. The v0.5.0 self-loop guard refuses `A → A` by default — a value chain by definition has no node depending on itself. `A → B` between distinct capabilities is the supported and intended shape. If a future caller needs a same-node self-loop, that would require a separate opt-in.

### Audit coverage

- Edge count: 850 → 854.
- `capability` outgoing-edge count: 1 → 3 (`capability_enables_value_stream` + `capability_depends_on_capability` + `capability_implemented_by_feature`).
- `need` outgoing canonical edges: gains the hierarchy anchor for Wardley chains.
- `competitor` outgoing-edge count: gains a third typed-vocabulary destination alongside `competitor_feature` and `learning`.
- `CapabilityProperties`: 3 → 5 declared fields.

---

## [0.5.1] — 2026-05-21

**Patch.** Three single-edge additions that fix documented domain-guide patterns which were unwireable at one hop. Surfaced by the 2026-05-20 systematic domain-wiring audit (Batch C sections C2 + C3). Additive only — no removals, no renames, no breaking shape changes.

### Added

- **`api_contract_contains_api_endpoint`** (engineering · hierarchy) — verbs `contains` / `belongs_to`. API contracts group endpoints by version/protocol; endpoints belong to specific contracts. `api_contract` and `api_endpoint` were both anchored on `service` as siblings — a contract had no path to its endpoints. This adds the natural parent-child wiring.
- **`postmortem_identifies_root_cause`** (devops · causal) — verbs `identifies` / `identified_by`. The devops "Incident Response Chain" pattern routes through `postmortem → root_cause`, but the existing chain only had `incident → root_cause` and `investigation → root_cause`. `postmortem` had zero outgoing edges. This restores the documented chain.
- **`postmortem_produces_runbook`** (devops · causal) — verbs `produces` / `produced_by`. Real ops practice: postmortems generate runbook updates as action items. Previously no path between the two existed in the catalog.

### Changed

- **`API Contract Chain` pattern (engineering domain guide)** — middle hop swapped from `service_serves_api_endpoint` to `api_contract_contains_api_endpoint` so the chain reads `service → contract → endpoint → feature` (cleaner narrative; `service_serves_api_endpoint` remains in the catalog for non-contract endpoints).
- **`Incident Response Chain` pattern (devops domain guide)** — hop 4 swapped from `investigation_revealed_root_cause` (wrong anchor) to `postmortem_identifies_root_cause`; hop 5 added (`postmortem_produces_runbook`) so the chain ends at the action-item layer.

### Audit coverage

- Edge count: 847 → 850.
- `postmortem` outgoing-edge count: 0 → 2 (no longer a pure terminal).
- `api_contract` outgoing-edge count: 0 → 1.

---

## [0.5.0] — 2026-05-19

**Co-version anchor.** This release establishes the `0.5.0` line that every `@unified-product-graph/*` sibling package (`mcp-server`, `mcp` (CLI), `cloud-server`, `adapters`, `markdown`, `notion-sync`) co-versions against.

Minor bump: additive surface-area expansion (new entity type, new polymorphic edges, new grammar category). Consumers narrowing on `UPGEntityType` or `UPGEdgeType` unions will see new members.

### Added

- **`person` entity type** — a named, accountable individual. Distinct from `stakeholder` (an interested party: internal, external, investor, regulator) and from `role` (a responsibility slot filled by one or more people). `ent_349` · `team_org` domain · lifecycle-free · containment-free.
- **`PersonProperties` interface** — `email`, `role_title`, `time_zone`. Identity, addressability, and coordination only. HR-shaped fields (`seniority`, `employment_type`, `start_date`) sit outside the spec — UPG is not an HRIS.
- **`node_owned_by_person` polymorphic edge** — verbs `owned_by` / `owns`. Fifth member of the universal-ownership family alongside `_team`, `_role`, `_stakeholder`, `_department`.
- **`node_belongs_to_bounded_context` polymorphic edge** — verbs `belongs_to` / `contains`. Covers DDD building blocks (service, domain_event, domain_entity, aggregate, read_model, api_contract, value_object, command, data_model). Polymorphic count: 10 → 12.
- **`UPG_CONTAINMENT_FREE_TYPES` set + `isContainmentFreeType()` helper** (`grammar/hierarchy.ts`) — a new grammar category parallel to `UPG_LIFECYCLE_FREE_TYPES`. Containment-free types are referenced by other nodes via edges rather than contained by structural parents. First member: `person`. The G2b hierarchy audit treats absence from `UPG_VALID_CHILDREN` as a defect unless the type is in this set.

### Removed ( spec-hygiene pass)

Spec-hygiene pass surfaced by the 2026-05-20 v2 spec-as-observed analysis (Finding 11 — *legacy data + tools drift*) and the systematic domain-wiring audit (Failure Mode 2 — *creation_sequence drift*).

** — Deprecation hygiene.** Every property tagged `@deprecated since="0.4.0" removeIn="0.5.0"` has been removed from `UPG_PROPERTY_SCHEMA`.

Status fields lifted to `UPGBaseNode.status` per `status-convention.md` Rule 1 (12): `strategic_theme.theme_status`, `assumption.validation_status`, `service.service_status`, `api_contract.contract_status`, `technical_debt_item.debt_status`, `investigation.investigation_status`, `fix.fix_status`, `contract.contract_status`, `threat_model.threat_model_status`, `role.role_status`, `team_okr.okr_status`, `partnership.partnership_status`.

Free-text properties replaced by canonical edges (5): `model_comparison.winner`, `service_level_agreement.customer`, `data_product.consumers`, `report.recipients`, `learning.metric`.

Renamed-to-sibling properties (5): `root_cause.confidence → cause_confidence`, `metric.frequency → cadence` (Cadence enum), `key_activity.frequency` / `symptom.frequency` / `churn_reason.frequency` → 4-way frequency split. `MetricFrequency` type alias removed.

### Added ( +)

- **`UPG_PROPERTY_MIGRATIONS['0.5.0']` block** — 22 migration rules: 12 `lift_property_to_top_level` + 5 `drop_props` (edge-replaced) + 5 `drop_props` (renamed-sibling).
- **`migrateProductStage` helper + `LEGACY_PRODUCT_STAGES` map** (`catalog/legacy-product-stages.ts`) — authoritative `idea → concept` mapping, append-only, exposed from package root.
- **`creation_sequence` ↔ registry invariant** (`creation-sequence-matches-registry.test.ts`) — asserts domain sequences cover all registered entities. `scripts/audit-creation-sequence.ts` as CI drift report.

### Fixed ( — creation_sequence drift)

11 domains reconciled: 22 missing entities added, 6 foreign entries removed — `strategy`, `engineering`, `devops`, `validation`, `market_intelligence`, `user_research`, `ux_design`, `product_spec`, `growth`, `content`, `customer_success`.

---

## [0.4.3] — 2026-05-18

### Added

- **`constraint` entity (Strategy domain)** — a first-class entity for the structural constraints that Theory of Constraints, Wardley Mapping, and risk frameworks operate on. `ConstraintProperties` carries optional `constraint_kind` (`resource | technical | regulatory | temporal | compliance | other`), `constraint_status` (`binding | advisory | lifted`), `rule_strength`, `source`, `review_date`. Lifecycle-free — `constraint_status` is the state signal.
- **Five canonical Constraint edges:**
  - `product_bounded_by_constraint` (hierarchy)
  - `constraint_constrains_feature` (cross-domain)
  - `constraint_constrains_initiative` (semantic)
  - `constraint_constrains_metric` (semantic)
  - `constraint_owned_by_team` (cross-domain)

The polymorphic `node_constrains_node` edge is unchanged for arbitrary constrain relationships. The new typed edges are the canonical choice when the source is a named `constraint` node.

---

## [0.4.2] — 2026-05-18

### Added

- **`MetricHealth` type and `MetricProperties.metric_health` property** — a universal health signal that applies to every metric regardless of `designation`. Values: `'healthy' | 'at_risk' | 'unhealthy' | 'unknown'`. Orthogonal to lifecycle and to `guardrail_status`. Renderers should read `metric_health` for the universal lifecycle-dot signal across all metrics, with `guardrail_status` as a breach-specific overlay for guardrails.

---

## [0.4.1] — 2026-05-16

### Fixed

- **Resolver pair collisions resolved deterministically.** `UPG_EDGE_PAIR_MAP` was previously a `Record<string, UPGEdgeType>`, which silently dropped every edge but the last on the 35 `(source, target)` pairs where multiple edges share endpoints. `resolveContainmentEdge` therefore returned a non-deterministic last-wins answer.
  - `UPG_EDGE_PAIR_MAP` is now `Record<string, UPGEdgeType[]>` — every catalogued edge for a pair is preserved.
  - New `pickCanonicalEdge(source, target, hint?)` applies a deterministic classification-ranked policy: hierarchy ≻ causal ≻ semantic ≻ cross-domain. Declaration order breaks ties inside a classification.
  - New `resolveAllEdges(source, target): UPGEdgeType[]` returns the full candidate set.
  - `resolveContainmentEdge` now delegates to `pickCanonicalEdge(source, target, 'hierarchy')`.

### Added

Nine cross-domain edges:

- **Testing → Bug:** `regression_test_addresses_bug`.
- **DevOps:** `incident_affects_feature`, `release_strategy_used_by_deployment`.
- **User Research linkage:** `participant_voiced_quote`, `research_question_addressed_by_insight`, `survey_response_evidences_insight`.
- **Engineering:** `feature_flag_gates_feature`, `data_model_persisted_in_database_schema`, `read_model_projects_aggregate`.

### Audit coverage

- Edge count: 831 → 840.
- All 35 pair collisions now resolve non-null and deterministically via `pickCanonicalEdge`.

---

## [0.4.0] — 2026-05-12

First public release of `@unified-product-graph/core`.

### Removed

**Narrative-string properties superseded by canonical edges.** Four properties whose canonical edges already shipped are removed in v0.4.0 — carrying the string twin into the first public version would cement a documented inconsistency.

- `ValueProposition.jobs_addressed: string` — use `value_proposition_addresses_job`.
- `ValueProposition.pain_reliefs: string` — use `value_proposition_solves_need` (a pain is a `need` with `valence='pain'`).
- `ValueProposition.gain_creators: string` — use `value_proposition_delivers_outcome`.
- `MetricProperties.guardrail_for: string` — use `metric_guards_metric`.

**`MetricProperties` cleanup (14 properties total).** Six quality signals migrate to the `metric_quality_assessment` entity. Three proxy fields migrate to `metric_quality_assessment.proxy_*`. Five external-sync fields move to tool-extension namespaces (e.g. `extensions.<tool>.metric_sync.*`) — these were always tool runtime state, never portable spec data.

- Quality: `quality_correlated`, `quality_actionable`, `quality_sensitive`, `quality_comparative`, `quality_related`, `quality_score`.
- Proxy: `proxy_reason`, `proxy_confidence`, `proxy_alternatives`.
- External sync: `external_metric_id`, `external_query`, `last_synced_at`, `sync_status`, `sync_error`.

The runtime migrator (`grammar/migrations.ts`) retains the legacy drop rule, so older graphs round-trip cleanly — `metric` nodes carrying any of these 14 fields have them stripped on load.

### Added

- **Classification taxonomy.** Two new entity types — `classification_axis` and `classification_value` — for 2-axis paradigm matrices and competitive-landscape comparisons. Six new edge types wire them to `competitive_analysis`, `competitor`, and `persona`. Three new property shapes: `ClassificationCommitment`, `ClassificationCapability`, `EmptyCell` (with `rationale_kind: 'structural' | 'ideological' | 'opportunity'`). `validate_graph` enforces referential integrity on `empty_cells`. Proof-of-spec fixture at `spec/examples/cms-field-guide.upg`.
- **`Cadence` primitive** — canonical recurrence enum `'continuous' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'on_demand' | 'other'`. Replaces ad-hoc free-form `frequency: string` and `*cadence: string` properties.
- **Four-way frequency split** on entities whose recurrence is an axis of analysis: `frequency_count?: number`, `frequency_period?: Duration`, `frequency_rating?: 'rare' | 'occasional' | 'regular' | 'constant' | 'other'`, `cadence?: Cadence`.
- **`RootCauseProperties.cause_confidence`** — renamed replacement for `confidence` (3-tier: `'hypothesised' | 'likely' | 'confirmed'`). Disambiguates from the spec-wide `UPGAssessment`-typed `confidence` axis.
- **Canonical edges replacing narrative-string properties:** `learning_observed_on_metric`, `model_comparison_winner_is_ai_model`, `data_product_consumed_by_service`, `report_distributed_to_team`, `service_level_agreement_covers_account`.
- **`*_status` convention doc** at `src/properties/status-convention.md` — codifies the three axes that `*_status` properties span (lifecycle / runtime state / event outcome) and the rules for choosing the right canonical slot.
- **`property-schema-coverage` regression test** — walks every `*Properties` interface via the TypeScript Compiler API and asserts each declared property appears in `UPG_PROPERTY_SCHEMA`, including full union-member coverage for string-literal-union properties.
- **`UPG_VERSION` vs `UPG_FORMAT_VERSION`** — `UPG_VERSION` (currently `'0.5.0'`) is the catalogue version (entities, edges, properties). `UPG_FORMAT_VERSION` (currently `'0.4.0'`) is the on-disk `.upg` document format version. The format evolves more slowly than the catalogue.

### Changed

- **Property-registry generator migrated to the TypeScript Compiler API.** Closes a silent-drop bug class in the previous regex-based generator: union-typed properties, type-alias references, and JSDoc tag text now extract correctly.

---

## Pre-0.4 history

The schema iterated through internal 0.1.x–0.3.x phases before public 0.4.0 release. Those entries are preserved in the source repository for archival purposes but are not part of the public changelog — every breaking change they introduced is reflected in the 0.4.0 baseline above.
