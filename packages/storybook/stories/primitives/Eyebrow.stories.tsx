import type { Meta, StoryObj } from "@storybook/react";
import { Eyebrow } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/Eyebrow",
  component: Eyebrow
} satisfies Meta<typeof Eyebrow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg p-8">
      <div className="grid gap-3 rounded-lg border border-border-soft bg-surface p-5">
        <Eyebrow>Default ink</Eyebrow>
        <Eyebrow color="sage">Sage mechanism</Eyebrow>
        <Eyebrow color="coral">Coral concept</Eyebrow>
        <Eyebrow color="butter">Butter maintenance</Eyebrow>
      </div>
    </div>
  )
};
