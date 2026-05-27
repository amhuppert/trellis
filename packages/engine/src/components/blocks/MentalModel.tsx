import React from "react";
import type { Block, Entity } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";

export type MentalModelProps = Extract<Block, { kind: "mentalModel" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
  entities?: Entity[];
};

const noop = () => undefined;

export function MentalModel({
  anchorId,
  title,
  body,
  aside,
  onOpenEntity = noop,
  onSeeEntityInGraph,
  entities
}: MentalModelProps) {
  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft bg-sage-bg px-6 py-6 text-ink shadow-sm"
      data-block-kind="mentalModel"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-sage text-bg" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          >
            <path d="M7 1.5c-2.5 0-4 2-4 4 0 1.5.7 2.6 1.7 3.4v2.6h4.6V8.9C10.3 8.1 11 7 11 5.5c0-2-1.5-4-4-4z" />
            <path d="M5.5 12.5h3" />
          </svg>
        </div>
        <Eyebrow color="sage">MENTAL MODEL</Eyebrow>
      </div>
      <h2 className="mt-2.5 text-h3 text-ink">
        <InlineProse text={title} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
      </h2>
      <div className="mt-3 text-body text-ink">
        <InlineProse text={body} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
      </div>
      {aside ? (
        <aside className="mt-4 rounded-lg bg-butter-bg px-4 py-3 font-serif text-body italic text-ink-2">
          <InlineProse text={aside} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
        </aside>
      ) : null}
    </section>
  );
}
