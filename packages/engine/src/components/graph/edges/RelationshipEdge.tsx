import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  MarkerType,
  type EdgeProps
} from "@xyflow/react";
import type { RelationshipFlowEdge } from "../../../kg";
import { relationshipTypeColor, tokenVar } from "../../../kg";

const strokeWidths: Record<"weak" | "medium" | "strong", number> = {
  weak: 1,
  medium: 1.5,
  strong: 2.5
};

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style
}: EdgeProps<RelationshipFlowEdge>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const strength = data?.strength ?? "medium";
  const color = tokenVar(relationshipTypeColor(data?.relationship.type ?? ""));
  const label = data?.label ?? data?.relationship.label ?? data?.relationship.type;
  const dimmed = data?.dimmed ?? false;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd ?? MarkerType.ArrowClosed}
        style={{
          stroke: color,
          strokeWidth: strokeWidths[strength],
          opacity: dimmed ? 0.28 : style?.opacity,
          ...style
        }}
      />
      {!dimmed && label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan rounded-sm border border-border-soft bg-surface px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase leading-none text-ink-3 shadow-sm"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none"
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
