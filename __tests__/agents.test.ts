import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const requiredMentions = [
  "AGENTS.md — Authoring Trellis Reports",
  "spec/REQUIREMENTS.md",
  "spec/DESIGN.md",
  "claude-design-handoff/project/Trellis Design System.html",
  "claude-design-handoff/project/Component Library Handoff.html",
  "claude-design-handoff/project/bento/*",
  "pnpm dev <report>",
  "pnpm validate <report>",
  "pnpm build <report>",
  "pnpm scaffold-report <name> --template <template>",
  "pnpm typecheck",
  "pnpm lint",
  "pnpm test",
  "pnpm storybook",
  "packages/engine/src/schemas/",
  "packages/storybook/",
  "reports/postgres-mvcc/",
  ".claude/skills/report-composition/SKILL.md",
  ".claude/skills/visualization-guidelines/SKILL.md",
  "Authoring Workflow"
];

describe("AGENTS.md", () => {
  it("orients report authors to the required Trellis workflow", async () => {
    const body = await readFile(resolve(process.cwd(), "AGENTS.md"), "utf8");

    for (const mention of requiredMentions) {
      expect(body).toContain(mention);
    }
  });
});
