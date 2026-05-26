import type { Meta, StoryObj } from "@storybook/react";
import { InlineTag } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/InlineTag",
  component: InlineTag
} satisfies Meta<typeof InlineTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg p-8">
      <div className="flex flex-wrap gap-2 rounded-lg border border-border-soft bg-surface p-5">
        <InlineTag>postgres-mvcc</InlineTag>
        <InlineTag>7 sections</InlineTag>
        <InlineTag>16 entities</InlineTag>
        <InlineTag>45 min</InlineTag>
      </div>
    </div>
  )
};
