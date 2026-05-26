import type { OutlineNode } from "../../schemas";
import type { ValidationContext, ValidationError } from "../errors";
import { sectionPath } from "../errors";
import type { ReferenceResolver } from "../reference-resolver";
import { missingReference } from "./helpers";

const validateOutlineNode = (
  node: OutlineNode,
  context: ValidationContext,
  resolver: ReferenceResolver,
  sectionId: string,
  errors: ValidationError[]
) => {
  if (!resolver.anchorsBySection.get(sectionId)?.has(node.id)) {
    errors.push(
      missingReference({
        context,
        resolver,
        namespace: "anchors",
        missingId: node.id,
        filePath: sectionPath(context, sectionId),
        sectionId,
        anchorId: node.id,
        message: `Outline child anchor "${node.id}" does not resolve in section "${sectionId}".`
      })
    );
  }

  node.children.forEach((child) => validateOutlineNode(child, context, resolver, sectionId, errors));
};

export const validateSectionRefs = (context: ValidationContext, resolver: ReferenceResolver): ValidationError[] => {
  const errors: ValidationError[] = [];

  for (const section of resolver.report.sections) {
    const filePath = sectionPath(context, section.id);

    for (const sectionId of section.relatedSectionIds) {
      if (!resolver.sections.has(sectionId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "sections",
            missingId: sectionId,
            filePath,
            sectionId: section.id,
            message: `Related section "${sectionId}" does not resolve.`
          })
        );
      }
    }

    for (const entityId of section.relatedEntityIds) {
      if (!resolver.entities.has(entityId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "entities",
            missingId: entityId,
            filePath,
            sectionId: section.id,
            message: `Related entity "${entityId}" does not resolve.`
          })
        );
      }
    }

    for (const sourceId of section.sourceRefIds) {
      if (!resolver.sources.has(sourceId)) {
        errors.push(
          missingReference({
            context,
            resolver,
            namespace: "sources",
            missingId: sourceId,
            filePath,
            sectionId: section.id,
            message: `Section source "${sourceId}" does not resolve.`
          })
        );
      }
    }

    section.children.forEach((node) => validateOutlineNode(node, context, resolver, section.id, errors));
  }

  return errors;
};
