import type { SynthesisRoot } from "@trellis/engine";

export const synthesis: SynthesisRoot = {
  description:
    "Trellis works because one structured report object travels through schemas, validation, Astro loading, shell state, and graph projection without changing ownership.",
  roots: [
    {
      id: "architecture-loop",
      level: 0,
      title: "A typed report object drives every surface",
      summary:
        "The engine architecture centers on ReportConfig: schemas define it, validation protects it, Astro loads it, AppShell routes it, and graph helpers project its KG into React Flow.",
      commonStructure:
        "Each layer accepts structured data from the previous layer and adds a narrower runtime concern without taking over authorship.",
      contrast:
        "Schemas and validation are build-time guardrails; AppShell and GraphView are reader-time projections of the same report data.",
      keyTakeaways: [
        "ReportConfig is the architectural handoff between authoring and rendering.",
        "Validation adds cross-reference guarantees that Zod alone cannot express.",
        "AppShell centralizes reader state so all five modes speak one navigation language.",
        "The graph runtime projects KG data rather than owning a separate graph model."
      ],
      openQuestions: [
        "How much build-time rendering should move into the engine package as static output matures.",
        "Whether future custom components need stronger manifest validation than the current file/name match."
      ],
      references: [
        { kind: "section", id: "architecture-overview", anchorId: "overview-boundary" },
        { kind: "section", id: "schemas-validation", anchorId: "validation-pass" },
        { kind: "section", id: "reader-shell-modes", anchorId: "mode-flow" },
        { kind: "section", id: "knowledge-graph-runtime", anchorId: "graph-flow" },
        { kind: "entity", id: "report-config" },
        { kind: "entity", id: "app-shell" },
        { kind: "entity", id: "graph-view" },
        { kind: "source", id: "app-shell-source" },
        { kind: "source", id: "validation-source" }
      ],
      children: [
        {
          id: "schema-to-shell",
          level: 1,
          title: "From schema contract to reader shell",
          summary:
            "ReportConfig and validation make the data safe enough for AppShell to treat modes as projections rather than independent pages.",
          references: [
            { kind: "section", id: "schemas-validation", anchorId: "schema-contract" },
            { kind: "section", id: "reader-shell-modes", anchorId: "shell-coordinator" },
            { kind: "entity", id: "block-schema" },
            { kind: "entity", id: "app-shell" }
          ]
        },
        {
          id: "kg-as-projection",
          level: 1,
          title: "The KG remains report data",
          summary:
            "GraphView and KG helpers convert entity and relationship definitions into UI state, but the canonical graph stays in the report config.",
          references: [
            { kind: "section", id: "knowledge-graph-runtime", anchorId: "graph-runtime" },
            { kind: "entity", id: "entity-schema" },
            { kind: "entity", id: "kg-helpers" },
            { kind: "source", id: "kg-graph-data-source" }
          ]
        }
      ]
    }
  ]
};
