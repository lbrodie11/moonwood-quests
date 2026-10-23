import { expect, test, type Page } from "@playwright/test";

/** Reads the equation display from the accessible panel and returns the correct numeric answer. */
async function correctAnswer(page: Page): Promise<number> {
  const text = ((await page.getByTestId("equation").textContent()) ?? "").trim();

  // Place value: "1 tens + 4 ones = ?"
  const tensOnesMatch = text.match(/(\d+)\s+tens\s*\+\s*(\d+)\s+ones/);
  if (tensOnesMatch) {
    return Number(tensOnesMatch[1]) * 10 + Number(tensOnesMatch[2]);
  }

  // Star-patterns: "2 → 4 → 6 → ?"
  const patternMatch = text.match(/(\d+)\s*→\s*(\d+)\s*→\s*(\d+)\s*→\s*\?/);
  if (patternMatch) {
    const a = Number(patternMatch[1]);
    const b = Number(patternMatch[2]);
    const c = Number(patternMatch[3]);
    return c + (b - a);
  }

  // Phonics-words: "🌙 M - OO - N = ?" -> match the choice button containing the blended word
  if (text.includes(" - ") && text.endsWith("= ?")) {
    const lettersOnly = text.replace(/[^A-ZÁÉÍÓÚÑ]/g, "");
    const choices = await page.locator(".choice").evaluateAll((els) =>
      els.map((el) => ({
        value: Number(el.getAttribute("data-value")),
        label: (el.textContent ?? "").toUpperCase(),
      })),
    );
    const matched = choices.find((c) => c.label.includes(lettersOnly));
    if (matched) return matched.value;
  }

  // Addition, subtraction, length tiles, shape shards: "7 + 5 = ?" or "8 tiles - 3 tiles = ?"
  const match = text.match(/(\d+)(?:\s+[a-z]+)?\s*([+-])\s*(\d+)/i);
  if (!match) throw new Error(`Unrecognised equation: ${text}`);
  const [, a, op, b] = match;
  return op === "+" ? Number(a) + Number(b) : Number(a) - Number(b);
}

async function answer(page: Page, value: number): Promise<void> {
  await page.locator(`.choice[data-value="${value}"]`).click();
}

async function startForestQuest(page: Page): Promise<void> {
  await page.goto("/?seed=42");
  await page.locator('[data-quest="forest-gate"]').click();
  await expect(page.getByTestId("challenge-panel")).toBeVisible();
}

async function completeCurrentQuest(page: Page): Promise<void> {
  const firstProgress = (await page.getByTestId("progress").textContent()) ?? "";
  const totalMatch = firstProgress.match(/of\s+(\d+)/);
  const length = totalMatch ? Number(totalMatch[1]) : 5;
  for (let i = 1; i <= length; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of ${length}`);
    await answer(page, await correctAnswer(page));
  }
  await expect(page.getByTestId("quest-complete")).toBeVisible({ timeout: 10_000 });
}

test.beforeEach(async ({ page }) => {
  // Fail on any console error or uncaught exception.
  page.on("pageerror", (error) => {
    throw error;
  });
  page.on("console", (message) => {
    if (message.type() === "error") throw new Error(message.text());
  });
});

test("map lists the first quest as playable and later quests as unavailable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose a quest" })).toBeVisible();
  await expect(page.locator('[data-quest="forest-gate"]')).toBeEnabled();
  await expect(page.locator('[data-quest="crystal-caves"]')).toBeDisabled();
  await expect(page.locator("canvas")).toBeVisible();
});

test("a wrong answer gives a hint and the child can retry", async ({ page }) => {
  await startForestQuest(page);
  const right = await correctAnswer(page);
  const values = await page.locator(".choice").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-value"))));
  const wrong = values.find((v) => v !== right)!;

  await answer(page, wrong);
  await expect(page.getByTestId("feedback")).toContainText("count");
  await expect(page.locator(`.choice[data-value="${wrong}"]`)).toBeDisabled();

  await answer(page, right);
  await expect(page.getByTestId("feedback")).toContainText("glows");
  await expect(page.getByTestId("progress")).toContainText("2 of 6");
});

test("completing the quest unlocks the next region and persists across reloads", async ({ page }) => {
  await startForestQuest(page);

  for (let i = 1; i <= 6; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of 6`);
    await answer(page, await correctAnswer(page));
  }

  await expect(page.getByTestId("quest-complete")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("quest-complete")).toContainText("Moss");
  await page.getByTestId("back-to-map").click();

  await expect(page.locator('[data-quest="forest-gate"]')).toHaveAttribute("data-state", "completed");
  await page.reload();
  await expect(page.locator('[data-quest="forest-gate"]')).toHaveAttribute("data-state", "completed");
});

test("the quest is completable with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startForestQuest(page);
  for (let i = 1; i <= 6; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of 6`);
    await answer(page, await correctAnswer(page));
  }
  await expect(page.getByTestId("quest-complete")).toBeVisible();
});

test("answer controls are keyboard operable", async ({ page }) => {
  await startForestQuest(page);
  const right = await correctAnswer(page);
  await page.locator(`.choice[data-value="${right}"]`).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("feedback")).toContainText("glows");
});

test("grown-ups area is behind a gate and can erase local progress", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-grown-ups").click();
  const gate = page.getByTestId("parent-gate");
  const question = (await gate.locator("label").textContent()) ?? "";
  const [, a, b] = question.match(/(\d+)\s*×\s*(\d+)/) ?? [];

  await gate.locator("input").fill("1");
  await gate.getByRole("button", { name: "Continue" }).click();
  await expect(gate.getByRole("alert")).not.toBeEmpty();

  await gate.locator("input").fill(String(Number(a) * Number(b)));
  await gate.getByRole("button", { name: "Continue" }).click();

  const area = page.getByTestId("parent-area");
  await expect(area).toContainText("sends nothing over the internet");
  await area.getByTestId("erase").click();
  await area.getByTestId("erase").click();
  await expect(area.getByRole("status")).toContainText("erased");
});

test("language can be switched to Spanish", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("open-settings").click();
  await page.getByTestId("settings").getByLabel("Español").check();
  await expect(page.getByRole("heading", { name: "Elige una misión" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-US");
});

test("the game makes no third-party network requests", async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on("request", (request) => origins.add(new URL(request.url()).origin));
  await startForestQuest(page);
  await answer(page, await correctAnswer(page));
  expect([...origins].filter((o) => o !== new URL(baseURL!).origin && !o.startsWith("data:"))).toEqual([]);
});

test("world map exploration lets the player talk to guides and discover star-treasures", async ({ page }) => {
  await page.goto("/?seed=42");
  await expect(page.getByTestId("story-banner")).toBeVisible();
  await expect(page.getByTestId("continue-adventure")).toBeVisible();

  await page.getByTestId("talk-moss").click();
  await expect(page.getByTestId("map-dialogue")).toContainText("Moss");

  await page.getByTestId("treasure-whispering-woods").click();
  await expect(page.getByTestId("map-dialogue")).toContainText("Whispering Star-Seed");
  await expect(page.getByTestId("treasure-whispering-woods")).toHaveClass(/treasure-found/);
});

test("progressive hint button reveals three hint tiers including guided solution", async ({ page }) => {
  await startForestQuest(page);
  const right = await correctAnswer(page);
  const askHint = page.getByTestId("ask-hint");

  await askHint.click();
  await expect(page.getByTestId("feedback")).toContainText("count");

  await askHint.click();
  await expect(page.getByTestId("feedback")).toContainText("row");

  await askHint.click();
  await expect(page.getByTestId("feedback")).toContainText("Guided magic");
  await expect(page.getByTestId("feedback")).toContainText(String(right));
});

test("phonics, patterns, and the Grand Starlight Celebration ending work end-to-end", async ({ page }) => {
  await page.goto("/?seed=42");
  await page.evaluate(() => {
    const progress = {
      schemaVersion: 1,
      lastUpdated: "2026-10-23T00:00:00.000Z",
      unlockedQuestIds: [
        "forest-gate",
        "crystal-caves",
        "ravine-bridge",
        "sigil-temple",
        "starfall-crown",
      ],
      completedQuestIds: [
        "forest-gate",
        "lantern-bridge",
        "moss-grove",
        "crystal-caves",
        "echo-forge",
        "prism-sanctum",
        "ravine-bridge",
        "enchanted-library",
        "sigil-temple",
        "star-observatory",
      ],
      rewardIds: ["friend-moss", "friend-bramble", "friend-luma", "friend-astra"],
      objectives: {},
    };
    window.localStorage.setItem("flg.progress.v1", JSON.stringify(progress));
  });
  await page.reload();

  // Play Region 3 phonics quest: The Living Storybook
  await page.locator('[data-quest="living-storybook"]').click();
  await completeCurrentQuest(page);
  await page.getByTestId("back-to-map").click();

  // Play Region 4 finale quest: The Crown of Starfall
  await page.locator('[data-quest="starfall-crown"]').click();
  await completeCurrentQuest(page);

  // Celebrate button appears right on the finale completion panel and on the map
  await expect(page.getByTestId("celebrate-kingdom")).toBeVisible();
  await page.getByTestId("celebrate-kingdom").click();
  await expect(page.getByTestId("ending-panel")).toBeVisible();
  await expect(page.getByTestId("ending-panel")).toContainText("The Grand Starlight Celebration");
  await page.getByTestId("ending-back-to-map").click();
  await expect(page.getByRole("heading", { name: "Choose a quest" })).toBeVisible();
});
