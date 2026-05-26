import { describe, expect, it, vi } from "vitest";
import type { ReportConfig } from "../../schemas";
import { resolveRef } from "../resolveRef";

const report = {
  id: "test",
  title: "Test",
  template: "tutorial",
  authors: [{ name: "Test", role: "Authored by" }],
  orientation: {
    heroSummary: "Summary",
    whatYoullLearn: [],
    recommendedPath: [],
    keyEntityIds: [],
    jumpTargets: []
  },
  sections: [
    {
      id: "intro",
      n: "01",
      title: "Intro",
      kind: "Concept",
      summary: "Intro summary",
      blocks: [],
      children: [],
      relatedSectionIds: [],
      relatedEntityIds: [],
      sourceRefIds: []
    }
  ],
  kg: {
    entities: [{ id: "mvcc", name: "MVCC", type: "concept", shortDef: "Versioning", aliases: [], references: [] }],
    relationships: []
  },
  sources: [{ kind: "url", id: "docs", title: "Docs", href: "https://example.com", host: "example.com" }],
  customComponents: []
} satisfies ReportConfig;

describe("resolveRef", () => {
  it("maps section, entity, and source references to labels and actions", () => {
    const openSection = vi.fn();
    const openEntity = vi.fn();
    const openSource = vi.fn();

    const section = resolveRef({ kind: "section", id: "intro", anchorId: "intro-anchor" }, { report, openSection, openEntity, openSource });
    expect(section.label).toBe("§01 · Intro");
    section.onClick();
    expect(openSection).toHaveBeenCalledWith("intro", "intro-anchor");

    const entity = resolveRef({ kind: "entity", id: "mvcc" }, { report, openSection, openEntity, openSource });
    expect(entity.label).toBe("MVCC");
    entity.onClick();
    expect(openEntity).toHaveBeenCalledWith("mvcc");

    const source = resolveRef({ kind: "source", id: "docs" }, { report, openSection, openEntity, openSource });
    expect(source.label).toBe("Docs");
    source.onClick();
    expect(openSource).toHaveBeenCalledWith("docs");
  });
});
