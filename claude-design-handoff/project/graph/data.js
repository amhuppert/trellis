// Graph sketches — entity + relationship data lifted from the report content.
// Standalone (no dependency on bento/content.js) so this exploration can be
// opened on its own. Extra relationships have been inferred from section
// bodies so the graph is dense enough to be visually interesting.

window.G = {
  meta: {
    reportTitle: "How Postgres MVCC Works",
    sectionCount: 7,
    entityCount: 16,
  },

  sections: [
    { id: "foundations",    n: "01", title: "Foundations",      kind: "Concept",     accent: "coral" },
    { id: "tuple-versions", n: "02", title: "Tuple versions",   kind: "Mechanism",   accent: "sage"  },
    { id: "snapshots",      n: "03", title: "Snapshots",        kind: "Mechanism",   accent: "sage"  },
    { id: "visibility",     n: "04", title: "Visibility rules", kind: "Mechanism",   accent: "sage"  },
    { id: "vacuum",         n: "05", title: "VACUUM & bloat",   kind: "Maintenance", accent: "butter"},
    { id: "isolation",      n: "06", title: "Isolation levels", kind: "Contract",    accent: "sage"  },
    { id: "edges",          n: "07", title: "Edge cases",       kind: "Advanced",    accent: "coral" },
  ],

  entities: [
    { id: "mvcc",           name: "MVCC",           type: "concept", shortDef: "Postgres' strategy of keeping many row versions live so readers and writers don't block.", primarySection: "foundations" },
    { id: "xmin",           name: "xmin",           type: "concept", shortDef: "Transaction id of the inserter, stamped on every tuple at write time.", primarySection: "tuple-versions" },
    { id: "xmax",           name: "xmax",           type: "concept", shortDef: "Transaction id of the deleter or updater; zero while the tuple is live.", primarySection: "tuple-versions" },
    { id: "ctid",           name: "ctid",           type: "concept", shortDef: "Physical (block, offset) pointer to a tuple's location on disk.", primarySection: "tuple-versions" },
    { id: "snapshot",       name: "snapshot",       type: "concept", shortDef: "The set of transaction ids that count as committed for a given backend.", primarySection: "snapshots" },
    { id: "xip-list",       name: "xip list",       type: "concept", shortDef: "The 'in-progress' transaction ids carried by every snapshot.", primarySection: "snapshots" },
    { id: "command-id",     name: "command id",     type: "concept", shortDef: "Per-statement counter that lets a transaction see its own earlier writes.", primarySection: "snapshots" },
    { id: "visibility-map", name: "visibility map", type: "concept", shortDef: "Per-page bit that tells VACUUM and index-only scans which pages can be skipped.", primarySection: "vacuum" },
    { id: "hot-update",     name: "HOT update",     type: "pattern", shortDef: "An UPDATE that fits on the same page and touches no indexed column.", primarySection: "tuple-versions" },
    { id: "vacuum",         name: "VACUUM",         type: "feature", shortDef: "The reclamation process that turns dead tuples back into free space.", primarySection: "vacuum" },
    { id: "freezing",       name: "freezing",       type: "concept", shortDef: "Rewriting old xmin values to a sentinel so the 32-bit xid space can wrap safely.", primarySection: "vacuum" },
    { id: "wraparound",     name: "wraparound",     type: "concept", shortDef: "The point at which unfrozen xids would be reinterpreted as belonging to the future.", primarySection: "vacuum" },
    { id: "predicate-lock", name: "predicate lock", type: "concept", shortDef: "A range-shaped lock SSI takes to detect serialization anomalies.", primarySection: "edges" },
    { id: "ssi",            name: "SSI",            type: "concept", shortDef: "Serializable Snapshot Isolation; Postgres' algorithm for true serializability without 2PL.", primarySection: "edges" },
    { id: "ssi-anomaly",    name: "SSI anomaly",    type: "concept", shortDef: "A dependency cycle of read/write conflicts SSI detects and breaks.", primarySection: "edges" },
    { id: "heapam",         name: "heapam.c",       type: "file",    shortDef: "src/backend/access/heap/heapam.c — heart of heap tuple access.", primarySection: "tuple-versions" },
  ],

  relationships: [
    // Inferred from content; richer than the raw set so the graph has shape.
    { from: "mvcc",          to: "snapshot",       type: "depends-on",   strength: "strong" },
    { from: "mvcc",          to: "vacuum",         type: "depends-on",   strength: "strong" },
    { from: "mvcc",          to: "xmin",           type: "uses",         strength: "strong" },
    { from: "mvcc",          to: "xmax",           type: "uses",         strength: "strong" },
    { from: "xmin",          to: "snapshot",       type: "compared-by",  strength: "strong" },
    { from: "xmax",          to: "snapshot",       type: "compared-by",  strength: "strong" },
    { from: "snapshot",      to: "xip-list",       type: "contains",     strength: "strong" },
    { from: "snapshot",      to: "command-id",     type: "contains",     strength: "medium" },
    { from: "vacuum",        to: "visibility-map", type: "uses",         strength: "strong" },
    { from: "vacuum",        to: "freezing",       type: "performs",     strength: "strong" },
    { from: "freezing",      to: "wraparound",     type: "prevents",     strength: "strong" },
    { from: "freezing",      to: "xmin",           type: "rewrites",     strength: "medium" },
    { from: "ssi",           to: "predicate-lock", type: "uses",         strength: "strong" },
    { from: "ssi",           to: "ssi-anomaly",    type: "detects",      strength: "strong" },
    { from: "ssi",           to: "snapshot",       type: "extends",      strength: "medium" },
    { from: "hot-update",    to: "ctid",           type: "preserves",    strength: "medium" },
    { from: "hot-update",    to: "xmax",           type: "stamps",       strength: "weak"   },
    { from: "vacuum",        to: "xmin",           type: "reads",        strength: "medium" },
    { from: "vacuum",        to: "ctid",           type: "reclaims",     strength: "medium" },
    { from: "heapam",        to: "xmin",           type: "implements",   strength: "weak"   },
    { from: "heapam",        to: "xmax",           type: "implements",   strength: "weak"   },
    { from: "heapam",        to: "ctid",           type: "implements",   strength: "weak"   },
    { from: "visibility-map",to: "vacuum",         type: "guides",       strength: "medium" },
  ],
};
