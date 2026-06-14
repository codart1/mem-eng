import { test, expect } from "@playwright/test";

test.describe("study flow", () => {
  test("seeds a starter deck and shows due cards on the dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // Seeding runs on first load; the hero reflects the queued cards.
    await expect(
      page.getByRole("heading", { name: /ready to review/i }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("reveals a card, rates it, and advances", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("heading", { name: /ready to review/i }).waitFor({
      timeout: 15_000,
    });

    await page.goto("/study");

    // Front of the card → reveal.
    await page.getByRole("button", { name: "Show answer" }).click();

    // Rating buttons appear with interval previews.
    const good = page.getByRole("button", { name: /^Good/ });
    await expect(good).toBeVisible();

    const remainingBefore = await page.getByText(/\d+ left/).textContent();
    await good.click();

    // After rating, the answer is hidden again for the next card.
    await expect(page.getByRole("button", { name: "Show answer" })).toBeVisible();
    const remainingAfter = await page.getByText(/\d+ left/).textContent();
    expect(remainingAfter).not.toEqual(remainingBefore);
  });
});
