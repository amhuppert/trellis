import type { Meta, StoryObj } from "@storybook/react";
import { ReferenceView } from "../../../engine/src/components/views/ReferenceView";
import { ReaderContext, type ReaderContextValue } from "../../../engine/src/components/shell/AppShell";
import { referenceReport } from "../fixtures/referenceReport";

function ReferenceViewStory({ focusEntityId }: { focusEntityId?: string | null }) {
  const value: ReaderContextValue = {
    report: referenceReport,
    state: {
      mode: "reference",
      sectionId: referenceReport.sections[0]?.id ?? "",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: focusEntityId ?? null,
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
      <ReferenceView />
    </ReaderContext.Provider>
  );
}

const meta = {
  title: "Views/ReferenceView",
  component: ReferenceViewStory,
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta<typeof ReferenceViewStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Glossary: Story = {
  args: {
    focusEntityId: null
  }
};

export const FocusedEntity: Story = {
  args: {
    focusEntityId: "snapshot"
  }
};
