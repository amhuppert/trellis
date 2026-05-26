import type { ValidationContext, ValidationError } from "../errors";
import { sectionPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

export const validateCustomRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const section of resolver.report.sections) {
    section.blocks.forEach((block, blockIndex) => {
      if (block.kind !== "custom") return;

      const hasManifest = resolver.customComponents.has(block.componentName);
      const hasFile = context.customComponentFiles?.has(block.componentName) ?? false;

      if (!hasManifest || !hasFile) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "customComponents",
            missingId: block.componentName,
            filePath: sectionPath(context, section.id),
            sectionId: section.id,
            blockIndex,
            anchorId: block.anchorId,
            message: `Custom block componentName "${block.componentName}" is missing a matching manifest entry or custom component file.`
          })
        );
      }
    });
  }

  return errors;
};
