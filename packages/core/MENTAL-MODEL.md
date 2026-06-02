# UPG Mental Model · Regions, Frameworks, Playbooks, Approaches, Skills

A short guide to how the layers of UPG fit together. Read this in about ten minutes, then refer back when something feels confusing.

---

## TL;DR

UPG ships **five** primitives that collaborate. They are not interchangeable.

| Primitive | Static or dynamic | Purpose |
|---|---|---|
| **Region** | Static (place) | "Where does this thinking live? What's the structural shape of this part of the graph?" |
| **Framework** | Static (structure) | "What does this thinking tool look like?" |
| **Canonical playbook** | Dynamic (bootstrap, default path) | "How do I populate this region from scratch?" |
| **Specialised playbook** | Dynamic (bootstrap, alternative path) | "How do I populate this region using framework X or a different entry path?" |
| **Approach** | Dynamic (cognitive engagement) | "What's the path of arrival to engaging this region cognitively?" |
| **Skill** | Surface (invocation) | "What does the user type to start?" |

The relationship reads top to bottom:

```
Skill ──→ Canonical/Specialised Playbook OR Approach ──→ Framework
                              │
                              └── anchors at ──→ Region
(what)                        (how)               (where / with what structure)
```

Every layer can exist independently of the layer below. They are most useful when stacked.

---

## The primitives, one at a time

### 1. Framework: a structured lens

A **Framework** is a declarative record describing a recognised thinking tool: Lean Canvas, RICE, Opportunity Solution Tree, Business Model Canvas, JTBD, Persona Canvas, Wardley Map, RACI, OWASP Top 10, AARRR, and so on.

It has four layers:

- **Data:** which UPG entity types fill its slots
- **Structure:** the shape (matrix, tree, canvas, list)
- **Presentation:** how to render it
- **Education:** what it's for, when to use, when not to use

A framework does **not** know how to *run* itself. It knows what it *is*.

**Where it lives:** `src/frameworks/definitions/*.ts`

**Type:** `UPGFramework` in `src/frameworks/types.ts`

**Example:**

> Lean Canvas has 9 slots: Problem, Customer Segments, Unique Value Prop, Solution, Channels, Revenue Streams, Cost Structure, Key Metrics, Unfair Advantage. Each slot accepts one or more UPG entity types. That's it. No prompts, no questions, no execution.

---

### 2. Playbook: a region-anchored bootstrap

A **Playbook** is a sequence of steps that walks a user through populating a region from anchor outward. It is the dynamic layer that bootstraps graph state.

Each step is one of four kinds:

| Step kind | Meaning |
|---|---|
| `domain_guide` | Look up a domain's `DomainUsageGuide` at runtime and walk its `creation_sequence` of entity types |
| `framework` | Apply a `UPGFramework` by id |
| `entity_sequence` | Explicit list of entity types to create, no domain-guide indirection |
| `sub_sequence` | Nest another playbook (or approach) at this step |

A playbook can mix step kinds freely. A simple playbook might be a single `framework` step. A complex one might chain three `domain_guide` steps, then a `framework` step, then a `sub_sequence`.

**Canonical vs specialised:**

- **Canonical** (`is_canonical: true`): the default "start here" path for the region. Exactly one per region. Surfaced in `/upg-walk-region <region>` and equivalent skill paths.
- **Specialised:** alternative entry path, often anchored on a framework via `framework_id`. Multiple permitted per region.

**Where it lives:** `src/playbooks/definitions/index.ts`

**Type:** `UPGPlaybook` in `src/playbooks/types.ts`

**Invariant:** Every region in `UPG_REGIONS` has at least one playbook. Exactly one playbook per region carries `is_canonical: true`. Enforced by `__tests__/playbooks.test.ts` and `scripts/audit-playbook-coverage.ts`.

**Example:**

> The canonical playbook for the `market_competitive` region walks the `market_intelligence` domain creation sequence to produce `competitive_analysis`, `competitor`, `competitor_feature`, `market_trend`, `market_segment`. A specialised playbook for the same region could anchor on Porter's Five Forces: same place, different opinionated lens.

### 3. Approach: a cognitive engagement category

An **Approach** is a high-level cognitive engagement category, the *path of arrival* to a region of the graph. The naming uses the cartographic sense ("final approach to an airport", "coastline approach"), not the strategy-meeting sense ("what's our approach to this problem?"). Drift back to the strategy-meeting interpretation collapses Approach back into the framework catalogue and forecloses the layered architecture described below.

Five canonical approaches ship:

| Approach     | Question it answers                              |
| ------------ | ------------------------------------------------ |
| **Plan**     | "what should I build next?"                      |
| **Inspect**  | "what's broken?"                                 |
| **Prioritise** | "what's most important?"                       |
| **Trace**    | "walk a meaningful path through existing graph"  |
| **Reflect**  | "what should I be questioning?"                  |

The five approaches operate on existing graph state and surface insight, ranking, traversal, or follow-up. They do **not** create new scaffolding entities. The approach-vs-playbook test:

- Does the sequence CREATE entities to populate a region from anchor outward? → playbook.
- Does the sequence ANALYSE / TRAVERSE / SCORE / SUMMARISE existing entities? → approach.

**Approaches and frameworks form a many-to-many graph.** Each approach contains zero or more frameworks. Frameworks are the specific named techniques *within* an approach (ICE, MoSCoW, Five Whys, Pre-mortem). The structural bridge is `UPGFramework.approach_ids?: UPGApproachId[]`. Each approach record also carries `framework_id_examples` for canonical examples.

**Definition lookups today, structured execution forthcoming.** The MCP tools `plan` / `inspect` / `prioritise` / `trace` / `reflect` (verb-led, no `apply_*` prefix) return the approach record plus invocation parameters. The language model is the executor: it reads the `signature_hint` and synthesises the structured projection. Structured execution (Plan returns `coverage_score`, Inspect returns `violations[]`, Prioritise runs the framework_id ranker, Trace walks the path, Reflect emits prompts) is a forthcoming follow-up.

**Where it lives:** `src/approaches/types.ts` and `src/approaches/definitions/index.ts`

**Type:** `UPGApproach`

---

### 4. Skill: the invocation surface

A **Skill** is what the user types in an agent surface: `/upg-new-persona`, `/upg-new-discovery`, `/upg-walk-region market`. It is a `SKILL.md` file that the agent loads as a slash command.

**Where they live:** `packages/upg-mcp-server/skills/<skill-name>/SKILL.md`

**Example:**

> The user types `/upg-walk-region market`. The agent finds the matching skill (or the generic `/upg-walk-region` skill, which dispatches by domain). The skill resolves to a playbook bound to that region. The playbook walks its steps. A framework step invokes the framework's slot definitions, which tell the system what entity types to create. Entities land in the `.upg` graph.

---

## The full chain, end to end

```
User types         /upg-walk-region market
                          │
                          ▼
SKILL              upg-explore (generic dispatcher)
                          │  resolves region → playbook
                          ▼
PLAYBOOK           market_competitive canonical playbook
                          │  iterates its steps
                          ▼
STEP               { kind: 'framework', framework_id: 'competitive-matrix' }
                          │  loads framework definition
                          ▼
FRAMEWORK          competitive-matrix
                          │  declares slots → entity types
                          ▼
ENTITY TYPES       competitor, feature, pricing_tier, …
                          │  creates nodes via MCP
                          ▼
.upg GRAPH         persistent product graph
```

Each layer has a single, well-defined job. **Don't mix layers.**

---

## Why this many layers?

Asymmetry is the answer.

- **Frameworks:** recognise the universe of canonical product-thinking methods. Wide. Browseable inventory.
- **Playbooks:** opinionated paths actually guided. Narrow. Each one is a deliberate authoring decision.
- **Approaches:** cognitive engagement categories that operate over existing graph state.
- **Skills:** surfaces the user actually types. Thin layer on top, most route to a playbook.

**Why not collapse Playbooks into Skills?** Because playbooks are the engine and skills are the doorbell. Multiple skills can hit the same playbook. The playbook is reusable.

**Why not collapse Frameworks into Playbooks?** Because frameworks are recognised methods that exist whether or not a guided journey is shipped for them. Listing every framework variant in a playbook definition would be noise. Pointing to a framework by id is clean.

---

## How to use this in practice

### As an end user in an agent surface

```
/upg-new-graph                         → start a new product graph
/upg-new-persona                      → premium workshop, bespoke UX
/upg-walk-region <region>             → dispatch to the right playbook
/upg-show-status                       → dashboard
/upg-check-gaps                         → action punch list
/upg-show-impact <entity>              → forward causal: "if I fix X, what unblocks?"
/upg-show-impact <entity> --upstream   → backward causal: "what blocks X?"
```

### As a spec contributor

To add a new **Framework**: create a `UPGFramework` record in the appropriate `src/frameworks/definitions/<category>.ts`. No code, just declarative configuration. Run the framework audits in `scripts/audit/framework-*.ts`.

To add a new **Playbook**: add a `UPGPlaybook` record in `src/playbooks/definitions/index.ts`. Set `region` (required), `is_canonical` (only if you're replacing the region's canonical), and optionally `framework_id` if the playbook is framework-anchored. Run `npm run audit:playbook-coverage` to verify the canonical invariant. Watch the rule: exactly one canonical per region.

To add a new **Skill**: create `packages/upg-mcp-server/skills/<name>/SKILL.md`. If it's a region bootstrap, prefer collapsing into a `UPGPlaybook` and invoking via `/upg-walk-playbook <playbook-id>` rather than authoring a bespoke skill.

### As a tool author

Frameworks, playbooks, and approaches are read-only contracts. The runtime imports `UPG_FRAMEWORKS`, `UPG_PLAYBOOKS`, and `UPG_APPROACHES` from `@unified-product-graph/core`. Do not duplicate framework, playbook, or approach logic in app code. Reference by id.

---

## The MCP server as translation layer

The MCP server is **not** an API to the graph. That's GraphQL territory.

**The MCP server is the spec's intelligence, contextualised to a specific graph, exposed as composable verbs.**

Three layers:

1. **Canonical knowledge:** the spec (`UPG_REGIONS`, `UPG_FRAMEWORKS`, `UPG_APPROACHES`, `UPG_PLAYBOOKS`, `UPG_ANTI_PATTERNS`).
2. **Agent vocabulary:** composable verbs exposed by the MCP server: `query`, `list_*`, `get_*`, the five approach verbs `plan` / `inspect` / `prioritise` / `trace` / `reflect`, and playbook lookups. Each verb composes primitives, canonical reference data, and structured output.
3. **User intent:** natural language. The user never sees the agent vocabulary directly.

Translation: spec → vocabulary (handled by MCP server tool definitions) → user intent (handled by the agent).

Implications:

- Every gap in the agent vocabulary forces cognitive load onto the language model.
- The same MCP server pattern works for any client because the vocabulary layer is structurally invisible to end users.
- Approaches under playbooks under regions, frameworks under approaches. Each layer narrows the space of agent choices and makes invocation more discoverable.

**Why this matters for the approach naming.** Calling the layer "Technique" would collapse it back into the framework catalogue (ICE is a technique, Five Whys is a technique). Calling it "Approach" with cartographic framing (the *path of arrival* to a region) preserves the layered architecture: Approach is a category of cognitive engagement *above* the techniques (frameworks) that operate inside it. Verb-led MCP tools (`plan`, `inspect`, and so on, not `apply_plan` or `run_plan`) name the engagement directly.

---

## Common confusions (FAQ)

**Is a framework just a playbook without steps?**
No. A framework is a *structure*: slots filled by entity types. A playbook is a *sequence*: ordered steps that may apply zero or more frameworks. Different shapes, different files, different types.

**What's the difference between a playbook and an approach?**
A **playbook** populates a region from anchor outward. It CREATES new scaffolding entities to bootstrap a region. An **approach** (Plan / Inspect / Prioritise / Trace / Reflect) is a cognitive engagement category that ANALYSES, TRAVERSES, SCORES, or SUMMARISES existing graph state, the *path of arrival* (cartographic sense). It does not create scaffolding entities. The five approaches each contain zero or more frameworks (frameworks are the named techniques *within* an approach).

**Why far more frameworks than playbooks?**
Frameworks are inventory: every named lens that fits the schema, including ones not currently guided. Playbooks are opinionated paths authored by hand. The asymmetry is by design (showcase vs guided experience). Adding a framework-anchored specialised playbook is the natural extension point: every framework that maps cleanly to a region's bootstrap path can earn one.

**Why is `education.steps` absent on every framework?**
By design. Steps live in `UPGPlaybook` records, not on framework definitions. Frameworks describe what the thinking tool *is*. Playbooks describe how to *execute* one. Backfilling steps onto frameworks would duplicate playbook content.

---

## Reference

- **Framework type:** `src/frameworks/types.ts`
- **Playbook type:** `src/playbooks/types.ts`
- **Approach type:** `src/approaches/types.ts`
- **Approach definitions:** `src/approaches/definitions/index.ts`
- **Playbook definitions:** `src/playbooks/definitions/index.ts`
- **Region catalog:** `src/regions/catalog.ts`
- **Audit scripts:** `scripts/audit/framework-{inventory,semantic-dedup,quality,coupling}.ts`, `scripts/audit-playbook-coverage.ts`
