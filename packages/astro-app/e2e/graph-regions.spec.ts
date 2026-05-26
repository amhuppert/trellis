import { expect, test } from "@playwright/test";

test("regions graph groups entities by section and region click opens guided", async ({ page }) => {
  await page.goto("/#/graph/regions");

  await expect(page.locator("[data-graph-mode='regions']")).toBeVisible();
  await expect(page.locator("[data-region-id]")).toHaveCount(6);
  await expect(page.locator("[data-region-id='tuple-versions']")).toContainText("Tuple versions");

  const subduedEdges = await page.locator(".react-flow__edge path[style*='opacity']").count();
  expect(subduedEdges).toBeGreaterThan(0);

  await page.locator("[data-region-id='tuple-versions']").click();
  await expect(page).toHaveURL(/#\/guided\/tuple-versions$/);
  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();
});
