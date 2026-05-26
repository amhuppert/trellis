import type { Block, ReportConfig, Section, SynthesisNode } from "../schemas";

export type SynthesisNodeWithPath = {
  node: SynthesisNode;
  path: string[];
};

export type ReferenceResolver = {
  report: ReportConfig;
  sections: Map<string, Section>;
  anchorsBySection: Map<string, Map<string, { block: Block; blockIndex: number }>>;
  entities: Map<string, NonNullable<ReportConfig["kg"]>["entities"][number]>;
  relationships: Map<string, NonNullable<ReportConfig["kg"]>["relationships"][number]>;
  sources: Map<string, ReportConfig["sources"][number]>;
  synthesisNodes: Map<string, SynthesisNodeWithPath>;
  customComponents: Map<string, ReportConfig["customComponents"][number]>;
};

const collectSynthesisNodes = (nodes: SynthesisNode[] = [], path: string[] = []): SynthesisNodeWithPath[] =>
  nodes.flatMap((node) => {
    const currentPath = [...path, node.id];
    return [{ node, path: currentPath }, ...collectSynthesisNodes(node.children, currentPath)];
  });

export const buildReferenceResolver = (report: ReportConfig): ReferenceResolver => {
  const sections = new Map(report.sections.map((section) => [section.id, section]));
  const anchorsBySection = new Map<string, Map<string, { block: Block; blockIndex: number }>>();

  for (const section of report.sections) {
    const anchors = new Map<string, { block: Block; blockIndex: number }>();
    section.blocks.forEach((block, blockIndex) => {
      if ("anchorId" in block && block.anchorId) {
        anchors.set(block.anchorId, { block, blockIndex });
      }
    });
    anchorsBySection.set(section.id, anchors);
  }

  return {
    report,
    sections,
    anchorsBySection,
    entities: new Map((report.kg?.entities ?? []).map((entity) => [entity.id, entity])),
    relationships: new Map((report.kg?.relationships ?? []).map((relationship) => [relationship.id, relationship])),
    sources: new Map(report.sources.map((source) => [source.id, source])),
    synthesisNodes: new Map(collectSynthesisNodes(report.synthesis?.roots ?? []).map((entry) => [entry.node.id, entry])),
    customComponents: new Map(report.customComponents.map((component) => [component.name, component]))
  };
};
