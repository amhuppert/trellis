import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ModeSwitcher, type ReaderMode } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/ModeSwitcher",
  component: ModeSwitcher
} satisfies Meta<typeof ModeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FiveModes: Story = {
  args: {
    mode: "orientation",
    onChange: () => undefined
  },
  render: () => {
    const [mode, setMode] = useState<ReaderMode>("orientation");

    return (
      <div className="grid min-h-screen place-items-center bg-bg p-8">
        <div className="grid gap-4 rounded-lg border border-border-soft bg-surface p-5">
          <ModeSwitcher mode={mode} onChange={setMode} />
          <p className="text-body-sans text-ink-2">Mode: {mode}</p>
        </div>
      </div>
    );
  }
};
