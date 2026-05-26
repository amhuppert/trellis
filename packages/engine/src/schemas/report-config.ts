import { z } from "zod";
import { CustomManifestSchema } from "./custom-manifest";
import { KnowledgeGraphSchema } from "./kg";
import { OrientationSchema } from "./orientation";
import { SectionSchema } from "./section";
import { SourceReferenceSchema } from "./source";
import { SynthesisRootSchema } from "./synthesis";

export const AuthorSchema = z.object({
  name: z.string().describe("Author display name. Use the human or agent name the reader should see."),
  role: z.string().describe("Short byline role such as Authored by or Reviewed by.")
});

export const ReportConfigSchema = z.object({
  id: z
    .string()
    .describe("Stable report id used for storage keys, output paths, and URL state. Use lowercase-kebab-case."),
  title: z.string().describe("Reader-facing report title. Keep it literal and specific."),
  subtitle: z.string().describe("Optional subtitle that explains the report's scope and promise.").optional(),
  audience: z.string().describe("Optional audience statement so agents can tune depth and vocabulary.").optional(),
  readTime: z.string().describe("Optional human-readable total reading time, such as approx. 45 min.").optional(),
  builtAt: z.string().datetime().describe("Optional ISO datetime for when this report was built.").optional(),
  template: z
    .enum(["tutorial", "codebase", "feature", "comparison", "custom"])
    .describe("Report template controlling layout defaults and expected content shape."),
  authors: z
    .array(AuthorSchema)
    .describe("Report byline authors. Defaults to Claude when omitted.")
    .default([{ name: "Claude", role: "Authored by" }]),
  orientation: OrientationSchema.describe("Orientation-view content and navigation shortcuts."),
  sections: z.array(SectionSchema).describe("Top-level guided reading sections in display order."),
  synthesis: SynthesisRootSchema.describe("Optional synthesis hierarchy for cross-section understanding.").optional(),
  kg: KnowledgeGraphSchema.describe("Optional knowledge graph entities and relationships.").optional(),
  sources: z.array(SourceReferenceSchema).describe("Source references available to sections, blocks, and synthesis.")
    .default([]),
  customComponents: z
    .array(CustomManifestSchema)
    .describe("Manifest entries for report-local custom React components.")
    .default([])
});
