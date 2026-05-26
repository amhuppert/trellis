import type { SourceReference } from "@trellis/engine";

// Gather evidence with .claude/skills/research-and-analysis/SKILL.md. Source schema: packages/engine/src/schemas/source.ts.
export const sources: SourceReference[] = [
  {
    id: "sample-source",
    kind: "doc",
    title: "Replace with a source title",
    host: "Replace with publisher or repository",
    locationHint: "Replace with chapter, section, or file hint"
  }
];
