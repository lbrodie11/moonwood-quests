/**
 * Grade 1 mathematics and early-literacy objectives for the Moonwood campaign.
 * Each maps to one reusable fantasy mechanic (see README "Curriculum map").
 */
export const OBJECTIVE_IDS = [
  "add-within-20",
  "subtract-within-20",
  "tens-and-ones",
  "compare-lengths",
  "compose-shapes",
  "phonics-words",
  "star-patterns",
] as const;

export type ObjectiveId = (typeof OBJECTIVE_IDS)[number];

export type Difficulty = 1 | 2 | 3 | 4;

export interface ObjectiveInfo {
  id: ObjectiveId;
  /** Common Core State Standards code, for educator review and parent reports. */
  standard: string;
  /** Fantasy mechanic this objective is taught through. */
  mechanic:
    | "spell-crafting"
    | "rune-inventory"
    | "bridge-builder"
    | "ancient-sigils"
    | "story-pages"
    | "star-patterns";
}

export const OBJECTIVES: Readonly<Record<ObjectiveId, ObjectiveInfo>> = {
  "add-within-20": { id: "add-within-20", standard: "1.OA.C.6", mechanic: "spell-crafting" },
  "subtract-within-20": { id: "subtract-within-20", standard: "1.OA.C.6", mechanic: "spell-crafting" },
  "tens-and-ones": { id: "tens-and-ones", standard: "1.NBT.B.2", mechanic: "rune-inventory" },
  "compare-lengths": { id: "compare-lengths", standard: "1.MD.A.1", mechanic: "bridge-builder" },
  "compose-shapes": { id: "compose-shapes", standard: "1.G.A.2", mechanic: "ancient-sigils" },
  "phonics-words": { id: "phonics-words", standard: "RF.1.3", mechanic: "story-pages" },
  "star-patterns": { id: "star-patterns", standard: "1.OA.D.8", mechanic: "star-patterns" },
};

export function clampDifficulty(value: number): Difficulty {
  return Math.min(4, Math.max(1, Math.round(value))) as Difficulty;
}
