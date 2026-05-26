import { access, readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import type { ReportConfig } from "../schemas";
import type { ValidationContext } from "./errors";

export type LoadedReport = {
  report: unknown;
  context: ValidationContext;
};

const exists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const reportRootForId = (reportId: string) => (reportId.startsWith("template-") ? `reports/_${reportId}` : `reports/${reportId}`);

const findReportCwd = async (cwd: string, reportId: string) => {
  const reportRoot = reportRootForId(reportId);
  let current = resolve(cwd);
  while (true) {
    if (await exists(resolve(current, reportRoot, "report.config.ts"))) return current;
    const parent = dirname(current);
    if (parent === current) return resolve(cwd);
    current = parent;
  }
};

export const loadReport = async (reportId: string, cwd = process.cwd()): Promise<LoadedReport> => {
  const rootCwd = await findReportCwd(cwd, reportId);
  const reportRoot = reportRootForId(reportId);
  const configPath = resolve(rootCwd, reportRoot, "report.config.ts");
  const module = (await import(pathToFileURL(configPath).href)) as {
    default?: unknown;
    reportConfig?: unknown;
    config?: unknown;
  };
  const report = module.default ?? module.reportConfig ?? module.config;

  let customComponentFiles = new Set<string>();
  try {
    const files = await readdir(resolve(rootCwd, reportRoot, "custom"));
    customComponentFiles = new Set(files.filter((file) => file.endsWith(".tsx")).map((file) => file.replace(/\.tsx$/, "")));
  } catch {
    customComponentFiles = new Set();
  }

  return {
    report: report as ReportConfig,
    context: { reportId, reportRoot, customComponentFiles }
  };
};
