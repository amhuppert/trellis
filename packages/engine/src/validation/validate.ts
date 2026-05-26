import { ReportConfigSchema, type ReportConfig } from "../schemas";
import type { ValidationContext, ValidationError, ValidationResult } from "./errors";
import { reportConfigPath } from "./errors";
import { loadReport } from "./report-loader";
import { buildReferenceResolver } from "./reference-resolver";
import { validateBlockRefs } from "./rules/block-refs";
import { validateCustomRefs } from "./rules/custom-refs";
import { validateDuplicateIds } from "./rules/duplicate-ids";
import { validateEntityRefs } from "./rules/entity-refs";
import { validateOrientationRefs } from "./rules/orientation-refs";
import { validateRelationshipRefs } from "./rules/relationship-refs";
import { validateSectionRefs } from "./rules/section-refs";
import { validateSourceRefs } from "./rules/source-refs";
import { validateSynthesisRefs } from "./rules/synthesis-refs";
import { collectWarnings } from "./warnings";

const defaultContext = (report: unknown): ValidationContext => {
  const id = typeof report === "object" && report !== null && "id" in report && typeof report.id === "string" ? report.id : "unknown";
  return { reportId: id, reportRoot: `reports/${id}` };
};

export const validateReport = (input: unknown, context = defaultContext(input)): ValidationResult => {
  const parsed = ReportConfigSchema.safeParse(input);

  if (!parsed.success) {
    const error: ValidationError = {
      severity: "error",
      code: "schema.invalid",
      reportId: context.reportId,
      filePath: reportConfigPath(context),
      expectedNamespace: "schema",
      message: parsed.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; ")
    };
    return { errors: [error], warnings: [] };
  }

  const report: ReportConfig = parsed.data;
  const resolver = buildReferenceResolver(report);
  const errors = [
    ...validateDuplicateIds(report, context),
    ...validateOrientationRefs(context, resolver),
    ...validateSectionRefs(context, resolver),
    ...validateBlockRefs(context, resolver),
    ...validateEntityRefs(context, resolver),
    ...validateRelationshipRefs(context, resolver),
    ...validateSynthesisRefs(context, resolver),
    ...validateSourceRefs(context, resolver),
    ...validateCustomRefs(context, resolver)
  ];

  return {
    errors,
    warnings: collectWarnings(context, resolver)
  };
};

export const validate = async (reportId: string, cwd = process.cwd()): Promise<ValidationResult> => {
  const loaded = await loadReport(reportId, cwd);
  return validateReport(loaded.report, loaded.context);
};
