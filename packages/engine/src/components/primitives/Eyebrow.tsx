import React from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

export const eyebrowVariants = cva("text-eyebrow", {
  variants: {
    color: {
      default: "text-ink-3",
      sage: "text-sage-ink",
      coral: "text-coral",
      butter: "text-butter-ink"
    }
  },
  defaultVariants: {
    color: "default"
  }
});

export type EyebrowProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof eyebrowVariants>;

export function Eyebrow({ className, color, ...props }: EyebrowProps) {
  return <div className={cn(eyebrowVariants({ color }), className)} {...props} />;
}
