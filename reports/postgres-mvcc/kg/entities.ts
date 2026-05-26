import type { Entity } from "@trellis/engine";

export const entities: Entity[] = [
  { id: "mvcc", name: "MVCC", type: "concept", shortDef: "Multi-Version Concurrency Control: keeping many row versions so readers and writers do not block each other.", primarySectionId: "foundations" },
  { id: "xmin", name: "xmin", type: "concept", shortDef: "Transaction id of the inserter; stamped on every tuple at write time.", primarySectionId: "tuple-versions" },
  { id: "xmax", name: "xmax", type: "concept", shortDef: "Transaction id of the deleter or updater; zero while the tuple is live.", primarySectionId: "tuple-versions" },
  { id: "ctid", name: "ctid", type: "concept", shortDef: "Physical block and offset pointer to a tuple's location on disk.", primarySectionId: "tuple-versions" },
  { id: "snapshot", name: "snapshot", type: "concept", shortDef: "The transaction view that decides which tuple versions count as visible.", primarySectionId: "snapshots" },
  { id: "visibility-map", name: "visibility map", type: "concept", shortDef: "Per-page bit used by VACUUM and index-only scans to skip heap visits.", primarySectionId: "visibility" },
  { id: "hot-update", name: "HOT update", type: "pattern", shortDef: "An update that stays on one heap page and avoids new index entries.", primarySectionId: "tuple-versions" },
  { id: "vacuum", name: "VACUUM", type: "feature", shortDef: "The reclamation process that turns dead tuples back into reusable space.", primarySectionId: "vacuum" },
  { id: "freezing", name: "freezing", type: "concept", shortDef: "Rewriting old xmin values to a sentinel so xid wraparound is safe.", primarySectionId: "vacuum" },
  { id: "wraparound", name: "wraparound", type: "concept", shortDef: "The transaction id counter failure mode prevented by freezing.", primarySectionId: "edges" },
  { id: "predicate-lock", name: "predicate lock", type: "concept", shortDef: "A read-tracking lock SSI uses to detect serialization anomalies.", primarySectionId: "edges" },
  { id: "ssi", name: "SSI", type: "concept", shortDef: "Serializable Snapshot Isolation: Postgres' serializable algorithm on top of snapshots.", primarySectionId: "edges" },
  { id: "heapam", name: "heapam.c", type: "file", shortDef: "Postgres heap access source file where tuple access mechanics live.", primarySectionId: "tuple-versions" },
  { id: "ssi-anomaly", name: "SSI anomaly", type: "concept", shortDef: "A dangerous read/write dependency cycle that SSI detects and breaks.", primarySectionId: "edges" },
  { id: "command-id", name: "command id", type: "concept", shortDef: "Per-statement counter that lets a transaction see its own earlier writes.", primarySectionId: "snapshots" },
  { id: "xip-list", name: "xip list", type: "concept", shortDef: "The in-progress transaction ids carried by a snapshot.", primarySectionId: "snapshots" }
];
