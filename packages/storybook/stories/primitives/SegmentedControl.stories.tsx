import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedControl } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/SegmentedControl",
  component: SegmentedControl
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  { id: "entities", label: "Entities" },
  { id: "sources", label: "Sources" },
  { id: "sections", label: "Sections" }
];

export const Controlled: Story = {
  args: {
    items,
    value: "entities",
    onChange: () => undefined
  },
  render: () => {
    const [value, setValue] = useState("entities");

    return (
      <div className="grid min-h-screen place-items-center bg-bg p-8">
        <div className="grid gap-4 rounded-lg border border-border-soft bg-surface p-5">
          <SegmentedControl aria-label="Reference panels" items={items} value={value} onChange={setValue} />
          <p className="text-body-sans text-ink-2">Active panel: {value}</p>
        </div>
      </div>
    );
  }
};
