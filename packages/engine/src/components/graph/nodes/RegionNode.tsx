import React from "react";
import type { NodeProps } from "@xyflow/react";
import type { RegionFlowNode } from "../../../kg";
import { sectionKindColor, tokenVar } from "../../../kg";

export function RegionNode({ data }: NodeProps<RegionFlowNode>) {
  const color = tokenVar(sectionKindColor(data.kind));

  return (
    <div
      data-region-id={data.sectionId}
      className="h-full w-full rounded-md border bg-surface-2 p-3 shadow-sm"
      style={{ borderColor: color }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="truncate font-serif text-lg font-medium text-ink">{data.title}</div>
        <div className="shrink-0 rounded-sm bg-surface px-2 py-1 font-mono text-[9px] font-semibold uppercase text-ink-3">
          {data.kind}
        </div>
      </div>
    </div>
  );
}
