import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const reports = ["postgres-mvcc", "trellis-engine-architecture"] as const;
const forbiddenPattern = /googleapis\.com|cdn\.|unpkg|jsdelivr|babel-standalone/i;

function walkFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

function assertRelativeRuntimeAssets(html: string) {
  const assetRefs = Array.from(html.matchAll(/<(script|link)\b[^>]*?(?:src|href)=["']([^"']+)["'][^>]*?>/gi))
    .filter(([tag]) => tag.startsWith("<script") || /rel=["']stylesheet["']/i.test(tag))
    .map(([, , value]) => value);

  expect(assetRefs.length).toBeGreaterThan(0);
  for (const ref of assetRefs) {
    expect(ref, `Expected runtime asset reference to be relative: ${ref}`).not.toMatch(/^(?:https?:)?\/\//);
    expect(ref, `Expected runtime asset reference to be relative: ${ref}`).not.toMatch(/^\//);
  }

  expect(html, "file:// output must not depend on browser-blocked module scripts").not.toMatch(
    /<script\b[^>]*\btype=["']module["']/i
  );
  expect(html, "file:// output must not depend on Astro island dynamic imports").not.toContain("astro-island");
}

function assertOrientationUtilities(css: string) {
  for (const selector of [".font-serif", ".font-mono", ".text-\\[4rem\\]", ".leading-none", ".max-w-\\[660px\\]"]) {
    expect(css, `Expected static CSS to include Orientation utility ${selector}`).toContain(selector);
  }
  expect(css, "Expected static CSS to preserve Orientation hero type scale after Tailwind preflight").toContain(
    ".trellis-orientation-view h1"
  );
  expect(css, "Expected Orientation hero H1 to render at display size").toContain("font-size:4rem");
}

describe.sequential("static report output", () => {
  for (const reportId of reports) {
    it(
      `builds ${reportId} as self-contained static output`,
      () => {
        execFileSync("pnpm", ["build", reportId], { cwd: rootDir, stdio: "pipe" });

        const distDir = join(rootDir, "reports", reportId, "dist");
        expect(existsSync(distDir), `${distDir} should exist`).toBe(true);

        const files = walkFiles(distDir).filter((file) => [".html", ".js", ".css"].includes(extname(file)));
        expect(files.length).toBeGreaterThan(0);

        for (const file of files) {
          const contents = readFileSync(file, "utf8");
          expect(contents, `${file} contains forbidden remote/CDN string`).not.toMatch(forbiddenPattern);
        }

        const indexHtml = readFileSync(join(distDir, "index.html"), "utf8");
        assertRelativeRuntimeAssets(indexHtml);
        assertOrientationUtilities(files.filter((file) => extname(file) === ".css").map((file) => readFileSync(file, "utf8")).join("\n"));
      },
      120_000
    );
  }
});
