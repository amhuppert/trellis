// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Entity, Relationship, Section } from "../../../schemas";
import { EntityDetailPanel } from "../EntityDetailPanel";

const entity: Entity = {
  id: "snapshot",
  name: "snapshot",
  type: "concept",
  shortDef: "The transaction view that decides which tuple versions count as visible.",
  references: [],
  aliases: [],
  primarySectionId: "snapshots"
};

const entities: Entity[] = [
  entity,
  {
    id: "xmin",
    name: "xmin",
    type: "concept",
    shortDef: "Transaction id of the inserter.",
    references: [],
    aliases: [],
    primarySectionId: "tuple-versions"
  },
  {
    id: "xip-list",
    name: "xip list",
    type: "concept",
    shortDef: "The in-progress transaction ids carried by a snapshot.",
    references: [],
    aliases: [],
    primarySectionId: "snapshots"
  }
];

const relationships: Relationship[] = [
  { id: "rel-snapshot-xip-list", from: "snapshot", to: "xip-list", type: "contains", strength: "medium", sourceRefIds: [] },
  { id: "rel-xmin-snapshot", from: "xmin", to: "snapshot", type: "compared-by", strength: "strong", sourceRefIds: [] }
];

const sections: Section[] = [
  {
    id: "snapshots",
    n: "03",
    title: "Snapshots",
    kind: "Mechanism",
    blocks: [],
    children: [],
    relatedSectionIds: [],
    relatedEntityIds: [],
    sourceRefIds: []
  }
];

afterEach(() => cleanup());

describe("EntityDetailPanel", () => {
  it("renders the focused entity, primary section action, graph action, and close action", async () => {
    const user = userEvent.setup();
    const onOpenSection = vi.fn();
    const onSeeInGraph = vi.fn();
    const onClose = vi.fn();

    render(
      <EntityDetailPanel
        entity={entity}
        entities={entities}
        relationships={relationships}
        sections={sections}
        onOpenSection={onOpenSection}
        onOpenEntity={vi.fn()}
        onSeeInGraph={onSeeInGraph}
        onClose={onClose}
      />
    );

    expect(screen.getByText("concept")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "snapshot" })).toBeInTheDocument();
    expect(screen.getByText(entity.shortDef)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open 03 · Snapshots" }));
    expect(onOpenSection).toHaveBeenCalledWith("snapshots");

    await user.click(screen.getByRole("button", { name: /See in knowledge graph/ }));
    expect(onSeeInGraph).toHaveBeenCalledWith("snapshot");

    await user.click(screen.getByRole("button", { name: "Close entity detail" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("lists outgoing relationships before incoming relationships and opens the other entity", async () => {
    const user = userEvent.setup();
    const onOpenEntity = vi.fn();

    render(
      <EntityDetailPanel
        entity={entity}
        entities={entities}
        relationships={relationships}
        sections={sections}
        onOpenSection={vi.fn()}
        onOpenEntity={onOpenEntity}
        onSeeInGraph={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const rows = screen.getAllByRole("button", { name: /contains|compared-by/ });
    expect(rows.map((row) => row.textContent)).toEqual(["contains → xip list", "xmin → compared-by (this)"]);

    await user.click(screen.getByRole("button", { name: "contains → xip list" }));
    expect(onOpenEntity).toHaveBeenCalledWith("xip-list");

    await user.click(screen.getByRole("button", { name: "xmin → compared-by (this)" }));
    expect(onOpenEntity).toHaveBeenCalledWith("xmin");
  });
});
