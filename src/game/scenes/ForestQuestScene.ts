import Phaser from "phaser";
import { findQuestOrSanctuary } from "../../content";
import type { QuestDefinition } from "../../content/schemas";
import { currentLanguage } from "../../i18n";
import { getDueReviewSkills } from "../../learning/adaptation/spacedReview";
import { QuestRunner, type HintLevel } from "../../learning/session";
import { completeQuest, updateMastery } from "../../storage/progress";
import type { GameEventMap } from "../bridge";
import { PALETTE, WORLD } from "../palette";
import { servicesOf, type GameServices } from "../services";
import { AudioSystem } from "../systems/AudioSystem";
import { animate, wait } from "../systems/motion";
import { drawGround, drawNightSky, drawTreeLine } from "./drawing";
import { EndingScene } from "./EndingScene";
import {
  animateChallengeHint,
  GATE,
  GROUND_Y,
  REGION_THEMES,
  spawnChallengeStage,
  type SpawnedChallengeStage,
} from "./questRenderers";
import { WorldMapScene } from "./WorldMapScene";

/**
 * Multi-region fantasy quest and regional sanctuary scene.
 *
 * Delegates region themes and per-operator manipulative/hint rendering to
 * `questRenderers.ts` while coordinating `QuestRunner` state, structured
 * learning evidence, audio cues, and persistence.
 */
export class ForestQuestScene extends Phaser.Scene {
  static readonly KEY = "ForestQuest";

  private services!: GameServices;
  private quest!: QuestDefinition;
  private runner!: QuestRunner;
  private audio!: AudioSystem;

  private runes: Phaser.GameObjects.Image[] = [];
  private stage: SpawnedChallengeStage = { crystals: [], stageProps: [] };
  private doors: Phaser.GameObjects.Rectangle[] = [];
  private owl!: Phaser.GameObjects.Image;
  private hero!: Phaser.GameObjects.Image;
  private guide!: Phaser.GameObjects.Image;
  private busy = false;
  private alive = false;
  private questId = "";

  constructor() {
    super(ForestQuestScene.KEY);
  }

  init(data: { questId?: string }): void {
    this.questId = data.questId ?? "forest-gate";
    this.runes = [];
    this.stage = { crystals: [], stageProps: [] };
    this.doors = [];
    this.busy = false;
    this.alive = true;
  }

  create(): void {
    this.services = servicesOf(this);
    const quest = findQuestOrSanctuary(this.questId, this.services.quests);
    if (!quest) throw new Error(`Unknown quest "${this.questId}"`);
    this.quest = quest;
    this.audio = new AudioSystem(() => this.services.settings().sound);
    const progress = this.services.progress.current;
    const dueReviewSkills = getDueReviewSkills(progress.reviewSchedule ?? {});
    const effectiveAssessmentMode =
      quest.assessmentMode === "independent-check" && dueReviewSkills.length > 0
        ? "delayed-retention"
        : (quest.assessmentMode ?? "standard");
    this.runner = new QuestRunner(
      {
        ...quest,
        assessmentMode: effectiveAssessmentMode,
        locale: currentLanguage(),
        seenItemSignatures: progress.seenItemSignatures,
        placedSkills: progress.placedSkills,
        dueReviewSkills,
      },
      progress.objectives,
      this.services.rngForQuest(quest.id),
    );

    this.drawScene();

    const bridge = this.services.bridge;
    const subscriptions = [
      bridge.on("answer", (payload) => void this.handleAnswer(payload)),
      bridge.on("requestHint", ({ challengeId }) => void this.handleHintRequest(challengeId)),
      bridge.on("setModality", ({ modality }) => this.runner.setResponseModality(modality)),
      bridge.on("returnToMap", () => this.scene.start(WorldMapScene.KEY)),
      bridge.on("startQuest", ({ questId }) => this.scene.start(ForestQuestScene.KEY, { questId })),
      bridge.on("exploreMap", (payload) => {
        if (payload.target === "celebrate") this.scene.start(EndingScene.KEY);
      }),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.alive = false;
      subscriptions.forEach((off) => off());
    });

    bridge.emit("screen", { screen: "quest", questId: quest.id });
    this.presentChallenge();
  }

  private get reduced(): boolean {
    return this.services.settings().reducedMotion;
  }

  private drawScene(): void {
    const region = this.quest.regionId;
    const theme = REGION_THEMES[region];
    drawNightSky(this, 5, region);

    if (theme.farTrees) {
      drawTreeLine(this, 330, PALETTE.treeFar, 0.7, 17);
    }

    this.add
      .graphics()
      .fillStyle(theme.portalColor, 0.85)
      .fillRect(GATE.x - 70, GATE.top, 140, GATE.bottom - GATE.top);

    this.doors = [
      this.add.rectangle(GATE.x - 70, GATE.top, 70, GATE.bottom - GATE.top, theme.doorLeftColor).setOrigin(0, 0),
      this.add.rectangle(GATE.x + 70, GATE.top, 70, GATE.bottom - GATE.top, theme.doorRightColor).setOrigin(1, 0),
    ];

    const stone = this.add.graphics();
    stone.fillStyle(theme.archColor);
    stone.fillRect(GATE.x - GATE.halfWidth, GATE.top, 30, GATE.bottom - GATE.top);
    stone.fillRect(GATE.x + GATE.halfWidth - 30, GATE.top, 30, GATE.bottom - GATE.top);
    stone.lineStyle(30, theme.archColor).beginPath().arc(GATE.x, GATE.top, GATE.halfWidth - 15, Math.PI, 0).strokePath();

    if (theme.astrolabeRing) {
      stone.lineStyle(3, PALETTE.astraGold, 0.55).strokeCircle(GATE.x, GATE.top - 10, 128);
    }

    drawGround(this, GROUND_Y, region);
    if (theme.nearTrees) {
      drawTreeLine(this, WORLD.height + 30, PALETTE.treeNear, 0.55, 29);
    }

    const n = this.runner.total;
    for (let i = 0; i < n; i++) {
      const angle = Math.PI - (Math.PI * (i + 0.5)) / n;
      const x = GATE.x + Math.cos(angle) * (GATE.halfWidth - 15);
      const y = GATE.top - Math.sin(angle) * (GATE.halfWidth - 15);
      this.runes.push(this.add.image(x, y, "rune-idle"));
    }

    this.owl = this.add.image(46, GROUND_Y - 12, "owl").setOrigin(0.5, 1).setScale(0.88);
    this.hero = this.add.image(102, GROUND_Y + 4, "hero").setOrigin(0.5, 1).setScale(0.95);
    const guideTexture = this.quest.guideId === "pip" ? "moss" : this.quest.guideId;
    this.guide = this.add.image(895, GROUND_Y + 2, guideTexture).setOrigin(0.5, 1).setScale(0.95);

    void animate(this, this.reduced, {
      targets: [this.owl, this.guide],
      y: GROUND_Y - 18,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private presentChallenge(): void {
    if (!this.alive) return;
    const challenge = this.runner.current;
    if (!challenge) return;

    this.clearStage();
    this.stage = spawnChallengeStage(this, this.reduced, challenge, (value) => {
      this.services.bridge.emit("answer", { challengeId: challenge.id, value });
    });

    this.services.bridge.emit("challenge", {
      challengeId: challenge.id,
      objectiveId: challenge.objectiveId,
      promptKey: challenge.promptKey,
      operator: challenge.operator,
      operands: challenge.operands,
      choices: challenge.choices,
      correctAnswer: challenge.correctAnswer,
      choiceKeyPrefix: challenge.choiceKeyPrefix,
      representation: challenge.representation,
      index: this.runner.solved + 1,
      total: this.runner.total,
      meta: challenge.meta,
      isAssessment: challenge.isAssessment,
    });
  }

  private clearStage(): void {
    for (const { image, label } of this.stage.crystals) {
      this.tweens.killTweensOf(image);
      image.destroy();
      label.destroy();
    }
    for (const prop of this.stage.stageProps) {
      prop.destroy();
    }
    this.stage = { crystals: [], stageProps: [] };
  }

  private async handleHintRequest(challengeId: string): Promise<void> {
    if (this.busy || challengeId !== this.runner.current?.id) return;
    const hintLevel = this.runner.requestHint();
    if (!hintLevel) return;
    this.audio.discover();
    this.services.bridge.emit("feedback", { kind: "try-again", hintLevel });
    await this.showHint(hintLevel);
  }

  private async handleAnswer({ challengeId, value }: GameEventMap["answer"]): Promise<void> {
    if (this.busy || challengeId !== this.runner.current?.id) return;

    const result = this.runner.submit(value);
    const bridge = this.services.bridge;

    if (result.kind === "incorrect") {
      // Persist recorded incorrect-attempt evidence immediately
      await this.services.progress.update((p) =>
        updateMastery(
          p,
          this.runner.masterySnapshot(),
          new Date(),
          this.runner.recordedEvidence,
          this.runner.knownItemSignatures,
        ),
      );

      if (result.assessmentTransitioned) {
        this.busy = true;
        if (result.questComplete) {
          await this.services.progress.update((p) =>
            completeQuest(
              p,
              this.quest,
              this.runner.masterySnapshot(),
              new Date(),
              this.runner.recordedEvidence,
              this.runner.knownItemSignatures,
            ),
          );
          await this.finishQuest();
        } else {
          await wait(this, this.reduced ? 200 : 350);
          if (!this.alive) return;
          this.presentChallenge();
        }
        this.busy = false;
        return;
      }

      this.audio.hmm();
      bridge.emit("feedback", { kind: "try-again", hintLevel: result.hintLevel, ruledOut: result.ruledOut });
      await this.showHint(result.hintLevel);
      return;
    }
    if (result.kind !== "correct") return;

    this.busy = true;
    this.audio.chime();
    bridge.emit("feedback", { kind: "correct" });

    // Persist mastery, structured evidence, and quest completion BEFORE playing celebration animations
    // so navigating back to the map during the celebration never loses progress.
    if (result.questComplete) {
      await this.services.progress.update((p) =>
        completeQuest(
          p,
          this.quest,
          this.runner.masterySnapshot(),
          new Date(),
          this.runner.recordedEvidence,
          this.runner.knownItemSignatures,
        ),
      );
    } else {
      await this.services.progress.update((p) =>
        updateMastery(
          p,
          this.runner.masterySnapshot(),
          new Date(),
          this.runner.recordedEvidence,
          this.runner.knownItemSignatures,
        ),
      );
    }

    void animate(this, this.reduced, {
      targets: this.hero,
      y: GROUND_Y - 14,
      duration: 180,
      yoyo: true,
      ease: "Quad.easeOut",
    });

    await this.absorbCrystals(this.runner.solved - 1);
    if (!this.alive) return;

    if (result.questComplete) {
      await this.finishQuest();
    } else {
      await wait(this, this.reduced ? 300 : 500);
      if (!this.alive) return;
      this.presentChallenge();
    }
    this.busy = false;
  }

  private async showHint(level: HintLevel): Promise<void> {
    const challenge = this.runner.current;
    if (!challenge) return;
    void animate(this, this.reduced, {
      targets: [this.owl, this.guide],
      y: GROUND_Y - 40,
      duration: 180,
      yoyo: true,
      ease: "Quad.easeOut",
    });
    await animateChallengeHint(this, this.reduced, challenge, this.stage, level);
  }

  private async absorbCrystals(runeIndex: number): Promise<void> {
    for (const { label } of this.stage.crystals) label.setVisible(false);
    await Promise.all(
      this.stage.crystals.map(({ image }, i) =>
        animate(this, this.reduced, {
          targets: image,
          x: GATE.x,
          y: GATE.top + 80,
          scale: 0.2,
          alpha: 0,
          duration: 400,
          delay: i * 25,
          ease: "Quad.easeIn",
        }),
      ),
    );
    if (!this.alive) return;
    const rune = this.runes[runeIndex];
    if (rune) {
      rune.setTexture("rune-lit");
      await animate(this, this.reduced, { targets: rune, scale: 1.3, duration: 200, yoyo: true });
    }
  }

  private async finishQuest(): Promise<void> {
    if (!this.alive) return;
    this.audio.fanfare();
    await animate(this, this.reduced, { targets: this.doors, scaleX: 0.1, duration: 900, ease: "Cubic.easeInOut" });
    if (!this.alive) return;

    const companionKey = this.quest.guideId === "pip" ? "moss" : this.quest.guideId;
    const friend = this.add.image(GATE.x, GATE.bottom - 40, companionKey).setScale(this.reduced ? 1.4 : 0);
    await animate(this, this.reduced, {
      targets: friend,
      scale: 1.4,
      y: GROUND_Y + 40,
      duration: 700,
      ease: "Back.easeOut",
    });
    if (!this.alive) return;

    if (!this.reduced) {
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12;
        const sparkle = this.add.image(friend.x, friend.y, "sparkle");
        void animate(this, false, {
          targets: sparkle,
          x: friend.x + Math.cos(angle) * 90,
          y: friend.y + Math.sin(angle) * 60,
          alpha: 0,
          duration: 900,
          ease: "Quad.easeOut",
        });
      }
    }

    this.services.bridge.emit("questComplete", {
      questId: this.quest.id,
      rewardIds: this.quest.rewards.map((r) => r.id),
    });
    this.services.bridge.emit("screen", { screen: "complete", questId: this.quest.id });
  }
}
