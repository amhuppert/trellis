import type { ReportConfig } from "../../schemas";
import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath, sectionPath } from "../errors";

const duplicateErrors = (
  ids: Array<{ id: string; filePath?: string; sectionId?: string; anchorId?: string }>,
  namespace: string,
  context: ValidationContext
) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  const errors: ValidationError[] = [];

  for (const item of ids) {
    if (seen.has(item.id) && !duplicates.has(item.id)) {
      duplicates.add(item.id);
      errors.push({
        severity: "error",
        code: "duplicate.id",
        reportId: context.reportId,
        filePath: item.filePath ?? reportConfigPath(context),
        sectionId: item.sectionId,
        anchorId: item.anchorId,
        missingId: item.id,
        expectedNamespace: namespace,
        message: `Duplicate ${namespace} id "${item.id}".`
      });
    }
    seen.add(item.id);
  }

  return errors;
};

const synthesisIds = (nodes: NonNullable<ReportConfig["synthesis"]>["roots"] = []): string[] =>
  nodes.flatMap((node) => [node.id, ...synthesisIds(node.children)]);

export const validateDuplicateIds = (report: ReportConfig, context: ValidationContext): ValidationError[] => [
  ...duplicateErrors(
    report.sections.map((section) => ({ id: section.id, filePath: sectionPath(context, section.id), sectionId: section.id })),
    "sections",
    context
  ),
  ...report.sections.flatMap((section) =>
    duplicateErrors(
      section.blocks
        .map((block) => ("anchorId" in block ? block.anchorId : undefined))
        .filter((id): id is string => Boolean(id))
        .map((id) => ({ id, filePath: sectionPath(context, section.id), sectionId: section.id, anchorId: id })),
      "anchors",
      context
    )
  ),
  ...duplicateErrors(
    (report.kg?.entities ?? []).map((entity) => ({ id: entity.id, filePath: reportConfigPath(context) })),
    "entities",
    context
  ),
  ...duplicateErrors(
    (report.kg?.relationships ?? []).map((relationship) => ({ id: relationship.id, filePath: reportConfigPath(context) })),
    "relationships",
    context
  ),
  ...duplicateErrors(
    report.sources.map((source) => ({ id: source.id, filePath: reportConfigPath(context) })),
    "sources",
    context
  ),
  ...duplicateErrors(
    synthesisIds(report.synthesis?.roots).map((id) => ({ id, filePath: reportConfigPath(context) })),
    "synthesisNodes",
    context
  ),
  ...duplicateErrors(
    report.customComponents.map((component) => ({ id: component.name, filePath: reportConfigPath(context) })),
    "customComponents",
    context
  )
];
