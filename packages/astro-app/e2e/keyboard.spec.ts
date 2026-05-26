import { expect, test } from "@playwright/test";

async function clearReaderState(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
}

async function expectView(page: import("@playwright/test").Page, view: string) {
  await expect(page.locator(`[data-view="${view}"]`)).toBeVisible();
}

test("global keyboard shortcuts switch modes and move guided sections", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/");
  await expectView(page, "orientation");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("trellis:postgres-mvcc"))).not.toBeNull();
  await page.locator('[data-view="orientation"]').click({ position: { x: 8, y: 8 } });

  await page.keyboard.press("G");
  await expectView(page, "guided");
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();

  await page.keyboard.press("]");
  await expect(page.getByRole("heading", { name: "Tuple versions" })).toBeVisible();

  await page.keyboard.press("[");
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();

  await page.keyboard.press("R");
  await expectView(page, "reference");

  await page.keyboard.press("S");
  await expectView(page, "synthesis");

  await page.keyboard.press("K");
  await expectView(page, "graph");
  await expect(page).toHaveURL(/#\/graph\/atlas$/);

  await page.keyboard.press("O");
  await expectView(page, "orientation");
});

test("shortcuts are suppressed in editable targets and Cmd/Ctrl+K is reserved", async ({ page }) => {
  await clearReaderState(page);
  await page.goto("/#/orientation");
  await expectView(page, "orientation");

  await page.evaluate(() => {
    const input = document.createElement("input");
    input.setAttribute("aria-label", "Shortcut input");
    document.body.append(input);
  });

  await page.getByLabel("Shortcut input").focus();
  await page.keyboard.press("R");
  await expectView(page, "orientation");

  await page.locator("body").focus();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await expectView(page, "orientation");
});
