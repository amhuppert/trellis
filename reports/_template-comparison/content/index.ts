import type { Section } from "@trellis/engine";

// Use .claude/skills/visualization-guidelines/SKILL.md before adding charts. The comparisonTable block is documented in packages/storybook/stories/blocks/BlockRenderer.stories.tsx.
export const sections: Section[] = [
  {
    n: "01",
    id: "decision-context",
    title: "Decision Context",
    kind: "Concept",
    summary: "Stub: replace with the decision and constraints.",
    relatedEntityIds: ["decision-criteria"],
    sourceRefIds: ["sample-decision-source"],
    children: [{ id: "decision-frame", title: "Decision frame" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "decision-frame", title: "Decision frame", body: "Replace this with the decision being evaluated by <e id=\"decision-criteria\">the criteria</e>." },
      { kind: "prose", body: "Replace this with constraints, non-goals, and who is affected." }
    ]
  },
  {
    n: "02",
    id: "criteria",
    title: "Criteria",
    kind: "Concept",
    summary: "Stub: replace with evaluation criteria.",
    relatedEntityIds: ["decision-criteria"],
    sourceRefIds: ["sample-decision-source"],
    children: [{ id: "criteria-list", title: "Evaluation criteria" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "criteria-list", title: "Evaluation criteria", body: "Replace this with why <e id=\"decision-criteria\">the criteria</e> are the right comparison lens." },
      { kind: "prose", body: "Replace this with weighting, thresholds, or must-have conditions." }
    ]
  },
  {
    n: "03",
    id: "comparison-matrix",
    title: "Comparison Matrix",
    kind: "Mechanism",
    summary: "Stub: replace with the option-by-criterion matrix.",
    relatedEntityIds: ["option-a", "option-b", "decision-criteria"],
    sourceRefIds: ["sample-decision-source"],
    children: [{ id: "matrix", title: "Matrix" }],
    blocks: [
      {
        kind: "comparisonTable",
        anchorId: "matrix",
        title: "Options by criterion",
        columns: ["Criterion", "Option A", "Option B"],
        rows: [
          ["Replace criterion one.", "<e id=\"option-a\">Option A</e> placeholder.", "<e id=\"option-b\">Option B</e> placeholder."],
          ["Replace criterion two.", "Replace with option A evidence.", "Replace with option B evidence."]
        ]
      }
    ]
  },
  {
    n: "04",
    id: "tradeoffs",
    title: "Tradeoffs",
    kind: "Advanced",
    summary: "Stub: replace with tradeoffs.",
    relatedEntityIds: ["option-a", "option-b"],
    sourceRefIds: ["sample-decision-source"],
    children: [{ id: "tradeoff-summary", title: "Tradeoff summary" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "tradeoff-summary", title: "Tradeoff summary", body: "Replace this with the cost difference between <e id=\"option-a\">Option A</e> and <e id=\"option-b\">Option B</e>." },
      { kind: "prose", body: "Replace this with second-order risks, migration costs, or operational costs." }
    ]
  },
  {
    n: "05",
    id: "recommendation",
    title: "Recommendation",
    kind: "Custom",
    summary: "Stub: replace with the recommendation.",
    relatedEntityIds: ["option-a", "option-b", "decision-criteria"],
    children: [{ id: "recommended-choice", title: "Recommended choice" }],
    blocks: [
      { kind: "conceptIntro", anchorId: "recommended-choice", title: "Recommended choice", body: "Replace this with the recommended option and how it satisfies <e id=\"decision-criteria\">the criteria</e>." },
      { kind: "prose", body: "Replace this with conditions that would change the recommendation." }
    ]
  }
];
