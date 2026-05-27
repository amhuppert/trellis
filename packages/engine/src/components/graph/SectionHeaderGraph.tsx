import React from "react";
import type { Section } from "../../schemas";
import { useReader } from "../shell/AppShell";
import { MiniGraph } from "./MiniGraph";

export type SectionHeaderGraphProps = {
  section: Section;
};

export function SectionHeaderGraph({ section }: SectionHeaderGraphProps) {
  const { openEntity } = useReader();
  return (
    <div className="trellis-section-header-graph" aria-label={`${section.title} neighborhood graph`}>
      <MiniGraph
        entityIds={section.relatedEntityIds}
        expand={1}
        width={720}
        height={360}
        interactive
        onActivate={openEntity}
      />
    </div>
  );
}
