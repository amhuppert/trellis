import { describe, expect, it } from "vitest";
import { toFlowGraph } from "../graph-data";
import { neighbors, relatedSectionIds, relatedSections } from "../traversal";
import { kgFixture, sectionsFixture } from "./fixtures";

const { edges } = toFlowGraph(kgFixture, sectionsFixture);

describe("neighbors", () => {
  it("returns immediate neighbors at one hop", () => {
    expect(neighbors("tuple", edges, { hops: 1 })).toEqual(["snapshot", "vacuum"]);
  });

  it("returns expanded neighbors at two hops", () => {
    expect(neighbors("snapshot", edges, { hops: 2 })).toEqual(["tuple", "vacuum"]);
  });

  it("respects minimum strength", () => {
    expect(neighbors("vacuum", edges, { hops: 1, minStrength: "medium" })).toEqual(["tuple"]);
  });

  it("looks up sections related to an entity, including an optional primary section", () => {
    expect(relatedSectionIds("tuple", sectionsFixture, { primarySectionId: "tuple-versions" })).toEqual([
      "tuple-versions",
      "vacuum"
    ]);
    expect(relatedSections("tuple", sectionsFixture, { primarySectionId: "tuple-versions" }).map((section) => section.id)).toEqual([
      "tuple-versions",
      "vacuum"
    ]);
  });
});
