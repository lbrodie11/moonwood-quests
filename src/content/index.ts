import { QuestSchema, type GuideId, type QuestDefinition, type RegionId } from "./schemas";

import crystalCaves from "./quests/crystal-caves.json";
import echoForge from "./quests/echo-forge.json";
import enchantedLibrary from "./quests/enchanted-library.json";
import forestGate from "./quests/forest-gate.json";
import lanternBridge from "./quests/lantern-bridge.json";
import livingStorybook from "./quests/living-storybook.json";
import mossGrove from "./quests/moss-grove.json";
import prismSanctum from "./quests/prism-sanctum.json";
import ravineBridge from "./quests/ravine-bridge.json";
import sigilTemple from "./quests/sigil-temple.json";
import starObservatory from "./quests/star-observatory.json";
import starfallCrown from "./quests/starfall-crown.json";

/**
 * Quest content is bundled with the game (no runtime fetching) and validated
 * at startup as well as in CI. Order here is campaign order across the four regions.
 */
export const RAW_QUESTS: readonly unknown[] = [
  // Region 1 — Whispering Woods
  forestGate,
  lanternBridge,
  mossGrove,
  // Region 2 — Crystal Caves
  crystalCaves,
  echoForge,
  prismSanctum,
  // Region 3 — The Enchanted Library & Ravine
  ravineBridge,
  enchantedLibrary,
  livingStorybook,
  // Region 4 — Starfall Tower
  sigilTemple,
  starObservatory,
  starfallCrown,
];

export function loadQuests(raw: readonly unknown[] = RAW_QUESTS): QuestDefinition[] {
  return raw.map((entry, i) => {
    const result = QuestSchema.safeParse(entry);
    if (!result.success) {
      throw new Error(`Quest #${i} is invalid: ${result.error.message}`);
    }
    return result.data;
  });
}

/** The first quest is always available; the rest unlock through play. */
export const FIRST_QUEST_ID = "forest-gate";
export const FINAL_QUEST_ID = "starfall-crown";

export interface RegionInfo {
  id: RegionId;
  titleKey: string;
  subtitleKey: string;
  guideId: GuideId;
  guideNameKey: string;
  guideGreetingKey: string;
  treasureId: string;
  treasureNameKey: string;
  treasurePos: { x: number; y: number };
  guidePos: { x: number; y: number };
}

export const REGIONS: readonly RegionInfo[] = [
  {
    id: "whispering-woods",
    titleKey: "region.whisperingWoods.title",
    subtitleKey: "region.whisperingWoods.subtitle",
    guideId: "moss",
    guideNameKey: "guide.moss.name",
    guideGreetingKey: "guide.moss.greeting",
    treasureId: "treasure.whispering-seed",
    treasureNameKey: "reward.whisperingSeed.name",
    treasurePos: { x: 85, y: 445 },
    guidePos: { x: 180, y: 430 },
  },
  {
    id: "crystal-caves",
    titleKey: "region.crystalCaves.title",
    subtitleKey: "region.crystalCaves.subtitle",
    guideId: "bramble",
    guideNameKey: "guide.bramble.name",
    guideGreetingKey: "guide.bramble.greeting",
    treasureId: "treasure.crystal-geode",
    treasureNameKey: "reward.crystalGeode.name",
    treasurePos: { x: 315, y: 145 },
    guidePos: { x: 400, y: 245 },
  },
  {
    id: "enchanted-library",
    titleKey: "region.enchantedLibrary.title",
    subtitleKey: "region.enchantedLibrary.subtitle",
    guideId: "luma",
    guideNameKey: "guide.luma.name",
    guideGreetingKey: "guide.luma.greeting",
    treasureId: "treasure.ancient-bookmark",
    treasureNameKey: "reward.ancientBookmark.name",
    treasurePos: { x: 790, y: 440 },
    guidePos: { x: 625, y: 445 },
  },
  {
    id: "starfall-tower",
    titleKey: "region.starfallTower.title",
    subtitleKey: "region.starfallTower.subtitle",
    guideId: "astra",
    guideNameKey: "guide.astra.name",
    guideGreetingKey: "guide.astra.greeting",
    treasureId: "treasure.fallen-star",
    treasureNameKey: "reward.fallenStar.name",
    treasurePos: { x: 910, y: 170 },
    guidePos: { x: 760, y: 235 },
  },
];
