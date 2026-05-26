import React from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

export const cardVariants = cva("flex flex-col overflow-hidden rounded-lg border border-border-soft bg-surface text-ink", {
  variants: {
    padding: {
      none: "p-0",
      tight: "px-4 py-3.5",
      default: "p-5",
      loose: "px-7 py-6"
    }
  },
  defaultVariants: {
    padding: "default"
  }
});

export type CardProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>;

export function Card({ className, padding, ...props }: CardProps) {
  return <div className={cn(cardVariants({ padding }), className)} {...props} />;
}
