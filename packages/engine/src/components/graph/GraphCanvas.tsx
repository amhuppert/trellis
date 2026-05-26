import React from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  type NodeMouseHandler
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { EntityType } from "../../schemas";
import {
  applyFilters,
  forceLayout,
  neighborSet,
  regionsLayout,
  ringLayout,
  toFlowGraph,
  type EntityFlowNode,
  type GraphFlowNode,
  type RelationshipFlowEdge
} from "../../kg";
import type { KnowledgeGraph } from "../../schemas";
import { useReader } from "../shell/AppShell";
import { RelationshipEdge } from "./edges/RelationshipEdge";
import { EntityNode } from "./nodes/EntityNode";
import { RegionNode } from "./nodes/RegionNode";

const canvasNodeTypes = { entity: EntityNode, region: RegionNode };
const canvasEdgeTypes = { relationship: RelationshipEdge };
const emptyKg: KnowledgeGraph = { entities: [], relationships: [] };

export type GraphCanvasProps = {
  search: string;
  types: Set<EntityType>;
  minStrength: "weak" | "medium" | "strong";
  hops?: 1 | 2 | 3;
  layoutTick: number;
  onVisibleGraphChange?: (nodes: EntityFlowNode[], edges: RelationshipFlowEdge[]) => void;
};

function GraphCanvasInner({ search, types, minStrength, hops = 2, layoutTick, onVisibleGraphChange }: GraphCanvasProps) {
  const { report, state, openEntity, openSection, setState } = useReader();
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [actionEntityId, setActionEntityId] = React.useState<string | null>(null);

  const flowGraph = React.useMemo(
    () => toFlowGraph(report.kg ?? emptyKg, report.sections, { selectedEntityId: state.graphFocusId }),
    [report.kg, report.sections, state.graphFocusId]
  );

  const filtered = React.useMemo(
    () => applyFilters(flowGraph.nodes, flowGraph.edges, { type: types, search, minStrength }),
    [flowGraph.edges, flowGraph.nodes, minStrength, search, types]
  );

  const highlighted = React.useMemo(() => {
    if (!hoveredId) return filtered;
    const allowed = neighborSet(hoveredId, filtered.edges, { hops: 1, minStrength });
    return {
      nodes: filtered.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          dimmed: !allowed.has(node.id),
          selected: state.graphFocusId === node.id,
          onActivate: (entityId: string) => {
            setState((current) => ({ ...current, graphFocusId: entityId }));
            setActionEntityId(entityId);
          }
        }
      })),
      edges: filtered.edges.map((edge) => ({
        ...edge,
        data: {
          relationship: edge.data!.relationship,
          strength: edge.data?.strength ?? "medium",
          label: edge.data?.label,
          dimmed: !allowed.has(edge.source) || !allowed.has(edge.target)
        }
      }))
    };
  }, [filtered, hoveredId, minStrength, setState, state.graphFocusId]);

  const layouted = React.useMemo(() => {
    const nodes = highlighted.nodes.map((node) => ({
      ...node,
      selected: state.graphFocusId === node.id,
      data: {
        ...node.data,
        selected: state.graphFocusId === node.id,
        onActivate: (entityId: string) => {
          setState((current) => ({ ...current, graphFocusId: entityId }));
          setActionEntityId(entityId);
        }
      }
    }));

    if (state.graphMode === "spotlight") {
      const focusId = state.graphFocusId ?? nodes[0]?.id;
      if (!focusId) return { nodes, edges: highlighted.edges };
      return ringLayout(focusId, nodes, highlighted.edges, {
        hops,
        size: { width: 1180, height: 720 }
      });
    }

    if (state.graphMode === "regions") {
      return regionsLayout(nodes, highlighted.edges, { sections: report.sections, padding: 28 });
    }

    return forceLayout(nodes, highlighted.edges, {
      seed: 7 + layoutTick,
      iterations: 180,
      size: { width: 1180, height: 720 }
    });
  }, [highlighted.edges, highlighted.nodes, hops, layoutTick, report.sections, setState, state.graphFocusId, state.graphMode]);

  React.useEffect(() => {
    onVisibleGraphChange?.(
      layouted.nodes.filter((node): node is EntityFlowNode => node.type === "entity"),
      layouted.edges
    );
  }, [layouted.edges, layouted.nodes, onVisibleGraphChange]);

  const onNodeClick: NodeMouseHandler<GraphFlowNode> = (_event, node) => {
    if (node.type === "region") {
      openSection(node.data.sectionId);
      return;
    }

    setState((current) => ({ ...current, graphFocusId: node.id }));
    setActionEntityId(node.id);
  };

  const onNodeMouseEnter: NodeMouseHandler<GraphFlowNode> = (_event, node) => {
    if (node.type === "entity") setHoveredId(node.id);
  };

  const actionNode = layouted.nodes.find(
    (node): node is EntityFlowNode => node.type === "entity" && (node.id === actionEntityId || node.id === state.graphFocusId)
  );
  const actionEntity = actionNode?.data.entity;
  const actionSectionId = actionEntity?.primarySectionId;

  return (
    <div className="trellis-graph-canvas" data-graph-mode={state.graphMode}>
      <ReactFlow
        nodes={layouted.nodes}
        edges={layouted.edges.map((edge) => ({
          ...edge,
          markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-ink-3)" }
        }))}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={() => setHoveredId(null)}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.25}
        maxZoom={1.6}
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
        className="bg-bg"
      >
        <Background color="var(--color-border-soft)" gap={22} />
        <Controls position="bottom-left" />
      </ReactFlow>

      {actionEntity ? (
        <div className="absolute right-4 top-4 z-10 w-60 rounded-md border border-border bg-surface p-3 shadow-pop" role="dialog" aria-label={`${actionEntity.name} graph actions`}>
          <div className="font-mono text-[11px] font-semibold text-coral-ink">{actionEntity.name}</div>
          <div className="mt-1 text-xs text-ink-3">{actionEntity.type}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-border-soft bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-ink"
              onClick={() => openEntity(actionEntity.id)}
            >
              Open in Reference
            </button>
            {actionSectionId ? (
              <button
                type="button"
                className="rounded-md border border-border-soft bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-ink"
                onClick={() => openSection(actionSectionId)}
              >
                See in Guided
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
