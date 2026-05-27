import React from "react";
import type { Block, Entity } from "../../schemas";
import { cn } from "../../utils";
import { InlineProse } from "../inline";

export type CalloutProps = Extract<Block, { kind: "callout" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
  entities?: Entity[];
};

const noop = () => undefined;

const toneStyles = {
  info: {
    root: "bg-sage-bg",
    glyph: "bg-sage text-bg",
    title: "text-sage-ink",
    mark: "i",
    body: "text-ink"
  },
  warn: {
    root: "bg-butter-bg",
    glyph: "bg-butter-ink text-bg",
    title: "text-butter-ink",
    mark: "!",
    body: "text-ink"
  },
  aside: {
    root: "bg-surface-2",
    glyph: "bg-surface-3 text-ink-3",
    title: "text-ink-3",
    mark: "·",
    body: "text-ink-3"
  },
  quote: {
    root: "bg-coral-bg",
    glyph: "bg-coral text-bg",
    title: "text-coral-ink",
    mark: "“",
    body: "text-ink italic"
  }
} as const;

export function Callout({
  anchorId,
  tone = "info",
  title,
  body,
  onOpenEntity = noop,
  onSeeEntityInGraph,
  entities
}: CalloutProps) {
  const styles = toneStyles[tone];

  return (
    <aside
      id={anchorId}
      className={cn(
        "grid grid-cols-[28px_1fr] gap-3.5 rounded-2xl border border-border-soft px-5 py-4 text-ink shadow-sm",
        styles.root
      )}
      data-block-kind="callout"
      data-tone={tone}
    >
      <div
        className={cn(
          "flex size-6 items-center justify-center rounded-pill font-serif text-label font-bold",
          styles.glyph
        )}
        aria-hidden="true"
      >
        {styles.mark}
      </div>
      <div>
        <div className={cn("text-label font-bold", styles.title)}>
          <InlineProse text={title} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
        </div>
        <div className={cn("mt-1 font-serif text-label leading-relaxed", styles.body)}>
          <InlineProse text={body} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
        </div>
      </div>
    </aside>
  );
}
