import type { Meta, StoryObj } from "@storybook/react";
import { ProseBlock } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "prose");

if (!block || block.kind !== "prose") {
  throw new Error("Foundations fixture is missing a prose block.");
}

const meta = {
  title: "Blocks/ProseBlock",
  component: ProseBlock,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof ProseBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Foundations: Story = {
  args: {
    ...block,
    onOpenEntity: () => undefined
  },
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <ProseBlock {...block} anchorId="found-prose-story" onOpenEntity={() => undefined} />
    </main>
  )
};
