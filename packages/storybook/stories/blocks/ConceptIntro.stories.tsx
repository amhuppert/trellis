import type { Meta, StoryObj } from "@storybook/react";
import { ConceptIntro } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "conceptIntro");

if (!block || block.kind !== "conceptIntro") {
  throw new Error("Foundations fixture is missing a conceptIntro block.");
}

const meta = {
  title: "Blocks/ConceptIntro",
  component: ConceptIntro,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof ConceptIntro>;

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
        <ConceptIntro {...block} onOpenEntity={() => undefined} />
      </div>
    </main>
  )
};
