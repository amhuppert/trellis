import type { KnowledgeGraph } from "@trellis/engine";

export const kg: KnowledgeGraph = {
  entities: [
    { id: "decision-criteria", name: "Decision criteria", type: "concept", shortDef: "Replace with the criteria that govern the decision.", primarySectionId: "criteria", references: [{ kind: "source", id: "sample-decision-source" }] },
    { id: "option-a", name: "Option A", type: "pattern", shortDef: "Replace with the first option.", primarySectionId: "comparison-matrix" },
    { id: "option-b", name: "Option B", type: "pattern", shortDef: "Replace with the second option.", primarySectionId: "comparison-matrix" }
  ],
  relationships: [
    { id: "rel-option-a-decision-criteria-evaluated-by", from: "option-a", to: "decision-criteria", type: "evaluated-by", strength: "strong" },
    { id: "rel-option-b-decision-criteria-evaluated-by", from: "option-b", to: "decision-criteria", type: "evaluated-by", strength: "strong" }
  ]
};
