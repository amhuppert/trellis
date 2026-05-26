import type { Meta, StoryObj } from "@storybook/react";
import { referenceReport as report } from "../fixtures/referenceReport";
import { ReaderContext, type ReaderContextValue } from "../../../engine/src/components/shell/AppShell";
import { OrientationView } from "../../../engine/src/components/views/OrientationView";

function OrientationStory() {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "orientation",
      sectionId: report.sections[0]?.id ?? "",
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
      <OrientationView />
    </ReaderContext.Provider>
  );
}

const meta = {
  title: "Views/OrientationView",
  component: OrientationStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof OrientationStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bento: Story = {};
