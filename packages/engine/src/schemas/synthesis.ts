import { z } from "zod";
import { InlineProseStringSchema } from "./block";

export const ReferenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("section").describe("Reference discriminator for a guided section or anchor."),
    id: z.string().describe("Target section id. Must match an existing section."),
    anchorId: z
      .string()
      .describe("Optional block anchor id inside the target section. Must exist when provided.")
      .optional()
  }),
  z.object({
    kind: z.literal("entity").describe("Reference discriminator for a knowledge graph entity."),
    id: z.string().describe("Target entity id. Must match the knowledge graph.")
  }),
  z.object({
    kind: z.literal("source").describe("Reference discriminator for a source reference."),
    id: z.string().describe("Target source id. Must match a source reference.")
  })
]);

type SynthesisNodeValue = {
  id: string;
  level: number;
  title: string;
  summary: string;
  detail?: string;
  commonStructure?: string;
  contrast?: string;
  keyTakeaways: string[];
  openQuestions: string[];
  references: z.infer<typeof ReferenceSchema>[];
  children: SynthesisNodeValue[];
};

type SynthesisNodeInput = {
  id: string;
  level: number;
  title: string;
  summary: string;
  detail?: string;
  commonStructure?: string;
  contrast?: string;
  keyTakeaways?: string[];
  openQuestions?: string[];
  references?: z.input<typeof ReferenceSchema>[];
  children?: SynthesisNodeInput[];
};

export const SynthesisNodeSchema: z.ZodType<SynthesisNodeValue, z.ZodTypeDef, SynthesisNodeInput> = z.object({
  id: z.string().describe("Stable synthesis node id used for navigation and references. Use lowercase-kebab-case."),
  level: z.number().int().min(0).describe("Depth in the synthesis hierarchy. Root nodes are level 0."),
  title: z.string().describe("Node title shown in synthesis navigation. Keep it conceptual and concise."),
  summary: z.string().describe("Short summary of the pattern this node captures. Avoid duplicating section prose."),
  detail: InlineProseStringSchema.describe("Optional deeper explanation in the Trellis inline dialect.").optional(),
  commonStructure: z.string().describe("Optional note explaining what child nodes have in common.").optional(),
  contrast: z.string().describe("Optional note explaining how child nodes differ.").optional(),
  keyTakeaways: z
    .array(z.string().describe("Synthesis-level takeaway. Keep it brief and non-duplicative."))
    .describe("Lessons the reader should retain from this synthesis node.")
    .default([]),
  openQuestions: z
    .array(z.string().describe("Honest unresolved question or tradeoff raised by this node."))
    .describe("Questions that remain open after synthesis.")
    .default([]),
  references: z
    .array(ReferenceSchema)
    .describe("Backlinks to sections, entities, and sources that support this synthesis node.")
    .default([]),
  children: z
    .array(z.lazy(() => SynthesisNodeSchema))
    .describe("Nested synthesis nodes. Keep levels consistent with depth.")
    .default([])
});

export const SynthesisRootSchema = z.object({
  description: z
    .string()
    .describe("Optional framing sentence for the synthesis tree. Explain the unifying idea.")
    .optional(),
  roots: z.array(SynthesisNodeSchema).describe("Top-level synthesis nodes.")
});
