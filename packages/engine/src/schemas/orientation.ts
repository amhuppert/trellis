import { z } from "zod";

const JumpTargetSchema = z.object({
  label: z.string().describe("Short label for an orientation jump target. Keep it action-oriented and scannable."),
  mode: z
    .enum(["orientation", "guided", "reference", "synthesis", "graph"])
    .describe("Reader mode to open when the jump target is selected."),
  targetId: z
    .string()
    .describe("Optional section, entity, synthesis, or graph target id interpreted by the selected mode.")
    .optional()
});

export const OrientationSchema = z.object({
  heroSummary: z
    .string()
    .describe("Concise report summary for the orientation hero. State what the reader will understand, not marketing copy."),
  whatYoullLearn: z
    .array(z.string().describe("Concrete learning outcome. Avoid vague promises."))
    .describe("Bullets shown in the orientation 'what you'll learn' card.")
    .default([]),
  recommendedPath: z
    .array(z.string().describe("Section id in the suggested reading order. Must match an existing section id."))
    .describe("Ordered section ids for the recommended guided path.")
    .default([]),
  keyEntityIds: z
    .array(z.string().describe("Entity id to highlight on the orientation view. Must match the knowledge graph."))
    .describe("Important entities worth surfacing before the reader starts.")
    .default([]),
  jumpTargets: z
    .array(JumpTargetSchema)
    .describe("Shortcuts from orientation into key modes and targets.")
    .default([])
});
