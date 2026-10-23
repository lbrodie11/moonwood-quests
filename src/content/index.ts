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

/**
 * Always-open regional learning sanctuaries, workshops, and low-stress independent
 * checks integrated into the four regions of Moonwood (Phases 5–10 & 12).
 * Children can visit these at any time without being locked out by campaign progress.
 */
export const SANCTUARY_ACTIVITIES: readonly QuestDefinition[] = [
  {
    id: "storykeeper-hollow",
    status: "playable",
    regionId: "whispering-woods",
    guideId: "moss",
    titleKey: "quest.storykeeperHollow.title",
    introKey: "quest.storykeeperHollow.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["reading-comprehension"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "story.storykeeper-leaf", kind: "story", nameKey: "reward.storykeeperLeaf.name" }],
    unlocks: [],
    map: { x: 155, y: 470 },
    isSanctuary: true,
  },
  {
    id: "naturekeeper-glade",
    status: "playable",
    regionId: "whispering-woods",
    guideId: "moss",
    titleKey: "quest.naturekeeperGlade.title",
    introKey: "quest.naturekeeperGlade.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["science-nature"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "cosmetic.nature-sprout", kind: "cosmetic", nameKey: "reward.natureSprout.name" }],
    unlocks: [],
    map: { x: 265, y: 465 },
    isSanctuary: true,
  },
  {
    id: "equation-alchemy",
    status: "playable",
    regionId: "crystal-caves",
    guideId: "bramble",
    titleKey: "quest.equationAlchemy.title",
    introKey: "quest.equationAlchemy.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["unknown-number-equations"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "cosmetic.alchemy-vial", kind: "cosmetic", nameKey: "reward.alchemyVial.name" }],
    unlocks: [],
    map: { x: 220, y: 125 },
    isSanctuary: true,
  },
  {
    id: "creature-cavern",
    status: "playable",
    regionId: "crystal-caves",
    guideId: "bramble",
    titleKey: "quest.creatureCavern.title",
    introKey: "quest.creatureCavern.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["vocabulary-oral"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "story.echo-glossary", kind: "story", nameKey: "reward.echoGlossary.name" }],
    unlocks: [],
    map: { x: 465, y: 135 },
    isSanctuary: true,
  },
  {
    id: "rune-journal-desk",
    status: "playable",
    regionId: "enchanted-library",
    guideId: "luma",
    titleKey: "quest.runeJournalDesk.title",
    introKey: "quest.runeJournalDesk.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["spelling-writing"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "cosmetic.golden-quill", kind: "cosmetic", nameKey: "reward.goldenQuill.name" }],
    unlocks: [],
    map: { x: 685, y: 475 },
    isSanctuary: true,
  },
  {
    id: "wizards-workshop",
    status: "playable",
    regionId: "starfall-tower",
    guideId: "astra",
    titleKey: "quest.wizardsWorkshop.title",
    introKey: "quest.wizardsWorkshop.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["logical-reasoning"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "cosmetic.wizard-compass", kind: "cosmetic", nameKey: "reward.wizardCompass.name" }],
    unlocks: [],
    map: { x: 655, y: 120 },
    isSanctuary: true,
  },
  {
    id: "moonwood-workshop",
    status: "playable",
    regionId: "starfall-tower",
    guideId: "astra",
    titleKey: "quest.moonwoodWorkshop.title",
    introKey: "quest.moonwoodWorkshop.intro",
    sceneKey: "ForestQuest",
    objectiveIds: ["creative-construction"],
    recommendedMinutes: 6,
    phases: [
      { kind: "guided", count: 1, difficultyCap: 1 },
      { kind: "independent", count: 2 },
      { kind: "mini-boss", count: 1, difficultyFloor: 2 },
    ],
    rewards: [{ id: "cosmetic.builder-blueprint", kind: "cosmetic", nameKey: "reward.builderBlueprint.name" }],
    unlocks: [],
    map: { x: 785, y: 115 },
    isSanctuary: true,
  },
  {
    id: "starlight-check",
    status: "playable",
    regionId: "starfall-tower",
    guideId: "astra",
    titleKey: "quest.starlightCheck.title",
    introKey: "quest.starlightCheck.intro",
    sceneKey: "ForestQuest",
    objectiveIds: [
      "add-within-20",
      "unknown-number-equations",
      "tens-and-ones",
      "phonics-words",
    ],
    recommendedMinutes: 5,
    phases: [{ kind: "independent", count: 4 }],
    rewards: [{ id: "story.starlight-badge", kind: "story", nameKey: "reward.starlightBadge.name" }],
    unlocks: [],
    map: { x: 890, y: 245 },
    assessmentMode: "independent-check",
    isSanctuary: true,
  },
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

export function findQuestOrSanctuary(
  questId: string,
  campaignQuests: readonly QuestDefinition[],
): QuestDefinition | undefined {
  return (
    campaignQuests.find((q) => q.id === questId) ??
    SANCTUARY_ACTIVITIES.find((s) => s.id === questId)
  );
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
