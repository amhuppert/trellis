import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "template-comparison",
  title: "Comparison Report Template",
  subtitle: "Replace this with the decision, options, and recommendation scope.",
  audience: "Decision makers and implementers.",
  readTime: "approx. 20 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "comparison",
  orientation: {
    heroSummary: "Replace this with the decision context and the comparison's practical outcome.",
    whatYoullLearn: ["What decision is being made.", "Which criteria matter.", "Why one option is recommended."],
    recommendedPath: ["decision-context", "criteria", "comparison-matrix", "tradeoffs", "recommendation"],
    keyEntityIds: ["option-a", "option-b", "decision-criteria"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "decision-context" },
      { label: "Open reference", mode: "reference", targetId: "decision-criteria" },
      { label: "Open graph", mode: "graph" },
      { label: "Open synthesis", mode: "synthesis", targetId: "comparison-synthesis" }
    ]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
