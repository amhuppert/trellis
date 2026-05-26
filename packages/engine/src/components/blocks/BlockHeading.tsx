import React from "react";
import type { Block } from "../../schemas";
import { cn } from "../../utils";

export type BlockHeadingProps = Extract<Block, { kind: "heading" }>;

export function BlockHeading({ anchorId, level, text }: BlockHeadingProps) {
  const className = cn("text-ink", level === 2 ? "my-2.5 -mb-1 text-h2" : "my-2 text-h3");

  if (level === 3) {
    return (
      <h3 id={anchorId} className={className} data-block-kind="heading">
        {text}
      </h3>
    );
  }

  return (
    <h2 id={anchorId} className={className} data-block-kind="heading">
      {text}
    </h2>
  );
}
