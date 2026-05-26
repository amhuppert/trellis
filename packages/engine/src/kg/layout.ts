import dagre from "dagre";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from "d3-force";
import type { Section } from "../schemas";
import type { EntityFlowNode, GraphFlowNode, RegionFlowNode, RelationshipFlowEdge } from "./types";
import { neighbors } from "./traversal";

export type GraphSize = {
  width: number;
  height: number;
};

export type ForceLayoutOptions = {
  seed?: number;
  iterations?: number;
  size?: GraphSize;
};

export type RingLayoutOptions = {
  hops?: number;
  size?: GraphSize;
  radiusStep?: number;
};

export type RegionsLayoutOptions = {
  sections: Section[];
  padding?: number;
};

type SimulationNode = {
  id: string;
  x: number;
  y: number;
};

const defaultSize: GraphSize = { width: 960, height: 620 };

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function roundPosition(value: number) {
  return Math.round(value * 100) / 100;
}

function cloneNodeWithPosition<T extends EntityFlowNode | RegionFlowNode>(node: T, x: number, y: number): T {
  return {
    ...node,
    position: { x: roundPosition(x), y: roundPosition(y) }
  };
}

export function forceLayout(
  nodes: EntityFlowNode[],
  edges: RelationshipFlowEdge[],
  options: ForceLayoutOptions = {}
): { nodes: EntityFlowNode[]; edges: RelationshipFlowEdge[] } {
  const size = options.size ?? defaultSize;
  const random = seededRandom(options.seed ?? 1);
  const simulationNodes: SimulationNode[] = nodes.map((node) => ({
    id: node.id,
    x: random() * size.width,
    y: random() * size.height
  }));
  const links = edges.map((edge) => ({ source: edge.source, target: edge.target }));
  const iterations = options.iterations ?? 160;

  const simulation = forceSimulation<SimulationNode>(simulationNodes)
    .randomSource(random)
    .force(
      "link",
      forceLink<SimulationNode, { source: string; target: string }>(links).id((node) => node.id).distance(130).strength(0.4)
    )
    .force("charge", forceManyBody().strength(-260))
    .force("center", forceCenter(size.width / 2, size.height / 2))
    .force("collide", forceCollide<SimulationNode>().radius(74))
    .stop();

  for (let i = 0; i < iterations; i += 1) simulation.tick();

  const positionById = new Map(simulationNodes.map((node) => [node.id, node]));
  return {
    nodes: nodes.map((node) => {
      const position = positionById.get(node.id);
      return cloneNodeWithPosition(node, position?.x ?? 0, position?.y ?? 0);
    }),
    edges
  };
}

function hopMap(focusId: string, edges: RelationshipFlowEdge[], hops: number) {
  const result = new Map<string, number>([[focusId, 0]]);
  const queue: Array<{ id: string; depth: number }> = [{ id: focusId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || current.depth >= hops) continue;

    for (const next of neighbors(current.id, edges, { hops: 1 })) {
      if (result.has(next)) continue;
      const depth = current.depth + 1;
      result.set(next, depth);
      queue.push({ id: next, depth });
    }
  }

  return result;
}

export function ringLayout(
  focusId: string,
  nodes: EntityFlowNode[],
  edges: RelationshipFlowEdge[],
  options: RingLayoutOptions = {}
): { nodes: EntityFlowNode[]; edges: RelationshipFlowEdge[] } {
  const size = options.size ?? defaultSize;
  const maxHops = Math.max(1, options.hops ?? 2);
  const radiusStep = options.radiusStep ?? 120;
  const hopsById = hopMap(focusId, edges, maxHops);
  const center = { x: size.width / 2, y: size.height / 2 };
  const visibleIds = new Set(hopsById.keys());
  const rings = new Map<number, EntityFlowNode[]>();

  for (const node of nodes) {
    const hop = hopsById.get(node.id);
    if (hop === undefined || hop === 0) continue;
    const ring = rings.get(hop) ?? [];
    ring.push(node);
    rings.set(hop, ring);
  }

  const positioned = nodes
    .filter((node) => visibleIds.has(node.id))
    .map((node) => {
      const hop = hopsById.get(node.id) ?? 0;
      if (hop === 0) return cloneNodeWithPosition(node, center.x, center.y);

      const ring = rings.get(hop) ?? [node];
      const index = ring.findIndex((ringNode) => ringNode.id === node.id);
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / ring.length;
      const radius = radiusStep * hop;
      return cloneNodeWithPosition(node, center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius);
    });

  return {
    nodes: positioned,
    edges: edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target))
  };
}

export function regionsLayout(
  nodes: EntityFlowNode[],
  edges: RelationshipFlowEdge[],
  options: RegionsLayoutOptions
): { nodes: GraphFlowNode[]; edges: RelationshipFlowEdge[] } {
  const padding = options.padding ?? 40;
  const sectionById = new Map(options.sections.map((section) => [section.id, section]));
  const sectionIds = Array.from(
    new Set(nodes.map((node) => node.data.entity.primarySectionId ?? node.data.sectionIds[0] ?? "unassigned"))
  );

  const regionGraph = new dagre.graphlib.Graph();
  regionGraph.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 100 });
  regionGraph.setDefaultEdgeLabel(() => ({}));

  for (const sectionId of sectionIds) {
    regionGraph.setNode(sectionId, { width: 280, height: 190 });
  }

  for (const edge of edges) {
    const source = nodes.find((node) => node.id === edge.source)?.data.entity.primarySectionId;
    const target = nodes.find((node) => node.id === edge.target)?.data.entity.primarySectionId;
    if (source && target && source !== target) regionGraph.setEdge(source, target);
  }

  dagre.layout(regionGraph);

  const regionNodes: RegionFlowNode[] = sectionIds.map((sectionId) => {
    const section = sectionById.get(sectionId);
    const layout = regionGraph.node(sectionId) ?? { x: 0, y: 0, width: 280, height: 190 };
    return {
      id: `region-${sectionId}`,
      type: "region",
      position: {
        x: roundPosition(layout.x - layout.width / 2),
        y: roundPosition(layout.y - layout.height / 2)
      },
      width: layout.width,
      height: layout.height,
      measured: { width: layout.width, height: layout.height },
      data: {
        section,
        title: section?.title ?? sectionId,
        kind: section?.kind ?? "Custom",
        sectionId
      },
      selectable: true,
      draggable: false,
      zIndex: 0
    };
  });

  const grouped = new Map<string, EntityFlowNode[]>();
  for (const node of nodes) {
    const sectionId = node.data.entity.primarySectionId ?? node.data.sectionIds[0] ?? "unassigned";
    const group = grouped.get(sectionId) ?? [];
    group.push(node);
    grouped.set(sectionId, group);
  }

  const childNodes = nodes.map((node) => {
    const sectionId = node.data.entity.primarySectionId ?? node.data.sectionIds[0] ?? "unassigned";
    const group = grouped.get(sectionId) ?? [node];
    const index = group.findIndex((item) => item.id === node.id);
    const columns = Math.max(1, Math.ceil(Math.sqrt(group.length)));
    const x = padding + (index % columns) * 150;
    const y = padding + 32 + Math.floor(index / columns) * 74;

    return {
      ...cloneNodeWithPosition(node, x, y),
      parentId: `region-${sectionId}`,
      extent: "parent" as const,
      draggable: false
    };
  });

  return {
    nodes: [...regionNodes, ...childNodes],
    edges: edges.map((edge) => {
      const sourceSection = nodes.find((node) => node.id === edge.source)?.data.entity.primarySectionId;
      const targetSection = nodes.find((node) => node.id === edge.target)?.data.entity.primarySectionId;
      const crossRegion = Boolean(sourceSection && targetSection && sourceSection !== targetSection);
      return {
        ...edge,
        style: crossRegion ? { ...edge.style, opacity: 0.42 } : edge.style,
        data: edge.data ? { ...edge.data, dimmed: crossRegion ? true : edge.data.dimmed } : edge.data
      };
    })
  };
}
