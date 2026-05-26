import React from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import type { Entity } from "../../schemas";
import { Button, InlineTag } from "../primitives";
import { cn } from "../../utils";

export type HoverEntity = Pick<Entity, "id" | "name" | "type" | "shortDef" | "primarySectionId"> & {
  primarySectionLabel?: string;
};

export type EntityHoverCardProps = Omit<ComponentPropsWithoutRef<typeof HoverCard.Content>, "children"> & {
  entity: HoverEntity;
  onOpen: (id: string) => void;
  onSeeInGraph?: (id: string) => void;
  onRequestClose?: () => void;
};

export const EntityHoverCard = forwardRef<ElementRef<typeof HoverCard.Content>, EntityHoverCardProps>(
  ({ className, entity, onOpen, onSeeInGraph, onRequestClose, ...props }, ref) => {
    const sectionCue = entity.primarySectionLabel ?? entity.primarySectionId;

    return (
      <HoverCard.Content
        ref={ref}
        align="center"
        side="bottom"
        sideOffset={6}
        className={cn(
          "z-50 w-80 rounded-xl border border-border bg-surface px-4 py-3.5 text-ink shadow-pop outline-none data-[state=open]:animate-in",
          className
        )}
        {...props}
      >
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-mono text-label font-semibold text-coral-ink">{entity.name}</div>
          <InlineTag>{entity.type}</InlineTag>
        </div>
        <div className="mt-2 text-body font-serif text-ink">{entity.shortDef}</div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-border-soft pt-3">
          <span className="min-w-0 truncate text-caption text-ink-3">{sectionCue ? `§ ${sectionCue}` : "§ unresolved"}</span>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                onSeeInGraph?.(entity.id);
                onRequestClose?.();
              }}
            >
              See in graph
            </Button>
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onOpen(entity.id);
                onRequestClose?.();
              }}
            >
              Open
            </Button>
          </div>
        </div>
      </HoverCard.Content>
    );
  }
);
EntityHoverCard.displayName = "EntityHoverCard";
