import type { KnowledgeGraph } from "@trellis/engine";

export const kg: KnowledgeGraph = {
  entities: [
    {
      id: "trellis-engine",
      name: "@trellis/engine",
      type: "module",
      shortDef: "Workspace package that owns schemas, validation, reader components, graph helpers, and design tokens.",
      primarySectionId: "architecture-overview",
      references: [{ kind: "source", id: "report-config-schema" }]
    },
    {
      id: "astro-app",
      name: "@trellis/astro-app",
      type: "module",
      shortDef: "Astro package that loads the selected report and mounts the Trellis reader shell.",
      primarySectionId: "architecture-overview",
      references: [{ kind: "source", id: "astro-index-page" }, { kind: "source", id: "astro-report-loader" }]
    },
    {
      id: "report-config",
      name: "ReportConfig",
      type: "type",
      shortDef: "The root report data contract consumed by validation, Astro, and AppShell.",
      primarySectionId: "architecture-overview",
      references: [{ kind: "source", id: "report-config-schema" }]
    },
    {
      id: "app-shell",
      name: "AppShell",
      type: "component",
      shortDef: "The persistent reader shell that owns mode state, navigation callbacks, and active view selection.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "app-shell-source" }]
    },
    {
      id: "nav-panel",
      name: "NavPanel",
      type: "component",
      shortDef: "Persistent navigation panel for sections, synthesis, and mode jumps.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "nav-panel-source" }]
    },
    {
      id: "orientation-view",
      name: "OrientationView",
      type: "component",
      shortDef: "The opening mode that frames the report, path, key entities, and jumps.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "app-shell-source" }]
    },
    {
      id: "guided-view",
      name: "GuidedView",
      type: "component",
      shortDef: "The main reading mode that renders sections, blocks, anchors, and section pagination.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "guided-view-source" }]
    },
    {
      id: "reference-view",
      name: "ReferenceView",
      type: "component",
      shortDef: "The glossary and source mode for entities, source cards, and entity detail panels.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "reference-view-source" }]
    },
    {
      id: "synthesis-view",
      name: "SynthesisView",
      type: "component",
      shortDef: "The mode for cross-section synthesis nodes and takeaways.",
      primarySectionId: "reader-shell-modes",
      references: [{ kind: "source", id: "app-shell-source" }]
    },
    {
      id: "graph-view",
      name: "GraphView",
      type: "component",
      shortDef: "The graph mode that coordinates toolbar filters, graph mode, and canvas rendering.",
      primarySectionId: "knowledge-graph-runtime",
      references: [{ kind: "source", id: "graph-view-source" }]
    },
    {
      id: "block-schema",
      name: "BlockSchema",
      type: "type",
      shortDef: "Discriminated Zod union for guided-reading block kinds.",
      primarySectionId: "schemas-validation",
      references: [{ kind: "source", id: "block-schema-source" }]
    },
    {
      id: "entity-schema",
      name: "EntitySchema",
      type: "type",
      shortDef: "Zod schema for knowledge graph entity nodes and reference metadata.",
      primarySectionId: "schemas-validation",
      references: [{ kind: "source", id: "kg-schema-source" }]
    },
    {
      id: "validate-cli",
      name: "validate CLI",
      type: "workflow",
      shortDef: "Command-line validation path that loads a report and prints errors or warnings.",
      primarySectionId: "schemas-validation",
      references: [{ kind: "source", id: "validate-cli-source" }, { kind: "source", id: "validation-source" }]
    },
    {
      id: "report-loader",
      name: "report loader",
      type: "function",
      shortDef: "Loader that resolves a report directory and imports its report.config.ts module.",
      primarySectionId: "schemas-validation",
      references: [{ kind: "source", id: "astro-report-loader" }]
    },
    {
      id: "kg-helpers",
      name: "KG helpers",
      type: "module",
      shortDef: "Graph helper functions that convert KG entities and relationships into React Flow data.",
      primarySectionId: "knowledge-graph-runtime",
      references: [{ kind: "source", id: "kg-graph-data-source" }]
    },
    {
      id: "react-flow",
      name: "React Flow",
      type: "library",
      shortDef: "The graph rendering library used by the Trellis graph canvas.",
      primarySectionId: "knowledge-graph-runtime",
      references: [{ kind: "source", id: "graph-view-source" }]
    }
  ],
  relationships: [
    { id: "rel-astro-app-report-loader-uses", from: "astro-app", to: "report-loader", type: "uses", strength: "strong", sourceRefIds: ["astro-report-loader"] },
    { id: "rel-astro-app-app-shell-renders", from: "astro-app", to: "app-shell", type: "renders", strength: "strong", sourceRefIds: ["astro-index-page"] },
    { id: "rel-app-shell-nav-panel-renders", from: "app-shell", to: "nav-panel", type: "renders", strength: "strong", sourceRefIds: ["app-shell-source", "nav-panel-source"] },
    { id: "rel-app-shell-guided-view-renders", from: "app-shell", to: "guided-view", type: "renders", strength: "strong", sourceRefIds: ["app-shell-source"] },
    { id: "rel-app-shell-reference-view-renders", from: "app-shell", to: "reference-view", type: "renders", strength: "strong", sourceRefIds: ["app-shell-source"] },
    { id: "rel-app-shell-graph-view-renders", from: "app-shell", to: "graph-view", type: "renders", strength: "strong", sourceRefIds: ["app-shell-source"] },
    { id: "rel-report-config-block-schema-contains", from: "report-config", to: "block-schema", type: "contains", strength: "strong", sourceRefIds: ["report-config-schema", "block-schema-source"] },
    { id: "rel-report-config-entity-schema-contains", from: "report-config", to: "entity-schema", type: "contains", strength: "strong", sourceRefIds: ["report-config-schema", "kg-schema-source"] },
    { id: "rel-validate-cli-report-config-validates", from: "validate-cli", to: "report-config", type: "validates", strength: "strong", sourceRefIds: ["validation-source", "validate-cli-source"] },
    { id: "rel-graph-view-react-flow-uses", from: "graph-view", to: "react-flow", type: "uses", strength: "strong", sourceRefIds: ["graph-view-source"] },
    { id: "rel-graph-view-kg-helpers-uses", from: "graph-view", to: "kg-helpers", type: "uses", strength: "medium", sourceRefIds: ["graph-view-source", "kg-graph-data-source"] },
    { id: "rel-kg-helpers-entity-schema-projects", from: "kg-helpers", to: "entity-schema", type: "projects", strength: "medium", sourceRefIds: ["kg-graph-data-source", "kg-schema-source"] }
  ]
};
