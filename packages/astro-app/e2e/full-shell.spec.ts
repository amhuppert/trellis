import { expect, test } from "@playwright/test";

type Page = import("@playwright/test").Page;

async function clearReaderState(page: Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function waitForReaderHydration(page: Page) {
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc"))).not.toBeNull();
}

async function expectTrellisChrome(page: Page) {
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 242, 236)");
  await expect(page.locator(".trellis-topbar")).toBeVisible();
  await expect(page.locator(".trellis-nav-panel")).toBeVisible();
  await expect(page.locator(".trellis-topbar__name")).toHaveCSS("font-family", /Manrope/);
}

test("cold start and keyboard shortcuts cover all primary modes", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/");
  await waitForReaderHydration(page);

  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page).toHaveURL(/#\/orientation$/);
  await expectTrellisChrome(page);

  for (const [key, view] of [
    ["G", "guided"],
    ["R", "reference"],
    ["S", "synthesis"],
    ["K", "graph"],
    ["O", "orientation"]
  ] as const) {
    await page.locator("body").click();
    await page.keyboard.press(key);
    await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
  }
});

test("all deep links restore state on reload", async ({ page }) => {
  await clearReaderState(page);

  for (const [hash, selector] of [
    ["#/orientation", '[data-view="orientation"]'],
    ["#/guided/foundations", '[data-view="guided"]'],
    ["#/guided/foundations/found-update", "#found-update"],
    ["#/reference", '[data-view="reference"]'],
    ["#/reference/snapshot", "text=snapshot"],
    ["#/synthesis", '[data-view="synthesis"]'],
    ["#/synthesis/syn-storage", "text=Storage - how versions are stamped"],
    ["#/graph/atlas", "[data-graph-mode='atlas']"],
    ["#/graph/spotlight/snapshot", "[data-graph-mode='spotlight']"],
    ["#/graph/regions", "[data-graph-mode='regions']"]
  ] as const) {
    await page.goto(`/${hash}`);
    await page.reload();
    await waitForReaderHydration(page);
    await expect(page.locator(selector).first()).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  }
});

test("cross-surface navigation connects orientation, guided, graph, and reference", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/orientation");
  await waitForReaderHydration(page);

  await page.getByTestId("orientation-card-path").getByRole("button", { name: /01 Foundations/ }).click();
  await expect(page).toHaveURL(/#\/guided\/foundations$/);
  await expect(page.locator('[data-view="guided"]')).toBeVisible();

  const guidedMvccRef = page.locator(".trellis-guided-blocks button[data-entity-id='mvcc']").first();
  await guidedMvccRef.hover();
  await guidedMvccRef.focus();
  await page.getByRole("button", { name: "See in graph" }).click();
  await expect(page).toHaveURL(/#\/graph\/spotlight\/mvcc$/);
  await expect(page.locator("[data-graph-mode='spotlight']")).toBeVisible();

  await page.getByRole("button", { name: "Open in Reference" }).click();
  await expect(page).toHaveURL(/#\/reference\/mvcc$/);
  await expect(page.getByRole("heading", { name: "MVCC" })).toBeVisible();

  await page.getByRole("button", { name: "Open 01 · Foundations" }).click();
  await expect(page).toHaveURL(/#\/guided\/foundations$/);
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
});

test("visual smoke screenshots cover every mode surface", async ({ page }) => {
  await clearReaderState(page);

  for (const [name, hash, selector] of [
    ["orientation", "#/orientation", '[data-view="orientation"]'],
    ["guided", "#/guided/foundations", '[data-view="guided"]'],
    ["reference", "#/reference/snapshot", '[data-view="reference"]'],
    ["synthesis", "#/synthesis/syn-root", '[data-view="synthesis"]'],
    ["graph-atlas", "#/graph/atlas", "[data-graph-mode='atlas']"],
    ["graph-spotlight", "#/graph/spotlight/snapshot", "[data-graph-mode='spotlight']"],
    ["graph-regions", "#/graph/regions", "[data-graph-mode='regions']"]
  ] as const) {
    await page.goto(`/${hash}`);
    await waitForReaderHydration(page);
    await expect(page.locator(selector)).toBeVisible();
    await expectTrellisChrome(page);
    await page.screenshot({ path: `test-results/full-shell-${name}.png`, fullPage: false });
  }
});
