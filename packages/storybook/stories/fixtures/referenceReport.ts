import type { ReportConfig } from "@trellis/engine";

export const referenceReport: ReportConfig = {
  id: "storybook-reference",
  title: "Storybook Reference Report",
  template: "tutorial",
  authors: [{ name: "Storybook", role: "Authored by" }],
  orientation: {
    heroSummary: "A compact report fixture for shell, rail, and reference stories.",
    whatYoullLearn: [],
    recommendedPath: ["foundations", "snapshots"],
    keyEntityIds: ["mvcc", "snapshot"],
    jumpTargets: [{ label: "Start guided", mode: "guided", targetId: "foundations" }]
  },
  sections: [
    {
      id: "foundations",
      n: "01",
      title: "Foundations",
      kind: "Concept",
      summary: "The first ideas behind MVCC.",
      blocks: [],
      children: [],
      relatedSectionIds: ["snapshots"],
      relatedEntityIds: ["mvcc", "snapshot", "xmin"],
      sourceRefIds: ["docs-mvcc", "heapam", "momjian-slide-18"]
    },
    {
      id: "snapshots",
      n: "03",
      title: "Snapshots",
      kind: "Mechanism",
      summary: "The transaction view used to decide visibility.",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: ["snapshot", "xip-list"],
      sourceRefIds: ["docs-mvcc"]
    }
  ],
  kg: {
    entities: [
      {
        id: "mvcc",
        name: "MVCC",
        type: "concept",
        shortDef: "Multi-Version Concurrency Control keeps many row versions so readers and writers avoid blocking.",
        references: [],
        aliases: [],
        primarySectionId: "foundations"
      },
      {
        id: "snapshot",
        name: "snapshot",
        type: "concept",
        shortDef: "The transaction view that decides which tuple versions count as visible.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      },
      {
        id: "xmin",
        name: "xmin",
        type: "concept",
        shortDef: "Transaction id of the tuple inserter.",
        references: [],
        aliases: [],
        primarySectionId: "foundations"
      },
      {
        id: "xip-list",
        name: "xip list",
        type: "concept",
        shortDef: "The in-progress transaction ids carried by a snapshot.",
        references: [],
        aliases: [],
        primarySectionId: "snapshots"
      }
    ],
    relationships: [
      { id: "rel-mvcc-snapshot", from: "mvcc", to: "snapshot", type: "depends-on", strength: "strong", sourceRefIds: [] },
      { id: "rel-snapshot-xip-list", from: "snapshot", to: "xip-list", type: "contains", strength: "medium", sourceRefIds: [] },
      { id: "rel-xmin-snapshot", from: "xmin", to: "snapshot", type: "compared-by", strength: "strong", sourceRefIds: [] }
    ]
  },
  synthesis: {
    description: "A compact synthesis tree for Storybook stories.",
    roots: [
      {
        id: "syn-root",
        level: 0,
        title: "MVCC as a reader contract",
        summary: "Snapshots, tuple stamps, and cleanup cooperate to give readers a stable view.",
        commonStructure: "Every branch describes one side of the same visibility contract.",
        contrast: "Storage explains what is written; snapshots explain what is visible.",
        keyTakeaways: ["Readers carry a stable view.", "Tuple metadata gives visibility rules data."],
        openQuestions: ["Where should the UI expose implementation limits?"],
        references: [{ kind: "section", id: "foundations" }, { kind: "entity", id: "snapshot" }],
        children: [
          {
            id: "syn-storage",
            level: 1,
            title: "Storage stamps",
            summary: "Tuple metadata records which transaction created or replaced a version.",
            keyTakeaways: [],
            openQuestions: [],
            references: [{ kind: "entity", id: "xmin" }],
            children: []
          }
        ]
      }
    ]
  },
  sources: [
    {
      id: "docs-mvcc",
      kind: "url",
      title: "PostgreSQL Documentation - Concurrency Control",
      href: "https://www.postgresql.org/docs/current/mvcc.html",
      host: "postgresql.org"
    },
    {
      id: "heapam",
      kind: "code",
      title: "heapam.c",
      path: "src/backend/access/heap/heapam.c",
      lineRange: [120, 180]
    },
    {
      id: "momjian",
      kind: "doc",
      title: "Bruce Momjian - MVCC Unmasked",
      host: "presentation, 2018",
      locationHint: "slides"
    },
    {
      id: "momjian-slide-18",
      kind: "passage",
      title: "MVCC Unmasked visibility passage",
      documentSourceId: "momjian",
      location: "slide 18"
    }
  ],
  customComponents: []
};

export const snapshotEntity = referenceReport.kg!.entities.find((entity) => entity.id === "snapshot")!;
