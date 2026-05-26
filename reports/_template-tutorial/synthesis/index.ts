import type { SynthesisRoot } from "@trellis/engine";

// Shape synthesis with .claude/skills/synthesis/SKILL.md. UI examples: packages/storybook/stories/views/SynthesisView.stories.tsx.
export const synthesis: SynthesisRoot = {
  description: "Replace this with the tutorial's unifying idea.",
  roots: [
    {
      id: "tutorial-synthesis",
      level: 0,
      title: "Replace with the synthesis title",
      summary: "Replace with the cross-section pattern this tutorial teaches.",
      keyTakeaways: ["Replace with the main takeaway."],
      openQuestions: ["Replace with an honest follow-up question."],
      references: [{ kind: "section", id: "synthesis", anchorId: "synthesis-wrap" }]
    }
  ]
};
