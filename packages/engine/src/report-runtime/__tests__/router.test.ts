import { describe, expect, it } from "vitest";
import type { ReaderState } from "../../components/shell/reader-state";
import { applyParsedRoute, parseHash, serializeState } from "../router";

const baseState: ReaderState = {
  mode: "orientation",
  sectionId: "foundations",
  scrollTarget: null,
  currentSubId: null,
  focusEntityId: null,
  synthesisFocusId: null,
  graphMode: "atlas",
  graphFocusId: null,
  navTick: 0
};

describe("hash router", () => {
  it("parses guided section anchors", () => {
    expect(parseHash("#/guided/foundations/found-update")).toEqual({
      mode: "guided",
      sectionId: "foundations",
      anchorId: "found-update"
    });
  });

  it("parses graph spotlight focus", () => {
    expect(parseHash("#/graph/spotlight/snapshot")).toEqual({
      mode: "graph",
      graphMode: "spotlight",
      graphFocusId: "snapshot"
    });
  });

  it("parses bare graph hash as atlas mode", () => {
    expect(parseHash("#/graph")).toEqual({
      mode: "graph",
      graphMode: "atlas"
    });
  });

  it("serializes focused reference state", () => {
    expect(serializeState({ ...baseState, mode: "reference", focusEntityId: "snapshot" })).toBe(
      "#/reference/snapshot"
    );
  });

  it("round-trips supported routes", () => {
    const hashes = [
      "#/orientation",
      "#/guided/foundations",
      "#/guided/foundations/found-update",
      "#/reference",
      "#/reference/snapshot",
      "#/synthesis",
      "#/synthesis/syn-root",
      "#/graph/atlas",
      "#/graph/spotlight/snapshot",
      "#/graph/regions"
    ];

    for (const hash of hashes) {
      const parsed = parseHash(hash);

      expect(parsed).not.toBeNull();
      expect(serializeState(applyParsedRoute(baseState, parsed!))).toBe(hash);
    }
  });

  it("returns null for empty or invalid hashes", () => {
    expect(parseHash("")).toBeNull();
    expect(parseHash("#")).toBeNull();
    expect(parseHash("#/unknown")).toBeNull();
    expect(parseHash("#/guided")).toBeNull();
  });
});
