import { describe, expect, it } from "vitest";

import { cn } from "../cn";

describe("cn", () => {
  it("lets tailwind-merge resolve conflicting classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters falsey class values with clsx", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("supports conditional class objects", () => {
    expect(cn("foo", { bar: true, baz: false }, { qux: true })).toBe("foo bar qux");
  });
});
