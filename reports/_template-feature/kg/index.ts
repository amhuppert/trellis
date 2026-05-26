import type { KnowledgeGraph } from "@trellis/engine";

// Keep the KG small until the feature behavior and state boundaries are clear.
export const kg: KnowledgeGraph = {
  entities: [
    { id: "sample-feature", name: "Sample feature", type: "feature", shortDef: "Replace with the feature's user-visible capability.", primarySectionId: "feature-summary", references: [{ kind: "source", id: "sample-prd" }] },
    { id: "sample-state", name: "Sample state", type: "concept", shortDef: "Replace with the feature state or lifecycle.", primarySectionId: "state-transitions" }
  ],
  relationships: [
    { id: "rel-sample-feature-sample-state-changes", from: "sample-feature", to: "sample-state", type: "changes", strength: "strong", sourceRefIds: ["sample-prd"] }
  ]
};
