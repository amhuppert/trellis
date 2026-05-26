import type { Meta, StoryObj } from "@storybook/react";
import { EntityDetailPanel } from "../../../engine/src/components/reference/EntityDetailPanel";
import { referenceReport, snapshotEntity } from "../fixtures/referenceReport";

const meta = {
  title: "Reference/EntityDetailPanel",
  component: EntityDetailPanel,
  parameters: {
    layout: "centered"
  },
  args: {
    entity: snapshotEntity,
    entities: referenceReport.kg?.entities ?? [],
    relationships: referenceReport.kg?.relationships ?? [],
    sections: referenceReport.sections,
    onOpenSection: () => undefined,
    onOpenEntity: () => undefined,
    onSeeInGraph: () => undefined,
    onClose: () => undefined
  }
} satisfies Meta<typeof EntityDetailPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Snapshot: Story = {};
