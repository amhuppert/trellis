import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { main } from "../../cli/validate";
import { loadReport } from "../report-loader";
import { validate } from "../validate";

const writeVariant = async (suffix: string, mutate: (report: any) => void) => {
  const cwd = await mkdtemp(join(tmpdir(), `trellis-reference-contract-${suffix}-`));
  const reportId = `postgres-mvcc-${suffix}`;
  const loaded = await loadReport("postgres-mvcc");
  const report = JSON.parse(JSON.stringify(loaded.report));
  report.id = reportId;
  mutate(report);

  const root = join(cwd, "reports", reportId);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, "report.config.ts"), `export default ${JSON.stringify(report, null, 2)};\n`);

  return { cwd, reportId };
};

describe("reference-layer validation contract", () => {
  it("catches entities without a primary section", async () => {
    const { cwd, reportId } = await writeVariant("missing-primary-section", (report) => {
      delete report.kg.entities[0].primarySectionId;
    });

    const result = await validate(reportId, cwd);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.missing",
          expectedNamespace: "sections",
          missingId: "primarySectionId"
        })
      ])
    );

    const cli = await main(reportId, { cwd, color: false });
    expect(cli.exitCode).toBe(1);
    expect(cli.output).toContain('Entity "mvcc" is missing primarySectionId.');
  });

  it("catches section relatedEntityIds pointing at a missing entity", async () => {
    const { cwd, reportId } = await writeVariant("missing-related-entity", (report) => {
      report.sections[0].relatedEntityIds = ["missing-entity"];
    });

    const result = await validate(reportId, cwd);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.missing",
          sectionId: "foundations",
          expectedNamespace: "entities",
          missingId: "missing-entity"
        })
      ])
    );

    const cli = await main(reportId, { cwd, color: false });
    expect(cli.exitCode).toBe(1);
    expect(cli.output).toContain('Related entity "missing-entity" does not resolve.');
  });

  it("catches section sourceRefIds pointing at a missing source", async () => {
    const { cwd, reportId } = await writeVariant("missing-section-source", (report) => {
      report.sections[0].sourceRefIds = ["missing-source"];
    });

    const result = await validate(reportId, cwd);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.missing",
          sectionId: "foundations",
          expectedNamespace: "sources",
          missingId: "missing-source"
        })
      ])
    );

    const cli = await main(reportId, { cwd, color: false });
    expect(cli.exitCode).toBe(1);
    expect(cli.output).toContain('Section source "missing-source" does not resolve.');
  });
});
