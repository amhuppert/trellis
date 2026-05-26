import React from "react";
import { Button } from "../primitives";

export type SectionPaginationTarget = {
  id: string;
  n?: string;
  title: string;
};

export type SectionPaginationProps = {
  prev?: SectionPaginationTarget;
  next?: SectionPaginationTarget;
  onOpen: (id: string) => void;
};

const label = (prefix: string, target: SectionPaginationTarget, suffix = "") =>
  `${prefix} · ${[target.n, target.title].filter(Boolean).join(" · ")}${suffix}`;

export function SectionPagination({ prev, next, onOpen }: SectionPaginationProps) {
  return (
    <nav className="trellis-section-pagination" aria-label="Section pagination">
      <Button
        variant="secondary"
        className="trellis-section-pagination__button trellis-section-pagination__button--prev"
        disabled={!prev}
        onClick={() => prev && onOpen(prev.id)}
      >
        {prev ? label("← Previous", prev) : "← Previous"}
      </Button>
      <Button
        variant="secondary"
        className="trellis-section-pagination__button trellis-section-pagination__button--next"
        disabled={!next}
        onClick={() => next && onOpen(next.id)}
      >
        {next ? label("Next", next, " →") : "Next →"}
      </Button>
    </nav>
  );
}

