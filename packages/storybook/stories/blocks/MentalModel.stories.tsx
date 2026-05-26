import type { Meta, StoryObj } from "@storybook/react";
import { MentalModel } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "mentalModel");

if (!block || block.kind !== "mentalModel") {
  throw new Error("Foundations fixture is missing a mentalModel block.");
}

const meta = {
  title: "Blocks/MentalModel",
  component: MentalModel,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof MentalModel>;

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
        <MentalModel {...block} onOpenEntity={() => undefined} />
      </div>
    </main>
  )
};
