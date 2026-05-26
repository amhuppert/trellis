// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";
import { SynthesisView } from "../SynthesisView";

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
      summary: "Foundational MVCC ideas.",
      blocks: [],
      children: [{ id: "found-update", title: "What happens on UPDATE", children: [] }],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  kg: {
    entities: [{ id: "snapshot", name: "snapshot", type: "concept", shortDef: "Reader view.", aliases: [], references: [] }],
    relationships: []
  },
  sources: [{ kind: "url", id: "docs", title: "Docs", href: "https://example.com", host: "example.com" }],
  synthesis: {
    description: "A synthesis tree.",
    roots: [
      {
        id: "syn-root",
        level: 0,
        title: "MVCC as a contract",
        summary: "Writers leave versions and readers carry snapshots.",
        detail: "The contract centers on <e id=\"snapshot\">snapshots</e>.",
        commonStructure: "Each branch preserves a coherent reader view.",
        contrast: "Branches differ by whether they explain storage or visibility.",
        keyTakeaways: ["Readers get a stable past."],
        openQuestions: ["Which isolation level should be the default?"],
        references: [
          { kind: "section", id: "foundations", anchorId: "found-update" },
          { kind: "entity", id: "snapshot" },
          { kind: "source", id: "docs" }
        ],
        children: [
          {
            id: "syn-storage",
            level: 1,
            title: "Storage",
            summary: "Versions are stored as tuples.",
            keyTakeaways: [],
            openQuestions: [],
            references: [],
            children: []
          },
          {
            id: "syn-visibility",
            level: 1,
            title: "Visibility",
            summary: "Snapshots decide which versions count.",
            keyTakeaways: [],
            openQuestions: [],
            references: [],
            children: []
          }
        ]
      }
    ]
  },
  customComponents: []
} satisfies ReportConfig;

function renderSynthesis(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "synthesis",
      sectionId: "foundations",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: null,
      synthesisFocusId: "syn-root",
      graphMode: "atlas",
      graphFocusId: null,
      navTick: 0
    },
    openSection: vi.fn(),
    openEntity: vi.fn(),
    openSynthesis: vi.fn(),
    openGraph: vi.fn(),
    openSource: vi.fn(),
    setMode: vi.fn(),
    setCurrentSubId: vi.fn(),
    setState: vi.fn(),
    ...overrides
  };

  return {
    ...render(
      <ReaderContext.Provider value={value}>
        <SynthesisView />
      </ReaderContext.Provider>
    ),
    value
  };
}

afterEach(() => cleanup());

describe("SynthesisView", () => {
  it("renders a focused synthesis node with content blocks and resolved references", () => {
    renderSynthesis();

    expect(screen.getByRole("navigation", { name: "Synthesis breadcrumbs" })).toBeInTheDocument();
    expect(screen.getByText("L0")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "MVCC as a contract" })).toBeInTheDocument();
    expect(screen.getByText("Writers leave versions and readers carry snapshots.")).toBeInTheDocument();
    expect(screen.getByText("COMMON STRUCTURE")).toBeInTheDocument();
    expect(screen.getByText("Each branch preserves a coherent reader view.")).toBeInTheDocument();
    expect(screen.getByText("CONTRAST")).toBeInTheDocument();
    expect(screen.getByText("Readers get a stable past.")).toBeInTheDocument();
    expect(screen.getByText("Which isolation level should be the default?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /section §01 · Foundations/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /entity snapshot/ })).toBeInTheDocument();
  });

  it("opens children, breadcrumbs, siblings, and references through reader helpers", async () => {
    const user = userEvent.setup();
    const openSynthesis = vi.fn();
    const openSection = vi.fn();
    const openEntity = vi.fn();
    const { value, rerender } = renderSynthesis({ openSynthesis, openSection, openEntity });

    await user.click(screen.getByRole("button", { name: /Storage Versions are stored as tuples/ }));
    expect(value.openSynthesis).toHaveBeenCalledWith("syn-storage");

    rerender(
      <ReaderContext.Provider
        value={{
          ...value,
          state: { ...value.state, synthesisFocusId: "syn-storage" },
          openSynthesis,
          openSection,
          openEntity
        }}
      >
        <SynthesisView />
      </ReaderContext.Provider>
    );

    expect(screen.getByRole("button", { name: "MVCC as a contract" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Visibility" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "MVCC as a contract" }));
    expect(openSynthesis).toHaveBeenCalledWith("syn-root");

    rerender(
      <ReaderContext.Provider value={value}>
        <SynthesisView />
      </ReaderContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: /section §01 · Foundations/ }));
    expect(openSection).toHaveBeenCalledWith("foundations", "found-update");

    await user.click(screen.getByRole("button", { name: /entity snapshot/ }));
    expect(openEntity).toHaveBeenCalledWith("snapshot");
  });
});
