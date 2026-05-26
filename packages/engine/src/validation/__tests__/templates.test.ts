import { describe, expect, it } from "vitest";
import { loadReport, validateReport } from "../index";

const templateIds = ["template-tutorial", "template-codebase", "template-feature", "template-comparison", "template-custom"];

describe("report templates", () => {
  it.each(templateIds)("loads and validates %s without errors", async (templateId) => {
    const loaded = await loadReport(templateId);
    const result = validateReport(loaded.report, loaded.context);

    expect(result.errors).toEqual([]);
  });
});
