# UPG Markdown: Format Specification (v0.1)

> The literate variant of the `.upg` JSON format.
> Human-authored Markdown with typed entity references that resolve against a product graph.

**Format version:** 0.1
**Status:** Pragmatic spec (not formal grammar; written the way good web specs are written).
**Reference implementation:** `@unified-product-graph/markdown` on npm.
**Third-party parser conformance:** §3 below is the normative checklist for conformant parsers.
**License:** MIT.

---

## 1. What `.upg.md` is

A `.upg.md` file is a single CommonMark Markdown document with two additions:

1. **YAML frontmatter** declaring the document's identity and graph-membership.
2. **Inline typed references** in the body (`[[type:id]]` chips for entities, `{{type:id → type:id|verb}}` connectors for edges) and an optional fenced JSON escape hatch (` ```upg `) for declarations a renderer needs to resolve up-front.

It is **the same product graph as `.upg`**, expressed prose-first. A `.upg.md` document is itself an entity of type `document`; the references it contains are the graph the document narrates.

The format is designed for:

- **Human authoring**: write Markdown the way you already do; entities and edges sit inline.
- **Round-trip with `.upg` JSON**: a `.upg.md` and an equivalent `.upg` file describe the same graph.
- **Portability**: any Markdown-aware tool can render the document; UPG-aware tools resolve the chips.
- **Diffability**: line-oriented source, friendly to git, code review, and pair authoring.

Non-goals: HTML rendering semantics, live link resolution, embedding/search, MDX-style component syntax, multi-document workspace indexing. All are out of scope here. They MAY ship in tooling layers; they are not part of the format.

---

## 2. File structure

A `.upg.md` document has exactly two parts in this order:

1. **Frontmatter**: a YAML block delimited by `---` on its own lines (§3).
2. **Body**: CommonMark Markdown with inline references (§4–§6) and optional fenced `upg` blocks (§7).

```
---
title: "Document Title"
upg_product: <product-slug>
upg_version: "0.2"
entity_type: document
entity_id: <stable-id>
---

# Body starts here.

The persona [[persona:alex-senior-pm]] pursues
{{persona:alex-senior-pm → job:keep-team-aligned|pursues}}.
```

**Encoding:** UTF-8, no BOM. Line endings: LF preferred, CRLF tolerated (parsers SHOULD normalise to LF on emit).
**Extension:** `.upg.md`. MIME type: `text/markdown; profile="upg"`.

---

## 3. Frontmatter

The frontmatter MUST be the first construct in the file. If the opening `---` is absent, the document is not a `.upg.md`. UPG-aware tools SHOULD treat it as plain Markdown and emit a `MISSING_FRONTMATTER` error if UPG semantics are required.

### 3.1 Required fields

| Field | Type | Meaning |
|---|---|---|
| `title` | string | Human-readable document title. Used as fallback display when chips reference this document by id. |
| `upg_product` | string | Slug of the product graph this document belongs to. Scopes every chip ID unless an explicit `@product` suffix overrides (§5). |
| `upg_version` | string | UPG spec version this document targets (e.g. `"0.2"`). Parsers MUST NOT reject unknown versions; they MAY warn. |
| `entity_type` | string literal `document` | The document is an entity. v0.1 fixes this to `document`. |
| `entity_id` | string | Stable ID of the document entity itself. MUST match `^[a-z][a-z0-9_-]*$`. |

A document missing any required field is **invalid**: a conforming parser emits `MISSING_REQUIRED_FIELD` and halts structural extraction. Chips and edges MAY still be reported as warnings for diagnostics.

### 3.2 Optional fields

Reserved keys recognised by the spec:

| Field | Type | Meaning |
|---|---|---|
| `author` | string | Free-form author attribution. |
| `created_at` | ISO 8601 date | Creation timestamp. |
| `updated_at` | ISO 8601 date | Last-update timestamp. |
| `tags` | string[] | Free-form categorisation. Flow (`[a, b, c]`) and block (`- a\n- b`) styles both valid. |
| `status` | `'draft'` \| `'review'` \| `'published'` \| `'archived'` | Document lifecycle state. |
| `composition_pattern` | string | Named structural pattern (e.g. `experiment_report`, `decision_record`). |
| `graph_source` | path | Relative path to the `.upg` file this document resolves against. |
| `aliases` | string[] | Alternate IDs for the document entity. |
| `region` | string | Spec region this document belongs to. |
| `parent` | string | Parent entity (`type:id`) under which this document nests. |

### 3.3 Extension fields

Any frontmatter key not listed in §3.1 or §3.2 is an **extension**. Conforming parsers MUST preserve unknown keys verbatim, including key order, on round-trip. A parser that drops an unknown key is non-conforming.

This is the forward-compatibility commitment: tools that ship today MUST round-trip documents that target future versions of the spec without data loss for constructs they do not understand.

---

## 4. Body conventions

The body is **prose-first**: standard CommonMark plus GitHub-Flavored Markdown (tables, fenced code blocks, strikethrough, task lists). The two Markdown extensions UPG MD adds (typed chips and edge connectors) are **inline syntax inside ordinary prose**, not block-level constructs.

> **Rationale for prose-first.** See `08-decisions/2026-04-25-upg-md-prose-first.md`. Earlier drafts treated entity declarations as block constructs (Markdown headings + property tables). Authoring practice converged on inline references. The fenced `upg` block (§7) remains the structural escape hatch when prose alone cannot express what's needed.

A document MAY contain zero references. A `.upg.md` with no chips is a valid document, narrating without graph-augmentation.

### 4.1 What Markdown extensions are in scope

| Feature | In scope | Notes |
|---|---|---|
| CommonMark | YES | Full CommonMark is the substrate. |
| GFM tables | YES | Tables are common in property-heavy documents (§9 examples). |
| GFM fenced code blocks | YES | The fenced `upg` block (§7) is a special case. |
| GFM strikethrough, task lists, autolinks | YES | Permitted but not load-bearing. |
| YAML frontmatter | YES | §3. |
| MDX / JSX components | NO | Out of scope. Prose-first means CommonMark prose. |
| Inline HTML | TOLERATED | Permitted but not extracted. Renderers MAY pass through. |
| Markdown comments (`<!-- ... -->`) | TOLERATED | Pass-through; a parser MAY drop them outside chip/edge ranges (§8.4). |

---

## 5. Entity references (chips)

Form: `[[type:id]]`, with optional creation marker, product scope, and pipe-delimited modifiers.

### 5.1 Canonical grammar

```
/\[\[(\+?)([a-z][\w]*?):([a-z][\w-]*?)(?:@([\w-]+))?(?:\|([^\]]*))?\]\]/g
```

Capture groups:

1. **Creation flag**: `+` if present (§5.3), empty otherwise.
2. **Type**: `^[a-z][a-z_]*$`. Must match an entry in `UPG_ENTITY_META` to be **resolved**; unknown types remain valid syntax (§8.5).
3. **ID**: `^[a-z][a-z0-9_-]*$`. May be the entity's canonical UUID, slug, or any value in its `aliases[]` (§5.5).
4. **Product slug**: optional `@product` suffix (§5.4). Absent means inherit `upg_product` from frontmatter.
5. **Modifiers**: pipe-delimited segments parsed left-to-right (§5.6).

### 5.2 The basic forms

| Form | Meaning |
|---|---|
| `[[type:id]]` | Reference an existing entity. |
| `[[+type:id]]` | **Creation marker.** Declares the entity (§5.3). |
| `[[type:id@product]]` | Cross-product reference (§5.4). |
| `[[type:id\|"label"]]` | Display label override (§5.6.1). |
| `[[type:id\|key:value]]` | Inline property assignment (§5.6.2). |
| `[[type:id\|key:value\|"label"]]` | Combined: modifiers and display text in any order. |

### 5.3 Creation references

A `[[+type:id]]` marks the **first occurrence** in document order as the entity declaration. Subsequent `[[type:id]]` references resolve to it. The creation form is equivalent to a fenced-block declaration (§7.2) for the same `type:id`.

If both an inline `[[+type:id]]` and a fenced declaration name the same `type:id`, the **first occurrence in document order wins**; later ones are references. Conforming parsers emit `DUPLICATE_DECLARATION` as a **warning**, never an error.

### 5.4 Cross-product references

`[[persona:alex@analytics]]` references entity `persona:alex` in product `analytics`, regardless of the current document's `upg_product`. The product slug suffix is `@<product>`; valid characters are `[\w-]+`.

The grammar collapses `@product` and `@variant` (a hypothetical future construct) into a single `@([\w-]+)` slot. Resolution is the consumer's concern: parsers that don't implement variants treat the suffix as a product slug.

### 5.5 Layered ID resolution (UPG ≥ v0.2.2)

The `id` capture is a generic identifier. A conforming **resolver** MUST try each layer in order and stop at the first hit:

1. UUID match against the node's `id` field.
2. Slug match against the node's `slug` field, scoped to the chip's `type`.
3. Alias match against any value in the node's `aliases[]`, scoped to the chip's `type`.
4. None matched → unresolved (warning, not a parse error).

Pure syntax recognisers (parsers that don't perform resolution) SHOULD surface `id` verbatim and let downstream tools resolve. UUID-form chips remain valid forever; machine-generated content is not required to know about slugs.

### 5.6 Modifiers

Everything after the first `|` and before the closing `]]` is the modifier string, split on un-quoted `|`. Each segment is one of:

#### 5.6.1 Display label
A double-quoted string: `[[persona:alex|"Alex (CEO)"]]`. The label is the rendered text; it does NOT mutate the entity's title in the graph.

#### 5.6.2 Inline property
An unquoted `key:value` pair matching `^([\w]+):(.+)$`. Example: `[[need:context-loss|valence:pain|severity:3]]`.

Inline properties are **assignments scoped to this reference**. Their interpretation depends on the consumer:

- **Renderers** display them as additional context next to the chip.
- **Loaders** treat the first such assignment for a given `(entity, property)` pair as authoritative; subsequent occurrences are SHOULD-warn (`DUPLICATE_INLINE_PROPERTY`).
- **Round-trippers** preserve every modifier byte-for-byte.

Conforming parsers MUST surface modifiers as an **ordered list** of `{kind: 'label', value}` or `{kind: 'property', key, value}` entries; order is normative for round-trip (§8).

### 5.7 What chips do NOT do

Chips do not declare relationships. The relationship between two entities is an **edge** (§6) or a property assignment, not a chip. Two chips on the same line are two references; they do not form an implicit edge.

---

## 6. Edge references

Form: `{{src_type:src_id → tgt_type:tgt_id|verb}}`.

### 6.1 Canonical grammar

```
/\{\{([\w]+):([\w-]+)(?:@([\w-]+))?\s*(?:→|->)\s*([\w]+):([\w-]+)(?:@([\w-]+))?\|([\w_]+)\}\}/g
```

### 6.2 Endpoints

Both endpoints follow chip rules: type matches `^[a-z][a-z_]*$`, id matches `^[a-z][a-z0-9_-]*$`, optional `@product` suffix per §5.4. Endpoints inside an edge reference are **references**, not declarations. To declare an entity inside an edge, use a creation chip elsewhere in the document.

### 6.3 The arrow

The arrow MUST be either `→` (U+2192) or the ASCII fallback `->`. Conforming parsers MUST accept both and SHOULD normalise to `→` on emit unless the consumer explicitly requests otherwise. The arrow's whitespace is permissive: `{{src→tgt|verb}}` and `{{src  →  tgt|verb}}` are equivalent.

### 6.4 Verbs

The verb segment matches `[\w_]+` (lowercase identifiers with underscores). To be **resolved**, the verb MUST be a key in `UPG_EDGE_CATALOG`. Unknown verbs are warnings (§8.5), not errors; the format is forward-compatible with edge types added in later spec versions.

A verb is **canonical** when paired with the correct `(src_type, tgt_type)`: the spec catalogue keys edges by full triple. A verb that exists in the catalogue but is paired with the wrong endpoint types is `UNKNOWN_VERB_FOR_PAIR` (warning).

### 6.5 Inline edges and fenced edges are equivalent

An inline `{{a → b|verb}}` and a fenced declaration `{ "src": "a", "tgt": "b", "verb": "verb" }` (§7) are equivalent. Conforming parsers MUST merge both into a single edge set, deduplicated by `(src, tgt, verb)`. Duplicate edges are silently de-duped, not warned.

---

## 7. Fenced `upg` blocks (the JSON escape hatch)

Inline chips (§5) and inline edges (§6) are the primary authoring surface. **Fenced `upg` blocks remain part of v0.1 and MUST be supported by every conforming parser**; exporters, structural import, and round-trip with `.upg` JSON depend on them.

### 7.1 Block shape

A fenced block opens with `^```upg\b` and closes with `^```$`. The body is JSON. The JSON body MUST parse as an object with optional `declarations` and `edges` arrays:

````
```upg
{
  "declarations": [
    { "type": "feature", "id": "smart-search", "title": "Smart Search", "properties": { "status": "shipped" } }
  ],
  "edges": [
    { "src": "feature:smart-search", "tgt": "metric:weekly-actives", "verb": "drives" }
  ]
}
```
````

### 7.2 Declarations

Each entry in `declarations[]` is equivalent to a creation chip `[[+type:id]]` plus inline property modifiers. Required fields: `type`, `id`. Optional: `title`, `properties` (object), `aliases` (string[]). Any additional keys MUST round-trip.

### 7.3 Edges

Each entry in `edges[]` is equivalent to an inline `{{src → tgt|verb}}`. Required fields: `src` (string `type:id[@product]`), `tgt` (same), `verb` (string). Additional keys MUST round-trip.

### 7.4 Malformed JSON

A malformed block is a **warning** (`INVALID_FENCED_JSON`) that affects only that block; the rest of the document MUST still parse. Conforming parsers SHOULD continue to extract inline chips and edges around the malformed block.

### 7.5 When to use a fenced block

Use the fenced block when:

- A renderer needs property assignments that don't fit cleanly inline (e.g. a 12-field `metric_quality_assessment`).
- The same set of declarations is reused across multiple sections: declare once, reference inline thereafter.
- The document is generated by tooling that emits structural data and prose separately.

For most human authoring, inline chips suffice. Fenced blocks are the escape hatch, not the default.

---

## 8. Parser behaviour

### 8.1 Required behaviour (MUST)

1. **Parse frontmatter first.** A document with malformed frontmatter is invalid; halt structural extraction (§3).
2. **Mask code regions.** Chips and edges inside fenced code blocks (` ``` ... ``` ` excluding `upg` blocks) and inline code spans (`` ` ... ` `` and `` `` ... `` ``) MUST NOT be extracted as references.
3. **Honour escapes.** `\[\[`, `\]\]`, `\{\{`, `\}\}` render literal brackets and MUST NOT be extracted (§8.3).
4. **Surface byte ranges.** For every chip and edge, expose the source byte range. Byte ranges are normative; they enable round-trip edits (§9).
5. **Preserve unknown frontmatter keys.** Verbatim, including order (§3.3).
6. **Preserve modifier order.** Modifier segments inside a chip MUST round-trip in source order (§5.6).

### 8.2 Recommended behaviour (SHOULD)

1. **Normalise the arrow** to `→` on emit, preserving the source style on round-trip (§6.3).
2. **Warn, don't drop.** Unknown types, unknown verbs, unknown frontmatter keys, malformed individual chips: warn and continue (§8.5).
3. **Layered ID resolution** per §5.5 if the parser also resolves.
4. **Multiline limit.** A single reference SHOULD NOT span more than 3 lines; longer spans warn (`MULTILINE_EXCEEDS_LIMIT`) and are not extracted.

### 8.3 Escape sequences

| Escape | Renders |
|---|---|
| `\[\[` | `[[` |
| `\]\]` | `]]` |
| `\{\{` | `{{` |
| `\}\}` | `}}` |

Escapes survive parse-and-emit round-trips byte-for-byte. A parser that "unescapes" on emit is non-conforming.

### 8.4 Comments and incidental whitespace

A conforming parser MAY drop:

- Trailing whitespace on lines outside chip/edge ranges.
- HTML/Markdown comments (`<!-- ... -->`) outside fenced `upg` blocks.
- Duplicate blank lines outside chip/edge ranges.

A conforming parser MUST NOT drop:

- Frontmatter keys (§3.3).
- Chip or edge byte content.
- Whitespace inside chip/edge ranges.

### 8.5 Out-of-spec, gracefully

A conforming parser **never silently drops structural content**.

| Situation | Behaviour |
|---|---|
| Chip type not in spec catalog | Emit chip with `resolved: false`. **Warning** (`UNKNOWN_TYPE`). Preserve in source. |
| Edge verb not in `UPG_EDGE_CATALOG` | Emit edge with `resolved: false`. **Warning** (`UNKNOWN_VERB`). Preserve. |
| Edge verb in catalog but wrong endpoint pair | **Warning** (`UNKNOWN_VERB_FOR_PAIR`). Preserve. |
| Modifier value invalid for a reserved key | Keep the chip. **Warning** (`INVALID_PROPERTY_VALUE`). |
| `@product` references an unknown product | Keep the reference unresolved. **Warning** (`UNKNOWN_PRODUCT`). |
| Malformed chip syntax (`[[type:]]`, missing closing `]]`) | Skip. **Warning** (`MALFORMED_REFERENCE`). Continue parsing. |
| Frontmatter invalid | **Error** (`MISSING_REQUIRED_FIELD` or `INVALID_FRONTMATTER_YAML`). Halt structural extraction. |
| Future syntax (e.g. unknown sigils inside `[[…]]`) | Treat as opaque. Preserve byte range. **Warning** only. |
| Malformed fenced `upg` JSON | **Warning** (`INVALID_FENCED_JSON`). Affects that block only. |

### 8.6 Forward compatibility

An older conforming parser reading a newer document MUST round-trip without data loss for any construct it does not understand. This is non-negotiable. A future spec version MAY add new sigils, new modifier kinds, new fenced block types; older parsers preserve them as opaque text and warn.

---

## 9. Round-trip with `.upg` JSON

`.upg.md` and `.upg` describe the same product graph. Conversion between them is **lossless in one direction** and **lossy in the other**, with a clear contract.

### 9.1 `.upg.md → .upg` (lossy)

Drops:
- Prose surrounding the chips (the document is preserved as a `document` entity with its body in `properties.body_md`, but Markdown structure, including headings, paragraph layout, and formatting, is intentionally not modelled in the graph).
- Modifier display labels (`"Alex (CEO)"`): presentation, not graph data.
- Comments and incidental whitespace (§8.4).

Preserves:
- Every chip → entity (creation refs declare new entities; references link existing ones).
- Every edge → graph edge.
- Every inline property modifier → property assignment on the target entity.
- All frontmatter (mapped to the document entity's properties + extension fields).
- All fenced `upg` declarations and edges.

### 9.2 `.upg → .upg.md` (lossy)

Drops:
- Edge metadata that has no inline syntax (e.g. edge weights, custom edge properties beyond verb).
- Per-entity properties that aren't surfaceable as inline modifiers (large bodies of structured data stay in the graph; the document references them).

Preserves:
- Every entity → creation chip or fenced declaration.
- Every edge → inline `{{src → tgt|verb}}` or fenced edge.
- Document-level metadata → frontmatter.

### 9.3 Round-trip identity

`.upg.md → in-memory graph → .upg.md'` is **byte-stable** for any document where every chip and edge is in the spec catalogue, every frontmatter key is recognised, and no malformed-but-tolerated constructs are present. Documents using extension fields or unknown types round-trip with **content stability** (semantic equivalence) but MAY differ in byte form on the unrecognised regions.

`.upg → .upg.md → .upg'` is **content-stable** for the entity and edge sets but does not preserve prose narration (because there was none to begin with).

---

## 10. Worked examples

Each example below is a complete `.upg.md` document. Each is validated by the round-trip test suite in `@unified-product-graph/markdown` (`packages/upg-markdown/src/__tests__/spec-examples.test.ts`).

See `packages/upg-spec/spec/examples/`:

- `enterprise-pilot-results.upg.md`: full experiment-report shape (existing reference document).
- `persona-minimal.upg.md`: minimal viable doc; frontmatter + a single chip (§10.1).
- `feature-decision.upg.md`: feature decision doc with chips + edges + a fenced `upg` block (§10.2).
- `metric-tracking.upg.md`: metric doc using property modifiers and cross-product references (§10.3).

### 10.1 `persona-minimal.upg.md`: minimum viable document

The smallest valid `.upg.md`. Demonstrates required frontmatter and a single inline chip.

### 10.2 `feature-decision.upg.md`: chips + edges + fenced block

Demonstrates the full prose-first authoring shape: typed chips for the persona/feature/decision; an edge expressing the rationale relationship; a fenced `upg` block for the structural decision-record properties (the prose alone wouldn't fit them cleanly).

### 10.3 `metric-tracking.upg.md`: modifiers + cross-product

Demonstrates inline property modifiers on metrics (`current:22%|target:30%`), the creation-marker form for newly-discovered entities, and a cross-product reference to a sibling product graph.

---

## 11. Versioning

The format spec is versioned independently from `@unified-product-graph/core`'s spec version (entity catalogue, edge catalogue, lifecycles), which evolve more frequently while the format remains stable across them.

- **Format version (this document):** `0.1`. Exposed at runtime as `MARKDOWN_FORMAT_VERSION` from `@unified-product-graph/core`.
- **Spec version (`upg_version` frontmatter):** the entity/edge catalogue version the document targets (e.g. `0.2`). Independent of format version.

A document declaring `upg_version: "0.2"` and consumed by a tool that bundles `@unified-product-graph/core@0.2.x` is in-spec. Forward compatibility (§8.6) handles version drift.

A future format `v0.2` would ship as `UPG-MARKDOWN-v0.2.md` alongside this document. The format is intentionally conservative about breaking changes; most evolution happens in catalogue versions, not format versions.

---

## 12. Out of scope for v0.1

Explicitly **not** part of this spec:

- HTML rendering semantics, hover cards, syntax highlighting (consumer concerns).
- Live link resolution against a graph store (resolver tooling).
- Embedding semantics (search, similarity, vector indexing).
- Workspace-level multi-document indexing and cross-document linking semantics.
- Speculative future syntax (templated chips, computed properties, inline queries, conditional rendering).
- MDX / JSX components: out of scope per §4.1; prose-first means CommonMark prose.
- Block-level entity declaration syntax (e.g. heading-keyed entity blocks). The format converged prose-first; block-level structure is the fenced `upg` block (§7).

Each of the above MAY be specified in a later format version or in tooling layers above the format. None affect parser conformance for v0.1.

---

## 13. Cross-references

- **Reference implementation:** `@unified-product-graph/markdown` on npm, providing `parse()`, `validate()`, `buildIndex()`, `toPlainMarkdown()`, `updateRefs()`, and TipTap converters.
- **Prose-first rationale:** UPG MD is authored for humans first; entity references are CommonMark-compatible inline chips so files render cleanly in any Markdown viewer.
- **`.upg` JSON format:** UPG MD is the literate variant of the `.upg` JSON format. See the UPG core spec for the JSON schema.
- **Site `/format` page:** [unifiedproductgraph.org/format](https://unifiedproductgraph.org/format) links to this document at a stable URL.
