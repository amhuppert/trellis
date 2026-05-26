import type { SynthesisRoot } from "@trellis/engine";

export const synthesis: SynthesisRoot = {
  description:
    "MVCC is a deal: writers leave a trail of versioned tuples, readers carry a snapshot that decides which versions count, and maintenance keeps the trail from burying the table.",
  roots: [
    {
      id: "syn-root",
      level: 0,
      title: "MVCC as a contract between writers and readers",
      summary:
        "Postgres concurrency factors into storage, visibility, maintenance, and limits. Writers stamp versions, readers carry snapshots, VACUUM reclaims unreachable versions, and SSI patches the anomalies a pure snapshot cannot see.",
      commonStructure:
        "Each branch keeps concurrent transactions out of each other's way by giving each reader a self-consistent past.",
      contrast:
        "Storage and visibility describe the read path; maintenance and limits describe the costs and edge cases.",
      keyTakeaways: [
        "Every reader gets its own past.",
        "Visibility is a relationship between tuple stamps and a reader's snapshot.",
        "MVCC's cost is paid in storage plus reclamation.",
        "Serializable isolation is MVCC plus predicate locks and cycle detection."
      ],
      openQuestions: [
        "Whether read committed is the right default for new applications.",
        "How future storage engines should balance version chains against undo logs."
      ],
      references: [
        { kind: "section", id: "foundations" },
        { kind: "source", id: "docs-mvcc" },
        { kind: "source", id: "hellerstein" }
      ],
      children: [
        {
          id: "syn-storage",
          level: 1,
          title: "Storage - how versions are stamped",
          summary:
            "Every write produces a new tuple rather than overwriting the old one. xmin, xmax, ctid, and HOT updates make that affordable.",
          references: [
            { kind: "section", id: "tuple-versions", anchorId: "tv-cols" },
            { kind: "entity", id: "xmin" },
            { kind: "entity", id: "xmax" },
            { kind: "entity", id: "ctid" },
            { kind: "source", id: "heapam" }
          ],
          children: [
            {
              id: "syn-storage-chains",
              level: 2,
              title: "ctid chains",
              summary: "When a row is updated, ctid can point to the location of the next version.",
              references: [{ kind: "section", id: "tuple-versions", anchorId: "tv-chains" }]
            },
            {
              id: "syn-storage-hot",
              level: 2,
              title: "HOT updates",
              summary: "HOT updates keep update chains local and avoid unnecessary index churn.",
              references: [
                { kind: "section", id: "tuple-versions", anchorId: "tv-hot" },
                { kind: "entity", id: "hot-update" }
              ]
            }
          ]
        },
        {
          id: "syn-visibility",
          level: 1,
          title: "Visibility - how snapshots decide what counts",
          summary:
            "A snapshot is the certificate a reader hands to the storage layer. The tuple visibility check compares that certificate to xmin and xmax.",
          references: [
            { kind: "section", id: "snapshots", anchorId: "snap-build" },
            { kind: "section", id: "visibility", anchorId: "vis-tree" },
            { kind: "entity", id: "snapshot" },
            { kind: "source", id: "snap-build" }
          ]
        },
        {
          id: "syn-maintenance",
          level: 1,
          title: "Maintenance - keeping versions from burying the table",
          summary:
            "VACUUM reclaims dead versions once no live snapshot needs them; freezing rewrites old xmin values before wraparound.",
          references: [
            { kind: "section", id: "vacuum", anchorId: "vac-phases" },
            { kind: "section", id: "vacuum", anchorId: "vac-freeze" },
            { kind: "entity", id: "vacuum" },
            { kind: "entity", id: "freezing" },
            { kind: "entity", id: "wraparound" },
            { kind: "source", id: "vacuumlazy" },
            { kind: "source", id: "tx-id" }
          ]
        },
        {
          id: "syn-limits",
          level: 1,
          title: "Limits - where the snapshot model is not enough",
          summary:
            "Serializable Snapshot Isolation adds predicate locks and dependency-graph checks to catch write skew.",
          references: [
            { kind: "section", id: "isolation" },
            { kind: "section", id: "edges", anchorId: "edge-skew" },
            { kind: "section", id: "edges", anchorId: "edge-ssi" },
            { kind: "entity", id: "ssi" },
            { kind: "entity", id: "predicate-lock" },
            { kind: "entity", id: "ssi-anomaly" },
            { kind: "source", id: "ports" }
          ]
        }
      ]
    }
  ]
};
