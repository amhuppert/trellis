---
name: report-composition
description: How to compose a Trellis report: choose template, plan sections, orientation, synthesis, KG scope
triggers: ["compose a report", "plan a Trellis report", "structure a report"]
---

# Report Composition

Use this skill before authoring report files. Choose the closest template in `reports/_template-*` and then adjust only the section count, graph density, synthesis depth, and block mix needed for the topic.

Plan in this order:

1. Name the reader outcome and template in `report.config.ts`.
2. Draft sections with stable kebab-case ids and a recommended path.
3. Write orientation fields that route readers into Guided, Reference, Graph, and Synthesis when those modes have useful content.
4. Define a small KG scope: entities readers must understand, not every noun.
5. Define synthesis only for cross-section patterns, contrasts, takeaways, and open questions.

Source of truth:

- Report shape: `packages/engine/src/schemas/report-config.ts`
- Orientation: `packages/engine/src/schemas/orientation.ts`
- Sections and blocks: `packages/engine/src/schemas/section.ts`, `packages/engine/src/schemas/block.ts`
- UI examples: `packages/storybook/stories/views/OrientationView.stories.tsx`, `packages/storybook/stories/views/GuidedView.stories.tsx`
