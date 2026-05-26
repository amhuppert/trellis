import type { Meta, StoryObj } from "@storybook/react";
import { KeyTakeaways } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "keyTakeaways");

if (!block || block.kind !== "keyTakeaways") {
  throw new Error("Foundations fixture is missing a keyTakeaways block.");
}

const meta = {
  title: "Blocks/KeyTakeaways",
  component: KeyTakeaways,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof KeyTakeaways>;

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
        <KeyTakeaways {...block} onOpenEntity={() => undefined} />
      </div>
    </main>
  )
};
