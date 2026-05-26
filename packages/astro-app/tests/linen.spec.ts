import { expect, test } from "@playwright/test";

test.skip("Astro page serves Trellis linen background", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 242, 236)");
  await expect(page.getByRole("heading", { name: "Trellis" })).toBeVisible();
});
