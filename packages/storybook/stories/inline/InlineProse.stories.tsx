import type { Meta, StoryObj } from "@storybook/react";
import { InlineProse } from "@trellis/engine/components/inline";

const meta = {
  title: "Inline/InlineProse",
  component: InlineProse,
  args: {
    text: 'A <e id="snapshot">snapshot</e> records xmin, xmax, the <e id="xip-list">xip list</e>, and a <code>command id</code> so tuple visibility can be decided <em>consistently</em>.',
    onOpenEntity: () => undefined
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof InlineProse>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InBodyText: Story = {
  render: (args) => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <section className="mx-auto max-w-[var(--layout-reading-width)] rounded-lg border border-border-soft bg-surface p-6">
        <p className="text-body text-ink">
          <InlineProse {...args} />
        </p>
      </section>
    </main>
  )
};
