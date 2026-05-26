import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

describe("Storybook preview smoke setup", () => {
  it("loads Trellis token CSS into every preview iframe", async () => {
    const preview = await readFile(new URL("../.storybook/preview.ts", import.meta.url), "utf8");

    expect(preview).toContain("@trellis/engine/design-tokens/tokens.css");
    expect(preview).toMatch(/backgrounds:[\s\S]*var\(--color-bg\)/);
    expect(preview).toMatch(/themes:[\s\S]*default:\s*"light"/);
  });

  it("exposes a welcome smoke story that relies on tokenized styles", async () => {
    const story = await readFile(new URL("../stories/welcome.stories.tsx", import.meta.url), "utf8");

    expect(story).toContain("data-testid=\"trellis-storybook-smoke\"");
    expect(story).toContain("var(--color-bg)");
    expect(story).toContain("var(--font-serif)");
    expect(story).toContain("var(--color-ink)");
  });
});
