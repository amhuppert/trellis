import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

export const validateOrientationRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];
  const filePath = reportConfigPath(context);

  for (const sectionId of resolver.report.orientation.recommendedPath) {
    if (!resolver.sections.has(sectionId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "sections",
          missingId: sectionId,
          filePath,
          message: `Orientation recommendedPath section "${sectionId}" does not resolve.`
        })
      );
    }
  }

  for (const entityId of resolver.report.orientation.keyEntityIds) {
    if (!resolver.entities.has(entityId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "entities",
          missingId: entityId,
          filePath,
          message: `Orientation keyEntityIds entity "${entityId}" does not resolve.`
        })
      );
    }
  }

  for (const jumpTarget of resolver.report.orientation.jumpTargets) {
    if (jumpTarget.mode === "guided" && jumpTarget.targetId && !resolver.sections.has(jumpTarget.targetId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "sections",
          missingId: jumpTarget.targetId,
          filePath,
          message: `Orientation jump target "${jumpTarget.targetId}" does not resolve.`
        })
      );
    }
    if (jumpTarget.mode === "reference" && jumpTarget.targetId && !resolver.entities.has(jumpTarget.targetId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "entities",
          missingId: jumpTarget.targetId,
          filePath,
          message: `Orientation jump target "${jumpTarget.targetId}" does not resolve.`
        })
      );
    }
    if (jumpTarget.mode === "synthesis" && jumpTarget.targetId && !resolver.synthesisNodes.has(jumpTarget.targetId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "synthesisNodes",
          missingId: jumpTarget.targetId,
          filePath,
          message: `Orientation jump target "${jumpTarget.targetId}" does not resolve.`
        })
      );
    }
  }

  return errors;
};
