import type { Meta, StoryObj } from "@storybook/react";
import { BeforeYouContinue } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const block = foundations.blocks.find((candidate) => candidate.kind === "beforeContinue");

if (!block || block.kind !== "beforeContinue") {
  throw new Error("Foundations fixture is missing a beforeContinue block.");
}

const meta = {
  title: "Blocks/BeforeYouContinue",
  component: BeforeYouContinue,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof BeforeYouContinue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Foundations: Story = {
  args: {
    ...block,
    nextSectionTitle: "Tuple versions",
    onOpenEntity: () => undefined,
    onOpenSection: () => undefined
  },
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="max-w-[var(--layout-reading-width)]">
        <BeforeYouContinue
          {...block}
          nextSectionTitle="Tuple versions"
          onOpenEntity={() => undefined}
          onOpenSection={() => undefined}
        />
      </div>
    </main>
  )
};
