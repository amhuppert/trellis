import type { ReportConfig } from "@trellis/engine";
import { loadReport, validateReport } from "@trellis/engine";

export async function loadSelectedReport(reportId = import.meta.env.REPORT_ID ?? import.meta.env.PUBLIC_REPORT_ID ?? "postgres-mvcc"): Promise<ReportConfig> {
  const loaded = await loadReport(reportId);
  const result = validateReport(loaded.report, loaded.context);

  if (result.errors.length > 0) {
    const details = result.errors.map((error) => `${error.filePath}: ${error.message}`).join("\n");
    throw new Error(`Report ${reportId} failed validation:\n${details}`);
  }

  return loaded.report as ReportConfig;
}

