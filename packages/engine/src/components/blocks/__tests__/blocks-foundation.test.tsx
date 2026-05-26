// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Block } from "../../../schemas";
import { BlockSchema } from "../../../schemas";
import { foundations } from "../../../../../../reports/postgres-mvcc/content/foundations";
import {
  BeforeYouContinue,
  BlockHeading,
  BlockRenderer,
  Callout,
  CommonMisconception,
  ConceptIntro,
  KeyTakeaways,
  MentalModel,
  ProseBlock,
  StepByStep
} from "../index";

afterEach(() => cleanup());

const onOpenEntity = vi.fn();

function fixtureBlock<TKind extends Block["kind"]>(kind: TKind): Extract<Block, { kind: TKind }> {
  const block = foundations.blocks.find((candidate: Block) => candidate.kind === kind);
  if (!block || block.kind !== kind) {
    throw new Error(`Foundations fixture is missing ${kind}.`);
  }
  return block as Extract<Block, { kind: TKind }>;
}

describe("ConceptIntro", () => {
  it("surfaces anchorId as a DOM id", () => {
    const block = fixtureBlock("conceptIntro");

    const { container } = render(<ConceptIntro {...block} onOpenEntity={onOpenEntity} />);

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
  });

  it("renders InlineProse entity refs", () => {
    const block = fixtureBlock("conceptIntro");

    render(<ConceptIntro {...block} onOpenEntity={onOpenEntity} />);

    expect(screen.getByRole("button", { name: "MVCC" })).toHaveAttribute("data-entity-id", "mvcc");
  });
});

describe("MentalModel", () => {
  it("surfaces anchorId as a DOM id", () => {
    const block = fixtureBlock("mentalModel");

    const { container } = render(<MentalModel {...block} onOpenEntity={onOpenEntity} />);

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
  });
});

describe("Callout", () => {
  it("surfaces anchorId as a DOM id", () => {
    const block = fixtureBlock("callout");

    const { container } = render(<Callout {...block} onOpenEntity={onOpenEntity} />);

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
  });

  it("uses distinct background classes for every tone", () => {
    const block = fixtureBlock("callout");

    const { container, rerender } = render(<Callout {...block} tone="info" onOpenEntity={onOpenEntity} />);
    expect(container.firstElementChild).toHaveClass("bg-sage-bg");

    rerender(<Callout {...block} tone="warn" onOpenEntity={onOpenEntity} />);
    expect(container.firstElementChild).toHaveClass("bg-butter-bg");

    rerender(<Callout {...block} tone="aside" onOpenEntity={onOpenEntity} />);
    expect(container.firstElementChild).toHaveClass("bg-surface-2");

    rerender(<Callout {...block} tone="quote" onOpenEntity={onOpenEntity} />);
    expect(container.firstElementChild).toHaveClass("bg-coral-bg");
  });
});

describe("StepByStep", () => {
  it("surfaces anchorId as a DOM id and renders InlineProse entity refs in steps", () => {
    const block = fixtureBlock("stepByStep");

    const { container } = render(<StepByStep {...block} onOpenEntity={onOpenEntity} />);

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "xmax" })).toHaveAttribute("data-entity-id", "xmax");
  });
});

describe("KeyTakeaways", () => {
  it("surfaces anchorId as a DOM id and renders list items through InlineProse", () => {
    const block = fixtureBlock("keyTakeaways");

    const { container } = render(
      <KeyTakeaways
        {...block}
        items={['The <e id="snapshot">snapshot</e> decides visibility.', ...block.items.slice(1)]}
        onOpenEntity={onOpenEntity}
      />
    );

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapshot" })).toHaveAttribute("data-entity-id", "snapshot");
  });
});

describe("CommonMisconception", () => {
  it("surfaces anchorId as a DOM id and renders claim/truth through InlineProse", () => {
    const block = fixtureBlock("misconception");

    const { container } = render(
      <CommonMisconception
        {...block}
        claim={'A <e id="snapshot">snapshot</e> always sees latest committed rows.'}
        onOpenEntity={onOpenEntity}
      />
    );

    expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapshot" })).toHaveAttribute("data-entity-id", "snapshot");
    expect(container.querySelector("em")).toHaveTextContent("before this transaction's snapshot was taken");
  });
});

describe("BeforeYouContinue", () => {
  it("surfaces anchorId as a DOM id, renders InlineProse, and opens the next section", async () => {
    const block = fixtureBlock("beforeContinue");
    const onOpenSection = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <BeforeYouContinue
        {...block}
        anchorId="found-before-continue"
        body={'Review the <e id="snapshot">snapshot</e> model before moving on.'}
        nextSectionTitle="Tuple versions"
        onOpenEntity={onOpenEntity}
        onOpenSection={onOpenSection}
      />
    );

    expect(container.querySelector("#found-before-continue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapshot" })).toHaveAttribute("data-entity-id", "snapshot");

    await user.click(screen.getByRole("button", { name: /Continue to Tuple versions/ }));
    expect(onOpenSection).toHaveBeenCalledWith(block.nextSectionId);
  });
});

describe("BlockHeading", () => {
  it("surfaces anchorId as a DOM id and renders h2 or h3", () => {
    const block = fixtureBlock("heading");
    const { rerender } = render(<BlockHeading {...block} />);

    expect(screen.getByRole("heading", { level: 2, name: block.text })).toHaveAttribute("id", block.anchorId);

    rerender(<BlockHeading {...block} anchorId="heading-three" level={3} text="Nested turn" />);
    expect(screen.getByRole("heading", { level: 3, name: "Nested turn" })).toHaveAttribute("id", "heading-three");
  });
});

describe("ProseBlock", () => {
  it("surfaces anchorId as a DOM id and renders InlineProse entity refs", () => {
    const block = fixtureBlock("prose");

    const { container } = render(
      <ProseBlock
        {...block}
        anchorId="found-prose"
        body={'A reader carries a <e id="snapshot">snapshot</e>.'}
        onOpenEntity={onOpenEntity}
      />
    );

    expect(container.querySelector("#found-prose")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapshot" })).toHaveAttribute("data-entity-id", "snapshot");
  });
});

describe("BlockRenderer", () => {
  it("renders every parsed Foundations block without throwing and exposes anchor ids", () => {
    for (const rawBlock of foundations.blocks) {
      const block = BlockSchema.parse(rawBlock);
      const { container, unmount } = render(
        <BlockRenderer
          block={block}
          callbacks={{
            onOpenEntity,
            onOpenSection: vi.fn(),
            sectionTitles: {
              "tuple-versions": "Tuple versions"
            }
          }}
        />
      );

      if (block.anchorId) {
        expect(container.querySelector(`#${block.anchorId}`)).toBeInTheDocument();
      }

      unmount();
    }
  });
});
