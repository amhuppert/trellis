import { describe, expect, it } from "vitest";
import {
  BlockSchema,
  CustomManifestSchema,
  EntitySchema,
  KnowledgeGraphSchema,
  OrientationSchema,
  OutlineNodeSchema,
  ReferenceSchema,
  RelationshipSchema,
  ReportConfigSchema,
  SectionSchema,
  SourceReferenceSchema,
  SynthesisRootSchema
} from "../index";

const validProse = "See <e id=\"mvcc\">MVCC</e>, <em>emphasis</em>, and <code>xmin</code>.";

describe("schema layer", () => {
  it("parses representative valid block data", () => {
    expect(
      BlockSchema.parse({
        kind: "conceptIntro",
        anchorId: "intro",
        title: "Intro",
        body: validProse
      })
    ).toMatchObject({ kind: "conceptIntro" });
  });

  it("rejects unknown block kinds", () => {
    expect(() => BlockSchema.parse({ kind: "definition", body: "Nope" })).toThrow();
  });

  it("parses orientation data", () => {
    expect(
      OrientationSchema.parse({
        heroSummary: "A short map for the report.",
        whatYoullLearn: ["How row versions work."],
        recommendedPath: ["foundations"],
        keyEntityIds: ["mvcc"],
        jumpTargets: [{ label: "Start", mode: "guided", targetId: "foundations" }]
      })
    ).toMatchObject({ recommendedPath: ["foundations"] });
  });

  it("rejects invalid orientation jump modes", () => {
    expect(() =>
      OrientationSchema.parse({
        heroSummary: "A short map for the report.",
        jumpTargets: [{ label: "Broken", mode: "map" }]
      })
    ).toThrow();
  });

  it("parses recursive outline nodes", () => {
    expect(
      OutlineNodeSchema.parse({
        id: "root",
        title: "Root",
        children: [{ id: "child", title: "Child" }]
      })
    ).toMatchObject({ children: [{ id: "child" }] });
  });

  it("rejects outline nodes without ids", () => {
    expect(() => OutlineNodeSchema.parse({ title: "Missing id" })).toThrow();
  });

  it("parses sections with blocks and references", () => {
    expect(
      SectionSchema.parse({
        id: "foundations",
        n: "01",
        title: "Foundations",
        kind: "Concept",
        blocks: [{ kind: "prose", body: validProse }],
        children: [{ id: "intro", title: "Intro" }],
        relatedSectionIds: ["snapshots"],
        relatedEntityIds: ["mvcc"],
        sourceRefIds: ["docs-mvcc"]
      })
    ).toMatchObject({ id: "foundations" });
  });

  it("rejects invalid section kinds", () => {
    expect(() => SectionSchema.parse({ id: "x", title: "X", kind: "Appendix" })).toThrow();
  });

  it("parses synthesis references and roots", () => {
    expect(ReferenceSchema.parse({ kind: "section", id: "foundations", anchorId: "intro" })).toMatchObject({
      kind: "section"
    });
    expect(
      SynthesisRootSchema.parse({
        description: "A synthesis tree.",
        roots: [
          {
            id: "syn-root",
            level: 0,
            title: "Root",
            summary: "Summary",
            references: [{ kind: "entity", id: "mvcc" }],
            children: [{ id: "syn-child", level: 1, title: "Child", summary: "Summary" }]
          }
        ]
      })
    ).toMatchObject({ roots: [{ id: "syn-root" }] });
  });

  it("rejects invalid synthesis reference kinds", () => {
    expect(() => ReferenceSchema.parse({ kind: "relationship", id: "rel-a-b" })).toThrow();
  });

  it("parses knowledge graph data", () => {
    expect(
      EntitySchema.parse({
        id: "mvcc",
        name: "MVCC",
        type: "concept",
        shortDef: "Versioned concurrency control.",
        references: [{ kind: "section", id: "foundations" }],
        primarySectionId: "foundations"
      })
    ).toMatchObject({ id: "mvcc" });
    expect(RelationshipSchema.parse({ id: "rel-mvcc-snapshot", from: "mvcc", to: "snapshot", type: "depends-on" }))
      .toMatchObject({ strength: "medium" });
    expect(
      KnowledgeGraphSchema.parse({
        entities: [{ id: "mvcc", name: "MVCC", type: "concept", shortDef: "Versioned concurrency control." }],
        relationships: [{ id: "rel-mvcc-snapshot", from: "mvcc", to: "snapshot", type: "depends-on" }]
      })
    ).toMatchObject({ entities: [{ id: "mvcc" }] });
  });

  it("rejects invalid entity types and relationship strengths", () => {
    expect(() => EntitySchema.parse({ id: "x", name: "X", type: "database", shortDef: "Nope" })).toThrow();
    expect(() =>
      RelationshipSchema.parse({ id: "rel", from: "a", to: "b", type: "uses", strength: "absolute" })
    ).toThrow();
  });

  it("parses all source kinds", () => {
    expect(SourceReferenceSchema.parse({ kind: "url", id: "docs", title: "Docs", href: "https://example.com" }))
      .toMatchObject({ kind: "url" });
    expect(SourceReferenceSchema.parse({ kind: "code", id: "heapam", title: "heapam.c", path: "src/heapam.c" }))
      .toMatchObject({ kind: "code" });
    expect(SourceReferenceSchema.parse({ kind: "doc", id: "paper", title: "Paper" })).toMatchObject({ kind: "doc" });
    expect(
      SourceReferenceSchema.parse({
        kind: "passage",
        id: "passage-1",
        documentSourceId: "paper",
        location: "p. 12"
      })
    ).toMatchObject({ kind: "passage" });
  });

  it("rejects malformed source references", () => {
    expect(() => SourceReferenceSchema.parse({ kind: "url", id: "bad", title: "Bad", href: "not-a-url" })).toThrow();
  });

  it("parses custom manifests", () => {
    expect(
      CustomManifestSchema.parse({
        name: "TupleDiagram",
        purpose: "Show tuple version chains.",
        justification: "Static blocks cannot show the chain clearly.",
        usedIn: ["foundations"]
      })
    ).toMatchObject({ name: "TupleDiagram" });
  });

  it("rejects incomplete custom manifests", () => {
    expect(() => CustomManifestSchema.parse({ name: "TupleDiagram" })).toThrow();
  });

  it("parses a full report config", () => {
    expect(
      ReportConfigSchema.parse({
        id: "postgres-mvcc",
        title: "How Postgres MVCC Works",
        template: "tutorial",
        orientation: { heroSummary: "A report about MVCC." },
        sections: [{ id: "foundations", title: "Foundations", blocks: [{ kind: "prose", body: "Hello." }] }],
        kg: {
          entities: [{ id: "mvcc", name: "MVCC", type: "concept", shortDef: "Versioned concurrency control." }],
          relationships: []
        },
        sources: []
      })
    ).toMatchObject({ authors: [{ name: "Claude" }] });
  });

  it("rejects malformed report config", () => {
    expect(() => ReportConfigSchema.parse({ id: "x", title: "Missing template" })).toThrow();
  });
});
