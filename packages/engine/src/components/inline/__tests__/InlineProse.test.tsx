import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { InlineProse } from "../index";

function renderInline(text: string) {
  return renderToStaticMarkup(<InlineProse text={text} onOpenEntity={vi.fn()} />);
}

describe("InlineProse", () => {
  it("passes plain text through", () => {
    expect(renderInline("Readers keep moving while writers continue.")).toBe(
      "Readers keep moving while writers continue."
    );
  });

  it("renders emphasis tags as em elements", () => {
    expect(renderInline("A <em>stable</em> view.")).toBe("A <em>stable</em> view.");
  });

  it("renders code tags as inline code elements", () => {
    expect(renderInline("Read <code>xmin</code>.")).toContain("<code");
    expect(renderInline("Read <code>xmin</code>.")).toContain(">xmin</code>");
  });

  it("renders entity tags as entity placeholders with id and visible text", () => {
    const html = renderInline('A reader uses a <e id="snapshot">snapshot</e>.');

    expect(html).toContain('data-entity-id="snapshot"');
    expect(html).toContain(">snapshot</button>");
  });

  it("renders unresolved entity IDs as debug plain text when an entity list is supplied", () => {
    const html = renderToStaticMarkup(
      <InlineProse text={'A reader uses a <e id="missing">missing ref</e>.'} entities={[]} onOpenEntity={vi.fn()} />
    );

    expect(html).toContain('data-debug="unresolved-entity"');
    expect(html).toContain('data-entity-id="missing"');
    expect(html).toContain(">missing ref</span>");
  });

  it("parses nested legal tags recursively", () => {
    const html = renderInline("<em>some <code>foo</code> bar</em>");

    expect(html).toContain("<em>some <code");
    expect(html).toContain(">foo</code> bar</em>");
  });

  it("escapes unknown tags as text", () => {
    const html = renderInline("<script>alert(1)</script>");

    expect(html).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("renders malformed legal tags as plain text", () => {
    expect(renderInline("<em>unterminated")).toBe("&lt;em&gt;unterminated");
  });

  it("returns an empty fragment for an empty string", () => {
    expect(renderInline("")).toBe("");
  });
});
