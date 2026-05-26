import React from "react";
import type { Section } from "../../schemas";
import { MiniGraph } from "./MiniGraph";

export type SectionHeaderGraphProps = {
  section: Section;
};

export function SectionHeaderGraph({ section }: SectionHeaderGraphProps) {
  return (
    <div className="trellis-section-header-graph" aria-label={`${section.title} neighborhood graph`}>
      <MiniGraph entityIds={section.relatedEntityIds} expand={1} width={520} height={110} />
    </div>
  );
}
