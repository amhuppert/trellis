import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function expectInViewport(page: import("@playwright/test").Page, selector: string) {
  await expect
    .poll(async () =>
      page.locator(selector).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.top < window.innerHeight && rect.bottom > 0;
      })
    )
    .toBe(true);
}

async function waitForReaderHydration(page: import("@playwright/test").Page) {
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc")))
    .not.toBeNull();
}

test("load / renders the reader shell and default orientation content", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/");

  await expect(page.getByText("postgres-mvcc")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Sections" })).toBeVisible();
  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "How Postgres MVCC Works" })).toBeVisible();
  await expect(page.getByText("A reader's map to multi-version concurrency control")).toBeVisible();
});

test("guided section hash renders and highlights Foundations", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");

  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expect(page.getByRole("button", { name: /01\s+Foundations/ })).toHaveClass(/is-current-section/);
});

test("subsection click updates hash and scrolls the target into view", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");
  await waitForReaderHydration(page);

  await page.getByRole("button", { name: "What happens on a single UPDATE" }).click();

  await expect(page).toHaveURL(/#\/guided\/foundations\/found-update$/);
  await expectInViewport(page, "#found-update");
});

test("scrolling updates the current subsection highlight", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");
  await waitForReaderHydration(page);

  await page.locator(".trellis-guided-view").evaluate((root) => {
    const target = document.getElementById("found-takeaways");
    if (!target) return;
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    root.scrollTo({ top: root.scrollTop + targetRect.top - rootRect.top - 72, behavior: "auto" });
  });

  await expect(page.getByRole("button", { name: "Key takeaways" })).toHaveClass(/is-current-subsection/);
});

test("section pagination next opens the next section and updates the hash", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");
  await waitForReaderHydration(page);

  await page.getByRole("button", { name: "Next · 02 · Tuple versions →" }).click();

  await expect(page).toHaveURL(/#\/guided\/tuple-versions$/);
  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();
});

test("reload restores a guided section anchor from the hash", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations/found-update");
  await page.reload();

  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await expectInViewport(page, "#found-update");
});

test("clearing hash and localStorage reloads the default state", async ({ page }) => {
  await page.goto("/#/guided/tuple-versions");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/");
  });
  await page.reload();

  await expect(page.locator('[data-view="orientation"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "How Postgres MVCC Works" })).toBeVisible();
});

test("localStorage restores the last position when no hash is present", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/tuple-versions");
  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();

  await page.evaluate(() => window.history.replaceState(null, "", "/"));
  await page.reload();

  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();
});

test("guided shell visual surface matches the linen and paper composition", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/guided/foundations");

  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(244, 242, 236)");
  await expect(page.locator(".trellis-section-header")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".trellis-section-header h1")).toHaveCSS("font-family", /Source Serif 4/);
  await page.screenshot({ path: "test-results/guided-shell.png", fullPage: false });
});
