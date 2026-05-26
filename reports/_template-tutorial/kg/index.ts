import type { KnowledgeGraph } from "@trellis/engine";

// Model entities with .claude/skills/entity-modeling/SKILL.md. Validate refs against packages/engine/src/schemas/kg.ts.
export const kg: KnowledgeGraph = {
  entities: [
    {
      id: "sample-topic",
      name: "Sample topic",
      type: "concept",
      shortDef: "Replace with the central concept taught by this tutorial.",
      primarySectionId: "foundations",
      references: [{ kind: "source", id: "sample-source" }]
    }
  ],
  relationships: []
};
