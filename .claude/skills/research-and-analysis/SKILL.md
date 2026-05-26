---
name: research-and-analysis
description: Source gathering, code tracing, fact versus inference separation, and evidence discipline
triggers: ["research a report", "trace code", "gather sources"]
---

# Research And Analysis

Gather evidence before writing report prose. Keep source notes outside the report until claims are stable.

Workflow:

1. Inventory canonical docs, code paths, issues, papers, or designs.
2. Trace the runtime path from entry point to data model or output.
3. Mark each claim as fact, inference, or recommendation.
4. Back facts with `sources` entries and code line ranges when available.
5. Keep uncertainty visible in synthesis `openQuestions`, not hidden in confident prose.

Source of truth:

- Source schema: `packages/engine/src/schemas/source.ts`
- Inline references: `packages/engine/src/schemas/synthesis.ts`
- Validation rules: `packages/engine/src/validation/rules/source-refs.ts`, `packages/engine/src/validation/rules/block-refs.ts`
- Reference UI: `packages/storybook/stories/views/ReferenceView.stories.tsx`, `packages/storybook/stories/reference/EntityDetailPanel.stories.tsx`
