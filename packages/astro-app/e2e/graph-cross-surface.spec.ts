import { expect, test } from "@playwright/test";

test("graph cross-surface wiring from guided, reference, right rail, and mode switcher", async ({ page }) => {
  await page.goto("/#/guided/foundations");
  const guidedMvccRef = page.locator(".trellis-guided-blocks button[data-entity-id='mvcc']").first();
  await guidedMvccRef.hover();
  await guidedMvccRef.focus();
  await expect(page.getByRole("button", { name: "See in graph" })).toBeVisible();
  await page.getByRole("button", { name: "See in graph" }).click();
  await expect(page).toHaveURL(/#\/graph\/spotlight\/mvcc$/);
  await expect(page.locator("[data-graph-mode='spotlight']")).toBeVisible();

  await page.goto("/#/reference/snapshot");
  await expect(page.getByRole("heading", { name: "snapshot" })).toBeVisible();
  await page.getByRole("button", { name: /see in knowledge graph/i }).click();
  await expect(page).toHaveURL(/#\/graph\/spotlight\/snapshot$/);

  await page.goto("/#/guided/snapshots");
  await expect(page.locator(".trellis-right-rail [data-mini-graph]")).toHaveCSS("width", "220px");
  await page.locator(".trellis-right-rail").getByRole("button", { name: "snapshot concept" }).click();
  await expect(page).toHaveURL(/#\/reference\//);

  await page.goto("/#/guided/snapshots");
  await page.getByRole("button", { name: /see full graph/i }).click();
  await expect(page).toHaveURL(/#\/graph\/regions$/);

  await page.getByRole("button", { name: "Atlas" }).click();
  await expect(page).toHaveURL(/#\/graph\/atlas$/);
  await expect(page.locator("[data-graph-mode='atlas']")).toBeVisible();

  await page.getByRole("button", { name: "Spotlight" }).click();
  await expect(page).toHaveURL(/#\/graph\/spotlight\/snapshot$/);
  await expect(page.locator("[data-graph-mode='spotlight']")).toBeVisible();

  await page.getByRole("button", { name: "Regions" }).click();
  await expect(page).toHaveURL(/#\/graph\/regions$/);
  await expect(page.locator("[data-graph-mode='regions']")).toBeVisible();

  await expect(page.locator(".trellis-topbar")).toBeVisible();
  await expect(page.locator(".trellis-nav-panel")).toBeVisible();
});
