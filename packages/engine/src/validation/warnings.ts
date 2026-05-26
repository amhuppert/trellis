import type { Block } from "../schemas";
import type { ValidationContext, ValidationWarning } from "./errors";
import { sectionPath } from "./errors";
import type { ReferenceResolver } from "./reference-resolver";
import { extractInlineEntityIds } from "./rules/block-refs";

const inlineEntityUses = (block: Block): string[] => {
  const values: string[] = [];
  if ("body" in block) values.push(block.body);
  if (block.kind === "mentalModel" && block.aside) values.push(block.aside);
  if (block.kind === "stepByStep") values.push(...block.steps.map((step) => step.body));
  if (block.kind === "keyTakeaways") values.push(...block.items);
  if (block.kind === "misconception") values.push(block.claim, block.truth);
  if (block.kind === "figure" && block.caption) values.push(block.caption);
  if (block.kind === "comparisonTable") values.push(...block.rows.flat());
  return values.flatMap(extractInlineEntityIds);
};

export const collectWarnings = (context: ValidationContext, resolver: ReferenceResolver): ValidationWarning[] => {
  const usedSources = new Set<string>();
  const usedEntities = new Set<string>();

  for (const section of resolver.report.sections) {
    section.sourceRefIds.forEach((id) => usedSources.add(id));
    section.relatedEntityIds.forEach((id) => usedEntities.add(id));
    section.blocks.forEach((block) => {
      inlineEntityUses(block).forEach((id) => usedEntities.add(id));
      if ((block.kind === "codeBlock" || block.kind === "figure") && block.sourceRefId) usedSources.add(block.sourceRefId);
    });
  }

  for (const entity of resolver.report.kg?.entities ?? []) {
    entity.references.forEach((reference) => {
      if (reference.kind === "source") usedSources.add(reference.id);
      if (reference.kind === "entity") usedEntities.add(reference.id);
    });
  }

  for (const relationship of resolver.report.kg?.relationships ?? []) {
    usedEntities.add(relationship.from);
    usedEntities.add(relationship.to);
    relationship.sourceRefIds.forEach((id) => usedSources.add(id));
  }

  for (const { node } of resolver.synthesisNodes.values()) {
    node.references.forEach((reference) => {
      if (reference.kind === "source") usedSources.add(reference.id);
      if (reference.kind === "entity") usedEntities.add(reference.id);
    });
  }

  const warnings: ValidationWarning[] = [];

  for (const source of resolver.report.sources) {
    if (!usedSources.has(source.id)) {
      warnings.push({
        severity: "warning",
        code: "unused.source",
        reportId: context.reportId,
        filePath: `${context.reportRoot}/sources/index.ts`,
        missingId: source.id,
        expectedNamespace: "sources",
        message: `Source "${source.id}" is defined but unused.`
      });
    }
  }

  for (const entity of resolver.report.kg?.entities ?? []) {
    if (!usedEntities.has(entity.id)) {
      warnings.push({
        severity: "warning",
        code: "unused.entity",
        reportId: context.reportId,
        filePath: `${context.reportRoot}/kg/entities.ts`,
        missingId: entity.id,
        expectedNamespace: "entities",
        message: `Entity "${entity.id}" is defined but unused.`
      });
    }
  }

  for (const section of resolver.report.sections) {
    if (section.blocks.length === 0 && !section.summary?.toLowerCase().includes("stub")) {
      warnings.push({
        severity: "warning",
        code: "empty.section",
        reportId: context.reportId,
        filePath: sectionPath(context, section.id),
        sectionId: section.id,
        expectedNamespace: "blocks",
        message: `Section "${section.id}" has no blocks and is not marked as a stub.`
      });
    }
  }

  return warnings;
};
