import { expect, test } from "@playwright/test";

type Page = import("@playwright/test").Page;

async function clearReaderState(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function waitForReaderHydration(page: Page) {
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc"))).not.toBeNull();
}

async function expectRouteState(page: Page, hash: string) {
  await page.goto(`/${hash}`);
  await page.reload();
  await waitForReaderHydration(page);

  if (hash === "#/orientation") {
    await expect(page.locator('[data-view="orientation"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "How Postgres MVCC Works" })).toBeVisible();
  } else if (hash.startsWith("#/guided/")) {
    await expect(page.locator('[data-view="guided"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: hash.includes("tuple-versions") ? "Tuple versions" : "Foundations" })).toBeVisible();
    if (hash.endsWith("/found-update")) {
      await expect(page.locator("#found-update")).toBeInViewport();
    }
  } else if (hash === "#/reference") {
    await expect(page.locator('[data-view="reference"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Glossary & sources" })).toBeVisible();
  } else if (hash === "#/reference/snapshot") {
    await expect(page.locator('[data-view="reference"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "snapshot" })).toBeVisible();
  } else if (hash === "#/synthesis") {
    await expect(page.locator('[data-view="synthesis"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "MVCC as a contract between writers and readers" })).toBeVisible();
  } else if (hash === "#/synthesis/syn-storage") {
    await expect(page.locator('[data-view="synthesis"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: "Storage - how versions are stamped" })).toBeVisible();
  } else if (hash === "#/graph/atlas") {
    await expect(page.locator("[data-graph-mode='atlas']")).toBeVisible();
  } else if (hash === "#/graph/spotlight/snapshot") {
    await expect(page.locator("[data-graph-mode='spotlight']")).toBeVisible();
    await expect(page.locator("[data-entity-id='snapshot']")).toBeVisible();
  } else if (hash === "#/graph/regions") {
    await expect(page.locator("[data-graph-mode='regions']")).toBeVisible();
    await expect(page.locator("[data-region-id]")).toHaveCount(6);
  }

  await expect(page).toHaveURL(new RegExp(`${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
}

test("every supported hash deep link restores state after reload", async ({ page }) => {
  await clearReaderState(page);

  for (const hash of [
    "#/orientation",
    "#/guided/foundations",
    "#/guided/foundations/found-update",
    "#/reference",
    "#/reference/snapshot",
    "#/synthesis",
    "#/synthesis/syn-storage",
    "#/graph/atlas",
    "#/graph/spotlight/snapshot",
    "#/graph/regions"
  ]) {
    await expectRouteState(page, hash);
  }
});

test("UI navigation updates hash with replaceState", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/orientation");
  await waitForReaderHydration(page);
  const historyLength = await page.evaluate(() => window.history.length);

  await page.getByTestId("orientation-card-entities").getByRole("button", { name: "MVCC concept" }).click();
  await expect(page).toHaveURL(/#\/reference\/mvcc$/);
  await expect(page.getByRole("heading", { name: "MVCC" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.history.length)).toBe(historyLength);

  await page.getByRole("button", { name: "Open 01 · Foundations" }).click();
  await expect(page).toHaveURL(/#\/guided\/foundations$/);
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.history.length)).toBe(historyLength);
});

test("invalid hash patterns and IDs fall back without crashing", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/unknown");
  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page).toHaveURL(/#\/orientation$/);

  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning") warnings.push(message.text());
  });

  await page.goto("/#/guided/not-a-section");
  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page).toHaveURL(/#\/orientation$/);
  expect(warnings.some((warning) => warning.includes("Unknown section id"))).toBe(true);

  await page.goto("/#/reference/not-an-entity");
  await expect(page.locator('[data-view="reference"]')).toBeVisible();
  await expect(page).toHaveURL(/#\/reference$/);
  await expect(page.getByRole("heading", { name: "Glossary & sources" })).toBeVisible();
  expect(warnings.some((warning) => warning.includes("Unknown entity id"))).toBe(true);
});
