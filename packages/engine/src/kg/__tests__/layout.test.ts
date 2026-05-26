import { describe, expect, it } from "vitest";
import { toFlowGraph } from "../graph-data";
import { forceLayout, regionsLayout, ringLayout } from "../layout";
import { kgFixture, sectionsFixture } from "./fixtures";

const flow = () => toFlowGraph(kgFixture, sectionsFixture);

const positions = (nodes: { id: string; position: { x: number; y: number } }[]) =>
  Object.fromEntries(nodes.map((node) => [node.id, node.position]));

describe("layout helpers", () => {
  it("force layout is deterministic for the same seed and input", () => {
    const first = flow();
    const second = flow();

    const a = forceLayout(first.nodes, first.edges, { seed: 42, iterations: 50, size: { width: 640, height: 420 } });
    const b = forceLayout(second.nodes, second.edges, { seed: 42, iterations: 50, size: { width: 640, height: 420 } });

    expect(positions(a.nodes)).toEqual(positions(b.nodes));
  });

  it("ring layout places the focus at center and one ring per hop", () => {
    const { nodes, edges } = flow();
    const result = ringLayout("snapshot", nodes, edges, { hops: 2, size: { width: 600, height: 400 } });
    const byId = positions(result.nodes);

    expect(byId.snapshot).toEqual({ x: 300, y: 200 });
    expect(Math.round(Math.hypot(byId.tuple.x - 300, byId.tuple.y - 200))).toBe(120);
    expect(Math.round(Math.hypot(byId.vacuum.x - 300, byId.vacuum.y - 200))).toBe(240);
    expect(byId.heapam).toBeUndefined();
  });

  it("regions layout groups by primarySectionId", () => {
    const { nodes, edges } = flow();
    const result = regionsLayout(nodes, edges, { sections: sectionsFixture, padding: 32 });
    const tuple = result.nodes.find((node) => node.id === "tuple");
    const regionIds = result.nodes.filter((node) => node.type === "region").map((node) => node.id);

    expect(regionIds).toEqual(["region-snapshots", "region-tuple-versions", "region-vacuum"]);
    expect(tuple?.parentId).toBe("region-tuple-versions");
    expect(tuple?.extent).toBe("parent");
  });
});
