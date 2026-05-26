import type { RelationshipStrength } from "./filters";
import { strengthRank } from "./filters";
import type { RelationshipFlowEdge } from "./types";
import type { Section } from "../schemas";

export type NeighborOptions = {
  hops?: number;
  minStrength?: RelationshipStrength;
};

export function neighbors(entityId: string, edges: RelationshipFlowEdge[], options: NeighborOptions = {}): string[] {
  const hops = Math.max(1, options.hops ?? 1);
  const minRank = options.minStrength ? strengthRank[options.minStrength] : strengthRank.weak;
  const adjacency = new Map<string, string[]>();

  for (const edge of edges) {
    if (strengthRank[edge.data?.strength ?? "medium"] < minRank) continue;

    const sourceNeighbors = adjacency.get(edge.source) ?? [];
    sourceNeighbors.push(edge.target);
    adjacency.set(edge.source, sourceNeighbors);

    const targetNeighbors = adjacency.get(edge.target) ?? [];
    targetNeighbors.push(edge.source);
    adjacency.set(edge.target, targetNeighbors);
  }

  const visited = new Set([entityId]);
  const ordered: string[] = [];
  const queue: Array<{ id: string; depth: number }> = [{ id: entityId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || current.depth >= hops) continue;

    for (const next of adjacency.get(current.id) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      ordered.push(next);
      queue.push({ id: next, depth: current.depth + 1 });
    }
  }

  return ordered;
}

export function neighborSet(entityId: string, edges: RelationshipFlowEdge[], options: NeighborOptions = {}): Set<string> {
  return new Set([entityId, ...neighbors(entityId, edges, options)]);
}

export type RelatedSectionOptions = {
  primarySectionId?: string | null;
};

export function relatedSectionIds(
  entityId: string,
  sections: Section[],
  options: RelatedSectionOptions = {}
): string[] {
  const ids = new Set<string>();
  if (options.primarySectionId) ids.add(options.primarySectionId);

  for (const section of sections) {
    if (section.relatedEntityIds.includes(entityId)) ids.add(section.id);
  }

  return Array.from(ids);
}

export function relatedSections(
  entityId: string,
  sections: Section[],
  options: RelatedSectionOptions = {}
): Section[] {
  const ids = new Set(relatedSectionIds(entityId, sections, options));
  return sections.filter((section) => ids.has(section.id));
}
