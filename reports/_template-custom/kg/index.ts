import type { KnowledgeGraph } from "@trellis/engine";

// Empty by default. Add entities only when .claude/skills/entity-modeling/SKILL.md identifies stable concepts.
export const kg: KnowledgeGraph = {
  entities: [],
  relationships: []
};
