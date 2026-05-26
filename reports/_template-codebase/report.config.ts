import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "template-codebase",
  title: "Codebase Architecture Template",
  subtitle: "Replace this with the codebase, subsystem, and architectural question.",
  audience: "Engineers onboarding to this codebase.",
  readTime: "approx. 25 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "codebase",
  orientation: {
    heroSummary: "Replace this with the architecture map this report provides.",
    whatYoullLearn: ["Where the main runtime boundaries are.", "How the primary flow crosses modules.", "Which files anchor the data model."],
    recommendedPath: ["architecture-overview", "main-flows", "key-modules", "data-model", "source-references"],
    keyEntityIds: ["sample-module", "sample-component", "sample-file"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "architecture-overview" },
      { label: "Open reference", mode: "reference", targetId: "sample-module" },
      { label: "Open graph", mode: "graph" },
      { label: "Open synthesis", mode: "synthesis", targetId: "architecture-shape" }
    ]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
