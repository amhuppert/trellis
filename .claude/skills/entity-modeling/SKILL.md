---
name: entity-modeling
description: Entity selection, aliases, primary sections, relationship types, and edge strength
triggers: ["model entities", "knowledge graph", "entity relationships"]
---

# Entity Modeling

Model entities readers will search for, hover, compare, or follow through the graph. Do not model every term in the prose.

Entity rules:

- Use stable kebab-case ids.
- Pick the most specific schema type.
- Give every entity a `primarySectionId`.
- Add aliases only for real alternate names.
- Keep `shortDef` useful in a hover card.

Relationship rules:

- Use lowercase kebab-case relationship types.
- Use `strong` only for essential dependencies.
- Add `sourceRefIds` when the edge is an evidence-backed architectural or factual claim.

Source of truth:

- KG schema: `packages/engine/src/schemas/kg.ts`
- KG helpers: `packages/engine/src/kg/graph-data.ts`, `packages/engine/src/kg/filters.ts`, `packages/engine/src/kg/layout.ts`
- Graph UI stories: `packages/storybook/stories/graph/EntityNode.stories.tsx`, `RelationshipEdge.stories.tsx`, `MiniGraph.stories.tsx`, `GraphToolbar.stories.tsx`
