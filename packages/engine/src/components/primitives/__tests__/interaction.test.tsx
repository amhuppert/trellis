// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl, Tabs, TabsContent, TabsList, TabsTrigger } from "../index";

afterEach(() => cleanup());

describe("SegmentedControl", () => {
  it("changes active segment on click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SegmentedControl
        aria-label="Reference panels"
        items={[
          { id: "entities", label: "Entities" },
          { id: "sources", label: "Sources" }
        ]}
        value="entities"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("radio", { name: "Sources" }));
    expect(onChange).toHaveBeenCalledWith("sources");
  });

  it("moves with arrow keys and selects the next segment", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <SegmentedControl
        aria-label="Reference panels"
        items={[
          { id: "entities", label: "Entities" },
          { id: "sources", label: "Sources" },
          { id: "sections", label: "Sections" }
        ]}
        value="entities"
        onChange={onChange}
      />
    );

    screen.getByRole("radio", { name: "Entities" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("sources");
  });
});

describe("Tabs", () => {
  it("uses Radix keyboard navigation between triggers", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="entities">
        <TabsList aria-label="Reference content">
          <TabsTrigger value="entities">Entities</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>
        <TabsContent value="entities">Entity index</TabsContent>
        <TabsContent value="sources">Source index</TabsContent>
      </Tabs>
    );

    screen.getByRole("tab", { name: "Entities" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Sources" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Source index");
  });
});
