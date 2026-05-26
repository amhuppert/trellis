---
name: teaching-tone
description: Calm, precise, explanatory voice for Trellis reports
triggers: ["teaching tone", "explain clearly", "write report prose"]
---

# Teaching Tone

Write like a careful engineer explaining a system to another engineer. Prefer concrete nouns, short sentences, and explicit causality.

Use:

- "This matters because..."
- "The boundary is..."
- "The tradeoff is..."
- "This source shows..."

Avoid:

- Marketing language.
- Vague intensifiers.
- Overstated certainty where evidence is thin.
- Long metaphors that hide the actual mechanism.
- Unsupported claims about intent.

Source of truth:

- Inline prose contract: `packages/engine/src/schemas/block.ts`
- Section summaries: `packages/engine/src/schemas/section.ts`
- Story examples: `packages/storybook/stories/shell/ReaderShell.stories.tsx`, `packages/storybook/stories/blocks/BlockRenderer.stories.tsx`
