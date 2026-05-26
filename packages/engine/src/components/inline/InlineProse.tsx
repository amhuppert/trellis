import React from "react";
import type { ReactNode } from "react";
import type { Entity } from "../../schemas";
import { EntityRef } from "./EntityRef";

const inlineTokenPattern = /<(e|em|code)\s*([^>]*)>([\s\S]*?)<\/\1>/g;
const entityIdPattern = /\bid\s*=\s*["']([^"']+)["']/;

export type InlineProseProps = {
  text: string;
  onOpenEntity: (id: string) => void;
  entities?: Entity[];
  onSeeEntityInGraph?: (id: string) => void;
};

type ParseContext = {
  onOpenEntity: (id: string) => void;
  entities?: Entity[];
  onSeeEntityInGraph?: (id: string) => void;
};

function parseInlineProse(text: string, context: ParseContext, keyPrefix = "ip"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;
  const pattern = new RegExp(inlineTokenPattern);
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    const [, tag, attrs, inner] = match;
    const children = parseInlineProse(inner, context, `${keyPrefix}-${index}`);
    const key = `${keyPrefix}-${index++}`;

    if (tag === "em") {
      nodes.push(<em key={key}>{children}</em>);
    }

    if (tag === "code") {
      nodes.push(
        <code key={key} className="rounded-xs bg-surface-3 px-1.5 py-0.5 font-mono text-code text-ink">
          {children}
        </code>
      );
    }

    if (tag === "e") {
      const id = attrs.match(entityIdPattern)?.[1] ?? "";
      const fullMatch = match[0];

      if (!id) {
        nodes.push(fullMatch);
      } else {
        const entity = context.entities?.find((candidate) => candidate.id === id);

        if (context.entities && !entity) {
          nodes.push(
            <span
              key={key}
              className="trellis-entity-ref-unresolved font-mono text-coral-ink"
              data-debug="unresolved-entity"
              data-entity-id={id}
            >
              {children}
            </span>
          );
          cursor = match.index + match[0].length;
          continue;
        }

        nodes.push(
          <EntityRef
            key={key}
            entity={entity}
            id={id}
            onOpen={context.onOpenEntity}
            onSeeInGraph={context.onSeeEntityInGraph}
          >
            {children}
          </EntityRef>
        );
      }
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export function InlineProse({ text, onOpenEntity, entities, onSeeEntityInGraph }: InlineProseProps) {
  return <>{parseInlineProse(text, { onOpenEntity, entities, onSeeEntityInGraph })}</>;
}
