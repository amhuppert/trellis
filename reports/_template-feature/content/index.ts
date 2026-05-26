import type { Section } from "@trellis/engine";

// Plan feature reports with .claude/skills/report-composition/SKILL.md.
// Use packages/storybook/stories/blocks/StepByStep.stories.tsx for flows and Callout.stories.tsx for edge-case warnings.
const section = (n: string, id: string, title: string, kind: Section["kind"], body: string): Section => ({
  n,
  id,
  title,
  kind,
  summary: `Stub: replace with authored notes for ${title}.`,
  relatedEntityIds: ["sample-feature"],
  sourceRefIds: ["sample-prd"],
  children: [{ id: `${id}-intro`, title }],
  blocks: [
    { kind: "conceptIntro", anchorId: `${id}-intro`, title, body },
    { kind: "prose", body: "Replace this with the specific implementation, evidence, and reader-facing implication." }
  ]
});

export const sections: Section[] = [
  section("01", "feature-summary", "Feature Summary", "Concept", "Replace this with the summary of <e id=\"sample-feature\">the sample feature</e>."),
  section("02", "user-behavior", "User Behavior", "Concept", "Replace this with what the user can do with <e id=\"sample-feature\">the sample feature</e>."),
  section("03", "frontend-flow", "Frontend Flow", "Mechanism", "Replace this with the UI path that presents <e id=\"sample-feature\">the sample feature</e>."),
  section("04", "backend-flow", "Backend Flow", "Mechanism", "Replace this with the server path that executes <e id=\"sample-feature\">the sample feature</e>."),
  section("05", "data-model", "Data Model", "Mechanism", "Replace this with the data structures backing <e id=\"sample-feature\">the sample feature</e>."),
  {
    ...section("06", "state-transitions", "State Transitions", "Mechanism", "Replace this with how <e id=\"sample-state\">the sample state</e> changes."),
    relatedEntityIds: ["sample-feature", "sample-state"]
  },
  section("07", "edge-cases", "Edge Cases", "Advanced", "Replace this with limits, failures, and recovery behavior for <e id=\"sample-feature\">the sample feature</e>."),
  section("08", "extension-points", "Extension Points", "Custom", "Replace this with future changes that <e id=\"sample-feature\">the sample feature</e> should allow.")
];
