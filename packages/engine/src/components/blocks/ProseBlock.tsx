import React from "react";
import type { Block } from "../../schemas";
import { InlineProse } from "../inline";

export type ProseBlockProps = Extract<Block, { kind: "prose" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
};

const noop = () => undefined;

export function ProseBlock({ anchorId, body, onOpenEntity = noop, onSeeEntityInGraph }: ProseBlockProps) {
  return (
    <div
      id={anchorId}
      className="max-w-[var(--layout-reading-width)] text-body text-ink"
      data-block-kind="prose"
    >
      <InlineProse text={body} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
    </div>
  );
}
