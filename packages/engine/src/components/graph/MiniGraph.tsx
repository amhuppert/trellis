import React from "react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  forceLayout,
  neighborSet,
  toFlowGraph,
  type EntityFlowNode,
  type RelationshipFlowEdge
} from "../../kg";
import { useReader } from "../shell/AppShell";
import { RelationshipEdge } from "./edges/RelationshipEdge";
import { EntityNode } from "./nodes/EntityNode";

const miniNodeTypes = { entity: EntityNode };
const miniEdgeTypes = { relationship: RelationshipEdge };

export type MiniGraphProps = {
  entityIds: string[];
  expand?: number;
  width: number;
  height: number;
  onActivate?: (entityId: string) => void;
};

function subgraph(nodes: EntityFlowNode[], edges: RelationshipFlowEdge[], entityIds: string[], expand: number) {
  const ids = new Set(entityIds);
  for (const entityId of entityIds) {
    for (const neighborId of neighborSet(entityId, edges, { hops: expand })) ids.add(neighborId);
  }

  const filteredNodes = nodes.filter((node) => ids.has(node.id));
  const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));
  return {
    nodes: filteredNodes,
    edges: edges.filter((edge) => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target))
  };
}

function MiniGraphInner({ entityIds, expand = 1, width, height, onActivate }: MiniGraphProps) {
  const { report } = useReader();

  if (!report.kg || entityIds.length === 0) {
    return <div className="trellis-mini-graph" style={{ width, height }} aria-hidden="true" />;
  }

  const flow = toFlowGraph(report.kg, report.sections);
  const scoped = subgraph(flow.nodes, flow.edges, entityIds, expand);
  const layouted = forceLayout(
    scoped.nodes.map((node) => ({
      ...node,
      draggable: false,
      selectable: false,
      data: {
        ...node.data,
        compact: true,
        onActivate
      }
    })),
    scoped.edges.map((edge) => ({
      ...edge,
      selectable: false,
      focusable: false
    })),
    { seed: 11, iterations: 90, size: { width, height } }
  );

  return (
    <div className="trellis-mini-graph" style={{ width, height }} data-mini-graph>
      <ReactFlow
        nodes={layouted.nodes}
        edges={layouted.edges}
        nodeTypes={miniNodeTypes}
        edgeTypes={miniEdgeTypes}
        onNodeClick={(_event, node) => onActivate?.(node.id)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

export function MiniGraph(props: MiniGraphProps) {
  return (
    <ReactFlowProvider>
      <MiniGraphInner {...props} />
    </ReactFlowProvider>
  );
}
