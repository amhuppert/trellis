import type { Relationship } from "@trellis/engine";

const rel = (from: string, to: string, type: string, strength: Relationship["strength"] = "medium"): Relationship => ({
  id: `rel-${from}-${to}-${type}`,
  from,
  to,
  type,
  strength
});

export const relationships: Relationship[] = [
  rel("mvcc", "snapshot", "depends-on", "strong"),
  rel("mvcc", "vacuum", "depends-on", "strong"),
  rel("xmin", "snapshot", "compared-by", "strong"),
  rel("xmax", "snapshot", "compared-by", "strong"),
  rel("snapshot", "xip-list", "contains"),
  rel("snapshot", "command-id", "contains"),
  rel("vacuum", "visibility-map", "uses"),
  rel("vacuum", "freezing", "performs"),
  rel("freezing", "wraparound", "prevents"),
  rel("ssi", "predicate-lock", "uses"),
  rel("ssi", "ssi-anomaly", "detects"),
  rel("hot-update", "ctid", "preserves")
];
