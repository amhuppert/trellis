import type { Meta, StoryObj } from "@storybook/react";
import { StepByStep } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "stepByStep");

if (!block || block.kind !== "stepByStep") {
  throw new Error("Foundations fixture is missing a stepByStep block.");
}

const meta = {
  title: "Blocks/StepByStep",
  component: StepByStep,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof StepByStep>;

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
        <StepByStep {...block} onOpenEntity={() => undefined} />
      </div>
    </main>
  )
};
