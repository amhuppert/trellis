#!/usr/bin/env tsx
import type { ValidationIssue } from "../validation";
import { loadReport, validateReport } from "../validation";

type MainOptions = {
  cwd?: string;
  color?: boolean;
};

const red = (value: string, enabled: boolean) => (enabled ? `\u001b[31m${value}\u001b[0m` : value);
const yellow = (value: string, enabled: boolean) => (enabled ? `\u001b[33m${value}\u001b[0m` : value);

const locationLine = (issue: ValidationIssue) => {
  const parts: string[] = [];
  if (issue.sectionId) parts.push(`Section "${issue.sectionId}"`);
  if (issue.blockIndex !== undefined) parts.push(`block[${issue.blockIndex}]`);
  if (issue.anchorId && issue.blockIndex === undefined) parts.push(`anchor "${issue.anchorId}"`);

  return parts.length > 0 ? `${parts.join(", ")}, ${issue.message}` : issue.message;
};

const formatIssues = (title: string, issues: ValidationIssue[], colorize: (value: string) => string) => {
  if (issues.length === 0) return "";

  const lines = [colorize(title)];
  for (const issue of issues) {
    if (issue.filePath) lines.push(issue.filePath);
    lines.push(locationLine(issue));
    if (issue.suggestion) lines.push(`Did you mean "${issue.suggestion}"?`);
  }
  return lines.join("\n");
};

export const main = async (
  reportId: string,
  options: MainOptions = {}
): Promise<{ ok: boolean; output: string; exitCode: number }> => {
  const cwd = options.cwd ?? process.cwd();
  const useColor = options.color ?? process.stdout.isTTY;

  try {
    const loaded = await loadReport(reportId, cwd);
    const result = validateReport(loaded.report, loaded.context);
    const sections = [
      formatIssues(red("Errors", useColor), result.errors, (value) => red(value, useColor)),
      formatIssues(yellow("Warnings", useColor), result.warnings, (value) => yellow(value, useColor)),
      `Report ${reportId} validated: ${result.errors.length} errors, ${result.warnings.length} warnings.`
    ].filter(Boolean);

    return {
      ok: result.errors.length === 0,
      output: sections.join("\n\n"),
      exitCode: result.errors.length === 0 ? 0 : 1
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      output: `${red("Errors", useColor)}\n${message}\n\nReport ${reportId} validated: 1 errors, 0 warnings.`,
      exitCode: 1
    };
  }
};

const invokedPath = process.argv[1] ? new URL(`file://${process.argv[1]}`).href : undefined;
if (invokedPath === import.meta.url) {
  const reportId = process.argv[2];
  if (!reportId) {
    console.error("Usage: trellis-validate <report-id>");
    process.exit(1);
  }

  const result = await main(reportId);
  const writer = result.exitCode === 0 ? console.log : console.error;
  writer(result.output);
  process.exit(result.exitCode);
}
