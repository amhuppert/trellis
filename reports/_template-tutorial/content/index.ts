import type { Section } from "@trellis/engine";

// Author with .claude/skills/teaching-order/SKILL.md and .claude/skills/teaching-tone/SKILL.md.
// Block examples live in packages/storybook/stories/blocks/ConceptIntro.stories.tsx and Prose rendering is covered by BlockRenderer.stories.tsx.
export const sections: Section[] = [
  {
    n: "01",
    id: "foundations",
    title: "Foundations",
    kind: "Concept",
    time: "4m",
    blurb: "Introduce the topic before explaining mechanics.",
    summary: "Stub: replace with the core concept readers need first.",
    relatedEntityIds: ["sample-topic"],
    sourceRefIds: ["sample-source"],
    children: [{ id: "foundations-intro", title: "Topic in one sentence" }],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "foundations-intro",
        title: "Topic in one sentence",
        body: "Replace this with your tutorial intro for <e id=\"sample-topic\">the sample topic</e>."
      },
      {
        kind: "prose",
        body: "Replace this with the minimum background a reader needs before the mechanism appears."
      }
    ]
  },
  {
    n: "02",
    id: "mechanisms",
    title: "Mechanisms",
    kind: "Mechanism",
    time: "6m",
    blurb: "Explain the moving parts in order.",
    summary: "Stub: replace with how the topic works.",
    relatedEntityIds: ["sample-topic"],
    sourceRefIds: ["sample-source"],
    children: [{ id: "mechanisms-flow", title: "How it works" }],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "mechanisms-flow",
        title: "How it works",
        body: "Replace this with the first mechanism that makes <e id=\"sample-topic\">the sample topic</e> operate."
      },
      {
        kind: "prose",
        body: "Replace this with a second paragraph that links the mechanism back to the foundation."
      }
    ]
  },
  {
    n: "03",
    id: "examples",
    title: "Examples",
    kind: "Concept",
    time: "5m",
    blurb: "Make the mechanism concrete with cases.",
    summary: "Stub: replace with concrete examples.",
    relatedEntityIds: ["sample-topic"],
    sourceRefIds: ["sample-source"],
    children: [{ id: "examples-case", title: "A concrete case" }],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "examples-case",
        title: "A concrete case",
        body: "Replace this with an example that lets the reader test their model of <e id=\"sample-topic\">the sample topic</e>."
      },
      {
        kind: "prose",
        body: "Replace this with a contrasting example or boundary case."
      }
    ]
  },
  {
    n: "04",
    id: "synthesis",
    title: "Synthesis",
    kind: "Custom",
    time: "3m",
    blurb: "Tie the lesson together.",
    summary: "Stub: replace with the tutorial's synthesis.",
    relatedEntityIds: ["sample-topic"],
    children: [{ id: "synthesis-wrap", title: "What to retain" }],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "synthesis-wrap",
        title: "What to retain",
        body: "Replace this with the durable idea the reader should keep about <e id=\"sample-topic\">the sample topic</e>."
      },
      {
        kind: "prose",
        body: "Replace this with the next mental move or practical decision."
      }
    ]
  }
];
