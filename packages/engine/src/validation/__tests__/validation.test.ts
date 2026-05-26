import { describe, expect, it } from "vitest";
import { validateReport } from "../validate";

const baseReport = (): any => ({
  id: "test-report",
  title: "Test Report",
  template: "tutorial",
  orientation: {
    heroSummary: "A test report.",
    recommendedPath: ["intro"],
    keyEntityIds: ["mvcc"],
    jumpTargets: [{ label: "Start", mode: "guided", targetId: "intro" }]
  },
  sections: [
    {
      id: "intro",
      title: "Intro",
      kind: "Concept",
      blocks: [
        { kind: "conceptIntro", anchorId: "intro-anchor", title: "Intro", body: "Hello <e id=\"mvcc\">MVCC</e>." },
        { kind: "beforeContinue", body: "Next.", nextSectionId: "next" }
      ],
      children: [{ id: "intro-anchor", title: "Intro" }],
      relatedSectionIds: ["next"],
      relatedEntityIds: ["snapshot"],
      sourceRefIds: ["docs"]
    },
    {
      id: "next",
      title: "Next",
      kind: "Mechanism",
      blocks: [{ kind: "prose", anchorId: "next-anchor", body: "Next body." }],
      children: [{ id: "next-anchor", title: "Next" }]
    }
  ],
  kg: {
    entities: [
      { id: "mvcc", name: "MVCC", type: "concept", shortDef: "Versions.", primarySectionId: "intro" },
      {
        id: "snapshot",
        name: "snapshot",
        type: "concept",
        shortDef: "Reader view.",
        primarySectionId: "intro",
        references: [{ kind: "section", id: "intro", anchorId: "intro-anchor" }]
      }
    ],
    relationships: [{ id: "rel-mvcc-snapshot", from: "mvcc", to: "snapshot", type: "depends-on", sourceRefIds: ["docs"] }]
  },
  sources: [
    { kind: "url", id: "docs", title: "Docs", href: "https://example.com" },
    { kind: "passage", id: "passage", title: "Passage", documentSourceId: "docs", location: "Section 1" }
  ],
  synthesis: {
    roots: [
      {
        id: "syn-root",
        level: 0,
        title: "Root",
        summary: "Summary",
        references: [{ kind: "section", id: "intro", anchorId: "intro-anchor" }],
        children: [{ id: "syn-child", level: 1, title: "Child", summary: "Summary", references: [{ kind: "entity", id: "mvcc" }] }]
      }
    ]
  },
  customComponents: [{ name: "Widget", purpose: "Show data.", justification: "Needed.", usedIn: ["intro"] }]
});

const validate = (report: unknown) =>
  validateReport(report, {
    reportId: "test-report",
    reportRoot: "reports/test-report",
    customComponentFiles: new Set(["Widget"])
  });

describe("validation core", () => {
  it("returns no errors for a valid report", () => {
    expect(validate(baseReport()).errors).toEqual([]);
  });

  it("reports invalid schema parse", () => {
    const result = validate({ id: "bad", title: "Bad" });
    expect(result.errors[0]).toMatchObject({
      code: "schema.invalid",
      reportId: "test-report",
      filePath: "reports/test-report/report.config.ts",
      expectedNamespace: "schema"
    });
  });

  it("reports duplicate ids in every namespace", () => {
    const report = baseReport();
    report.sections.push({ ...report.sections[0] });
    report.sections[0].blocks.push({ kind: "prose", anchorId: "intro-anchor", body: "Duplicate anchor." });
    report.kg?.entities.push({ id: "mvcc", name: "Duplicate", type: "concept", shortDef: "Duplicate." });
    report.kg?.relationships.push({ id: "rel-mvcc-snapshot", from: "mvcc", to: "snapshot", type: "uses" });
    report.sources.push({ kind: "doc", id: "docs", title: "Duplicate source" });
    report.synthesis?.roots.push({ id: "syn-root", level: 0, title: "Duplicate", summary: "Duplicate" });
    report.customComponents.push({ name: "Widget", purpose: "Duplicate.", justification: "Duplicate.", usedIn: [] });

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "sections", missingId: "intro" }),
        expect.objectContaining({
          code: "duplicate.id",
          expectedNamespace: "anchors",
          sectionId: "intro",
          anchorId: "intro-anchor"
        }),
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "entities", missingId: "mvcc" }),
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "relationships", missingId: "rel-mvcc-snapshot" }),
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "sources", missingId: "docs" }),
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "synthesisNodes", missingId: "syn-root" }),
        expect.objectContaining({ code: "duplicate.id", expectedNamespace: "customComponents", missingId: "Widget" })
      ])
    );
  });

  it("reports missing orientation references", () => {
    const report = baseReport();
    report.orientation.recommendedPath = ["intrp"];
    report.orientation.keyEntityIds = ["snapshop"];

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.missing",
          filePath: "reports/test-report/report.config.ts",
          missingId: "intrp",
          expectedNamespace: "sections",
          suggestion: "intro"
        }),
        expect.objectContaining({
          code: "reference.missing",
          missingId: "snapshop",
          expectedNamespace: "entities",
          suggestion: "snapshot"
        })
      ])
    );
  });

  it("reports missing section references and outline anchors", () => {
    const report = baseReport();
    report.sections[0].relatedSectionIds = ["missing-section"];
    report.sections[0].relatedEntityIds = ["missing-entity"];
    report.sections[0].sourceRefIds = ["missing-source"];
    report.sections[0].children = [{ id: "missing-anchor", title: "Missing" }];

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "reference.missing", sectionId: "intro", missingId: "missing-section", expectedNamespace: "sections" }),
        expect.objectContaining({ code: "reference.missing", sectionId: "intro", missingId: "missing-entity", expectedNamespace: "entities" }),
        expect.objectContaining({ code: "reference.missing", sectionId: "intro", missingId: "missing-source", expectedNamespace: "sources" }),
        expect.objectContaining({ code: "reference.missing", sectionId: "intro", anchorId: "missing-anchor", expectedNamespace: "anchors" })
      ])
    );
  });

  it("reports missing block references including InlineProse entity refs", () => {
    const report = baseReport();
    report.sections[0].blocks[0] = {
      kind: "conceptIntro",
      anchorId: "intro-anchor",
      title: "Intro",
      body: "Broken <em><e id=\"snapshop\">snapshot</e></em>."
    };
    report.sections[0].blocks[1] = { kind: "beforeContinue", body: "Next.", nextSectionId: "missing-next" };

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "reference.missing",
          sectionId: "intro",
          blockIndex: 0,
          missingId: "snapshop",
          expectedNamespace: "entities",
          suggestion: "snapshot"
        }),
        expect.objectContaining({
          code: "reference.missing",
          sectionId: "intro",
          blockIndex: 1,
          missingId: "missing-next",
          expectedNamespace: "sections"
        })
      ])
    );
  });

  it("reports missing entity, relationship, synthesis, source, and custom references", () => {
    const report = baseReport();
    report.kg!.entities[0].primarySectionId = "missing-section";
    report.kg!.entities[1].references = [{ kind: "source", id: "missing-source" }];
    report.kg!.relationships[0].from = "missing-from";
    report.kg!.relationships[0].to = "missing-to";
    report.kg!.relationships[0].sourceRefIds = ["missing-source"];
    report.synthesis!.roots[0].references = [{ kind: "section", id: "intro", anchorId: "missing-anchor" }];
    report.synthesis!.roots[0].children[0].references = [{ kind: "source", id: "missing-source" }];
    report.sources[1] = { kind: "passage", id: "passage", documentSourceId: "missing-doc", location: "Section 1" };
    report.sections[0].blocks.push({ kind: "custom", componentName: "MissingWidget", props: {} });

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "sections", missingId: "missing-section" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "sources", missingId: "missing-source" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "entities", missingId: "missing-from" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "entities", missingId: "missing-to" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "anchors", anchorId: "missing-anchor" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "sources", missingId: "missing-doc" }),
        expect.objectContaining({
          code: "custom.missing",
          blockIndex: 2,
          missingId: "MissingWidget",
          expectedNamespace: "customComponents"
        })
      ])
    );
  });

  it("reports each missing synthesis reference kind", () => {
    const report = baseReport();
    report.synthesis!.roots[0].references = [
      { kind: "section", id: "missing-section" },
      { kind: "entity", id: "missing-entity" },
      { kind: "source", id: "missing-source" }
    ];

    expect(validate(report).errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "sections", missingId: "missing-section" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "entities", missingId: "missing-entity" }),
        expect.objectContaining({ code: "reference.missing", expectedNamespace: "sources", missingId: "missing-source" })
      ])
    );
  });
});
