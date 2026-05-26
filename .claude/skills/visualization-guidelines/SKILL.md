---
name: visualization-guidelines
description: When to use graph, chart, timeline, diagram, comparison, or no visualization in Trellis reports
triggers: ["choose visualization", "add a diagram", "visualize a report"]
---

# Visualization Guidelines

Use a visualization only when it reduces cognitive load.

Choose:

- Graph when relationships, dependencies, or conceptual neighborhoods matter.
- Comparison table when options share criteria.
- Timeline when order over time is the point.
- Diagram or figure when spatial structure clarifies a system.
- No visualization when prose plus entities is clearer.

Do not add decorative diagrams, duplicate the KG as a static image, or introduce a custom chart without evidence that the standard blocks cannot carry the explanation.

Source of truth:

- Figure and comparison blocks: `packages/engine/src/schemas/block.ts`
- KG schemas and helpers: `packages/engine/src/schemas/kg.ts`, `packages/engine/src/kg/graph-data.ts`
- Stories: `packages/storybook/stories/graph/EntityNode.stories.tsx`, `packages/storybook/stories/graph/RelationshipEdge.stories.tsx`, `packages/storybook/stories/graph/MiniGraph.stories.tsx`, `packages/storybook/stories/graph/GraphToolbar.stories.tsx`, `packages/storybook/stories/blocks/BlockRenderer.stories.tsx`
