import { describe, expect, it } from "vitest";
import { toFlowGraph } from "../graph-data";
import { applyFilters } from "../filters";
import { kgFixture, sectionsFixture } from "./fixtures";

const flow = () => toFlowGraph(kgFixture, sectionsFixture);

describe("applyFilters", () => {
  it("filters out non-matching entity types", () => {
    const { nodes, edges } = flow();
    const filtered = applyFilters(nodes, edges, { type: new Set(["concept"]) });

    expect(filtered.nodes.map((node) => node.id)).toEqual(["snapshot"]);
    expect(filtered.edges).toEqual([]);
  });

  it("filters by case-insensitive name substring", () => {
    const { nodes, edges } = flow();
    const filtered = applyFilters(nodes, edges, { search: "tuple" });

    expect(filtered.nodes.map((node) => node.id)).toEqual(["tuple"]);
  });

  it("filters by aliases", () => {
    const { nodes, edges } = flow();
    const filtered = applyFilters(nodes, edges, { search: "cleanup" });

    expect(filtered.nodes.map((node) => node.id)).toEqual(["vacuum"]);
  });

  it("excludes relationships weaker than the minimum strength", () => {
    const { nodes, edges } = flow();
    const filtered = applyFilters(nodes, edges, { minStrength: "medium" });

    expect(filtered.nodes.map((node) => node.id)).toEqual(["snapshot", "tuple", "vacuum", "heapam"]);
    expect(filtered.edges.map((edge) => edge.id)).toEqual(["rel-snapshot-tuple", "rel-tuple-vacuum"]);
  });
});
