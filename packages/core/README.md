# @unified-product-graph/core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status: Early Alpha](https://img.shields.io/badge/status-early%20alpha-orange.svg)](https://unifiedproductgraph.org)

> **Early alpha.** The specification is still evolving and breaking changes can land between versions. Pin a version if you need stability.

The TypeScript core for the **Unified Product Graph (UPG)**, an open specification that gives product tools a shared vocabulary for entities, edges, and frameworks.

319 entity types across 37 domains. 1024 typed edges. 46 canonical framework definitions, with more added as each is reviewed.

## Install

```bash
npm install @unified-product-graph/core
```

## Quick usage

```typescript
import {
  type UPGDocument,
  validateUPGDocument,
  isUPGDocument,
  UPG_VERSION,
  UPG_FORMAT_VERSION,
} from '@unified-product-graph/core'

// UPG_VERSION (0.5.0) is the catalogue version. UPG_FORMAT_VERSION (0.4.0)
// is the on-disk .upg document format. The format evolves more slowly.

const doc: UPGDocument = {
  upg_version: UPG_FORMAT_VERSION,
  exported_at: new Date().toISOString(),
  source: { tool: 'my-app', tool_version: '1.0.0' },
  product: { id: 'p1', title: 'My Product' },
  nodes: [
    { id: 'n1', type: 'persona', title: 'Power User' },
    { id: 'n2', type: 'job', title: 'Get insights faster' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', type: 'persona_pursues_job' },
  ],
}

const result = validateUPGDocument(doc)
console.log(result.valid, result.errors, result.warnings)

if (isUPGDocument(doc)) {
  console.log(`${doc.nodes.length} nodes exported`)
}
```

## Documentation

Architecture guide: [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md)

Full spec: [unifiedproductgraph.org](https://unifiedproductgraph.org)

## License

MIT
