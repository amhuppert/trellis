import type { Section } from "@trellis/engine";

// Start with standard blocks. Add custom components only after reading .claude/skills/component-library-usage/SKILL.md.
export const sections: Section[] = [
  {
    n: "01",
    id: "placeholder-section",
    title: "Placeholder Section",
    kind: "Custom",
    summary: "Stub: replace with the custom report's first section.",
    children: [{ id: "placeholder-intro", title: "Placeholder intro" }],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "placeholder-intro",
        title: "Placeholder intro",
        body: "Replace this with the custom report's opening explanation."
      }
    ]
  }
];
