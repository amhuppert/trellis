// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { ReaderContext, type ReaderContextValue } from "../../shell/AppShell";
import { RightRail } from "../RightRail";

const report = {
  id: "right-rail-test",
  title: "RightRail Test",
  template: "tutorial",
  authors: [{ name: "Test", role: "Authored by" }],
  orientation: {
    heroSummary: "Right rail test.",
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
      relatedEntityIds: ["snapshot", "xip-list"],
      sourceRefIds: ["docs", "snap-code"]
    }
  ],
  kg: {
    entities: [
      {
        id: "snapshot",
        name: "snapshot",
        type: "concept",
        shortDef: "The transaction view.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      },
      {
        id: "xip-list",
        name: "xip list",
        type: "concept",
        shortDef: "In-progress transaction ids.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      }
    ],
    relationships: []
  },
  sources: [
    { id: "docs", kind: "url", title: "PostgreSQL docs", href: "https://www.postgresql.org/docs/current/mvcc.html" },
    { id: "snap-code", kind: "code", title: "snapmgr.c", path: "src/backend/utils/time/snapmgr.c" }
  ],
  customComponents: []
} satisfies ReportConfig;

function renderRail(overrides: Partial<ReaderContextValue> = {}) {
  const value: ReaderContextValue = {
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
        <RightRail />
      </ReaderContext.Provider>
    )
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RightRail", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
  });

  it("renders related entities and section sources", () => {
    renderRail();

    expect(screen.queryByText("NEIGHBORHOOD GRAPH")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapshot concept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "xip list concept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PostgreSQL docs url" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "snapmgr.c code" })).toBeInTheDocument();
  });

  it("opens related entities, URL sources, and the regions graph action", async () => {
    const user = userEvent.setup();
    const openEntity = vi.fn();
    const openGraph = vi.fn();
    const open = vi.fn();
    vi.stubGlobal("open", open);

    renderRail({ openEntity, openGraph });

    await user.click(screen.getByRole("button", { name: "snapshot concept" }));
    expect(openEntity).toHaveBeenCalledWith("snapshot");

    await user.click(screen.getByRole("button", { name: "PostgreSQL docs url" }));
    expect(open).toHaveBeenCalledWith("https://www.postgresql.org/docs/current/mvcc.html", "_blank", "noopener,noreferrer");

    await user.click(screen.getByRole("button", { name: "snapmgr.c code" }));
    expect(open).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "See full graph" }));
    expect(openGraph).toHaveBeenCalledWith(undefined, "regions");
  });
});
