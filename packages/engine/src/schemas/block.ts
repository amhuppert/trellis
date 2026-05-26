import { z } from "zod";

const anchorId = z
  .string()
  .describe("Optional stable in-section anchor id for deep links, outline nodes, and validation. Use lowercase-kebab-case.")
  .optional();

export const InlineProseStringSchema = z.string().describe(
  "Trellis inline prose. Supports only the inline dialect <e id=\"...\">entity label</e>, <em>emphasis</em>, and <code>code</code>; it is not Markdown or HTML. Keep entity ids exact and close tags so the renderer and validator can resolve references."
);

const StepSchema = z.object({
  title: z
    .string()
    .describe("Short step title shown as the scan label. Keep it imperative or noun-like, not a full paragraph."),
  body: InlineProseStringSchema.describe("Inline prose explaining this step. Use <e id=\"...\"> only for known entity ids.")
});

export const BlockSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("conceptIntro").describe("Block discriminator for the opening explanation of a concept."),
    anchorId,
    title: z.string().describe("Human-readable concept title. Keep it specific to this section's main idea."),
    body: InlineProseStringSchema.describe("Introductory inline prose for the concept. Avoid Markdown.")
  }),
  z.object({
    kind: z.literal("mentalModel").describe("Block discriminator for a memorable model or analogy."),
    anchorId,
    title: z.string().describe("Compact title for the mental model. Avoid generic labels like 'Mental model'."),
    body: InlineProseStringSchema.describe("Main inline prose for the model. Keep it self-contained."),
    aside: InlineProseStringSchema.describe("Optional supporting note that sharpens the model without adding a new concept.")
      .optional()
  }),
  z.object({
    kind: z.literal("callout").describe("Block discriminator for an emphasized note, warning, aside, or quote."),
    anchorId,
    tone: z
      .enum(["info", "warn", "aside", "quote"])
      .describe("Visual and semantic tone. Use warn only for real risks; quote is reserved for cited phrasing.")
      .default("info"),
    title: z.string().describe("Short callout heading. State the point, not the block type."),
    body: InlineProseStringSchema.describe("Inline prose for the callout. Keep it focused and reference entities exactly.")
  }),
  z.object({
    kind: z.literal("stepByStep").describe("Block discriminator for ordered mechanics or procedures."),
    anchorId,
    title: z.string().describe("Title for the sequence. Use when order matters."),
    steps: z
      .array(StepSchema)
      .describe("Ordered steps. Each step should have a concise title and inline-prose body.")
  }),
  z.object({
    kind: z.literal("keyTakeaways").describe("Block discriminator for a concise summary list."),
    anchorId,
    items: z
      .array(InlineProseStringSchema)
      .describe("Takeaway bullets. Keep each item short and avoid introducing new unresolved entities.")
  }),
  z.object({
    kind: z.literal("misconception").describe("Block discriminator for correcting a common false belief."),
    anchorId,
    claim: InlineProseStringSchema.describe("The incorrect claim as readers might say it. Quote only when useful."),
    truth: InlineProseStringSchema.describe("The correction. Be direct and include entity refs only for known ids.")
  }),
  z.object({
    kind: z.literal("beforeContinue").describe("Block discriminator for a section transition checkpoint."),
    anchorId,
    body: InlineProseStringSchema.describe("Transition prose that tells the reader what should now be clear."),
    nextSectionId: z
      .string()
      .describe("Section id the reader should visit next. Must match an existing section id exactly.")
  }),
  z.object({
    kind: z.literal("heading").describe("Block discriminator for an in-section heading."),
    anchorId,
    level: z
      .union([z.literal(2), z.literal(3)])
      .describe("Heading level inside the section. Use 2 for major turns and 3 for local subsections."),
    text: z.string().describe("Heading text. Keep it descriptive and avoid trailing punctuation.")
  }),
  z.object({
    kind: z.literal("prose").describe("Block discriminator for unadorned reading prose."),
    anchorId,
    body: InlineProseStringSchema.describe("Body prose in the Trellis inline dialect. Do not use Markdown.")
  }),
  z.object({
    kind: z.literal("codeBlock").describe("Block discriminator for source code excerpts."),
    anchorId,
    language: z.string().describe("Syntax language id such as ts, sql, or bash. Match the renderer's highlighter ids."),
    code: z.string().describe("Raw code contents. Do not wrap in Markdown fences."),
    title: z.string().describe("Optional code block title shown above the excerpt.").optional(),
    sourceRefId: z
      .string()
      .describe("Optional source id for the code excerpt. Must match a code or URL source when provided.")
      .optional()
  }),
  z.object({
    kind: z.literal("figure").describe("Block discriminator for an image or diagram asset."),
    anchorId,
    src: z.string().describe("Image source path or URL. Prefer report-local assets for generated figures."),
    alt: z.string().describe("Accessible alt text describing the useful content of the figure."),
    caption: InlineProseStringSchema.describe("Optional caption in the Trellis inline dialect.").optional(),
    sourceRefId: z
      .string()
      .describe("Optional source id backing the figure. Must match a source when provided.")
      .optional()
  }),
  z.object({
    kind: z.literal("comparisonTable").describe("Block discriminator for a compact comparison table."),
    anchorId,
    title: z.string().describe("Optional table title. Use only when the surrounding prose does not introduce it.")
      .optional(),
    columns: z
      .array(z.string().describe("Column heading. Keep labels short enough for mobile."))
      .describe("Ordered column headings for the comparison table."),
    rows: z
      .array(z.array(InlineProseStringSchema))
      .describe("Rows of inline-prose cells. Keep each row the same length as columns.")
  }),
  z.object({
    kind: z.literal("custom").describe("Block discriminator for a report-local React component."),
    anchorId,
    componentName: z
      .string()
      .describe("PascalCase component name. Must have a matching custom component file and manifest entry."),
    props: z
      .record(z.unknown())
      .describe("JSON-serializable props passed to the custom component. Keep data explicit and portable.")
      .default({})
  })
]);
