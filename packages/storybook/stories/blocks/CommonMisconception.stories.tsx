import type { Meta, StoryObj } from "@storybook/react";
import { CommonMisconception } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "misconception");

if (!block || block.kind !== "misconception") {
  throw new Error("Foundations fixture is missing a misconception block.");
}

const meta = {
  title: "Blocks/CommonMisconception",
  component: CommonMisconception,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof CommonMisconception>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Foundations: Story = {
  args: {
    ...block,
    onOpenEntity: () => undefined
  },
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="max-w-[var(--layout-reading-width)]">
        <CommonMisconception {...block} onOpenEntity={() => undefined} />
      </div>
    </main>
  )
};
