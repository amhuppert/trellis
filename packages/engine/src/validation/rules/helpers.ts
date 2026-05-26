import type { Reference } from "../../schemas";
import type { ValidationContext, ValidationError } from "../errors";
import { sectionPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { suggestId } from "../suggestions";

export const missingReference = (args: {
  context: ValidationContext;
  resolver: ReferenceResolver;
  namespace: "sections" | "anchors" | "entities" | "relationships" | "sources" | "synthesisNodes" | "customComponents";
  missingId: string;
  filePath?: string;
  sectionId?: string;
  blockIndex?: number;
  anchorId?: string;
  message: string;
}): ValidationError => {
  const candidates =
    args.namespace === "sections"
      ? args.resolver.sections.keys()
      : args.namespace === "anchors" && args.sectionId
        ? (args.resolver.anchorsBySection.get(args.sectionId)?.keys() ?? [])
        : args.namespace === "entities"
          ? args.resolver.entities.keys()
          : args.namespace === "relationships"
            ? args.resolver.relationships.keys()
            : args.namespace === "sources"
              ? args.resolver.sources.keys()
              : args.namespace === "synthesisNodes"
                ? args.resolver.synthesisNodes.keys()
                : args.resolver.customComponents.keys();

  return {
    severity: "error",
    code: args.namespace === "customComponents" ? "custom.missing" : "reference.missing",
    reportId: args.context.reportId,
    filePath: args.filePath,
    sectionId: args.sectionId,
    blockIndex: args.blockIndex,
    anchorId: args.anchorId,
    missingId: args.missingId,
    expectedNamespace: args.namespace,
    suggestion: suggestId(args.missingId, candidates),
    message: args.message
  };
};

export const validateReference = (
  reference: Reference,
  context: ValidationContext,
  resolver: ReferenceResolver,
  location: { filePath?: string; sectionId?: string; blockIndex?: number }
) => {
  const errors: ValidationError[] = [];

  if (reference.kind === "section") {
    if (!resolver.sections.has(reference.id)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "sections",
          missingId: reference.id,
          filePath: location.filePath,
          sectionId: location.sectionId,
          blockIndex: location.blockIndex,
          message: `Section reference "${reference.id}" does not resolve.`
        })
      );
    } else if (reference.anchorId && !resolver.anchorsBySection.get(reference.id)?.has(reference.anchorId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "anchors",
          missingId: reference.anchorId,
          filePath: location.filePath ?? sectionPath(context, reference.id),
          sectionId: reference.id,
          blockIndex: location.blockIndex,
          anchorId: reference.anchorId,
          message: `Section anchor reference "${reference.anchorId}" does not resolve.`
        })
      );
    }
  }

  if (reference.kind === "entity" && !resolver.entities.has(reference.id)) {
    errors.push(
      missingReference({
        context,
        resolver,
        namespace: "entities",
        missingId: reference.id,
        filePath: location.filePath,
        sectionId: location.sectionId,
        blockIndex: location.blockIndex,
        message: `Entity reference "${reference.id}" does not resolve.`
      })
    );
  }

  if (reference.kind === "source" && !resolver.sources.has(reference.id)) {
    errors.push(
      missingReference({
        context,
        resolver,
        namespace: "sources",
        missingId: reference.id,
        filePath: location.filePath,
        sectionId: location.sectionId,
        blockIndex: location.blockIndex,
        message: `Source reference "${reference.id}" does not resolve.`
      })
    );
  }

  return errors;
};
