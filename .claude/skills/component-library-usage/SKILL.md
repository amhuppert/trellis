---
name: component-library-usage
description: Which Trellis components and structured blocks to use, with Storybook paths and anti-patterns
triggers: ["use Trellis components", "choose report blocks", "component library"]
---

# Component Library Usage

Use standard blocks first. Add `custom` blocks only when the report needs an interaction or visualization the schema cannot express.

Default choices:

- `conceptIntro` for the first explanation of an idea.
- `stepByStep` when order matters.
- `callout` for real cautions, notes, asides, or quotes.
- `keyTakeaways` after a dense section.
- `comparisonTable` for compact option-by-criterion comparisons.
- `codeBlock` only when a source excerpt helps the reader inspect implementation.

Avoid ornamental cards, duplicate explanations across blocks, or custom components that only restyle prose.

Source of truth:

- Block contracts: `packages/engine/src/schemas/block.ts`
- Custom components: `packages/engine/src/schemas/custom-manifest.ts`
- Stories: `packages/storybook/stories/blocks/ConceptIntro.stories.tsx`, `Callout.stories.tsx`, `StepByStep.stories.tsx`, `KeyTakeaways.stories.tsx`, `BlockRenderer.stories.tsx`
- Shell and modes: `packages/storybook/stories/shell/ReaderShell.stories.tsx`, `packages/storybook/stories/views/OrientationView.stories.tsx`, `packages/storybook/stories/views/ReferenceView.stories.tsx`, `packages/storybook/stories/views/SynthesisView.stories.tsx`
