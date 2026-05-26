import type { Section } from "@trellis/engine";

export const sections: Section[] = [
  {
    n: "01",
    id: "architecture-overview",
    title: "Architecture Overview",
    kind: "Concept",
    time: "7m",
    blurb: "The report source, engine package, and Astro app form the runtime boundary.",
    summary:
      "Trellis keeps authored report data in report directories, shared runtime code in the engine, and static-page assembly in the Astro app.",
    relatedEntityIds: ["trellis-engine", "astro-app", "report-config", "app-shell"],
    sourceRefIds: ["report-config-schema", "astro-report-loader", "astro-index-page", "app-shell-source"],
    children: [
      { id: "overview-boundary", title: "Three-part boundary" },
      { id: "overview-flow", title: "Render flow" },
      { id: "overview-constraint", title: "Why data stays structured" }
    ],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "overview-boundary",
        title: "Three-part boundary",
        body:
          "<e id=\"trellis-engine\">The Trellis engine</e> owns schemas, validation, React components, and graph helpers. <e id=\"astro-app\">The Astro app</e> selects a report and mounts <e id=\"app-shell\">AppShell</e>. Each report supplies a typed <e id=\"report-config\">ReportConfig</e>."
      },
      {
        kind: "stepByStep",
        anchorId: "overview-flow",
        title: "How a report reaches the reader",
        steps: [
          {
            title: "Load the selected report",
            body:
              "<e id=\"astro-app\">The Astro app</e> calls the engine loader with the selected report id before page render."
          },
          {
            title: "Validate the report",
            body:
              "<e id=\"validate-cli\">Validation</e> checks the same report shape that the CLI checks, so broken references fail before <e id=\"app-shell\">AppShell</e> receives data."
          },
          {
            title: "Mount the shell",
            body:
              "<e id=\"app-shell\">AppShell</e> receives the parsed <e id=\"report-config\">ReportConfig</e> and chooses the active reader mode."
          }
        ]
      },
      {
        kind: "callout",
        anchorId: "overview-constraint",
        tone: "info",
        title: "The report is data first",
        body:
          "Trellis reports are structured data, not arbitrary pages. That lets <e id=\"block-schema\">BlockSchema</e>, <e id=\"entity-schema\">EntitySchema</e>, and reference validation keep the reader shell predictable."
      },
      { kind: "beforeContinue", body: "Next, inspect the schemas and validation rules that make the report boundary enforceable.", nextSectionId: "schemas-validation" }
    ]
  },
  {
    n: "02",
    id: "schemas-validation",
    title: "Schemas & Validation",
    kind: "Mechanism",
    time: "8m",
    blurb: "Zod schemas define the report contract; validation adds cross-reference checks.",
    summary:
      "Zod catches structural errors, then Trellis-specific validation catches duplicate ids, missing references, custom component gaps, and unused authoring surface.",
    relatedEntityIds: ["report-config", "block-schema", "entity-schema", "validate-cli", "report-loader"],
    sourceRefIds: ["report-config-schema", "block-schema-source", "kg-schema-source", "validation-source", "validate-cli-source"],
    children: [
      { id: "schema-contract", title: "Schema contract" },
      { id: "validation-pass", title: "Validation pass" },
      { id: "schema-risk", title: "Reference errors are render errors" }
    ],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "schema-contract",
        title: "Schema contract",
        body:
          "<e id=\"report-config\">ReportConfig</e> composes orientation, sections, synthesis, KG, sources, and custom components. <e id=\"block-schema\">BlockSchema</e> discriminates every guided-reading block by kind, while <e id=\"entity-schema\">EntitySchema</e> defines graph nodes."
      },
      {
        kind: "stepByStep",
        anchorId: "validation-pass",
        title: "What validation does after parsing",
        steps: [
          {
            title: "Parse the root config",
            body:
              "<e id=\"validate-cli\">The validate CLI</e> calls the Zod root schema before any reference checks run."
          },
          {
            title: "Build a resolver",
            body:
              "Validation indexes sections, anchors, sources, synthesis nodes, entities, relationships, and custom components from <e id=\"report-config\">ReportConfig</e>."
          },
          {
            title: "Run reference rules",
            body:
              "Rules check InlineProse entity refs, orientation shortcuts, relationship endpoints, source links, and <e id=\"block-schema\">custom block</e> component names."
          }
        ]
      },
      {
        kind: "callout",
        anchorId: "schema-risk",
        tone: "warn",
        title: "Most failures are cross-reference failures",
        body:
          "A report can satisfy Zod and still fail if <e id=\"entity-schema\">an entity</e>, source, section anchor, or synthesis id is misspelled. That is why <e id=\"validate-cli\">validation</e> is part of the authoring loop."
      },
      { kind: "beforeContinue", body: "With the data contract in place, the next section follows how the reader shell consumes that data.", nextSectionId: "reader-shell-modes" }
    ]
  },
  {
    n: "03",
    id: "reader-shell-modes",
    title: "Reader Shell & Modes",
    kind: "Mechanism",
    time: "8m",
    blurb: "AppShell owns reader state and routes the five reader modes.",
    summary:
      "AppShell creates persistent reader state, exposes navigation callbacks, renders NavPanel, and switches among Orientation, Guided, Reference, Synthesis, and Graph views.",
    relatedEntityIds: ["app-shell", "nav-panel", "orientation-view", "guided-view", "reference-view", "synthesis-view", "graph-view"],
    sourceRefIds: ["app-shell-source", "nav-panel-source", "guided-view-source", "reference-view-source", "graph-view-source"],
    children: [
      { id: "shell-coordinator", title: "Shell as coordinator" },
      { id: "mode-flow", title: "Mode flow" },
      { id: "mode-contract", title: "Mode contract" }
    ],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "shell-coordinator",
        title: "Shell as coordinator",
        body:
          "<e id=\"app-shell\">AppShell</e> is the shared state boundary for the reader. It renders <e id=\"nav-panel\">NavPanel</e>, picks the active mode, and passes callbacks that let blocks open entities, sections, synthesis nodes, and graph spotlight states."
      },
      {
        kind: "stepByStep",
        anchorId: "mode-flow",
        title: "How mode navigation works",
        steps: [
          {
            title: "Initialize state",
            body:
              "<e id=\"app-shell\">AppShell</e> starts on Orientation unless persisted state or the hash router selects another mode."
          },
          {
            title: "Expose actions",
            body:
              "The shell context gives <e id=\"guided-view\">GuidedView</e>, <e id=\"reference-view\">ReferenceView</e>, <e id=\"synthesis-view\">SynthesisView</e>, and <e id=\"graph-view\">GraphView</e> the same navigation vocabulary."
          },
          {
            title: "Render mode surface",
            body:
              "<e id=\"nav-panel\">NavPanel</e> remains persistent while <e id=\"app-shell\">AppShell</e> swaps the main view."
          }
        ]
      },
      {
        kind: "callout",
        anchorId: "mode-contract",
        tone: "info",
        title: "Five modes share one report object",
        body:
          "<e id=\"orientation-view\">OrientationView</e>, <e id=\"guided-view\">GuidedView</e>, <e id=\"reference-view\">ReferenceView</e>, <e id=\"synthesis-view\">SynthesisView</e>, and <e id=\"graph-view\">GraphView</e> all read from the same validated <e id=\"report-config\">ReportConfig</e>."
      },
      { kind: "beforeContinue", body: "The final section zooms into the graph mode and the helper layer underneath it.", nextSectionId: "knowledge-graph-runtime" }
    ]
  },
  {
    n: "04",
    id: "knowledge-graph-runtime",
    title: "Knowledge Graph Runtime",
    kind: "Mechanism",
    time: "5m",
    blurb: "React Flow renders graph state derived from Trellis KG entities and relationships.",
    summary:
      "The graph runtime converts report KG data into React Flow nodes and edges, filters it by mode, and keeps entity graph state connected to the rest of the reader.",
    relatedEntityIds: ["graph-view", "react-flow", "kg-helpers", "entity-schema", "app-shell"],
    sourceRefIds: ["graph-view-source", "kg-graph-data-source", "kg-schema-source"],
    children: [
      { id: "graph-runtime", title: "Runtime shape" },
      { id: "graph-flow", title: "Graph data flow" },
      { id: "graph-boundary", title: "Graph boundary" }
    ],
    blocks: [
      {
        kind: "conceptIntro",
        anchorId: "graph-runtime",
        title: "Runtime shape",
        body:
          "<e id=\"graph-view\">GraphView</e> is the reader mode that turns the report KG into an interactive <e id=\"react-flow\">React Flow</e> surface. <e id=\"kg-helpers\">KG helpers</e> prepare stable node and edge records from <e id=\"entity-schema\">EntitySchema</e> data."
      },
      {
        kind: "stepByStep",
        anchorId: "graph-flow",
        title: "How graph data becomes UI",
        steps: [
          {
            title: "Read report KG",
            body:
              "<e id=\"graph-view\">GraphView</e> reads entities and relationships from <e id=\"report-config\">ReportConfig</e> through reader context."
          },
          {
            title: "Build flow nodes",
            body:
              "<e id=\"kg-helpers\">KG helpers</e> map every <e id=\"entity-schema\">entity</e> to a React Flow node and every relationship to an edge."
          },
          {
            title: "Filter by mode",
            body:
              "<e id=\"graph-view\">GraphView</e> coordinates Atlas, Spotlight, and Regions controls before <e id=\"react-flow\">React Flow</e> renders the canvas."
          }
        ]
      },
      {
        kind: "callout",
        anchorId: "graph-boundary",
        tone: "aside",
        title: "The graph is a projection",
        body:
          "The KG is report data. <e id=\"react-flow\">React Flow</e> is only the rendering implementation, while <e id=\"kg-helpers\">KG helpers</e> preserve Trellis-specific semantics such as entity type, primary section, degree, and relationship strength."
      }
    ]
  }
];
