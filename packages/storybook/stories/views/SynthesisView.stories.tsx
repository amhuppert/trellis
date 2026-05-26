import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { referenceReport as report } from "../fixtures/referenceReport";
import { ReaderContext, type ReaderContextValue } from "../../../engine/src/components/shell/AppShell";
import { SynthesisView } from "../../../engine/src/components/views/SynthesisView";

function SynthesisStory({ focusId = "syn-root" }: { focusId?: string }) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "synthesis",
      sectionId: report.sections[0]?.id ?? "",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: null,
      synthesisFocusId: focusId,
      graphMode: "atlas",
      graphFocusId: null,
      navTick: 0
    },
    openSection: () => undefined,
    openEntity: () => undefined,
    openSynthesis: () => undefined,
    openSource: () => undefined,
    openGraph: () => undefined,
    setMode: () => undefined,
    setCurrentSubId: () => undefined,
    setState: () => undefined
  };

  return (
    <ReaderContext.Provider value={value}>
      <SynthesisView />
    </ReaderContext.Provider>
  );
}

const meta = {
  title: "Views/SynthesisView",
  component: SynthesisStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof SynthesisStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Root: Story = {};

export const FocusedBranch: Story = {
  args: {
    focusId: "syn-storage"
  }
};
