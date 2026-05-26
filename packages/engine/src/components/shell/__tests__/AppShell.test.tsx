// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../../schemas";
import { AppShell, useReader } from "../AppShell";

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
    },
    {
      id: "tuple-versions",
      n: "02",
      title: "Tuple versions",
      kind: "Mechanism",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  sources: [],
  customComponents: []
} satisfies ReportConfig;

function Probe() {
  const reader = useReader();
  return (
    <div>
      <output data-testid="state">{JSON.stringify(reader.state)}</output>
      <input aria-label="Shortcut target" />
      <button type="button" onClick={() => reader.openSection("foundations", "found-update")}>
        open section
      </button>
      <button type="button" onClick={() => reader.openEntity("snapshot")}>
        open entity
      </button>
      <button type="button" onClick={() => reader.openGraph("snapshot", "spotlight")}>
        open graph spotlight
      </button>
      <button type="button" onClick={() => reader.openGraph()}>
        open graph atlas
      </button>
      <button type="button" onClick={() => reader.setMode("synthesis")}>
        set synthesis
      </button>
    </div>
  );
}

const state = () => JSON.parse(screen.getByTestId("state").textContent ?? "{}");

function pressKey(key: string) {
  act(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "/");
});

afterEach(() => cleanup());

describe("AppShell reader state", () => {
  it("mounts with default state", () => {
    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    expect(state()).toMatchObject({
      mode: "orientation",
      sectionId: "foundations",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: null,
      synthesisFocusId: null,
      graphMode: "atlas",
      graphFocusId: null,
      navTick: 0
    });
  });

  it("exposes navigation helpers through ReaderContext", async () => {
    const user = userEvent.setup();

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await user.click(screen.getByRole("button", { name: "open section" }));
    expect(state()).toMatchObject({
      mode: "guided",
      sectionId: "foundations",
      scrollTarget: "found-update"
    });

    await user.click(screen.getByRole("button", { name: "open entity" }));
    expect(state()).toMatchObject({
      mode: "reference",
      focusEntityId: "snapshot"
    });

    await user.click(screen.getByRole("button", { name: "open graph spotlight" }));
    expect(state()).toMatchObject({
      mode: "graph",
      graphMode: "spotlight",
      graphFocusId: "snapshot"
    });

    await user.click(screen.getByRole("button", { name: "open graph atlas" }));
    expect(state()).toMatchObject({
      mode: "graph",
      graphMode: "atlas",
      graphFocusId: null
    });

    await user.click(screen.getByRole("button", { name: "set synthesis" }));
    expect(state()).toMatchObject({
      mode: "synthesis",
      sectionId: "foundations",
      graphMode: "atlas"
    });
  });

  it("only reserves the right-rail grid track while guided mode renders RightRail", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );
    const body = container.querySelector(".trellis-shell__body");

    expect(body).not.toHaveClass("trellis-shell__body--with-right-rail");

    await user.click(screen.getByRole("button", { name: "open section" }));
    expect(body).toHaveClass("trellis-shell__body--with-right-rail");

    await user.click(screen.getByRole("button", { name: "open entity" }));
    expect(body).not.toHaveClass("trellis-shell__body--with-right-rail");
  });

  it("persists only persistent fields under the report-scoped key", async () => {
    const user = userEvent.setup();

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await user.click(screen.getByRole("button", { name: "open section" }));
    await user.click(screen.getByRole("button", { name: "open graph spotlight" }));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem("trellis:postgres-mvcc") ?? "{}")).toEqual({
        mode: "graph",
        sectionId: "foundations",
        graphMode: "spotlight"
      });
    });
  });

  it("restores persistent fields from localStorage on re-mount", () => {
    localStorage.setItem(
      "trellis:postgres-mvcc",
      JSON.stringify({
        mode: "graph",
        sectionId: "tuple-versions",
        graphMode: "regions",
        scrollTarget: "should-not-restore",
        currentSubId: "should-not-restore",
        focusEntityId: "snapshot",
        synthesisFocusId: "syn-root",
        graphFocusId: "snapshot",
        navTick: 99
      })
    );

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    expect(state()).toMatchObject({
      mode: "graph",
      sectionId: "tuple-versions",
      graphMode: "regions",
      scrollTarget: null,
      currentSubId: null,
      focusEntityId: null,
      synthesisFocusId: null,
      graphFocusId: null,
      navTick: 0
    });
  });

  it("applies URL hash state over localStorage on mount", async () => {
    localStorage.setItem(
      "trellis:postgres-mvcc",
      JSON.stringify({ mode: "graph", sectionId: "tuple-versions", graphMode: "regions" })
    );
    history.replaceState(null, "", "/#/guided/foundations/found-update");

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await waitFor(() => {
      expect(state()).toMatchObject({
        mode: "guided",
        sectionId: "foundations",
        scrollTarget: "found-update",
        graphMode: "regions"
      });
    });
  });

  it("warns and falls back when the hash references an unknown section or entity", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    history.replaceState(null, "", "/#/guided/not-a-section");
    const { unmount } = render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await waitFor(() => {
      expect(state()).toMatchObject({ mode: "orientation", sectionId: "foundations" });
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unknown section id"));

    unmount();
    history.replaceState(null, "", "/#/reference/not-an-entity");
    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await waitFor(() => {
      expect(state()).toMatchObject({ mode: "reference", focusEntityId: null });
    });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unknown entity id"));

    warn.mockRestore();
  });

  it("increments navTick when the same section anchor is opened repeatedly", async () => {
    const user = userEvent.setup();

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await user.click(screen.getByRole("button", { name: "open section" }));
    expect(state().navTick).toBe(0);

    await user.click(screen.getByRole("button", { name: "open section" }));
    expect(state().navTick).toBe(1);
  });

  it("handles global keyboard shortcuts for modes and guided section navigation", async () => {
    const user = userEvent.setup();

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await user.keyboard("g");
    expect(state()).toMatchObject({ mode: "guided", sectionId: "foundations" });

    pressKey("]");
    expect(state()).toMatchObject({ mode: "guided", sectionId: "tuple-versions" });

    pressKey("[");
    expect(state()).toMatchObject({ mode: "guided", sectionId: "foundations" });

    pressKey("l");
    expect(state()).toMatchObject({ mode: "guided", sectionId: "tuple-versions" });

    pressKey("h");
    expect(state()).toMatchObject({ mode: "guided", sectionId: "foundations" });

    await user.keyboard("r");
    expect(state()).toMatchObject({ mode: "reference" });

    await user.keyboard("s");
    expect(state()).toMatchObject({ mode: "synthesis" });

    await user.keyboard("k");
    expect(state()).toMatchObject({ mode: "graph", graphMode: "atlas", graphFocusId: null });

    await user.keyboard("o");
    expect(state()).toMatchObject({ mode: "orientation" });
  });

  it("ignores shortcuts in editable targets and reserves Cmd/Ctrl+K", async () => {
    const user = userEvent.setup();

    render(
      <AppShell report={report}>
        <Probe />
      </AppShell>
    );

    await user.click(screen.getByLabelText("Shortcut target"));
    await user.keyboard("r");
    expect(state()).toMatchObject({ mode: "orientation" });

    screen.getByLabelText("Shortcut target").blur();
    const ctrlK = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, cancelable: true, bubbles: true });
    document.dispatchEvent(ctrlK);
    expect(ctrlK.defaultPrevented).toBe(true);
    expect(state()).toMatchObject({ mode: "orientation" });
  });

  it("throws when useReader is used outside AppShell", () => {
    const originalError = console.error;
    console.error = () => undefined;

    expect(() => render(<Probe />)).toThrow(/useReader must be used inside ReaderContext/);

    console.error = originalError;
  });
});
