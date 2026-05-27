// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GraphToolbar } from "../GraphToolbar";

const entityTypes = ["concept", "feature", "file"] as const;

afterEach(() => {
  cleanup();
});

describe("GraphToolbar", () => {
  it("calls onSearch as the controlled search input changes", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(
      <GraphToolbar
        availableTypes={entityTypes}
        search=""
        types={new Set()}
        minStrength="medium"
        onSearch={onSearch}
        onTypesChange={() => undefined}
        onStrengthChange={() => undefined}
        onResetLayout={() => undefined}
      />
    );

    await user.type(screen.getByRole("searchbox", { name: /search graph/i }), "snap");

    expect(onSearch).toHaveBeenLastCalledWith("p");
  });

  it("toggles type filters and clears them with All", async () => {
    const user = userEvent.setup();
    const onTypesChange = vi.fn();

    render(
      <GraphToolbar
        availableTypes={entityTypes}
        search=""
        types={new Set(["concept"])}
        minStrength="medium"
        onSearch={() => undefined}
        onTypesChange={onTypesChange}
        onStrengthChange={() => undefined}
        onResetLayout={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: "feature" }));
    expect(Array.from(onTypesChange.mock.calls[0][0])).toEqual(["concept", "feature"]);

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(Array.from(onTypesChange.mock.calls[1][0])).toEqual([]);
  });

  it("changes strength and resets layout", async () => {
    const user = userEvent.setup();
    const onStrengthChange = vi.fn();
    const onResetLayout = vi.fn();

    render(
      <GraphToolbar
        availableTypes={entityTypes}
        search=""
        types={new Set()}
        minStrength="medium"
        onSearch={() => undefined}
        onTypesChange={() => undefined}
        onStrengthChange={onStrengthChange}
        onResetLayout={onResetLayout}
      />
    );

    fireEvent.change(screen.getByLabelText(/minimum relationship strength/i), { target: { value: "2" } });
    await user.click(screen.getByRole("button", { name: /reset layout/i }));

    expect(onStrengthChange).toHaveBeenCalledWith("strong");
    expect(onResetLayout).toHaveBeenCalledTimes(1);
  });

  it("does not render a view-as-table affordance", () => {
    render(
      <GraphToolbar
        availableTypes={entityTypes}
        search=""
        types={new Set()}
        minStrength="medium"
        onSearch={() => undefined}
        onTypesChange={() => undefined}
        onStrengthChange={() => undefined}
        onResetLayout={() => undefined}
      />
    );

    expect(screen.queryByRole("button", { name: /view as table/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: /graph table/i })).not.toBeInTheDocument();
  });
});
