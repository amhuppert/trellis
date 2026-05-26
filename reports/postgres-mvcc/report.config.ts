import type { ReportConfig } from "@trellis/engine";
import { sections } from "./content/index.ts";
import { kg } from "./kg/index.ts";
import { sources } from "./sources/index.ts";
import { synthesis } from "./synthesis/index.ts";

const reportConfig: ReportConfig = {
  id: "postgres-mvcc",
  title: "How Postgres MVCC Works",
  subtitle:
    "A reader's map to multi-version concurrency control - how Postgres decides what each transaction sees, why VACUUM matters, and where snapshot isolation actually ends.",
  audience: "Engineers who already use Postgres and want to know what is underneath.",
  readTime: "approx. 45 min",
  builtAt: "2026-05-24T00:00:00.000Z",
  template: "tutorial",
  authors: [{ name: "Claude", role: "Authored by" }],
  orientation: {
    heroSummary:
      "A reader's map to multi-version concurrency control - how Postgres decides what each transaction sees, why VACUUM matters, and where snapshot isolation actually ends.",
    whatYoullLearn: [
      "How Postgres represents row versions, and the role each tuple's xmin / xmax plays.",
      "The snapshot construction rules that decide what a transaction sees.",
      "Why long-running transactions block VACUUM, and what that costs you in production.",
      "Where SELECT FOR UPDATE, predicate locks, and serializable isolation diverge from the rest."
    ],
    recommendedPath: ["foundations", "tuple-versions", "snapshots", "visibility", "vacuum", "isolation", "edges"],
    keyEntityIds: ["mvcc", "snapshot", "vacuum", "xmin", "xmax", "ssi"],
    jumpTargets: [
      { label: "Start guided", mode: "guided", targetId: "foundations" },
      { label: "Open synthesis", mode: "synthesis", targetId: "syn-root" },
      { label: "Inspect MVCC", mode: "reference", targetId: "mvcc" },
      { label: "Graph view", mode: "graph" }
    ]
  },
  sections,
  synthesis,
  kg,
  sources,
  customComponents: []
};

export default reportConfig;
