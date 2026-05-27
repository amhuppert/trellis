import React from "react";
import type { EntityType } from "../../schemas";
import type { EntityFlowNode, RelationshipFlowEdge } from "../../kg";
import { useReader } from "../shell/AppShell";
import { GraphCanvas } from "./GraphCanvas";
import { GraphToolbar } from "./GraphToolbar";

function visibleTypes(nodes: EntityFlowNode[]): EntityType[] {
  return Array.from(new Set(nodes.map((node) => node.data.entity.type))).sort();
}

export function GraphView() {
  const { report, state, setState } = useReader();
  const [search, setSearch] = React.useState("");
  const [types, setTypes] = React.useState<Set<EntityType>>(new Set());
  const [minStrength, setMinStrength] = React.useState<"weak" | "medium" | "strong">("medium");
  const [hops, setHops] = React.useState<1 | 2 | 3>(2);
  const [layoutTick, setLayoutTick] = React.useState(0);
  const [focusTrail, setFocusTrail] = React.useState<string[]>([]);
  const [visibleGraph, setVisibleGraph] = React.useState<{ nodes: EntityFlowNode[]; edges: RelationshipFlowEdge[] }>({
    nodes: [],
    edges: []
  });

  const allTypes = React.useMemo(
    () => visibleTypes((report.kg?.entities ?? []).map((entity) => ({
      id: entity.id,
      type: "entity" as const,
      position: { x: 0, y: 0 },
      data: {
        entity,
        degree: 0,
        selected: false,
        dimmed: false,
        sectionIds: []
      }
    }))),
    [report.kg?.entities]
  );

  const handleVisibleGraphChange = React.useCallback((nodes: EntityFlowNode[], edges: RelationshipFlowEdge[]) => {
    setVisibleGraph((current) => {
      const sameNodes = current.nodes.length === nodes.length && current.nodes.every((node, index) => node.id === nodes[index]?.id);
      const sameEdges = current.edges.length === edges.length && current.edges.every((edge, index) => edge.id === edges[index]?.id);
      return sameNodes && sameEdges ? current : { nodes, edges };
    });
  }, []);

  React.useEffect(() => {
    if (state.graphMode !== "spotlight" || !state.graphFocusId) return;
    setFocusTrail((current) => [state.graphFocusId!, ...current.filter((id) => id !== state.graphFocusId)].slice(0, 3));
  }, [state.graphFocusId, state.graphMode]);

  const nameById = React.useMemo(
    () => new Map((report.kg?.entities ?? []).map((entity) => [entity.id, entity.name])),
    [report.kg?.entities]
  );

  const handleGraphModeChange = React.useCallback(
    (graphMode: "atlas" | "spotlight" | "regions") => {
      setState((current) => {
        const section = report.sections.find((item) => item.id === current.sectionId);
        const focusId =
          graphMode === "spotlight"
            ? current.graphFocusId ?? section?.relatedEntityIds[0] ?? report.kg?.entities[0]?.id ?? null
            : graphMode === "atlas"
              ? null
              : current.graphFocusId;
        return { ...current, graphMode, graphFocusId: focusId };
      });
    },
    [report.kg?.entities, report.sections, setState]
  );

  if (!report.kg) {
    return (
      <main className="trellis-graph-view" data-view="graph">
        <div className="grid h-full place-items-center bg-bg text-ink-3" data-graph-mode={state.graphMode}>
          <p className="font-mono text-xs">No graph data.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="trellis-graph-view" data-view="graph">
      <GraphToolbar
        availableTypes={allTypes}
        graphMode={state.graphMode}
        search={search}
        types={types}
        minStrength={minStrength}
        showHops={state.graphMode === "spotlight"}
        hops={hops}
        onSearch={setSearch}
        onTypesChange={setTypes}
        onStrengthChange={setMinStrength}
        onResetLayout={() => setLayoutTick((tick) => tick + 1)}
        onGraphModeChange={handleGraphModeChange}
        onHopsChange={setHops}
      />
      {state.graphMode === "spotlight" && focusTrail.length > 0 ? (
        <div className="flex items-center gap-2 border-b border-border-soft bg-surface-2 px-4 py-2 font-mono text-[10px] text-ink-3">
          <span>Focus</span>
          {focusTrail.map((entityId) => (
            <button
              key={entityId}
              type="button"
              className="rounded-sm border border-border-soft bg-surface px-2 py-1 text-coral-ink"
              onClick={() => setState((current) => ({ ...current, graphFocusId: entityId }))}
            >
              {nameById.get(entityId) ?? entityId}
            </button>
          ))}
        </div>
      ) : null}
      <GraphCanvas
        search={search}
        types={types}
        minStrength={minStrength}
        hops={hops}
        layoutTick={layoutTick}
        onVisibleGraphChange={handleVisibleGraphChange}
      />
      <div className="sr-only" aria-live="polite">
        {state.graphMode} graph with {visibleGraph.nodes.length} entities
      </div>
    </main>
  );
}
