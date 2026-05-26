import { describe, expect, it } from "vitest";
import type { SynthesisNode } from "../../schemas";
import { findChain, flatten } from "../tree";

const root: SynthesisNode = {
  id: "root",
  level: 0,
  title: "Root",
  summary: "Root summary",
  keyTakeaways: [],
  openQuestions: [],
  references: [],
  children: [
    {
      id: "alpha",
      level: 1,
      title: "Alpha",
      summary: "Alpha summary",
      keyTakeaways: [],
      openQuestions: [],
      references: [],
      children: [
        {
          id: "alpha-leaf",
          level: 2,
          title: "Alpha leaf",
          summary: "Leaf summary",
          keyTakeaways: [],
          openQuestions: [],
          references: [],
          children: []
        }
      ]
    },
    {
      id: "beta",
      level: 1,
      title: "Beta",
      summary: "Beta summary",
      keyTakeaways: [],
      openQuestions: [],
      references: [],
      children: []
    }
  ]
};

describe("synthesis tree helpers", () => {
  it("flattens synthesis nodes depth first", () => {
    expect(flatten(root).map((node) => node.id)).toEqual(["root", "alpha", "alpha-leaf", "beta"]);
  });

  it("finds the ancestor chain for a focused node", () => {
    expect(findChain(root, "alpha-leaf").map((node) => node.id)).toEqual(["root", "alpha", "alpha-leaf"]);
    expect(findChain(root, "missing")).toEqual([]);
  });
});
