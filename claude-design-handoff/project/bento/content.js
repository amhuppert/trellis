// Extended content for the Modular Bento prototype.
// Builds on the shared REPORT skeleton with full section bodies, an
// entity glossary, sources, synthesis nodes — enough to render every
// view of the prototype with real material.
//
// Each section's `blocks` is an array of {kind, ...} structured blocks
// that the guided view knows how to render. Entity refs in prose are
// written as <e id="xmin">xmin</e> markers that the renderer turns
// into hover-popover EntityRef components.

window.B = {
  meta: {
    id: "postgres-mvcc",
    template: "tutorial",
    title: "How Postgres MVCC Works",
    subtitle:
      "A reader's map to multi-version concurrency control — how Postgres decides what each transaction sees, why VACUUM matters, and where snapshot isolation actually ends.",
    audience: "Engineers who already use Postgres and want to know what is underneath.",
    readTime: "≈ 45 min",
    builtAt: "2 minutes ago",
    sectionCount: 7,
    entityCount: 28,
    sourceCount: 12,
    authors: [{ name: "Claude", role: "Authored by" }],
    whatYoullLearn: [
      "How Postgres represents row versions, and the role each tuple's xmin / xmax plays.",
      "The snapshot construction rules that decide what a transaction sees.",
      "Why long-running transactions block VACUUM, and what that costs you in production.",
      "Where SELECT FOR UPDATE, predicate locks, and serializable isolation diverge from the rest.",
    ],
  },

  modes: [
    { id: "orient",    name: "Orientation", hint: "Where to start" },
    { id: "guided",    name: "Guided",      hint: "Read straight through" },
    { id: "reference", name: "Reference",   hint: "Glossary & symbols" },
    { id: "synthesis", name: "Synthesis",   hint: "Hierarchical, in tiers" },
    { id: "graph",     name: "Graph",       hint: "Entities & relationships" },
  ],

  // Sections — full enough to render with reading content for §1, and
  // schematic stubs for the rest so navigation works end-to-end.
  sections: [
    {
      n: "01",
      id: "foundations",
      title: "Foundations",
      blurb: "What concurrency control even means inside a single database process.",
      time: "5m",
      kind: "Concept",
      summary:
        "Before xmin, before snapshots, before VACUUM — we need to agree on what a database is hiding from each transaction, and why.",
      blocks: [
        {
          anchorId: "found-problem",
          kind: "conceptIntro",
          title: "What's the problem MVCC is solving?",
          body:
            "A database is a single, shared piece of state. The moment two clients are reading and writing at the same time, the system has to decide whose view of the world is real. Locking is one answer. <e id=\"mvcc\">MVCC</e> is a different one — one that lets readers and writers stop blocking each other entirely, at the cost of carrying many versions of every row.",
        },
        {
          anchorId: "found-model",
          kind: "mentalModel",
          title: "The mental model in one sentence",
          body:
            "Each transaction reads from its own snapshot of the database — a frozen moment that ignores anything that hasn't committed yet, and ignores anything that committed after the snapshot was taken.",
          aside:
            "If you remember nothing else from this report, remember this: a Postgres reader never sees a half-written world. The snapshot decides which writes count as visible, even if other transactions are committing wildly around it.",
        },
        {
          anchorId: "found-locks",
          kind: "callout",
          tone: "info",
          title: "Why not just lock?",
          body:
            "In a lock-based system, a read takes a shared lock and a write takes an exclusive lock. They wait on each other. Postgres does still take locks — but for visibility, MVCC means readers don't block writers and writers don't block readers. The contention budget is spent elsewhere (on VACUUM, on the xid space) rather than on every single query.",
        },
        {
          anchorId: "found-two-ideas",
          kind: "heading",
          level: 2,
          text: "Two ideas, then one design",
        },
        {
          kind: "prose",
          body:
            "Two ideas have to land before any of the later sections make sense. The first is that <em>every write makes a new row</em>. An UPDATE doesn't change a row in place; it writes a new tuple and marks the old one as superseded. A DELETE doesn't free the row immediately; it marks it as deleted by a particular transaction. The second is that <em>every read carries a snapshot</em>: a small set of transaction ids that the reader considers committed. Together, those two ideas determine what a SELECT will see.",
        },
        {
          anchorId: "found-update",
          kind: "stepByStep",
          title: "What happens on a single UPDATE",
          steps: [
            { t: "Old tuple stays put", b: "Postgres does not overwrite the existing row. Its <e id=\"xmax\">xmax</e> is stamped with the current transaction's id; physically, it still occupies the same disk page." },
            { t: "New tuple is written", b: "A fresh tuple is appended. Its <e id=\"xmin\">xmin</e> is the current transaction id. Its xmax is zero — it is alive, from its own creator's point of view." },
            { t: "Older readers see the old version", b: "Any backend whose <e id=\"snapshot\">snapshot</e> was taken before this transaction committed continues to read the old tuple. It is still there. It is still valid for them." },
            { t: "VACUUM cleans up later", b: "Once no live snapshot can possibly need the old tuple — that is, all transactions that might have wanted it are gone — <e id=\"vacuum\">VACUUM</e> reclaims its space. Not before." },
          ],
        },
        {
          anchorId: "found-takeaways",
          kind: "keyTakeaways",
          items: [
            "MVCC trades space (and a janitor) for the ability to read without locking writers.",
            "Every UPDATE is logically a new INSERT plus a tombstone on the old row.",
            "Visibility is a function of the reader's snapshot, not of the row itself.",
            "VACUUM is not optional. Postgres' design assumes it runs.",
          ],
        },
        {
          anchorId: "found-misconception",
          kind: "misconception",
          claim: "“A SELECT sees the latest committed value of a row.”",
          truth:
            "It sees the latest value committed <em>before this transaction's snapshot was taken</em>. In repeatable-read, that's at the first query. In read-committed, it's at each statement. The word “latest” is doing a lot of dishonest work otherwise.",
        },
        {
          kind: "beforeContinue",
          next: "tuple-versions",
          body:
            "The next section gets specific about what's actually stamped on each row: xmin, xmax, ctid, the infomask. If the mental model above feels solid, you're ready.",
        },
      ],
      relatedEntities: ["mvcc", "snapshot", "xmin", "xmax", "vacuum"],
      sourceRefIds: ["docs-mvcc", "heapam"],
      children: [
        { id: "found-problem",   title: "What's the problem MVCC is solving?" },
        { id: "found-model",     title: "The mental model in one sentence" },
        { id: "found-locks",     title: "Why not just lock?" },
        { id: "found-two-ideas", title: "Two ideas, then one design" },
        { id: "found-update",    title: "What happens on a single UPDATE", children: [
          { id: "found-update-old",    title: "The old tuple stays in place" },
          { id: "found-update-new",    title: "A new tuple is written" },
          { id: "found-update-readers",title: "Older readers still see the old version" },
          { id: "found-update-vacuum", title: "VACUUM cleans up later" },
        ]},
        { id: "found-takeaways",     title: "Key takeaways" },
        { id: "found-misconception", title: "Common misconception · 'latest committed value'" },
      ],
    },

    {
      n: "02", id: "tuple-versions", title: "Tuple versions", time: "8m", kind: "Mechanism",
      blurb: "xmin, xmax, ctid, and how Postgres stamps every row it writes.",
      summary: "Every row in Postgres carries a small set of system columns that the rest of MVCC reads from. Understanding them once means everything later just slots in.",
      relatedEntities: ["xmin","xmax","ctid","hot-update","heapam"],
      children: [
        { id: "tv-cols", title: "What lives on every tuple", children: [
          { id: "tv-xmin",     title: "xmin · the writer's transaction id" },
          { id: "tv-xmax",     title: "xmax · the deleter's id, or zero" },
          { id: "tv-ctid",     title: "ctid · the (block, offset) on disk" },
          { id: "tv-infomask", title: "infomask · status flags" },
        ]},
        { id: "tv-hot",      title: "HOT updates · the shortcut" },
        { id: "tv-chains",   title: "Update chains and index traversal" },
        { id: "tv-takeaways",title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "tv-cols",
          kind: "conceptIntro",
          title: "What lives on every tuple",
          body: "Postgres stores rows as <em>tuples</em>, and every tuple carries hidden system columns alongside the user data. The four that matter for MVCC are <e id=\"xmin\">xmin</e>, <e id=\"xmax\">xmax</e>, <e id=\"ctid\">ctid</e>, and an infomask of status bits. Together they answer: who wrote this, who superseded it, where does it live, and what is its current state.",
        },
        {
          anchorId: "tv-cols",
          kind: "stepByStep",
          title: "Anatomy of a single tuple",
          steps: [
            { t: "xmin · the writer's transaction id", b: "Stamped when the tuple is inserted. A backend deciding whether to read this row asks: was the transaction with this id committed before my snapshot was taken?" },
            { t: "xmax · the deleter's transaction id, or zero", b: "Zero on a freshly-inserted tuple. Stamped with a transaction id when the row is DELETEd or UPDATEd (an update is logically a delete-plus-insert). Visible readers must check this too — a row whose xmax committed before them is gone." },
            { t: "ctid · the (block, offset) on disk", b: "The physical pointer. Updates that can't fit in place chain new versions via ctid, forming an <em>update chain</em> that index lookups walk." },
            { t: "infomask · status bits", b: "Compact flags for committed / aborted / frozen / HOT / locked. Reading these is much cheaper than asking the commit log, so Postgres caches answers here once it knows them." },
          ],
        },
        {
          anchorId: "tv-hot",
          kind: "callout",
          tone: "info",
          title: "HOT updates · the shortcut",
          body: "A <e id=\"hot-update\">HOT update</e> happens when the new tuple fits on the same heap page <em>and</em> no indexed column changed. Postgres skips writing new index entries and threads the new version into the same page's update chain. Most well-tuned tables see the bulk of their UPDATEs go down this path — it's the difference between a healthy table and one that grinds its indexes to dust.",
        },
        {
          anchorId: "tv-takeaways",
          kind: "keyTakeaways",
          items: [
            "Every row carries xmin, xmax, ctid, and an infomask — the rest of MVCC reads from these four.",
            "An UPDATE is, internally, a tombstone on the old row plus a fresh insert.",
            "HOT updates avoid touching indexes and keep the update chain on one page.",
            "The infomask caches commit-status answers so visibility checks stay cheap.",
          ],
        },
        {
          kind: "beforeContinue",
          next: "snapshots",
          body: "Now that you know what is stamped on each row, the next section asks: what does a reader carry into the system that lets it decide which of those stamps count?",
        },
      ],
    },
    {
      n: "03", id: "snapshots", title: "Snapshots", time: "7m", kind: "Mechanism",
      blurb: "xmin horizon, xip list, command id — the three numbers that define a view.",
      summary: "A snapshot is what a transaction carries with it whenever it touches a tuple. Three small pieces of data, taken together, decide what is real.",
      relatedEntities: ["snapshot","xip-list","command-id"],
      children: [
        { id: "snap-what", title: "A snapshot is just three numbers" },
        { id: "snap-cert", title: "The reader's certificate — mental model" },
        { id: "snap-build", title: "How GetSnapshotData builds one", children: [
          { id: "snap-xmin",   title: "xmin · the horizon" },
          { id: "snap-xmax",   title: "xmax · the next id to be assigned" },
          { id: "snap-xip",    title: "The xip list of in-progress ids" },
          { id: "snap-cmd",    title: "Command id within the transaction" },
        ]},
        { id: "snap-timing", title: "When the snapshot is taken — read committed vs repeatable read" },
        { id: "snap-takeaways", title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "snap-what",
          kind: "conceptIntro",
          title: "A snapshot is just three numbers (well, a number, a list, and a counter)",
          body: "When a transaction takes its first read, Postgres builds it a <e id=\"snapshot\">snapshot</e>. The snapshot freezes one piece of truth: which other transactions count as committed from this reader's point of view. Everything subsequent — index scans, sequential scans, joins — consults the same snapshot, so the reader sees a single self-consistent world.",
        },
        {
          anchorId: "snap-cert",
          kind: "mentalModel",
          title: "The reader's certificate",
          body: "Think of a snapshot as a certificate you hand the storage layer: 'these are the transactions I consider real; ignore everything else.' The storage layer never lies — it just checks your certificate against each tuple's xmin and xmax and tells you what you're allowed to see.",
          aside: "Two readers running at the same time can carry different certificates, and both can be right. That's the entire point of MVCC — there is no single notion of 'now' the database has to negotiate.",
        },
        {
          anchorId: "snap-build",
          kind: "stepByStep",
          title: "How GetSnapshotData builds one",
          steps: [
            { t: "Take xmin — the horizon", b: "The smallest transaction id that is still in progress anywhere in the cluster. Anything older than this is either committed or aborted; either way, no longer changing." },
            { t: "Take xmax — the next id to be assigned", b: "Any transaction id ≥ xmax was started after this snapshot. It does not exist as far as this reader is concerned." },
            { t: "Take the xip list — in-progress transactions", b: "Between xmin and xmax, list every transaction id that is currently running. Anything in this <e id=\"xip-list\">xip list</e> is invisible; anything not in the list is visible (if committed)." },
            { t: "Carry a command id within the transaction", b: "A counter incremented on each statement. The <e id=\"command-id\">command id</e> lets a transaction see its own earlier writes but ignore writes from later statements still mid-execution." },
          ],
        },
        {
          anchorId: "snap-takeaways",
          kind: "keyTakeaways",
          items: [
            "A snapshot is taken once per query (read-committed) or once per transaction (repeatable-read).",
            "It encodes which other transactions count as committed — not the rows themselves.",
            "Snapshots are cheap to build and cheaper to consult; that's why MVCC scales.",
            "The command id lets a transaction read its own in-flight changes without seeing siblings.",
          ],
        },
        {
          kind: "beforeContinue",
          next: "visibility",
          body: "Now you have rows with xmin / xmax and snapshots with horizons and xip lists. The next section combines them: the actual rule a backend applies tuple-by-tuple.",
        },
      ],
    },
    {
      n: "04", id: "visibility", title: "Visibility rules", time: "6m", kind: "Mechanism",
      blurb: "The actual decision a backend makes when it looks at a row.",
      summary: "When MVCC works, you don't think about visibility. When it surprises you, this is the algorithm to walk through.",
      relatedEntities: ["snapshot","xmin","xmax","visibility-map"],
      children: [
        { id: "vis-tree", title: "Six questions, in order", children: [
          { id: "vis-q1", title: "Is xmin committed and ≤ my snapshot?" },
          { id: "vis-q2", title: "Was xmin aborted?" },
          { id: "vis-q3", title: "Is xmin in my xip list?" },
          { id: "vis-q4", title: "Is xmax zero, aborted, or in my xip list?" },
          { id: "vis-q5", title: "Is xmax committed and ≤ my snapshot?" },
          { id: "vis-q6", title: "Otherwise — visible" },
        ]},
        { id: "vis-vm",         title: "The visibility map's role" },
        { id: "vis-indexonly",  title: "Index-only scans" },
        { id: "vis-misconception", title: "Common misconception · the row decides" },
        { id: "vis-takeaways",  title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "vis-tree",
          kind: "conceptIntro",
          title: "Six questions, in order",
          body: "For every tuple a backend touches, it walks the same short decision tree. Each step is cheap; most rows answer at the first or second question and never need the rest. The whole machinery — xmin, xmax, snapshots, infomask — exists to make this walk fast.",
        },
        {
          anchorId: "vis-tree",
          kind: "stepByStep",
          title: "The visibility check",
          steps: [
            { t: "Is xmin committed and ≤ my snapshot?", b: "No → invisible. The inserter hadn't finished (or doesn't count) at the time my snapshot was taken." },
            { t: "Was xmin aborted?", b: "Yes → invisible, permanently. The inserter rolled back; this tuple was never really written." },
            { t: "Is xmin in my xip list?", b: "Yes → invisible. The inserter was still in flight when I started — not committed from my point of view." },
            { t: "Is xmax zero, or aborted, or in my xip list?", b: "Yes → visible. Nothing has superseded this tuple as far as I can see." },
            { t: "Is xmax committed and ≤ my snapshot?", b: "Yes → invisible. The tuple was deleted or updated before my snapshot began." },
            { t: "Otherwise → visible.", b: "The xmax is a future-from-my-perspective transaction; that delete or update hasn't happened in my world yet." },
          ],
        },
        {
          anchorId: "vis-vm",
          kind: "callout",
          tone: "info",
          title: "The visibility map's role",
          body: "Sequential scans don't always have to perform this check. The <e id=\"visibility-map\">visibility map</e> tracks, per page, whether <em>all</em> tuples on that page are visible to every current transaction. If a page is all-visible, index-only scans and VACUUM can skip the heap visit entirely. That bit is also why VACUUM matters for read performance, not just for space.",
        },
        {
          anchorId: "vis-misconception",
          kind: "misconception",
          claim: "“Visibility is decided by the row's status.”",
          truth: "It's decided by the relationship between the row's xmin/xmax and the reader's snapshot. Two backends can simultaneously and correctly conclude the same tuple is visible to one and invisible to the other.",
        },
        {
          anchorId: "vis-takeaways",
          kind: "keyTakeaways",
          items: [
            "Six checks in a fixed order — most rows answer in one or two.",
            "The infomask caches commit-status answers so visibility stays a register-level operation.",
            "All-visible pages skip the check entirely thanks to the visibility map.",
            "Same row, two snapshots, two correct answers.",
          ],
        },
        {
          kind: "beforeContinue",
          next: "vacuum",
          body: "Versions are stamped, snapshots are built, visibility is decided. The next section asks the obvious follow-up: who deletes the dead versions?",
        },
      ],
    },
    {
      n: "05", id: "vacuum", title: "VACUUM & bloat", time: "9m", kind: "Maintenance",
      blurb: "Dead tuples, freezing, and the long shadow a long transaction casts.",
      summary: "MVCC's cost is paid in space and a janitor. Both have a price — and both go badly wrong when one transaction overstays its welcome.",
      relatedEntities: ["vacuum","freezing","wraparound","visibility-map"],
      children: [
        { id: "vac-why",        title: "Why dead tuples accumulate" },
        { id: "vac-janitor",    title: "VACUUM is the janitor, not the cook" },
        { id: "vac-long-tx",    title: "One long transaction can stall the whole table" },
        { id: "vac-phases",     title: "What VACUUM actually does", children: [
          { id: "vac-scan",     title: "Scan pages with dead tuples" },
          { id: "vac-collect",  title: "Collect dead ctids" },
          { id: "vac-prune",    title: "Prune indexes" },
          { id: "vac-free",     title: "Mark dead-tuple space as free" },
          { id: "vac-vm",       title: "Update the visibility map" },
          { id: "vac-freeze",   title: "Freeze old xmins" },
        ]},
        { id: "vac-autovacuum", title: "Tuning autovacuum" },
        { id: "vac-takeaways",  title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "vac-why",
          kind: "conceptIntro",
          title: "Why dead tuples accumulate",
          body: "Every UPDATE and DELETE leaves a dead version on disk. As long as any live snapshot might need it, it stays. <e id=\"vacuum\">VACUUM</e> is the process that reclaims dead tuples once no transaction could possibly want them — that boundary is called the <em>xmin horizon</em>, and it's the same number that lives at the top of every snapshot.",
        },
        {
          anchorId: "vac-janitor",
          kind: "mentalModel",
          title: "VACUUM is the janitor — not the cook",
          body: "Postgres' design assumes a janitor running in the background. The cook (your workload) makes a mess; the janitor cleans it up. If the janitor falls behind, the kitchen still works, but it gets slower and uses more space, and eventually some pots run out. Autovacuum is the janitor; tuning autovacuum is tuning how often and how hard it works.",
          aside: "The biggest reason a janitor falls behind isn't laziness. It's that <em>somebody else</em> is holding a snapshot from yesterday — that single open transaction pushes the horizon back and makes every dead tuple after it un-collectable.",
        },
        {
          anchorId: "vac-long-tx",
          kind: "callout",
          tone: "warn",
          title: "One long transaction can stall the whole table",
          body: "An idle-in-transaction backend with a stale snapshot keeps the xmin horizon pinned at its start time. Until it commits or aborts, no tuple newer than its start can be reclaimed. This is the single most common cause of runaway bloat in production. Watch <code>pg_stat_activity</code> for sessions that have been in transaction for hours.",
        },
        {
          anchorId: "vac-phases",
          kind: "stepByStep",
          title: "What VACUUM actually does",
          steps: [
            { t: "Scan pages with dead tuples", b: "The visibility map tells VACUUM which pages might have dead rows; the all-visible pages are skipped." },
            { t: "Collect dead ctids", b: "For each dead tuple, remember its (block, offset) so the corresponding index entries can be pruned next." },
            { t: "Prune indexes", b: "Walk the table's indexes and remove entries pointing at dead ctids. This is usually the most expensive phase." },
            { t: "Mark dead-tuple space as free", b: "The tuples are gone, but the page itself is reused, not returned to the OS. Reclaiming OS-level space takes VACUUM FULL or pg_repack." },
            { t: "Update the visibility map and freeze old tuples", b: "Tuples whose xmin is older than the freezing threshold get their xmin rewritten to FrozenTransactionId — that's <e id=\"freezing\">freezing</e>, and it's how the 32-bit xid counter survives <e id=\"wraparound\">wraparound</e>." },
          ],
        },
        {
          anchorId: "vac-takeaways",
          kind: "keyTakeaways",
          items: [
            "VACUUM is not optional — MVCC's design assumes it runs.",
            "The xmin horizon decides what can be collected; one long transaction can hold it back indefinitely.",
            "VACUUM frees space within the heap; VACUUM FULL returns space to the OS.",
            "Freezing is mandatory before the xid counter wraps; it's the reason auto-vacuum sometimes runs on tables that look quiet.",
          ],
        },
        {
          kind: "beforeContinue",
          next: "isolation",
          body: "The visibility machinery and its janitor explain how Postgres serves reads cheaply. The next section asks what guarantees those reads come with.",
        },
      ],
    },
    {
      n: "06", id: "isolation", title: "Isolation levels", time: "6m", kind: "Contract",
      blurb: "Read committed, repeatable read, serializable — what each one promises.",
      summary: "Isolation level is a small lever with large consequences. Inside MVCC, the level mostly decides when a snapshot is taken — and what a writer is allowed to do once it sees one.",
      relatedEntities: ["snapshot","ssi","predicate-lock"],
      children: [
        { id: "iso-three",   title: "Three levels, one snapshot machinery" },
        { id: "iso-levels",  title: "What each level changes", children: [
          { id: "iso-rc",   title: "Read committed · default" },
          { id: "iso-rr",   title: "Repeatable read · snapshot isolation" },
          { id: "iso-ser",  title: "Serializable · SSI on top of repeatable read" },
        ]},
        { id: "iso-choose",  title: "Most applications want repeatable read" },
        { id: "iso-misconception", title: "Common misconception · 'serializable means single-threaded'" },
        { id: "iso-takeaways", title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "iso-three",
          kind: "conceptIntro",
          title: "Three levels, one snapshot machinery",
          body: "Postgres supports three isolation levels: <em>read committed</em>, <em>repeatable read</em>, and <em>serializable</em>. All three use the same snapshot mechanism. The differences are when the snapshot is taken, what happens on a write conflict, and whether predicate locks are also taken to catch anomalies the snapshot alone can't see.",
        },
        {
          anchorId: "iso-levels",
          kind: "stepByStep",
          title: "What each level changes",
          steps: [
            { t: "Read committed · default", b: "A fresh snapshot is taken at the start of every statement. You will never read uncommitted data; consecutive statements may see different worlds. On UPDATE conflict, the second writer re-reads the latest row and retries — sometimes silently changing what got modified." },
            { t: "Repeatable read · snapshot isolation", b: "One snapshot taken at the start of the transaction; every statement uses it. The reader sees one frozen world. On UPDATE conflict, the second writer gets a serialization-failure error and must retry the whole transaction." },
            { t: "Serializable · SSI on top of repeatable read", b: "Repeatable-read plus <e id=\"predicate-lock\">predicate locks</e> tracking what each transaction read, so the system can detect dependency cycles that snapshot isolation would miss. On a cycle, one participant is aborted." },
          ],
        },
        {
          anchorId: "iso-choose",
          kind: "callout",
          tone: "info",
          title: "Most applications want repeatable read",
          body: "Read committed is the default for legacy reasons, but it's surprisingly surprising — the same SELECT inside one transaction can return different rows on subsequent calls. Repeatable read pays a tiny extra cost (some transactions retry) for a much simpler mental model. Reach for it unless you have a specific reason not to.",
        },
        {
          anchorId: "iso-misconception",
          kind: "misconception",
          claim: "“Serializable means all transactions run one at a time.”",
          truth: "Serializable means the <em>outcome</em> is equivalent to <em>some</em> one-at-a-time ordering. Internally everything still runs concurrently; <e id=\"ssi\">SSI</e> watches for read/write dependency cycles and aborts a participant only when a cycle would actually break the equivalence.",
        },
        {
          anchorId: "iso-takeaways",
          kind: "keyTakeaways",
          items: [
            "All three levels use the same snapshot machinery; what differs is when the snapshot is taken.",
            "Read committed: fresh snapshot per statement.",
            "Repeatable read: one snapshot per transaction.",
            "Serializable: repeatable read plus predicate locking and cycle detection.",
          ],
        },
        {
          kind: "beforeContinue",
          next: "edges",
          body: "The last section addresses the places where the snapshot model isn't quite enough — predicate locks, the xid wraparound clock, and the explicit row-level locks readers can still ask for.",
        },
      ],
    },
    {
      n: "07", id: "edges", title: "Edge cases", time: "4m", kind: "Advanced",
      blurb: "Predicate locks, SSI, wraparound, and where the snapshot model bends.",
      summary: "Where MVCC's clean story develops asterisks — and what the asterisks point to.",
      relatedEntities: ["predicate-lock","ssi","ssi-anomaly","wraparound"],
      children: [
        { id: "edge-skew",     title: "Write skew — the anomaly snapshot isolation misses" },
        { id: "edge-ssi",      title: "How SSI catches an anomaly", children: [
          { id: "edge-pred",   title: "Tracking reads with predicate locks" },
          { id: "edge-graph",  title: "Building a dependency graph" },
          { id: "edge-cycle",  title: "Watching for dangerous cycles" },
          { id: "edge-abort",  title: "Aborting one participant" },
        ]},
        { id: "edge-wrap",     title: "Wraparound is a separate clock" },
        { id: "edge-for-update", title: "SELECT FOR UPDATE — the explicit escape hatch" },
        { id: "edge-takeaways", title: "Key takeaways" },
      ],
      blocks: [
        {
          anchorId: "edge-skew",
          kind: "conceptIntro",
          title: "The snapshot model alone isn't enough",
          body: "Snapshot isolation prevents most concurrency anomalies but allows <em>write skew</em>: two transactions that each read a set of rows, then write based on what they saw, can together violate an invariant neither would violate alone. The classic case is two doctors deciding they can go off-call because the other one is on — and both committing at once. <e id=\"ssi\">SSI</e> exists to catch exactly this.",
        },
        {
          anchorId: "edge-ssi",
          kind: "stepByStep",
          title: "How SSI catches an anomaly",
          steps: [
            { t: "Track reads with predicate locks", b: "When a serializable transaction reads, it records what it touched — not just the rows but the predicate (e.g. 'WHERE on_call = true')." },
            { t: "Build a dependency graph", b: "Every read is also a dependency: 'this transaction depended on what some other transaction wrote'. Edges accumulate as transactions interact." },
            { t: "Watch for dangerous cycles", b: "A serialization anomaly corresponds to a specific pattern in this graph — two consecutive read/write conflicts in opposite directions. SSI watches for it." },
            { t: "Abort one participant", b: "When the pattern appears, one participating transaction is rolled back with a serialization-failure error. The application retries, and the second attempt sees a consistent world." },
          ],
        },
        {
          anchorId: "edge-wrap",
          kind: "callout",
          tone: "warn",
          title: "Wraparound is a separate clock",
          body: "Postgres' xid is 32-bit, so after ~2 billion transactions it would wrap. <e id=\"freezing\">Freezing</e> rewrites old xmin values to a sentinel so they're treated as 'older than everything' regardless of the wrapping counter. Auto-vacuum runs an aggressive pass when a table is more than 200M transactions old (by default) to prevent the database from refusing writes to protect itself.",
        },
        {
          anchorId: "edge-takeaways",
          kind: "keyTakeaways",
          items: [
            "Snapshot isolation alone permits write skew; SSI watches for it with predicate locks.",
            "An SSI abort surfaces as a serialization-failure error you must be ready to retry.",
            "Wraparound is prevented by freezing — old xmins rewritten to a sentinel before the counter laps.",
            "SELECT FOR UPDATE is the explicit escape hatch: take a row-level lock and serialize writers the old-fashioned way.",
          ],
        },
      ],
    },
  ],

  // Entities — the knowledge graph's nodes
  entities: [
    { id: "mvcc",            name: "MVCC",             type: "concept",  shortDef: "Multi-Version Concurrency Control. Postgres' strategy of keeping many row versions live at once so readers and writers don't block each other.", primarySection: "foundations" },
    { id: "xmin",            name: "xmin",             type: "concept",  shortDef: "Transaction id of the inserter; stamped on every tuple at write time.", primarySection: "tuple-versions" },
    { id: "xmax",            name: "xmax",             type: "concept",  shortDef: "Transaction id of the deleter or updater; zero while the tuple is live.", primarySection: "tuple-versions" },
    { id: "ctid",            name: "ctid",             type: "concept",  shortDef: "Physical (block, offset) pointer to a tuple's location on disk.", primarySection: "tuple-versions" },
    { id: "snapshot",        name: "snapshot",         type: "concept",  shortDef: "The set of transaction ids that count as committed for a given backend.", primarySection: "snapshots" },
    { id: "visibility-map",  name: "visibility map",   type: "concept",  shortDef: "Per-page bit that tells VACUUM and index-only scans which pages can be skipped.", primarySection: "vacuum" },
    { id: "hot-update",      name: "HOT update",       type: "pattern",  shortDef: "An UPDATE that fits on the same page and touches no indexed column; reuses the index entry.", primarySection: "tuple-versions" },
    { id: "vacuum",          name: "VACUUM",           type: "feature",  shortDef: "The reclamation process that turns dead tuples back into free space.", primarySection: "vacuum" },
    { id: "freezing",        name: "freezing",         type: "concept",  shortDef: "Rewriting old xmin values to a sentinel so the 32-bit xid space can wrap safely.", primarySection: "vacuum" },
    { id: "wraparound",      name: "wraparound",       type: "concept",  shortDef: "The point at which unfrozen xids would be reinterpreted as belonging to the future.", primarySection: "vacuum" },
    { id: "predicate-lock",  name: "predicate lock",   type: "concept",  shortDef: "A range-shaped lock SSI takes to detect serialization anomalies it could not see otherwise.", primarySection: "edges" },
    { id: "ssi",             name: "SSI",              type: "concept",  shortDef: "Serializable Snapshot Isolation; Postgres' algorithm for true serializability without 2PL.", primarySection: "edges" },
    { id: "heapam",          name: "heapam.c",         type: "file",     shortDef: "src/backend/access/heap/heapam.c — the heart of heap tuple access in the source tree.", primarySection: "tuple-versions" },
    { id: "ssi-anomaly",     name: "SSI anomaly",      type: "concept",  shortDef: "A dependency cycle of read/write conflicts SSI detects and breaks by aborting a participant.", primarySection: "edges" },
    { id: "command-id",      name: "command id",       type: "concept",  shortDef: "Per-statement counter that lets a transaction see its own earlier writes within itself.", primarySection: "snapshots" },
    { id: "xip-list",        name: "xip list",         type: "concept",  shortDef: "The 'in-progress' transaction ids carried by every snapshot.", primarySection: "snapshots" },
  ],

  // Relationships used by the synthesis tree and the graph view.
  relationships: [
    { from: "mvcc", to: "snapshot", type: "depends-on", strength: "strong" },
    { from: "mvcc", to: "vacuum", type: "depends-on", strength: "strong" },
    { from: "xmin", to: "snapshot", type: "compared-by", strength: "strong" },
    { from: "xmax", to: "snapshot", type: "compared-by", strength: "strong" },
    { from: "snapshot", to: "xip-list", type: "contains" },
    { from: "snapshot", to: "command-id", type: "contains" },
    { from: "vacuum", to: "visibility-map", type: "uses" },
    { from: "vacuum", to: "freezing", type: "performs" },
    { from: "freezing", to: "wraparound", type: "prevents" },
    { from: "ssi", to: "predicate-lock", type: "uses" },
    { from: "ssi", to: "ssi-anomaly", type: "detects" },
    { from: "hot-update", to: "ctid", type: "preserves" },
  ],

  // Synthesis hierarchy — a parallel structure to `sections`.
  //
  // Per the spec: leaf nodes are concrete units of understanding, intermediate
  // nodes synthesize their children (common structure, what differs, the
  // higher-level pattern, how the pieces work together), and a node points
  // back to specific sections / entities / sources rather than duplicating
  // their content.
  //
  // Node shape (matching SynthesisNodeSchema):
  //   { id, level, title, summary, detail?, commonStructure?, contrast?,
  //     keyTakeaways[], openQuestions[], references[{kind,id}], children[] }
  synthesis: {
    description:
      "MVCC is not really about locks. It is a deal: writers leave a trail of versioned tuples, readers carry a snapshot that decides which versions count. Everything else — VACUUM, freezing, SSI — exists to keep that deal honest.",
    root: {
      id: "syn-root",
      level: 0,
      title: "MVCC as a contract between writers and readers",
      summary:
        "Postgres' concurrency story factors into four cooperating concerns. Writers stamp every change so older readers can still see what they saw. Readers carry a snapshot that decides which stamps count. A janitor reclaims what no live snapshot can still reach. And a fifth layer of locking patches the remaining anomalies the snapshot model can't see by itself.",
      commonStructure:
        "Each branch is one face of the same trade: keep concurrent transactions out of each other's way by giving each one a self-consistent past, and pay the bill in versioned storage plus a reclamation process.",
      contrast:
        "The Storage and Visibility branches are about the steady-state read path — fast, lock-free, decided per tuple. Maintenance and Limits are about what that costs: bloat, freezing deadlines, and the anomalies a pure snapshot misses.",
      keyTakeaways: [
        "Every reader gets its own past. The system never collapses to a single 'now'.",
        "Visibility is a relationship between a tuple's stamps and a reader's snapshot — not a property of the row.",
        "MVCC's cost is paid in storage and a janitor; both go wrong the same way (a stuck horizon).",
        "Serializable isolation is not the absence of MVCC; it's MVCC plus predicate locks plus cycle detection.",
      ],
      openQuestions: [
        "Whether read-committed is ever the right default for a new application — the docs say yes; most experienced practitioners disagree.",
        "How aggressively the visibility check can be pushed into hardware (e.g. NVMe offloads, GPU scans) without giving up the infomask shortcut.",
      ],
      references: [
        { kind: "section", id: "foundations", note: "Establishes the writer/reader contract." },
        { kind: "source",  id: "docs-mvcc",   note: "Postgres' own framing." },
        { kind: "source",  id: "hellerstein", note: "Textbook treatment of why this trade exists at all." },
      ],
      children: [
        {
          id: "syn-storage",
          level: 1,
          title: "Storage · how versions are stamped",
          summary:
            "Every write produces a new tuple rather than overwriting the old one. The bookkeeping that makes this affordable lives in three small fields stamped on every row — xmin, xmax, ctid — and one optimisation that keeps update chains from poisoning the indexes.",
          commonStructure:
            "All three leaves describe the same act from different angles: the writer leaves a paper trail (xmin/xmax), records where the next version went (ctid), and tries to keep that trail short and local (HOT).",
          contrast:
            "xmin/xmax are about identity in time; ctid is about location in space. HOT is the optimisation that bridges them when both happen to align on one page.",
          keyTakeaways: [
            "An UPDATE is logically a tombstone on the old row plus a fresh insert.",
            "Indexes always point at the head of an update chain, never at intermediate versions.",
            "HOT updates are not a curiosity — they're the difference between a healthy table and one that grinds its indexes to dust.",
          ],
          openQuestions: [
            "Whether zheap (UNDO-based storage) would have been a better long-term answer than VACUUM; the project shipped but never became default.",
          ],
          references: [
            { kind: "section", id: "tuple-versions", note: "Full mechanics of the four system columns." },
            { kind: "entity",  id: "xmin" },
            { kind: "entity",  id: "xmax" },
            { kind: "entity",  id: "ctid" },
            { kind: "source",  id: "heapam" },
          ],
          children: [
            {
              id: "syn-storage-stamps",
              level: 2,
              title: "xmin / xmax · stamps that survive the writer",
              summary:
                "Each tuple carries the id of the transaction that inserted it (xmin) and, when superseded, the id of the transaction that killed it (xmax). Visibility checks read both; nothing else about the row is consulted.",
              keyTakeaways: [
                "xmin is never rewritten except by freezing.",
                "xmax = 0 is the marker for a live tuple.",
                "An UPDATE stamps xmax on the old tuple and xmin on the new one in the same WAL record.",
              ],
              references: [
                { kind: "section", id: "tuple-versions", anchorId: "tv-cols" },
                { kind: "entity",  id: "xmin" },
                { kind: "entity",  id: "xmax" },
              ],
            },
            {
              id: "syn-storage-chains",
              level: 2,
              title: "ctid chains · where the next version lives",
              summary:
                "When a row is updated, its ctid points to the location of the next version. Index scans walk that chain (or take the HOT shortcut) to find the visible version.",
              keyTakeaways: [
                "ctid is a physical (block, offset) pointer, not a logical key.",
                "Chains break across pages when there isn't local space; that's when indexes get dirtied.",
              ],
              references: [
                { kind: "section", id: "tuple-versions", anchorId: "tv-chains" },
                { kind: "entity",  id: "ctid" },
              ],
            },
            {
              id: "syn-storage-hot",
              level: 2,
              title: "HOT updates · the optimisation that keeps it cheap",
              summary:
                "If a new version fits on the same heap page and no indexed column changed, Postgres threads it into a HOT chain and skips writing new index entries. This single optimisation is what makes write-heavy tables livable.",
              keyTakeaways: [
                "HOT eligibility is determined per-update, not per-table — tune fillfactor accordingly.",
                "Any change to an indexed column breaks HOT for that row.",
              ],
              references: [
                { kind: "section", id: "tuple-versions", anchorId: "tv-hot" },
                { kind: "entity",  id: "hot-update" },
              ],
            },
          ],
        },
        {
          id: "syn-visibility",
          level: 1,
          title: "Visibility · how a snapshot decides what counts",
          summary:
            "A snapshot is three small pieces of data carried by every reader. A six-question decision tree, applied tuple-by-tuple, turns those three numbers plus a row's xmin/xmax into a yes-or-no answer. The whole machinery exists to make that walk cheap.",
          commonStructure:
            "Both leaves describe the same loop from opposite ends: one builds the certificate the reader hands the storage layer, the other is the storage layer checking that certificate against each row.",
          contrast:
            "Snapshot construction is centralised and rare (once per query or per transaction). The visibility check is per-tuple and may run billions of times. The whole design optimises for the second to be a register-level operation.",
          keyTakeaways: [
            "A snapshot is an opinion about other transactions, not about rows.",
            "Two readers can correctly disagree on whether a row exists.",
            "The infomask makes the common visibility cases branch-free.",
          ],
          openQuestions: [
            "How visibility interacts with logical replication's per-tuple decoding — the rules technically apply at decode time, but the practical edge cases are still being shaken out.",
          ],
          references: [
            { kind: "section", id: "snapshots" },
            { kind: "section", id: "visibility" },
            { kind: "entity",  id: "snapshot" },
            { kind: "source",  id: "snap-build" },
          ],
          children: [
            {
              id: "syn-visibility-snap",
              level: 2,
              title: "Snapshot construction · the reader's certificate",
              summary:
                "GetSnapshotData collects xmin (the horizon), xmax (the next id), the xip list of in-progress ids, and a per-statement command id. That bundle is the reader's certificate; everything visible flows from it.",
              keyTakeaways: [
                "Building a snapshot requires a brief ProcArray lock — historically the contention point under high backend counts.",
                "Read-committed takes one per statement; repeatable-read takes one per transaction.",
              ],
              references: [
                { kind: "section", id: "snapshots", anchorId: "snap-build" },
                { kind: "entity",  id: "snapshot" },
                { kind: "entity",  id: "xip-list" },
                { kind: "entity",  id: "command-id" },
                { kind: "source",  id: "snap-build" },
              ],
            },
            {
              id: "syn-visibility-rules",
              level: 2,
              title: "Visibility rules · six questions in order",
              summary:
                "The decision tree applied to each tuple. Most rows answer at question one or two; the rest exist for transactions that are still in flight at decision time.",
              keyTakeaways: [
                "Cached commit-status bits in the infomask short-circuit the common case.",
                "All-visible pages skip the check entirely via the visibility map.",
              ],
              references: [
                { kind: "section", id: "visibility", anchorId: "vis-tree" },
                { kind: "entity",  id: "visibility-map" },
              ],
            },
          ],
        },
        {
          id: "syn-maintenance",
          level: 1,
          title: "Maintenance · keeping the version pile from burying the table",
          summary:
            "MVCC's bill comes due as dead tuples and an ever-advancing transaction id counter. VACUUM reclaims dead versions once no live snapshot needs them; freezing rewrites old xmins before the 32-bit xid space wraps. Both depend on the xmin horizon advancing — and the horizon stops advancing the moment one transaction stays open too long.",
          commonStructure:
            "All three leaves describe the same dependency: the horizon must keep moving. VACUUM uses the horizon to decide what to clean; freezing uses it to decide what's safe to rewrite; wraparound is what happens when neither can act in time.",
          contrast:
            "VACUUM is the steady-state janitor (runs constantly, scoped to one table). Freezing is the deadline-driven sweep (runs eventually, scoped to whole tables). Wraparound is the failure mode that forces both to drop everything.",
          keyTakeaways: [
            "A single idle-in-transaction session can pin the horizon and stall the entire cluster's reclamation.",
            "VACUUM frees space inside the heap; only VACUUM FULL or pg_repack returns space to the OS.",
            "Freezing is what makes 32-bit transaction ids survive forever; ignoring it eventually shuts the database down to protect itself.",
          ],
          openQuestions: [
            "Whether the xid space should have been 64-bit from the start — it's a live conversation in pgsql-hackers; the migration cost is the obstacle.",
            "How well global-index designs (under discussion for partitioned tables) interact with per-table VACUUM scheduling.",
          ],
          references: [
            { kind: "section", id: "vacuum" },
            { kind: "entity",  id: "vacuum" },
            { kind: "entity",  id: "freezing" },
            { kind: "entity",  id: "wraparound" },
            { kind: "source",  id: "vacuumlazy" },
            { kind: "source",  id: "tx-id" },
          ],
          children: [
            {
              id: "syn-maintenance-vacuum",
              level: 2,
              title: "VACUUM · the steady-state janitor",
              summary:
                "Scans pages flagged by the visibility map, collects dead ctids, prunes their index entries, and marks space free. The expensive part is the index pass, not the heap pass.",
              keyTakeaways: [
                "Indexes are usually the bottleneck; many small VACUUMs beat one big one.",
                "autovacuum_naptime and per-table thresholds, not VACUUM itself, are what most operators tune.",
              ],
              references: [
                { kind: "section", id: "vacuum", anchorId: "vac-phases" },
                { kind: "entity",  id: "vacuum" },
                { kind: "source",  id: "vacuumlazy" },
              ],
            },
            {
              id: "syn-maintenance-freeze",
              level: 2,
              title: "Freezing · making old xids immortal",
              summary:
                "Once an xmin is older than every possible live snapshot, VACUUM rewrites it to FrozenTransactionId — a sentinel that visibility checks treat as 'older than everything', so the 32-bit counter can wrap safely.",
              keyTakeaways: [
                "Freezing is what makes Postgres safe past 2 billion transactions.",
                "autovacuum_freeze_max_age forces a freezing pass even on tables that look quiet.",
              ],
              references: [
                { kind: "section", id: "vacuum", anchorId: "vac-freeze" },
                { kind: "entity",  id: "freezing" },
              ],
            },
            {
              id: "syn-maintenance-wrap",
              level: 2,
              title: "Wraparound · the failure mode the rest exists to prevent",
              summary:
                "If freezing falls far enough behind, Postgres refuses new writes to protect the visibility check. The system is designed so this should be impossible — but it's the failure that turns 'a slow VACUUM' into a production outage.",
              keyTakeaways: [
                "The signal arrives 1M transactions before the wall — 'transaction ID wraparound is imminent' in the log.",
                "Recovery requires single-user mode if the wall is actually hit.",
              ],
              references: [
                { kind: "section", id: "edges", anchorId: "edge-wrap" },
                { kind: "entity",  id: "wraparound" },
                { kind: "source",  id: "tx-id" },
              ],
            },
          ],
        },
        {
          id: "syn-limits",
          level: 1,
          title: "Limits · where the snapshot model isn't enough",
          summary:
            "Snapshot isolation prevents most anomalies, but two transactions that each read the same set and write based on what they saw can together break an invariant neither broke alone. Serializable isolation adds predicate locks and runtime dependency-graph cycle detection on top of the snapshot machinery; the application keeps paying with retry-on-failure.",
          commonStructure:
            "Both leaves push past the snapshot's blind spot. Predicate locks track what was read; SSI watches the resulting dependency graph for a specific anomaly pattern and aborts to break the cycle.",
          contrast:
            "Predicate locks are the data structure. SSI is the algorithm that runs over it. Together they turn snapshot isolation into true serializability without taking the table-level locks 2PL would require.",
          keyTakeaways: [
            "Write skew is the anomaly snapshot isolation alone cannot prevent.",
            "SSI never blocks reads; it only aborts at commit, surfacing as a serialization-failure the client must retry.",
            "Serializable is not free, but the cost is paid in retries rather than wait time.",
          ],
          openQuestions: [
            "What the right default isolation level should be — Postgres defaults to read-committed for legacy reasons that most modern guidance argues against.",
            "Whether SSI's overhead is acceptable for OLTP workloads at high core counts; benchmarks vary widely with workload shape.",
          ],
          references: [
            { kind: "section", id: "isolation" },
            { kind: "section", id: "edges" },
            { kind: "entity",  id: "ssi" },
            { kind: "entity",  id: "predicate-lock" },
            { kind: "source",  id: "ports" },
          ],
          children: [
            {
              id: "syn-limits-skew",
              level: 2,
              title: "Write skew · the anomaly the snapshot misses",
              summary:
                "Two transactions read overlapping sets, each writes based on what they saw, and the combined effect violates an invariant neither would. Snapshot isolation permits this; serializability forbids it.",
              keyTakeaways: [
                "The classic doctor-on-call example is the canonical illustration.",
                "Application-level invariants are the most common victims; database constraints are not.",
              ],
              references: [
                { kind: "section", id: "edges", anchorId: "edge-skew" },
                { kind: "entity",  id: "ssi-anomaly" },
              ],
            },
            {
              id: "syn-limits-ssi",
              level: 2,
              title: "SSI · predicate locks and dependency cycles",
              summary:
                "Serializable Snapshot Isolation tracks what each transaction read (predicates, not rows) and watches the resulting read/write dependency graph for dangerous cycles. When one appears, it aborts a participant; the application retries; the retry sees a consistent world.",
              keyTakeaways: [
                "Predicate locks are SIREAD-only — they never block writes; they only feed the cycle detector.",
                "SSI's overhead is mostly about predicate-lock storage; granularity tuning matters at scale.",
              ],
              references: [
                { kind: "section", id: "edges", anchorId: "edge-ssi" },
                { kind: "entity",  id: "predicate-lock" },
                { kind: "entity",  id: "ssi" },
                { kind: "source",  id: "ports" },
              ],
            },
          ],
        },
      ],
    },
  },

  sources: [
    { id: "docs-mvcc",  kind: "url",  title: "PostgreSQL Documentation · Concurrency Control",       href: "https://www.postgresql.org/docs/current/mvcc.html", host: "postgresql.org" },
    { id: "heapam",     kind: "code", title: "heapam.c",                                              path: "src/backend/access/heap/heapam.c" },
    { id: "vacuumlazy", kind: "code", title: "vacuumlazy.c",                                          path: "src/backend/access/heap/vacuumlazy.c" },
    { id: "hellerstein",kind: "doc",  title: "Hellerstein et al. · The Anatomy of a Database System", host: "RDBMS textbook, ch. 4" },
    { id: "momjian",    kind: "doc",  title: "Bruce Momjian · MVCC Unmasked",                         host: "presentation, 2018" },
    { id: "ports",      kind: "doc",  title: "Ports & Grittner · SSI in Postgres",                    host: "VLDB 2012" },
    { id: "tx-id",      kind: "url",  title: "Transaction Id Wraparound",                              href: "https://www.postgresql.org/docs/current/routine-vacuuming.html", host: "postgresql.org" },
    { id: "snap-build", kind: "code", title: "GetSnapshotData",                                       path: "src/backend/utils/time/snapmgr.c" },
  ],
};
