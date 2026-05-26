import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { GraphToolbar } from "@trellis/engine/components/graph";
import type { EntityType } from "@trellis/engine/schemas";

const availableTypes: EntityType[] = ["concept", "feature", "file", "pattern"];

function ToolbarPreview() {
  const [search, setSearch] = React.useState("");
  const [types, setTypes] = React.useState<Set<EntityType>>(new Set(["concept"]));
  const [minStrength, setMinStrength] = React.useState<"weak" | "medium" | "strong">("medium");

  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="rounded-lg border border-border-soft bg-surface">
        <GraphToolbar
          availableTypes={availableTypes}
          search={search}
          types={types}
          minStrength={minStrength}
          tableRows={[
            { id: "snapshot", label: "Snapshot", neighbors: ["Tuple version", "xip list"] },
            { id: "vacuum", label: "VACUUM", neighbors: ["visibility map"] }
          ]}
          onSearch={setSearch}
          onTypesChange={setTypes}
          onStrengthChange={setMinStrength}
          onResetLayout={() => undefined}
        />
      </div>
    </main>
  );
}

const meta = {
  title: "Graph/GraphToolbar",
  component: ToolbarPreview,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof ToolbarPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ToolbarPreview />
};
