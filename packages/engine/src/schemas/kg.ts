import { z } from "zod";
import { InlineProseStringSchema } from "./block";
import { ReferenceSchema } from "./synthesis";

export const EntityTypeSchema = z
  .enum([
    "concept",
    "pattern",
    "feature",
    "file",
    "module",
    "function",
    "type",
    "component",
    "library",
    "paper",
    "person",
    "api",
    "workflow",
    "other"
  ])
  .describe("Entity category used for graph styling and filtering. Prefer the most specific stable type.");

export const EntitySchema = z.object({
  id: z.string().describe("Stable entity id used by InlineProse <e id=\"...\"> refs and graph edges. Use lowercase-kebab-case."),
  name: z.string().describe("Display name for the entity. Preserve domain capitalization such as MVCC or SSI."),
  aliases: z
    .array(z.string().describe("Alternate spelling or abbreviation readers may search for."))
    .describe("Search aliases for the entity.")
    .default([]),
  type: EntityTypeSchema,
  shortDef: z
    .string()
    .describe("Hover-card definition. Keep it short, concrete, and useful without opening the reference view."),
  description: InlineProseStringSchema.describe("Optional longer reference description in the Trellis inline dialect.").optional(),
  references: z
    .array(ReferenceSchema)
    .describe("Sections, entities, or sources that substantiate this entity.")
    .default([]),
  primarySectionId: z
    .string()
    .describe("Optional primary section where this entity is taught first. Must match an existing section.")
    .optional()
});

export const RelationshipSchema = z.object({
  id: z.string().describe("Stable relationship id. Use a deterministic id such as rel-from-to-type."),
  from: z.string().describe("Source entity id for the directed relationship. Must match an entity."),
  to: z.string().describe("Target entity id for the directed relationship. Must match an entity."),
  type: z.string().describe("Machine-readable relationship type such as depends-on or uses. Keep lowercase-kebab-case."),
  label: z.string().describe("Optional human label shown when the relationship type needs clarification.").optional(),
  strength: z
    .enum(["weak", "medium", "strong"])
    .describe("Graph edge strength. Use strong only for essential conceptual dependencies.")
    .default("medium"),
  description: z.string().describe("Optional short explanation of why this relationship exists.").optional(),
  sourceRefIds: z
    .array(z.string().describe("Source id supporting this relationship. Must match a source reference."))
    .describe("Evidence sources for the edge.")
    .default([])
});

export const KnowledgeGraphSchema = z.object({
  entities: z.array(EntitySchema).describe("Entity nodes available to InlineProse and graph views.").default([]),
  relationships: z.array(RelationshipSchema).describe("Directed graph edges between entities.").default([])
});
