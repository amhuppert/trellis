import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@trellis/engine/components/primitives";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferenceTabs: Story = {
  render: () => (
    <div className="grid min-h-screen place-items-center bg-bg p-8">
      <Tabs defaultValue="entities" className="w-full max-w-[var(--layout-reading-width)]">
        <TabsList aria-label="Reference content">
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>
        <TabsContent value="entities">
          <div className="mt-4 rounded-lg border border-border-soft bg-surface p-5 text-body-sans text-ink-2">
            MVCC, snapshot, xmin, xmax, ctid, VACUUM
          </div>
        </TabsContent>
        <TabsContent value="sources">
          <div className="mt-4 rounded-lg border border-border-soft bg-surface p-5 text-body-sans text-ink-2">
            PostgreSQL docs, heap access methods, transaction visibility notes
          </div>
        </TabsContent>
        <TabsContent value="sections">
          <div className="mt-4 rounded-lg border border-border-soft bg-surface p-5 text-body-sans text-ink-2">
            Foundations, tuple versions, snapshots, visibility
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
};
