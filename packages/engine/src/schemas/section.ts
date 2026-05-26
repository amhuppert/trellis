import { z } from "zod";
import { BlockSchema } from "./block";

export const SectionKindSchema = z
  .enum(["Concept", "Mechanism", "Maintenance", "Contract", "Advanced", "Custom"])
  .describe("Section category used for navigation labels and report structure.");

type OutlineNodeValue = {
  id: string;
  title: string;
  children: OutlineNodeValue[];
};

type OutlineNodeInput = {
  id: string;
  title: string;
  children?: OutlineNodeInput[];
};

export const OutlineNodeSchema: z.ZodType<OutlineNodeValue, z.ZodTypeDef, OutlineNodeInput> = z.object({
  id: z
    .string()
    .describe("Outline anchor id. Must correspond to a block anchorId in this same section, not another section."),
  title: z.string().describe("Navigation label for the outline node. Keep it shorter than the block title when possible."),
  children: z
    .array(z.lazy(() => OutlineNodeSchema))
    .describe("Nested outline anchors in the same section. Every child id must also match a block anchorId.")
    .default([])
});

export const SectionSchema = z.object({
  id: z.string().describe("Stable section id used in routes, references, and validation. Use lowercase-kebab-case."),
  n: z.string().describe("Optional display number such as 01. Do not use it as a reference id.").optional(),
  title: z.string().describe("Reader-facing section title. Keep it specific and scannable."),
  kind: SectionKindSchema.default("Concept"),
  blurb: z.string().describe("Optional short navigation blurb for this section.").optional(),
  summary: z.string().describe("Optional section summary used in orientation and right rail contexts.").optional(),
  time: z.string().describe("Optional human reading time such as 5m.").optional(),
  blocks: z.array(BlockSchema).describe("Ordered guided-reading blocks in this section.").default([]),
  children: z
    .array(OutlineNodeSchema)
    .describe("Outline nodes for this section. These are anchors, not nested routed sections.")
    .default([]),
  relatedSectionIds: z
    .array(z.string().describe("Related section id. Must match an existing section."))
    .describe("Section ids shown as related reading.")
    .default([]),
  relatedEntityIds: z
    .array(z.string().describe("Related entity id. Must match the knowledge graph."))
    .describe("Entity ids shown in the section right rail.")
    .default([]),
  sourceRefIds: z
    .array(z.string().describe("Source id used by this section. Must match a source reference."))
    .describe("Sources cited or used by this section.")
    .default([])
});
