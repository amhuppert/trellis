import React from "react";
import type { KeyboardEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { EntityFlowNode } from "../../../kg";
import { entityTypeColor, tokenVar } from "../../../kg";
import { InlineTag } from "../../primitives";
import { cn } from "../../../utils";

export const EntityNodeActivationContext = React.createContext<((entityId: string) => void) | null>(null);

export function EntityNode({ data, selected, positionAbsoluteX, positionAbsoluteY }: NodeProps<EntityFlowNode>) {
  const activateFromContext = React.useContext(EntityNodeActivationContext);
  const activate = data.onActivate ?? activateFromContext ?? undefined;
  const token = entityTypeColor(data.entity.type);
  const isSelected = selected || data.selected;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    activate?.(data.entity.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${data.entity.name} (${data.entity.type})`}
      onClick={() => activate?.(data.entity.id)}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative min-w-36 rounded-md border bg-surface px-3 py-2 font-sans shadow-sm outline-none transition",
        "hover:ring-2 hover:ring-[var(--color-accent-coral-soft)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-coral)]",
        isSelected ? "border-border-hi shadow-pop" : "border-border-soft",
        data.compact ? "min-w-28 px-2 py-1.5" : "",
        data.dimmed ? "opacity-30" : "opacity-100"
      )}
      style={{
        borderColor: isSelected ? tokenVar(token) : undefined,
        boxShadow: isSelected ? "var(--shadow-pop)" : undefined
      }}
      data-entity-id={data.entity.id}
      data-entity-type={data.entity.type}
      data-layout-x={Math.round(positionAbsoluteX)}
      data-layout-y={Math.round(positionAbsoluteY)}
    >
      <Handle type="target" position={Position.Top} style={{ background: tokenVar(token), borderColor: tokenVar(token) }} />
      <Handle type="source" position={Position.Bottom} style={{ background: tokenVar(token), borderColor: tokenVar(token) }} />
      <Handle type="target" position={Position.Left} style={{ background: tokenVar(token), borderColor: tokenVar(token) }} />
      <Handle type="source" position={Position.Right} style={{ background: tokenVar(token), borderColor: tokenVar(token) }} />
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: tokenVar(token) }}
        />
        <span className={cn("min-w-0 truncate font-mono font-semibold text-coral-ink", data.compact ? "text-[10px]" : "text-[11px]")}>
          {data.entity.name}
        </span>
      </div>
      {!data.compact ? (
        <div className="mt-1 flex items-center justify-between gap-2">
          <InlineTag className="px-1.5 py-0.5 text-[9px]">{data.entity.type}</InlineTag>
          <span className="font-mono text-[9px] text-ink-3">{data.degree}</span>
        </div>
      ) : null}
    </div>
  );
}
