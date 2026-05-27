import React from "react";
import type { SourceReference } from "../../schemas";
import { Button, Eyebrow } from "../primitives";
import { useReader } from "../shell/AppShell";

function sourceHref(source: SourceReference) {
  return source.kind === "url" ? source.href : null;
}

export function RightRail() {
  const { report, state, openEntity, openGraph } = useReader();
  const currentSection = report.sections.find((section) => section.id === state.sectionId) ?? report.sections[0];
  const entitiesById = React.useMemo(
    () => new Map((report.kg?.entities ?? []).map((entity) => [entity.id, entity])),
    [report.kg?.entities]
  );
  const sourcesById = React.useMemo(() => new Map(report.sources.map((source) => [source.id, source])), [report.sources]);

  if (!currentSection) return null;

  const relatedEntities = currentSection.relatedEntityIds
    .map((entityId) => entitiesById.get(entityId))
    .filter((entity) => entity !== undefined);
  const sources = currentSection.sourceRefIds.map((sourceId) => sourcesById.get(sourceId)).filter((source) => source !== undefined);

  const onSourceClick = (source: SourceReference) => {
    const href = sourceHref(source);
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <aside className="trellis-right-rail" aria-label="Section context">
      <section>
        <Eyebrow>RELATED ENTITIES</Eyebrow>
        <div className="mt-3 grid gap-2">
          {relatedEntities.map((entity) => (
            <button
              key={entity.id}
              type="button"
              aria-label={`${entity.name} ${entity.type}`}
              className="flex w-full items-baseline justify-between gap-3 rounded-lg border-0 bg-transparent px-0 py-1.5 text-left"
              onClick={() => openEntity(entity.id)}
            >
              <span className="min-w-0 font-mono text-mono font-semibold text-coral-ink">{entity.name}</span>
              <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {entity.type}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <Eyebrow>SOURCES</Eyebrow>
        <div className="mt-3 grid gap-2">
          {sources.map((source) => (
            <button
              key={source.id}
              type="button"
              aria-label={`${source.title} ${source.kind}`}
              className="w-full rounded-lg border-0 bg-transparent px-0 py-1.5 text-left"
              onClick={() => onSourceClick(source)}
            >
              <span className="block text-label font-semibold text-ink">{source.title}</span>
              <span className="mt-0.5 block font-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                {source.kind}
              </span>
            </button>
          ))}
        </div>
      </section>

      <Button variant="secondary" className="mt-6 w-full rounded-lg" onClick={() => openGraph(undefined, "regions")}>
        See full graph
      </Button>
    </aside>
  );
}
