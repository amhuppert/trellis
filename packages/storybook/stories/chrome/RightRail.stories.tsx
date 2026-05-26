import type { Meta, StoryObj } from "@storybook/react";
import { RightRail } from "../../../engine/src/components/chrome/RightRail";
import { ReaderContext, type ReaderContextValue } from "../../../engine/src/components/shell/AppShell";
import { referenceReport } from "../fixtures/referenceReport";

function RightRailStory() {
  const value: ReaderContextValue = {
    report: referenceReport,
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

  return (
    <ReaderContext.Provider value={value}>
      <RightRail />
    </ReaderContext.Provider>
  );
}

const meta = {
  title: "Chrome/RightRail",
  component: RightRailStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof RightRailStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Snapshots: Story = {};
