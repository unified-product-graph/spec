# Contributing to UPG Templates

Thanks for your interest in `@unified-product-graph/templates`. This package ships ready-to-use entity templates for the Unified Product Graph. The goal is to give product creators proven starting patterns instead of blank pages.

## What belongs here

A template captures a pattern worth reusing across products: a persona archetype, a funnel shape, a business model skeleton, a hypothesis set, a launch checklist. Templates are pure data; no runtime logic.

Good candidates:
- Patterns that recur across many products in an industry.
- Patterns whose structure is more valuable than any specific instance.
- Patterns the consumer can fill in with `{{placeholder}}` values in under five minutes.

If a template only fits one product, it is not a template; it is a graph.

## Template conventions

Every template is a `TemplateSet` (see `src/types.ts`) with:

- `id`, `name`, `description`, `industry`, `stage`.
- `entities[]`: each entity has a `type` (matching the UPG spec), `title_template`, optional `description_template`, and `default_properties`.
- `edges[]`: each edge wires entities together by **position in the `entities` array**, using `source_index` and `target_index`. Edges do not embed entity IDs.
- `prompts`: a map from placeholder key to the question shown to the user when filling the template.

### Placeholders

Use `{{snake_case_key}}` inside `title_template`, `description_template`, and any `default_properties` value that should be filled at instantiation time. Every placeholder you use **must** appear in `prompts`. Every key in `prompts` should appear in at least one template field.

### Edges by index

Edges reference entities by their position in `entities[]`, not by ID. This keeps templates self-contained and re-instantiable.

```ts
entities: [
  { type: 'persona', title_template: '{{persona_name}}', ... }, // index 0
  { type: 'job',     title_template: '{{job_title}}',    ... }, // index 1
],
edges: [
  { source_index: 0, target_index: 1, type: 'persona_pursues_job' },
],
```

## Proposing a new template

1. Open an issue describing the pattern, the industry, and why it is broadly reusable.
2. Once the shape is agreed, open a pull request adding the template to the appropriate file in `src/templates/`.
3. Update `src/index.ts` if you add a new industry file.
4. Update the README industry table and the count comment.

## Testing locally

```bash
npm install
npm run build
npm run type-check
npm run lint
```

Verify your template imports cleanly and that every placeholder you reference has a matching `prompts` entry.

## Reporting issues

File issues at <https://github.com/unified-product-graph/templates/issues>.
