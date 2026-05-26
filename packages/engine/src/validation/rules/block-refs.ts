import type { Block } from "../../schemas";
import type { ValidationContext, ValidationError } from "../errors";
import { sectionPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

const entityRefPattern = /<e\s+id="([^"]+)"\s*>/g;

const inlineFields = (block: Block): string[] => {
  switch (block.kind) {
    case "conceptIntro":
    case "prose":
      return [block.body];
    case "mentalModel":
      return [block.body, block.aside].filter((value): value is string => Boolean(value));
    case "callout":
      return [block.body];
    case "stepByStep":
      return block.steps.map((step) => step.body);
    case "keyTakeaways":
      return block.items;
    case "misconception":
      return [block.claim, block.truth];
    case "beforeContinue":
      return [block.body];
    case "figure":
      return block.caption ? [block.caption] : [];
    case "comparisonTable":
      return block.rows.flat();
    default:
      return [];
  }
};

export const extractInlineEntityIds = (value: string) => [...value.matchAll(entityRefPattern)].map((match) => match[1]);

export const validateBlockRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const section of resolver.report.sections) {
    const filePath = sectionPath(context, section.id);
    section.blocks.forEach((block, blockIndex) => {
      if (block.kind === "beforeContinue" && !resolver.sections.has(block.nextSectionId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "sections",
            missingId: block.nextSectionId,
            filePath,
            sectionId: section.id,
            blockIndex,
            message: `beforeContinue nextSectionId "${block.nextSectionId}" does not resolve.`
          })
        );
      }

      if ((block.kind === "codeBlock" || block.kind === "figure") && block.sourceRefId && !resolver.sources.has(block.sourceRefId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "sources",
            missingId: block.sourceRefId,
            filePath,
            sectionId: section.id,
            blockIndex,
            message: `Block sourceRefId "${block.sourceRefId}" does not resolve.`
          })
        );
      }

      for (const field of inlineFields(block)) {
        for (const entityId of extractInlineEntityIds(field)) {
          if (!resolver.entities.has(entityId)) {
            errors.push(
              missingReference({
                context,
                resolver,
                namespace: "entities",
                missingId: entityId,
                filePath,
                sectionId: section.id,
                blockIndex,
                anchorId: "anchorId" in block ? block.anchorId : undefined,
                message: `InlineProse entity ref "${entityId}" does not resolve.`
              })
            );
          }
        }
      }
    });
  }

  return errors;
};
