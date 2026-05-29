# Intelligence Layer: Benchmarks

## What lives here

Four files of operational benchmarks used by the intelligence layer to assess graph health and suggest next actions:

| File | Shape | Purpose |
|---|---|---|
| `count-benchmarks.ts` | `CountBenchmark[]` | Per-entity-type expected counts across the 9-stage product journey |
| `relationship-benchmarks.ts` | `RelationshipBenchmark[]` | Minimum children per parent, per stage |
| `ratio-benchmarks.ts` | `RatioBenchmark[]` | Numerator / denominator ratios across entity populations |
| `domain-activations.ts` | `DomainActivation[]` | When each domain should "come alive" in the product journey |

Every entry carries a `source` and a `rationale` (attribution plus reasoning) so consumers can surface *why* a benchmark exists when rendering health feedback.

## Source vocabulary

Every `source` is a structured `UPGBenchmarkSource` (discriminated union). See `./types.ts`.

The four sanctioned kinds:

- `book`: cited from a named published work (`citation` holds the full reference)
- `practitioner`: attributed to a specific author or method originator (`attribution` holds the name)
- `industry_practice`: generally accepted practice in a discipline (`category` holds the grouping, e.g. `agile`, `devops`, `security`, `ux_research`)
- `fundamental`: definitional within the UPG spec itself, not externally sourced

Consumers that want "show me every Lean Startup benchmark" filter on `source.kind === 'book' && source.citation === 'Lean Startup (Ries)'`. Consumers that want "show me every DevOps expectation" filter on `source.kind === 'industry_practice' && source.category === 'devops'`.

## Coverage policy

**Benchmarks are deliberately narrow, not exhaustive.** Only entity types with well-established counting heuristics from product-management literature are benchmarked (currently ~47 count benchmarks across the stable entity set).

Adding a benchmark requires a real reference (book, named practitioner, or codified industry practice). Speculative benchmarks are harmful: they lead consumers to produce content matching a fictional bar. When in doubt, leave the type unbenchmarked; the health layer falls back to "no expectation" for uncovered types.

Per-domain coverage gaps are tracked separately rather than filed as blockers. Uncovered domains simply receive no benchmark feedback until evidence accrues.

## Related

- `../domain-guides.ts`: narrative guidance paired with quantitative benchmarks
- `../intelligence.ts`: runtime that consumes benchmarks for health scoring
- `../../__tests__/spec-integrity.test.ts`: regression guards for range integrity and source structural checks
