import React from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils";

export type SegmentedControlItem = {
  id: string;
  label: ReactNode;
};

export const segmentedControlVariants = cva(
  "inline-flex items-center gap-1 rounded-pill border border-border-soft bg-surface p-1"
);

export const segmentedControlItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill px-3.5 py-1.5 font-mono text-mono font-semibold transition-colors duration-fast ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
  {
    variants: {
      active: {
        true: "bg-ink text-bg",
        false: "bg-transparent text-ink-2 hover:text-ink"
      }
    },
    defaultVariants: {
      active: false
    }
  }
);

export type SegmentedControlProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange"> & {
  items: SegmentedControlItem[];
  value: string;
  onChange: (id: string) => void;
};

export function SegmentedControl({ className, items, value, onChange, ...props }: SegmentedControlProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === value)
  );

  const selectIndex = (index: number) => {
    const next = items[index];
    if (!next) return;
    onChange(next.id);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectIndex((index + 1) % items.length);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectIndex((index - 1 + items.length) % items.length);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectIndex(items.length - 1);
    }
  };

  return (
    <div className={cn(segmentedControlVariants(), className)} role="radiogroup" {...props}>
      {items.map((item, index) => {
        const active = item.id === value;

        return (
          <button
            key={item.id}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            aria-checked={active}
            className={cn(segmentedControlItemVariants({ active }))}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            role="radio"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
