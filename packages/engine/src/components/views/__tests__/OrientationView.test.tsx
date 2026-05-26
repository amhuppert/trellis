// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";
import { OrientationView } from "../OrientationView";

const report = {
  id: "postgres-mvcc",
  title: "How Postgres MVCC Works",
  subtitle: "How snapshots and tuple versions work together.",
  readTime: "45 min",
  builtAt: "2026-05-24T00:00:00.000Z",
  template: "tutorial",
  authors: [{ name: "Test", role: "Authored by" }],
  orientation: {
    heroSummary: "A reader's map to MVCC.",
    whatYoullLearn: ["Read snapshots", "Track tuple versions"],
    recommendedPath: ["foundations", "tuple-versions"],
    keyEntityIds: ["mvcc", "snapshot"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "foundations" },
      { label: "Inspect MVCC", mode: "reference", targetId: "mvcc" },
      { label: "Open synthesis", mode: "synthesis", targetId: "syn-root" },
      { label: "Graph atlas", mode: "graph" }
    ]
  },
  sections: [
    {
      id: "foundations",
      n: "01",
      title: "Foundations",
      kind: "Concept",
      time: "5m",
      summary: "Start with the storage contract.",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    },
    {
      id: "tuple-versions",
      n: "02",
      title: "Tuple versions",
      kind: "Mechanism",
      time: "8m",
      summary: "Rows carry transaction stamps.",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  synthesis: {
    description: "Root synthesis",
    roots: [
      {
        id: "syn-root",
        level: 0,
        title: "MVCC as a contract",
        summary: "Writers stamp row versions and readers carry snapshots.",
        keyTakeaways: [],
        openQuestions: [],
        references: [],
        children: [
          {
            id: "syn-storage",
            level: 1,
            title: "Storage",
            summary: "Tuple versions preserve the past.",
            keyTakeaways: [],
            openQuestions: [],
            references: [],
            children: []
          }
        ]
      }
    ]
  },
  kg: {
    entities: [
      {
        id: "mvcc",
        name: "MVCC",
        type: "concept",
        aliases: [],
        shortDef: "Multi-Version Concurrency Control.",
        references: []
      },
      {
        id: "snapshot",
        name: "snapshot",
        type: "concept",
        aliases: [],
        shortDef: "The transaction's visible set of row versions.",
        references: []
      }
    ],
    relationships: []
  },
  sources: [],
  customComponents: []
} satisfies ReportConfig;

function renderOrientation(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "orientation",
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

  render(
    <ReaderContext.Provider value={value}>
      <OrientationView />
    </ReaderContext.Provider>
  );

  return value;
}

afterEach(() => cleanup());

describe("OrientationView", () => {
  it("renders the 12-column bento composition from report orientation data", () => {
    renderOrientation();

    const grid = screen.getByTestId("orientation-bento-grid");
    expect(grid).toHaveStyle({ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" });

    expect(screen.getByTestId("orientation-card-hero")).toHaveStyle({ gridColumn: "span 8 / span 8" });
    expect(screen.getByTestId("orientation-card-modes")).toHaveStyle({ gridColumn: "span 4 / span 4" });
    expect(screen.getByTestId("orientation-card-learn")).toHaveClass("bg-coral-bg");
    expect(screen.getByTestId("orientation-card-synthesis")).toHaveStyle({ gridColumn: "span 7 / span 7" });
    expect(screen.getByTestId("orientation-card-path")).toHaveStyle({ gridColumn: "span 12 / span 12" });
    expect(screen.getByTestId("orientation-recommended-subgrid")).toHaveStyle({
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))"
    });
    expect(screen.getByTestId("orientation-card-entities")).toHaveStyle({ gridColumn: "span 8 / span 8" });
    expect(screen.getByTestId("orientation-card-jump")).toHaveClass("bg-sage-bg");

    expect(screen.getByRole("heading", { name: "How Postgres MVCC Works" })).toHaveClass("font-serif");
    expect(screen.getByText("A reader's map to MVCC.")).toBeVisible();
    expect(screen.getByText("Read snapshots")).toBeVisible();
    expect(screen.getByRole("button", { name: /Storage/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /01 Foundations/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /MVCC concept/ })).toBeVisible();
    expect(within(screen.getByTestId("orientation-card-jump")).getByRole("button", { name: /Start guided/ })).toBeVisible();
  });

  it("wires every card family to the reader navigation helpers", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();
    const openSection = vi.fn();
    const openEntity = vi.fn();
    const openSynthesis = vi.fn();
    const openGraph = vi.fn();
    renderOrientation({ setMode, openSection, openEntity, openSynthesis, openGraph });

    await user.click(screen.getByRole("button", { name: /^Guided/ }));
    expect(setMode).toHaveBeenCalledWith("guided");

    await user.click(screen.getByRole("button", { name: /01 Foundations/ }));
    expect(openSection).toHaveBeenCalledWith("foundations");

    await user.click(screen.getByRole("button", { name: /Storage/ }));
    expect(openSynthesis).toHaveBeenCalledWith("syn-storage");

    await user.click(screen.getByRole("button", { name: /MVCC concept/ }));
    expect(openEntity).toHaveBeenCalledWith("mvcc");

    await user.click(screen.getByRole("button", { name: /Inspect MVCC/ }));
    expect(openEntity).toHaveBeenCalledWith("mvcc");

    await user.click(screen.getByRole("button", { name: /Graph atlas/ }));
    expect(openGraph).toHaveBeenCalledWith();
  });
});
