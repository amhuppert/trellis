import { expect, test } from "@playwright/test";

async function readLayout(page: import("@playwright/test").Page, entityId: string) {
  await expect
    .poll(() =>
      page.locator(`[data-entity-id='${entityId}']`).evaluate((node) => ({
        x: node.getAttribute("data-layout-x"),
        y: node.getAttribute("data-layout-y")
      }))
    )
    .toEqual({ x: expect.any(String), y: expect.any(String) });

  return page.locator(`[data-entity-id='${entityId}']`).evaluate((node) => ({
    x: Number(node.getAttribute("data-layout-x")),
    y: Number(node.getAttribute("data-layout-y"))
  }));
}

test("spotlight graph centers focus and recenters when an outer node is clicked", async ({ page }) => {
  await page.goto("/#/graph/spotlight/snapshot");

  await expect(page.locator("[data-graph-mode='spotlight']")).toBeVisible();
  await expect(page.locator("[data-entity-id='snapshot']")).toBeVisible();

  expect(await readLayout(page, "snapshot")).toEqual({ x: 590, y: 360 });
  const tupleBefore = await readLayout(page, "xmin");
  expect(tupleBefore).not.toEqual({ x: 590, y: 360 });

  await page.locator("[data-entity-id='xmin']").click();

  await expect(page).toHaveURL(/#\/graph\/spotlight\/xmin$/);
  expect(await readLayout(page, "xmin")).toEqual({ x: 590, y: 360 });
  await expect(page.getByRole("button", { name: "snapshot", exact: true })).toBeVisible();
});
