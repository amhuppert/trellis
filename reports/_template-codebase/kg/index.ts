import type { KnowledgeGraph } from "@trellis/engine";

// Entity types for codebase reports include file, module, component, function, type, api, workflow, and library.
export const kg: KnowledgeGraph = {
  entities: [
    { id: "sample-module", name: "Sample module", type: "module", shortDef: "Replace with the module's responsibility.", primarySectionId: "architecture-overview", references: [{ kind: "source", id: "sample-code" }] },
    { id: "sample-component", name: "Sample component", type: "component", shortDef: "Replace with the UI or runtime component role.", primarySectionId: "architecture-overview" },
    { id: "sample-file", name: "sample/file.ts", type: "file", shortDef: "Replace with a real repository path.", primarySectionId: "source-references", references: [{ kind: "source", id: "sample-code" }] }
  ],
  relationships: [
    { id: "rel-sample-component-sample-module-uses", from: "sample-component", to: "sample-module", type: "uses", strength: "medium", sourceRefIds: ["sample-code"] },
    { id: "rel-sample-module-sample-file-defined-in", from: "sample-module", to: "sample-file", type: "defined-in", strength: "strong", sourceRefIds: ["sample-code"] }
  ]
};
