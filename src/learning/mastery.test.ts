import { describe, expect, it } from "vitest";
import {
  chooseRepresentation,
  initialMastery,
  MASTERY_RULES,
  recordAttempt,
  type LearningAttempt,
  type MasteryState,
} from "./mastery";

const attempt = (overrides: Partial<LearningAttempt> = {}): LearningAttempt => ({
  objectiveId: "add-within-20",
  itemId: "test",
  difficulty: 1,
  tries: 1,
  hintsUsed: 0,
  responseMs: 3000,
  representation: "objects",
  ...overrides,
});

describe("recordAttempt", () => {
  it("promotes difficulty after a streak of independent successes", () => {
    let state = initialMastery("add-within-20");
    for (let i = 0; i < MASTERY_RULES.promoteAfterStreak; i++) state = recordAttempt(state, attempt());
    expect(state.nextDifficulty).toBe(2);
    expect(state.streak).toBe(0);
    expect(state.independentSuccesses).toBe(3);
  });

  it("counts hinted successes as supported and resets the streak", () => {
    let state = recordAttempt(initialMastery("add-within-20"), attempt());
    state = recordAttempt(state, attempt({ tries: 2, hintsUsed: 1 }));
    expect(state.supportedSuccesses).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.recentErrors).toBe(1);
  });

  it("demotes after repeated errors but never below 1", () => {
    let state: MasteryState = { ...initialMastery("add-within-20"), nextDifficulty: 3 };
    state = recordAttempt(state, attempt({ tries: 4, hintsUsed: 3 }));
    expect(state.nextDifficulty).toBe(2);

    let floor = initialMastery("add-within-20");
    for (let i = 0; i < 5; i++) floor = recordAttempt(floor, attempt({ tries: 3, hintsUsed: 2 }));
    expect(floor.nextDifficulty).toBe(1);
  });

  it("caps difficulty at 4", () => {
    let state: MasteryState = { ...initialMastery("add-within-20"), nextDifficulty: 4 };
    for (let i = 0; i < 10; i++) state = recordAttempt(state, attempt());
    expect(state.nextDifficulty).toBe(4);
  });

  it("does not mutate its input", () => {
    const state = initialMastery("add-within-20");
    recordAttempt(state, attempt());
    expect(state.attempts).toBe(0);
  });
});

describe("chooseRepresentation", () => {
  it("uses manipulatives at difficulty 1 and after recent errors", () => {
    const fresh = initialMastery("add-within-20");
    expect(chooseRepresentation(fresh, 1)).toBe("objects");
    expect(chooseRepresentation(fresh, 2)).toBe("symbols");
    expect(chooseRepresentation({ ...fresh, recentErrors: 2 }, 3)).toBe("objects");
  });
});
