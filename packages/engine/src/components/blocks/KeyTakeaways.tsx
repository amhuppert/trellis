import React from "react";
import type { Block } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";

export type KeyTakeawaysProps = Extract<Block, { kind: "keyTakeaways" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
};

const noop = () => undefined;

export function KeyTakeaways({ anchorId, items, onOpenEntity = noop, onSeeEntityInGraph }: KeyTakeawaysProps) {
  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft bg-surface-2 px-6 py-5 text-ink shadow-sm"
      data-block-kind="keyTakeaways"
    >
      <Eyebrow color="coral">KEY TAKEAWAYS</Eyebrow>
      <ul className="mt-3 grid list-none gap-2.5 p-0">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="grid grid-cols-[20px_1fr] items-start gap-2.5">
            <span className="mt-2 size-1.5 rounded-pill bg-coral" aria-hidden="true" />
            <span className="font-serif text-label leading-relaxed text-ink">
              <InlineProse text={item} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
