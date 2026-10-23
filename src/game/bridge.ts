import type { Settings } from "../app/settings";
import type { GuideId } from "../content/schemas";
import type { InteractiveTaskMeta, Operator, Representation } from "../learning/challenge";
import type { ObjectiveId } from "../learning/objectives";

export type Screen = "loading" | "map" | "quest" | "complete" | "ending";

export interface ChallengePresentation {
  challengeId: string;
  objectiveId: ObjectiveId;
  promptKey: string;
  operator: Operator;
  operands: readonly number[];
  choices: readonly number[];
  correctAnswer: number;
  choiceKeyPrefix?: string | undefined;
  representation: Representation;
  index: number;
  total: number;
  meta?: InteractiveTaskMeta | undefined;
  isAssessment?: boolean | undefined;
}

export interface GameEventMap {
  screen: { screen: Screen; questId?: string };
  startQuest: { questId: string };
  returnToMap: Record<string, never>;
  challenge: ChallengePresentation;
  answer: { challengeId: string; value: number };
  requestHint: { challengeId: string };
  setModality: { challengeId?: string | undefined; modality: "listening" | "independent-reading" };
  settingsChanged: Settings;
  feedback:
    | { kind: "correct" }
    | { kind: "try-again"; hintLevel: 1 | 2 | 3; ruledOut?: number | undefined };
  questComplete: { questId: string; rewardIds: readonly string[] };
  modalState: { open: boolean };
  exploreMap:
    | { target: "guide"; guideId: GuideId }
    | { target: "treasure"; treasureId: string }
    | { target: "celebrate" };
  mapDiscovery:
    | { kind: "guide"; guideId: GuideId }
    | { kind: "treasure"; treasureId: string; nameKey: string };
}

type Listener<T> = (payload: T) => void;

/**
 * Typed pub/sub bus between Phaser scenes and the accessible DOM shell.
 * Keeps Phaser imports out of `src/app` and DOM manipulation out of `src/game`.
 */
export class GameBridge {
  private readonly listeners = new Map<keyof GameEventMap, Set<Listener< never >>>();

  on<K extends keyof GameEventMap>(event: K, listener: Listener<GameEventMap[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<never>);
    return () => set?.delete(listener as Listener<never>);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of [...set]) {
      (listener as Listener<GameEventMap[K]>)(payload);
    }
  }
}
