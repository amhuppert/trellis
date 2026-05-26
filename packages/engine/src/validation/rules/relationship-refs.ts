import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

export const validateRelationshipRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];
  const filePath = reportConfigPath(context);

  for (const relationship of resolver.report.kg?.relationships ?? []) {
    for (const [field, entityId] of [
      ["from", relationship.from],
      ["to", relationship.to]
    ] as const) {
      if (!resolver.entities.has(entityId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "entities",
            missingId: entityId,
            filePath,
            message: `Relationship ${field} entity "${entityId}" does not resolve.`
          })
        );
      }
    }

    for (const sourceId of relationship.sourceRefIds) {
      if (!resolver.sources.has(sourceId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "sources",
            missingId: sourceId,
            filePath,
            message: `Relationship sourceRefId "${sourceId}" does not resolve.`
          })
        );
      }
    }
  }

  return errors;
};
