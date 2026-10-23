/**
 * Injectable randomness. Production uses a seeded PRNG too, so any bug report
 * ("Forest Gate seed 10473 produced an impossible challenge") is reproducible.
 */
export interface RandomSource {
  /** Returns a float in [0, 1). */
  next(): number;
}

/** Small, fast, well-distributed 32-bit PRNG. Not for security. */
export function mulberry32(seed: number): RandomSource {
  let state = seed >>> 0;
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/** Inclusive on both ends. */
export function randomInt(rng: RandomSource, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Invalid integer range ${min}..${max}`);
  }
  return min + Math.floor(rng.next() * (max - min + 1));
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(rng: RandomSource, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** FNV-1a 32-bit hash, for deriving per-quest seeds from strings. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
