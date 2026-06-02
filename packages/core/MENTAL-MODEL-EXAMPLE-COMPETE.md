# Worked Example: Competitive Analysis, End to End

A worked example of how a single playbook runs end to end. Read alongside [`MENTAL-MODEL.md`](./MENTAL-MODEL.md). By the end of this document you should be able to copy code from it and have a working competitive-analysis flow against your own `.upg` graph.

The scenario: a user wants to map their competitive landscape. The agent surface walks them through `competitive_analysis → competitor → competitor_feature → market_trend → market_segment`, with the right edges between them, and lands a structured result in the graph.

---

## Why this playbook exists

Competitive intelligence is one of many region-anchored playbooks that ship with `@unified-product-graph/core`. They exist for the same reason:

> A graph that only knows what *you* are building, in isolation, can't help you reason about whether you're building the right thing. Adding a competitive layer turns the graph from a self-portrait into a map.

Every region anchors a canonical playbook (`is_canonical: true`). The canonical playbook for the `market_competitive` region is `MARKET_COMPETITIVE_PLAYBOOK`. Its job is to bootstrap a healthy market-intelligence subgraph from a cold start.

---

## Anatomy: the three files

Three files together define what happens when the playbook runs.

### File 1: the playbook itself

`src/playbooks/definitions/index.ts`:

```ts
import type { UPGPlaybook } from '@unified-product-graph/core'

export const MARKET_COMPETITIVE_PLAYBOOK: UPGPlaybook = {
  id: 'playbook:market-competitive',
  name: 'Market & Competitive',
  version: '0.1.0',
  description:
    'Map the competitive landscape: competitors, their features, market trends, and segment positioning.',
  region: 'market_competitive',
  is_canonical: true,
  target_anchor_entity: 'competitor',
  creation_sequence: [
    {
      kind: 'domain_guide',
      order: 1,
      phase: 'Scope',
      name: 'Competitive scan',
      prompt_hint:
        'Run the market_intelligence creation sequence: analysis, competitors, features, trends, segments.',
      domain_id: 'market_intelligence',
    },
  ],
}
```

One step, kind `domain_guide`, pointing at the `market_intelligence` domain. The playbook is **a pointer**, not a script: playbooks describe *what* to do, domain guides describe *which entities to create, in which order*.

### File 2: the domain guide

`src/intelligence/domain-guides.ts`:

```ts
{
  domain_id: 'market_intelligence',
  anchor_entity: 'competitive_analysis',
  creation_sequence: [
    'competitive_analysis',
    'competitor',
    'competitor_feature',
    'market_trend',
    'market_segment',
  ],
  patterns: [{
    name: 'Competitive Landscape Map',
    description:
      'Analyses scope competitors, competitors offer features, features inspire or gap against yours',
    entity_types: ['competitive_analysis', 'competitor', 'competitor_feature'],
    edge_chain: [
      'competitive_analysis_analyses_competitor',
      'competitor_offers_competitor_feature',
      'competitor_feature_inspires_feature',
    ],
  }],
  required_bridges: [
    { edge_type: 'competitor_competes_for_persona', target_domain: 'user',
      when: 'Every competitor should link to the personas they compete for' },
    { edge_type: 'market_trend_creates_opportunity', target_domain: 'discovery',
      when: 'Trends that create new opportunities should be connected' },
    { edge_type: 'positioning_differentiates_from_competitor', target_domain: 'go_to_market',
      when: 'Positioning should reference specific competitors' },
  ],
  anti_patterns: [
    'Building without competitive context: if you do not know who else solves this problem, you cannot differentiate',
    'Feature comparisons without parity status: always assess whether you are ahead, behind, or at parity',
    'Stale competitive data: competitive intelligence decays quickly, track analysis dates',
  ],
}
```

This is the **brains**. The playbook says "walk `market_intelligence`". The guide says "to walk it, create this entity sequence, watch for these patterns, fill these bridges, avoid these anti-patterns."

### File 3: the surface

`packages/upg-mcp-server/skills/upg-walk-region/SKILL.md`:

This is what the agent surface loads when the user types `/upg-walk-region market`. It is a Markdown prompt that tells the agent:

1. Resolve the requested region to its canonical playbook.
2. Iterate the playbook's `creation_sequence`.
3. For a `domain_guide` step, look up the matching domain guide and walk its `creation_sequence`.
4. For each entity type: ask the user, validate the answer, create the node, confirm.
5. Apply patterns where applicable (auto-create the canonical edges).
6. Surface required bridges as suggestions.
7. Warn on anti-patterns.

Three files, three layers: playbook (pointer), domain guide (sequence), and skill (interaction).

---

## What fires when the user types `/upg-walk-region market`

This is the part that's usually invisible. Walk through it once and the rest of UPG starts to feel solid.

### Step 0: the agent loads the skill

The agent reads the `SKILL.md` into context. Nothing has run yet. This is a system prompt extension that says "you are now operating as `/upg-walk-region`."

### Step 1: resolve `market` to a playbook

The skill prompt instructs the agent to resolve `market` to the `market_competitive` region (`market` is an alias for that region), then look up the region's canonical playbook:

```ts
import { UPG_PLAYBOOKS } from '@unified-product-graph/core'

const playbook = UPG_PLAYBOOKS.find(
  p => p.region === 'market_competitive' && p.is_canonical,
)
// → MARKET_COMPETITIVE_PLAYBOOK
```

The canonical invariant ("exactly one canonical playbook per region") guarantees this returns exactly one match. No ambiguity.

### Step 2: resolve the playbook's `domain_guide` step

`MARKET_COMPETITIVE_PLAYBOOK.creation_sequence[0].kind === 'domain_guide'` and `.domain_id === 'market_intelligence'`. The agent looks up the guide:

```ts
import { UPG_DOMAIN_GUIDES } from '@unified-product-graph/core'

const guide = UPG_DOMAIN_GUIDES['market_intelligence']
// → { creation_sequence, patterns, required_bridges, anti_patterns }
```

The skill prompt tells the agent what to do with the guide: walk `creation_sequence`, ask one question per entity, apply pattern edges, surface bridges and anti-patterns.

### Step 3: the agent asks the first question

The first entity in the sequence is `competitive_analysis`. The agent looks up its property schema (via `mcp__upg-local__get_entity_schema('competitive_analysis')` or by referencing `UPG_PROPERTY_SCHEMA.competitive_analysis`) and constructs the opening prompt:

> *Let's set up your competitive analysis. What's the scope? For example: "Q2 2026, focus on AI design tools targeting solo founders." (Or a name like "Spring 2026 scan" if you want to start light.)*

The user answers.

### Step 4: the agent creates the entity

The agent calls `mcp__upg-local__create_node`:

```json
{
  "type": "competitive_analysis",
  "title": "Spring 2026 scan: AI design tools",
  "properties": {
    "scope": "AI design tools targeting solo founders",
    "analysis_date": "2026-04-30",
    "status": "in_progress"
  }
}
```

The MCP server validates against `UPG_PROPERTY_SCHEMA`, writes to the `.upg` file, and returns the new node id. The agent confirms.

### Step 5: move to the next entity in the sequence

Next: `competitor`. The pattern wants `competitive_analysis_analyses_competitor` edges, so as the agent creates each competitor it also creates the edge:

```
Created Figma (competitor)
  competitive_analysis [Spring 2026 scan] analyses_competitor → Figma

Created Lovable (competitor)
  competitive_analysis [Spring 2026 scan] analyses_competitor → Lovable
```

### Step 6: walk features, trends, segments

For each `competitor`, the next-level entity is `competitor_feature`. The pattern says: `competitor → offers_competitor_feature → competitor_feature → inspires_feature → feature`. The agent asks for 1–3 standout features and parity status per competitor, then creates the features and the parity-tagged edges.

Trends and segments follow the same flow.

### Step 7: surface required bridges

After the `creation_sequence` is exhausted, the skill prompt instructs the agent to read `required_bridges` from the guide:

> *Quick check: every competitor should link to the personas they compete for. You created Figma and Lovable. Which of your existing personas do those compete against?*

The user picks. The agent calls `mcp__upg-local__create_edge` for each `competitor_competes_for_persona` edge.

### Step 8: warn on anti-patterns

The skill prompt scans `anti_patterns` against the just-created entities:

> *Heads-up: 2 of 5 `competitor_feature` nodes were created without parity status. Want me to ask about those, or skip for now?*

The session continues or ends.

### Step 9: smart ending

The skill prompt's "What's Next" section runs: the agent looks at the graph, finds the biggest gap, and recommends one skill:

> *Based on what you built, your biggest gap is positioning. You now have 5 competitors but no `positioning_statement` connected. Try `/upg-new-launch` next.*

---

## How data flows

The path from user keystroke to `.upg` file:

```
User keystroke
   │  "Figma, Lovable, v0.dev, Cursor"
   ▼
Agent surface (Claude Code / Entopo / equivalent)
   │  parses, holds session state, has SKILL.md loaded
   ▼
Language model
   │  reasons over the skill prompt + spec exports
   │  decides to call mcp__upg-local__batch_create_nodes
   ▼
MCP protocol (JSON-RPC over stdio or HTTP)
   │  tool call serialised, sent to the local server
   ▼
upg-mcp-server (Node process)
   │  validates against UPG_PROPERTY_SCHEMA
   │  resolves parent_ref, applies defaults
   │  acquires file lock, mutates in-memory graph
   ▼
.upg file (JSON, on disk)
   │  written atomically with sync_state update
   ▼
Response → MCP → model → surface
   │  { id: "node_xyz", ... }
   ▼
User sees the confirmation
```

Two things are worth highlighting:

1. **The spec is read at the model layer, not the server layer.** The MCP server doesn't know what `MARKET_COMPETITIVE_PLAYBOOK` is. It only knows about nodes, edges, properties. The model holds the spec context (because the skill prompt loads it) and orchestrates calls. The server is dumb storage with validation.

2. **There is no "playbook runtime."** No code that says `for step in playbook.creation_sequence: execute(step)`. The playbook is *prompt material*. The agent reads it as guidance and generates the appropriate sequence of MCP calls. That's why playbooks can be thin pointers: the actual execution happens in the model's reasoning, not in a step runner.

This is unusual. Most workflow engines (n8n, Temporal, GitHub Actions) compile workflows into executable graphs. UPG compiles them into *prompt context* and lets a language model do the execution. It's slower but much more flexible. The model can deviate, ask for clarification, batch creatively, and adapt to user state. A traditional engine couldn't.

---

## Programmatic verification

Concrete things to run that prove the layers are wired up:

```ts
import {
  UPG_PLAYBOOKS,
  UPG_DOMAIN_GUIDES,
  UPG_FRAMEWORKS,
} from '@unified-product-graph/core'

// 1. The canonical playbook for market_competitive resolves.
const playbook = UPG_PLAYBOOKS.find(
  p => p.region === 'market_competitive' && p.is_canonical,
)
console.assert(playbook?.id === 'playbook:market-competitive')

// 2. The playbook's domain_guide step points at a real domain.
const step = playbook?.creation_sequence[0]
console.assert(step?.kind === 'domain_guide')
const guide = UPG_DOMAIN_GUIDES['market_intelligence']
console.assert(guide.anchor_entity === 'competitive_analysis')

// 3. The creation sequence is the one the example walks.
console.assert(
  guide.creation_sequence.join(',') ===
    'competitive_analysis,competitor,competitor_feature,market_trend,market_segment',
)
```

Watch the agent walk:

1. The first message should mention "competitive landscape" and preview the steps. → confirms the skill loaded and the playbook resolved.
2. The first created entity should be a `competitive_analysis`. → confirms the creation sequence is being walked correctly.
3. After competitors are created, edges of type `competitive_analysis_analyses_competitor` should appear. → confirms the pattern is being applied automatically.
4. Near the end, the agent should ask about `competitor_competes_for_persona`. → confirms `required_bridges` is being surfaced.
5. The smart ending should recommend exactly one next skill. → confirms boundary discipline.

If any of those go wrong, you have a precise place to look:

- (1) wrong → skill prompt is broken
- (2) wrong → playbook → domain-guide resolution is broken
- (3) wrong → pattern application logic in the skill prompt is broken
- (4) wrong → `required_bridges` surfacing is broken
- (5) wrong → universal smart-ending pattern is broken

Each layer fails distinctly. That's the value of the layered split.

---

## Reference

- Parent doc: [`MENTAL-MODEL.md`](./MENTAL-MODEL.md)
- Playbook type: `src/playbooks/types.ts`
- Playbook definitions: `src/playbooks/definitions/index.ts`
- Domain guides: `src/intelligence/domain-guides.ts`
- Region catalog: `src/regions/catalog.ts`
- Property schema: `src/properties/property-schema.ts`
