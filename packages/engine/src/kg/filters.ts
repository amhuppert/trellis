import type { EntityType } from "../schemas";
import type { EntityFlowNode, RelationshipFlowEdge } from "./types";

export type RelationshipStrength = "weak" | "medium" | "strong";

export type GraphFilters = {
  type?: EntityType | Set<EntityType> | EntityType[] | null;
  search?: string | null;
  minStrength?: RelationshipStrength | null;
};

export const strengthRank: Record<RelationshipStrength, number> = {
  weak: 1,
  medium: 2,
  strong: 3
};

function typeMatches(node: EntityFlowNode, type: GraphFilters["type"]) {
  if (!type) return true;
  if (type instanceof Set) return type.size === 0 || type.has(node.data.entity.type);
  if (Array.isArray(type)) return type.length === 0 || type.includes(node.data.entity.type);
  return node.data.entity.type === type;
}

function searchMatches(node: EntityFlowNode, search: string | null | undefined) {
  const query = search?.trim().toLocaleLowerCase();
  if (!query) return true;

  const entity = node.data.entity;
  return (
    entity.name.toLocaleLowerCase().includes(query) ||
    (entity.aliases ?? []).some((alias) => alias.toLocaleLowerCase().includes(query))
  );
}

export function applyFilters(
  nodes: EntityFlowNode[],
  edges: RelationshipFlowEdge[],
  filters: GraphFilters = {}
): { nodes: EntityFlowNode[]; edges: RelationshipFlowEdge[] } {
  const filteredNodes = nodes.filter((node) => typeMatches(node, filters.type) && searchMatches(node, filters.search));
  const visibleIds = new Set(filteredNodes.map((node) => node.id));
  const minRank = filters.minStrength ? strengthRank[filters.minStrength] : strengthRank.weak;
  const filteredEdges = edges.filter(
    (edge) =>
      visibleIds.has(edge.source) &&
      visibleIds.has(edge.target) &&
      strengthRank[edge.data?.strength ?? "medium"] >= minRank
  );

  return { nodes: filteredNodes, edges: filteredEdges };
}
