// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionPagination } from "../SectionPagination";

afterEach(() => cleanup());

describe("SectionPagination", () => {
  it("opens previous and next sections", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(
      <SectionPagination
        prev={{ id: "foundations", n: "01", title: "Foundations" }}
        next={{ id: "snapshots", n: "03", title: "Snapshots" }}
        onOpen={onOpen}
      />
    );

    await user.click(screen.getByRole("button", { name: "← Previous · 01 · Foundations" }));
    await user.click(screen.getByRole("button", { name: "Next · 03 · Snapshots →" }));

    expect(onOpen).toHaveBeenCalledWith("foundations");
    expect(onOpen).toHaveBeenCalledWith("snapshots");
  });

  it("disables missing directions", () => {
    render(<SectionPagination onOpen={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();
  });
});

