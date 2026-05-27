import React from "react";
import type { Block, Entity } from "../../schemas";
import { InlineProse } from "../inline";
import { Button, Eyebrow } from "../primitives";

export type BeforeYouContinueProps = Extract<Block, { kind: "beforeContinue" }> & {
  nextSectionTitle?: string;
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
  onOpenSection?: (id: string) => void;
  entities?: Entity[];
};

const noop = () => undefined;

export function BeforeYouContinue({
  anchorId,
  body,
  nextSectionId,
  nextSectionTitle,
  onOpenEntity = noop,
  onSeeEntityInGraph,
  onOpenSection = noop,
  entities
}: BeforeYouContinueProps) {
  const label = nextSectionTitle ?? nextSectionId;

  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft bg-butter-bg px-5 py-5 text-ink shadow-sm"
      data-block-kind="beforeContinue"
    >
      <Eyebrow color="butter">BEFORE YOU CONTINUE</Eyebrow>
      <div className="mt-2.5 font-serif text-label leading-relaxed text-ink">
        <InlineProse text={body} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
      </div>
      <Button className="mt-3.5" onClick={() => onOpenSection(nextSectionId)} variant="primary">
        Continue to {label}
        <span aria-hidden="true">-&gt;</span>
      </Button>
    </section>
  );
}
