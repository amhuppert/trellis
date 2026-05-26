import { describe, expect, it } from "vitest";
import { entityTypeColor, sectionKindColor } from "../colors";

describe("graph token colors", () => {
  it("maps entity types to Trellis token color names", () => {
    expect(entityTypeColor("concept")).toBe("accent-coral");
    expect(entityTypeColor("mechanism")).toBe("accent-sage");
    expect(entityTypeColor("maintenance")).toBe("accent-butter");
    expect(entityTypeColor("file")).toBe("ink-3");
  });

  it("maps section kinds to Trellis token color names", () => {
    expect(sectionKindColor("Concept")).toBe("accent-coral");
    expect(sectionKindColor("Mechanism")).toBe("accent-sage");
    expect(sectionKindColor("Maintenance")).toBe("accent-butter");
    expect(sectionKindColor("Advanced")).toBe("ink");
  });
});
