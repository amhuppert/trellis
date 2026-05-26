---
name: synthesis
description: Common structure, contrast, takeaways, open questions, and references for Trellis synthesis
triggers: ["write synthesis", "synthesize report", "cross-section takeaways"]
---

# Synthesis

Use synthesis for patterns that span sections. It is not a summary dump.

Each useful synthesis node should do at least one of these:

- Name a common structure across sections.
- Contrast similar mechanisms or options.
- Preserve a takeaway the reader can reuse.
- Admit an open question or unresolved tradeoff.
- Link back to the sections, entities, and sources that support it.

Keep roots broad and children specific. Avoid synthesis nodes that only repeat section titles.

Source of truth:

- Synthesis schema: `packages/engine/src/schemas/synthesis.ts`
- Resolver behavior: `packages/engine/src/synthesis/tree.ts`, `packages/engine/src/synthesis/resolveRef.ts`
- UI examples: `packages/storybook/stories/views/SynthesisView.stories.tsx`
