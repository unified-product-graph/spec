# Changelog

All notable changes to `@unified-product-graph/templates` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] · 2026-05-19

### Added

- Initial public release.
- 17 entity templates across 5 industries: SaaS (5), marketplace (3), mobile (3), open source (3), agency (3).
- `ALL_TEMPLATES`, per-industry exports, `getTemplatesForIndustry`, and `getTemplatesForStage` helpers.
- `{{placeholder}}` substitution convention with paired `prompts` map for guided fills.
- Index-based edge declarations (`edges[].source_index` / `edges[].target_index`) for in-template wiring.
