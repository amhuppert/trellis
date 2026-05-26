import React from "react";
import type { EntityType } from "../../schemas";
import type { GraphMode } from "../shell/reader-state";
import { Button, InlineTag } from "../primitives";
import { cn } from "../../utils";

export type RelationshipStrength = "weak" | "medium" | "strong";

export type GraphTableRow = {
  id: string;
  label: string;
  neighbors: string[];
};

export type GraphToolbarProps = {
  availableTypes: readonly EntityType[];
  search: string;
  types: Set<EntityType>;
  minStrength: RelationshipStrength;
  tableRows?: GraphTableRow[];
  graphMode?: GraphMode;
  hops?: 1 | 2 | 3;
  showHops?: boolean;
  onSearch: (text: string) => void;
  onTypesChange: (types: Set<EntityType>) => void;
  onStrengthChange: (min: RelationshipStrength) => void;
  onResetLayout: () => void;
  onGraphModeChange?: (mode: GraphMode) => void;
  onHopsChange?: (hops: 1 | 2 | 3) => void;
};

const strengths: RelationshipStrength[] = ["weak", "medium", "strong"];

export function GraphToolbar({
  availableTypes,
  search,
  types,
  minStrength,
  tableRows = [],
  graphMode,
  hops = 2,
  showHops = false,
  onSearch,
  onTypesChange,
  onStrengthChange,
  onResetLayout,
  onGraphModeChange,
  onHopsChange
}: GraphToolbarProps) {
  const [tableOpen, setTableOpen] = React.useState(false);

  const toggleType = (type: EntityType) => {
    const next = new Set(types);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    onTypesChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border-soft bg-surface px-4 py-3" role="toolbar" aria-label="Graph tools">
      <label className="min-w-52 flex-1">
        <span className="sr-only">Search graph</span>
        <input
          type="search"
          role="searchbox"
          aria-label="Search graph"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search graph"
          className="h-9 w-full rounded-md border border-border-soft bg-surface-2 px-3 font-sans text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-border-hi focus:ring-2 focus:ring-[var(--color-accent-coral-soft)]"
        />
      </label>

      <div className="flex flex-wrap items-center gap-1.5" aria-label="Entity type filters">
        <button
          type="button"
          onClick={() => onTypesChange(new Set())}
          className={cn(
            "rounded-sm border border-border-soft bg-surface px-2 py-1 font-mono text-[10px] font-semibold uppercase text-ink-2",
            types.size === 0 ? "border-border-hi bg-accent-coral-bg text-coral-ink" : ""
          )}
        >
          All
        </button>
        {availableTypes.map((type) => (
          <button key={type} type="button" aria-pressed={types.has(type)} onClick={() => toggleType(type)} className="rounded-sm">
            <InlineTag className={types.has(type) ? "bg-accent-coral-bg text-coral-ink ring-1 ring-[var(--color-accent-coral)]" : ""}>
              {type}
            </InlineTag>
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase text-ink-3">
        <span>Minimum relationship strength</span>
        <input
          aria-label="Minimum relationship strength"
          type="range"
          min={0}
          max={2}
          step={1}
          value={strengths.indexOf(minStrength)}
          onChange={(event) => onStrengthChange(strengths[Number(event.target.value)] ?? "medium")}
          className="w-24 accent-[var(--color-accent-sage)]"
        />
        <span className="min-w-12 text-ink-2">{minStrength}</span>
      </label>

      {showHops ? (
        <div className="flex items-center gap-1 rounded-md border border-border-soft bg-surface-2 p-1" aria-label="Spotlight hops">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={hops === value}
              onClick={() => onHopsChange?.(value as 1 | 2 | 3)}
              className={cn(
                "h-7 w-7 rounded-sm font-mono text-[11px] font-semibold text-ink-3",
                hops === value ? "bg-accent-sage-bg text-accent-sage" : "hover:bg-surface-3"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      ) : null}

      <Button variant="secondary" size="sm" onClick={onResetLayout}>
        Reset layout
      </Button>

      {graphMode && onGraphModeChange ? (
        <div className="ml-auto flex items-center gap-1 rounded-md border border-border-soft bg-surface-2 p-1" aria-label="Graph mode">
          {([
            ["atlas", "Atlas"],
            ["spotlight", "Spotlight"],
            ["regions", "Regions"]
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={graphMode === mode}
              onClick={() => onGraphModeChange(mode)}
              className={cn(
                "rounded-sm px-2.5 py-1.5 text-xs font-semibold text-ink-3",
                graphMode === mode ? "bg-surface text-coral-ink shadow-sm" : "hover:bg-surface-3"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={graphMode && onGraphModeChange ? "" : "ml-auto"}>
        <Button variant="ghost" size="sm" onClick={() => setTableOpen(true)}>
          View as table
        </Button>
      </div>

      {tableOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Graph table"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/20 p-6"
          onClick={() => setTableOpen(false)}
        >
          <div className="max-h-[70vh] w-full max-w-2xl overflow-auto rounded-md border border-border bg-surface p-4 shadow-pop" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="font-serif text-xl font-medium text-ink">Graph table</h2>
              <Button variant="secondary" size="sm" onClick={() => setTableOpen(false)}>
                Close
              </Button>
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead className="font-mono text-[10px] uppercase text-ink-3">
                <tr>
                  <th className="border-b border-border-soft py-2 pr-4">Entity</th>
                  <th className="border-b border-border-soft py-2">Neighbors</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length > 0 ? (
                  tableRows.map((row) => (
                    <tr key={row.id}>
                      <td className="border-b border-border-soft py-2 pr-4 font-mono text-coral-ink">{row.label}</td>
                      <td className="border-b border-border-soft py-2 text-ink-2">{row.neighbors.join(", ") || "None"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-ink-3" colSpan={2}>
                      No visible graph rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
