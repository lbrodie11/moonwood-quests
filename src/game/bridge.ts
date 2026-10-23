import type { Operator, Representation } from "../learning/challenge";
import type { HintLevel } from "../learning/session";
import type { GuideId } from "../content/schemas";
import type { Settings } from "../app/settings";

/** What the DOM shell needs to render a challenge accessibly. */
export interface ChallengePresentation {
  challengeId: string;
  promptKey: string;
  operator: Operator;
  operands: readonly number[];
  choices: readonly number[];
  correctAnswer: number;
  choiceKeyPrefix?: string | undefined;
  representation: Representation;
  /** 1-based position within the quest. */
  index: number;
  total: number;
}

export type Screen = "loading" | "map" | "quest" | "complete" | "ending";

/**
 * Typed events between the Phaser canvas and the DOM shell. Neither side
 * imports the other: scenes don't know about DOM elements, and the shell
 * doesn't know about Phaser objects.
 */
export interface GameEventMap {
  // game → shell
  screen: { screen: Screen; questId?: string };
  challenge: ChallengePresentation;
  feedback:
    | { kind: "correct" }
    | { kind: "try-again"; hintLevel: HintLevel; ruledOut?: number | undefined };
  questComplete: { questId: string; rewardIds: readonly string[] };
  mapDiscovery:
    | { kind: "guide"; guideId: GuideId }
    | { kind: "treasure"; treasureId: string; nameKey: string };

  // shell → game
  startQuest: { questId: string };
  answer: { challengeId: string; value: number };
  requestHint: { challengeId: string };
  exploreMap:
    | { target: "guide"; guideId: GuideId }
    | { target: "treasure"; treasureId: string }
    | { target: "celebrate" };
  returnToMap: Record<string, never>;
  settingsChanged: Settings;
}

export type GameEvent = keyof GameEventMap;

export class GameBridge {
  private readonly target = new EventTarget();

  emit<K extends GameEvent>(type: K, detail: GameEventMap[K]): void {
    this.target.dispatchEvent(new CustomEvent(type, { detail }));
  }

  on<K extends GameEvent>(type: K, handler: (payload: GameEventMap[K]) => void): () => void {
    const listener: EventListener = (event) => handler((event as CustomEvent<GameEventMap[K]>).detail);
    this.target.addEventListener(type, listener);
    return () => this.target.removeEventListener(type, listener);
  }
}
