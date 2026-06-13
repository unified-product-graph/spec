# Contributing to `@unified-product-graph/core`

UPG improves fastest when practitioners propose the entity types, edge types, and frameworks they actually use.

---

## Where to file issues

Open issues on the GitHub repository. Useful templates:

- **Spec gap** — an entity type, edge type, or property you expected and didn't find.
- **Framework request** — a recognised product-thinking framework you want represented.
- **Bug** — a validation function, type, or audit script misbehaving.
- **Question / discussion** — for proposals you're still shaping.

Search existing issues first.

---

## How to propose a new entity type

Entity types are the largest contribution surface. **Open an issue first** — new types touch the catalog, the registry, the property schema, the edge catalog, and the domain registry.

A good proposal includes:

1. **Name and domain.** Proposed `type_id` (snake_case, stable forever) and its domain (`src/registry/domains.ts`).
2. **Why this isn't an existing type.** Cite the closest existing types and explain the difference.
3. **Properties.** Minimum useful shape. UPG prefers thin property bags + rich edge semantics.
4. **Edges.** Which existing types it connects to, with proposed verbs in both directions.
5. **Example.** A real `.upg` document fragment.

Once accepted, the PR touches:

- `src/catalog/entity-catalog.ts` — register the type.
- `src/registry/entity-meta.ts` — add the immutable `type_id`, maturity (`proposed`), `since` version.
- `src/registry/domains.ts` — add the type to its domain's `types` array.
- `src/properties/domains/<domain>.ts` — declare the typed `*Properties` interface.
- `src/catalog/edge-catalog.ts` — add canonical edges.
- `src/__tests__/` — fixtures and assertions.

The audit scripts will catch most consistency issues. Run them locally before opening the PR.

---

## How to propose a new edge type

Open an issue with:

1. Proposed edge id (`source_type_verb_target_type`).
2. `forward_verb` and `reverse_verb`, both in active voice.
3. `classification`: one of `hierarchy | causal | semantic | cross-domain`.
4. Why an existing edge can't express this.

### Implementation checklist (the ripple)

A new edge type is not one edit. A few coordinated sites must move together, or
the spec-integrity test will fail. Work the list for your case:

**Every edge:**
1. `src/catalog/edge-catalog.ts` — add the definition (`forward_verb`, `reverse_verb`, `classification`, `source_type`, `target_type`).
2. Add a fixture instance so the new type has coverage in the saturated graph test (the coverage guard fails on a type with zero instances).

**If the edge is polymorphic** (`source_type` or `target_type` is the `'node'` wildcard):
3. `UPG_POLYMORPHIC_EDGE_KEYS` in `edge-catalog.ts` — add the key, or the "wildcard-endpoint edge not in allow-list" integrity test fails.
4. The poly-shape assertion in `src/__tests__/spec-integrity.test.ts` — bump the `toBe(N)` count and the family comment.

**If the edge is dual-registered** (also valid across products, e.g. against a `registry/{node}` target):
5. `UPGCrossEdgeType` union + `UPG_CROSS_EDGE_TYPES` array in `src/shapes/document.ts` (keep them in lockstep).
6. The `toEqual([...])` list and the count word in `src/__tests__/cross-product-edges.test.ts`.

Note: `pickCanonicalEdge(concretePair)` returns `null` for polymorphic edges by
design (they are keyed on `node:<target>`, not the concrete pair), so authors
pass an explicit `type` rather than relying on inference. That is expected, not a bug.

---

## How to propose a new framework

Frameworks are declarative records. Open an issue with:

1. Framework name and canonical reference (book, paper, website).
2. The category file (`src/frameworks/definitions/<category>.ts`).
3. Slot definitions: which UPG entity types fill each slot.
4. `when_to_use`, `when_not_to_use`, `core_question`.

The PR adds the record. Run `npm run audit:frameworks` to check it passes the quality and dedup audits.

---

## Running tests and audits

```bash
npm install

# Tests
npm test

# Type-check
npm run type-check

# Build
npm run build
```

A clean PR passes `npm test` and `tsc --noEmit`.

---

## Code style

- TypeScript strict mode. `any` requires a justifying comment.
- ESLint via `eslint.config.js`. Run `npm run lint` before pushing.
- Two-space indentation. Single quotes. Trailing commas.
- File headers carry a short purpose statement.
- JSDoc on every exported symbol. `@example` blocks encouraged.

Match the surrounding per-line style in catalog files (`entity-catalog.ts`, `edge-catalog.ts`, domain `*.ts`).

---

## Pull request expectations

- One logical change per PR.
- New entity types ship as `maturity: 'proposed'`. Promotion to `stable` requires ≥2 framework references, ≥3 properties, a defined or documented lifecycle, and 30 days without restructure (rubric in `src/registry/entity-meta.ts`).
- Breaking changes are negotiated in the issue first.
- `CHANGELOG.md` is updated for every release; a draft entry in the PR description helps.

---

## What we won't merge

- Entity types whose canonical home is another type's enum.
- Edges already expressible via an existing edge.
- Frameworks without a recognisable external reference.
- App-specific or tool-specific fields.
- Workarounds that bypass the property schema or the edge catalog.

---

## Code of conduct

Be precise. Be kind. Disagree on the substance. Cite the spec, the type signature, or the fixture.

---

Thank you. The spec is better for every contribution that lands.
