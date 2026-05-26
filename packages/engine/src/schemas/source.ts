import { z } from "zod";

export const SourceReferenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("url").describe("Source discriminator for a web URL."),
    id: z.string().describe("Stable source id used by sections, blocks, relationships, and synthesis references."),
    title: z.string().describe("Readable title of the URL source."),
    href: z.string().url().describe("Absolute URL. Include the canonical public link, not a local browser URL."),
    host: z.string().describe("Optional host or publisher label shown in source lists.").optional(),
    accessed: z.string().datetime().describe("Optional ISO datetime when the source was accessed.").optional()
  }),
  z.object({
    kind: z.literal("code").describe("Source discriminator for a code excerpt or file."),
    id: z.string().describe("Stable source id used by code blocks and references."),
    title: z.string().describe("Readable title for the code source, usually a file or symbol name."),
    path: z.string().describe("Repository-relative path to the source file."),
    lineRange: z
      .tuple([
        z.number().int().positive().describe("Starting line number, 1-based."),
        z.number().int().positive().describe("Ending line number, 1-based.")
      ])
      .describe("Optional inclusive line range. Keep start <= end.")
      .optional(),
    commit: z.string().describe("Optional commit hash or ref for the code source.").optional(),
    excerpt: z.string().describe("Optional short excerpt. Do not paste a full file.").optional()
  }),
  z.object({
    kind: z.literal("doc").describe("Source discriminator for a document without a canonical URL."),
    id: z.string().describe("Stable source id used by references."),
    title: z.string().describe("Readable document title."),
    host: z.string().describe("Optional publisher, book, or venue label.").optional(),
    locationHint: z.string().describe("Optional chapter, page, section, or other locator.").optional()
  }),
  z.object({
    kind: z.literal("passage").describe("Source discriminator for a passage inside another document source."),
    id: z.string().describe("Stable source id for this passage."),
    title: z.string().describe("Optional passage title.").optional(),
    documentSourceId: z.string().describe("Parent doc/url source id that contains this passage. Must exist."),
    location: z.string().describe("Locator within the parent document, such as page, section, or heading."),
    excerpt: z.string().describe("Optional quoted or summarized excerpt. Keep it concise.").optional()
  })
]);
