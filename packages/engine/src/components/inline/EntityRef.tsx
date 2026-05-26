import React from "react";
import type { ReactNode } from "react";
import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import type { HoverEntity } from "./EntityHoverCard";
import { EntityHoverCard } from "./EntityHoverCard";
import { cn } from "../../utils";

export type EntityRefProps = {
  id: string;
  children: ReactNode;
  onOpen: (id: string) => void;
  entity?: HoverEntity;
  onSeeInGraph?: (id: string) => void;
  className?: string;
  defaultOpen?: boolean;
  openDelay?: number;
};

export function EntityRef({
  id,
  children,
  onOpen,
  entity,
  onSeeInGraph,
  className,
  defaultOpen = false,
  openDelay = 140
}: EntityRefProps) {
  const [open, setOpen] = useState(defaultOpen);

  const setOpenIfMountedInBrowser = (nextOpen: boolean) => {
    if (typeof window !== "undefined") {
      setOpen(nextOpen);
    }
  };

  const handleOpen = () => onOpen(id);
  const fallbackEntity: HoverEntity | undefined =
    !entity && onSeeInGraph
      ? {
          id,
          name: typeof children === "string" ? children : id,
          type: "other",
          shortDef: "Open this entity in the knowledge graph."
        }
      : undefined;
  const hoverEntity = entity ?? fallbackEntity;

  return (
    <HoverCard.Root closeDelay={120} open={open} openDelay={openDelay} onOpenChange={setOpenIfMountedInBrowser}>
      <HoverCard.Trigger asChild>
        <button
          className={cn(
            "inline rounded-xs border-b border-dotted border-coral bg-coral-bg px-1.5 py-0.5 font-mono text-code font-semibold text-coral-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
            className
          )}
          data-entity-id={id}
          onClick={(event) => {
            event.preventDefault();
            handleOpen();
          }}
          onFocus={() => setOpenIfMountedInBrowser(true)}
          type="button"
        >
          {children}
        </button>
      </HoverCard.Trigger>
      {hoverEntity ? (
        <HoverCard.Portal>
          <EntityHoverCard
            entity={hoverEntity}
            onEscapeKeyDown={() => setOpenIfMountedInBrowser(false)}
            onOpen={onOpen}
            onRequestClose={() => setOpenIfMountedInBrowser(false)}
            onSeeInGraph={onSeeInGraph}
          />
        </HoverCard.Portal>
      ) : null}
    </HoverCard.Root>
  );
}
