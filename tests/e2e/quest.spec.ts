import { expect, test, type Page } from "@playwright/test";

const WORD_BY_ICON: Record<string, string> = {
  "🌙": "MOON",
  "⭐": "STAR",
  "🦉": "OWL",
  "🐸": "FROG",
  "🌲": "TREE",
  "📖": "BOOK",
  "👑": "CROWN",
  "💎": "GEM",
  "🦊": "FOX",
  "🐱": "CAT",
  "☀️": "SUN",
  "🔔": "BELL",
};

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

  // Unknown-number equations (1.OA.D.8):
  // 1) "6 + ? = 10"
  const missingSecond = text.match(/^(\d+)\s*\+\s*\?\s*=\s*(\d+)$/);
  if (missingSecond) {
    return Number(missingSecond[2]) - Number(missingSecond[1]);
  }
  // 2) "? + 4 = 9"
  const missingFirst = text.match(/^\?\s*\+\s*(\d+)\s*=\s*(\d+)$/);
  if (missingFirst) {
    return Number(missingFirst[2]) - Number(missingFirst[1]);
  }
  // 3) "12 - ? = 7"
  const missingSub = text.match(/^(\d+)\s*-\s*\?\s*=\s*(\d+)$/);
  if (missingSub) {
    return Number(missingSub[1]) - Number(missingSub[2]);
  }
  // 4) "8 = ? - 3"
  const reversedMinuend = text.match(/^(\d+)\s*=\s*\?\s*-\s*(\d+)$/);
  if (reversedMinuend) {
    return Number(reversedMinuend[1]) + Number(reversedMinuend[2]);
  }

  // Phonics-words: "🌙 = ?" -> match the word-only choice button ("MOON")
  for (const [icon, word] of Object.entries(WORD_BY_ICON)) {
    if (text.startsWith(icon)) {
      const choices = await page.locator(".choice").evaluateAll((els) =>
        els.map((el) => ({
          value: Number(el.getAttribute("data-value")),
          label: (el.textContent ?? "").trim().toUpperCase(),
        })),
      );
      const matched = choices.find((c) => c.label === word);
      if (matched) return matched.value;
    }
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
  await expect(page.locator('[data-quest="lantern-bridge"]')).toBeDisabled();
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

test("completing the quest unlocks the next quest and persists across reloads", async ({ page }) => {
  await startForestQuest(page);

  for (let i = 1; i <= 6; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of 6`);
    await answer(page, await correctAnswer(page));
  }

  await expect(page.getByTestId("quest-complete")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("quest-complete")).toContainText("Moss");
  await page.getByTestId("back-to-map").click();

  await expect(page.locator('[data-quest="forest-gate"]')).toHaveAttribute("data-state", "completed");
  await expect(page.locator('[data-quest="lantern-bridge"]')).toHaveAttribute("data-state", "available");
  await page.reload();
  await expect(page.locator('[data-quest="forest-gate"]')).toHaveAttribute("data-state", "completed");
  await expect(page.locator('[data-quest="lantern-bridge"]')).toBeEnabled();
});

test("leaving to the map immediately after the final answer still saves quest completion", async ({ page }) => {
  await startForestQuest(page);

  for (let i = 1; i <= 5; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of 6`);
    await answer(page, await correctAnswer(page));
  }
  await expect(page.getByTestId("progress")).toContainText("6 of 6");
  await answer(page, await correctAnswer(page));

  // Immediately leave to the map before the ~2s door/friend celebration finishes
  await page.getByTestId("leave-quest").click();
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

test("answer controls are keyboard operable and focus never falls to body", async ({ page }) => {
  await startForestQuest(page);
  for (let i = 1; i <= 6; i++) {
    await expect(page.getByTestId("progress")).toContainText(`${i} of 6`);
    const right = await correctAnswer(page);
    const choiceBtn = page.locator(`.choice[data-value="${right}"]`);
    if (i === 1) await choiceBtn.focus();
    // Focus must remain inside the challenge panel (never fall to document.body)
    const activeTagAfterShow = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTagAfterShow).not.toBe("BODY");

    await choiceBtn.focus();
    await page.keyboard.press("Enter");
    const activeTagAfterAnswer = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeTagAfterAnswer).not.toBe("BODY");
  }
  await expect(page.getByTestId("quest-complete")).toBeVisible({ timeout: 10_000 });
});

test("grown-ups area is behind a gate and can erase local progress", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("treasure-whispering-woods").click();
  await expect(page.getByTestId("treasure-whispering-woods")).toHaveClass(/treasure-found/);

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
  await area.getByRole("button", { name: "Close" }).click();

  await expect(page.getByTestId("treasure-whispering-woods")).not.toHaveClass(/treasure-found/);
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

test("world map exploration preserves focus and live region when discovering star-treasures", async ({ page }) => {
  await page.goto("/?seed=42");
  await expect(page.getByTestId("story-banner")).toBeVisible();
  await expect(page.getByTestId("continue-adventure")).toBeVisible();

  await page.evaluate(() => {
    const live = document.querySelector('[data-testid="map-dialogue"]');
    (window as unknown as Record<string, unknown>).__liveRegionBefore = live;
  });

  await page.getByTestId("talk-moss").click();
  await expect(page.getByTestId("map-dialogue")).toContainText("Moss");

  const treasureBtn = page.getByTestId("treasure-whispering-woods");
  await treasureBtn.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("map-dialogue")).toContainText("Whispering Star-Seed");
  await expect(treasureBtn).toHaveClass(/treasure-found/);

  // Focus stays on the treasure button and the live region DOM node was updated in place
  const focusPreserved = await page.evaluate(
    () => document.activeElement?.getAttribute("data-testid") === "treasure-whispering-woods",
  );
  const sameLiveRegion = await page.evaluate(
    () => document.querySelector('[data-testid="map-dialogue"]') === (window as unknown as Record<string, unknown>).__liveRegionBefore,
  );
  expect(focusPreserved).toBe(true);
  expect(sameLiveRegion).toBe(true);
});

test("progressive hint button reveals three hint tiers and never drops hint level backwards", async ({ page }) => {
  await startForestQuest(page);
  const right = await correctAnswer(page);
  const values = await page.locator(".choice").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-value"))));
  const wrong = values.find((v) => v !== right)!;
  const askHint = page.getByTestId("ask-hint");

  await askHint.click();
  await expect(page.getByTestId("feedback")).toContainText("count");

  await askHint.click();
  await expect(page.getByTestId("feedback")).toContainText("row");

  // Answering wrong after 2 requested hints advances to Hint 3 ("Guided magic"), never back to Hint 1
  await answer(page, wrong);
  await expect(page.getByTestId("feedback")).toContainText("Guided magic");
  await expect(page.getByTestId("feedback")).toContainText(String(right));
});

test("phonics, patterns, and the Grand Starlight Celebration ending work end-to-end", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?seed=42");
  await page.evaluate(() => {
    const progress = {
      schemaVersion: 1,
      lastUpdated: "2026-10-23T00:00:00.000Z",
      unlockedQuestIds: [
        "forest-gate",
        "lantern-bridge",
        "moss-grove",
        "crystal-caves",
        "echo-forge",
        "prism-sanctum",
        "ravine-bridge",
        "enchanted-library",
        "living-storybook",
        "sigil-temple",
        "star-observatory",
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
      rewardIds: ["companion.moss", "companion.bramble", "companion.luma", "companion.astra"],
      objectives: {},
    };
    window.localStorage.setItem("flg.progress.v1", JSON.stringify(progress));
  });
  await page.reload();

  // Play Region 3 phonics/length quest: The Living Storybook (unlocks starfall-crown via linear graph)
  await page.locator('[data-quest="living-storybook"]').click();
  await completeCurrentQuest(page);
  await expect(page.getByTestId("quest-complete")).toContainText("Treasure earned");
  await page.getByTestId("back-to-map").click();

  // Seed starfall-crown unlocked and play Region 4 finale quest: The Crown of Moonwood
  await page.evaluate(() => {
    const raw = JSON.parse(window.localStorage.getItem("flg.progress.v1") ?? "{}");
    raw.unlockedQuestIds = [...new Set([...(raw.unlockedQuestIds ?? []), "starfall-crown"])];
    window.localStorage.setItem("flg.progress.v1", JSON.stringify(raw));
  });
  await page.reload();
  await page.locator('[data-quest="starfall-crown"]').click();
  await completeCurrentQuest(page);
  await expect(page.getByTestId("quest-complete")).toContainText("Magic restored");

  // Celebrate button appears right on the finale completion panel and on the map
  await expect(page.getByTestId("celebrate-kingdom")).toBeVisible();
  await page.getByTestId("celebrate-kingdom").click();
  await expect(page.getByTestId("ending-panel")).toBeVisible();
  await expect(page.getByTestId("ending-panel")).toContainText("The Grand Starlight Celebration");
  await page.getByTestId("ending-back-to-map").click();
  await expect(page.getByRole("heading", { name: "Choose a quest" })).toBeVisible();
});

test("regional sanctuaries, Storykeeper reading vs. listening modality, assessment mode, and Parent Dashboard evidence work end-to-end", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/?seed=42");

  // 1. All 8 regional sanctuaries are visible on the World Map
  await expect(page.getByTestId("sanctuaries-section")).toBeVisible();
  await expect(page.locator("[data-sanctuary]")).toHaveCount(8);

  // 2. Complete Alchemist's Equation Forge (1.OA.D.8 / NC.1.OA.8)
  await page.locator('[data-sanctuary="equation-alchemy"]').click();
  await expect(page.getByTestId("challenge-panel")).toBeVisible();
  await completeCurrentQuest(page);
  await expect(page.getByTestId("quest-complete")).toContainText("Balanced Alchemy Vial");
  await page.getByTestId("back-to-map").click();

  // 3. Enter Storykeeper Hollow and verify reading vs. listening modality & post-attempt strategy reflection
  await page.locator('[data-sanctuary="storykeeper-hollow"]').click();
  await expect(page.getByTestId("story-passage")).toBeVisible();
  await expect(page.getByTestId("equation")).toHaveText("Story #1");
  await expect(page.getByTestId("strategy-reflection")).toBeHidden();
  await page.getByTestId("listen-story-btn").click();
  await expect(page.getByTestId("listen-story-btn")).toHaveClass(/modality-active/);
  await page.getByTestId("read-myself-btn").click();
  await expect(page.getByTestId("read-myself-btn")).toHaveClass(/modality-active/);

  // Strategy reflection tray appears only after an attempt/hint submission
  await page.getByTestId("ask-hint").click();
  await expect(page.getByTestId("strategy-reflection")).toBeVisible();
  await page.locator(".reflection-card").first().click();
  await expect(page.getByTestId("reflection-thanks")).toContainText("Thank you for sharing your strategy");
  await page.getByTestId("leave-quest").click();

  // 4. Enter Starlight Independent Check and verify hints are disabled in assessment mode
  await page.locator('[data-sanctuary="starlight-check"]').click();
  await expect(page.getByTestId("assessment-banner")).toBeVisible();
  await expect(page.getByTestId("ask-hint")).toBeHidden();
  await page.getByTestId("leave-quest").click();

  // 5. Open Grown-ups Dashboard and verify evidence summary, confidence note, offline recommendations, and JSON export
  await page.getByTestId("open-grown-ups").click();
  const gate = page.getByTestId("parent-gate");
  const question = (await gate.locator("label").textContent()) ?? "";
  const [, a, b] = question.match(/(\d+)\s*×\s*(\d+)/) ?? [];
  await gate.locator("input").fill(String(Number(a) * Number(b)));
  await gate.getByRole("button", { name: "Continue" }).click();

  const area = page.getByTestId("parent-area");
  await expect(area.getByTestId("parent-evidence-summary")).toContainText("1.OA.D.8 (NC.1.OA.8)");
  await expect(area.getByTestId("parent-confidence-note")).toContainText("Provisional mastery requires");
  await expect(area.getByTestId("parent-recommendations")).toBeVisible();

  await area.getByTestId("export-learning-report").click();
  await expect(area.getByTestId("parent-status")).toContainText("Learning report copied");
});
