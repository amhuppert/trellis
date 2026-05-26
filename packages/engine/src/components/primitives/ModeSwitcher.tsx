import React from "react";
import { SegmentedControl } from "./SegmentedControl";

export type ReaderMode = "orientation" | "guided" | "reference" | "synthesis" | "graph";

export const readerModeItems: Array<{ id: ReaderMode; label: string }> = [
  { id: "orientation", label: "Orientation" },
  { id: "guided", label: "Guided" },
  { id: "reference", label: "Reference" },
  { id: "synthesis", label: "Synthesis" },
  { id: "graph", label: "Graph" }
];

export type ModeSwitcherProps = {
  mode: ReaderMode;
  onChange: (mode: ReaderMode) => void;
  className?: string;
};

export function ModeSwitcher({ mode, onChange, className }: ModeSwitcherProps) {
  return (
    <SegmentedControl
      aria-label="Reader mode"
      className={className}
      items={readerModeItems}
      value={mode}
      onChange={(id) => onChange(id as ReaderMode)}
    />
  );
}
