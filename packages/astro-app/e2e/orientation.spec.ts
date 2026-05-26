import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function waitForReaderHydration(page: import("@playwright/test").Page) {
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc"))).not.toBeNull();
}

test("orientation renders the 12-column bento grid by default", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/");

  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page.getByTestId("orientation-bento-grid")).toHaveCSS(
    "grid-template-columns",
    /repeat\(12, minmax\(0px, 1fr\)\)|\d+px/
  );
  await expect(page.getByTestId("orientation-card-hero")).toHaveAttribute("data-span", "8");
  await expect(page.getByTestId("orientation-card-modes")).toHaveAttribute("data-span", "4");
  await expect(page.getByTestId("orientation-card-learn")).toHaveCSS("background-color", /rgb|oklch/);
  await expect(page.getByTestId("orientation-card-jump")).toHaveCSS("background-color", /rgb|oklch/);
  await expect(page.getByRole("heading", { name: "How Postgres MVCC Works" })).toBeVisible();
  await expect(page.getByText("A reader's map to multi-version concurrency control")).toBeVisible();

  await page.screenshot({ path: "test-results/orientation-bento.png", fullPage: false });
});

test("orientation card actions navigate to their target modes", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/orientation");
  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await waitForReaderHydration(page);

  await page.getByTestId("orientation-card-modes").getByRole("button", { name: /^Guided/ }).click();
  await expect(page).toHaveURL(/#\/guided\/foundations$/);
  await expect(page.locator('[data-view="guided"]')).toBeVisible();

  await page.goto("/#/orientation");
  await page.getByRole("button", { name: /Storage - how versions are stamped/ }).click();
  await expect(page).toHaveURL(/#\/synthesis\/syn-storage$/);

  await page.goto("/#/orientation");
  await page.getByTestId("orientation-card-path").getByRole("button", { name: /01 Foundations/ }).click();
  await expect(page).toHaveURL(/#\/guided\/foundations$/);

  await page.goto("/#/orientation");
  await page.getByRole("button", { name: /MVCC concept/ }).click();
  await expect(page).toHaveURL(/#\/reference\/mvcc$/);

  await page.goto("/#/orientation");
  await page.getByRole("button", { name: /Graph view/ }).click();
  await expect(page).toHaveURL(/#\/graph\/atlas$/);
});
