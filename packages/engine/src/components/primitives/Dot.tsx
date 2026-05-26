import React from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

export const dotVariants = cva("inline-block size-2 shrink-0 rounded-pill align-middle", {
  variants: {
    color: {
      sage: "bg-sage",
      coral: "bg-coral",
      butter: "bg-butter-ink",
      ink: "bg-ink"
    }
  },
  defaultVariants: {
    color: "ink"
  }
});

export type DotProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof dotVariants>;

export function Dot({ className, color, ...props }: DotProps) {
  return <span aria-hidden="true" className={cn(dotVariants({ color }), className)} {...props} />;
}
