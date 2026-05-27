import React from "react";
import type { Block, Entity } from "../../schemas";
import { InlineProse } from "../inline";
import { Eyebrow } from "../primitives";

export type StepByStepProps = Extract<Block, { kind: "stepByStep" }> & {
  onOpenEntity?: (id: string) => void;
  onSeeEntityInGraph?: (id: string) => void;
  entities?: Entity[];
};

const noop = () => undefined;

export function StepByStep({
  anchorId,
  title,
  steps,
  onOpenEntity = noop,
  onSeeEntityInGraph,
  entities
}: StepByStepProps) {
  return (
    <section
      id={anchorId}
      className="rounded-2xl border border-border-soft bg-surface px-6 py-5 text-ink shadow-sm"
      data-block-kind="stepByStep"
    >
      <Eyebrow color="coral">STEP BY STEP</Eyebrow>
      <h2 className="mt-2 text-h3 text-ink">
        <InlineProse text={title} onOpenEntity={onOpenEntity} onSeeEntityInGraph={onSeeEntityInGraph} entities={entities} />
      </h2>
      <ol className="mt-4 grid list-none gap-3.5 p-0">
        {steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="grid grid-cols-[32px_1fr] items-start gap-3.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-surface-3 font-mono text-mono font-bold text-coral-ink">
              {index + 1}
            </div>
            <div className="pt-0.5">
              <div className="mb-1 text-label font-semibold text-ink">
                <InlineProse
                  text={step.title}
                  onOpenEntity={onOpenEntity}
                  onSeeEntityInGraph={onSeeEntityInGraph}
                  entities={entities}
                />
              </div>
              <div className="font-serif text-label leading-relaxed text-ink-2">
                <InlineProse
                  text={step.body}
                  onOpenEntity={onOpenEntity}
                  onSeeEntityInGraph={onSeeEntityInGraph}
                  entities={entities}
                />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
