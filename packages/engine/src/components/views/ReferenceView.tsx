import React from "react";
import type { SourceReference } from "../../schemas";
import { cn } from "../../utils";
import { Card, Eyebrow, Tabs, TabsContent, TabsList, TabsTrigger } from "../primitives";
import { EntityDetailPanel } from "../reference/EntityDetailPanel";
import { useReader } from "../shell/AppShell";

function sourceSubline(source: SourceReference) {
  switch (source.kind) {
    case "url":
      return source.host ?? new URL(source.href).host;
    case "code":
      return source.lineRange ? `${source.path}:${source.lineRange[0]}-${source.lineRange[1]}` : source.path;
    case "doc":
      return [source.host, source.locationHint].filter(Boolean).join(" · ");
    case "passage":
      return `${source.documentSourceId} · ${source.location}`;
  }
}

export function ReferenceView() {
  const { report, state, openEntity, openGraph, openSection, setState } = useReader();
  const entities = report.kg?.entities ?? [];
  const sources = report.sources;
  const focusedEntity = entities.find((entity) => entity.id === state.focusEntityId);

  return (
    <main className="trellis-view trellis-reference-view" data-view="reference">
      <div className="flex min-h-full items-start gap-6">
        <section className="min-w-0 flex-1" aria-labelledby="trellis-reference-title">
          <h1 id="trellis-reference-title" className="m-0 text-h1 text-ink">
            Glossary &amp; sources
          </h1>

          <Tabs defaultValue="entities" className="mt-5">
            <TabsList aria-label="Reference tabs">
              <TabsTrigger value="entities">Entities · {entities.length}</TabsTrigger>
              <TabsTrigger value="sources">Sources · {sources.length}</TabsTrigger>
            </TabsList>

            <TabsContent value="entities" className="mt-5">
              <div className="grid gap-2">
                {entities.map((entity) => {
                  const active = entity.id === state.focusEntityId;

                  return (
                    <button
                      key={entity.id}
                      type="button"
                      aria-label={`${entity.name} ${entity.type}`}
                      className="block w-full rounded-lg border-0 bg-transparent p-0 text-left text-ink"
                      onClick={() => openEntity(entity.id)}
                    >
                      <Card
                        padding="tight"
                        className={cn(
                          "transition-colors duration-fast ease-out hover:bg-surface-2",
                          active && "border-coral bg-coral-bg hover:bg-coral-bg"
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-mono text-label font-semibold text-coral-ink">{entity.name}</span>
                          <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                            {entity.type}
                          </span>
                        </div>
                        <div className="mt-1.5 font-serif text-[0.90625rem] leading-relaxed text-ink-2">
                          {entity.shortDef}
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="sources" className="mt-5">
              <div className="grid gap-2">
                {sources.map((source) => (
                  <Card key={source.id} padding="tight">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-label font-bold text-ink">{source.title}</span>
                      <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                        {source.kind}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-mono text-sage">{sourceSubline(source)}</div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <aside className="w-[380px] flex-none" aria-label="Entity detail">
          {focusedEntity ? (
            <EntityDetailPanel
              entity={focusedEntity}
              entities={entities}
              relationships={report.kg?.relationships ?? []}
              sections={report.sections}
              onOpenSection={openSection}
              onOpenEntity={openEntity}
              onSeeInGraph={(id) => openGraph(id, "spotlight")}
              onClose={() => setState((current) => ({ ...current, focusEntityId: null }))}
            />
          ) : (
            <Card className="sticky top-20 border-dashed border-border-hi bg-sage-bg">
              <Eyebrow color="sage">Tip</Eyebrow>
              <div className="mt-2 font-serif text-[1rem] leading-relaxed text-ink">
                Click any entity to see its definition, its primary section, and its incoming and outgoing relationships.
              </div>
            </Card>
          )}
        </aside>
      </div>
    </main>
  );
}
