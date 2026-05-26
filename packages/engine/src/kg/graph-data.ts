import type { KnowledgeGraph, Section } from "../schemas";
import type { EntityFlowNode, FlowGraph, RelationshipFlowEdge } from "./types";

export type ToFlowGraphOptions = {
  selectedEntityId?: string | null;
};

export function toFlowGraph(
  kg: KnowledgeGraph,
  sections: Section[] = [],
  options: ToFlowGraphOptions = {}
): FlowGraph {
  const degree = new Map<string, number>();
  const sectionIdsByEntity = new Map<string, Set<string>>();

  for (const entity of kg.entities) {
    degree.set(entity.id, 0);
    sectionIdsByEntity.set(entity.id, new Set(entity.primarySectionId ? [entity.primarySectionId] : []));
  }

  for (const relationship of kg.relationships) {
    degree.set(relationship.from, (degree.get(relationship.from) ?? 0) + 1);
    degree.set(relationship.to, (degree.get(relationship.to) ?? 0) + 1);
  }

  for (const section of sections) {
    for (const entityId of section.relatedEntityIds) {
      const sectionIds = sectionIdsByEntity.get(entityId);
      if (sectionIds) sectionIds.add(section.id);
    }
  }

  const nodes: EntityFlowNode[] = kg.entities.map((entity, index) => ({
    id: entity.id,
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entity,
      degree: degree.get(entity.id) ?? 0,
      selected: options.selectedEntityId === entity.id,
      dimmed: false,
      sectionIds: Array.from(sectionIdsByEntity.get(entity.id) ?? [])
    },
    zIndex: 2,
    draggable: true,
    selectable: true,
    ariaLabel: `${entity.name} (${entity.type})`,
    initialWidth: 148,
    initialHeight: 44,
    deletable: false,
    focusable: true,
    width: 148,
    height: 44,
    measured: { width: 148, height: 44 },
    hidden: false,
    selected: options.selectedEntityId === entity.id,
    dragging: false,
    resizing: false,
    parentId: undefined,
    extent: undefined,
    expandParent: false,
    origin: undefined,
    handles: undefined,
    style: undefined,
    className: undefined,
    sourcePosition: undefined,
    targetPosition: undefined
  }));

  const edges: RelationshipFlowEdge[] = kg.relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.from,
    target: relationship.to,
    type: "relationship",
    data: {
      relationship,
      strength: relationship.strength ?? "medium",
      label: relationship.label,
      dimmed: false
    },
    animated: false,
    focusable: true,
    deletable: false,
    hidden: false,
    selected: false
  }));

  return { nodes, edges };
}
