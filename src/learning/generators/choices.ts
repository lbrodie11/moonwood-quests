import { randomInt, shuffle, type RandomSource } from "../random";

export interface ChoiceOptions {
  min: number;
  max: number;
  /** Total choices shown, including the answer. Three is plenty at this age. */
  count?: number;
  /**
   * Distractors that reflect real misconceptions (off-by-one counting,
   * wrong operation, swapped digits). Used first, if in range.
   */
  likelyErrors?: readonly number[];
}

/**
 * Builds a shuffled set of unique choices that always contains the answer.
 * Deterministic for a given RandomSource.
 */
export function buildChoices(rng: RandomSource, answer: number, options: ChoiceOptions): number[] {
  const { min, max, count = 3, likelyErrors = [] } = options;
  if (answer < min || answer > max) {
    throw new RangeError(`Answer ${answer} outside choice range ${min}..${max}`);
  }
  if (max - min + 1 < count) {
    throw new RangeError(`Range ${min}..${max} cannot hold ${count} unique choices`);
  }

  const inRange = (n: number) => Number.isInteger(n) && n >= min && n <= max && n !== answer;
  const distractors = new Set<number>();

  for (const candidate of shuffle(rng, likelyErrors)) {
    if (distractors.size >= count - 1) break;
    if (inRange(candidate)) distractors.add(candidate);
  }

  // Near misses next; bounded attempts, then a deterministic sweep.
  for (let tries = 0; distractors.size < count - 1 && tries < 30; tries++) {
    const candidate = answer + randomInt(rng, -3, 3);
    if (inRange(candidate)) distractors.add(candidate);
  }
  for (let n = min; distractors.size < count - 1 && n <= max; n++) {
    if (inRange(n)) distractors.add(n);
  }

  return shuffle(rng, [answer, ...distractors]);
}
