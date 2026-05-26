import React from "react";
import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils";

export const inlineTagVariants = cva(
  "inline-flex items-center rounded-sm bg-surface-3 px-2 py-1 font-mono text-mono font-medium uppercase leading-none text-ink-2"
);

export type InlineTagProps = HTMLAttributes<HTMLSpanElement>;

export function InlineTag({ className, ...props }: InlineTagProps) {
  return <span className={cn(inlineTagVariants(), className)} {...props} />;
}
