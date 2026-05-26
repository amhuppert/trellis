// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EntityRef } from "../index";

const snapshot = {
  id: "snapshot",
  name: "snapshot",
  type: "concept" as const,
  shortDef: "The transaction view that decides which tuple versions count as visible.",
  primarySectionId: "snapshots"
};

afterEach(() => cleanup());

describe("EntityRef", () => {
  it("renders the visible name as a coral mono inline control", () => {
    render(
      <p>
        <EntityRef entity={snapshot} id="snapshot" onOpen={vi.fn()}>
          snapshot
        </EntityRef>
      </p>
    );

    const ref = screen.getByRole("button", { name: "snapshot" });
    expect(ref).toHaveClass("text-coral-ink");
    expect(ref).toHaveClass("font-mono");
  });

  it("clicking the reference invokes onOpen with the entity id", async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(
      <EntityRef entity={snapshot} id="snapshot" onOpen={onOpen}>
        snapshot
      </EntityRef>
    );

    await user.click(screen.getByRole("button", { name: "snapshot" }));
    expect(onOpen).toHaveBeenCalledWith("snapshot");
  });

  it("hovering shows the hover card with definition and actions", async () => {
    const user = userEvent.setup();

    render(
      <EntityRef entity={snapshot} id="snapshot" onOpen={vi.fn()} openDelay={0}>
        snapshot
      </EntityRef>
    );

    await user.hover(screen.getByRole("button", { name: "snapshot" }));
    expect(await screen.findByText(snapshot.shortDef)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "See in graph" })).toBeInTheDocument();
  });

  it("keyboard focus opens the hover card and Escape dismisses it", async () => {
    const user = userEvent.setup();

    render(
      <EntityRef entity={snapshot} id="snapshot" onOpen={vi.fn()} openDelay={0}>
        snapshot
      </EntityRef>
    );

    await user.tab();
    expect(await screen.findByText(snapshot.shortDef)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText(snapshot.shortDef)).not.toBeInTheDocument());
  });
});
