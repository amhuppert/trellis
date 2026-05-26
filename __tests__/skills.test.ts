import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const skillNames = [
  "report-composition",
  "component-library-usage",
  "research-and-analysis",
  "teaching-tone",
  "teaching-order",
  "synthesis",
  "entity-modeling",
  "visualization-guidelines"
];

const parseFrontmatter = (body: string) => {
  const match = body.match(/^---\n([\s\S]+?)\n---/);
  if (!match) throw new Error("Missing YAML frontmatter");

  const frontmatter = match[1];
  return {
    name: frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim(),
    description: frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim(),
    triggers: frontmatter.match(/^triggers:\s*\[(.+)\]$/m)?.[1]?.trim()
  };
};

describe("Claude Code skills", () => {
  it.each(skillNames)("%s has required frontmatter", async (skillName) => {
    const file = await readFile(resolve(process.cwd(), ".claude", "skills", skillName, "SKILL.md"), "utf8");
    const frontmatter = parseFrontmatter(file);

    expect(frontmatter.name).toBe(skillName);
    expect(frontmatter.description).toBeTruthy();
    expect(frontmatter.triggers).toContain('"');
  });
});
