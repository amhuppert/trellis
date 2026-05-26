import type { Section } from "@trellis/engine";

// Use .claude/skills/research-and-analysis/SKILL.md for code tracing and .claude/skills/component-library-usage/SKILL.md for block choice.
// Storybook references: packages/storybook/stories/blocks/ConceptIntro.stories.tsx and StepByStep.stories.tsx.
export const sections: Section[] = [
  {
    n: "01",
    id: "architecture-overview",
    title: "Architecture Overview",
    kind: "Concept",
    summary: "Stub: replace with the system boundary and major runtime layers.",
    relatedEntityIds: ["sample-module", "sample-component"],
    sourceRefIds: ["sample-code"],
    children: [{ id: "overview-map", title: "System map" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "overview-map", title: "System map", body: "Replace this with how <e id=\"sample-module\">the module</e> and <e id=\"sample-component\">the component</e> fit together." },
      { kind: "prose", body: "Replace this with the first architectural boundary a reader should learn." }
    ]
  },
  {
    n: "02",
    id: "main-flows",
    title: "Main Flows",
    kind: "Mechanism",
    summary: "Stub: replace with request, render, build, or data flows.",
    relatedEntityIds: ["sample-module"],
    sourceRefIds: ["sample-code"],
    children: [{ id: "flow-path", title: "Primary flow" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "flow-path", title: "Primary flow", body: "Replace this with the primary execution path through <e id=\"sample-module\">the module</e>." },
      { kind: "prose", body: "Replace this with where control passes next and what data changes shape." }
    ]
  },
  {
    n: "03",
    id: "key-modules",
    title: "Key Modules",
    kind: "Concept",
    summary: "Stub: replace with the modules worth opening first.",
    relatedEntityIds: ["sample-module", "sample-file"],
    sourceRefIds: ["sample-code"],
    children: [{ id: "module-roles", title: "Module roles" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "module-roles", title: "Module roles", body: "Replace this with the responsibilities owned by <e id=\"sample-module\">the module</e>." },
      { kind: "prose", body: "Replace this with nearby modules and why they are separate." }
    ]
  },
  {
    n: "04",
    id: "data-model",
    title: "Data Model",
    kind: "Mechanism",
    summary: "Stub: replace with types, schemas, persisted data, or API contracts.",
    relatedEntityIds: ["sample-file"],
    sourceRefIds: ["sample-code"],
    children: [{ id: "model-shape", title: "Model shape" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "model-shape", title: "Model shape", body: "Replace this with the structures defined in <e id=\"sample-file\">the sample file</e>." },
      { kind: "prose", body: "Replace this with validation rules, invariants, or ownership boundaries." }
    ]
  },
  {
    n: "05",
    id: "source-references",
    title: "Source References",
    kind: "Custom",
    summary: "Stub: replace with the files readers should inspect.",
    relatedEntityIds: ["sample-file"],
    sourceRefIds: ["sample-code"],
    children: [{ id: "code-map", title: "Code map" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "code-map", title: "Code map", body: "Replace this with the strongest source landmarks, starting with <e id=\"sample-file\">the sample file</e>." },
      { kind: "prose", body: "Replace this with source-reading advice and line ranges to verify." }
    ]
  }
];
