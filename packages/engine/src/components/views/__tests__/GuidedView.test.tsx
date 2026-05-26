// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";
import { GuidedView } from "../GuidedView";

const report = {
  id: "postgres-mvcc",
  title: "How Postgres MVCC Works",
  template: "tutorial",
  authors: [{ name: "Test", role: "Authored by" }],
  orientation: {
    heroSummary: "A reader's map to MVCC.",
    whatYoullLearn: [],
    recommendedPath: [],
    keyEntityIds: [],
    jumpTargets: []
  },
  sections: [
    {
      id: "foundations",
      n: "01",
      title: "Foundations",
      kind: "Concept",
      time: "5m",
      summary: "Before xmin, before snapshots, before VACUUM.",
      blocks: [
        {
          anchorId: "found-problem",
          kind: "conceptIntro",
          title: "What's the problem MVCC is solving?",
          body: "MVCC lets readers and writers avoid blocking each other."
        }
      ],
      children: [{ id: "found-problem", title: "What's the problem MVCC is solving?", children: [] }],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  sources: [],
  customComponents: []
} satisfies ReportConfig;

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

function renderGuided(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "guided",
      sectionId: "foundations",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: null,
      synthesisFocusId: null,
      graphMode: "atlas",
      graphFocusId: null,
      navTick: 0
    },
    openSection: vi.fn(),
    openEntity: vi.fn(),
    openSource: vi.fn(),
    openSynthesis: vi.fn(),
    openGraph: vi.fn(),
    setMode: vi.fn(),
    setCurrentSubId: vi.fn(),
    setState: vi.fn(),
    ...overrides
  };

  return render(
    <ReaderContext.Provider value={value}>
      <GuidedView />
    </ReaderContext.Provider>
  );
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("GuidedView", () => {
  it("renders the current section's blocks through BlockRenderer", () => {
    renderGuided();

    expect(screen.getByRole("heading", { level: 1, name: "Foundations" })).toBeInTheDocument();
    expect(screen.getByText("What's the problem MVCC is solving?")).toBeInTheDocument();
    expect(screen.getByText("MVCC lets readers and writers avoid blocking each other.")).toBeInTheDocument();
  });
});
