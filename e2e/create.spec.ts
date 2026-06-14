import { test, expect } from "@playwright/test";

const MOCK_WORD = {
  word: "serendipity",
  phonetic: "/ˌsɛrənˈdɪpɪti/",
  cefr: "C2",
  senses: [
    {
      partOfSpeech: "noun",
      definition: "The occurrence of happy events by chance.",
      examples: ["They met by pure serendipity."],
    },
  ],
  synonyms: ["chance", "fluke"],
  antonyms: ["misfortune"],
  mnemonic: "Serene + dip — a lucky, calm dip into fortune.",
};

test("AI generation previews a card and adds it to a deck", async ({ page }) => {
  // Mock the AI route so the test is deterministic and needs no API key.
  await page.route("**/api/generate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ word: MOCK_WORD }),
    }),
  );

  await page.goto("/dashboard");
  await page.getByRole("heading", { name: /ready to review/i }).waitFor({
    timeout: 15_000,
  });

  await page.goto("/create");
  await page.getByPlaceholder(/Type any English word/i).fill("serendipity");
  await page.getByRole("button", { name: "Generate" }).click();

  // Preview renders the generated word.
  await expect(page.getByText(MOCK_WORD.senses[0].definition)).toBeVisible();

  await page.getByRole("button", { name: /Add to deck/i }).click();

  // Success toast confirms the save.
  await expect(page.getByText(/Added "serendipity"/i)).toBeVisible();
});
