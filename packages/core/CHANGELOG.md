# Changelog

All notable changes to `@unified-product-graph/core` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.39.0] - 2026-09-04

**A write said "done" while the disk disagreed, and a design system could not point at itself.** Six findings from a second Sanity field brief, written while populating a Studio design layer through roughly two thousand MCP calls across seven graph PRs. One is a correctness bug in the workflow this project's own README recommends; the rest are the design layer's missing vocabulary. Additive throughout.

### Fixed

- **Write tools now return only after the file is written.** `store` saves on a 300ms fire-and-forget debounce, so a successful write returned while the file still held the pre-write state: the documented `batch_*` → read-back → `batch_*` loop raced its own writes, and three field scripts read stale state and worked around it with sleeps. Every mutating tool now awaits the flush at the single dispatcher chokepoint, so the guarantee is structural rather than resting on forty handlers each remembering. A flush failure downgrades the response to an error instead of reporting success over an unwritten file.

### Added

- **`design_token_derives_from_design_token`** (causal, cross-product eligible). The alias tier: primitives (`--gray-100`) that semantic tokens alias (`--background-high: light-dark(var(--gray-100), …)`) that components consume. Measured estate: 163 primitives and 45 aliases whose chain lived in prose. Causal because the alias's value is computed from the primitive's. Makes "which primitives does this component depend on" and "which primitives are dead" traversals.
- **`feature_area_groups_design_component`** (hierarchy). Component catalogs group by area; 133 components carried an `area:` tag instead. `groups`, not `contains`: the area does not own the component, so this is the non-owning overlay `journey_phase_spans_journey_step` already models.
- **`validate_graph` reports `property_enum_drift`.** A declared enum was documentation: nothing checked a stored value against it, so an estate wrote `shadow` / `size` / `opacity` into `design_token.category` and saw zero drift, unable to tell whether the enum was strict, extensible, or decorative. Reported, never refused, the `undeclared_property_drift` posture.
- **`portfolio_validate` reports `registry_file_path_drift`, and `update_product` accepts `file_path`.** A registry entry can point at a path the graph no longer occupies; discovery keeps working because `workspace.json` is authoritative, so nothing surfaced it and nothing repaired it. The report names where the graph actually is; the repair corrects the registry without moving anything, and refuses a path that resolves to nothing.

### Changed

- **`design_component_composes_design_component` is cross-product eligible.** A product graph's shadow component could not point at the design-system primitive it wraps, and eleven wrappers recorded the relationship in descriptions. Widened rather than minting a `_wraps_` twin: a wrap is composition read across a graph boundary, and a second verb for one relationship is a shadow pair.
- **`design_token.category` speaks the DTCG `$type` vocabulary** alongside its original five values, with the non-one-to-one mapping stated on the property: a `radius` token is a DTCG `dimension`, `motion` is usually a `duration` or `cubicBezier`, `typography` is a composite. Both spellings are accepted, so neither an estate that speaks DTCG nor one that speaks UPG's original five has to translate at the boundary.

Catalog: 1092 → 1094 edges (456 hierarchy · 425 cross-domain · 95 causal · 118 semantic); cross-product 69 → 71. No entity types added or removed.

## [0.38.0] - 2026-09-03

**Cloud-agent hardening: a field brief from a five-repo Cursor Cloud environment found the server fabricating phantom graphs, unverifiable at build time, and unhelpable at setup time.** Seven findings, six accepted (the seventh, filesystem-coupled `code_url` checks, deferred on doctrine); every fix verified live over stdio against the built binaries. Zero catalog/schema surface; minor rather than patch because two behaviors change deliberately.

### Changed (behavior)

- **The mcp-server's empty-resolution fallback dies.** Finding nothing no longer creates a blank `product.upg`: the server REFUSES to start (exit 1), naming the cwd and every path checked. Creation is opt-in via `--init`. In an environment whose cwd you do not control, a silently fabricated graph means every tool call "succeeds" against a phantom and writes are lost with no signal — the refusal is the safe direction, and its message carries the fix.
- **`upg workspace switch` is session-only.** It writes the gitignored `.upg/workspace.session.json` cursor instead of rewriting the tracked `workspace.json`, so a read-only exploration never leaves a git-backed workspace dirty and an agent's `git add -A` never commits a cursor move. The new `workspace set-default` is the explicit tracked write. The MCP server's `switch_product` always behaved this way; the CLI catches up to the server's own standard.

### Added

- **`--workspace <dir>` / `UPG_WORKSPACE`** on the mcp-server: point at the directory holding the graphs and the server arranges its own cwd (internalizing the shell wrapper cloud environments were hand-writing, the exact layout the field brief verified). `get_workspace_info` and `get_graph_digest` report `workspace_abs_path` so an agent can assert its location.
- **`upg-mcp-server --check`**: resolves the workspace exactly as the server would, prints `{ok, workspace, resolved_file, products, spec_version, server_version}`, exits 0/1, never starts the transport, never writes. For environment install scripts, so a misconfigured environment fails at build time instead of mid-session. `--help` works (it was an unknown-option error).
- **`--profile read-only|author`** on the mcp-server: server-side tool-surface filtering applied to `tools/list` AND `tools/call` (the list is discovery, the refusal is the gate), with the profile named in the handshake's server name. Classification fails closed: a new tool is gated out of `read-only` until deliberately classified. `read-only` = the 44 pure reads (plus `switch_product`/`reload_product`; `submit_feedback` excluded, it POSTs externally); `author` gates deletes, migrations, `rename_edge_type`, `push_to_cloud`, `init_workspace`, `create_product`, and the three that delete under another verb.
- **Spec-version drift warning** at server startup when a graph's sealed `spec_version` is behind the server's (the field case: graphs sealed at 0.8.13 meeting a 0.36.0 server with no signal anywhere).
- **`--target cursor`** on `upg mcp setup` (writes `.cursor/mcp.json` and prints the team-dashboard snippet cloud agents actually need) and `upg install-skills` (installs the bundled skills into `.cursor/skills/<name>/SKILL.md`).
- **Deprecated aliases resolve their domain through their replacement** (`getDomainForType`): 36 icon-carrying aliases (`kpi`, `pain_point`, `sla`, `jtbd`, …) rendered tone-neutral in every surface because their names had no domain row while every replacement had one. A rule, not rows — alias rows would make deprecated names look canonical.

## [0.37.0] - 2026-09-01

**The presentation review: six fields and a widening, one pass over `UPGViewPresentation`.** Every item arrived as measured field evidence from the W2 board charter and the tree-builder investigation (B0, B-1, F-7, F-8), was ruled individually, and lands together so the interface is reviewed once. Additive throughout; every bare pre-0.37.0 form keeps its exact meaning.

### Added

- **`rows_by`** on `UPGViewPresentation`. The row axis, making a board a two-axis grid (`rows_by` × `group_by`). A named second slot rather than an axes array: a grid is two-dimensional, and an array would put the first axis in two homes beside `group_by`. Absent means the one-axis board every earlier view already meant. Without a portable home, `priority × status` degraded into a flat status board for any conformant foreign consumer: same nodes, but the dimension the author was reasoning in was gone.
- **`lane_order`**. Lane keys in display order. The presentation split's own charter prose names this case ("a lane arrangement is a preference of the tool that drew it"); same class as `sort`. Unlisted lanes follow the listed ones in natural order, so a new value never vanishes for being unlisted.
- **`collapsed_lanes`** / **`collapsed_rows`**. Persisted collapse state per lane/row. Not ephemeral UI: `workspace_arranges_node.expanded` already blesses collapse state as presentation that survives a reload. A consumer that ignores them renders everything expanded, the safe direction.
- **`root`** (`UPGViewTreeRoot`: `{kind:'product'} | {kind:'type', type} | {kind:'focus'}`). Where a tree roots. Ruled PRESENTATION, not scope (F-8): root never changes the selected set, only which already-selected members are drawn as tops, and `orphan_disposition`'s absent-means-`root` default keeps it ignorable. Measured on the registry: 12 of 57 saved trees diverged on bare read-back and 8 collapsed to a single node, all of them `hide` trees whose non-product root went unstated. A portable root is what makes an authored `hide` safe to honour.

### Changed

- **`group_by`** widens from `string` to `UPGViewAxis` (`string | { dimension: 'edge', edge_type, direction? }`). A board can now lane by an edge ("board laned by assignee"); lanes are the far-end neighbours of the named edge type. The object form mirrors the edge grammar the query side already speaks (`UPGViewClause`'s `dimension: 'edge'`) rather than minting a second one. A member with no such edge lands in a `none` lane, never dropped. Absent `direction` means `'out'`.
- **`nest_by`** items widen from `string` to `UPGViewNestEntry` (`string | { edge_type, parent: 'source' | 'target' }`). The bare-name orientation rule (F-7, stated in 0.36.0's window: source = parent, catalog-declared, never guessed) stands; the object form exists for the one intent a bare name cannot state, nesting children under the edge's TARGET end. A bare string is exactly `{ parent: 'source' }`.

### Held out, deliberately

- **Lane WIP limits.** A WIP limit is a statement about a team's process, not about how one view draws, and per-view placement would let two boards over the same work disagree about the same team's limit. Recurrence unmet; apps carry it locally until a second consumer or a per-phase-policy ask pulls it forward.

## [0.36.0] - 2026-09-01

**Two feedback reports, both from real MCP-client modelling sessions, both evidence-backed against live products.** Retrieved from the `upg.feedback` triage queue on the morning the queue's own database came back from a DNS outage. Additive; one staged deprecation; no data migration.

*(This entry was written after the release shipped: the 0.36.0 train went to npm without a CHANGELOG entry, and no gate noticed. Recorded here rather than silently backfilled.)*

### Added

- **`user_flow_walks_journey_step`** (semantic). A `user_flow` could state which `user_journey` it maps onto (`user_flow_maps_user_journey`) but not which of that journey's steps, in what order, it actually walks; the only recovery, shared-screen inference, both over- and under-matched in the reporter's concrete case. No `carries_properties`: ordering reads off the walked steps' own `step_order`, the existing source of truth for sequence, rather than a second order system that could drift. Classified `semantic`, not `cross-domain`, per T1.7's own guardrail: both endpoints live in the ux_design domain, and same-domain cross-domain edges are reclassification debt to pay down, not extend.
- **`surface.extension_mechanism`** (enum: `none | component_wrap | component_replace | list_resolve | register | config_flag | render_callback`), **`extension_audience`** (multi: `config_author | schema_author | plugin_author | end_user`), **`extension_scope`** (multi: `global | per_type | per_field | per_instance`), **`extension_point`** (string, the named API path). A 154-surface field audit found 71% of surfaces coming out `closed` under the old single enum, 27 of them falsely: "has no registration list of its own" and "cannot be customized" are different facts, and one value could not separate mechanism from audience from scope.

### Deprecated

- **`surface.extensibility`** (`@deprecated since 0.36.0, removeIn 1.0.0`). Kept and still read; no stored bytes change. Unlike `risk.probability` → `likelihood_5` there is no scale to remap onto, so no machine migration ships: re-modelling a surface's real mechanism/audience/scope is a judgement call, the same cut as promoting `objective.timeframe` to a `planning_cycle` node.

---

## [0.35.0] - 2026-08-23

**Six card designs asked the graph a question it could not answer, and one property name was quietly two different measurements.** The UCS edge-canon packet (Captain-ratified 2026-08-22) filed eight edge asks against the catalogue; three were already answerable, so five landed. The same audit found `risk` rating likelihood on an epistemic ladder and severity on a benefit-framed one, which rendered a catastrophic risk green. Additive throughout, with one staged deprecation: no data migration, no breaking change.

**This release also carries 0.34.1, which was built, verified and then never published.** That patch answered an independent MCP regression audit across 0.31.0 to 0.34.0 — nine findings, four HIGH — and its own verdict was that **nothing regressed**: every HIGH is a contract a release note ALREADY ASSERTED and the primary consumer did not honour, and the six-stage gate could not see one of them, because it checks that the server is the right binary exposing the right catalog and completing a round trip and never that a documented refusal actually refuses. The sharpest: 0.32.2 shipped as the patch that stops silent write loss, and through MCP that silent write loss was still there at 0.34.0. It is folded here rather than cut ahead of this release because the two branches were one queue, and publishing the same nine fixes under two version numbers a day apart buys a reader nothing and costs them a version to reason about. **Everything 0.34.1 fixed ships in 0.35.0**, under the sections marked below; the fold changes no fix, no export and no count.

### Added

- **`research_study_captures_quote`** (hierarchy). Provenance for a verbatim quote: which study produced it. Study-first, matching the whole `research_study_*` family, so the quote card renders it inbound. The `captures` verb is reused from the observation twin on purpose: the duplicate gate is on the source→target pair, and a study captures raw material by one verb regardless of which raw shape it is. `UPG_VALID_CHILDREN.research_study` gains `quote`, giving a quote three declared parents (observation for raw capture, insight for synthesis, study for provenance). Multi-parent GRAMMAR; per-instance parentage stays single via `parent_id`.
- **`feature_specified_by_user_story`** (hierarchy). The feature-level rung of the ladder `epic_specified_by_user_story` already had. The epic level is optional in UPG, so a feature that skips it could not reach the stories that specify it, and `user_story` had exactly one declared parent. NOT named `groups`: the verb pair is cloned verbatim from the epic rung so the two rungs read identically. Same widening shape as the 0.23.0 epic twins.
- **`stakeholder_invested_in_outcome`** (cross-domain). Who cares about which outcome. Deliberately verb-only and not a scale-on-edge: the stake MAGNITUDE is already `influence` / `interest` on the stakeholder, and the reverse reading is what makes the pair right ("outcome matters_to stakeholder"). Retires the denormalised `stake_in` string a card was carrying.
- **`risk_threatens_node`** and **`risk_mitigated_by_node`** (cross-domain, polymorphic), registered as one new **16th family, "risk exposure"** — the sanctioned decision-to-anything construction with `risk` in the source slot. What a risk puts at stake is genuinely unbounded (outcome, key_result, release, service, contract, launch) and so is what mitigates it (decision, feature, experiment, security_control); enumerating either side balloons the catalogue across two open sets while the endpoint carries no structural role. Both cross-domain, so neither enters `UPG_VALID_CHILDREN` and neither can be walked as containment. `security_control_mitigates_threat` is NOT absorbed: it stays the security-domain typed edge, and this is the product-risk generalisation.
- **`likelihood_5`** (Rare · Unlikely · Possible · Likely · Almost certain). The nine spec ladders had no probability ladder, so `likelihood` was resolving to `confidence_5`, which is EPISTEMIC: it says how sure the assessor is, not how likely the event is. A risk you are certain about and a risk that is certain to happen are different facts. Vocabulary is ISO 31000's, which is also what the risk lifecycle prose and the fixtures already said.
- **`PROPERTY_SCALE_MAP_BY_ENTITY`**, wired into `getPropertyDefaultScale`. This activates the per-entity disambiguation that function has reserved since v0.4.0; resolution order becomes entity → name → `scale_5`, so every pair without an override resolves exactly as before. Two entries, both on `risk`: `impact → severity_5` and `probability → likelihood_5` (see Changed). `impact` legitimately means magnitude of BENEFIT on discovery and market entities, where high is good; on a risk it means severity of harm, where high is bad, and one name-keyed map cannot hold both. With the ladder corrected the traffic-light story arrives free from the existing polarity direction, since `severity_5` reads low-is-good.
- **`RiskProperties.likelihood`** (`UPGAssessment`, on `likelihood_5`).
- **`StakeholderProperties.engagement_posture`** (`champion | supporter | neutral | skeptic | blocker`, with `UPG_ENUM_SCALES.EngagementPosture`) and **`engagement_cadence`** (the existing `Cadence` primitive, zero new vocabulary). Posture is the third axis of the stakeholder model: `influence` and `interest` are magnitudes and carry no direction, so a high-influence, high-interest stakeholder renders identically whether they are the strongest champion or the one who kills it. The closed enum is what makes "who blocks this?" a query.

- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **`UPG_ENTITY_DESCRIPTIONS`** (and `getEntityDescription`), 328 entries covering all 324 entity types. Stated rather than slipped in: **this export was BANKED and is pulled forward by necessity.** 0.34.0's notes recorded it as the one line that would unlock the editorial gate's description term, and deliberately left it out of the ratified bundle. There is no other way for an agent surface to return an authored description when the only authored copy lives in an application, and the alternative was a second hand-maintained copy of a 328-entry string table — the exact defect the derived base-node field list exists to prevent. The documentation generator now READS this table instead of holding one, and the generated-artifact gate proves the emitted site data is byte-identical across the move. **Consequence, stated because it arrives on its own:** the editorial gate's entity-description term has been WIRED BUT INERT since 0.32.1 for want of a published export to compare against. From the next release it compares, and a reworded description becomes a change the gate can see.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **`undeclared_property_drift`**, a local `validate_graph` scope. **Deliberately NOT gating `structurally_valid`**, and the estate says how firmly: it measures 5,956 undeclared keys across 15 shapes on the 1,118-node tracker and 219 across 35 on the dogfood graph. Gating would flip both to structurally invalid on a release that changed nothing about them — precisely the failure this same audit reported against 0.33.0, where a status migration flipped that flag and broke every consumer reading it. Making it gate needs a migration path and a deprecation window and belongs in a minor.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **`gate:mcp` stage 7 — "documented refusals actually refuse"** (six stages to seven). 13 wire cases and 3 startup cases, each a reproduction from the audit carrying the release note it grades, because the case IS the note in executable form. It ships with its own labeled fixture set. **Negative control, run before it was trusted: the same corpus against the published 0.34.0 binary reports 32 failures across all nine findings.** A stage that has never been seen to fail is not a gate. One detail kept because it is the control on the control: the base-field round-trip case correctly does NOT fail on 0.34.0, because that contract was met at 0.33.0.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* Additive SDK exports supporting the above: `buildNodePatch`, `DuplicateNodeKeyError`, `UPGFileStore.getNodeByKey`, `checkUndeclaredProperties`, `isNamespacedPropertyKey`, `normalizeCompositionLifecycle`, and `description` on the entity-schema shape.

### Changed

- **Legacy `risk.probability` renders on the likelihood ladder for the length of its deprecation window** (`PROPERTY_SCALE_MAP_BY_ENTITY.risk.probability → likelihood_5`, Captain-ratified 2026-08-22). The staged deprecation above first shipped with the old spelling deliberately left on `confidence_5`, on the reasoning that stored values must keep resolving as they did. That reasoning was right about the bytes and wrong about the reader: with `likelihood` on the new ladder and `probability` on the old one, **one stored `4` read "Confident" through the deprecated name and "Likely" through its replacement — on one card, from one graph, during the exact window in which both are supposed to be live.** A staged deprecation exists so a reader can migrate WITHOUT their data changing meaning, and a ladder that differs across the rename is that meaning changing, just deferred to whenever they get round to it. The legacy spelling is pinned to the ladder it always should have had, so the two names agree until 1.0.0 drops the old one. **`forecast.probability` is untouched** and still resolves to `confidence_5` through the name-level map — it is a bare sales percentage and belongs on the epistemic ladder. Correcting one entity without disturbing the other is the whole reason the per-entity layer exists; this is the first use of it that is not a polarity fix.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **Two published claims are corrected as overclaims rather than quietly rewritten.** 0.33.0 wrote "uniqueness is enforced per product (the store index is `(product_id, key)`)" as settled fact and 0.34.0 restated the same invariant as stated-but-unchecked without reconciling the two; neither described anything that ran, on any release through 0.34.0. This release makes the sentence TRUE rather than deleting it. And `UPGBaseNode.properties` cited a tracker import as its example of the `<tool>:<key>` convention — that import writes `linear_state_history`, with an underscore, the exact shape the rule forbids. Nothing could see it until `undeclared_property_drift` existed, which then measured 5,779 such keys. The claim is corrected; the data is left for its own migration, and where a migration author will be standing is where it is written down.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **`eval:tool-use` is labelled as a one-case wire probe, not coverage.** Its output read like a score. The reporter now prints the denominator beside the pass count, read live off `tools/list` rather than hardcoded: **1 case over 99 tools, checking existence and argument shape only.** It ran green throughout the entire window in which the nine findings above were live, and could not have caught any of them, because every one is semantic.

### Deprecated
- **`RiskProperties.probability`** → `likelihood`. Staged, not removed: the `epic.estimate` → `effort` pattern. Writers emit `likelihood`; readers prefer `likelihood` and fall back to `probability`. Its ladder moves WITH the name, to `likelihood_5`, via a per-entity override — see Changed. Stored values keep resolving; what changes is that they stop resolving to a ladder the replacement field does not share. Three reasons the name loses: `probability` was one name for two incompatible types (`UPGAssessment` on `risk`, a bare `number` on `forecast`) resolving through a name-keyed map; `likelihood` is already the spec's own word in the risk lifecycle prose and on `threat`; and the fixtures had drifted to it on their own — the saturated corpus carries `likelihood` on seven risks beside `probability` on nine.

### Fixed — MCP contracts (regression audit R1–R9)

**Folded from the unpublished 0.34.1.** No schema change: no entity, edge, property, enum, lifecycle or tool added, removed or altered by any item in this section, and no public export removed or renamed. What changes is that nine contracts these notes already asserted are now honoured on the MCP surface, where an independent regression audit across 0.31.0 to 0.34.0 found them unhonoured.
- **`update_node` and `batch_update_nodes` honour the refusals 0.32.2 documented.** That release shipped `UnknownNodeFieldError` and `ImmutableNodeFieldError` on the store and described them as firing "on runtime-shaped input such as a parsed argument bag". An MCP tool-call argument bag is exactly that, and they never fired on it: the tool layer hand-built its patch by naming the fields it knew, so an undeclared key was discarded one frame ABOVE the guard and the caller received a success envelope holding an unchanged node. **The guard was real and unreachable** — the same defect the derived field list was introduced to end, one layer up. The patch is now DERIVED from `UPG_BASE_NODE_FIELDS` at the boundary where runtime input arrives (`buildNodePatch`), throwing the store's own error objects so the messages are byte-identical on both surfaces rather than paraphrased on one. Refused BEFORE the work, not at it: the single door checks before the type migration, the batch checks in its pre-pass, so a rejected call leaves nothing half-applied. `batch_update_nodes` also stops dropping a per-entry `type` in silence — it re-infers no edges, so it now says so and names the two doors that do.
- **`key`, `archived` and `archived_at` round-trip through the MCP write path.** Same root cause read from the other side. 0.32.0 declared all three and 0.32.2's note said the write path that was supposed to carry them now did; that was true of the store and false of MCP, which returned success and stored nothing for three releases. They land at 0.33.0 for the store and, verifiably, at 0.34.1 for the wire.
- **`upsert_composition` writes a view that lifecycle-aware reads can see.** 0.34.0's only new tool wrote the phase into `properties.lifecycle`, an undeclared and un-namespaced bag key, leaving the node with **no `status` at all** — so `list_nodes({ type: 'composition', status: 'published' })` returned nothing for a view that had just been published, and `get_node` reported `lifecycle` and `updated_at` as unknown properties on every composition the tool had ever written. The phase now goes to the base `status` field, whose vocabulary is the bespoke `composition` lifecycle that was already in the spec; there was never a need for a private one. `updated_at` goes to the declared base field of that name. Both stale bag keys are cleared on the next publish, so a graph written by 0.34.0 heals itself, and the reader falls back to `properties.lifecycle` until it does. **`retired` IS `archived`**: the lifecycle's terminal phase is described as withdrawn-but-retained, which is exactly what the tool meant, so the spec's name wins and `retired` becomes a deprecated input alias that stores `archived`. The union is widened, never narrowed. `rev` semantics were correct throughout and are untouched.
- **Within-product `key` uniqueness is ENFORCED on the create path.** `UPGBaseNode.key` has declared it since 0.32.0 and nothing checked it: two creates naming one key both succeeded, with no warning, on every release through 0.34.0. Measured on the only keyed graph in the estate — a second node claiming a key that already identified another was accepted. **This mattered beyond the collision**, because 0.34.0 shipped `duplicate-key-across-products` as an ENFORCED portfolio anti-pattern whose stated premise is that the per-product invariant holds; a portfolio check that assumes each product is internally clean was resting on nothing. The check lives on the single store-level chokepoint every node-create flows through, so five calling surfaces are covered by one check rather than by five. A typed `DuplicateNodeKeyError` and **not** a silent no-key: the minting rules drop a key in silence only where nobody asked for one and it was inferred, and here the caller named it. Enforced on CREATE and not on open, so a graph that already holds a collision still loads and can be repaired.
- **An unloadable `.upg` is diagnosable instead of silent.** Reported as a hang; it was not one. The server wrote the reason to stderr and exited non-zero, which almost no MCP client surfaces, so what a user saw was a server that connected and went quiet with the diagnosis somewhere they could not reach — a dead server, indistinguishable from a wedged one. The handshake is now answered: the failure path starts a degraded server that replies to `initialize`, lists the tool surface so the client renders normally, and returns the diagnosis from every `tools/call`, still exiting non-zero when the client disconnects. **The genuinely silent path was found while tracing this**: the `preflight` entry point ended with a bare dynamic import and relied on the main module's auto-start guard, which compares `argv[1]` against its own module URL and is false through preflight — so nothing started and the process exited **0 with empty stdout and empty stderr**, which is the exact failure that file exists to prevent.
- **The envelope error named fields that do not exist.** The envelope is flattened before validation, and the validator reported that flat shape: `$.upg_version` and `$.exported_at`. No `.upg` file carries either name, so a reader searching their own file found nothing and concluded the format was undocumented. The paths are now `$upg.spec_version` and `$upg.provenance.exported_at`. **The accompanying advice was chosen by a regex over the error text**, so any envelope failure mentioning `exported_at` — which both do, by construction — was told "don't hand-author a bare `{ product, nodes, edges }` file", including a file with a complete envelope, 2,158 nodes and an integrity hash that was missing exactly two fields. It now branches on whether the file actually HAS an envelope, and tells that reader to add two lines rather than rebuild.
- **`get_catalog_entry` names the replacement for a renamed edge type.** `create_edge` did; the catalog reader answered "Unknown edge type" flat, though the rename is registered in `UPG_EDGE_MIGRATIONS` and listed by `list_catalog`. **Backwards:** the server's instructions tell an agent to introspect before writing, so the agent that obeyed hit the dead end and only the one that wrote blind got the hint. Both surfaces now call one function, and a registered rename is its FIRST tier — ahead of the edit-distance match that had been getting both catalogued renames right by luck, and would not have for a rename that widened a verb.
- **`validate_graph` and `get_node` stop contradicting each other about one node.** `get_node` reported `unknown_properties` while `validate_graph` reported `property_drift: 0` for the same node. Neither was lying: they asked different questions — is this key DECLARED, versus is it covered by a migration RULE — and for a key nobody wrote a rule for, zero is honest. The real gap was that **no drift class of any kind could see an undeclared bag key**, so a whole class of spec violation was invisible to the graph-wide surface while being reported node by node. `undeclared_property_drift` is that class; `property_drift` keeps its rule-driven contract and its numbers. The shared helper also fixes a latent false positive: a correctly-namespaced `<tool>:<key>` extension was reported as unknown, which punished the one convention that makes a deliberate extension distinguishable from a typo.
- **Three surfaces answered "is this bag key declared?" three different ways.** The read surface and the graph-wide validator were collapsed onto one helper above; a THIRD copy backed the write path, so `create_node` went on warning about a correctly-namespaced `<tool>:<key>` extension that `get_node` and `validate_graph` had just stopped warning about, and one response could carry two verdicts about one key. All three now delegate. Three implementations of one question disagree eventually; the only question is which release notices.
- **`summary.undeclared_property_drift` reported the PAGE, not the total.** Every other class reports the graph's true count beside a clipped list — `summary.top_level_drift` says 1,032 next to a 100-entry array — because the summary answers "how much is there" and the array answers "here is a page of it". This class shipped counting `array.length`, so at the default limit it reported 100 on a graph holding 5,956 and the figure MOVED when a caller changed the page size. It was the first local drift class whose real population exceeds the cap, which is why the same shape in its siblings has never been visible. Fixed with an independent counter, and the payload pre-flight deliberately keeps using the page, because a summary figure and a wire-size estimate answer different questions.
- **A degraded server now says so in the handshake.** The failure path answers `initialize`; the first cut answered it with `serverInfo` and `instructions` byte-identical to a healthy server, which trades one silent failure for a quieter one — anything that reads capabilities without calling a tool reports green. The server name and the head of the instructions now carry the degradation, the file path and the missing fields.
- **`get_entity_schema` and `get_catalog_entry(entity_meta)` return the authored type description.** Neither carried one, byte-identical from 0.32.0 through 0.34.0, while the server's own instructions say to call `get_entity_schema` before creating an entity — so the sentence answering the question the caller actually has was the one thing that call did not return. The descriptions existed and were gated by `check:editorial` since 0.32.1; they lived in a documentation site's build script, so **the gate was protecting a surface no agent could see.**

### Rejected (recorded, because absence is a decision)
- **`quote_evidences_insight`** and **`stakeholder_owns_decision`** — already canon as `insight_evidenced_by_quote` and the polymorphic `node_owned_by_stakeholder`. The latter also retires the non-canon `risk_owned_by` key open since 2026-05-18.
- **`feature_contains_acceptance_criterion`** — derivable. With the story rung above, the path is feature → user_story → acceptance_criterion; a direct containment edge is the "`X_contains_Y` verb that duplicates the parent link" `ARCHITECTURE.md` forbids.
- **`risk.risk_status`** — `risk` already carries the canonical RISK_ITEM lifecycle on `status` (identified → assessed → mitigated / accepted / closed). A second status axis would shadow the first.

### Notes
- **The per-entity layer's size guard was RAISED, not bypassed.** `PROPERTY_SCALE_MAP_BY_ENTITY` ships with a test asserting it holds at most N overrides, on the reasoning that a name needing an override on three entities is a name that should be SPLIT rather than overridden. The `risk.probability` ruling makes the count 2, so the bound moved 1 → 2 with the call written into the test itself rather than the number quietly edited. A second assertion was ADDED in the same place and does not move: every override so far is on `risk`, and widening to a second ENTITY is a different decision from adding a second property to the same one. Both entries close at 1.0.0 when `probability` is dropped.

- `threat.likelihood` moves to `likelihood_5` in the same line as `risk`, which is the point of a name-keyed map when the name is right.
- No stored data changes meaning. Neither the dogfood graph nor the saturated fixture stores an explicit `impact_5` scale id anywhere, so the `risk.impact` ladder correction is a rendering fix with nothing to re-stamp; assessments that pin a `scale_id` keep it, by the existing contract.
- Truth: **324 entities · 1091 edges · 69 cross-edges · 26 anti-patterns · 99 tools · 28 polymorphic keys in 16 families · 342 lifecycle phases**. Every figure re-derived from the built dist, not carried forward from a plan. No entity minted, no tool, no anti-pattern, no lifecycle phase. Cross-edges unchanged: `risk`, `stakeholder`, `research_study`, `quote` and `user_story` are not `portfolio_shared`, so nothing here can be eligible. `UPG_SCALES` 9 → 10.
- `getPropertiesForScale` stays NAME-level by design and does not fold in the per-entity layer: a bare property name cannot express "impact, but only on risk", and listing `impact` under both ladders would tell a reader less than the current answer does.
- **0.34.1 was FOLDED into this release and never published.** No `0.34.1` heading exists above and no `0.34.1` dist exists on npm; the version was never cut. Its heading is removed rather than left as an empty marker, and this note is what a reader looking for it finds. The one line of that entry NOT re-emitted verbatim is its truth line, which said `324 · 1086 · 69 · 26 · 99 · 26 keys in 15 families · 342` and re-emitted those figures precisely to show that a patch had moved none of them. That is still true of the patch and no longer true of the release carrying it: the figures above are 0.35.0's, and the delta between the two lines is the risk-exposure minor's, not the audit's.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **Zero migrations.** Every fix is a refusal that did not fire, a value written to a field that was already declared, or a message that named the wrong thing.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **One migration NOTE, for the single release that wrote the wrong shape.** A composition written by 0.34.0 carries its phase in `properties.lifecycle` and no `status`, so it stays invisible to `list_nodes({ type: 'composition', status: 'published' })` until it is next published — reads are unaffected, because `readComposition` falls back to the bag. Republishing the view heals it. No migration ships because the estate exposure is zero: the only composition anywhere is the CI fixture's, which 0.34.0's own notes flagged when the tool shipped ahead of its first real caller.
- *(MCP contracts — regression audit R1–R9, folded from the unpublished 0.34.1.)* **One field-graph migration ran, as its own change**: the dogfood graph carried an `agent_skill` still on the pre-0.33.0 lifecycle, so every server from 0.33.0 including `@latest` reported it structurally invalid over a single node. 0.34.0 made that pass a report rather than a gate, so nothing chased it. The server had been handing over the fix the whole time — `validate_graph` named the node, the target phase and the registry — and it has now been run.

---

## [0.34.0] - 2026-08-22

Minor, additive, with **one stated compile-time break** (see Changed). Zero new entity types. Two edges, one tool, one check, three optional fields, and seven normative rulings on key machinery. The through-line: 0.33.0 gave the graph reach and left the reaching unmeasured, so most of this release is places where a shape existed, a consumer existed, and nothing joined them.

### Added
- **`document_transcludes_node`**, polymorphic, `semantic`, `deliberate_only`, with **no position property**. `describes` says a document is ABOUT a thing; transclusion says it RENDERS that node where the prose sits, so the value a reader sees is current by construction. Collapsing them would lose the only property transclusion is bought for. The item halved on discovery: the inline anchor form already existed, was parsed with source line numbers, and was published in the paper. What was missing was the BINDING, now normative: an anchor in a `document` body IS a transclusion anchor and a conformant parser writes the edge beside it. Measured before minting: 43 document nodes, 28 of them (65%) with zero outbound edge, and the canonical case was unexpressible because `metric` is not among the nine `document_describes_*` targets. No `anchor_line`, deliberately: a line number is wrong after the next paragraph above it and nothing reports the drift. The anchor IS the position.
- **`person_holds_role`**, `semantic`, `person` to `role`, verbs `holds` / `held_by`, unqualified. Minted on a grammar-versus-catalog inconsistency readable entirely inside the spec rather than on the field condition it was banked against, and that distinction is stated rather than blurred: `role` terminates at `filled` and `vacant`, `team_staffed_with_role` runs team to slot, `person_member_of_team` runs person to team, and nothing connected a person to a role. **A graph could legally mark a role `filled` and no edge could say by whom.** A terminal phase no edge can substantiate is dead schema, and worse than a phantom edge name because a phantom is inert while `filled` is a value graphs carry. `semantic` and not `cross-domain`: person, role and team are one domain, and the guardrail forbids new same-domain offenders. Direction is person to role, so the containment reading stays unavailable rather than merely unchosen.
- **`orphan_disposition?: 'root' | 'hide'` on `UPGViewPresentation`, absent means `'root'`.** 0.33.0's `nest_by` made nesting portable and left the FAILURE of nesting unportable. Measured on a real imported tracker graph of 1,118 nodes: one tree selects 218 members and renders ONE card under `hide`; three more go 185 to 1, one goes 11 to 1. The orphans ARE the dataset, because tracker-imported work wires through reference-axis relations these trees never traverse. Absent-means-root makes "everything the scope admits is visible somewhere" a checkable invariant, and the majority that prefers hiding pays for it EXPLICITLY, which is the right way round for a default deciding whether data disappears. Reclassified from application chassis to spec BY MEASUREMENT: running the two dispositions changes which nodes APPEAR, not where pixels go.
- **`provenance?: UPGEdgeProvenance` on `UPGEdge`** (`tool?`, `from?`, `at?`), **ungated**. The gate question is settled by precedent rather than by argument: `mapping_confidence` is already an ungated provenance field on every edge. `carries_properties` exists to keep semantic edges free of domain PAYLOAD; provenance is a fact about the record, and requiring an edge to opt in to having a history is the wrong shape. Nested because `UPGEdge.source` already means the source NODE, so a flat `source_id` would sit one character away meaning something else. The node side has carried provenance since the beginning; a bulk emission of 651 derived edges had nowhere on the edge to record what it derived them from.
- **`upsert_composition`** (98 to 99 tools). ONE tool, not the three asked for: `get_node` already returns a node AND its edges, so the focus join is served, and the id IS the slug, so address-by-slug works. The only thing the generic path gets actively WRONG is `rev`, which `update_node` writes from the caller's argument, silently. Write semantics are MIRRORED from the shipped `graph-service` contract rather than designed: `rev` re-derived inside the write and incremented only on a transition into `published`; `rev` as an optional precondition returning a stale-revision outcome with the stored value; omitting `members` preserving the arrangement; node and focus edges written together. The tool declares the view shapes INLINE in its own input schema, which is half its justification: they are `object` in the runtime registry, so schema introspection otherwise hands an agent three opaque blobs.
- **`duplicate-key-across-products`**, a fifth `scope: 'portfolio'` anti-pattern (25 to 26), **ENFORCED**. The same `(prefix, number)` pair identifying nodes in two products of one portfolio. Mechanically decidable, which is unusual in this catalog and is why it can ship enforced; every other portfolio entry approximates a per-node rule. What was staged is the CORPUS, not the enforcement: there is no defined-then-enforced mechanic and a registered detector that declines to fire is worse than either real option. **This release also discovered that a registered anti-pattern had no evaluator behind it** and wired one, so the claim and the code now agree.
- **`UPG_PHASE_COUNT` = 342**, distinct (template, phase) pairs, wired into `check:count-drift`. The last figure in the truth line that no check asserted, and therefore the only one that drifted. 869 counts phase ROWS and double-counts every shared template; 334 was transcribed forward since 0.32.0 and reproduces under neither computation. The definition lives on the export so the gate and the docket row cannot be derived twice.
- **`UPG_POLYMORPHIC_EDGE_FAMILIES`** is now an export, and `EDGE_KEY_ORDER` / `CROSS_EDGE_KEY_ORDER` join `NODE_KEY_ORDER` in being exported and asserted.

### Changed
- **`UPGViewClause` is a discriminated union on `dimension`**, so the `type` axis carries `UPGEntityType[]` and every other axis keeps `string[]`. **The wire format does not change at all: the JSON is identical, no migration, no fixture.** What changes is compile-time, and **this is a break; calling it additive would be dishonest.** Two measured facts make it acceptable: the field shipped ONE release ago, and the only known consumer already casts at this exact boundary with a comment explaining that the tiers disagree, so the break lands where someone has already written down why. A stated break with one known site beats a silent narrowing with none. The round-trip rule ships regardless of the union, because a union constrains authors and not JSON arriving from a file: **the clause list is authoritative, the shorthand is a positive-only projection, and a consumer that cannot represent a clause MUST REFUSE rather than narrow.**
- **A declared team prefix supersedes `product.key_prefix` and NOTHING ELSE.** The candidate set is the UNION of declared and observed prefixes, and the picker keeps asking while more than one stands. The shipped 0.33.0 sentence made ANY declaration replace the candidate set outright, while its own next sentence explains the rule entirely in terms of a single string that cannot represent two teams. An OBSERVED prefix is not that: it is evidence of a namespace already in use. Measured live: the only keyed graph in the estate carries two observed prefixes, 370 keys under one and 662 under the other, and declares neither. Under the wider reading one team declaring the smaller prefix collapses the candidate set, the picker disappears, and every later create mints under it, including the other 662 keys' worth of work. Shipped as a CHANGE rather than a patch correction because implementers had already built to the wider text.
- **Four further key-machinery rulings become normative.** The HOME PRODUCT is decided by EVIDENCE rather than by a stored marker (derivable, needs no migration, cannot go stale, cannot disagree with the keys). The UNDECIDABLE case refuses BOTH mints with no invented tiebreak, because creation order is not recorded and `max(existing)` measures import volume rather than precedence. "IN SCOPE" is ENGINE-DEFINED with a floor (every product the engine can enumerate for this caller) and a security ceiling (never a product the caller could not otherwise read); portfolio altitude is measurably the wrong altitude, since deleting the portfolio document changes nothing about minting. The honest consequence is stated rather than left to be discovered: **the invariant is scope-relative, so two engines can legitimately disagree about whether one mint is safe.** And `team.key_prefix` is IMMUTABLE once anything has minted under it IN THAT PRODUCT, refusal-shaped, scoped per product because a portfolio-shared team must stay free to declare in a product it has never minted in.
- **`check:editorial`'s fingerprint is hardened in five places.** It now attributes polymorphic edges through the family partition (a wildcard edge was attributed to NOBODY, so the 0.33.0 work-item widening moved zero fingerprints on `task`, `bug`, `user_story` or `feature`); hashes the deprecation clause rather than its truthiness; hashes the description of `object`-typed properties, where the description IS the entire declared shape; reads BOTH edge registries, where it had been reading one while its sibling function was fixed a release ago; and reads four more prose fields from the published docs. The sensitivity change was discharged with a per-arm before/after run against real published releases rather than asserted.
- **GitLab emits project membership for every work-item type**, not only epics. It was the only one of five adapters gating the emission on a concrete type, so an ordinary issue resolving to `task` or `bug` carried the project id and never reached the seam. Keyed on the work-item allowlist, never on the wildcard.
- **The field-graph migration pass is a named release step** with the releasing lane as its owner. It walks every graph, reports which migrations are due, and NEVER rewrites: when a graph is migrated the version bump is that pass's output rather than an incidental edit, and "not migrated, here is why" is a legitimate outcome. A report and not a gate, because blocking a release on a field graph being behind makes the honest answer the expensive one.

### Fixed
- **`UPGCrossEdge.properties` was never in `CROSS_EDGE_KEY_ORDER`**, and the cross-edge canonicaliser never treated it as an open bag. Declared since 0.10.0. Nothing was corrupt, because unlisted keys fall to a deterministic sorted tail, but two writers emitting the same parity assessment with their keys in a different order produced different bytes, which breaks this format's writer-agnosticism contract. Found by the new subset assertion on its first run, eleven minors after the node twin got the same guard. Measured before fixing, because a canonical-order edit rewrites bytes: **zero of the 61 cross-edges in the estate carry properties**, so the fix is free today and would not have been after the first parity assessment landed.
- **The cross-only tier's declared target contract** said these edges point at a registry entry. All three live instances target a product-qualified id and the registry is EMPTY, so a reader following the comment would look for something that has never existed. Both forms are legitimate; the field has only produced the second.
- **`UPGEdge.properties`' JSDoc named one edge as carrying the gate; eleven set it.** One word, "currently", doing the work of a gate nobody wired, wrong for ten mints.
- **A citation check called correct prose a fabricated edge name.** Widening the editorial read set surfaced it immediately: a data-product name that begins with a real entity type matched a head-only test. A real edge name ends in the type it points AT, so the check now requires both ends. Ruled rather than allowlisted, and rather than asked of the doc author: the prose was correct and the detector was not.

### Notes
- Truth: **324 entities · 1086 edges · 69 cross-edges · 26 anti-patterns · 99 tools · 26 polymorphic keys in 15 families · 342 lifecycle phases**, the last of these gated for the first time. No entity minted. Cross-edges unchanged because `document`, `person` and `role` are not `portfolio_shared`, so nothing here can be eligible.
- **Zero spec-side migrations.** Both new edges are new types with nothing to convert, all three new fields are optional, and the view-clause union changes no bytes.
- **`UPG_CROSS_ONLY_EDGE_TYPES` has NO runtime consumer**, recorded exhaustively. No writer reads it. The tier is a declared vocabulary that nothing validates at write time, which changes what a non-colliding key would buy: discipline, not a guarantee.
- **The within-graph conformance edge is NOT minted**, and its banked condition is restated to the case that is actually live. It is not "a specification in a graph with no portfolio", which no graph instantiates. It is the HOLDER PRODUCT: the graph that holds a specification has three siblings reaching it through the cross tier and no way to state its own relation to it. The verb the live case wants is `defines` rather than `conforms_to`.
- **Migration note corrections carried on `external_links`.** The overflow residue is **179, not 162** (a second bag key was never counted), and **524 of 528 nodes duplicate their own canonical reference inside the parked bag**, so a straight copy would put the canonical artifact into the non-canonical list on 99% of that field's first real population. Subtract before copying.
- **The labeled-fixture doctrine is discharged for the first time.** The new check ships with a corpus whose provenance is machine-readable and required, whose near-misses are all labelled CONSTRUCTED, and which carries a dated obligation to re-grade precision and recall on the first sampled collision. Until then the recall figure is a claim about the author's imagination, and the corpus says so in its own output rather than in a plan nobody opens.
- **A limitation this release demonstrates rather than describes.** The seven key-machinery rulings are the most consequential text in it and not one of them moves an editorial fingerprint, because prose is excluded by design. The gate that exists to catch documentation going stale cannot see the change most likely to be built against wrongly.
- Banked with conditions, unchanged: `rename_bag_key`; SDK patch derivation from `UPG_BASE_NODE_FIELDS` (this release adds no base-node field, so the trigger did not fire); re-classifying the a11y conformance edge from `hierarchy` to `semantic`; widening `document_describes_*` to the node wildcard, whose own evidence is real and separate; the within-graph conformance edge. Newly banked: an entity-description export so the editorial gate can hash descriptions on BOTH sides of a release comparison, which is what stops that arm being inert. **The `NODE_KEY_ORDER` subset assertion is CLOSED: it shipped in 0.33.0.** The "0.33.0 one-release tolerances due at 0.34.0" do not exist; 0.33.0 created none.

## [0.33.1] - 2026-08-22

Patch, docs only. No schema change: no entity, edge, property, enum, lifecycle or tool added, removed or altered. One normative contradiction, published in 0.33.0, is resolved.

### Fixed
- **`UPGBaseNode.key`'s `@remarks` no longer contradicts itself.** The `WHICH PREFIX` paragraph ended *"A product where nothing declares a prefix mints no keys"*, which deletes the inferred rung. Two paragraphs later, in the SAME block, the portfolio-uniqueness note names *"the quiet case where nobody declares a prefix and it is inferred from existing keys"*, and the product-scoped minting rule applies itself *"on the MINT path including a prefix that was INFERRED from existing keys rather than requested by any caller"*. `team.key_prefix` rule 3 presupposes the same rung: a refusal described as covering the inferred case is meaningless if inference never mints. The field settles which sentence is true — the only keyed graph in the estate carries 1,032 keys minted by inference in a product that declares no prefix at all, and under the deleted rung that graph could not exist. The paragraph now states the ladder as built, in four rungs: a create names its prefix explicitly; otherwise the prefixes declared by the product's teams are the candidates; otherwise the prefixes observed on the product's existing keys are; a product with none of the three mints no keys. `team.key_prefix` is untouched and was already correct.

### Notes
- **Truth is unmoved: 324 entities · 1084 edges · 69 cross-edges · 25 anti-patterns · 98 tools · 25 polymorphic keys in 14 families.** Prose only, so nothing moves a count, a migration, a fixture or an editorial fingerprint. That last one is worth stating rather than assuming: `check:editorial` excludes prose by design, so the most consequential text change a release can make is invisible to the gate that exists to catch documentation going stale.
- **What this patch deliberately does NOT change.** `team.key_prefix`'s suppression paragraph makes a declared team prefix replace the candidate set outright. Applied to an OBSERVED prefix that no team has claimed, that instruction is a live hazard: in a graph carrying two observed prefixes and no declaration, one team declaring one of them collapses the candidate set to that one and every later create mints under it silently, including work belonging to the other. Narrowing it is a change to what implementations must do rather than a correction to what they were told, so it is not smuggled into a patch. Interim guidance for anyone minting today: declare every prefix a product uses, or declare none.

## [0.33.0] - 2026-08-22

Minor, additive. Zero new entity types, zero new tools, zero new checks. The through-line: 0.32.0 gave the graph the right shapes and left three of them unreachable, and most of this release is reach rather than shape.

### Added
- **`project_delivers_work_item`**, widening and renaming `project_delivers_epic` to the polymorphic work-item endpoint (`semantic`, `deliberate_only`). A tracker dry-run carried 651 project memberships as a vendor property and emitted zero edges, because the default issue type an adapter produces is `task` and the only project edge could not reach it. The verb stays `delivers` and NOT `contains`: a containment verb obliges a `UPG_VALID_CHILDREN` pair, and that map is keyed by concrete type names, so a wildcard endpoint can never discharge the obligation its own verb creates. `UPG_VALID_CHILDREN.project` is untouched, deliberately. A work item is contained once, by its epic or feature, and referenced many times. One rename migration; measured population one, in the CI fixture.
- **`external_links?: UPGExternalLink[]` on `UPGBaseNode`**, generalising the `ServiceProperties.links` shape. `external_ref` still names THE canonical artifact; this holds everything else. 162 measured links were overflowing into an undeclared vendor bag key. Named `external_links` rather than `external_refs` because the latter is one character from `external_ref` and means the opposite thing.
- **`created_at` and `updated_at` on `UPGBaseNode`, tagged `@volatile`.** Store metadata, declared so a view query can open a window over them. Two of the six date dimensions a real board filters on are these, and leaving them undeclared would ship a query language that cannot say what the surface most often says.
- **`clauses?: UPGViewClause[]` on `UPGViewQuery`**, with `UPGViewDimension`, `UPGTimeWindow` and `UPGViewEdgeClause`. One clause list carrying per-clause negation, declared time windows and edge conditions, none of which the named fields can hold. The named fields stay as the positive-only shorthand and are NOT deprecated; the precedence rule is stated: a reader that finds `clauses` uses it and ignores the named fields. A window is evaluated at read time, never frozen at save, so a saved view that says "this quarter" means this quarter to whoever opens it. The team cadence is deliberately NOT a window: it resolves through the active-cycle designation as an edge clause, because field data holds 19 cycles of which every one is dateless and exactly one is `active`.
- **The D/E addendum (ratified 2026-08-22), three arms on the shapes this release mints.** **`target_designation?: 'viewer'`** on `UPGViewEdgeClause`: the person axis' parallel to the cadence axis' `target_status: ['active']`, naming the reader by role and resolving in their session. A saved view meaning "assigned to me" cannot store an id, because the id it stores is one particular person and the view is then permanently about a colleague; a shipped surface reached for the sentinel `'@me'` inside `target_ids`, which round-trips and whose meaning does not travel. A sentinel in an id field is a private protocol wearing a public shape. **`from_focus.depth` gains `'unbounded'`**: a relative selection over a tree is transitive by nature and has no correct finite depth, so a surface with only a number picks a big one, and a shipped one picked 64, which is indistinguishable from a caller who meant 64 and silently truncates the first deeper graph. **`layout` gains `'tree'` and an advisory `nest_by?: string[]`**: `group_by` partitions a flat set on a value and cannot express nesting, because a tree's levels are edges rather than property values.
- **`UPGQueryDrivenLayer`**, extended by both `composition` and `workspace`. A layer is query-driven while it is being worked on, not only after it is published; declaring the query only on the published half made the fact something invented at publish time.
- **`person_member_of_team`** and **`person_reports_to_person`**, both `semantic`, both sourced on `person`. The org half of the ontology had 17 edges reaching `team` and no path from a person to any of them, and `person_reports_to_person` was cited three times in spec prose while existing zero times, once in an anti-pattern entry that instructed users toward an edge the catalog would refuse. Neither is a reversal of the containment-free stance on `person`, which forecloses HIERARCHY edges added to satisfy a hierarchy audit; both are reference edges, and sourcing on `person` makes the containment reading unavailable rather than merely unchosen. Membership is unqualified: `role` is already an entity type, and a role string on the edge would be a second role model beside it.
- **`team.key_prefix`.** The prefix names a team, which `product.key_prefix`' own summary already said, and a single string could never express a product with two of them.

### Changed
- **`agent_skill` and `agent_hook` move from `WORK_ITEM` to `OPERATIONAL`.** A durable capability and an event trigger were both reaching `in_review` and `done`, and zero of ten field instances had ever left the initial phase. Their nearest siblings `monitor` and `alert_rule` already run OPERATIONAL. Neither becomes lifecycle-free: the `user_story` precedent for that needs a paired lifecycle-bearing entity and there is none. A status migration remaps the WORK_ITEM vocabulary; measured population four, all `todo`.
- **`specification`'s type summary** is corrected. See Fixed.
- **`department`'s type summary** records the division ruling: division, org unit and business unit are alternative LABELS for this type, not separate types. That ruling has been right and one line deep in a label array since 0.1.0, and it had already produced two phantom entity types in a briefing. The flat-department constraint is stated with it.
- **`UPGBaseNode.properties`** documents the namespaced-key rule, extended from the canvas bag to the node bag: a key a tool owns and the spec does not declare is written `<tool>:<key>`. An underscore key is indistinguishable from a misspelled spec property, which no migration can target and no validator can flag. One measured undeclared extension, raw tracker state history on 1,032 nodes, is recorded as DELIBERATELY undeclared with its pull-forward condition, because silence and a decision look identical six months later.
- **`NODE_KEY_ORDER` is exported**, with a test asserting every base field appears in it. A subset assertion, never equality: two tolerated non-base keys belong there and an equality check would push the next author to delete them.
- **MCP `create_node` / `batch_create_nodes` / `update_node` / `batch_update_nodes`** accept `archived` and `archived_at`; the create pair also accepts `key`. This mirrors `graph-service`'s existing policy exactly rather than inventing one. Widening the JSON schema alone does nothing, which is the trap this item exists to name: the SDK hand-builds its patch from its own arg interfaces, so an argument arriving without a matching field is never copied. All three layers moved.
- **`get_import_recipe` serves per-source read caveats** on both the curated and the scaffold path, keyed independently of whether a curated table exists. Linear has no curated recipe and two of the sharpest hazards in the corpus: `list_issues` truncates descriptions mid-markup on 913 of 1,032 issues, and an over-complex query returns HTTP 200 with an error body. Both are one class, a failure that looks like a success.

### Deprecated
- **`objective.timeframe`** (`removeIn` 1.0.0), pointing at `objective_scoped_to_planning_cycle`, which has existed since 0.20.0. **`strategic_theme.time_horizon`** gains the same `removeIn`; it was tagged at 0.20.0 with no removal date and survived twelve minors, which is what an undated deprecation buys. Planning entities relate to time through the scheduling edge and free-text time fields retire, and the class has a stated BOUNDARY so the next author applies a test rather than a slogan: the class is the entities that can be scheduled in a planning cycle, which is these two. `strategic_pillar.time_horizon`, `vision.timeframe`, `roadmap.timeframe`, `roadmap_item.quarter` and `journey_phase.timeframe` are named exemptions. No `drop_props`: dropping the string before the cycle exists destroys the only record of the intent.
- **`product.key_prefix`** (`removeIn` 1.0.0), superseded by `team.key_prefix`. They are not a default and an override, which describe one fact at two scopes; they describe different facts, and the product field is correct only when the product has exactly one team. Retained as the single-team unasked default and ignored whenever any team declares a prefix, because removal now would strand every graph that has a product prefix and no `team` nodes.
- **`agent_hook.hook_status`** (`removeIn` 1.0.0), a `*_status` shadow of the base `status` and the class Pattern D collapsed fourteen times at 0.15.0. `error` maps to `paused`: OPERATIONAL has no failure phase, and runtime health is store state rather than a fact about the thing.

### Fixed
- **`specification`'s summary no longer implies a gap that does not exist, and the three edge names an editorial sweep called fabricated are not fabricated.** `UPG_CROSS_ONLY_EDGE_TYPES` has carried `product_implements_specification`, `product_exposes_specification` and `feature_conforms_to_specification` since 0.9.12: product-to-foundation links are portfolio cross-edges by design, because a governed specification is a registry canonical. A citation check that reads only the edge catalog reports every legitimate cross-only edge as a phantom. The gap that DOES remain is stated with its pull-forward condition: a `specification` node inside a single product graph, with no portfolio around it, has no conformance edge available.
- The workspace archive read tolerance from 0.32.0 retires on schedule; the writer had already flipped, so it was carrying nothing still produced.
- An orphaned doc comment on `AgentSkillProperties` that documented no field.

### Notes
- Truth: **324 entities · 1084 edges · 69 cross-edges · 25 anti-patterns · 98 tools · 25 polymorphic keys in 14 families**. The lifecycle-phase count that earlier entries carry is deliberately NOT restated here: it is the one figure in that line no check asserts, and it does not reproduce. Counted off the built catalog it is 869 phase rows across 193 lifecycles, or 342 distinct (template, phase) pairs; neither is the 334 carried since 0.32.0, which traces to a planning document rather than to a constant. A number nobody can derive should not ship in a release note, so it is dropped rather than repeated. Wiring a phase count into `check:count-drift` is banked with its condition already met; it is not done in this release because adding a check would change the shape of a release ratified as adding none. No entity minted; four edges added net of one rename; cross-edges unchanged because `product`, `feature` and `person` are not `portfolio_shared`, so nothing here can be eligible.
- **Portfolio-wide key uniqueness is now DEFINED AND UNENFORCED**, stated on `UPGBaseNode.key`. Within a portfolio one `(prefix, number)` should identify one node; uniqueness is enforced per product, so two products minting under one prefix produce the same citation for two different things. This is measured, not feared: a fixture reproduces the collision through the ordinary create path, including the quiet case where nobody declares a prefix and it is inferred. No per-product check can ever see it, because each product reports its own key as valid. The standing audit is deferred with a dated condition: the first portfolio holding two keyed products, which is also the first moment a real near-miss corpus can be sampled instead of invented.
- The key-prefix PRECEDENCE is ruled in the spec rather than left to an application ladder: a declared team prefix supersedes the product prefix, and a declared prefix is a candidate before it is observed. Leaving precedence to the ladder would make migration ORDER decide behaviour, per graph, silently.
- The MCP server may not MINT a key, only accept one. Deriving `max(existing)+1` needs paged reads, and a second unpaged minter is a duplicate-key generator.
- Banked with conditions: a `rename_bag_key` migration kind; generic patch derivation from `UPG_BASE_NODE_FIELDS` in the SDK; re-classifying `product_conforms_to_a11y_standard` from `hierarchy` to `semantic`; wiring a phase count into `check:count-drift`; `person_holds_role`; the within-graph conformance edge.

---

## [0.32.2] - 2026-08-21

Patch. No schema change: no entity, edge, property, enum, or lifecycle added or removed. The 0.32.0 base fields become reachable through the write path that was supposed to carry them.

### Fixed
- **`UPGFileStore.updateNode` round-trips every `UPGBaseNode` field.** It merged a hand-maintained list of seven names and returned the unchanged node as a SUCCESS for anything outside it, so the three fields 0.32.0 added to the shape (`key`, `archived`, `archived_at`) were accepted and discarded. A caller could not tell a lost write from a landed one; the key-minting contention loop in the local graph-service adapter hit exactly this and spent its whole retry budget re-minting a key that could never move. The mergeable set is now DERIVED from the shape, so a field added to `UPGBaseNode` round-trips with no further edit.
- **An undeclared top-level field is now REFUSED, not dropped.** `updateNode` throws the new `UnknownNodeFieldError` naming the offending keys, and refuses atomically so the valid half of a patch cannot land beside a silently discarded half. Changing `id` throws `ImmutableNodeFieldError`; restating the current `id` stays legal, so spreading a whole node into a patch keeps working. Type-level callers cannot reach either path, since `Partial<UPGBaseNode>` rejects an undeclared key at compile time; the guards fire on runtime-shaped input such as a parsed argument bag.
- **Drift detection no longer reports a minted key as non-spec.** The canonical top-level field sets behind `top_level_drift` (the load-time counter in `@unified-product-graph/sdk` and the per-node breakdown in `validate_graph`) were two more hand-maintained copies of the same list, and 0.32.0 updated neither, so every node carrying `key`, `archived`, or `archived_at` was counted as holding non-spec top-level fields. Both derive from the shape now.

### Added
- **`UPG_BASE_NODE_FIELDS`, `UPG_BASE_NODE_FIELD_SET`, `UPG_BASE_NODE_SPECIAL_MERGE_FIELDS`** on `@unified-product-graph/core`: the `UPGBaseNode` key set as runtime data, and the subset a generic shallow merge must not touch. A TypeScript interface is erased at runtime, which is why four consumers each kept their own copy behind a comment asking the next editor to remember. The list is locked to the interface by a `Record<keyof UPGBaseNode, true>` that is exhaustive in both directions, so adding a field to the shape without extending the list is now a COMPILE error rather than a silent divergence discovered three releases later.
- `UnknownNodeFieldError` and `ImmutableNodeFieldError` are exported from `@unified-product-graph/sdk`.

### Notes
- Truth unchanged: **324 entities · 1082 edges · 69 cross-edges · 25 anti-patterns · 98 tools · 334 phases**. Zero new tools, zero new checks.
- Release process: `scripts/upg-release.sh` gains a step that regenerates the five `apps/entopo` spec mirrors from the freshly built train and then re-runs their `--check` forms. Those mirrors sit outside the release train's build filters, so no release ever ran their generators or their gates, and they have gone stale three times; 0.32.1 shipped with the snapshot still reading 0.32.0. The failure resists inspection because the drift test reads a checkout's `dist/`, and against a stale `dist` the comparison is stale-against-stale and reports green.
- The MCP `update_node` and `batch_update_nodes` tools still do not accept `key`, `archived`, or `archived_at` as arguments, so those fields remain unreachable from the agent surface. Widening a tool's argument schema is additive surface rather than a fix and is deliberately NOT in this patch.

---

## [0.32.1] - 2026-08-21

Patch. No schema change: no entity, edge, property, enum, or lifecycle added or removed.

### Fixed
- `capture` and `composition` now carry authored one-line descriptions in the published catalog data. The 0.32.0 site rendered `capture` as "A capture entity": a generator fallback, not a description. The generator now refuses to emit a fallback and fails the build naming the undescribed type.
- `@unified-product-graph/adapters` exports `mapLinearPriority` and `normalizeLinearStatus` from the barrel, and `./adapters/*` is in the package `exports` map, matching every other adapter's normalisers.
- Documentation: the `planning_cycle` active-cycle and roll-forward rules are stated in `PlanningCycleProperties`; the two different sets the word "work item" names (the scheduling family and the WORK_ITEM lifecycle set) are spelled out in the lifecycle template; `classification_axis` no longer claims to be hosted only by a competitive analysis; the `workspace.canvas` namespaced-key rule carries one dated statement; `specification` states plainly that no typed conformance edge from product or feature exists yet; the `bug.labels` deprecation names both replacement halves.

### Added
- Release gate `check:editorial`: a release is red until every entity type has an authored description, a published editorial doc with guidance and body, a review stamp at or above the release version for every new or shape-changed type, and no edge name cited in doc text that the catalog does not define. Ships with labeled fixtures; the live train refuses `--skip-editorial`.

---

## [0.32.0] - 2026-08-21

**A graph can now hold a real issue tracker's corpus without losing anything, and a query-driven view can say what it is a view OF.** Nine items in one design cycle: the two shapes the D-track held for "the next minor" (F1's query declaration, Q4b's artifact record) plus the six asks from a measured 1,032-issue Linear-parity audit. Additive throughout; three migrations registered, every one with a live population of zero.

### Added
- **`capture`** (ent_362, `proposed`, lifecycle-free, containment-free) + **`capture_renders_node`** (cross-domain, polymorphic). A dated, hashed rendition of something already in the graph: a screenshot, an export, a PDF. The subject stays a graph node; the capture says what it looked like at a moment and how to tell whether it still does. Deliberately NOT named `artifact` — that word already means `workflow_artifact` here and an inline-content document store in at least one consumer, and a third meaning is how a vocabulary stops being one. Extending `document` fails the dual-shape gate three ways (it has the PUBLISHING lifecycle, no hash, no captured-at, and a typed subject-matter edge family that is not a rendition relation); extending `workflow_artifact` would force a phantom `workflow_run` per file, since that is its only structural parent.
- **`UPGBaseNode.key`** — the stable, human-citable handle (`LTN-311`), unique within the product ACROSS types, immutable once assigned, never reused. Not `slug`: a slug is unique within `(product_id, type)` and auto-derives from `title`, so two types could legally hold one key and a retitle would break every citation. Not `external_id`: that records where a node CAME from and is structurally incapable of minting the next one. Paired with **`product.key_prefix`**; no counter is serialised, because the next number is `max + 1` from the graph and a counter is a fact about a store rather than about the product.
- **`UPGBaseNode.archived` / `archived_at`** — archive as an axis ORTHOGONAL to `status`. Generalised from `WorkspaceProperties`, which shipped the same pair for one type. Field data says it is general: a tracker held 559 archived-completed items beside 18 live-completed ones, and every existing `archived` LIFECYCLE PHASE is `status_category: 'completed'`, so in the six-bucket read the two were indistinguishable. Default-read convention (archived excluded from default views, always queryable) is documented, not enforced.
- **`node_assigned_to_person`** (cross-domain, polymorphic). Assignment is not ownership, and this REVERSES the 0.12.0 rule that routed `task`/`bug` `assignee` into `node_owned_by_person`. Assignment carries an interval and an exclusivity ownership does not, and a real board ran 85% unassigned while every item was owned — a state one edge cannot express. Existing `node_owned_by_person` edges are deliberately NOT rewritten: on a task, one is indistinguishable from genuine ownership by inspection, so a blanket rename would reclassify real facts. `user_story` gains the promotion rule it never had.
- **`product_dimensioned_by_classification_axis`** (hierarchy). One level of label grouping needs NO new label surface: `classification_axis` + `classification_value` + `node_classified_as_classification_value` have been `stable` since 0.4.0 and are strictly better than a `tag` entity (edge-level rationale, declared cardinality, cross-product eligible). The only thing missing was a home — the axis's sole parent was `competitive_analysis`. The line between the two mechanisms: **if the group has a name a person would filter by, it is an axis; otherwise it is a tag.**
- **`UPGViewQuery` / `UPGViewPresentation` / `UPGViewPredicate`**, with `member_query` and `presentation` on `composition` and `derived` on its members (F1's shape). The location was ruled at 0.31.0; this is the shape, and it extends `composition` rather than minting a view entity, because a composition is already named, slugged, published, revisioned and shared. Selection is portable and travels; presentation is advisory and a consumer may ignore all of it. `derived` discharges the field finding that auto-admitted members were being counted as authored content — membership arrives by query, position is authored, and a signature meant to answer "did a person change this" must exclude the former.
- **`backlog` on the WORK_ITEM lifecycle.** The template reached four of the six `StatusCategory` buckets, and the cost was arithmetic rather than theoretical: a source "Backlog" normalised to a phase this template does not have, importers omit what they cannot map, and roughly 195 of a measured 1,032-issue corpus arrived carrying no status at all. NO `triage` phase — that bucket is reachable through INCIDENT and DISCOVERY, where triage is actually practised, and a task nobody has accepted is a task in `backlog`. `initial_phase` deliberately stays `todo`: moving it would change what every existing graph's next node means.

### Changed
- **`planning_cycle_schedules_user_story` → `planning_cycle_schedules_work_item`**, widened to the polymorphic work-item endpoint by the same construction `work_item_blocks_work_item` used in the same 0.20.0 batch. The story-only endpoint could not hold a tracker import, because importers default an unrecognised issue to `task` — the one type a cadence could not reach. Registered rename; no flip. The `planning-cycle-without-scheduled-work` anti-pattern is retargeted with it, or a cycle full of tasks would have reported as empty.
- **`workflow_state_category` narrowed from `string` to `StatusCategory`** on all five carriers (`feature`, `epic`, `user_story`, `task`, `bug`). The field exists to carry exactly that vocabulary; an open string meant nothing enforced the one thing it was for. A side effect worth having: the generated runtime schema now emits the six bucket values as `enum` for the first time.
- **`RelationshipCheck.target_type` admits the wildcard**, and the presence collector records polymorphic edges under BOTH the concrete and the wildcard key. Half of this is a type widening; the other half is a latent false-positive class — the index is keyed by concrete endpoint types, so a check declaring `'node'` would have matched nothing, and for a `not_exists` comparison matching nothing means firing on every correct graph.
- The one-release read tolerance for the pre-0.31.0 underscore canvas key **retires as scheduled**. Preservation is unaffected: the key is no longer read, and still carried byte for byte.

### Deprecated
- **`WorkspaceProperties.archived` / `archived_at`** → the base-node pair, lifted by `UPG_PROPERTY_MIGRATIONS['0.32.0']`.
- **`TaskProperties.labels` / `BugProperties.labels`** → dropped. A duplicate of base-node `tags` with no consumers anywhere; three parallel label surfaces were two too many.

### Fixed
- `WorkspaceProperties` documented its parent edge as `product_contains_workspace`, which has never existed. The real edge is `product_thinks_in_workspace`, with `organization_` and `product_area_` siblings per altitude.
- The 0.31.0 CHANGELOG named the migrated canvas key `entopo:views`; the writer and its own contract test both use `entopo:view_blocks`. A shipped CHANGELOG cannot be recalled from npm, so the correction rides here.

### Notes
- Truth: **324 entities · 1082 edges · 69 cross-edges · 25 anti-patterns · 98 tools · 334 phases**. Zero new tools. Zero new checks — three invariants (`key` uniqueness, one active cycle per parent, archived-excluded-by-default) are DEFINED and unenforced, each with a stated pull-forward condition, because a check without a graded corpus is one nobody can defend.
- Edge arithmetic, as the cheapest check that design and build agree: +1 hierarchy, +2 cross-domain, semantic unchanged because the cadence edge was renamed rather than added. 452→453h, 421→423x.
- Polymorphic edge families: **13 (24 entries)**. Assignment is registered as its OWN family rather than folded into universal ownership, so a future author who merges them does it visibly.
- One new `(source, target, classification)` collision, and it IS the design: `node → person / cross-domain` now carries both `owned_by` and `assigned_to`. Verified as the only one; the other three new edges collide with nothing.
- The retargeted anti-pattern ships a labeled fixture set including the near-miss it was most likely to misjudge — a coarse `period` cycle that schedules nothing directly and only nests finer cycles.

---

## [0.31.0] - 2026-08-19

**The eval harness gets the four spec affordances its architecture brief asked for, and the workspace canvas learns what a tool-owned key is.** Two threads converge: the eval-architecture design cycle (ratified 2026-08-16) needed benchmarks that can name what they measure and runs that can carry more than one number; and the image-artifact pilot found two namespacing conventions already coexisting in one canvas bag, with the spec silent on which was right. Additive; no breaking change; no migration of any `.upg` file.

### Added
- **`eval_benchmark_measures_node`** (semantic, polymorphic). A benchmark names its SUBJECT by pointing at it: a tool, a document, a check, an importer, a feature. The wildcard is deliberately wider than the truth (a benchmark cannot meaningfully measure a persona); that over-width is stated on the label as an honest deferral of "what is a tool in the graph", which this release does not answer. Coexists with the typed `eval_benchmark_measures_feature` on the `constraint_constrains_feature` / `node_constrains_node` precedent.
- **`eval_benchmark_draws_cases_from_ai_dataset`** (semantic). A labeled corpus IS an `ai_dataset`; this is the one join edge that makes it so, per the recurrence discipline that tries the existing type before minting one.
- **`metric_scores` on `eval_run`** — an exported `MetricScore[]` (`metric`, `value`, `sample_size`), so a run reports precision AND recall as separate numbers instead of one aggregate `score` or a stringly-typed pair. `value` is normalized 0 through 1 (1 best) because comparing runs is the entire reason the array exists and two runs on different raw scales do not compare; non-rate measurements (wall-clock, tokens, cost) stay on their typed fields. `sample_size` is required: a sampled run reports its sample size beside its score, always, so a comparison across runs can never quietly compare different sample sizes.
- **`benchmark_type` widened** with `precision_recall`, `task_success`, `coherence`. The enum is a DIMENSION axis (what kind of number); the subject axis lives on `eval_benchmark_measures_node`. Do not add subject-shaped values here — they would encode on the dimension axis what the edge already carries, and the two would drift.
- **Namespaced keys on the workspace canvas.** The rule, now in spec: a tool-owned key is `<tool>:<key>` (colon, because an underscore key is indistinguishable from an ordinary property name — which is also why no validator can police this rule, and enforcement is documentation plus the type); every consumer preserves unknown keys byte for byte; **no consumer interprets a key it does not own** — preservation is a storage guarantee that says nothing about meaning. `WorkspaceCanvas` carries a template-literal index signature encoding the colon form at compile time.
- **`composition` type-scope sentence** (F4) clarifying which entity kinds an identity rule reaches.

### Changed
- The driving query of a query-driven layer is declared in spec, not in a bag key — a consequence of the no-foreign-interpretation rule: a bag-held query would make every future gallery proprietary to one application. The LOCATION is ruled here; the SHAPE is held for the next minor, since the field pilot measured that the hole exists, not what fills it.
- `entopo_views` (underscore) migrates to `entopo:view_blocks` (colon) in the same window as this release, executed by the Entopo Local lane: same-day rename, one release of tolerant reading for dev-written files carrying the old form, tolerance retiring at 0.32.0. Tolerance converts an undetectable failure into a scheduled one.

### Notes
- Truth: 323 entities · 1079 edges · 69 cross-edges · 25 anti-patterns · 98 tools. Zero new checks; the syntax rule introduces none because none could see the half that matters.
- Polymorphic edge families: 10 (21 entries), asserted as data in the spec-integrity test (a `FAMILIES` record that must partition the array exactly).
- Fixture coverage: both new edges carry saturated-graph instances; `eval_benchmark_measures_node` points at an `api_endpoint` deliberately, so the example teaches the wildcard where the typed feature edge does not belong.
- The 0.30.0 package shipped a CHANGELOG whose `[0.29.0]` heading had been lost to a release-prep edit; this release carries the corrected ladder.

---

## [0.30.0] - 2026-08-15

**A surface tree is often not one tree but a family of trees selected by configuration, and the graph can now say so.** A feature flag, a plan tier, a permission level or a beta programme changes which surfaces exist and what contains what; until now every surface fact was implicitly qualified by "in whatever configuration someone happened to be looking at", unrecorded. The stored graph is now the union of that family, a single configuration is a projection of it, unqualified facts are invariant, and a graph declaring no variance is semantically identical to before. Zero migration; additive; no breaking change.

### Added
- **`configuration_axis` entity** (`proposed`, `ent_360`) — one node per semantic lever, with a closed `values` list, a `default_value`, and a `kind` (`feature_flag | plan_tier | permission_level | beta_program | other`). One axis per lever, not one per code flag: the axis names what the team pulls, the flag names how the code implements it.
- **Four edges.** `product_defines_configuration_axis` (hierarchy — the axis renders in the tree), `surface_varies_by_configuration_axis` (carries `present_under: [values]`; no edge means invariant), `feature_flag_drives_configuration_axis` (mechanism vs lever), and `surface_alternates_with_surface` ("one of these, depending" — validated against the axis declarations, direction by convention only).
- **`active_when` qualifier** on `surface_contains_surface` and `feature_occupies_surface` — and deliberately on no other edge: conditional composition is the question this release answers, and a general modality system is not. The scope is enforced: a qualifier on any other edge type is a `configuration_drift` error.
- **Projection operator** — node exclusion, then edge deactivation, then dangling removal; commutative across axes; identity on graphs declaring no variance.
- **`configuration_drift` validate scope** — ten checks covering unresolved axes, empty value lists, illegal qualifiers, contradictory alternations, and projection-stranded children. Error-severity drift gates `valid` and `structurally_valid`.
- **Per-projection anti-pattern evaluation.** Findings true everywhere report unqualified, exactly as before. Findings true in only some configurations report once, annotated (`configurations: [{axis, value}]`). Findings true only in the union are suppressed and counted (`suppressed_union_artifacts`) — they are superposition artifacts, the double-count class 0.28.0 removed. Findings true only in a projection are surfaced — a check may legitimately fire for one plan tier and no other, and the union cannot see it.
- **`configuration` parameter** on `query`, `get_tree`, and `validate_graph` — read or validate one member of the family. Every other tool rejects the argument by name rather than silently reading the union. Configuration-vs-configuration diffing rides `query`'s existing `diff_from`, which now reports edge deltas when `edge_include` is set. Tool count unchanged at 98.

### Changed
- The one-named-configuration convention (published with 0.29.0) becomes the documented fallback for graphs that do not declare variance: the configuration you named is the projection you were implicitly describing, and nothing needs migrating when you begin declaring axes.

### Notes
- Truth: 322 entities · 1073 edges · 69 cross-edges · 98 tools. Zero new anti-patterns — the drift checks carry the invariants, and a detector with no field evidence behind it is how a check family gets noisy.

---

## [0.29.0] - 2026-08-15

**The contention check learns to read `capacity`, violations learn to name their nodes, and a batch write learns to un-say a property.** All three came from the same field reporter measuring the check on a real 43-surface graph: 10 surfaces flagged, 7 correctly, 3 falsely — and every false positive had an occupant count at or below its stated capacity. A surface whose occupants all fit is partitioned, not contended. Additive; no breaking change.

### Changed
- **`contended-surface-without-arbitration` is capacity-aware.** The rule-absence branch now fires per surface only when `occupancy > (capacity ?? 1)` — occupants within a stated capacity are partitioned by design, and an unbounded surface (absent capacity) with several occupants still fires, because no stated limit means no stated answer. Contention is *displacement* (who is not rendered), which capacity settles; *ordering* of coexisting occupants remains guidance on `composition_mode: 'additive'`, deliberately not a second detector.
- **Violations carry `target_node_ids`.** Attribution rides the same collector aggregates as the verdicts: a fired check names the offending nodes instead of only the entity types, and `get_anti_pattern_violations_for` matches by id exactly for the types the id list covers (`matched_by: 'node' | 'type'`), keeping type-level reach for types never attributed. The payload reserves an empty `configurations` field for per-projection attribution (0.30.0).

### Added
- **`edge_count_vs_property` check form** — a general per-node comparison of an edge count against a numeric property with a declared absence default. Deliberately not a one-off: the form fits any place the graph states a numeric intent.
- **`unset_properties` on `batch_update_nodes`** — batch parity with `update_node`'s existing affordance, so returning a property to *absent* no longer requires literal nulls. For `capacity` the distinction is load-bearing: absent (unbounded), `0` (reserved), and `null` are three different states.
- **`product.described_configuration`** (optional string) — names the configuration a graph describes, the typed home for the one-named-configuration convention published alongside this release. Naming, not configuring: a label for readers, read by no tool.

### Notes
- Backfilled below: 0.28.0 shipped 2026-08-13 without a changelog entry; it is recorded now so this entry does not sit on a gap.

---

## [0.28.0] - 2026-08-13

**Four field-data additions teach `surface` to tell the truth about multiplicity, composition, arbitration, and drift.** All four came from one reporter populating 0.27.0's `surface` against a real 30-surface product (three parallel code audits, 329 file:line citations) before writing a single node. Additive; no breaking change. *(Backfilled 2026-08-15 — this release shipped without an entry.)*

### Added
- **`cardinality`** (`1 | 0..1 | 1..n | 0..n`) and **`instance_scope`** (`global | per_parent`) — `capacity` counts occupants per instance; these count instances. Without them the graph says "the product has an inspector panel" when the truth is "each document pane has its own."
- **`composition_mode`** (`exclusive | additive | chained`) — how co-occupants relate. `chained` (each occupant wraps the next) is a trust model, not contention, and is exempt from `contended-surface-without-arbitration` — declare-to-earn: an unset `composition_mode` still fires.
- **`arbitration_state`** (`enforced_documented | enforced_undocumented | safe_by_coincidence | none`) — routes remediation instead of guessing it. `safe_by_coincidence` and `none` fire the contention check on their own admission; a written rule cannot mask them.
- **`surface_deviates_via_technical_debt_item`** edge — `capacity` always means *intent*, and drift from it becomes a trackable, assignable debt item instead of a lie or an endorsement.
- **Except-form on the presence filter** — `filter: { property, present, except_property, except_value }`, needed because the chained exemption is an intersection the marginal forms could not express.

---

## [0.27.0] - 2026-08-12

**A `surface` entity gives the UI a place: what occupies it, and who wins when two things want it.** The catalog could say who OWNS a thing (`feature_area`) and what ARCHITECTURE it belongs to (`bounded_context`), but nothing answered *what else occupies the same place?*. `screen` is route-level (route / viewport / access_level) and too coarse for a shell, a pane, a slot, a field gutter, an action bar, or an overlay. Those places are contested, and the arbitration rule is decided constantly and then rediscovered forever, because prose is where it lands. `surface` records the place, its guest list, and the rule. Additive; no breaking change.

### Added
- **`surface` entity** (`proposed`, `ent_359`) — a place in the UI, in the `ux_design` domain beside `screen`. Reached through the screen that renders it and self-nesting from there (shell holds panes, panes hold regions, regions hold slots). Lifecycle `draft → in_design → built → shipped → deprecated`, shared verbatim with `screen` so a screen and the surfaces inside it report progress on one vocabulary. Eight properties: `surface_kind` (shell / tool / pane / region / slot / gutter / action_bar / overlay / ambient), `persistence`, `visibility_condition`, `capacity`, `arbitration_rule`, `extensibility`, `mutates_content`, `dimensional_constraint`.
- **Ten surface edges.** Outbound: `surface_contains_surface` (hierarchy, the nesting spine), `surface_serves_job` (cross-domain), `surface_governed_by_design_guideline` (cross-domain, cross-product-eligible), `surface_renders_design_component` (hierarchy, cross-product-eligible), `surface_measured_by_metric` (semantic, cross-product-eligible), `surface_supersedes_surface` (semantic). Inbound: `feature_occupies_surface` (cross-domain, the guest list), `screen_renders_surface` (hierarchy), `decision_affects_surface` (cross-domain), `journey_step_occurs_on_surface` (semantic, the finer-grained sibling of `journey_step_shown_on_screen`).
- **Three anti-patterns.** `contended-surface-without-arbitration` (medium) fires when features occupy surfaces and at least one carries no `arbitration_rule`. `surface-without-job` and `surface-without-measurement` (low, both thin-graph advisory) are its coverage companions.
- **Property-presence filter on `EntityCheck`** — `filter: { property, present }` counts entities that do or do not carry a value for a named property, backed by a new optional `countsByTypeAndPropertyPresence` input. The pre-existing value-keyed filter cannot express absence, because a collector only indexes values that exist; without this, a detector keyed on an unfilled field could never fire.

### Notes
- `surface_measured_by_metric` is `semantic`, not `hierarchy`. The `*_measured_by_metric` convention splits on ownership: `outcome` / `objective` / `strategic_pillar` are `hierarchy` because they own their metrics as children, and each carries a matching `UPG_VALID_CHILDREN` entry. A surface owns no metric, so it takes the `revenue_stream` / `cost_structure` half of the convention.
- `capacity` is a plain optional number whose ABSENCE means unbounded. `PropertyDefinition.type` is a single scalar kind with no union form, so a sentinel value was the alternative, and a sentinel every consumer must special-case is worse than a documented absence.

---

## [0.20.1] - 2026-07-04

**Three edges close the alignment-sheet seam: an initiative can now reach directly into the OKR ladder and the roadmap, and a strategic pillar gets its own north-star metric.** Composed flat region surfaces spanning org/team/product altitudes surfaced two gaps in the strategic cascade: an initiative's only path to a key result or a roadmap theme ran through its parent `strategic_theme`, and `strategic_pillar` — durable, multi-year, org-wide — had no measuring metric of its own, unlike every other rung of the cascade (`objective_measured_by_metric`, `key_result_quantified_by_metric`). Additive; no breaking change.

### Added
- **`initiative_advances_key_result`** — `initiative` → `key_result`, causal (intra-strategy execution, not cross-domain), cross-product-eligible. Extends the curated OKR laddering DAG that `objective_measured_by_metric` / `key_result_quantified_by_metric` are already part of.
- **`initiative_delivered_via_roadmap_theme`** — `initiative` → `roadmap_theme`, semantic, within-graph. Mirrors `strategic_theme_realised_by_roadmap_theme`: a cross-reference between the strategy spine and the roadmap spine, not containment, so initiatives can reach the roadmap without routing through their parent theme.
- **`strategic_pillar_measured_by_metric`** — `strategic_pillar` → `metric`, hierarchy, cross-product-eligible. Mirrors `objective_measured_by_metric` one level up the cascade; `metric` joins `strategic_pillar`'s valid children.

---

## [0.20.0] - 2026-07-04

**A cadence layer for the product-delivery region: one self-nesting `planning_cycle` entity models sprints, iterations, quarters, program increments, and cooldowns, so a Jira or Linear export round-trips its time-boxes losslessly.** The delivery region could describe what ships (feature → epic → story → task) and what governs it (release, roadmap, theme), but had no home for the interval work flows *through*. This release mints `planning_cycle` — a named, dated, self-nesting interval discriminated by `cadence_kind` (period / iteration / buffer) rather than a type per methodology — plus the edges that schedule work into it and scope objectives and themes to it. It also closes the smaller structural gaps a Jira ∪ Linear import hits: polymorphic issue links, a dual-band `workflow_state` that preserves an imported tool's raw states without displacing the canonical `status`, and the task-level planning fields lifted onto `user_story`. Additive; no breaking change.

### Added
- **`planning_cycle` entity** (`proposed`) — the cadence axis. A self-nesting container in the `product_spec` domain / `product_delivery` region, `portfolio_shared`, lifecycle `planned → active → closed`. Properties: `cadence_kind` (period / iteration / buffer), `cadence_label`, `starts_on`, `ends_on`, `sequence`, `goal`, `appetite`. One type with a `cadence_kind` discriminator spans sprint / iteration / quarter / program-increment / cooldown; self-nesting handles the granularity ladder (a PI contains iterations; a cycle contains its cooldown).
- **Core cadence edges** — `planning_cycle_contains_planning_cycle` (self-nesting containment), `objective_scoped_to_planning_cycle` and `strategic_theme_scoped_to_planning_cycle` (OKR / theme cycle-scoping, provisional cross-scope), `planning_cycle_schedules_user_story` (deliberate-only work scheduling — a story keeps its feature/epic containment parent), and `product_runs_planning_cycle` (top-level attach).
- **Polymorphic work-item issue links** — `work_item_blocks_work_item`, `work_item_relates_to_work_item`, `work_item_duplicates_work_item` over the work-item set {feature, epic, user_story, task, bug}, all deliberate-only.
- **Dual-band `workflow_state`** — a freeform `workflow_state` plus an optional `workflow_state_category` on the work-item entities, so an imported custom workflow round-trips losslessly without displacing canonical `status` as the reasoning axis.
- **`planning-cycle-without-scheduled-work`** anti-pattern (low severity) — a cadence box that neither schedules work nor nests a sub-cycle.

### Changed
- **`user_story` gains `priority`, `effort`, `assignee`, `due_date`** — the story is now a first-class plannable unit alongside `task`, matching the tools where the story / issue is the estimated-and-assigned atom.

### Deprecated
- **`strategic_theme.time_horizon`** — promote the bounded period to a `planning_cycle` node linked with `strategic_theme_scoped_to_planning_cycle`. The property is kept and readable; removal is a later major. `strategic_pillar.time_horizon` (a durable, open-ended pillar horizon, not a dated cycle) stays as-is.

---

## [0.19.0] - 2026-07-04

**The MCP surface consolidates from 139 tools to 93 (+ 5 prompts): the static-spec introspection cluster folds into four faceted reads, and five procedural routers become skills.** The spec catalogue had accreted 45 near-identical `list_*` / `get_*` reads plus five routers — a surface an agent had to scan linearly before it could choose. This release collapses the reads into four facets and retires the routers, leaving the 89 write and live-graph-read verbs untouched. A parity gate (`retired-tools.json` + a byte-equality test wired as a prepublish stage) proves every retired tool's data is still reachable and identical through the facets, on both the local and cloud servers — which licenses a clean break with no deprecation window. Both servers' instructions gain a methodology preamble (the SEE → THINK → ACT → LEARN working loop) so the surface conveys *how to work*, not only *what exists*. Breaking. Local 139 → 93; cloud 100 → 54.

### Added
- **`list_catalog({ kind })`** and **`get_catalog_entry({ kind, id })`** — the two faceted reads that subsume 40 per-catalogue `list_*` / `get_*` tools (entity types, edge types, regions, lenses, domains, anti-patterns, playbooks, frameworks, …).
- **`get_spec_version` gains `changelog` and `since`** — folds the proposed `get_changelog` / `whats_new` surface in; `changelog: true` returns this file parsed into entries, `since` filters to versions strictly newer. Default output is byte-identical to before.
- **Enriched `get_entity_schema`** — now also returns valid children, the entity's region, and the resolved edge for a source→target pair (absorbing `get_valid_children`, `get_region_for_entity_type`, `resolve_edge_for_pair`).
- **Shared `mcp-catalog` module** imported by both servers, so parity is structural rather than hand-maintained.
- **Methodology preamble** in both servers' instructions.

### Removed
- **48 spec-introspection tools** (25 `list_*` → `list_catalog`, 15 `get_*` → `get_catalog_entry`, 3 folds into `get_entity_schema`, 5 routers → skills). Every one is reachable — byte-equal — through the faceted surface (parity-gated).

---

## [0.18.0] - 2026-07-03

**Cross-product edge eligibility becomes a three-state gate derived from entity tiers, replacing the hand-maintained allowlist.** 0.17.3 derived which edge *types* may cross graphs; this governs which *instances* may, per endpoint. A `portfolio_shared` flag on 26 entity-type-meta records sorts every candidate cross-product edge into three tiers: **curated** (38 — explicitly modelled, allowed), **provisional** (194 — plausible cross-graph pairs, allowed with a warning and no PR requirement), and **resident** (794 — spine containment that must co-reside, hard-rejected). Pure tier-derivation over-admits by 4–5×, so eligibility is treated as *permission, not obligation*. Canonical cross-edges are unchanged at 59.

### Added
- **`portfolio_shared`** on `EntityTypeMeta` (26 types) — the tier signal the gate reads.
- **Tri-state `cross_product_scope`** on the read path.

### Changed
- **Cross-product write validation → a three-state gate** — a relaxation: provisional pairs now warn-and-allow rather than block.

---

## [0.17.8] - 2026-07-03

**The write-merge path stops silently clobbering concurrent edits: field-level three-way merge, and delete/modify collisions surface as conflicts.** A latent defect (roughly three months old — not a regression) could drop one of two concurrent edits to the same node. The merge is rewritten to reconcile at the field level and to raise delete/modify collisions as explicit `CONFLICT`s instead of resolving them silently. The dogfood graph was verified clean. SDK-only.

### Fixed
- Field-level three-way merge; delete/modify collisions surfaced as `CONFLICT` (zero silent resolution).

---

## [0.17.7] - 2026-07-02

**Property schemas rejoin the generated-artifact gate, entity descriptions are filled in, and a count-drift guard prevents doc/spec divergence.** The property-schema files re-enter `check:generated` so they cannot drift from source, missing entity descriptions are authored, and a new `check:count-drift` gate fails the build whenever a hardcoded count anywhere disagrees with the derived spec counts.

### Added
- **`check:count-drift`** release gate.

### Changed
- `switching_cost.magnitude` resolves onto the `severity_5` assessment scale (finalised).
- Property-schema files back under `check:generated`.

---

## [0.17.6] - 2026-07-02

**A shelf-clearing sweep: `reload_product` for conflict recovery, `insight_informs_opportunity` made deliberate-only, and a property-modifier doc generator.** `reload_product({ discard_local })` recovers from a write `CONFLICT` when the active `.upg` was edited out of band, without a restart. `insight_informs_opportunity` is flagged `deliberate_only`, so an insight-contains-opportunity nesting no longer auto-materialises a judgment edge. A generator keeps the property-modifier docs in sync, alongside copy and count-accuracy fixes.

### Added
- **`reload_product`** conflict-recovery tool.

### Changed
- `insight_informs_opportunity` → `deliberate_only`.

---

## [0.17.5] - 2026-07-02

**`user_research` gains provenance: a `source_url` and document containment, so an insight can point back to where it came from.** Research entities could hold findings but not cite them. This adds `source_url` to `user_research` and a document-containment path so a research artifact and the insights extracted from it carry a verifiable source.

### Added
- `source_url` on `user_research`; document-containment provenance for research.

---

## [0.17.4] - 2026-07-01

**OKR-planning coverage — objective↔dependency, a `strategic_question` entity, defer edges — plus the `deliberate_only` keystone that stops auto-nest from materialising judgment edges.** From the first graph-versus-planning-doc fidelity check: `objective_depends_on_dependency` and its mirror `dependency_blocks_objective`; a new `strategic_question` entity that completes the research / design / strategy question triad; and defer edges (`objective_defers_feature` / `objective_defers_capability`) that carry a freeform `deferred_to` planning label. The keystone is a `deliberate_only` catalogue flag, derived once into `UPG_DELIBERATE_ONLY_EDGE_TYPES`, that every auto-nest write path and adapter resolver reads — so an edge that must be authored deliberately is never inferred from a containment nesting.

### Added
- **`strategic_question`** entity (the strategy-domain sibling of `research_question` / `design_question`).
- `objective_depends_on_dependency` / `dependency_blocks_objective`.
- `objective_defers_feature` / `objective_defers_capability`, carrying a `deferred_to` edge property.
- **`deliberate_only`** catalogue flag + `isDeliberateOnlyEdge` derivation.

---

## [0.17.3] - 2026-07-01

**A single `cross_product_eligible` catalogue flag now derives the entire cross-edge registry — one source of truth for which edge types may cross graphs.** The cross-edge type set had been maintained by hand. This makes it a derivation: a `cross_product_eligible` flag on each edge-catalogue entry flows automatically into `UPGCrossEdgeType` and `UPG_CROSS_EDGE_TYPES`, while portfolio-native edges stay in the explicit `UPG_CROSS_ONLY_EDGE_TYPES`. It front-loads the whole strategy / OKR / measurement laddering plus the eight product→strategy alignment edges (the set moves 41 → 55). Ships with an atomic `batch_delete_cross_product_edges`, an `org` tree pattern (department → team → sub-team), and portfolio-structure reads.

### Added
- `cross_product_eligible` flag + the derived cross-edge registry.
- `batch_delete_cross_product_edges` (atomic).
- `org` tree pattern.

### Changed
- Cross-edge set 41 → 55.

---

## [0.17.2] - 2026-06-30

**Org-wide modeling: second-level team nesting, cross-product OKR/measurement edges, a `constraint_origin` sub-role, and young-graph anti-pattern tuning.** `team_contains_team` adds parent→child org nesting. Four OKR/measurement edges (`strategic_theme_contains_objective`, `objective_achieved_through_key_result`, `key_result_quantified_by_metric`, `objective_measured_by_metric`) gain cross-product registry variants (cross-edges 37 → 41). `deduplicate_nodes` gains a read-only `match: "similar"` near-duplicate suggestion, `update_product` a slug / file-rename path, and `constraint` a `constraint_origin` (internal / external) sub-role.

### Added
- `team_contains_team`; four cross-product OKR/measurement edge variants.
- `constraint_origin` on `constraint`.
- `deduplicate_nodes match: "similar"`; `update_product` rename path.

### Changed
- Three coverage anti-patterns stage-tuned so young graphs aren't flagged prematurely.

---

## [0.17.1] - 2026-06-30

**First-class `create_portfolio` with portfolio kinds, and a domain-guide note separating `product_area` from `team_org`.** `create_portfolio` becomes a first-class tool (warning on a dangling `parent_portfolio_id`), and a domain-guide note distinguishes `product_area` (a product's own decomposition) from `team_org` (who owns it). Includes post-QA repairs to workspace re-kinding and `member_kind` docs.

### Added
- `create_portfolio` tool + portfolio kinds.

---

## [0.17.0] - 2026-06-29

**`operating_function` gains a `member_kind` discriminator and a required north-star metric, with cross-product org-ownership edges and three anti-patterns.** The operating-function layer (how an org runs itself) matures: a `member_kind` discriminator with table-driven validation profiles, a required north-star metric (with softened coverage warnings on thin graphs), and cross-product ownership edges linking an operating function to the org that runs it. Also completes Pattern G C1 — `owner: string` becomes `node_owned_by_*` edges.

### Added
- `member_kind` on `operating_function` + validation profiles.
- Operating-function org-ownership cross-edges.
- Three anti-patterns: operating-function without north-star / operating-content / org-link.

### Changed
- `operating_function` requires a north-star metric.
- Pattern G C1: `owner: string` → `node_owned_by_*` edges.

---

## [0.16.2] - 2026-06-18

**A first-class template system: `list_templates` / `get_template` (local + cloud parity), an SDK access layer, and the `/templates` gallery driven from the package.** Starter templates become queryable spec data rather than site content — two MCP tools with parity across both servers, an SDK template-access layer and `upg template` CLI command, CLI starter seeds sourced from the package, and the site gallery reading the same single source. Ships with a conformance drift gate.

### Added
- `list_templates` / `get_template` (local + cloud); SDK template layer; `upg template` command.

---

## [0.16.1] - 2026-06-18

**Adoption-path hardening: revived CLI verify gates, SDK-reference re-verification, and a templates conformance pass.** A QA sweep of the adoption surface (SDK / CLI / MCP): the dead `--no-orphans` / `--no-broken-chains` verify gates are revived, the SDK barrel reference is re-verified against core, templates gain a conformance pass and drift gate, and skills' stale status / stage vocabulary is scrubbed to canonical. Tooling and docs only; no spec-model change.

### Fixed
- Dead `verify --no-orphans` / `--no-broken-chains` gates; SDK barrel-reference drift; stale status / stage vocabulary in skills.

---

## [0.16.0] - 2026-06-17

**Pattern G — the open-standard data boundary: 12 PII / registry / vendor properties dropped, 20 infrastructure pointers tagged `@volatile`.** The boundary ADR draws the line between what the open standard models (product structure) and what it must not carry (personal data, tenancy, session, vendor pointers). Twelve such properties are removed and twenty infrastructure pointers marked `@volatile`. Breaking. The `owner: string` → edge split (C1) defers to 0.17.0.

### Removed
- 12 PII / registry / session / vendor properties.

### Changed
- 20 infrastructure pointers → `@volatile`.

---

## [0.15.0] - 2026-06-17

**Pattern D — 14 `*_status` shadow properties collapse into the entity lifecycle.** Fourteen properties that duplicated an entity's phase as a parallel `*_status` scalar are removed; the single base `status` / lifecycle becomes the one axis, and the T1.1 guardrail goes 14 → 0. `*_status` properties that are genuinely distinct axes (not subsets of a phase set) are kept. Breaking.

### Removed
- 14 `*_status` shadow properties (lifted to base `status`).

---

## [0.14.1] - 2026-06-17

**Release rider: a browser-safe `crypto` import in the canonical serialiser (unblocks browser bundlers).** The canonical serialiser imported `crypto` in a form that broke browser bundlers; it is namespaced to `node:crypto`. Fix only.

### Fixed
- Browser-safe `crypto` import in `format/canonical.ts`.

---

## [0.14.0] - 2026-06-17

**Pattern E — 14 deprecated / ghost properties removed, with a hard-removal guard.** Fourteen long-deprecated or never-implemented ("ghost") properties are removed, gated by a new T1.8 guard that fails the build if a hard-removed property reappears, and recorded in `UPG_PROPERTY_MIGRATIONS['0.14.0']`. Breaking.

### Removed
- 14 deprecated / ghost properties.

### Added
- T1.8 hard-removal guard.

---

## [0.13.2] - 2026-06-17

**Runtime-state properties are tagged `@snapshot` and aggregates `@derived`, taking the T1.2 / T1.3 baselines to zero.** The additive half of Wave 2: roughly 55 runtime / live-state properties on definition entities are marked `@snapshot` and about 30 derived / computed scalars `@derived` — mark, don't delete — so the guardrail baselines reach 0 without data loss.

### Changed
- ~85 properties tagged `@snapshot` / `@derived`.

---

## [0.13.1] - 2026-06-17

**A connective cross-edge layer: shared jobs and needs, feature→product surfacing, screen→competitor targeting, persona delegation, and design-system connectors.** New cross-domain edges that connect entities without containing them — `shares_job` / `shares_need`, `feature_surfaces_product`, `screen_targets_competitor`, `persona_delegates_to_persona` (agent delegation, promoted to a cross-edge), and design-system connectors. The relational tissue between domains.

### Added
- Connective cross-edges: `shares_job` / `shares_need`, `feature_surfaces_product`, `screen_targets_competitor`, `persona_delegates_to_persona`, design-system connectors.

---

## [0.13.0] - 2026-06-17

**Edge hygiene: a dead revenue cross-domain edge dropped, the hypothesis lifecycle de-duplicated, and the metric↔outcome cycle broken.** Wave 1 of the structural cleanup removes a dead cross-domain revenue edge, collapses duplicate hypothesis-lifecycle edges, and breaks a metric↔outcome reference cycle that made traversal ambiguous. Adds CLI `tree --pattern` help for `north_star`.

### Changed
- Dead revenue cross-domain edge removed; hypothesis lifecycle de-duplicated; metric↔outcome cycle broken.

---

## [0.12.8] - 2026-06-17

**A queryable property-modifier surface (`@derived` / `@snapshot` / `@volatile`) with the T1.2 / T1.3 guardrails.** Introduces the property-modifier vocabulary as first-class, queryable spec metadata — a property can be tagged derived (computed), snapshot (cached live-state), or volatile (infrastructure) — and the guardrails that hold the counts. This is the substrate the 0.13.2 tagging pass and the 0.16.0 boundary sweep build on.

### Added
- Property-modifier surface + T1.2 / T1.3 guardrails.

---

## [0.12.7] - 2026-06-17

**A cross-product reference family for brand, design system, and marketing.** Edges that let one graph reference shared brand, design-system, and marketing entities living in another graph within a portfolio.

### Added
- Cross-product reference edges (brand, design system, marketing).

---

## [0.12.6] - 2026-06-17

**`user_story` and `experiment_run` graduate to `stable`.** Two proposed entity types meet the promotion rubric and graduate.

### Changed
- `user_story`, `experiment_run` → `stable`.

---

## [0.12.5] - 2026-06-17

**A `screen_markets_product` cross-edge, the `portfolio_census` read, and a single-sourced active entity-type count.** Adds the `screen_markets_product` cross-edge, a `portfolio_census` cross-product read tool, a hardened proposed-promotion rubric checker, and single-sources the active entity-type count.

### Added
- `screen_markets_product` cross-edge; `portfolio_census` tool.

---

## [0.12.4] - 2026-06-16

**P14 Bucket B — actor scalars become promotable to polymorphic `node_owned_by_*` edges (additive).** The actor-ownership string fields become promotable to polymorphic `node_owned_by_*` edges via `promote_scalar_to_edge`, per the enumeration-versus-polymorphism ADR. Additive — promotion is opt-in.

### Added
- P14 Bucket B: actor scalars → `node_owned_by_*` (promotable).

---

## [0.12.3] - 2026-06-16

**`switching_cost.magnitude` steered onto the `severity_5` assessment scale; the SDK resolves products in `workspace.json` subfolders.** Property-scale alignment plus a resolver fix so products nested in workspace subfolders are found.

### Changed
- `switching_cost.magnitude` → `severity_5` assessment scale.

### Fixed
- `findProductFileById` resolves products in `workspace.json` subfolders.

---

## [0.12.2] - 2026-06-16

**Canonical registry: `register_instance` resolves nodes in any workspace product.** The registry / instance-of layer's `register_instance` now resolves its target across any product in the workspace, not only the active one.

### Changed
- `register_instance` — cross-product node resolution.

---

## [0.12.1] - 2026-06-16

**`operating_lifecycle` / `operating_stage` refined (properties and edges).** Property and edge refinements to the operating-lifecycle primitive introduced in the 0.11 line.

### Changed
- `operating_lifecycle` / `operating_stage` property + edge refinements.

---

## [0.12.0] - 2026-06-16

**P14 — the string-reference sweep: `promote_scalar_to_edge` turns entity-reference scalars into real edges, starting with 22 orphans and the flagship `north_star_metric`.** The keystone of the P14 conformance track. A `promote_scalar_to_edge` engine converts properties that named another entity by string into first-class edges: Bucket A1 promotes 22 orphan entity-reference scalars, A2 resolves shadow references, Bucket C collapses one aggregate, and the flagship `north_star_metric` becomes an edge. This is the foundation the polymorphic-ownership work (Bucket B, 0.12.4) and the modifier waves build on.

### Added
- `promote_scalar_to_edge` engine; `north_star_metric` edge; `list_scalar_to_edge_migrations` (cloud parity).

### Changed
- 22 orphan scalars, shadow references, and one aggregate → edges (P14 A1 / A2 / C).

---

## [0.11.6] - 2026-06-16

**Version bump — regenerated site artifacts and paper-count sync.** Version-stamp and artifact regeneration; no spec-model change.

---

## [0.11.5] - 2026-06-15

**`get_tree` gains a `commercial` pattern: the business-model spine as a one-call tree.** The monetisation axis was the one populated, tree-shaped region with no pattern — *"show me the money model: streams, costs, tiers, and the metrics that measure them"* meant a hand-authored `query`. `commercial` roots at `business_model` and walks its revenue streams, cost structure, and unit economics; a stream into its pricing tiers, the metrics that measure it, and the pricing strategy that prices it; and metrics decompose into their components (the MRR waterfall). A pricing tier reached from both its stream and its pricing strategy renders once, then as a shared reference — the same multi-parent (G5) path `delivery` relies on. It is a curated spanning tree over the containment subset of the multi-hub `business_gtm_growth` region (the GTM/value flow stays excluded — a tree would misrepresent it); company-grain financials (CAC, LTV, runway) hang off the product, not a single stream, and remain an okr/strategy concern. Declarative child-map record, no engine work, all-optional (a stream without a metric is not a structural hole). 12 patterns now; no new tools (131). A new pattern on a young tool = a patch.

### Added
- **`commercial` tree pattern** (a.k.a. business / money model). Anchor `business_model`, fallback `product`, region `business_gtm_growth`, natural depth 3, all-optional gap policy. Child map: `business_model -> {revenue_stream, cost_structure, unit_economics}`; `revenue_stream -> {pricing_tier, metric, pricing_strategy}`; `cost_structure -> {metric}`; `pricing_strategy -> {pricing_tier}`; `metric -> {metric}` (the self-nesting decomposition waterfall, cycle-terminated by the assembler's shared-reference guard). Surfaced on `list_tree_patterns` / `get_tree_pattern` introspection and the `/upg-show-tree` skill.

---

## [0.11.4] - 2026-06-14

**`get_tree` now linearises a DAG into a tree deterministically: no double-counted node, children in canonical order.** Field-testing the `journey` pattern on a fully-wired forest surfaced two structural defects, both Tier-1 (truth, not presentation — two competent agents must get the identical tree). A step reachable both directly (`user_journey -> journey_step`) and through its phase (`-> journey_phase -> journey_step`) rendered twice: once in full, once as a hollow `shared` reference — the exact mirror of the 0.9.17 silent-drop fix (G5), now silent *duplication* (J1). And children came back in storage order, ignoring the `*_order` scalars they carry, so every client had to re-sort (J2). Both are fixed by two declarative slot fields on the pattern child-map; the assembler does the linearisation once, server-side. No new tools (131); a behaviour fix on a young tool = a patch.

### Added
- **`order_by` on a tree pattern child slot.** Names the node scalar `get_tree` sorts the slot's children by (ascending, nodes lacking it last). Wired on the `journey` pattern: `journey_phase -> phase_order`, `journey_step -> step_order`, `journey_action -> action_order`, `screen_state -> state_order` (the sequence convention). Surfaced on `get_tree_pattern` introspection rows. Ordering is a property of the data, not the viewer — so the server returns children pre-sorted rather than leaving every client to re-sort (J2).
- **`prefer_via` on a tree pattern child slot.** Names the sibling type whose path is the canonical spine when a slot reaches the same node redundantly by two declared paths. The `journey` pattern's direct `user_journey -> journey_step` slot declares `prefer_via: journey_phase`: a step also reachable through a phase renders under the phase only. A step in no phase still renders directly (the direct path is the fallback, never a silent drop). Surfaced on `get_tree_pattern` rows (J1).

### Changed
- **`get_tree` returns children in canonical order across every pattern.** Children are grouped by their declared slot position, then sorted by the slot's `order_by` scalar (stable within ties). Previously edge/storage order. A pattern with no `order_by` slots is unaffected beyond the now-deterministic slot grouping.
- **`get_tree` collapses a redundant DAG path instead of double-counting it.** A node reachable from one parent by two declared paths renders once, under the `prefer_via` spine. Genuine multi-parent sharing (a node under two *different* parents) is unchanged — it still renders once in full and as a `shared` reference elsewhere (the 0.9.17 G5 behaviour). Verified on the saturated journey forest: every redundant direct-plus-phase step now renders once; legitimate cross-parent shares preserved.

---

## [0.11.3] - 2026-06-14

**A reclassification now supersedes the prior value instead of leaving a stale edge.** 0.11.0 recorded a competitor's move in the reclassification history but kept the old same-axis classify edge, so after a move the competitor was classified as BOTH the old and the new value — `get_portfolio_tree` double-counted it (Data's brief, confirmed live on 0.11.1). This release retires the prior edge as part of the move, keyed off a new axis cardinality field so a genuinely multi-select axis is never collapsed. Property add + behaviour fix = a patch.

### Added
- **`cardinality` on `classification_axis` (`single` | `multi`, default `single`).** Declares whether a subject may hold several values on the axis at once. A separate concern from `axis_kind` (categorical/ordinal/continuous): an axis can be categorical yet single-select. The supersede behaviour keys off it; an axis with no `cardinality` set behaves as `single`.
- **`audit_axis_overlap` (new tool, 131 total; local-only).** Lists every classified source carrying more than one value on a single-select axis — the stale-edge detector for overlaps already in a graph, and the regression guard once supersede is on. A clean graph returns `overlaps: []`. Multi-select axes are exempt.
- **`supersede` flag on the classify writers.** `create_classification_edge` / `create_cross_product_edge` / `batch_create_cross_product_edges` (and `upg portfolio classify --no-supersede`) accept `supersede` (default true) to opt out of retiring the prior edge when an additive (multi-cell) write is genuinely wanted.

### Changed
- **A same-axis classify move on a single-select axis retires the prior edge.** When a classify write supersedes a sibling classification of the same source on the same axis, the portfolio store now removes the prior edge (atomically with recording the move) so the source carries exactly one current value per single-select axis. The reclassification history is recorded either way; the response reports the retired edge under `superseded`. A `multi`-select axis keeps every value (records the move, retires nothing). This makes `diff_classification` (history) and `get_portfolio_tree` (current state) agree across reclassifications.

---

## [0.11.2] - 2026-06-14

**Two analysis reads over the classification layer: compare two rivals, and digest a property's distribution.** The competitive tier could render the landscape (`get_portfolio_tree`), audit its completeness (`audit_property_coverage`), and diff its history (`diff_classification`), but two by-hand motions from the backfill stayed manual: comparing two competitors axis-by-axis, and counting a property's distribution over the `jq` dump. This release lands both as read tools (Data's tooling-gaps brief #5/#6). Current-state reads, no history substrate, no schema or data migration. New tools are a patch under spec policy.

### Added
- **`compare_classifications` (new tool, 129 of 130; local-only).** `compare_classifications({ a, b, axis? })` joins two classified nodes axis-by-axis: where they sit at the same value (`agree`), at different values (`diverge`), or where only one has been graded (`a_only` / `b_only`). Divergences are ordered first (the actionable rows). It reuses the same per-node profile assembly as `get_portfolio_tree` competitor_profile, so axis / value / confidence resolution is identical. This is the bridge from the classification layer to the parity layer: `create_parity_edge` is the writer; this derives which axes warrant one.
- **`aggregate_edge_properties` (new tool, 130 of 130; local-only).** `aggregate_edge_properties({ edge_type, group_by?, property? })` returns the distribution of one edge property across every portfolio cross-edge of a type — overall, or grouped by `axis`, `competitor`, or `value`. `property` defaults to `confidence`, and an assessment-object property buckets by its label, so "165 Confident / 53 Some evidence, the uncertain ones cluster on `ext_api_sdk`" is one call instead of a count over a dump. The digest of the property layer.

---

## [0.11.1] - 2026-06-14

**Bug fix: the typed classification writer misrouted competitor sources, duplicated instead of upserting, and disagreed with the confidence scale.** The generic cross-edge writers got their in-place upsert in 0.10.6; the typed convenience writer `create_classification_edge` never inherited it, and on a qualified `{product}/{node}` competitor source it wrote the wrong edge type, created a duplicate, and expanded `high` to a different `confidence_5` value than the rest of the graph. Three defects in one call (Data's dogfood brief), all on a path the generic writers already do correctly. No data migration.

### Fixed
- **`create_classification_edge` now upserts instead of duplicating.** Root cause was the misroute below: a qualified competitor source was mis-typed as the polymorphic `node_classified_as_classification_value`, so the `(source, target, type)` dedup never matched the existing `competitor_…` edge and a second edge was created. Correct routing makes the write land on the existing cell in place (`status: "updated"`).
- **Qualified-source type routing.** A `{product}/{node}` source whose node is a `competitor` now resolves to `competitor` — via the owning product file, and failing that the portfolio's `instance_of` index (which maps `{pid}/{nid}` to its canonical type without a local product file) — and writes `competitor_classified_as_classification_value`. Bare local sources keep the polymorphic type.
- **Confidence-scale agreement.** `high` now expands to `confidence_5` value **4** (canonical label `Confident`), not 5 — matching the generic writers and the existing classify-edge population, so two writers can no longer populate the same axis with different numbers for the same word.

### Added
- **Pinned friendly confidence mapping on the scale (`confidence_5.friendly_aliases = { low: 2, medium: 3, high: 4 }`).** The single, introspectable source of truth — surfaced via `get_scale` — that `create_classification_edge` (and any future friendly-confidence writer) resolves through `friendlyToAssessment(scaleId, word)`. The expansion carries the canonical point label (`Confident`), not the input word.

---

## [0.11.0] - 2026-06-14

**Self-documenting competitive history: a competitor's classification change records itself.** The 0.10.x tier classifies competitors against axes and values and carries `confidence` / `assessed_on`, but a re-assessment overwrites the prior value — there was no way to ask *what moved*. This release makes the classification landscape remember its own changes. A minor bump: it widens the `competitor_signal.signal_type` enum (union widening), which spec policy treats as a minor; additive, so old graphs still parse.

### Added
- **`reclassification` shape on `competitor_signal`.** The `signal_type` enum gains `reclassification`, and the type carries four optional transition properties — `competitor` (the classify-edge source, identifying subject + product), `axis`, `from_value`, `to_value`. A reclassification is one more kind of the dated competitor move the entity already models.
- **Append-only `signals[]` collection on the portfolio document.** A portfolio-scoped, optional, additive collection holding the classification-history stream. Kept here rather than in `registry.nodes` (so it never pollutes the canonical-vocabulary tier or the landscape/tree reads) and rather than in a product graph (so the auto-emit stays atomic with the portfolio cross-edge write). Round-trips through the canonical serializer; portfolios without it stay byte-identical.
- **`diff_classification` (new tool, 128 total; local-only).** `diff_classification({ product?, competitor?, since? })` reads the reclassification history and projects each move (`from_value` to `to_value` on an axis) with resolved titles, newest first. "Did Sitecore move from integrated to agentic since last quarter" is one call. Pairs with the 0.10.8 freshness filter (which decides *when* to re-assess); this surfaces *what* changed.

### Changed
- **Classify writes auto-record a move.** When `create_cross_product_edge` / `batch_create_cross_product_edges` create a classify edge that supersedes a sibling classification of the same competitor on the *same axis* (resolved via registry edge or `axis:` tag), the portfolio store appends a `reclassification` signal — completeness by construction, no caller discipline. Record-only and non-destructive: the superseded edge is kept (a `categorical` axis may legitimately carry several values), so current-state reads are untouched. First-time classifications are not moves; unaxed values are skipped (a single-axis move cannot be proven); an identical transition is logged at most once.

---

## [0.10.8] - 2026-06-14

**Operational tooling for the property layer: coverage audit, write pre-flight, freshness query.** The 218-edge confidence backfill (0.10.6) needed five manual motions the MCP did not expose, mostly `jq` over `portfolio.upg`. This release lands the three near-term ones from Data's tooling-gaps brief. Read-path plus a non-mutating write flag; no schema or data migration.

### Added
- **`audit_property_coverage` (new tool, 127 total; local-only).** Given an `edge_type` and the `required_keys` that should be present, returns the portfolio cross-edges that lack any of them (`missing: [{ edge_id, source, target, source_title?, target_title?, missing_keys }]`) plus, by default, the edges whose present values fail the type property schema (`malformed`). The completeness check that distinguishes "I ran the writes" from "the data is actually backfilled," with resolved titles, without a shell.
- **`dry_run` flag on `create_cross_product_edge` and `batch_create_cross_product_edges`.** Forecasts the write (`would: create | update | unchanged`, and `would_counts` for the batch) without mutating the portfolio document. The pre-flight that makes a large backfill safe to reason about before it runs. Backed by a non-mutating `previewCrossEdge` on the portfolio store that mirrors `addCrossEdge`'s create/update/unchanged decision (including the property-upsert merge) exactly.

### Changed
- **`list_portfolio_cross_edges` gained a freshness filter.** `older_than_days` (relative to now) and `assessed_before` (absolute ISO date) return the stale set: edges whose `properties.assessed_on` is older than the cutoff, or absent entirely (never assessed counts as stalest). The read path for "which cells need re-checking" — the trigger of a self-updating competitive tier.

## [0.10.7] - 2026-06-14

**Makes the classification landscape renderable: a portfolio tree, title resolution, and projected/paginated cross-edge reads.** 0.10.6 made classifications *queryable* (traversal, distribution, idempotent upsert). But nothing on the MCP surface rendered the result as a tree, and the nearest read overflowed the transport cap and returned opaque ids — the trees were only producible by dropping to `jq` over a dumped portfolio file, a path no fresh agent can find. This release closes that discoverability gap. Read-path only; no schema or data migration.

### Added
- **`get_portfolio_tree` (new tool, 126 total; local-only).** The portfolio-grain counterpart to `get_tree` (which stays product-scoped). Two shapes: `landscape` (a classification axis to its values to the nodes classified at each, every leaf carrying `confidence` / `assessed_on`; anchorable at one axis or value via `from_id`, or the whole portfolio) and `competitor_profile` (one node's position on every axis it has been graded against). Titles resolve from the registry and `instance_of` registrations, so output names entities (`Sitecore`) rather than `p_…/n_…`. The whole-portfolio landscape is counts-only by default (members inline when anchored, or on `include_members: true`) so it stays under the transport cap. Values whose axis is not wired surface in an explicit `unaxed` bucket rather than vanishing.
- **`list_portfolio_cross_edges` is now agent-usable.** `resolve_titles` (default on) adds `source_title` / `target_title`; `property_include` trims heavy edge properties (e.g. to `confidence` alone); `limit` / `offset` page the flat list with `returned` / `has_more`. A payload guard estimates from edge rows rather than refusing a routine read. The 218-edge matrix now reads back under the cap with titles, without a shell.

### Fixed
- **`portfolio_digest`'s classification distribution resolves axes by tag as well as edge.** Axis grouping previously used only `classification_axis_includes_classification_value` registry edges, so a graph that linked values to axes by an `axis:<slug>` tag (the common case) reported every value as unaxed. The shared resolver now tries the registry edge first, then the tag, and the digest carries a `render_with: get_portfolio_tree` pointer so the landscape is discoverable, not just present.

### Changed
- The competitive lens surfaces `get_portfolio_tree` when a classification landscape exists.

## [0.10.6] - 2026-06-13

**Closes the classification read/write loop: query traversal, a digest distribution, and idempotent property upsert.** With the classification surface in place (0.10.3) and carrying validated properties (0.10.4), three gaps remained between *writing* a classification and *reading it back*. This release closes them.

### Fixed
- **`portfolio_query` follows a classify cross-edge to its registry target.** A classify edge crosses from a product (or watched) graph into the registry, so a per-product reader never opened the document holding the target and the query reported `total_edges: 0`. When a cross-edge type is named in `traverse[]`, the query now appends the matching portfolio cross-edges and resolves their registry targets as terminal nodes (`registry/{id}` with its title). Within-graph queries that name no cross type are byte-identical to before.
- **Cross-product edge writers no longer drop properties on an idempotent hit.** `create_cross_product_edge` and `batch_create_cross_product_edges` previously no-op'd when an edge already existed, silently discarding any new `properties` — which blocked backfilling confidence/evidence onto edges created earlier without them. They now **upsert**: an existing edge with new properties is merged (existing id preserved, no duplicate) and reported as `updated`; an identical re-write is `unchanged`. `create_classification_edge` on a qualified cross-product competitor source now resolves the owning product read-only and types the edge as `competitor_classified_as_classification_value` rather than the polymorphic fallback.

### Added
- **`portfolio_digest` carries a classification distribution.** Alongside the structural counts, the digest now reports, per classification axis, how many members fall on each value — the shape of the competitive field at a glance. Best-effort: a missing or legacy portfolio document never breaks the digest.

No entity, edge, or cross-edge-type change (entities 316, edges 985, cross-edge types 24, local tools 125).

---

## [0.10.5] - 2026-06-13

**CLI parity for classification and edge-carried properties.** The classification/edge-property capability had no `upg` command-line surface; a product creator working a competitive analysis in a terminal could not reach what an agent could.

### Added
- **`upg portfolio classify <node-id> <classification-value-id>`** with `--confidence`, `--assessed-on`, `--rationale`, `--evidence`, and `--node-product`. Routes within-graph vs cross-product automatically and picks the specialised competitor edge type over the polymorphic one when the source is a competitor.
- **`--properties <json>` on `connect` and `portfolio connect`.** Properties are validated against the edge type's `property_schema` (unknown key or off-scale value rejected at exit) before the edge is written; a no-op when the type declares no schema.
- **`--source-product` and `--group-by` on `portfolio edges`** for filtering and grouping the cross-edge listing.

No entity, edge, or tool-count change (entities 316, edges 985, local tools 125).

---

## [0.10.4] - 2026-06-13

**Edge-carried properties become a typed, validated schema; classification edges carry confidence and provenance.** 0.10.0's parity edge already carried its assessment on the edge; this release generalises that into a first-class mechanism and applies it to classification.

### Added
- **`property_schema` on edge definitions.** An edge type may declare the properties it is allowed to carry, each with its own type (enum, assessment on a named scale, date, provenance mixin). `validateEdgeProperties(type, props)` validates edge-property writes against it exactly as node properties are validated against an entity shape, and `getEdgePropertySchema(type)` exposes the schema for introspection.
- **`CLASSIFICATION_EDGE_PROPERTY_SCHEMA`.** Classify edges carry a `confidence` assessment on the `confidence_5` scale, an `assessed_on` date, a free-text `rationale`, and `evidence`. A `CLASSIFICATION_CONFIDENCE_MAP` resolves `low`/`medium`/`high` to `confidence_5` assessment values, so a write can name a level and store a structured score.

A classification placement is now structured data rather than a sentence in a notes field: *"every competitor placed as agentic with at least medium confidence"* is a filter, not a re-read.

---

## [0.10.3] - 2026-06-13

**Classification completion: a polymorphic node classifier and a registry-tier axis model.**

### Added
- **`classification_axis` and `classification_value` registry entities.** A classification axis owns a set of values (*AI maturity* → *agentic*, *integrated*, *bolt-on*), defined once in the shared registry so every product and watched graph in a portfolio is positioned against the same vocabulary. Linked by `classification_axis_includes_classification_value`.
- **`node_classified_as_classification_value`**, the polymorphic classify cross-edge for any node, alongside the specialised `competitor_classified_as_classification_value` for the common case of placing a rival.

---

## [0.10.2] - 2026-06-13

**A number-to-assessment reshape migration and the registry-canonical classification cross-edge.**

### Added
- **Value-aware property migration.** A reshape migration lifts a bare numeric property to a structured assessment (`{ value, label, scale_id }`), and migration-drift detection became value-aware so a graph carrying the old shape is flagged and repaired on load rather than silently passing.
- **Registry-canonical classification cross-edge.** A classify edge can target a canonical `classification_value` in the registry (`{source}/{node} → registry/{value}`), the cross-product form the portfolio tier reads.

---

## [0.10.1] - 2026-06-13

**The competitive-intelligence write surface.**

### Added
- **Parity-edge writer.** Tooling to create `feature_rivals_competitor_feature` edges carrying the parity assessment (status, relative quality, gap flag, assessed-on, evidence, confidence) on the edge.
- **`member_kind` setter.** Set a portfolio member's kind (`product`, `org_rollup`, `watched`) so a watched competitor graph can be marked as not-to-be-scored against product-management expectations.

---

## [0.10.0] - 2026-06-13

**The Competitive Intelligence tier.** Extends the portfolio tier from what an organisation *owns* to what it *watches*: one new entity type, a parity edge family, a role lens, a member kind for graphs you do not own, and a property-type addition for structured competitive records.

### Added
- **`competitor_signal` entity** (Region 4, Market & Competitive): a single dated competitor move — launch, pricing change, acquisition, partnership, market entry — emitted by a `competitor` via `competitor_emits_competitor_signal`.
- **Parity and signal cross-edges.** `feature_rivals_competitor_feature` (parity carried on the edge), `competitor_signal_maps_to_feature`, and `competitor_signal_surfaces_opportunity`, dual-registered as within-graph catalog edges and cross-product edges.
- **`competitive` lens and a competitive-intelligence playbook.** The `competitive` lens foregrounds the single `market_intelligence` domain — rivals, their offerings, their dated moves, and where the product leads or trails.
- **`member_kind` on portfolio members** (`product` | `org_rollup` | `watched`). A `watched` graph sits inside the same portfolio as the products it competes with without dragging their health: `portfolio_validate` and the coverage scorers scope themselves by `member_kind`.
- **`object[]` property type and a provenance mixin.** A `competitive_analysis` can carry structured `commitments`/`capabilities` lists, and every competitive record carries `source`, `last_updated`, `observed_by`, and a `confidence` assessment, so a stale machine-polled signal is distinguishable from a fresh hand-verified one.

---

## [0.9.25] - 2026-06-11

**The real fix for the duplicate-write bug: `upg mcp run` was starting TWO servers.** Every mutating call made through the CLI launch (`cli mcp run`, which is how most MCP clients start the server) was applied twice. Root cause: mcp-server's `index.js` is both the library entry (the CLI imports `runMcpServer`) and the bin (it auto-starts when it is the process entrypoint). The CLI bundles that module into its single-file `cli.cjs`, and a bundler rewrites `import.meta.url` to the bundle's own path — so the realpath-only entrypoint guard matched `process.argv[1]` and the inlined branch auto-started a SECOND server alongside the CLI's own `runMcpServer()`. Two servers shared one stdin, so every request was handled by both and every write duplicated. The 0.9.22 to 0.9.24 idempotency work was at the dispatch layer and could not help: the duplication is two whole server processes, whose per-instance ledgers cannot see each other. `node dist/index.js` and `npx @unified-product-graph/mcp-server` launch a single server and were never affected, which is why direct-launch users never saw it.

### Fixed
- **`cli mcp run` no longer double-starts the server (`@unified-product-graph/mcp-server`).** The auto-start guard now also requires that our own entry file (`index.js`) is the file being executed, so the branch is a no-op when the module is inlined into another tool's bundle. `node dist/index.js` and the `upg-mcp-server` bin still auto-start as before. The guard is extracted as `shouldAutoStart` and unit-tested for the bundled, direct, and imported-as-library cases.

### Added
- **A regression gate: `gate:mcp` now launches the real bundled `cli mcp run` and asserts the server receives each request exactly once** (exactly one server instance). This is the faithful test whose absence let the defect ship across three releases; it fails loudly if the bundle ever auto-starts a second server again.

The dispatch-layer idempotency from 0.9.22 to 0.9.24 is retained as defense-in-depth against a genuine in-server re-delivery. No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 123).

---

## [0.9.24] - 2026-06-11

**Hardens write idempotency against a CONCURRENT re-delivery, and adds request-boundary diagnostics.** Investigation of the duplicate-delivery reports found the trigger was a CLIENT re-delivering tool calls in a long-running session (a freshly-installed server in a fresh client session never reproduces it, sequential or otherwise). The server should not depend on a well-behaved client, so this release closes the one real server-side gap: 0.9.23's content-level dedup recorded its result only AFTER the call finished, so two overlapping identical mutating calls could both miss the cache and both write.

### Fixed
- **Concurrent-delivery dedup race (`@unified-product-graph/mcp-server`).** The content-dedup ledger now memoises the in-flight PROMISE (keyed on tool + active product + normalised args) before awaiting, so a concurrent identical re-delivery shares the original execution instead of starting a second. A failed call is evicted (transient errors stay retryable); a successful one is kept (a later sequential re-delivery still replays). The server now no-ops a re-delivered mutating call whether it arrives sequentially OR concurrently.

### Added
- **Request-boundary diagnostics.** With `UPG_MCP_LOG` set, the server logs every incoming `tools/call` at the dispatch boundary (`ev: "recv"` with the tool, request id, and a payload hash) before any dedup, so a re-delivery is visible even when a ledger swallows it. Off by default.

No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 123). The cloud server (Postgres-backed, separate write path) is unaffected.

---

## [0.9.23] - 2026-06-11

**Closes the duplicate-delivery hole that 0.9.22 only half-fixed, and stops a cross-product write from duplicating on retry.** 0.9.22 deduped a re-delivered mutating call by its JSON-RPC request id, but the real re-delivery carries a *fresh* request id (a client-level re-issue, invisible to a request-id ledger): each create handler re-executed and minted a second copy with new ids. Because the replay lands on the *next* mutating call and never on a read, a "write then recount" check passed falsely — which is why 0.9.22 looked fixed.

### Fixed
- **Content-level idempotency for mutating MCP calls (`@unified-product-graph/mcp-server`).** The local server adds a second dedup layer keyed on the call's payload (tool + active product + normalised arguments), independent of the request id. A re-delivered mutating call whose payload matches a recent one replays the original result instead of writing a duplicate. The window is bounded by COUNT (the most recent 64 distinct mutating payloads), not wall-clock: the replay lands on the next mutating call, so a sliding count window catches it without timing guesswork. Only successful results are recorded, so a transient error stays retryable. Pass `allow_duplicate: true` on a mutating call to opt out for a deliberate identical re-create. The store was never the source: it dedupes by id and never mints ids, so a fresh-id duplicate can only mean the create path re-ran.
- **Cross-product edge writes are idempotent and no longer self-corrupt on a tmp-rename race (`@unified-product-graph/sdk`).** `create_cross_product_edge` could throw `ENOENT: rename .../portfolio.upg.tmp -> .../portfolio.upg` even though the edge had already persisted (a debounced save racing an explicit flush on a SHARED tmp path), and a naive retry then appended a second identical edge. The portfolio writer now uses a per-write unique tmp path (cleaned up on any failure), and `addCrossEdge` collapses an identical `(source, target, type)` re-create onto the existing edge, so a retry is a safe no-op.

No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 123). The cloud server (Postgres-backed, separate write path, no file watcher) is unaffected.

---

## [0.9.22] - 2026-06-11

**Stops silent data duplication from re-delivered MCP writes, and stops dedupe from destroying structure.** Three fixes for a HIGH-severity report where a mutating call was applied twice (the duplicate landing a few calls later, past any immediate recount).

### Fixed
- **Idempotent MCP writes (primary).** A re-delivered mutating tool call (the same JSON-RPC request id, e.g. a transport-level resend) re-ran the handler, minted fresh ids, and wrote a second copy. The local MCP server now memoises the result per request id and replays it, so a re-delivery (in flight or already finished) is a no-op that returns the original response instead of duplicating the write.
- **Watcher self-write guard (`@unified-product-graph/sdk`).** The file watcher's 150ms self-write flag expired before chokidar's 200ms `awaitWriteFinish` fired, so every server write looked like an external change and triggered a needless reload/merge. The guard is now a content-hash check: if the changed file equals what we last wrote, it is not external. Timing-independent.
- **`deduplicate_nodes` no longer drops structural edges.** The merge used a constant sort comparator (not a real `created_at` sort) and redirected inbound edges best-effort with a silent catch, then cascade-removed the originals, so a kept node could lose its inbound containment edge and vanish from the tree. Rewritten: a real keeper sort, a group-wide redirect map that re-homes every edge onto the keeper before removing any node (identical edges union, not multiply), and a structural-parent assertion that surfaces any inbound parent edge not preserved (`structural_warnings`).

No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 123). The cloud server (Postgres-backed, no file watcher, separate SQL dedupe) is unaffected.

---

## [0.9.21] - 2026-06-11

**The `get_tree` fallback message no longer contradicts the tree it renders.**

### Fixed
- A pattern's anchor fallback fires for two reasons, and the message conflated them. Under the most-nodes anchor rule, `get_tree` falls back when the anchor type is ABSENT, but also when it is PRESENT and merely nests under a richer root (e.g. services that all sit under a `bounded_context`). The note always said "No `<anchor>` found", which on a graph with nested services contradicts the services rendered right below it. `assembleTree` now returns **`anchor_present`** (does the anchor type have at least one node), and the CLI `tree --pattern` note and the show-tree skill use it: absent keeps "No `<anchor>` found; rooted on `<fallback>`", present-but-nested says "`<anchor>` present, but `<fallback>` surfaces more of the tree; rooted there." Behaviour was already correct; only the wording is fixed. Generalises to every pattern whose anchor sits below a structural root.

No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 123).

---

## [0.9.20] - 2026-06-11

**The tree-pattern catalogue is now introspectable and drift-guarded.** A pattern can no longer cite an edge the grammar lacks, and clients can read the catalogue instead of reverse-engineering it.

### Added
- **Two introspection tools** (local + cloud, spec-introspection family, local 121 to 123 / cloud 95 to 97):
  - **`list_tree_patterns`** returns every `get_tree` pattern as a summary row: id, label, the region it is the tree view of, anchor, fallback anchors, natural depth, gap policy, and slot count. Paired with `list_regions`, coverage becomes a queryable diff.
  - **`get_tree_pattern(id)`** returns the full declarative record: region, anchor, fallbacks, gap policy, depth, and the child map resolved to concrete edges. Each parent-to-child slot carries the canonical `via` edge and its `kind`, resolved live from the edge catalogue, so a client reads the real wiring rather than reverse-engineering it from behaviour.
- **Declarative pattern records.** `UPGTreePattern` gains `region` (ties a pattern to its region and that region's `shape`) and `gap_policy` (`required-children-only` or `all-optional`). Helpers `listTreePatternSummaries`, `describeTreePattern`, and `resolveTreePatternEdges` expose the catalogue from core.
- **A drift-guard test.** Every pattern's every `(parent -> child)` slot must resolve to a canonical edge in the catalogue. A pattern that cites an ungrounded pair fails the build. This makes the whole class of bug structural (it already caught an `aggregate -> read_model` slot in the 0.9.19 architecture sketch that the grammar does not wire).

No entity, domain, region, or edge-count change (entities 315, edges 980); local tools 121 to 123, cloud 95 to 97.

---

## [0.9.19] - 2026-06-11

**The tree-pattern catalogue covers every tree-shaped region, and `delivery` finally roots at the roadmap.** `get_tree` now offers 11 patterns (was 8), one per hierarchical region.

### Changed
- **`delivery` refined.** The 0.9.17 pattern rooted at the product, not the roadmap: its child map listed `product -> roadmap`, which made the product a superset of the roadmap, so the most-nodes anchor rule chose the product even when a roadmap existed. Dropping that slot lets the roadmap win when present; the product is the fallback root (`product -> release`). Added the missing optional children `roadmap_theme -> feature_area`, `release -> changelog`, and `release -> bug`. Default depth is now 3 (a readable overview to the feature tier; `depth` extends into epic and user story).

### Added
- **Three new tree patterns**, all-optional (browse views, no gap noise):
  - **`architecture`** (anchor `service`, fallback `bounded_context`): services and the API contracts, endpoints, schemas, queues, deployments, and dependencies they own, grouped by bounded context, with domain aggregates and their members. A DAG: a schema or queue shared by several services renders once, then as a reference.
  - **`journey`** (anchor `user_journey`, fallback `user_flow`): a journey over time, its phases and steps, the actions within each step, and the screens those steps surface.
  - **`design_system`** (anchor `design_system`, fallback `design_component`): a design system, its components, their nested sub-components, and the design tokens they consume.

No entity, domain, region, edge, or tool-count change (entities 315, edges 980, local tools 121). The work is in the presentation layer: `UPG_TREE_PATTERNS` (8 to 11) and the pattern lists carried by both servers, the CLI, and the show-tree skill.

---

## [0.9.18] - 2026-06-11

**The CLI help stops drifting, and an unknown `tree` filter stops lying.** The CLI rendered `--help` from a hand-maintained table divorced from each command's own option definitions, so adding a flag silently left its help stale (that is how `tree --pattern` shipped undocumented in 0.9.17). Separately, `upg tree <unknown>` quietly rendered the whole graph mislabeled as the filter. Both are now structural.

### Added
- **A help-drift guard.** The command registry is now a single source of truth that the program, the help-safety test, and a new drift test all iterate. The guard asserts that every registered command has a help topic, every long option it declares is documented, and every subcommand is mentioned, so a new command or flag cannot escape help coverage.

### Fixed
- **Help is back in sync with the commands.** Documented the options the guard flagged across eleven commands: `context --summary`, `verify --no-content-depth`, `query --edge-include` / `--limit`, `prioritise --framework` (which is required), `move --old-edge`, `dedupe --type` / `--dry-run`, `diff --stat`, `gaps --domain`, `import --output` / `--yes`, `init --file` / `--yes`, `install-skills --mode` / `--list` / `--remove`, and `score --slot-role`. The `spec` help now enumerates its full noun catalogue.
- **`upg tree <unknown-filter>` errors (exit 3)** instead of silently rendering the whole graph under a wrong label. A valid entity type with no instances reports cleanly, and filtering by a domain id is now actually implemented (the help had always claimed it).

No entity, domain, region, playbook, framework, edge, or tool-count change (entities 315, edges 980, local tools 121). The work is entirely in the CLI.

---

## [0.9.17] - 2026-06-11

**CLI-next: the CLI catches up to the spec, the tree learns its frameworks, and ordering finally means something.** The `upg` CLI had frozen at the 0.8.x command set while the MCP tool surface grew to 121; its `list`/`tree` ordered lexically and re-rendered shared subtrees into noise. This release closes all of it, and folds in the `get_tree` pattern-definition fixes from a post-ship report on a real 304-node graph.

### Added
- **Meaning-aware node ordering** (`compareNodesWithinType`, SDK). The intra-type sort ladder: explicit order field (`<type>_order` / order / sequence / ...) -> semantic version (title or `version`) -> lifecycle/status phase position -> `created_at` -> numeric-aware locale. A release series now reads `v5.0.0, v5.1.0, ... v5.9.0, v5.10.0, ... v5.30.0, v6.0.0` instead of the lexical `v5.1.0, v5.10.0, ... v5.2.0`. `list`/`tree` and `get_tree` share it.
- **DAG-honest tree assembly.** A UPG graph is a DAG; a multi-parent node now renders its subtree ONCE and appears as a `shared` reference under its other parents, in both `get_tree` (`stats.shared_refs`) and the CLI `tree` (`↗ shown above`). Nothing is silently dropped, nothing re-explodes, cycles terminate. `assembleTree` moved to the SDK so the local server, cloud server, and CLI share one implementation.
- **A `delivery` tree pattern** for the roadmap/release region; `UPG_TREE_PATTERNS` is now 8.
- **CLI tool-parity surface**: the full 0.9.x MCP surface as commands. New groups `spec` (offline catalogue browser, 36 nouns), `query`, `registry`, `portfolio`, `area`, `migrate`; `tree --pattern <id>` (framework-aware trees via the shared assembler); and singletons `move`, `disconnect`, `dedupe`, `clone`, `context`, `log`, `prioritise`, `sync status`, `product update`, `batch`. Six MCP tools are deliberately not mirrored (recorded by ADR): the agent-cognitive `plan`/`reflect`/`trace`, the remote-mutating `apply_pull_changeset`/`push_to_cloud`, and the skill-dev `skill_audit`.

### Changed
- **`get_tree` pattern definitions corrected (G1-G7)** against the real graph: child slots gain a `required` flag so gaps flag only genuinely-missing required children (no more ~50 false `epic` gaps); the `strategy` pattern reaches the polymorphically-parented bets and auto-flags a bet with no initiative; `okr` extends to the `metric` leaf and `ost` to `hypothesis`/`experiment_plan`; `validation` accepts `experiment` or `experiment_run`; anchor selection picks the candidate that surfaces the most of the pattern, not the first non-empty.

No entity, domain, region, playbook, framework, or local-tool count change (entities 315, edges 980, local tools 121, regions 11, frameworks 46). The work is in the CLI, the SDK, and the tree presentation layer.

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
