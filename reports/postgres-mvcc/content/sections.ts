import type { Section } from "@trellis/engine";

export const tupleVersions: Section = {
  n: "02",
  id: "tuple-versions",
  title: "Tuple versions",
  time: "8m",
  kind: "Mechanism",
  blurb: "xmin, xmax, ctid, and how Postgres stamps every row it writes.",
  summary:
    "Every row in Postgres carries hidden system columns that the rest of MVCC reads from.",
  relatedEntityIds: ["xmin", "xmax", "ctid", "hot-update", "heapam"],
  sourceRefIds: ["heapam"],
  children: [
    { id: "tv-cols", title: "What lives on every tuple" },
    { id: "tv-chains", title: "Update chains and index traversal" },
    { id: "tv-hot", title: "HOT updates" }
  ],
  blocks: [
    {
      anchorId: "tv-cols",
      kind: "conceptIntro",
      title: "What lives on every tuple",
      body:
        "Postgres stores rows as tuples, and every tuple carries hidden system columns alongside the user data. The four that matter for MVCC are <e id=\"xmin\">xmin</e>, <e id=\"xmax\">xmax</e>, <e id=\"ctid\">ctid</e>, and an infomask of status bits."
    },
    {
      anchorId: "tv-chains",
      kind: "prose",
      body:
        "Updates thread row versions into chains that index lookups can follow until they find the visible tuple for the reader's <e id=\"snapshot\">snapshot</e>."
    },
    {
      anchorId: "tv-hot",
      kind: "callout",
      tone: "info",
      title: "HOT updates",
      body:
        "A <e id=\"hot-update\">HOT update</e> happens when the new tuple fits on the same heap page and no indexed column changed."
    },
    { kind: "beforeContinue", nextSectionId: "snapshots", body: "Next, the reader brings a snapshot to those tuple stamps." }
  ]
};

export const snapshots: Section = {
  n: "03",
  id: "snapshots",
  title: "Snapshots",
  time: "7m",
  kind: "Mechanism",
  blurb: "xmin horizon, xip list, command id - the data that define a view.",
  summary: "A snapshot is what a transaction carries whenever it touches a tuple.",
  relatedEntityIds: ["snapshot", "xip-list", "command-id"],
  sourceRefIds: ["snap-build"],
  children: [{ id: "snap-build", title: "How GetSnapshotData builds one" }],
  blocks: [
    {
      anchorId: "snap-build",
      kind: "conceptIntro",
      title: "How GetSnapshotData builds one",
      body:
        "A <e id=\"snapshot\">snapshot</e> records the xmin horizon, xmax, the <e id=\"xip-list\">xip list</e>, and a <e id=\"command-id\">command id</e> so tuple visibility can be decided consistently."
    },
    { kind: "beforeContinue", nextSectionId: "visibility", body: "Now combine row stamps with the snapshot." }
  ]
};

export const visibility: Section = {
  n: "04",
  id: "visibility",
  title: "Visibility rules",
  time: "6m",
  kind: "Mechanism",
  blurb: "The actual decision a backend makes when it looks at a row.",
  summary: "Visibility is the relationship between tuple stamps and a reader's snapshot.",
  relatedEntityIds: ["snapshot", "xmin", "xmax", "visibility-map"],
  sourceRefIds: ["docs-mvcc"],
  children: [{ id: "vis-tree", title: "Six questions, in order" }],
  blocks: [
    {
      anchorId: "vis-tree",
      kind: "conceptIntro",
      title: "Six questions, in order",
      body:
        "For every tuple a backend touches, it compares <e id=\"xmin\">xmin</e>, <e id=\"xmax\">xmax</e>, and the reader's <e id=\"snapshot\">snapshot</e>. The <e id=\"visibility-map\">visibility map</e> lets some scans skip the heap."
    },
    { kind: "beforeContinue", nextSectionId: "vacuum", body: "Next, the dead versions need a cleanup process." }
  ]
};

export const vacuum: Section = {
  n: "05",
  id: "vacuum",
  title: "VACUUM & bloat",
  time: "9m",
  kind: "Maintenance",
  blurb: "Dead tuples, freezing, and the long shadow a long transaction casts.",
  summary: "MVCC's cost is paid in space and a janitor.",
  relatedEntityIds: ["vacuum", "freezing", "wraparound", "visibility-map"],
  sourceRefIds: ["vacuumlazy", "tx-id"],
  children: [
    { id: "vac-phases", title: "What VACUUM actually does" },
    { id: "vac-freeze", title: "Freeze old xmins" }
  ],
  blocks: [
    {
      anchorId: "vac-phases",
      kind: "conceptIntro",
      title: "What VACUUM actually does",
      body:
        "<e id=\"vacuum\">VACUUM</e> scans pages, collects dead ctids, prunes indexes, marks space reusable, updates the <e id=\"visibility-map\">visibility map</e>, and eventually performs <e id=\"freezing\">freezing</e>."
    },
    {
      anchorId: "vac-freeze",
      kind: "prose",
      body:
        "Freezing rewrites old xmin values so the 32-bit transaction id counter can survive <e id=\"wraparound\">wraparound</e>."
    },
    { kind: "beforeContinue", nextSectionId: "isolation", body: "Now ask what guarantees these snapshots provide." }
  ]
};

export const isolation: Section = {
  n: "06",
  id: "isolation",
  title: "Isolation levels",
  time: "6m",
  kind: "Contract",
  blurb: "Read committed, repeatable read, serializable - what each one promises.",
  summary: "Isolation mostly decides when a snapshot is taken and how conflicts are handled.",
  relatedEntityIds: ["snapshot", "ssi", "predicate-lock"],
  sourceRefIds: ["ports"],
  children: [{ id: "iso-levels", title: "What each level changes" }],
  blocks: [
    {
      anchorId: "iso-levels",
      kind: "conceptIntro",
      title: "What each level changes",
      body:
        "Read committed takes a fresh <e id=\"snapshot\">snapshot</e> per statement. Repeatable read holds one snapshot for the transaction. Serializable adds <e id=\"ssi\">SSI</e> and <e id=\"predicate-lock\">predicate locks</e>."
    },
    { kind: "beforeContinue", nextSectionId: "edges", body: "Finally, look at the places where the clean model bends." }
  ]
};

export const edges: Section = {
  n: "07",
  id: "edges",
  title: "Edge cases",
  time: "4m",
  kind: "Advanced",
  blurb: "Predicate locks, SSI, wraparound, and where the snapshot model bends.",
  summary: "Where MVCC's clean story develops asterisks.",
  relatedEntityIds: ["predicate-lock", "ssi", "ssi-anomaly", "wraparound"],
  sourceRefIds: ["ports", "tx-id"],
  children: [
    { id: "edge-skew", title: "Write skew" },
    { id: "edge-ssi", title: "How SSI catches an anomaly" },
    { id: "edge-wrap", title: "Wraparound is a separate clock" }
  ],
  blocks: [
    {
      anchorId: "edge-skew",
      kind: "conceptIntro",
      title: "The snapshot model alone is not enough",
      body:
        "Snapshot isolation allows write skew, represented here by <e id=\"ssi-anomaly\">SSI anomaly</e>. <e id=\"ssi\">SSI</e> exists to catch that pattern."
    },
    {
      anchorId: "edge-ssi",
      kind: "prose",
      body:
        "Serializable transactions record reads with <e id=\"predicate-lock\">predicate locks</e> and abort a participant when the dependency graph becomes dangerous."
    },
    {
      anchorId: "edge-wrap",
      kind: "callout",
      tone: "warn",
      title: "Wraparound is a separate clock",
      body:
        "<e id=\"freezing\">Freezing</e> prevents <e id=\"wraparound\">wraparound</e> from making old rows look like future rows."
    }
  ]
};
