import React from "react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill border border-transparent text-label font-bold transition-colors duration-fast ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-ink text-bg",
        secondary: "border-border-soft bg-surface text-ink hover:bg-surface-2",
        ghost: "bg-transparent text-ink-2 hover:text-ink"
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-3.5 py-2.5"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonOwnProps<TAs extends ElementType> = {
  as?: TAs;
  children?: ReactNode;
  className?: string;
} & VariantProps<typeof buttonVariants>;

export type ButtonProps<TAs extends ElementType = "button"> = ButtonOwnProps<TAs> &
  Omit<ComponentPropsWithoutRef<TAs>, keyof ButtonOwnProps<TAs>>;

export function Button<TAs extends ElementType = "button">({
  as,
  className,
  variant,
  size,
  type,
  ...props
}: ButtonProps<TAs>) {
  const Component = as ?? "button";
  const buttonType = Component === "button" && type === undefined ? "button" : type;

  return <Component className={cn(buttonVariants({ variant, size }), className)} type={buttonType} {...props} />;
}
