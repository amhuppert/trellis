import type { ValidationContext, ValidationError } from "../errors";
import { reportConfigPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

export const validateSourceRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const source of resolver.report.sources) {
    if (source.kind === "passage" && !resolver.sources.has(source.documentSourceId)) {
      errors.push(
        missingReference({
          context,
          resolver,
          namespace: "sources",
          missingId: source.documentSourceId,
          filePath: reportConfigPath(context),
          message: `Passage documentSourceId "${source.documentSourceId}" does not resolve.`
        })
      );
    }
  }

  return errors;
};
