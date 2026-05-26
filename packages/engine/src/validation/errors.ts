export type ValidationSeverity = "error" | "warning";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  message: string;
  reportId: string;
  filePath?: string;
  sectionId?: string;
  blockIndex?: number;
  anchorId?: string;
  missingId?: string;
  expectedNamespace?: string;
  suggestion?: string;
};

export type ValidationError = ValidationIssue & { severity: "error" };
export type ValidationWarning = ValidationIssue & { severity: "warning" };

export type ValidationResult = {
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

export type ValidationContext = {
  reportId: string;
  reportRoot: string;
  customComponentFiles?: Set<string>;
};

export const reportConfigPath = (context: ValidationContext) => `${context.reportRoot}/report.config.ts`;

export const sectionPath = (context: ValidationContext, sectionId: string) =>
  `${context.reportRoot}/content/${sectionId}.ts`;
