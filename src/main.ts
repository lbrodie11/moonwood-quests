import Phaser from "phaser";
import { AppShell } from "./app/AppShell";
import { SettingsRepository, type Settings } from "./app/settings";
import { FIRST_QUEST_ID, loadQuests } from "./content";
import { GameBridge } from "./game/bridge";
import { createGameConfig } from "./game/config";
import { provideServices, type GameServices } from "./game/services";
import { initI18n } from "./i18n";
import { hashString, mulberry32, newSeed } from "./learning/random";
import { LocalProgressRepository } from "./storage/LocalProgressRepository";
import { ProgressStore } from "./storage/ProgressStore";
import "./styles.css";

/**
 * `?seed=123` makes every quest's challenges reproducible — for bug reports,
 * visual regression tests and E2E tests. Without it, play is randomised.
 */
function seedFromUrl(search: string): number {
  const value = Number.parseInt(new URLSearchParams(search).get("seed") ?? "", 10);
  return Number.isFinite(value) ? value : newSeed();
}

async function main(): Promise<void> {
  const settingsRepository = new SettingsRepository();
  let settings: Settings = settingsRepository.load();
  await initI18n(settings.language);

  const quests = loadQuests();
  const progress = await ProgressStore.open(new LocalProgressRepository(), FIRST_QUEST_ID);
  const bridge = new GameBridge();

  const seed = seedFromUrl(location.search);
  let plays = 0;

  const services: GameServices = {
    bridge,
    progress,
    quests,
    rngForQuest: (questId) => mulberry32((seed ^ hashString(questId)) + plays++),
    settings: () => settings,
  };

  new AppShell({
    bridge,
    progress,
    quests,
    settingsRepository,
    getSettings: () => settings,
    setSettings: (next) => (settings = next),
  }).mount();

  const game = new Phaser.Game(createGameConfig((g) => provideServices(g, services)));

  // Pause the simulation when the tab is hidden (battery, and fairness:
  // nothing should happen while the child isn't looking).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) game.loop.sleep();
    else game.loop.wake();
  });
}

main().catch((error: unknown) => {
  console.error(error);
  const panel = document.querySelector("#panel");
  if (panel) panel.textContent = "Something went wrong. Please reload the page.";
});
