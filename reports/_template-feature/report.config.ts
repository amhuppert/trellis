import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "template-feature",
  title: "Feature Report Template",
  subtitle: "Replace this with the feature and why it matters to users and implementers.",
  audience: "Product engineers and reviewers.",
  readTime: "approx. 30 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "feature",
  orientation: {
    heroSummary: "Replace this with the feature's behavior, implementation scope, and reader outcome.",
    whatYoullLearn: ["What the feature does for users.", "How frontend and backend flows connect.", "Where state, edge cases, and extension points live."],
    recommendedPath: ["feature-summary", "user-behavior", "frontend-flow", "backend-flow", "data-model", "state-transitions", "edge-cases", "extension-points"],
    keyEntityIds: ["sample-feature", "sample-state"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "feature-summary" },
      { label: "Open reference", mode: "reference", targetId: "sample-feature" },
      { label: "Open graph", mode: "graph" },
      { label: "Open synthesis", mode: "synthesis", targetId: "feature-synthesis" }
    ]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
