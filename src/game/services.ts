import type Phaser from "phaser";
import type { Settings } from "../app/settings";
import type { QuestDefinition } from "../content/schemas";
import type { RandomSource } from "../learning/random";
import type { ProgressStore } from "../storage/ProgressStore";
import type { GameBridge } from "./bridge";

/**
 * Everything scenes depend on, injected once through the game registry.
 * Scenes never reach for globals, localStorage or the DOM directly.
 */
export interface GameServices {
  bridge: GameBridge;
  progress: ProgressStore;
  quests: readonly QuestDefinition[];
  rngForQuest: (questId: string) => RandomSource;
  settings: () => Settings;
}

const KEY = "services";

export function provideServices(game: Phaser.Game, services: GameServices): void {
  game.registry.set(KEY, services);
}

export function servicesOf(scene: Phaser.Scene): GameServices {
  const services = scene.registry.get(KEY) as GameServices | undefined;
  if (!services) throw new Error("GameServices not provided");
  return services;
}
