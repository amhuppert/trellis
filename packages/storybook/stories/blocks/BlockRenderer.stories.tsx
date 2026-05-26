import type { Meta, StoryObj } from "@storybook/react";
import type { Block } from "@trellis/engine";
import { BlockRenderer } from "@trellis/engine/components/blocks";
import { foundations } from "../../../../reports/postgres-mvcc/content/foundations";

const stubBlocks: Block[] = [
  {
    kind: "codeBlock",
    anchorId: "gallery-code",
    language: "sql",
    title: "Tuple visibility check",
    code: "SELECT xmin, xmax, ctid FROM accounts WHERE id = 42;"
  },
  {
    kind: "figure",
    anchorId: "gallery-figure",
    src: "/placeholder-mvcc.png",
    alt: "Diagram placeholder showing tuple versions connected to snapshots.",
    caption: "A figure placeholder for a later report-local diagram."
  },
  {
    kind: "comparisonTable",
    anchorId: "gallery-table",
    title: "Read behavior",
    columns: ["Mechanism", "Reader behavior"],
    rows: [["Locks", "Readers can wait on writers."], ["MVCC", "Readers use a <e id=\"snapshot\">snapshot</e>."]]
  },
  {
    kind: "custom",
    anchorId: "gallery-custom",
    componentName: "VisibilityTimeline",
    props: {}
  }
];

const blocks = [...foundations.blocks, ...stubBlocks];

const meta = {
  title: "BlockRenderer/All Blocks",
  component: BlockRenderer,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof BlockRenderer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllBlocks: Story = {
  args: {
    block: foundations.blocks[0],
    callbacks: {
      onOpenEntity: () => undefined,
      onOpenSection: () => undefined
    }
  },
  render: () => (
    <main className="min-h-screen bg-bg p-8 text-ink">
      <div className="grid max-w-[var(--layout-reading-width)] gap-5">
        {blocks.map((block, index) => (
          <BlockRenderer
            key={`${block.kind}-${block.anchorId ?? index}`}
            block={block}
            callbacks={{
              onOpenEntity: () => undefined,
              onOpenSection: () => undefined,
              sectionTitles: {
                "tuple-versions": "Tuple versions"
              }
            }}
          />
        ))}
      </div>
    </main>
  )
};
