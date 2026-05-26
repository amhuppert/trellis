import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { main } from "../validate";

const writeReport = async (cwd: string, reportId: string, body: string) => {
  const root = join(cwd, "reports", reportId);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, "report.config.ts"), body);
};

describe("validate-report CLI", () => {
  it("returns exit code 0 for valid input", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "trellis-cli-valid-"));
    await writeReport(
      cwd,
      "cli-valid",
      `export default {
        id: "cli-valid",
        title: "CLI Valid",
        template: "tutorial",
        orientation: { heroSummary: "Valid.", recommendedPath: ["intro"], keyEntityIds: ["mvcc"] },
        sections: [{ id: "intro", title: "Intro", blocks: [{ kind: "prose", body: "Hello <e id=\\"mvcc\\">MVCC</e>." }] }],
        kg: { entities: [{ id: "mvcc", name: "MVCC", type: "concept", shortDef: "Versions.", primarySectionId: "intro" }], relationships: [] },
        sources: []
      };`
    );

    const result = await main("cli-valid", { cwd });

    expect(result.exitCode).toBe(0);
    expect(result.ok).toBe(true);
    expect(result.output).toContain("Report cli-valid validated: 0 errors");
  });

  it("returns exit code 1 and formatted errors for invalid input", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "trellis-cli-invalid-"));
    await writeReport(
      cwd,
      "cli-invalid",
      `export default {
        id: "cli-invalid",
        title: "CLI Invalid",
        template: "tutorial",
        orientation: { heroSummary: "Invalid." },
        sections: [{ id: "intro", title: "Intro", blocks: [{ kind: "prose", body: "Hello <e id=\\"snapshop\\">snapshot</e>." }] }],
        kg: { entities: [{ id: "snapshot", name: "snapshot", type: "concept", shortDef: "Reader view.", primarySectionId: "intro" }], relationships: [] },
        sources: []
      };`
    );

    const result = await main("cli-invalid", { cwd, color: false });

    expect(result.exitCode).toBe(1);
    expect(result.ok).toBe(false);
    expect(result.output).toContain("reports/cli-invalid/content/intro.ts");
    expect(result.output).toContain('Section "intro", block[0], InlineProse entity ref "snapshop" does not resolve.');
    expect(result.output).toContain('Did you mean "snapshot"?');
    expect(result.output).toContain("Report cli-invalid validated: 1 errors");
  });
});
