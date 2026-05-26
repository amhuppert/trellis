import { describe, expect, it } from "vitest";
import { toFlowGraph } from "../graph-data";
import { kgFixture, sectionsFixture } from "./fixtures";

describe("toFlowGraph", () => {
  it("creates one entity flow node per entity with degree, sections, and dimmed state", () => {
    const { nodes } = toFlowGraph(kgFixture, sectionsFixture);

    expect(nodes).toHaveLength(kgFixture.entities.length);
    expect(nodes.map((node) => node.type)).toEqual(["entity", "entity", "entity", "entity"]);

    const snapshot = nodes.find((node) => node.id === "snapshot");
    expect(snapshot?.data).toMatchObject({
      entity: kgFixture.entities[0],
      degree: 1,
      selected: false,
      dimmed: false,
      sectionIds: ["snapshots"]
    });

    const tuple = nodes.find((node) => node.id === "tuple");
    expect(tuple?.data.degree).toBe(2);
    expect(tuple?.data.sectionIds).toEqual(["tuple-versions", "vacuum"]);
  });

  it("creates relationship flow edges with strength and label preserved", () => {
    const { edges } = toFlowGraph(kgFixture, sectionsFixture);

    expect(edges).toHaveLength(kgFixture.relationships.length);
    expect(edges[0]).toMatchObject({
      id: "rel-snapshot-tuple",
      source: "snapshot",
      target: "tuple",
      type: "relationship",
      data: {
        relationship: kgFixture.relationships[0],
        strength: "strong",
        label: "reads",
        dimmed: false
      }
    });
  });
});
