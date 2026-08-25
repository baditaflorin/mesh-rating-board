import { expect, test, type Page } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
  name: string;
};

async function closeInitiallyOpenSettings(page: Page): Promise<void> {
  const settings = page.getByRole("dialog", { name: "Settings" });
  if (!(await settings.isVisible().catch(() => false))) return;
  const close = settings.getByRole("button", { name: "close" });
  if (await close.isVisible().catch(() => false)) {
    await close.click();
  } else {
    await page.keyboard.press("Escape");
  }
  await expect(settings).toBeHidden();
}

test("the primary room signal is above the fold on a short desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1141, height: 602 });
  await page.goto(`/${pkg.name}/`, { waitUntil: "domcontentloaded" });
  await closeInitiallyOpenSettings(page);

  await expect(page.getByRole("heading", { name: "How is the room feeling?" })).toBeVisible();
  const action = page.getByRole("button", { name: "Rate 3 stars" });
  await expect(action).toBeVisible();

  const box = await action.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? Number.POSITIVE_INFINITY) + (box?.height ?? 0)).toBeLessThanOrEqual(602);
});

test("the mobile board keeps its signal action visible without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/${pkg.name}/`, { waitUntil: "domcontentloaded" });
  await closeInitiallyOpenSettings(page);

  await expect(page.locator(".rating-workspace")).toBeVisible();
  await expect(page.getByRole("button", { name: "Rate 3 stars" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("two peers see the shared average while retaining their own signal", async ({
  browser,
  baseURL,
}) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", {
    storagePrefix: pkg.name,
  });
  try {
    await Promise.all([closeInitiallyOpenSettings(a), closeInitiallyOpenSettings(b)]);
    await a.getByRole("button", { name: "Rate 5 stars" }).click();
    await b.getByRole("button", { name: "Rate 3 stars" }).click();

    await Promise.all([
      expect(a.getByText("4.0")).toBeVisible(),
      expect(b.getByText("4.0")).toBeVisible(),
      expect(a.getByText("2 responses").first()).toBeVisible(),
      expect(b.getByText("2 responses").first()).toBeVisible(),
    ]);
    await expect(a.getByRole("button", { name: "Rate 5 stars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(b.getByRole("button", { name: "Rate 3 stars" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  } finally {
    await cleanup();
  }
});
