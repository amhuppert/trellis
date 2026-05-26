import { describe, expect, it } from "vitest";
import { main } from "../validate";

describe("postgres-mvcc CLI integration", () => {
  it("exits 0 with only the expected unused-source warning", async () => {
    const result = await main("postgres-mvcc", { color: false });

    expect(result.exitCode).toBe(0);
    expect(result.ok).toBe(true);
    expect(result.output).toContain("Warnings");
    expect(result.output).toContain('Source "momjian" is defined but unused.');
    expect(result.output).toContain("Report postgres-mvcc validated: 0 errors, 1 warnings.");
    expect(result.output).not.toContain("Errors");
  });
});
