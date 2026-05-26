import type { Meta, StoryObj } from "@storybook/react";
import { Dot } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/Dot",
  component: Dot
} satisfies Meta<typeof Dot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg p-8">
      <div className="flex items-center gap-4 rounded-lg border border-border-soft bg-surface p-5">
        <Dot color="sage" />
        <Dot color="coral" />
        <Dot color="butter" />
        <Dot color="ink" />
      </div>
    </div>
  )
};
