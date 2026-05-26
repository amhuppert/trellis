import React from "react";
import type { Block } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";

export type CommonMisconceptionProps = Extract<Block, { kind: "misconception" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
};

const noop = () => undefined;

export function CommonMisconception({
  anchorId,
  claim,
  truth,
  onOpenEntity = noop,
  onSeeEntityInGraph
}: CommonMisconceptionProps) {
  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft bg-coral-bg px-6 py-5 text-ink shadow-sm"
      data-block-kind="misconception"
    >
      <Eyebrow color="coral">COMMON MISCONCEPTION</Eyebrow>
      <div className="mt-3">
        <div className="text-eyebrow text-ink-3">CLAIM</div>
        <div className="mt-1 font-serif text-h3 italic text-ink-3">
          <InlineProse text={claim} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
        </div>
      </div>
      <div className="mt-4 rounded-lg border-l-4 border-l-coral bg-surface px-4 py-3">
        <div className="text-eyebrow text-coral">TRUTH</div>
        <div className="mt-1 font-serif text-label leading-relaxed text-coral-ink">
          <InlineProse text={truth} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
        </div>
      </div>
    </section>
  );
}
