import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/Button",
  component: Button
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg p-8">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-soft bg-surface p-5">
        <Button>Continue to tuple versions</Button>
        <Button variant="secondary">All sources</Button>
        <Button variant="ghost">Cancel</Button>
        <Button size="sm">Open</Button>
        <Button as="a" href="#reference" variant="secondary">
          Reference
        </Button>
      </div>
    </div>
  )
};
