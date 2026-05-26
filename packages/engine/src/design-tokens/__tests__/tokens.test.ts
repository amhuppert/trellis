import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";

import { trellisTokens } from "../theme";

const requiredGroups = {
  colors: [
    "bg",
    "surface",
    "surface-2",
    "surface-3",
    "ink",
    "ink-2",
    "ink-3",
    "ink-4",
    "border-soft",
    "border",
    "border-hi",
    "accent-sage",
    "accent-sage-ink",
    "accent-sage-soft",
    "accent-sage-bg",
    "accent-coral",
    "accent-coral-ink",
    "accent-coral-soft",
    "accent-coral-bg",
    "accent-butter",
    "accent-butter-ink",
    "accent-butter-bg"
  ],
  fonts: ["sans", "serif", "mono"],
  radii: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "pill"],
  shadows: ["sm", "pop"],
  motion: ["fast", "med", "slow", "ease-out"],
  layout: ["topbar-height", "nav-width", "right-rail-width", "reading-width", "page-max"]
} as const;

const typeRoleFamilies = {
  display: "var(--font-serif)",
  h1: "var(--font-serif)",
  h2: "var(--font-serif)",
  h3: "var(--font-serif)",
  lead: "var(--font-serif)",
  body: "var(--font-serif)",
  "body-sans": "var(--font-sans)",
  label: "var(--font-sans)",
  caption: "var(--font-sans)",
  eyebrow: "var(--font-mono)",
  mono: "var(--font-mono)",
  code: "var(--font-mono)"
} as const;

describe("trellisTokens", () => {
  it("exports every design token required by DESIGN.md section 8.2", () => {
    for (const [group, keys] of Object.entries(requiredGroups)) {
      expect(Object.keys(trellisTokens[group as keyof typeof trellisTokens])).toEqual(
        expect.arrayContaining([...keys])
      );
    }
  });

  it("defines complete text-role utilities with bundled font families", async () => {
    const css = await readFile(new URL("../tokens.css", import.meta.url), "utf8");

    for (const [role, family] of Object.entries(typeRoleFamilies)) {
      expect(css).toMatch(
        new RegExp(`\\.text-${role}\\s*\\{[^}]*font-family:\\s*${family.replace(/[()]/g, "\\$&")}`)
      );
    }
  });
});
