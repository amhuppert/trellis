// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";
import { ReferenceView } from "../ReferenceView";

const report = {
  id: "reference-test",
  title: "Reference Test",
  template: "tutorial",
  authors: [{ name: "Test", role: "Authored by" }],
  orientation: {
    heroSummary: "Reference layer test.",
    whatYoullLearn: [],
    recommendedPath: [],
    keyEntityIds: [],
    jumpTargets: []
  },
  sections: [
    {
      id: "snapshots",
      n: "03",
      title: "Snapshots",
      kind: "Mechanism",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: ["snapshot"],
      sourceRefIds: ["docs"]
    }
  ],
  kg: {
    entities: [
      {
        id: "snapshot",
        name: "snapshot",
        type: "concept",
        shortDef: "The transaction view that decides which tuple versions count as visible.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      },
      {
        id: "xmin",
        name: "xmin",
        type: "concept",
        shortDef: "Transaction id of the inserter.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      }
    ],
    relationships: [
      { id: "rel-xmin-snapshot", from: "xmin", to: "snapshot", type: "compared-by", strength: "strong", sourceRefIds: ["code"] }
    ]
  },
  sources: [
    {
      id: "docs",
      kind: "url",
      title: "PostgreSQL docs",
      href: "https://www.postgresql.org/docs/current/mvcc.html",
      host: "postgresql.org"
    },
    {
      id: "code",
      kind: "code",
      title: "snapmgr.c",
      path: "src/backend/utils/time/snapmgr.c",
      lineRange: [120, 140]
    },
    {
      id: "paper",
      kind: "doc",
      title: "SSI in PostgreSQL",
      host: "VLDB",
      locationHint: "Section 4.2"
    },
    {
      id: "passage",
      kind: "passage",
      title: "Snapshot rules excerpt",
      documentSourceId: "paper",
      location: "p. 12"
    }
  ],
  customComponents: []
} satisfies ReportConfig;

function renderReference(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
    report,
    state: {
      mode: "reference",
      sectionId: "snapshots",
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

  return {
    value,
    ...render(
      <ReaderContext.Provider value={value}>
        <ReferenceView />
      </ReaderContext.Provider>
    )
  };
}

afterEach(() => cleanup());

describe("ReferenceView", () => {
  it("renders entity cards by default and opens clicked entities", async () => {
    const user = userEvent.setup();
    const openEntity = vi.fn();
    renderReference({ openEntity });

    expect(screen.getByRole("heading", { level: 1, name: "Glossary & sources" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Entities · 2" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Sources · 4" })).toBeInTheDocument();

    const snapshot = screen.getByRole("button", { name: /snapshot concept/i });
    expect(within(snapshot).getByText("The transaction view that decides which tuple versions count as visible.")).toBeInTheDocument();

    await user.click(snapshot);
    expect(openEntity).toHaveBeenCalledWith("snapshot");
  });

  it("highlights the focused entity and shows the unfocused tip card", () => {
    renderReference({
      state: {
        mode: "reference",
        sectionId: "snapshots",
        scrollTarget: null,
        currentSubId: null,
        focusEntityId: "snapshot",
        synthesisFocusId: null,
        graphMode: "atlas",
        graphFocusId: null,
        navTick: 0
      }
    });

    const snapshot = screen.getByRole("button", { name: "snapshot concept" });
    expect(snapshot.firstElementChild).toHaveClass("bg-coral-bg");
  });

  it("renders all source kinds with kind-specific sublines", async () => {
    const user = userEvent.setup();
    renderReference();

    await user.click(screen.getByRole("tab", { name: "Sources · 4" }));

    expect(screen.getByText("postgresql.org")).toBeInTheDocument();
    expect(screen.getByText("src/backend/utils/time/snapmgr.c:120-140")).toBeInTheDocument();
    expect(screen.getByText("VLDB · Section 4.2")).toBeInTheDocument();
    expect(screen.getByText("paper · p. 12")).toBeInTheDocument();
  });

  it("shows the prototype tip when no entity is focused", () => {
    renderReference();

    expect(screen.getByText("Tip")).toBeInTheDocument();
    expect(screen.getByText(/Click any entity to see its definition/)).toBeInTheDocument();
  });
});
