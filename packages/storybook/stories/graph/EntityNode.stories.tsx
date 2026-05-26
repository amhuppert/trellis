import type { Meta, StoryObj } from "@storybook/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EntityNode, nodeTypes } from "@trellis/engine/components/graph";
import type { EntityFlowNode } from "@trellis/engine/kg";

const entity = {
  id: "snapshot",
  name: "Snapshot",
  aliases: ["transaction view"],
  type: "concept" as const,
  shortDef: "The transaction view that decides which tuple versions count as visible.",
  references: [],
  primarySectionId: "snapshots"
};

const makeNode = (id: string, x: number, selected = false, dimmed = false): EntityFlowNode => ({
  id,
  type: "entity",
  position: { x, y: 80 },
  data: {
    entity: { ...entity, id, name: id === "tuple" ? "Tuple version" : entity.name, type: id === "tuple" ? "feature" : "concept" },
    degree: id === "tuple" ? 3 : 2,
    selected,
    dimmed,
    sectionIds: ["snapshots"]
  }
});

function EntityNodeStates() {
  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="h-[260px] rounded-lg border border-border-soft bg-surface">
        <ReactFlowProvider>
          <ReactFlow
            fitView
            nodes={[makeNode("snapshot", 80), makeNode("tuple", 300, true), makeNode("dimmed", 520, false, true)]}
            edges={[]}
            nodeTypes={nodeTypes}
            panOnDrag={false}
            zoomOnScroll={false}
          />
        </ReactFlowProvider>
      </div>
    </main>
  );
}

const meta = {
  title: "Graph/EntityNode",
  component: EntityNodeStates,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof EntityNodeStates>;

export default meta;

type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => <EntityNodeStates />
};
