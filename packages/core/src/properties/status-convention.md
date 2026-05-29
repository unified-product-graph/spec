# `*_status` Convention: Lifecycle vs. Runtime State vs. Event Outcome

> Status: **convention only.** Bulk migration of the lifecycle subset is staged across subsequent releases. See [migration table](#migration-table) below.

## Principle

`*_status` is **not one axis.** A survey of the 27 `*_status` properties across the spec found they span at least three distinct semantic axes:

1. **Lifecycle**: phases an entity passes through over its life (proposed → active → done).
2. **Runtime state**: the current value of an operational toggle or availability, mutating over hours / minutes.
3. **Event outcome**: the terminal result of a one-time event (a deploy, a test run, a migration).

Collapsing all 27 into a single `UPGBaseNode.status` slot would destroy meaning. `flag_status: 'on' | 'off' | 'rollout'` is not a phase the feature flag is *in over time*: it is a toggle that flips with operations. `deploy_status: 'success' | 'failure'` is not lifecycle either; it is the verdict on a discrete event.

This is the same anti-pattern the **graph-vs-prose principle** protects against, applied from the opposite direction: there, the failure mode is forcing graph-shaped data into prose; here, it is forcing distinct axes into one slot. Both are over-decomposition / under-decomposition errors. The graph-vs-prose three-question test (will I query/aggregate it? does it have a stable shape? does tooling reason over it differently than free text?) does not by itself distinguish lifecycle from runtime (both pass all three questions), so this convention exists to cover the residual classification.

## Rules

### Rule 1: Lifecycle phases go on `UPGBaseNode.status`

**If** a property captures **the phase an entity passes through over its life** (proposed → active → done), then:

- Use the canonical `UPGBaseNode.status` slot.
- Register the entity's phase set as a lifecycle template in `grammar/lifecycles.ts`.
- Do **not** add a domain-specific `*_status` property.

**Examples (current spec, pending migration):**

- `Theme.theme_status: 'proposed' | 'active' | 'achieved' | 'abandoned'` (`strategy.ts:108`). Themes pass through these phases sequentially.
- `Investigation.investigation_status: 'open' | 'active' | 'paused' | 'resolved' | 'abandoned'` (`engineering.ts:582`). An investigation has a single life from open to resolved.
- `Partnership.partnership_status: 'proposed' | 'active' | 'paused' | 'ended'` (`business-model.ts:195`). Standard commercial lifecycle.

**Pattern to follow:** `Initiative.health_status: HealthStatus` (`strategy.ts:34`) uses a canonical primitive (`HealthStatus`) shared across initiatives, programs, themes. Lifecycle templates work the same way but per-entity-type.

### Rule 2: Runtime state stays as a typed field, named `*_state`

**If** a property captures **a current toggle value or availability that mutates with operational changes** (flipping in hours or minutes, not over the entity's life), then:

- Keep it as a typed field on the domain interface.
- Name it `*_state` (not `*_status`) to make the non-lifecycle semantics explicit.
- Do **not** move it to `UPGBaseNode.status`.

**Examples (current spec; renames pending):**

- `FeatureFlag.flag_status → flag_state: 'on' | 'off' | 'rollout'` (`engineering.ts:208`). The flag's *life* is "active" or "retired"; the toggle state is a separate axis.
- `TestEnvironment.env_status → env_state: 'available' | 'in_use' | 'maintenance' | 'unavailable'` (`testing.ts:156`). Availability flips many times per day; the environment's life is the lifecycle slot.

### Rule 3: Event outcome stays as a typed field, named `*_outcome`

**If** a property captures **the terminal result of a one-time event** (a deploy succeeded or failed; a test passed or was skipped; a migration completed), then:

- Keep it as a typed field on the domain interface.
- Name it `*_outcome` (not `*_status`) to make the verdict semantics explicit.
- Do **not** move it to `UPGBaseNode.status`.

**Examples (current spec; renames pending):**

- `Deployment.deploy_status → deploy_outcome: 'success' | 'failure' | 'rolling'` (`engineering.ts:259`). A deployment is a discrete event; its outcome is a verdict, not a phase.
- `TestRun.result_status → result_outcome: 'passed' | 'failed' | 'timed_out' | 'skipped' | 'interrupted'` (`testing.ts:177`).
- `Migration.migration_status → migration_outcome: 'current' | 'pending' | 'failed'` (`engineering.ts:385`).
- `CIRun.ci_status → ci_outcome: 'passing' | 'failing' | 'unknown'` (`engineering.ts:463`).

### Rule 4: Domain-specific flows keep domain-specific names

**If** a property captures a recognised flow with its own well-known vocabulary (consent, approval, contract negotiation), then:

- Keep the existing domain-specific name.
- Use a typed value set that matches the domain's standard terms.
- Rules 1–3 are conventions, not conformity laws. Domain naming wins where there is established practice.

**Examples (current spec, intentionally kept as-is):**

- `Participant.consent_status: 'pending' | 'given' | 'withdrawn'` (`user-research.ts:55`). Consent is a domain-specific flow with strong external conventions (research ethics, GDPR). Do not relabel as `consent_state` or `consent_outcome`.

## How to apply when adding a new property

When you reach for a `*_status` property name on a new domain interface, ask in order:

1. **Is this the phase the entity passes through over its life?** If yes → Rule 1: drop the `*_status` field, use `UPGBaseNode.status` + register a lifecycle template.
2. **Is this a current toggle or availability that mutates with operations?** If yes → Rule 2: name it `*_state`.
3. **Is this the verdict on a one-time event?** If yes → Rule 3: name it `*_outcome`.
4. **Is this a recognised domain flow with its own vocabulary?** If yes → Rule 4: keep the domain name.

If none of the above answer cleanly, the field probably mixes axes. Split it before shipping.

## Migration table

The table below tracks all 27 surveyed `*_status` properties against the convention. Anything tagged `@deprecated since="0.4.0" removeIn="0.5.0"` is a Rule 1 (lifecycle) candidate pointing at `UPGBaseNode.status`. Renames in Rules 2 and 3 are noted but staged for later releases.

### Rule 1: Lifecycle (tagged `@deprecated`)

| Property | File | Current value set | v0.5 target |
|---|---|---|---|
| `Theme.theme_status` | `strategy.ts:108` | `'proposed' \| 'active' \| 'achieved' \| 'abandoned'` | `UPGBaseNode.status` + Theme lifecycle template |
| `TeamOkr.okr_status` | `team.ts:93` | `'draft' \| 'committed' \| 'active' \| 'complete' \| 'abandoned'` | `UPGBaseNode.status` + TeamOkr lifecycle template |
| `Role.role_status` | `team.ts:55` | `'active' \| 'backfilling' \| 'dormant' \| 'retired'` | `UPGBaseNode.status` + Role lifecycle template |
| `TechnicalDebtItem.debt_status` | `engineering.ts:163` | `'identified' \| 'acknowledged' \| 'scheduled' \| 'in_progress' \| 'resolved'` | `UPGBaseNode.status` + TechnicalDebtItem lifecycle template |
| `Investigation.investigation_status` | `engineering.ts:582` | `'open' \| 'active' \| 'paused' \| 'resolved' \| 'abandoned'` | `UPGBaseNode.status` + Investigation lifecycle template |
| `Fix.fix_status` | `engineering.ts:776` | `'planned' \| 'in_progress' \| 'deployed' \| 'verified' \| 'reverted'` | `UPGBaseNode.status` + Fix lifecycle template |
| `Assumption.validation_status` | `strategy.ts:226` | `'unvalidated' \| 'validating' \| 'validated' \| 'invalidated'` | `UPGBaseNode.status` + Assumption lifecycle template |
| `Partnership.partnership_status` | `business-model.ts:195` | `'proposed' \| 'active' \| 'paused' \| 'ended'` | `UPGBaseNode.status` + Partnership lifecycle template |
| `ThreatModel.threat_model_status` | `security.ts:66` | `'draft' \| 'in_review' \| 'approved' \| 'stale'` | `UPGBaseNode.status` + ThreatModel lifecycle template |
| `ApiContract.contract_status` | `engineering.ts:125` | `'draft' \| 'published' \| 'deprecated'` | `UPGBaseNode.status` + ApiContract lifecycle template |
| `Service.service_status` | `engineering.ts:59` | `'development' \| 'staging' \| 'production' \| 'deprecated'` | `UPGBaseNode.status` + Service lifecycle template (deployment stage axis; existing `lifecycle` field stays for maturity axis) |

The `task_status` + `bug_status` → `UPGBaseNode.status` migration is the **proof case** of Rule 1: it provides the migration template for the eleven above.

### Rule 2: Runtime state (rename pending)

| Current | Rename to | File |
|---|---|---|
| `FeatureFlag.flag_status` | `flag_state` | `engineering.ts:208` |
| `TestEnvironment.env_status` | `env_state` | `testing.ts:156` |

### Rule 3: Event outcome (rename pending)

| Current | Rename to | File |
|---|---|---|
| `Deployment.deploy_status` | `deploy_outcome` | `engineering.ts:259` |
| `CIRun.ci_status` | `ci_outcome` | `engineering.ts:463` |
| `TestRun.result_status` | `result_outcome` | `testing.ts:177` |
| `Migration.migration_status` | `migration_outcome` | `engineering.ts:385` |

### Rule 4: Domain-specific flow (kept as-is)

| Property | File | Rationale |
|---|---|---|
| `Participant.consent_status` | `user-research.ts:55` | Research-ethics / GDPR domain vocabulary. Established convention wins. |

### Already canonical (no change)

| Property | File | Note |
|---|---|---|
| `Initiative.health_status` | `strategy.ts:34` | Uses the `HealthStatus` primitive. Pattern to follow. |

> Property-line numbers above are pinned to this PR. They will shift as future migrations land.

## Why convention-only first

An earlier audit assumed all `*_status` properties shared an axis and recommended collapsing them into `UPGBaseNode.status`. A spec review invalidated that premise. The shipped option is this convention plus `@deprecated` tags on the eleven Rule 1 candidates.

Two reasons to ship the convention first and the migrations later:

1. **Lifecycle templates are real work, not bookkeeping.** Each of the eleven lifecycle entities needs a registered template in `grammar/lifecycles.ts` and downstream consumer absorption for the property → `UPGBaseNode.status` move. Codify intent and tag the surface area first; migrate against a clear rulebook in subsequent releases.
2. **Renames need taste, not haste.** The Rule 2 / Rule 3 renames (six properties) each need a deliberate review of the value set: is it really runtime state? does the rename change downstream tooling expectations? The convention names the destination; the rename releases find the path.

The `@deprecated` tags are the contract: every Rule 1 property is flagged in the spec, surfaced into `property-schema.ts`, and searchable from any consumer that walks the generated registry. Later releases can pick up from the migration table above with no rediscovery cost.

## Related

- `PROPERTIES.md`: canonical property shapes (cross-cutting keys).
- `grammar/LIFECYCLES.md`: lifecycle template authoring guide.
