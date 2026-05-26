import { describe, expect, it } from "vitest";
import { buttonVariants, cardVariants, dotVariants, eyebrowVariants, inlineTagVariants } from "../index";

describe("primitive variant class builders", () => {
  it("maps Card padding variants without grid placement", () => {
    expect(cardVariants()).toContain("bg-surface");
    expect(cardVariants()).toContain("rounded-lg");
    expect(cardVariants({ padding: "tight" })).toContain("px-4");
    expect(cardVariants({ padding: "loose" })).toContain("px-7");
    expect(cardVariants()).not.toContain("grid-column");
  });

  it("maps Eyebrow color variants to token-backed classes", () => {
    expect(eyebrowVariants()).toContain("text-ink-3");
    expect(eyebrowVariants({ color: "sage" })).toContain("text-sage-ink");
    expect(eyebrowVariants({ color: "coral" })).toContain("text-coral");
    expect(eyebrowVariants({ color: "butter" })).toContain("text-butter-ink");
  });

  it("maps Dot color variants to token-backed classes", () => {
    expect(dotVariants({ color: "sage" })).toContain("bg-sage");
    expect(dotVariants({ color: "coral" })).toContain("bg-coral");
    expect(dotVariants({ color: "butter" })).toContain("bg-butter-ink");
    expect(dotVariants({ color: "ink" })).toContain("bg-ink");
  });

  it("maps InlineTag to the metadata pill shape", () => {
    expect(inlineTagVariants()).toContain("bg-surface-3");
    expect(inlineTagVariants()).toContain("font-mono");
    expect(inlineTagVariants()).toContain("uppercase");
  });

  it("maps Button variants and sizes", () => {
    expect(buttonVariants()).toContain("bg-ink");
    expect(buttonVariants()).toContain("text-bg");
    expect(buttonVariants({ variant: "secondary" })).toContain("border-border-soft");
    expect(buttonVariants({ variant: "ghost" })).toContain("bg-transparent");
    expect(buttonVariants({ size: "sm" })).toContain("px-3");
    expect(buttonVariants({ size: "md" })).toContain("px-3.5");
  });
});
