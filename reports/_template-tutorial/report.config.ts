import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "template-tutorial",
  title: "Tutorial Report Template",
  subtitle: "Replace this with the tutorial's specific promise and scope.",
  audience: "Replace this with the intended reader.",
  readTime: "approx. 20 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "tutorial",
  orientation: {
    heroSummary: "Replace this with a short tutorial orientation that names the topic and the reader outcome.",
    whatYoullLearn: ["Replace with the first learning outcome.", "Replace with the second learning outcome.", "Replace with the third learning outcome."],
    recommendedPath: ["foundations", "mechanisms", "examples", "synthesis"],
    keyEntityIds: ["sample-topic"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "foundations" },
      { label: "Open reference", mode: "reference", targetId: "sample-topic" },
      { label: "Open graph", mode: "graph" },
      { label: "Open synthesis", mode: "synthesis", targetId: "tutorial-synthesis" }
    ]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
