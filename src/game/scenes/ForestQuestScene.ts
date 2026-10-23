import Phaser from "phaser";
import type { QuestDefinition } from "../../content/schemas";
import { t } from "../../i18n";
import type { Challenge } from "../../learning/challenge";
import { QuestRunner, type HintLevel } from "../../learning/session";
import { completeQuest, updateMastery } from "../../storage/progress";
import type { GameEventMap } from "../bridge";
import { PALETTE, WORLD } from "../palette";
import { servicesOf, type GameServices } from "../services";
import { AudioSystem } from "../systems/AudioSystem";
import { animate, wait } from "../systems/motion";
import { drawGround, drawNightSky, drawTreeLine } from "./drawing";
import { EndingScene } from "./EndingScene";
import { WorldMapScene } from "./WorldMapScene";

const GATE = { x: 480, top: 170, bottom: 440, halfWidth: 100 } as const;
const GROUND_Y = 440;
const POOL_LEFT_X = 210;
const POOL_RIGHT_X = 750;
const POOL_TOP_Y = 290;
const CRYSTAL_GAP_X = 44;
const CRYSTAL_GAP_Y = 62;

interface Crystal {
  image: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
}

/**
 * Multi-region fantasy quest scene.
 *
 * Renders the distinct environment, companion guide, and interactive
 * manipulatives for each of Moonwood's four regions and seven curriculum
 * mechanics:
 * - `+` (add-within-20): combining blue diamond and gold round mana crystals
 * - `-` (subtract-within-20): spending/cooling crystals from a starting pool
 * - `tens-ones` (tens-and-ones): bundled rune satchels of 10 + loose gems
 * - `length` (compare-lengths): wooden bridge moon-tiles across a ravine beam
 * - `shapes` (compose-shapes): cyan triangle and gold diamond sigil shards
 * - `phonics` (phonics-words): illuminated story scrolls with icons & sounds
 * - `pattern` (star-patterns): connected constellation stars in the sky
 */
export class ForestQuestScene extends Phaser.Scene {
  static readonly KEY = "ForestQuest";

  private services!: GameServices;
  private quest!: QuestDefinition;
  private runner!: QuestRunner;
  private audio!: AudioSystem;

  private runes: Phaser.GameObjects.Image[] = [];
  private crystals: Crystal[] = [];
  private stageProps: Phaser.GameObjects.GameObject[] = [];
  private doors: Phaser.GameObjects.Rectangle[] = [];
  private owl!: Phaser.GameObjects.Image;
  private hero!: Phaser.GameObjects.Image;
  private guide!: Phaser.GameObjects.Image;
  private busy = false;
  private questId = "";

  constructor() {
    super(ForestQuestScene.KEY);
  }

  init(data: { questId?: string }): void {
    this.questId = data.questId ?? "forest-gate";
    this.runes = [];
    this.crystals = [];
    this.stageProps = [];
    this.doors = [];
    this.busy = false;
  }

  create(): void {
    this.services = servicesOf(this);
    const quest = this.services.quests.find((q) => q.id === this.questId);
    if (!quest) throw new Error(`Unknown quest "${this.questId}"`);
    this.quest = quest;
    this.audio = new AudioSystem(() => this.services.settings().sound);
    this.runner = new QuestRunner(
      quest,
      this.services.progress.current.objectives,
      this.services.rngForQuest(quest.id),
    );

    this.drawScene();

    const bridge = this.services.bridge;
    const subscriptions = [
      bridge.on("answer", (payload) => void this.handleAnswer(payload)),
      bridge.on("requestHint", ({ challengeId }) => void this.handleHintRequest(challengeId)),
      bridge.on("returnToMap", () => this.scene.start(WorldMapScene.KEY)),
      bridge.on("startQuest", ({ questId }) => this.scene.start(ForestQuestScene.KEY, { questId })),
      bridge.on("exploreMap", (payload) => {
        if (payload.target === "celebrate") this.scene.start(EndingScene.KEY);
      }),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => subscriptions.forEach((off) => off()));

    bridge.emit("screen", { screen: "quest", questId: quest.id });
    this.presentChallenge();
  }

  private get reduced(): boolean {
    return this.services.settings().reducedMotion;
  }

  // ---------------------------------------------------------------- drawing

  private drawScene(): void {
    const region = this.quest.regionId;
    drawNightSky(this, 5, region);

    if (region === "whispering-woods" || region === "enchanted-library") {
      drawTreeLine(this, 330, PALETTE.treeFar, 0.7, 17);
    }

    // Inner portal glow behind the central archway, revealed when the doors open.
    const portalColor = {
      "whispering-woods": PALETTE.moon,
      "crystal-caves": PALETTE.packPurple,
      "enchanted-library": PALETTE.goldMana,
      "starfall-tower": PALETTE.astraStar,
    }[region];
    this.add
      .graphics()
      .fillStyle(portalColor, 0.85)
      .fillRect(GATE.x - 70, GATE.top, 140, GATE.bottom - GATE.top);

    // Doors hinge on the pillars: origin at the outer edge, opened by scaleX.
    const doorLeftColor = region === "crystal-caves" ? 0x3c2f58 : region === "starfall-tower" ? 0x2b3a67 : PALETTE.door;
    const doorRightColor =
      region === "crystal-caves" ? 0x281e3d : region === "starfall-tower" ? 0x1d2849 : PALETTE.doorDark;
    this.doors = [
      this.add.rectangle(GATE.x - 70, GATE.top, 70, GATE.bottom - GATE.top, doorLeftColor).setOrigin(0, 0),
      this.add.rectangle(GATE.x + 70, GATE.top, 70, GATE.bottom - GATE.top, doorRightColor).setOrigin(1, 0),
    ];

    const archColor =
      region === "enchanted-library"
        ? 0x6e421c
        : region === "crystal-caves"
          ? 0x5c4d7d
          : region === "starfall-tower"
            ? 0x8b9bb4
            : PALETTE.stone;

    const stone = this.add.graphics();
    stone.fillStyle(archColor);
    stone.fillRect(GATE.x - GATE.halfWidth, GATE.top, 30, GATE.bottom - GATE.top);
    stone.fillRect(GATE.x + GATE.halfWidth - 30, GATE.top, 30, GATE.bottom - GATE.top);
    stone.lineStyle(30, archColor).beginPath().arc(GATE.x, GATE.top, GATE.halfWidth - 15, Math.PI, 0).strokePath();

    if (region === "starfall-tower") {
      // Celestial astrolabe rings around the tower arch
      stone.lineStyle(3, PALETTE.astraGold, 0.55).strokeCircle(GATE.x, GATE.top - 10, 128);
    }

    drawGround(this, GROUND_Y, region);
    if (region === "whispering-woods") {
      drawTreeLine(this, WORLD.height + 30, PALETTE.treeNear, 0.55, 29);
    }

    // Rune sockets along the arch, one per challenge in the quest.
    const n = this.runner.total;
    for (let i = 0; i < n; i++) {
      const angle = Math.PI - (Math.PI * (i + 0.5)) / n;
      const x = GATE.x + Math.cos(angle) * (GATE.halfWidth - 15);
      const y = GATE.top - Math.sin(angle) * (GATE.halfWidth - 15);
      this.runes.push(this.add.image(x, y, "rune-idle"));
    }

    // Apprentice Aria, Pip the Owl, and the Regional Companion Guide
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

  // ------------------------------------------------------------- challenges

  private presentChallenge(): void {
    const challenge = this.runner.current;
    if (!challenge) return;

    this.clearCrystals();
    this.spawnCrystals(challenge);

    this.services.bridge.emit("challenge", {
      challengeId: challenge.id,
      promptKey: challenge.promptKey,
      operator: challenge.operator,
      operands: challenge.operands,
      choices: challenge.choices,
      correctAnswer: challenge.correctAnswer,
      choiceKeyPrefix: challenge.choiceKeyPrefix,
      representation: challenge.representation,
      index: this.runner.solved + 1,
      total: this.runner.total,
    });
  }

  private spawnCrystals(challenge: Challenge): void {
    const showCounts = challenge.representation === "objects";

    if (challenge.operator === "tens-ones") {
      const [tens = 0, ones = 0] = challenge.operands;
      this.placeGroup(tens, POOL_LEFT_X, "crystal-pack-10", (i) => String((i + 1) * 10), showCounts);
      this.placeGroup(ones, POOL_RIGHT_X, "crystal-gold", (i) => String(tens * 10 + i + 1), showCounts);
      return;
    }

    if (challenge.operator === "-") {
      const [whole = 0, spent = 0] = challenge.operands;
      const remaining = Math.max(0, whole - spent);
      this.placeGroup(remaining, POOL_LEFT_X, "crystal-blue", (i) => String(i + 1), showCounts);
      this.placeGroup(
        spent,
        POOL_RIGHT_X,
        "crystal-gold",
        (i) => `-${i + 1}`,
        showCounts,
        0.48,
      );
      return;
    }

    if (challenge.operator === "length") {
      const [a = 0, b = 0] = challenge.operands;
      this.placeGroup(a, POOL_LEFT_X, "plank-tile", (i) => String(i + 1), showCounts);
      const secondCount = challenge.promptKey.includes("missing") ? Math.max(1, a - b) : b;
      this.placeGroup(
        secondCount,
        POOL_RIGHT_X,
        "plank-tile",
        (i) => String(i + 1),
        showCounts,
        challenge.promptKey.includes("missing") ? 0.55 : 1,
      );
      return;
    }

    if (challenge.operator === "shapes") {
      const [a = 0, b = 0] = challenge.operands;
      this.placeGroup(a, POOL_LEFT_X, "sigil-triangle", (i) => String(i + 1), showCounts);
      this.placeGroup(b, POOL_RIGHT_X, "sigil-diamond", (i) => String(a + i + 1), showCounts);
      return;
    }

    if (challenge.operator === "phonics") {
      // Display 3 illuminated Story Scrolls (one per choice) that can also be tapped on canvas
      const positions = [210, 480, 750];
      challenge.choices.forEach((wordId, idx) => {
        const x = positions[idx] ?? 480;
        const y = 335;
        const image = this.add.image(x, y, "story-scroll").setScale(this.reduced ? 1.15 : 0);
        const wordIcon = t(`challenge.phonics.word.${wordId}.icon`);
        const wordText = t(`challenge.phonics.word.${wordId}.word`);
        const label = this.add
          .text(x, y + 40, `${wordIcon} ${wordText}`, {
            fontFamily: "system-ui, sans-serif",
            fontSize: "18px",
            fontStyle: "bold",
            color: PALETTE.label,
            stroke: PALETTE.labelStroke,
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setVisible(true);

        image.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
          this.services.bridge.emit("answer", { challengeId: challenge.id, value: wordId });
        });
        void animate(this, this.reduced, {
          targets: image,
          scale: 1.15,
          duration: 260,
          delay: idx * 60,
          ease: "Back.easeOut",
        });
        this.crystals.push({ image, label });
      });
      return;
    }

    if (challenge.operator === "pattern") {
      const [s1 = 0, s2 = 0, s3 = 0, step = 1] = challenge.operands;
      const xs = [180, 320, 640, 780];
      const ys = [260, 220, 220, 260];
      const values = [String(s1), String(s2), String(s3), `? (+${step})`];

      const line = this.add.graphics();
      line.lineStyle(3, PALETTE.astraGold, 0.65);
      line.beginPath();
      xs.forEach((x, idx) => {
        const y = ys[idx] ?? 240;
        if (idx === 0) line.moveTo(x, y);
        else line.lineTo(x, y);
      });
      line.strokePath();
      this.stageProps.push(line);

      xs.forEach((x, idx) => {
        const y = ys[idx] ?? 240;
        const image = this.add.image(x, y, "star-node").setScale(this.reduced ? 1 : 0);
        const label = this.add
          .text(x, y + 32, idx < 3 || showCounts ? (values[idx] ?? "") : "?", {
            fontFamily: "system-ui, sans-serif",
            fontSize: "18px",
            fontStyle: "bold",
            color: PALETTE.label,
            stroke: PALETTE.labelStroke,
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setVisible(true);
        image.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
          label.setText(values[idx] ?? "");
        });
        void animate(this, this.reduced, {
          targets: image,
          scale: 1,
          duration: 260,
          delay: idx * 60,
          ease: "Back.easeOut",
        });
        this.crystals.push({ image, label });
      });
      return;
    }

    // Default: "+" (add-within-20)
    const [a = 0, b = 0] = challenge.operands;
    this.placeGroup(a, POOL_LEFT_X, "crystal-blue", (i) => String(i + 1), showCounts);
    this.placeGroup(b, POOL_RIGHT_X, "crystal-gold", (i) => String(a + i + 1), showCounts);
  }

  private placeGroup(
    count: number,
    centerX: number,
    texture: string,
    labelFor: (index: number) => string,
    showCounts: boolean,
    alpha = 1,
  ): void {
    for (let i = 0; i < count; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = centerX + (col - 2) * CRYSTAL_GAP_X;
      const y = POOL_TOP_Y + row * CRYSTAL_GAP_Y;
      const image = this.add
        .image(x, y, texture)
        .setAlpha(alpha)
        .setScale(this.reduced ? 1 : 0);
      const label = this.add
        .text(x, y + 30, labelFor(i), {
          fontFamily: "system-ui, sans-serif",
          fontSize: "18px",
          fontStyle: "bold",
          color: PALETTE.label,
          stroke: PALETTE.labelStroke,
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setVisible(showCounts);

      // Tapping any manipulative reveals its count: touch-counting support.
      image.setInteractive({ useHandCursor: true }).on("pointerdown", () => label.setVisible(true));

      void animate(this, this.reduced, {
        targets: image,
        scale: 1,
        duration: 260,
        delay: i * 45,
        ease: "Back.easeOut",
      });
      this.crystals.push({ image, label });
    }
  }

  private clearCrystals(): void {
    for (const { image, label } of this.crystals) {
      this.tweens.killTweensOf(image);
      image.destroy();
      label.destroy();
    }
    this.crystals = [];
    for (const prop of this.stageProps) {
      prop.destroy();
    }
    this.stageProps = [];
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
      this.audio.hmm();
      bridge.emit("feedback", { kind: "try-again", hintLevel: result.hintLevel, ruledOut: result.ruledOut });
      await this.showHint(result.hintLevel);
      return;
    }
    if (result.kind !== "correct") return;

    this.busy = true;
    this.audio.chime();
    bridge.emit("feedback", { kind: "correct" });

    // Hero raises her lantern in celebration
    void animate(this, this.reduced, {
      targets: this.hero,
      y: GROUND_Y - 14,
      duration: 180,
      yoyo: true,
      ease: "Quad.easeOut",
    });

    await this.absorbCrystals(this.runner.solved - 1);
    await this.services.progress.update((p) => updateMastery(p, this.runner.masterySnapshot()));

    if (result.questComplete) {
      await this.finishQuest();
    } else {
      await wait(this, this.reduced ? 300 : 500);
      this.presentChallenge();
    }
    this.busy = false;
  }

  /**
   * 3-level progressive hint ladder:
   * - Level 1: Gentle clue & count-on labels on every manipulative.
   * - Level 2: Simplified visual demonstration (aligned counting row).
   * - Level 3: Guided solution highlighting the exact answer.
   */
  private async showHint(level: HintLevel): Promise<void> {
    void animate(this, this.reduced, {
      targets: [this.owl, this.guide],
      y: GROUND_Y - 40,
      duration: 180,
      yoyo: true,
      ease: "Quad.easeOut",
    });

    for (const { label } of this.crystals) label.setVisible(true);
    if (level === 1) {
      await Promise.all(
        this.crystals.map(({ image }, i) =>
          animate(this, this.reduced, { targets: image, scale: 1.22, duration: 130, delay: i * 110, yoyo: true }),
        ),
      );
      return;
    }

    const n = this.crystals.length;
    const gap = Math.min(44, 780 / Math.max(1, n));
    const startX = WORLD.width / 2 - ((n - 1) * gap) / 2;
    await Promise.all(
      this.crystals.flatMap(({ image, label }, i) => [
        animate(this, this.reduced, {
          targets: image,
          x: startX + i * gap,
          y: GROUND_Y + 26,
          duration: 420,
          ease: "Cubic.easeInOut",
        }),
        animate(this, this.reduced, {
          targets: label,
          x: startX + i * gap,
          y: GROUND_Y + 58,
          duration: 420,
          ease: "Cubic.easeInOut",
        }),
      ]),
    );
  }

  /** Mana flows into the archway and wakes a rune. */
  private async absorbCrystals(runeIndex: number): Promise<void> {
    for (const { label } of this.crystals) label.setVisible(false);
    await Promise.all(
      this.crystals.map(({ image }, i) =>
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
    const rune = this.runes[runeIndex];
    if (rune) {
      rune.setTexture("rune-lit");
      await animate(this, this.reduced, { targets: rune, scale: 1.3, duration: 200, yoyo: true });
    }
  }

  private async finishQuest(): Promise<void> {
    this.audio.fanfare();
    await animate(this, this.reduced, { targets: this.doors, scaleX: 0.1, duration: 900, ease: "Cubic.easeInOut" });

    const companionKey = this.quest.guideId === "pip" ? "moss" : this.quest.guideId;
    const friend = this.add.image(GATE.x, GATE.bottom - 40, companionKey).setScale(this.reduced ? 1.4 : 0);
    await animate(this, this.reduced, {
      targets: friend,
      scale: 1.4,
      y: GROUND_Y + 40,
      duration: 700,
      ease: "Back.easeOut",
    });

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

    await this.services.progress.update((p) => completeQuest(p, this.quest, this.runner.masterySnapshot()));
    this.services.bridge.emit("questComplete", {
      questId: this.quest.id,
      rewardIds: this.quest.rewards.map((r) => r.id),
    });
    this.services.bridge.emit("screen", { screen: "complete", questId: this.quest.id });
  }
}
