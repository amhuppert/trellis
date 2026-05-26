import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "trellis-engine-architecture",
  title: "Trellis Engine Architecture",
  subtitle:
    "A codebase report on how Trellis turns typed report directories into a validated, interactive Astro reader.",
  audience: "Engineers extending the Trellis engine, renderer, validation rules, or report authoring layer.",
  readTime: "approx. 28 min",
  builtAt: "2026-05-25T00:00:00.000Z",
  template: "codebase",
  orientation: {
    heroSummary:
      "Trellis is split between structured report source, a validation and component engine, and an Astro app that renders the selected report through a five-mode reader shell.",
    whatYoullLearn: [
      "How report directories, the engine package, and the Astro app divide responsibility.",
      "How Zod schemas and validation rules protect structured report data before render.",
      "How AppShell coordinates Orientation, Guided, Reference, Synthesis, and Graph modes.",
      "How the knowledge graph is converted into React Flow nodes and edges."
    ],
    recommendedPath: ["architecture-overview", "schemas-validation", "reader-shell-modes", "knowledge-graph-runtime"],
    keyEntityIds: ["app-shell", "block-schema", "validate-cli", "graph-view"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "architecture-overview" },
      { label: "Open reference", mode: "reference", targetId: "app-shell" },
      { label: "Open graph", mode: "graph" },
      { label: "Open synthesis", mode: "synthesis", targetId: "architecture-loop" }
    ]
  },
  sections,
  kg,
  synthesis,
  sources,
  customComponents: []
};

export default reportConfig;
