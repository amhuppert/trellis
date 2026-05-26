import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function waitForReaderHydration(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc")))
    .not.toBeNull();
}

test("synthesis route renders the root node", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/synthesis");
  await waitForReaderHydration(page);

  await expect(page.getByRole("heading", { name: "MVCC as a contract between writers and readers" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Synthesis breadcrumbs" })).toBeVisible();
  await expect(page.getByText("COMMON STRUCTURE")).toBeVisible();
});

test("focused synthesis route supports child, breadcrumb, and reference navigation", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/synthesis/syn-root");
  await waitForReaderHydration(page);

  await page.getByRole("button", { name: /Storage - how versions are stamped/ }).click();
  await expect(page).toHaveURL(/#\/synthesis\/syn-storage$/);
  await expect(page.getByRole("heading", { name: "Storage - how versions are stamped" })).toBeVisible();
  await expect(page.getByRole("button", { name: "MVCC as a contract between writers and readers" })).toBeVisible();

  await page.getByRole("button", { name: /section §02 · Tuple versions/ }).click();
  await expect(page).toHaveURL(/#\/guided\/tuple-versions\/tv-cols$/);
  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();

  await page.goto("/#/synthesis/syn-storage");
  await page.getByRole("button", { name: /entity xmin/ }).click();
  await expect(page).toHaveURL(/#\/reference\/xmin$/);
  await expect(page.getByRole("heading", { name: "xmin" })).toBeVisible();
});

test("NavPanel synthesis tab renders the flattened tree and opens focused nodes", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/synthesis/syn-root");
  await waitForReaderHydration(page);

  await page.getByRole("tab", { name: "Synthesis" }).click();
  await expect(page.getByRole("button", { name: /L0 MVCC as a contract between writers and readers/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /L1 Visibility - how snapshots decide what counts/ })).toBeVisible();

  await page.getByRole("button", { name: /L1 Visibility - how snapshots decide what counts/ }).click();
  await expect(page).toHaveURL(/#\/synthesis\/syn-visibility$/);
  await expect(page.getByRole("heading", { name: "Visibility - how snapshots decide what counts" })).toBeVisible();
  await expect(page.getByRole("button", { name: /L1 Visibility - how snapshots decide what counts/ })).toHaveClass(/is-current-synthesis/);
});

test("synthesis visual surface uses prototype typography and level colors", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/synthesis/syn-root");
  await waitForReaderHydration(page);

  await expect(page.locator(".trellis-synthesis-view")).toHaveCSS("background-color", "rgb(244, 242, 236)");
  await expect(page.locator(".trellis-synthesis-title")).toHaveCSS("font-family", /Source Serif 4/);
  await expect(page.locator(".trellis-synthesis-level")).toHaveText(/L0/);
  await page.screenshot({ path: "test-results/synthesis-view.png", fullPage: false });
});
