import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "template-custom",
  title: "Custom Report Template",
  subtitle: "Replace this when standard templates do not fit the report.",
  audience: "Replace with the intended reader.",
  readTime: "approx. 10 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "custom",
  orientation: {
    heroSummary: "Replace this with the custom report's purpose and reading path.",
    whatYoullLearn: ["Replace with the first reader outcome."],
    recommendedPath: ["placeholder-section"],
    keyEntityIds: [],
    jumpTargets: [{ label: "Start guided", mode: "guided", targetId: "placeholder-section" }]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
