import type { Meta, StoryObj } from "@storybook/react";
import { ReactFlow, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RelationshipEdge, edgeTypes, nodeTypes } from "@trellis/engine/components/graph";
import type { EntityFlowNode, RelationshipFlowEdge } from "@trellis/engine/kg";

const makeNode = (id: string, x: number, y: number): EntityFlowNode => ({
  id,
  type: "entity",
  position: { x, y },
  data: {
    entity: {
      id,
      name: id,
      aliases: [],
      type: "concept",
      shortDef: id,
      references: [],
      primarySectionId: "edges"
    },
    degree: 1,
    selected: false,
    dimmed: false,
    sectionIds: ["edges"]
  }
});

const makeEdge = (id: string, source: string, target: string, strength: "weak" | "medium" | "strong"): RelationshipFlowEdge => ({
  id,
  source,
  target,
  type: "relationship",
  data: {
    relationship: {
      id,
      from: source,
      to: target,
      type: strength === "strong" ? "depends-on" : "similar-to",
      label: strength,
      strength,
      sourceRefIds: []
    },
    strength,
    label: strength,
    dimmed: false
  }
});

function RelationshipEdgeStrengths() {
  return (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="h-[360px] rounded-lg border border-border-soft bg-surface">
        <ReactFlowProvider>
          <ReactFlow
            fitView
            nodes={[
              makeNode("A", 40, 40),
              makeNode("B", 320, 40),
              makeNode("C", 40, 160),
              makeNode("D", 320, 160),
              makeNode("E", 40, 280),
              makeNode("F", 320, 280)
            ]}
            edges={[
              makeEdge("weak", "A", "B", "weak"),
              makeEdge("medium", "C", "D", "medium"),
              makeEdge("strong", "E", "F", "strong")
            ]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            panOnDrag={false}
            zoomOnScroll={false}
          />
        </ReactFlowProvider>
      </div>
    </main>
  );
}

const meta = {
  title: "Graph/RelationshipEdge",
  component: RelationshipEdgeStrengths,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof RelationshipEdgeStrengths>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Strengths: Story = {
  render: () => <RelationshipEdgeStrengths />
};
