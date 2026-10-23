import { describe, expect, it } from "vitest";
import { mulberry32 } from "./random";
import { QuestRunner, type QuestPlan } from "./session";

const plan: QuestPlan = {
  id: "test-quest",
  objectiveIds: ["add-within-20"],
  phases: [
    { kind: "guided", count: 2, difficultyCap: 1 },
    { kind: "independent", count: 3 },
    { kind: "mini-boss", count: 1, difficultyFloor: 3 },
  ],
};

function solveAll(runner: QuestRunner) {
  const results = [];
  while (runner.current) results.push(runner.submit(runner.current.correctAnswer));
  return results;
}

describe("QuestRunner", () => {
  it("presents one challenge per phase step and reports completion", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(1));
    expect(runner.total).toBe(6);
    const results = solveAll(runner);
    expect(results).toHaveLength(6);
    expect(results.at(-1)).toMatchObject({ kind: "correct", questComplete: true });
    expect(runner.current).toBeNull();
    expect(runner.solved).toBe(6);
  });

  it("uses manipulatives during the guided phase and respects floors/caps", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(2));
    const seen = [];
    while (runner.current) {
      seen.push({ ...runner.current });
      runner.submit(runner.current.correctAnswer);
    }
    expect(seen[0]?.representation).toBe("objects");
    expect(seen[1]?.difficulty).toBe(1);
    expect(seen[5]?.difficulty).toBeGreaterThanOrEqual(3);
  });

  it("gives information, not punishment, on wrong answers", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(3));
    const challenge = runner.current!;
    const wrong = challenge.choices.find((c) => c !== challenge.correctAnswer)!;

    expect(runner.submit(wrong)).toEqual({ kind: "incorrect", hintLevel: 1, ruledOut: wrong });
    expect(runner.submit(wrong)).toMatchObject({ kind: "incorrect", hintLevel: 2 });
    expect(runner.current).toBe(challenge); // same challenge, retry allowed

    const result = runner.submit(challenge.correctAnswer);
    expect(result).toMatchObject({ kind: "correct", attempt: { tries: 3, hintsUsed: 2 } });
  });

  it("records mastery and adapts difficulty", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(4));
    solveAll(runner);
    const mastery = runner.masterySnapshot()["add-within-20"];
    expect(mastery?.attempts).toBe(6);
    expect(mastery?.independentSuccesses).toBe(6);
    expect(mastery?.nextDifficulty).toBeGreaterThan(1);
  });

  it("measures response time with an injected clock", () => {
    let t = 1000;
    const runner = new QuestRunner(plan, {}, mulberry32(5), () => t);
    t += 4200;
    const result = runner.submit(runner.current!.correctAnswer);
    expect(result).toMatchObject({ attempt: { responseMs: 4200 } });
  });

  it("is reproducible from a seed", () => {
    const a = new QuestRunner(plan, {}, mulberry32(10473));
    const b = new QuestRunner(plan, {}, mulberry32(10473));
    expect(a.current).toEqual(b.current);
  });

  it("ignores submissions after completion", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(6));
    solveAll(runner);
    expect(runner.submit(1)).toEqual({ kind: "ignored" });
  });

  it("supports 3-level progressive hints via requestHint and third wrong try", () => {
    const runner = new QuestRunner(plan, {}, mulberry32(9));
    expect(runner.requestHint()).toBe(1);
    expect(runner.requestHint()).toBe(2);
    expect(runner.requestHint()).toBe(3);
    expect(runner.requestHint()).toBe(3);

    const runner2 = new QuestRunner(plan, {}, mulberry32(10));
    const wrong = runner2.current!.choices.find((c) => c !== runner2.current!.correctAnswer)!;
    expect(runner2.submit(wrong).kind === "incorrect" && runner2.submit(wrong).kind === "incorrect").toBe(true);
    expect(runner2.submit(wrong)).toEqual({ kind: "incorrect", hintLevel: 3, ruledOut: wrong });
  });
});
