# How the spec is organised

The full layer-by-layer architecture lives in **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Layout

```
src/
├── index.ts          Root: version, computed sets, barrel re-exports
├── catalog/          Layer 1a : what exists (entity type union, edge catalog)
├── shapes/           Layer 1b : structural primitives (node, edge, document)
├── registry/         Layer 1c : identity and organisation (stable IDs, 36 domains)
├── grammar/          Layer 2  : how things behave (hierarchy, lifecycles, scales, migrations, validation)
├── properties/       Layer 3  : what things carry (per-entity-type field definitions)
├── presentation/     Layer 4a : how things look (labels, lenses, domain rings)
├── intelligence/     Layer 4b : graph health and guidance (benchmarks, domain guides)
├── frameworks/       Layer 4c : 34 canonical framework definitions (+ internal research library)
├── playbooks/        Layer 5a : region-anchored bootstrap recipes
└── approaches/       Layer 5b : cognitive engagement categories
```

Each layer imports only from layers above it.

## Entry points

1. **`catalog/entity-catalog.ts`**: the active entity type union across 37 domains.
2. **`catalog/edge-catalog.ts`**: the canonical edge source (`as const satisfies`).
3. **`shapes/base-node.ts`**: the interface every node shares.
4. **`shapes/edges.ts`**: `UPGEdgeType` derived via `keyof typeof`.
5. **`shapes/document.ts`**: the `.upg` file format.
