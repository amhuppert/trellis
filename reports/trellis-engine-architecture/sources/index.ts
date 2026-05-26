import type { SourceReference } from "@trellis/engine";

export const sources: SourceReference[] = [
  { id: "app-shell-source", kind: "code", title: "AppShell reader state and mode selection", path: "packages/engine/src/components/shell/AppShell.tsx", lineRange: [1, 225] },
  { id: "nav-panel-source", kind: "code", title: "NavPanel sections, synthesis, and jump navigation", path: "packages/engine/src/components/chrome/NavPanel.tsx", lineRange: [110, 224] },
  { id: "guided-view-source", kind: "code", title: "GuidedView section and block rendering", path: "packages/engine/src/components/views/GuidedView.tsx", lineRange: [27, 176] },
  { id: "reference-view-source", kind: "code", title: "ReferenceView entities and sources", path: "packages/engine/src/components/views/ReferenceView.tsx", lineRange: [21, 119] },
  { id: "graph-view-source", kind: "code", title: "GraphView toolbar and graph canvas coordination", path: "packages/engine/src/components/graph/GraphView.tsx", lineRange: [21, 140] },
  { id: "kg-graph-data-source", kind: "code", title: "KG to React Flow graph data", path: "packages/engine/src/kg/graph-data.ts", lineRange: [8, 88] },
  { id: "report-config-schema", kind: "code", title: "ReportConfigSchema", path: "packages/engine/src/schemas/report-config.ts", lineRange: [14, 40] },
  { id: "block-schema-source", kind: "code", title: "BlockSchema discriminated union", path: "packages/engine/src/schemas/block.ts", lineRange: [19, 130] },
  { id: "kg-schema-source", kind: "code", title: "Entity and relationship schemas", path: "packages/engine/src/schemas/kg.ts", lineRange: [24, 66] },
  { id: "validation-source", kind: "code", title: "validateReport reference rules", path: "packages/engine/src/validation/validate.ts", lineRange: [22, 59] },
  { id: "validate-cli-source", kind: "code", title: "validate CLI main function", path: "packages/engine/src/cli/validate.ts", lineRange: [34, 77] },
  { id: "astro-report-loader", kind: "code", title: "Astro selected report loader", path: "packages/astro-app/src/report-loader.ts", lineRange: [4, 14] },
  { id: "astro-index-page", kind: "code", title: "Astro page mounting AppShell", path: "packages/astro-app/src/pages/index.astro", lineRange: [1, 10] }
];
