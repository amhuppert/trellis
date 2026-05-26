import React from "react";
import type { Block } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";
import { BeforeYouContinue } from "./BeforeYouContinue";
import { BlockHeading } from "./BlockHeading";
import { Callout } from "./Callout";
import { CommonMisconception } from "./CommonMisconception";
import { ConceptIntro } from "./ConceptIntro";
import { KeyTakeaways } from "./KeyTakeaways";
import { MentalModel } from "./MentalModel";
import { ProseBlock } from "./ProseBlock";
import { StepByStep } from "./StepByStep";

export type BlockRendererCallbacks = {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
  onOpenSection?: (id: string) => void;
  sectionTitles?: Record<string, string>;
};

export type BlockRendererProps = {
  block: Block;
  callbacks?: BlockRendererCallbacks;
};

const noop = () => undefined;

function CodeBlock({ block }: { block: Extract<Block, { kind: "codeBlock" }> }) {
  return (
    <section
      id={block.anchorId}
      className="overflow-hidden rounded-2xl border border-border-soft bg-ink text-bg shadow-sm"
      data-block-kind="codeBlock"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border-soft px-4 py-3">
        <div className="text-label font-semibold">{block.title ?? "Code"}</div>
        <div className="font-mono text-mono text-coral">{block.language}</div>
      </div>
      <pre className="m-0 overflow-x-auto p-4 font-mono text-code">
        <code>{block.code}</code>
      </pre>
    </section>
  );
}

function FigureBlock({
  block,
  onOpenEntity,
  onSeeEntityInGraph
}: {
  block: Extract<Block, { kind: "figure" }>;
  onOpenEntity: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
}) {
  return (
    <figure
      id={block.anchorId}
      className="rounded-2xl border border-border-soft bg-surface px-5 py-5 text-ink shadow-sm"
      data-block-kind="figure"
    >
      <div
        className="flex min-h-40 items-center justify-center rounded-lg bg-surface-2 px-5 text-center text-body-sans text-ink-2"
        role="img"
        aria-label={block.alt}
        data-src={block.src}
      >
        {block.alt}
      </div>
      {block.caption ? (
        <figcaption className="mt-3 text-caption text-ink-2">
          <InlineProse text={block.caption} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
        </figcaption>
      ) : null}
    </figure>
  );
}

function ComparisonTable({
  block,
  onOpenEntity,
  onSeeEntityInGraph
}: {
  block: Extract<Block, { kind: "comparisonTable" }>;
  onOpenEntity: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
}) {
  return (
    <section
      id={block.anchorId}
      className="overflow-hidden rounded-2xl border border-border-soft bg-surface text-ink shadow-sm"
      data-block-kind="comparisonTable"
    >
      {block.title ? (
        <div className="border-b border-border-soft px-4 py-3">
          <h2 className="text-h3 text-ink">{block.title}</h2>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-body-sans">
          <thead className="bg-surface-2 text-label text-ink">
            <tr>
              {block.columns.map((column) => (
                <th key={column} className="border-b border-border-soft px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border-soft last:border-b-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-ink-2">
                    <InlineProse text={cell} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CustomBlock({ block }: { block: Extract<Block, { kind: "custom" }> }) {
  return (
    <section
      id={block.anchorId}
      className="rounded-2xl border border-border-soft bg-surface-2 px-5 py-5 text-ink shadow-sm"
      data-block-kind="custom"
    >
      <Eyebrow>CUSTOM</Eyebrow>
      <div className="mt-2 text-h3 text-ink">Custom: {block.componentName}</div>
    </section>
  );
}

export function BlockRenderer({ block, callbacks = {} }: BlockRendererProps) {
  const onOpenEntity = callbacks.onOpenEntity ?? noop;
  const onSeeEntityInGraph = callbacks.onSeeEntityInGraph;

  switch (block.kind) {
    case "conceptIntro":
      return <ConceptIntro {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "mentalModel":
      return <MentalModel {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "callout":
      return <Callout {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "stepByStep":
      return <StepByStep {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "keyTakeaways":
      return <KeyTakeaways {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "misconception":
      return <CommonMisconception {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "beforeContinue":
      return (
        <BeforeYouContinue
          {...block}
          nextSectionTitle={callbacks.sectionTitles?.[block.nextSectionId]}
          onOpenEntity={onOpenEntity}
          onSeeEntityInGraph={onSeeEntityInGraph}
          onOpenSection={callbacks.onOpenSection}
        />
      );
    case "heading":
      return <BlockHeading {...block} />;
    case "prose":
      return <ProseBlock {...block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "codeBlock":
      return <CodeBlock block={block} />;
    case "figure":
      return <FigureBlock block={block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "comparisonTable":
      return <ComparisonTable block={block} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} />;
    case "custom":
      return <CustomBlock block={block} />;
    default:
      throw new Error(`Unknown block kind: ${(block as { kind?: string }).kind ?? "missing"}`);
  }
}
