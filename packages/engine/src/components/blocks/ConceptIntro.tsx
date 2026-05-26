import React from "react";
import type { Block } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";

export type ConceptIntroProps = Extract<Block, { kind: "conceptIntro" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
};

const noop = () => undefined;

export function ConceptIntro({ anchorId, title, body, onOpenEntity = noop, onSeeEntityInGraph }: ConceptIntroProps) {
  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft border-l-4 border-l-coral bg-surface px-7 py-6 text-ink shadow-sm"
      data-block-kind="conceptIntro"
    >
      <Eyebrow color="coral">CONCEPT INTRO</Eyebrow>
      <h2 className="mt-2 text-h2 text-ink">{title}</h2>
      <div className="mt-3.5 text-body text-ink">
        <InlineProse text={body} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
      </div>
    </section>
  );
}
