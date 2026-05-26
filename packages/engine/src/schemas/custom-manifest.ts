import { z } from "zod";

export const CustomManifestSchema = z.object({
  name: z.string().describe("PascalCase component name. Must match custom block componentName and custom/<name>.tsx."),
  purpose: z.string().describe("What the custom component communicates that standard blocks cannot."),
  justification: z.string().describe("Why this report needs custom UI instead of an existing block kind."),
  usedIn: z
    .array(z.string().describe("Section id, anchor id, or block id where the component appears."))
    .describe("Locations that use the custom component.")
});
