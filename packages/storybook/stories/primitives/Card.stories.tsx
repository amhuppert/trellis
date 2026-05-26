import type { Meta, StoryObj } from "@storybook/react";
import { BentoCard, Card, Dot, Eyebrow, InlineTag } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/Card",
  component: Card,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <Card className="max-w-[var(--layout-reading-width)]">
        <Eyebrow color="coral">Concept introducing</Eyebrow>
        <h2 className="mt-2 text-h3 text-ink">A white-paper primitive</h2>
        <p className="mt-3 text-body text-ink-2">
          Postgres stores multiple tuple versions so a reader can keep using a stable snapshot while writers continue.
        </p>
      </Card>
    </main>
  )
};

export const PaddingVariants: Story = {
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="grid max-w-[var(--layout-page-max)] grid-cols-3 gap-4">
        <Card padding="tight">
          <Eyebrow>Tight</Eyebrow>
          <p className="mt-2 text-body-sans text-ink-2">Compact metadata surfaces and quiet asides.</p>
        </Card>
        <Card>
          <Eyebrow color="sage">Default</Eyebrow>
          <p className="mt-2 text-body-sans text-ink-2">The usual block body frame.</p>
        </Card>
        <Card padding="loose">
          <Eyebrow color="butter">Loose</Eyebrow>
          <p className="mt-2 text-body-sans text-ink-2">Roomier orientation and hero content.</p>
        </Card>
      </div>
    </main>
  )
};

export const BentoGrid: Story = {
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="grid max-w-[var(--layout-page-max)] grid-cols-12 gap-4 auto-rows-[132px]">
        <BentoCard span={7} tall padding="loose">
          <Eyebrow color="coral">postgres-mvcc</Eyebrow>
          <h1 className="mt-2 text-h2 text-ink">MVCC in Postgres</h1>
          <p className="mt-3 text-body-sans text-ink-2">
            A bento item composes Card while owning only grid placement.
          </p>
        </BentoCard>
        <BentoCard span={5}>
          <Eyebrow color="sage">Recommended path</Eyebrow>
          <div className="mt-4 flex items-center gap-2 text-label text-ink">
            <Dot color="sage" />
            Foundations to tuple versions
          </div>
        </BentoCard>
        <BentoCard span={5}>
          <Eyebrow>Meta</Eyebrow>
          <div className="mt-4 flex flex-wrap gap-2">
            <InlineTag>7 sections</InlineTag>
            <InlineTag>16 entities</InlineTag>
            <InlineTag>45 min</InlineTag>
          </div>
        </BentoCard>
      </div>
    </main>
  )
};
