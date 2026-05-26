// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { NavPanel } from "../NavPanel";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";

const report = {
  id: "postgres-mvcc",
  title: "How Postgres MVCC Works",
  template: "tutorial",
  readTime: "45m",
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
      blocks: [],
      children: [
        { id: "found-problem", title: "What's the problem MVCC is solving?", children: [] },
        {
          id: "found-update",
          title: "What happens on a single UPDATE",
          children: [{ id: "found-update-vacuum", title: "VACUUM cleans up later", children: [] }]
        }
      ],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    },
    {
      id: "tuple-versions",
      n: "02",
      title: "Tuple versions",
      kind: "Mechanism",
      blocks: [],
      children: [{ id: "tv-cols", title: "What lives on every tuple", children: [] }],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  sources: [],
  synthesis: {
    roots: [
      {
        id: "syn-root",
        level: 0,
        title: "MVCC as a contract",
        summary: "Root summary",
        keyTakeaways: [],
        openQuestions: [],
        references: [],
        children: [
          {
            id: "syn-storage",
            level: 1,
            title: "Storage",
            summary: "Storage summary",
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

function renderNavPanel(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "guided",
      sectionId: "foundations",
      scrollTarget: null,
      currentSubId: "found-update",
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

  return {
    ...render(
      <ReaderContext.Provider value={value}>
        <NavPanel />
      </ReaderContext.Provider>
    ),
    value
  };
}

afterEach(() => cleanup());

describe("NavPanel", () => {
  it("highlights the current section and current subsection", () => {
    renderNavPanel();

    expect(screen.getByRole("button", { name: /01\s+Foundations/ })).toHaveClass("is-current-section");
    expect(screen.getByRole("button", { name: "What happens on a single UPDATE" })).toHaveClass(
      "is-current-subsection"
    );
    expect(screen.getByRole("button", { name: /02\s+Tuple versions/ })).not.toHaveClass("is-current-section");
  });

  it("opens sections and child anchors", async () => {
    const user = userEvent.setup();
    const openSection = vi.fn();
    const { value } = renderNavPanel({ openSection });

    await user.click(screen.getByRole("button", { name: /02\s+Tuple versions/ }));
    expect(value.openSection).toHaveBeenCalledWith("tuple-versions");

    await user.click(screen.getByRole("button", { name: "VACUUM cleans up later" }));
    expect(openSection).toHaveBeenCalledWith("foundations", "found-update-vacuum");
  });

  it("jump block switches top-level modes", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();

    renderNavPanel({ setMode });

    await user.click(screen.getByRole("button", { name: /Reference/ }));
    expect(setMode).toHaveBeenCalledWith("reference");
  });

  it("wires section and synthesis tabs to reader mode", async () => {
    const user = userEvent.setup();
    const openSynthesis = vi.fn();
    const setMode = vi.fn();

    renderNavPanel({ openSynthesis, setMode });

    await user.click(screen.getByRole("tab", { name: "Synthesis" }));
    expect(openSynthesis).toHaveBeenCalledWith();

    cleanup();

    renderNavPanel({
      setMode,
      state: {
        mode: "synthesis",
        sectionId: "foundations",
        scrollTarget: null,
        currentSubId: null,
        focusEntityId: null,
        synthesisFocusId: "syn-storage",
        graphMode: "atlas",
        graphFocusId: null,
        navTick: 0
      }
    });

    expect(screen.getByRole("tab", { name: "Synthesis" })).toHaveAttribute("data-state", "active");

    await user.click(screen.getByRole("tab", { name: "Sections" }));
    expect(setMode).toHaveBeenCalledWith("guided");
  });

  it("renders a flattened synthesis tree and opens focused nodes", async () => {
    const user = userEvent.setup();
    const openSynthesis = vi.fn();

    renderNavPanel({
      openSynthesis,
      state: {
        mode: "synthesis",
        sectionId: "foundations",
        scrollTarget: null,
        currentSubId: null,
        focusEntityId: null,
        synthesisFocusId: "syn-storage",
        graphMode: "atlas",
        graphFocusId: null,
        navTick: 0
      }
    });

    await user.click(screen.getByRole("tab", { name: "Synthesis" }));

    expect(screen.getByRole("button", { name: /L0 MVCC as a contract/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /L1 Storage/ })).toHaveClass("is-current-synthesis");

    await user.click(screen.getByRole("button", { name: /L0 MVCC as a contract/ }));
    expect(openSynthesis).toHaveBeenCalledWith("syn-root");
  });
});
