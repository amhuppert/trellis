import type { KnowledgeGraph, Section } from "../../schemas";

export const kgFixture: KnowledgeGraph = {
  entities: [
    {
      id: "snapshot",
      name: "Snapshot",
      aliases: ["transaction view"],
      type: "concept",
      shortDef: "A transaction view.",
      references: [],
      primarySectionId: "snapshots"
    },
    {
      id: "tuple",
      name: "Tuple version",
      aliases: ["row version"],
      type: "feature",
      shortDef: "A physical row version.",
      references: [],
      primarySectionId: "tuple-versions"
    },
    {
      id: "vacuum",
      name: "VACUUM",
      aliases: ["cleanup"],
      type: "feature",
      shortDef: "Reclaims dead tuples.",
      references: [],
      primarySectionId: "vacuum"
    },
    {
      id: "heapam",
      name: "heapam.c",
      aliases: [],
      type: "file",
      shortDef: "Heap access method source.",
      references: [],
      primarySectionId: "tuple-versions"
    }
  ],
  relationships: [
    {
      id: "rel-snapshot-tuple",
      from: "snapshot",
      to: "tuple",
      type: "depends-on",
      label: "reads",
      strength: "strong",
      sourceRefIds: []
    },
    {
      id: "rel-tuple-vacuum",
      from: "tuple",
      to: "vacuum",
      type: "used-by",
      strength: "medium",
      sourceRefIds: []
    },
    {
      id: "rel-vacuum-heapam",
      from: "vacuum",
      to: "heapam",
      type: "implemented-in",
      strength: "weak",
      sourceRefIds: []
    }
  ]
};

export const sectionsFixture: Section[] = [
  {
    id: "snapshots",
    n: "01",
    title: "Snapshots",
    kind: "Concept",
    relatedEntityIds: ["snapshot"],
    blocks: [],
    children: [],
    relatedSectionIds: [],
    sourceRefIds: []
  },
  {
    id: "tuple-versions",
    n: "02",
    title: "Tuple Versions",
    kind: "Mechanism",
    relatedEntityIds: ["tuple", "heapam"],
    blocks: [],
    children: [],
    relatedSectionIds: [],
    sourceRefIds: []
  },
  {
    id: "vacuum",
    n: "03",
    title: "Vacuum",
    kind: "Maintenance",
    relatedEntityIds: ["vacuum", "tuple"],
    blocks: [],
    children: [],
    relatedSectionIds: [],
    sourceRefIds: []
  }
];
