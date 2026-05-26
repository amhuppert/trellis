import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function waitForReaderHydration(page: import("@playwright/test").Page) {
  await expect
    .poll(async () => {
      try {
        return await page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc"));
      } catch {
        return null;
      }
    })
    .not.toBeNull();
}

test("reference hash renders entities by default", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/reference");
  await waitForReaderHydration(page);

  await expect(page.getByRole("heading", { name: "Glossary & sources" })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Entities · \d+/ })).toHaveAttribute("data-state", "active");
  await expect(page.getByRole("button", { name: "snapshot concept" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Section context" })).toHaveCount(0);
});

test("focused reference hash highlights snapshot and shows relationships", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/reference/snapshot");
  await waitForReaderHydration(page);

  const snapshotCard = page.getByRole("button", { name: "snapshot concept" }).locator("> div");
  await expect(snapshotCard).toHaveClass(/bg-coral-bg/);
  await expect(page.getByRole("heading", { name: "snapshot" })).toBeVisible();
  await expect(page.getByText("Relationships")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open 03 · Snapshots" })).toBeVisible();
  await expect(page.getByRole("button", { name: "contains → xip list" })).toBeVisible();
});

test("open primary section deep-links to guided", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/reference/snapshot");
  await waitForReaderHydration(page);

  await page.getByRole("button", { name: "Open 03 · Snapshots" }).click();

  await expect(page).toHaveURL(/#\/guided\/snapshots$/);
  await expect(page.getByRole("heading", { name: "Snapshots" })).toBeVisible();
});

test("sources tab renders url, code, doc, and passage sublines", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/reference");
  await waitForReaderHydration(page);

  await page.getByRole("tab", { name: /Sources · \d+/ }).click();

  await expect(page.getByText("postgresql.org").first()).toBeVisible();
  await expect(page.getByText("src/backend/access/heap/heapam.c:120-180")).toBeVisible();
  await expect(page.getByText("RDBMS textbook, ch. 4 · Chapter 4")).toBeVisible();
  await expect(page.getByText("momjian · slide 18")).toBeVisible();
});

test("guided right rail opens related entities in reference mode", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");
  await waitForReaderHydration(page);

  const rail = page.getByRole("complementary", { name: "Section context" });
  await expect(rail).toBeVisible();
  await expect(rail.getByText("RELATED ENTITIES")).toBeVisible();

  await rail.getByRole("button", { name: "snapshot concept" }).click();

  await expect(page).toHaveURL(/#\/reference\/snapshot$/);
  await expect(page.getByRole("heading", { name: "snapshot" })).toBeVisible();
});
