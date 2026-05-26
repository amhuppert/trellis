import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "callout");

if (!block || block.kind !== "callout") {
  throw new Error("Foundations fixture is missing a callout block.");
}

const meta = {
  title: "Blocks/Callout",
  component: Callout,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof Callout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllTones: Story = {
  args: {
    ...block,
    onOpenEntity: () => undefined
  },
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="grid max-w-[var(--layout-reading-width)] gap-4">
        {(["info", "warn", "aside", "quote"] as const).map((tone) => (
          <Callout key={tone} {...block} anchorId={`${block.anchorId}-${tone}`} tone={tone} onOpenEntity={() => undefined} />
        ))}
      </div>
    </main>
  )
};
