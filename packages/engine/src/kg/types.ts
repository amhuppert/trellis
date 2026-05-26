import type { Edge, Node } from "@xyflow/react";
import type { Entity, Relationship, Section } from "../schemas";

export type EntityFlowNodeData = {
  entity: Entity;
  degree: number;
  selected: boolean;
  dimmed: boolean;
  sectionIds: string[];
  compact?: boolean;
  onActivate?: (entityId: string) => void;
};

export type EntityFlowNode = Node<EntityFlowNodeData, "entity">;

export type RegionFlowNodeData = {
  section?: Section;
  title: string;
  kind: Section["kind"] | "Custom";
  sectionId: string;
};

export type RegionFlowNode = Node<RegionFlowNodeData, "region">;

export type RelationshipFlowEdgeData = {
  relationship: Relationship;
  strength: "weak" | "medium" | "strong";
  label?: string;
  dimmed: boolean;
};

export type RelationshipFlowEdge = Edge<RelationshipFlowEdgeData, "relationship">;

export type GraphFlowNode = EntityFlowNode | RegionFlowNode;

export type FlowGraph = {
  nodes: EntityFlowNode[];
  edges: RelationshipFlowEdge[];
};

export type PositionedFlowGraph<TNode extends Node = EntityFlowNode> = {
  nodes: TNode[];
  edges: RelationshipFlowEdge[];
};
