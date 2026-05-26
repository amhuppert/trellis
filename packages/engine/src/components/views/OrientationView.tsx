import React from "react";
import type { ReaderMode } from "../shell/reader-state";
import type { Entity, Section, SynthesisNode } from "../../schemas";
import { cn } from "../../utils";
import { BentoCard, Dot, Eyebrow } from "../primitives";
import { useReader } from "../shell/AppShell";

type ModeSummary = {
  id: ReaderMode;
  label: string;
  hint: string;
};

const modes: ModeSummary[] = [
  { id: "orientation", label: "Orientation", hint: "Map the report before reading." },
  { id: "guided", label: "Guided", hint: "Read the recommended section path." },
  { id: "reference", label: "Reference", hint: "Look up entities and sources." },
  { id: "synthesis", label: "Synthesis", hint: "See the cross-section tree." },
  { id: "graph", label: "Graph", hint: "Explore the knowledge graph." }
];

const kindColor = (kind?: string): "coral" | "sage" | "butter" => {
  const normalized = kind?.toLowerCase();
  if (normalized === "concept") return "coral";
  if (normalized === "mechanism") return "sage";
  if (normalized === "maintenance") return "butter";
  if (normalized === "contract") return "coral";
  return "sage";
};

function countSynthesisNodes(node: SynthesisNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countSynthesisNodes(child), 0);
}

function sectionLabel(section: Section) {
  return [section.n, section.title].filter(Boolean).join(" ");
}

export function OrientationView() {
  const { report, openSection, openEntity, openSynthesis, openGraph, setMode } = useReader();
  const orientation = report.orientation;
  const sectionsById = React.useMemo(
    () => new Map(report.sections.map((section) => [section.id, section])),
    [report.sections]
  );
  const entitiesById = React.useMemo(
    () => new Map((report.kg?.entities ?? []).map((entity) => [entity.id, entity])),
    [report.kg?.entities]
  );
  const roots = report.synthesis?.roots ?? [];
  const root = roots[0];
  const synthesisPreviewNodes = root?.children?.length ? root.children : roots;
  const recommendedPath = orientation.recommendedPath
    .map((id) => sectionsById.get(id))
    .filter((section): section is Section => Boolean(section));
  const keyEntities = orientation.keyEntityIds
    .map((id) => entitiesById.get(id))
    .filter((entity): entity is Entity => Boolean(entity));

  const openJumpTarget = (mode: ReaderMode, targetId?: string) => {
    if (mode === "guided" && targetId) {
      openSection(targetId);
      return;
    }

    if (mode === "reference" && targetId) {
      openEntity(targetId);
      return;
    }

    if (mode === "synthesis") {
      openSynthesis(targetId);
      return;
    }

    if (mode === "graph") {
      if (targetId) {
        openGraph(targetId, "spotlight");
      } else {
        openGraph();
      }
      return;
    }

    setMode(mode);
  };

  return (
    <main className="trellis-view trellis-orientation-view" data-view="orientation">
      <div
        data-testid="orientation-bento-grid"
        className="mx-auto grid max-w-[1320px] gap-3.5"
        style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}
      >
        <BentoCard
          data-testid="orientation-card-hero"
          data-span="8"
          span={8}
          padding="loose"
          className="relative min-h-[380px]"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-eyebrow text-coral">{report.template} report</span>
            <span className="text-ink-3">·</span>
            <span className="font-mono text-[0.6875rem] text-ink-3">
              {report.sections.length} sections · {report.kg?.entities.length ?? 0} entities
              {report.readTime ? ` · ${report.readTime}` : ""}
            </span>
          </div>

          <h1 className="mt-5 max-w-[660px] font-serif text-[4rem] font-medium leading-none text-ink">
            {report.title}
          </h1>
          <p className="mt-5 max-w-[590px] text-[1.0625rem] leading-relaxed text-ink-2">{orientation.heroSummary}</p>

          <div className="mt-auto flex flex-wrap items-center gap-6 pt-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-pill bg-ink px-5 py-3 text-label font-bold text-bg"
              onClick={() => openSection(recommendedPath[0]?.id ?? report.sections[0]?.id ?? "")}
            >
              Start reading
              <span className="font-mono text-[0.6875rem] opacity-70">{recommendedPath[0]?.title ?? "Guided"}</span>
              <span aria-hidden="true">→</span>
            </button>
            {report.audience ? (
              <div className="border-l border-border-soft pl-6">
                <Eyebrow>For</Eyebrow>
                <div className="mt-1 max-w-[260px] text-caption font-semibold text-ink">{report.audience}</div>
              </div>
            ) : null}
            {report.builtAt ? (
              <div className="border-l border-border-soft pl-6">
                <Eyebrow>Built</Eyebrow>
                <div className="mt-1 font-mono text-mono text-ink-2">{new Date(report.builtAt).toLocaleDateString()}</div>
              </div>
            ) : null}
          </div>

          <div className="absolute right-7 top-7 grid grid-cols-3 gap-1.5" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, index) => {
              const filled = [true, false, true, false, true, true, true, false, false][index];
              const colors = ["bg-sage", "bg-coral", "bg-butter"];
              return (
                <span
                  key={index}
                  className={cn("block size-6 rounded-md", filled ? colors[index % colors.length] : "border border-border")}
                />
              );
            })}
          </div>
        </BentoCard>

        <BentoCard data-testid="orientation-card-modes" data-span="4" span={4} className="gap-3.5">
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow color="sage">How to read this</Eyebrow>
            <span className="font-mono text-[0.6875rem] text-ink-3">{modes.length} modes</span>
          </div>
          <div className="grid gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                aria-label={`${mode.label} ${mode.hint}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-surface-2 px-3.5 py-3 text-left transition-colors duration-fast hover:border-sage hover:bg-sage-bg"
                onClick={() => setMode(mode.id)}
              >
                <span>
                  <span className="block text-label font-bold text-ink">{mode.label}</span>
                  <span className="mt-0.5 block text-[0.71875rem] leading-snug text-ink-3">{mode.hint}</span>
                </span>
                <span className="text-sage" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </BentoCard>

        <BentoCard data-testid="orientation-card-learn" data-span="5" span={5} className="bg-coral-bg">
          <Eyebrow color="coral">What you'll learn</Eyebrow>
          <ul className="mt-4 grid list-none gap-3 p-0">
            {orientation.whatYoullLearn.map((line, index) => (
              <li key={line} className="flex items-start gap-3">
                <span className="grid size-[22px] flex-none place-items-center rounded-md bg-coral font-mono text-[0.6875rem] font-bold text-bg">
                  {index + 1}
                </span>
                <span className="font-serif text-[1rem] leading-snug text-ink">{line}</span>
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard data-testid="orientation-card-synthesis" data-span="7" span={7}>
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow color="sage">Synthesis preview</Eyebrow>
            {root ? (
              <button
                type="button"
                className="border-0 bg-transparent p-0 font-mono text-[0.6875rem] font-semibold text-sage"
                onClick={() => openSynthesis(root.id)}
              >
                open tree →
              </button>
            ) : null}
          </div>
          {root ? <p className="mt-3 font-serif text-[1.1875rem] leading-relaxed text-ink">{root.summary}</p> : null}
          <div className="mt-4 grid grid-cols-4 gap-2.5">
            {synthesisPreviewNodes.map((node, index) => (
              <button
                key={node.id}
                type="button"
                className="min-h-[118px] rounded-md border-0 bg-surface-2 px-3.5 py-3 text-left transition-colors duration-fast hover:bg-surface-3"
                style={{ borderTop: `3px solid ${index % 2 === 0 ? "var(--color-accent-coral)" : "var(--color-accent-sage)"}` }}
                onClick={() => openSynthesis(node.id)}
              >
                <span className="block text-label font-bold text-ink">{node.title}</span>
                <span className="mt-1 block text-[0.6875rem] leading-snug text-ink-3">{node.summary}</span>
                <span className="mt-2 block font-mono text-[0.625rem] text-ink-3">
                  {countSynthesisNodes(node)} node{countSynthesisNodes(node) === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        </BentoCard>

        <BentoCard data-testid="orientation-card-path" data-span="12" span={12}>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <Eyebrow>Recommended path · seven sections</Eyebrow>
            <span className="font-mono text-[0.6875rem] text-ink-3">linear · click any to start</span>
          </div>
          <div
            data-testid="orientation-recommended-subgrid"
            className="grid gap-2.5"
            style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
          >
            {recommendedPath.map((section, index) => (
              <button
                key={section.id}
                type="button"
                aria-label={`${sectionLabel(section)} ${section.kind}${section.time ? ` ${section.time}` : ""}`}
                className={cn(
                  "flex min-h-[130px] flex-col justify-between rounded-md p-3.5 text-left transition-transform duration-fast hover:-translate-y-0.5",
                  index === 0 ? "border-0 bg-ink text-bg" : "border border-border-soft bg-surface-2 text-ink"
                )}
                onClick={() => openSection(section.id)}
              >
                <span>
                  <span className={cn("block font-mono text-[0.6875rem] font-semibold", index === 0 ? "text-coral" : "text-ink-3")}>
                    {section.n}
                  </span>
                  <span className="mt-1 block font-serif text-[1.125rem] font-medium leading-tight">{section.title}</span>
                </span>
                <span className={cn("flex items-center gap-1.5 font-mono text-[0.625rem]", index === 0 ? "text-bg/75" : "text-ink-3")}>
                  <Dot color={kindColor(section.kind)} />
                  <span>{section.kind}</span>
                  {section.time ? <span className="ml-auto">{section.time}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </BentoCard>

        <BentoCard data-testid="orientation-card-entities" data-span="8" span={8}>
          <div className="flex items-baseline justify-between gap-4">
            <Eyebrow color="coral">Key entities</Eyebrow>
            <button
              type="button"
              className="border-0 bg-transparent p-0 font-mono text-[0.6875rem] font-semibold text-coral"
              onClick={() => openGraph()}
            >
              graph view →
            </button>
          </div>
          <div className="mt-3.5 grid grid-cols-3 gap-2.5">
            {keyEntities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                aria-label={`${entity.name} ${entity.type}`}
                className="rounded-md border border-border-soft bg-surface-2 px-3.5 py-3 text-left transition-colors duration-fast hover:border-coral-soft hover:bg-coral-bg"
                onClick={() => openEntity(entity.id)}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-[0.8125rem] font-semibold text-coral-ink">{entity.name}</span>
                  <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {entity.type}
                  </span>
                </span>
                <span className="mt-1.5 block text-[0.75rem] leading-snug text-ink-2">{entity.shortDef}</span>
              </button>
            ))}
          </div>
        </BentoCard>

        <BentoCard data-testid="orientation-card-jump" data-span="4" span={4} className="bg-sage-bg">
          <Eyebrow color="sage">Jump to</Eyebrow>
          <div className="mt-3.5 grid gap-2">
            {orientation.jumpTargets.map((target) => (
              <button
                key={`${target.mode}-${target.targetId ?? target.label}`}
                type="button"
                className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-surface px-3.5 py-3 text-left transition-transform duration-fast hover:translate-x-0.5"
                onClick={() => openJumpTarget(target.mode, target.targetId)}
              >
                <span>
                  <span className="block text-label font-bold text-ink">{target.label}</span>
                  <span className="mt-0.5 block font-mono text-[0.6875rem] text-ink-3">
                    {target.targetId ? `${target.mode} · ${target.targetId}` : target.mode}
                  </span>
                </span>
                <span className="text-sage" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </BentoCard>
      </div>
    </main>
  );
}
