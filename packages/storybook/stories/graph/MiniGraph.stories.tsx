import type { Meta, StoryObj } from "@storybook/react";
import { MiniGraph, SectionHeaderGraph } from "@trellis/engine/components/graph";
import { ReaderContext, type ReaderContextValue } from "@trellis/engine/components/shell";
import { referenceReport as report } from "../fixtures/referenceReport";

const contextValue: ReaderContextValue = {
  report,
  state: {
    mode: "guided",
    sectionId: "snapshots",
    scrollTarget: null,
    currentSubId: null,
    focusEntityId: null,
    synthesisFocusId: null,
    graphMode: "atlas",
    graphFocusId: null,
    navTick: 0
  },
  openSection: () => undefined,
  openEntity: () => undefined,
  openSource: () => undefined,
  openSynthesis: () => undefined,
  openGraph: () => undefined,
  setMode: () => undefined,
  setCurrentSubId: () => undefined,
  setState: () => undefined
};

function MiniGraphPreview() {
  const section = report.sections.find((item) => item.id === "snapshots") ?? report.sections[0];
  return (
    <ReaderContext.Provider value={contextValue}>
      <main className="min-h-screen bg-bg p-8 text-ink">
        <div className="grid gap-8">
          <MiniGraph entityIds={section.relatedEntityIds} width={220} height={160} />
          <SectionHeaderGraph section={section} />
        </div>
      </main>
    </ReaderContext.Provider>
  );
}

const meta = {
  title: "Graph/MiniGraph",
  component: MiniGraphPreview,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof MiniGraphPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SharedWrappers: Story = {
  render: () => <MiniGraphPreview />
};
