import type { SourceReference } from "@trellis/engine";

export const sources: SourceReference[] = [
  { id: "docs-mvcc", kind: "url", title: "PostgreSQL Documentation - Concurrency Control", href: "https://www.postgresql.org/docs/current/mvcc.html", host: "postgresql.org" },
  { id: "heapam", kind: "code", title: "heapam.c", path: "src/backend/access/heap/heapam.c", lineRange: [120, 180] },
  { id: "vacuumlazy", kind: "code", title: "vacuumlazy.c", path: "src/backend/access/heap/vacuumlazy.c" },
  { id: "hellerstein", kind: "doc", title: "Hellerstein et al. - The Anatomy of a Database System", host: "RDBMS textbook, ch. 4", locationHint: "Chapter 4" },
  { id: "momjian", kind: "doc", title: "Bruce Momjian - MVCC Unmasked", host: "presentation, 2018" },
  { id: "momjian-slide-18", kind: "passage", title: "MVCC Unmasked visibility passage", documentSourceId: "momjian", location: "slide 18" },
  { id: "ports", kind: "doc", title: "Ports & Grittner - SSI in Postgres", host: "VLDB 2012" },
  { id: "tx-id", kind: "url", title: "Transaction Id Wraparound", href: "https://www.postgresql.org/docs/current/routine-vacuuming.html", host: "postgresql.org" },
  { id: "snap-build", kind: "code", title: "GetSnapshotData", path: "src/backend/utils/time/snapmgr.c" }
];
