import { rm, stat, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { main as scaffoldReport } from "../scaffold";
import { main as validateReport } from "../validate";

const scratchId = "test-scaffold-tutorial";
const scratchRoot = resolve(process.cwd(), "..", "..", "reports", scratchId);

describe("scaffold-report CLI", () => {
  beforeEach(async () => {
    await rm(scratchRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(scratchRoot, { recursive: true, force: true });
  });

  it("scaffolds a tutorial report and the result validates", async () => {
    await scaffoldReport(scratchId, { template: "tutorial" });

    await expect(stat(resolve(scratchRoot, "report.config.ts"))).resolves.toBeTruthy();
    await expect(stat(resolve(scratchRoot, "content", "index.ts"))).resolves.toBeTruthy();
    await expect(stat(resolve(scratchRoot, "kg", "index.ts"))).resolves.toBeTruthy();

    const config = await readFile(resolve(scratchRoot, "report.config.ts"), "utf8");
    expect(config).toContain(`id: "${scratchId}"`);
    expect(config).not.toContain(`id: "template-tutorial"`);

    const result = await validateReport(scratchId, { cwd: resolve(process.cwd(), "..", ".."), color: false });
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain(`Report ${scratchId} validated: 0 errors`);
  });

  it("refuses to overwrite an existing report", async () => {
    await scaffoldReport(scratchId, { template: "tutorial" });

    await expect(scaffoldReport(scratchId, { template: "tutorial" })).rejects.toThrow(/already exists/);
  });
});
