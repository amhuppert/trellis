---
name: teaching-order
description: Foundations before mechanisms, examples before abstractions, progressive detail
triggers: ["teaching order", "sequence sections", "progressive explanation"]
---

# Teaching Order

Sequence the reader from stable concepts toward mechanisms and edge cases. Do not start with implementation detail unless the report is explicitly a source walkthrough.

Default order:

1. Foundation: define the thing and why it exists.
2. Mechanism: explain how the moving parts interact.
3. Example: make the mechanism testable in a concrete case.
4. Boundary: show limits, failures, or tradeoffs.
5. Synthesis: compress the lesson into durable structure.

Use `beforeContinue` when the next section depends on a mental checkpoint.

Source of truth:

- Section kinds and outline anchors: `packages/engine/src/schemas/section.ts`
- Block sequencing: `packages/engine/src/schemas/block.ts`
- Guided flow UI: `packages/storybook/stories/shell/ReaderShell.stories.tsx`, `packages/storybook/stories/chrome/SectionPagination.stories.tsx`
