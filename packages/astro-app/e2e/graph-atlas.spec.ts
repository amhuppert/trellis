import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

test("atlas graph renders deterministic entities, focuses on click, and filters by search", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/graph/atlas");

  const graph = page.locator("[data-graph-mode='atlas']");
  await expect(graph).toBeVisible();
  await expect(page.locator(".react-flow__node-entity")).toHaveCount(16);
  await expect(page.locator(".react-flow__edge")).toHaveCount(12);

  const snapshot = page.locator("[data-entity-id='snapshot']");
  const readSnapshotLayout = async () => {
    await expect
      .poll(() =>
        page.locator("[data-entity-id='snapshot']").evaluate((node) => ({
          x: node.getAttribute("data-layout-x"),
          y: node.getAttribute("data-layout-y")
        }))
      )
      .toEqual({ x: expect.any(String), y: expect.any(String) });
    return page.locator("[data-entity-id='snapshot']").evaluate((node) => ({
      x: node.getAttribute("data-layout-x"),
      y: node.getAttribute("data-layout-y")
    }));
  };

  const before = await readSnapshotLayout();

  await page.reload();
  await expect(page.locator("[data-entity-id='snapshot']")).toBeVisible();
  const after = await readSnapshotLayout();
  expect(after).toEqual(before);

  await page.locator("[data-entity-id='snapshot']").click();
  await expect(page).toHaveURL(/#\/graph\/atlas$/);
  await expect(page.getByRole("button", { name: /open in reference/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /see in guided/i })).toBeVisible();

  await page.getByRole("searchbox", { name: /search graph/i }).fill("snapshot");
  await expect(page.locator(".react-flow__node-entity")).toHaveCount(1);
  await expect(page.locator("[data-entity-id='snapshot']")).toBeVisible();
});
