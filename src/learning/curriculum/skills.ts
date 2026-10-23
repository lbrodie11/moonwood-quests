import type { LearningStage } from "../challenge";
import { OBJECTIVES, OBJECTIVE_IDS, type LearningDomain, type ObjectiveId } from "../objectives";
import { standardsForObjective, type StandardMapping } from "./standards";

export interface SkillDefinition {
  id: ObjectiveId;
  domain: LearningDomain;
  prerequisites: readonly ObjectiveId[];
  stages: readonly LearningStage[];
  itemFamilies: readonly string[];
  standards: readonly StandardMapping[];
  isEnrichment: boolean;
  /** Minimum independent attempts across distinct item families before provisional mastery. */
  minIndependentAttempts: number;
  /** Minimum distinct item families required for provisional mastery. */
  minDistinctFamilies: number;
}

export const LEARNING_STAGES: readonly LearningStage[] = [
  "modeling",
  "guided",
  "independent",
  "transfer",
  "retention",
] as const;

const ITEM_FAMILIES_BY_OBJECTIVE: Readonly<Record<ObjectiveId, readonly string[]>> = {
  "add-within-20": [
    "fluency-within-10",
    "counting-on-addition",
    "doubles-near-doubles",
    "make-ten-addition",
  ],
  "subtract-within-20": [
    "take-from-within-10",
    "think-addition-for-subtraction",
    "decompose-to-ten-subtraction",
    "compare-difference-within-20",
  ],
  "unknown-number-equations": [
    "missing-second-addend",
    "missing-first-addend",
    "missing-subtrahend",
    "missing-minuend-reversed-equals",
  ],
  "tens-and-ones": [
    "bundle-ten-ones",
    "compose-two-digit-tens-ones",
    "decompose-two-digit-number",
    "compare-two-digit-numbers",
    "extended-bundle-count-above-99",
  ],
  "compare-lengths": [
    "measure-end-to-end-unit-tiles",
    "order-three-objects-by-length",
    "indirect-length-comparison-via-reference",
    "identify-invalid-gap-or-overlap-measurement",
  ],
  "compose-shapes": [
    "identify-defining-vs-nondefining-attributes",
    "compose-2d-composite-shape",
    "partition-halves-and-fourths",
    "interactive-sigil-tile-placement",
  ],
  "phonics-words": [
    "sound-recognition",
    "sound-blending",
    "phoneme-segmentation",
    "word-building",
    "decoding",
    "connected-reading",
  ],
  "star-patterns": [
    "step-by-1-sequence",
    "step-by-2-sequence",
    "step-by-5-sequence",
    "step-by-10-sequence",
  ],
  "reading-comprehension": [
    "literal-detail-comprehension",
    "story-sequencing",
    "cause-and-effect",
    "character-and-main-idea",
    "simple-inference-and-prediction",
  ],
  "vocabulary-oral": [
    "word-meaning-in-context",
    "category-sorting",
    "synonym-antonym-comparison",
    "parent-assisted-oral-explanation",
  ],
  "spelling-writing": [
    "letter-tile-encoding",
    "sentence-ordering",
    "capitalization-and-end-punctuation",
    "creative-writing-starter",
  ],
  "logical-reasoning": [
    "deductive-rule-elimination",
    "multi-step-path-planning",
    "hypothesis-testing",
    "metacognitive-strategy-reflection",
  ],
  "science-nature": [
    "habitat-matching",
    "plant-needs-and-lifecycle",
    "living-vs-nonliving",
    "seasons-and-materials",
    "magic-vs-real-science",
  ],
  "creative-construction": [
    "bridge-span-design",
    "creature-habitat-design",
    "magical-tower-composition",
    "pattern-stone-mosaic",
  ],
};

export const SKILLS_GRAPH: Readonly<Record<ObjectiveId, SkillDefinition>> = Object.fromEntries(
  OBJECTIVE_IDS.map((id) => {
    const info = OBJECTIVES[id];
    return [
      id,
      {
        id,
        domain: info.domain,
        prerequisites: info.prerequisites,
        stages: LEARNING_STAGES,
        itemFamilies: ITEM_FAMILIES_BY_OBJECTIVE[id],
        standards: standardsForObjective(id),
        isEnrichment: Boolean(info.isEnrichment),
        minIndependentAttempts: 5,
        minDistinctFamilies: 3,
      } satisfies SkillDefinition,
    ];
  }),
) as unknown as Readonly<Record<ObjectiveId, SkillDefinition>>;

/**
 * Checks whether all prerequisites of a skill have either:
 * - Reached at least guided/independent evidence (`independentSuccesses >= 2`), OR
 * - Been satisfied via diagnostic placement (`placedSkills`).
 */
export function arePrerequisitesMet(
  skillId: ObjectiveId,
  evidenceSummary: Readonly<Partial<Record<ObjectiveId, { independentSuccesses: number }>>>,
  placedSkills: readonly ObjectiveId[] = [],
): boolean {
  if (placedSkills.includes(skillId)) return true;
  const def = SKILLS_GRAPH[skillId];
  for (const prereq of def.prerequisites) {
    if (placedSkills.includes(prereq)) continue;
    const state = evidenceSummary[prereq];
    if (!state || state.independentSuccesses < 2) {
      return false;
    }
  }
  return true;
}

/**
 * Returns the first unmet prerequisite for scaffolding so a child is never
 * permanently locked out of playing a quest, or `null` if all prerequisites are met.
 */
export function firstUnmetPrerequisite(
  skillId: ObjectiveId,
  evidenceSummary: Readonly<Partial<Record<ObjectiveId, { independentSuccesses: number }>>>,
  placedSkills: readonly ObjectiveId[] = [],
): ObjectiveId | null {
  if (placedSkills.includes(skillId)) return null;
  const def = SKILLS_GRAPH[skillId];
  for (const prereq of def.prerequisites) {
    if (placedSkills.includes(prereq)) continue;
    const state = evidenceSummary[prereq];
    if (!state || state.independentSuccesses < 2) {
      return prereq;
    }
  }
  return null;
}

/** Validates that the skill prerequisite graph is acyclic and all references exist. */
export function validateSkillGraph(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const validIds = new Set<string>(OBJECTIVE_IDS);

  for (const id of OBJECTIVE_IDS) {
    const def = SKILLS_GRAPH[id];
    if (!def) {
      errors.push(`Missing skill definition for ${id}`);
      continue;
    }
    if (def.itemFamilies.length < 3) {
      errors.push(`Skill ${id} must define at least 3 distinct item families`);
    }
    if (def.standards.length === 0) {
      errors.push(`Skill ${id} has no mapped standards`);
    }
    for (const prereq of def.prerequisites) {
      if (!validIds.has(prereq)) {
        errors.push(`Skill ${id} references unknown prerequisite ${prereq}`);
      }
      if (prereq === id) {
        errors.push(`Skill ${id} lists itself as a prerequisite`);
      }
    }
  }

  // Cycle detection via DFS
  const visiting = new Set<ObjectiveId>();
  const visited = new Set<ObjectiveId>();

  const dfs = (node: ObjectiveId): void => {
    if (visiting.has(node)) {
      errors.push(`Cycle detected in skill prerequisite graph at ${node}`);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const p of SKILLS_GRAPH[node].prerequisites) {
      dfs(p);
    }
    visiting.delete(node);
    visited.add(node);
  };

  for (const id of OBJECTIVE_IDS) {
    dfs(id);
  }

  return { valid: errors.length === 0, errors };
}
