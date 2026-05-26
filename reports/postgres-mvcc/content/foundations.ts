import type { Section } from "@trellis/engine";

export const foundations: Section = {
  n: "01",
  id: "foundations",
  title: "Foundations",
  blurb: "What concurrency control even means inside a single database process.",
  time: "5m",
  kind: "Concept",
  summary:
    "Before xmin, before snapshots, before VACUUM, we need to agree on what a database is hiding from each transaction, and why.",
  blocks: [
    {
      anchorId: "found-problem",
      kind: "conceptIntro",
      title: "What's the problem MVCC is solving?",
      body:
        "A database is a single, shared piece of state. The moment two clients are reading and writing at the same time, the system has to decide whose view of the world is real. Locking is one answer. <e id=\"mvcc\">MVCC</e> is a different one - one that lets readers and writers stop blocking each other entirely, at the cost of carrying many versions of every row."
    },
    {
      anchorId: "found-model",
      kind: "mentalModel",
      title: "The mental model in one sentence",
      body:
        "Each transaction reads from its own snapshot of the database - a frozen moment that ignores anything that hasn't committed yet, and ignores anything that committed after the snapshot was taken.",
      aside:
        "If you remember nothing else from this report, remember this: a Postgres reader never sees a half-written world. The snapshot decides which writes count as visible, even if other transactions are committing wildly around it."
    },
    {
      anchorId: "found-locks",
      kind: "callout",
      tone: "info",
      title: "Why not just lock?",
      body:
        "In a lock-based system, a read takes a shared lock and a write takes an exclusive lock. They wait on each other. Postgres does still take locks, but for visibility, MVCC means readers don't block writers and writers don't block readers."
    },
    { anchorId: "found-two-ideas", kind: "heading", level: 2, text: "Two ideas, then one design" },
    {
      kind: "prose",
      body:
        "Two ideas have to land before any of the later sections make sense. The first is that <em>every write makes a new row</em>. An UPDATE doesn't change a row in place; it writes a new tuple and marks the old one as superseded. A DELETE doesn't free the row immediately; it marks it as deleted by a particular transaction. The second is that <em>every read carries a snapshot</em>: a small set of transaction ids that the reader considers committed."
    },
    {
      anchorId: "found-update",
      kind: "stepByStep",
      title: "What happens on a single UPDATE",
      steps: [
        {
          title: "Old tuple stays put",
          body:
            "Postgres does not overwrite the existing row. Its <e id=\"xmax\">xmax</e> is stamped with the current transaction's id; physically, it still occupies the same disk page."
        },
        {
          title: "New tuple is written",
          body:
            "A fresh tuple is appended. Its <e id=\"xmin\">xmin</e> is the current transaction id. Its xmax is zero - it is alive, from its own creator's point of view."
        },
        {
          title: "Older readers see the old version",
          body:
            "Any backend whose <e id=\"snapshot\">snapshot</e> was taken before this transaction committed continues to read the old tuple. It is still there. It is still valid for them."
        },
        {
          title: "VACUUM cleans up later",
          body:
            "Once no live snapshot can possibly need the old tuple, <e id=\"vacuum\">VACUUM</e> reclaims its space. Not before."
        }
      ]
    },
    {
      anchorId: "found-takeaways",
      kind: "keyTakeaways",
      items: [
        "MVCC trades space and a janitor for the ability to read without locking writers.",
        "Every UPDATE is logically a new INSERT plus a tombstone on the old row.",
        "Visibility is a function of the reader's snapshot, not of the row itself.",
        "VACUUM is not optional. Postgres' design assumes it runs."
      ]
    },
    {
      anchorId: "found-misconception",
      kind: "misconception",
      claim: "A SELECT sees the latest committed value of a row.",
      truth:
        "It sees the latest value committed <em>before this transaction's snapshot was taken</em>. In repeatable-read, that's at the first query. In read-committed, it's at each statement."
    },
    {
      kind: "beforeContinue",
      nextSectionId: "tuple-versions",
      body:
        "The next section gets specific about what's actually stamped on each row: xmin, xmax, ctid, and the infomask."
    }
  ],
  relatedSectionIds: [],
  relatedEntityIds: ["mvcc", "snapshot", "xmin", "xmax", "vacuum"],
  sourceRefIds: ["docs-mvcc", "heapam", "momjian-slide-18"],
  children: [
    { id: "found-problem", title: "What's the problem MVCC is solving?", children: [] },
    { id: "found-model", title: "The mental model in one sentence", children: [] },
    { id: "found-locks", title: "Why not just lock?", children: [] },
    { id: "found-two-ideas", title: "Two ideas, then one design", children: [] },
    { id: "found-update", title: "What happens on a single UPDATE", children: [] },
    { id: "found-takeaways", title: "Key takeaways", children: [] },
    { id: "found-misconception", title: "Common misconception", children: [] }
  ]
};
