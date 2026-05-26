import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AppShell } from "../../components/shell/AppShell";
import { loadReport, validateReport } from "../index";
import type { ReportConfig } from "../../schemas";

describe("trellis-engine-architecture golden report", () => {
  it("validates and renders through the reader shell", async () => {
    const loaded = await loadReport("trellis-engine-architecture");
    const result = validateReport(loaded.report, loaded.context);

    expect(result.errors).toEqual([]);

    const html = renderToString(<AppShell report={loaded.report as ReportConfig} />);
    expect(html).toContain("Trellis Engine Architecture");
    expect(html).toContain("Architecture Overview");
    expect(html).toContain("Knowledge Graph Runtime");
  });
});
