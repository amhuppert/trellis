import type { EdgeTypes, NodeTypes } from "@xyflow/react";
import { RelationshipEdge } from "./edges/RelationshipEdge";
import { EntityNode } from "./nodes/EntityNode";
import { RegionNode } from "./nodes/RegionNode";

export { RelationshipEdge } from "./edges/RelationshipEdge";
export { EntityNode, EntityNodeActivationContext } from "./nodes/EntityNode";
export { RegionNode } from "./nodes/RegionNode";
export { GraphCanvas } from "./GraphCanvas";
export { GraphToolbar } from "./GraphToolbar";
export { GraphView } from "./GraphView";
export { MiniGraph } from "./MiniGraph";
export { SectionHeaderGraph } from "./SectionHeaderGraph";
export type { GraphCanvasProps } from "./GraphCanvas";
export type { GraphToolbarProps, GraphTableRow } from "./GraphToolbar";
export type { MiniGraphProps } from "./MiniGraph";
export type { SectionHeaderGraphProps } from "./SectionHeaderGraph";

export const nodeTypes = {
  entity: EntityNode,
  region: RegionNode
} satisfies NodeTypes;

export const edgeTypes = {
  relationship: RelationshipEdge
} satisfies EdgeTypes;
