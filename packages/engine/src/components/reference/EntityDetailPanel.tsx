import React from "react";
import type { Entity, Relationship, Section } from "../../schemas";
import { Button, Card, Eyebrow } from "../primitives";

export type EntityDetailPanelProps = {
  entity: Entity;
  relationships: Relationship[];
  sections: Section[];
  entities?: Entity[];
  onOpenSection: (id: string) => void;
  onOpenEntity: (id: string) => void;
  onSeeInGraph: (id: string) => void;
  onClose: () => void;
};

function MiniGraphIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="7" cy="7" r="1.8" fill="currentColor" />
      <circle cx="2.4" cy="3" r="1.3" />
      <circle cx="11.6" cy="3" r="1.3" />
      <circle cx="3" cy="11.2" r="1.3" />
      <circle cx="11" cy="11.2" r="1.3" />
      <path d="M7 7 2.4 3M7 7l4.6-4M7 7l-4 4.2M7 7l4 4.2" />
    </svg>
  );
}

export function EntityDetailPanel({
  entity,
  relationships,
  sections,
  entities = [],
  onOpenSection,
  onOpenEntity,
  onSeeInGraph,
  onClose
}: EntityDetailPanelProps) {
  const primarySection = sections.find((section) => section.id === entity.primarySectionId);
  const entitiesById = React.useMemo(() => new Map(entities.map((item) => [item.id, item])), [entities]);
  const outgoing = relationships.filter((relationship) => relationship.from === entity.id);
  const incoming = relationships.filter((relationship) => relationship.to === entity.id);
  const hasRelationships = outgoing.length > 0 || incoming.length > 0;

  const entityName = (id: string) => entitiesById.get(id)?.name ?? id;

  return (
    <Card className="sticky top-20">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
          {entity.type}
        </span>
        <button
          type="button"
          aria-label="Close entity detail"
          className="border-0 bg-transparent p-0 text-[1.125rem] leading-none text-ink-3"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <h2 className="m-0 mt-2 font-mono text-[1.375rem] font-semibold leading-snug text-coral-ink">{entity.name}</h2>
      <div className="mt-3 font-serif text-[1rem] leading-relaxed text-ink">{entity.shortDef}</div>

      {primarySection ? (
        <Button className="mt-4 w-full justify-between rounded-lg" onClick={() => onOpenSection(primarySection.id)}>
          <span>
            Open {primarySection.n ? `${primarySection.n} · ` : ""}
            {primarySection.title}
          </span>
          <span aria-hidden="true">→</span>
        </Button>
      ) : null}

      <Button
        variant="secondary"
        className="mt-2 w-full justify-between rounded-lg"
        onClick={() => onSeeInGraph(entity.id)}
      >
        <span className="inline-flex items-center gap-2">
          <MiniGraphIcon />
          See in knowledge graph
        </span>
        <span aria-hidden="true">→</span>
      </Button>

      {hasRelationships ? (
        <section className="mt-5 border-t border-border-soft pt-4" aria-labelledby="trellis-relationships-title">
          <Eyebrow id="trellis-relationships-title">Relationships</Eyebrow>
          <div className="mt-2 grid gap-1.5">
            {outgoing.map((relationship) => {
              const otherName = entityName(relationship.to);
              const label = `${relationship.type} → ${otherName}`;
              return (
                <button
                  key={relationship.id}
                  type="button"
                  aria-label={label}
                  className="border-0 bg-transparent px-0 py-1 text-left font-mono text-mono text-ink-2"
                  onClick={() => onOpenEntity(relationship.to)}
                >
                  <span className="text-coral">{relationship.type}</span>
                  <span className="text-ink-4"> → </span>
                  <span className="font-semibold text-coral-ink">{otherName}</span>
                </button>
              );
            })}
            {incoming.map((relationship) => {
              const otherName = entityName(relationship.from);
              const label = `${otherName} → ${relationship.type} (this)`;

              return (
                <button
                  key={relationship.id}
                  type="button"
                  aria-label={label}
                  className="border-0 bg-transparent px-0 py-1 text-left font-mono text-mono text-ink-2"
                  onClick={() => onOpenEntity(relationship.from)}
                >
                  <span className="font-semibold text-coral-ink">{otherName}</span>
                  <span className="text-ink-4"> → </span>
                  <span className="text-coral">{relationship.type}</span>
                  <span className="text-ink-4"> (this)</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </Card>
  );
}
