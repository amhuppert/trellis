import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference, validateReference } from "./helpers";

export const validateEntityRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];
  const filePath = reportConfigPath(context);

  for (const entity of resolver.report.kg?.entities ?? []) {
    if (!entity.primarySectionId) {
      errors.push({
        severity: "error",
        code: "reference.missing",
        reportId: context.reportId,
        filePath,
        missingId: "primarySectionId",
        expectedNamespace: "sections",
        message: `Entity "${entity.id}" is missing primarySectionId.`
      });
    } else if (!resolver.sections.has(entity.primarySectionId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "sections",
          missingId: entity.primarySectionId,
          filePath,
          message: `Entity primarySectionId "${entity.primarySectionId}" does not resolve.`
        })
      );
    }

    for (const reference of entity.references) {
      errors.push(...validateReference(reference, context, resolver, { filePath }));
    }
  }

  return errors;
};
