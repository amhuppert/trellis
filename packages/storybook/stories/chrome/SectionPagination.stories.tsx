import type { Meta, StoryObj } from "@storybook/react";
import { SectionPagination } from "../../../engine/src/components/chrome/SectionPagination";

const meta = {
  title: "Chrome/SectionPagination",
  component: SectionPagination,
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof SectionPagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PrevAndNext: Story = {
  args: {
    prev: { id: "foundations", n: "01", title: "Foundations" },
    next: { id: "snapshots", n: "03", title: "Snapshots" },
    onOpen: () => undefined
  }
};

