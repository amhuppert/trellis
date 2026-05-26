import type { Meta, StoryObj } from "@storybook/react";
import { BlockHeading } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "heading");

if (!block || block.kind !== "heading") {
  throw new Error("Foundations fixture is missing a heading block.");
}

const meta = {
  title: "Blocks/BlockHeading",
  component: BlockHeading,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof BlockHeading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Levels: Story = {
  args: block,
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="grid max-w-[var(--layout-reading-width)] gap-8">
        <BlockHeading {...block} />
        <BlockHeading {...block} anchorId={`${block.anchorId}-h3`} level={3} text="A local subsection" />
      </div>
    </main>
  )
};
