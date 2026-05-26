import type { Meta, StoryObj } from "@storybook/react";
import { EntityRef, InlineProse } from "@trellis/engine/components/inline";

const snapshot = {
  id: "snapshot",
  name: "snapshot",
  type: "concept" as const,
  aliases: [],
  shortDef: "The transaction view that decides which tuple versions count as visible.",
  references: [],
  primarySectionId: "snapshots"
};

const xipList = {
  id: "xip-list",
  name: "xip list",
  type: "concept" as const,
  aliases: [],
  shortDef: "The in-progress transaction ids carried by a snapshot.",
  references: [],
  primarySectionId: "snapshots"
};

const entities = [snapshot, xipList];

const meta = {
  title: "Inline/EntityRef",
  component: EntityRef,
  args: {
    id: "snapshot",
    entity: snapshot,
    children: "snapshot",
    onOpen: () => undefined
  },
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof EntityRef>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InFlow: Story = {
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <section className="mx-auto max-w-[var(--layout-reading-width)] rounded-lg border border-border-soft bg-surface p-6">
        <p className="text-body text-ink">
          <InlineProse
            entities={entities}
            text={'A <e id="snapshot">snapshot</e> records xmin, xmax, and the <e id="xip-list">xip list</e> so tuple visibility can be decided consistently.'}
            onOpenEntity={() => undefined}
          />
        </p>
      </section>
    </main>
  )
};

export const HoverCardVisible: Story = {
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <section className="mx-auto max-w-[var(--layout-reading-width)] rounded-lg border border-border-soft bg-surface p-6">
        <p className="text-body text-ink">
          A reader carries a{" "}
          <EntityRef defaultOpen entity={snapshot} id="snapshot" onOpen={() => undefined}>
            snapshot
          </EntityRef>{" "}
          while scanning tuple versions.
        </p>
      </section>
    </main>
  )
};
