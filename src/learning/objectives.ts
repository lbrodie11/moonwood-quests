/**
 * Grade 1 mathematics, structured literacy, reading comprehension, vocabulary,
 * writing/encoding, logical reasoning, foundational science, and creative
 * construction objectives for the Moonwood campaign.
 */
export const OBJECTIVE_IDS = [
  "add-within-20",
  "subtract-within-20",
  "unknown-number-equations",
  "tens-and-ones",
  "compare-lengths",
  "compose-shapes",
  "phonics-words",
  "star-patterns",
  "reading-comprehension",
  "vocabulary-oral",
  "spelling-writing",
  "logical-reasoning",
  "science-nature",
  "creative-construction",
] as const;

export type ObjectiveId = (typeof OBJECTIVE_IDS)[number];

export type Difficulty = 1 | 2 | 3 | 4;

export type LearningDomain =
  | "mathematics"
  | "foundational-reading"
  | "reading-comprehension"
  | "vocabulary-oral"
  | "writing-spelling"
  | "reasoning-metacognition"
  | "science-knowledge"
  | "creative-construction";

export type FantasyMechanic =
  | "spell-crafting"
  | "equation-alchemy"
  | "rune-inventory"
  | "bridge-builder"
  | "ancient-sigils"
  | "story-pages"
  | "star-patterns"
  | "storykeeper-quests"
  | "creature-conversations"
  | "rune-journal"
  | "wizards-workshop"
  | "naturekeeper-quests"
  | "moonwood-workshop";

export interface ObjectiveInfo {
  id: ObjectiveId;
  /** Primary Common Core / NGSS code for quick display; full versioned mappings live in `curriculum/standards.ts`. */
  standard: string;
  /** North Carolina Standard Course of Study code. */
  ncStandard: string;
  domain: LearningDomain;
  /** Fantasy mechanic this objective is taught through. */
  mechanic: FantasyMechanic;
  /** Prerequisite objectives in the skill graph. */
  prerequisites: readonly ObjectiveId[];
  /** Whether this objective is an enrichment/extension objective beyond core Grade 1 standards. */
  isEnrichment?: boolean;
}

export const OBJECTIVES: Readonly<Record<ObjectiveId, ObjectiveInfo>> = {
  "add-within-20": {
    id: "add-within-20",
    standard: "1.OA.C.6",
    ncStandard: "NC.1.OA.6",
    domain: "mathematics",
    mechanic: "spell-crafting",
    prerequisites: [],
  },
  "subtract-within-20": {
    id: "subtract-within-20",
    standard: "1.OA.C.6",
    ncStandard: "NC.1.OA.6",
    domain: "mathematics",
    mechanic: "spell-crafting",
    prerequisites: ["add-within-20"],
  },
  "unknown-number-equations": {
    id: "unknown-number-equations",
    standard: "1.OA.D.8",
    ncStandard: "NC.1.OA.8",
    domain: "mathematics",
    mechanic: "equation-alchemy",
    prerequisites: ["add-within-20", "subtract-within-20"],
  },
  "tens-and-ones": {
    id: "tens-and-ones",
    standard: "1.NBT.B.2",
    ncStandard: "NC.1.NBT.2",
    domain: "mathematics",
    mechanic: "rune-inventory",
    prerequisites: ["add-within-20"],
  },
  "compare-lengths": {
    id: "compare-lengths",
    standard: "1.MD.A.2",
    ncStandard: "NC.1.MD.2",
    domain: "mathematics",
    mechanic: "bridge-builder",
    prerequisites: ["add-within-20"],
  },
  "compose-shapes": {
    id: "compose-shapes",
    standard: "1.G.A.2",
    ncStandard: "NC.1.G.2",
    domain: "mathematics",
    mechanic: "ancient-sigils",
    prerequisites: [],
  },
  "phonics-words": {
    id: "phonics-words",
    standard: "RF.1.3",
    ncStandard: "RF.1.3",
    domain: "foundational-reading",
    mechanic: "story-pages",
    prerequisites: [],
  },
  "star-patterns": {
    id: "star-patterns",
    standard: "1.NBT.A.1",
    ncStandard: "NC.1.NBT.1",
    domain: "mathematics",
    mechanic: "star-patterns",
    prerequisites: ["add-within-20", "tens-and-ones"],
    isEnrichment: true,
  },
  "reading-comprehension": {
    id: "reading-comprehension",
    standard: "RL.1.1",
    ncStandard: "RL.1.1",
    domain: "reading-comprehension",
    mechanic: "storykeeper-quests",
    prerequisites: ["phonics-words"],
  },
  "vocabulary-oral": {
    id: "vocabulary-oral",
    standard: "L.1.5",
    ncStandard: "L.1.5",
    domain: "vocabulary-oral",
    mechanic: "creature-conversations",
    prerequisites: [],
  },
  "spelling-writing": {
    id: "spelling-writing",
    standard: "L.1.2",
    ncStandard: "L.1.2",
    domain: "writing-spelling",
    mechanic: "rune-journal",
    prerequisites: ["phonics-words"],
  },
  "logical-reasoning": {
    id: "logical-reasoning",
    standard: "MP.1",
    ncStandard: "NC.1.OA.1",
    domain: "reasoning-metacognition",
    mechanic: "wizards-workshop",
    prerequisites: ["add-within-20"],
  },
  "science-nature": {
    id: "science-nature",
    standard: "K-LS1-1",
    ncStandard: "1-ESS1-2",
    domain: "science-knowledge",
    mechanic: "naturekeeper-quests",
    prerequisites: [],
  },
  "creative-construction": {
    id: "creative-construction",
    standard: "1.G.A.2",
    ncStandard: "NC.1.G.2",
    domain: "creative-construction",
    mechanic: "moonwood-workshop",
    prerequisites: ["compose-shapes", "compare-lengths"],
  },
};

export function clampDifficulty(value: number): Difficulty {
  return Math.min(4, Math.max(1, Math.round(value))) as Difficulty;
}
