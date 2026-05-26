import type { Meta, StoryObj } from "@storybook/react";
import { AppShell } from "../../../engine/src/components/shell/AppShell";
import { referenceReport } from "../fixtures/referenceReport";

const meta = {
  title: "Shell/ReaderShell",
  component: AppShell,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PostgresMvcc: Story = {
  args: {
    report: referenceReport
  }
};
