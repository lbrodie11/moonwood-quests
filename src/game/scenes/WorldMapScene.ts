import Phaser from "phaser";
import { findQuestOrSanctuary, REGIONS } from "../../content";
import { isPlayable, questAvailability } from "../../content/availability";
import type { GuideId } from "../../content/schemas";
import { discoverTreasure } from "../../storage/progress";
import { PALETTE, WORLD } from "../palette";
import { servicesOf, type GameServices } from "../services";
import { AudioSystem } from "../systems/AudioSystem";
import { animate } from "../systems/motion";
import { drawNightSky, drawTreeLine } from "./drawing";
import { EndingScene } from "./EndingScene";

/**
 * The illustrated four-region campaign map of Moonwood.
 *
 * Supports exploratory movement (keyboard Arrow/WASD, pointer tap, or DOM
 * explorer buttons) so the child can walk Apprentice Aria and Pip between
 * Whispering Woods, Crystal Caves, The Enchanted Library, and Starfall Tower,
 * greet friendly companions, and discover hidden Star-Treasures.
 * Every canvas interaction also has a 1:1 semantic DOM button in `#panel`.
 */
export class WorldMapScene extends Phaser.Scene {
  static readonly KEY = "WorldMap";

  private services!: GameServices;
  private audio!: AudioSystem;
  private leaving = false;
  private hero!: Phaser.GameObjects.Image;
  private pip!: Phaser.GameObjects.Image;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasd:
    | {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
      }
    | undefined;
  private guideSprites = new Map<GuideId, Phaser.GameObjects.Image>();
  private treasureSprites = new Map<string, Phaser.GameObjects.Image>();
  private nodeObjects: Phaser.GameObjects.GameObject[] = [];
  private modalOpen = false;

  constructor() {
    super(WorldMapScene.KEY);
  }

  create(): void {
    this.services = servicesOf(this);
    this.audio = new AudioSystem(() => this.services.settings().sound);
    this.leaving = false;
    this.modalOpen = false;
    this.guideSprites.clear();
    this.treasureSprites.clear();
    this.nodeObjects = [];

    drawNightSky(this, 3);
    drawTreeLine(this, 290, PALETTE.treeFar, 0.55, 11);
    this.drawRegionsTerrain();
    drawTreeLine(this, 555, PALETTE.treeNear, 0.75, 23);

    this.drawPath();
    this.drawRegionGuidesAndTreasures();
    this.drawNodes();
    this.spawnHero();
    this.setupExplorationInput();

    const subscriptions = [
      this.services.bridge.on("startQuest", ({ questId }) => this.startQuest(questId)),
      this.services.bridge.on("modalState", ({ open }) => {
        this.modalOpen = open;
      }),
      this.services.bridge.on("exploreMap", (payload) => {
        if (payload.target === "celebrate") {
          this.leaving = true;
          this.scene.start(EndingScene.KEY);
        } else if (payload.target === "guide") {
          this.interactWithGuide(payload.guideId);
        } else if (payload.target === "treasure") {
          void this.collectTreasure(payload.treasureId);
        }
      }),
      this.services.progress.subscribe(() => this.refreshDynamicMapState()),
    ];
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => subscriptions.forEach((off) => off()));

    this.services.bridge.emit("screen", { screen: "map" });
  }

  override update(_time: number, delta: number): void {
    if (this.leaving || !this.hero || this.modalOpen) return;

    const speed = 180 * (delta / 1000);
    let dx = 0;
    let dy = 0;
    if (this.cursors?.left.isDown || this.wasd?.left.isDown) dx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.right.isDown) dx += 1;
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) dy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.down.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      this.hero.x = Phaser.Math.Clamp(this.hero.x + (dx / len) * speed, 48, WORLD.width - 48);
      this.hero.y = Phaser.Math.Clamp(this.hero.y + (dy / len) * speed, 70, WORLD.height - 36);
      this.pip.x = Phaser.Math.Linear(this.pip.x, this.hero.x - 36, 0.15);
      this.pip.y = Phaser.Math.Linear(this.pip.y, this.hero.y - 14, 0.15);
      this.checkProximityDiscoveries();
    }
  }

  private drawRegionsTerrain(): void {
    const g = this.add.graphics();

    // Base continent & starlit river separating West and East Moonwood
    g.fillStyle(PALETTE.ground).fillEllipse(480, 480, 1280, 440);
    g.fillStyle(0x1b4965, 0.85).fillEllipse(510, 410, 140, 320);

    // Region 1 (Bottom-Left): Whispering Woods — mossy glade & ancient gate silhouette
    g.fillStyle(0x2d6a4f, 0.85).fillEllipse(210, 390, 340, 190);
    g.fillStyle(PALETTE.stone, 0.8).fillRect(105, 340, 12, 42).fillRect(153, 340, 12, 42);
    g.lineStyle(10, PALETTE.stone, 0.8).beginPath().arc(135, 340, 24, Math.PI, 0).strokePath();

    // Region 2 (Top-Left/Center): Crystal Caves — amethyst mountain & glowing cavern
    g.fillStyle(0x3c2f58, 0.95).fillTriangle(260, 260, 435, 70, 600, 260);
    g.fillStyle(PALETTE.caveTop).fillEllipse(435, 200, 90, 70);
    g.fillStyle(PALETTE.packPurple, 0.85)
      .fillTriangle(320, 190, 335, 145, 350, 190)
      .fillTriangle(510, 195, 528, 140, 545, 195);

    // Region 3 (Bottom-Right): Enchanted Library & Ravine Bridge
    g.fillStyle(0x4a3525, 0.9).fillEllipse(680, 395, 330, 180);
    // Wooden bridge across the river
    g.fillStyle(PALETTE.plankWood).fillRoundedRect(500, 340, 95, 24, 6);
    // Giant Hollow Library Tree
    g.fillStyle(0x5c3a21).fillRect(640, 315, 54, 78);
    g.fillStyle(0x2d6a4f).fillCircle(667, 300, 48);
    g.fillStyle(PALETTE.goldMana, 0.9).fillCircle(667, 352, 12);

    // Region 4 (Top-Right): Starfall Tower — celestial marble spire & astrolabe
    g.fillStyle(0x2b3a67, 0.92).fillEllipse(800, 165, 290, 170);
    g.fillStyle(PALETTE.stone).fillRect(850, 42, 46, 110);
    g.fillStyle(PALETTE.astraGold).fillTriangle(842, 44, 873, 10, 904, 44);
    g.lineStyle(3, PALETTE.astraGold, 0.75).strokeCircle(873, 75, 28);
  }

  private drawPath(): void {
    const g = this.add.graphics();
    const [first, ...rest] = this.services.quests;
    if (!first) return;

    // Outer soft trail
    g.lineStyle(14, 0xd9c79b, 0.25);
    g.beginPath().moveTo(first.map.x, first.map.y);
    for (const quest of rest) g.lineTo(quest.map.x, quest.map.y);
    g.strokePath();

    // Inner dotted stones
    g.lineStyle(6, 0xf4ecd0, 0.45);
    g.beginPath().moveTo(first.map.x, first.map.y);
    for (const quest of rest) g.lineTo(quest.map.x, quest.map.y);
    g.strokePath();
  }

  private drawRegionGuidesAndTreasures(): void {
    const progress = this.services.progress.current;
    const reduced = this.services.settings().reducedMotion;

    for (const region of REGIONS) {
      // Regional companion sprite
      const spriteKey = region.guideId === "pip" ? "owl" : region.guideId;
      const guide = this.add
        .image(region.guidePos.x, region.guidePos.y, spriteKey)
        .setScale(0.68)
        .setInteractive({ useHandCursor: true });
      guide.on("pointerup", () => this.interactWithGuide(region.guideId));
      this.guideSprites.set(region.guideId, guide);

      // Hidden Star-Treasure in each region
      const found = progress.rewardIds.includes(region.treasureId);
      const treasure = this.add
        .image(region.treasurePos.x, region.treasurePos.y, "treasure-star")
        .setScale(found ? 0.75 : 0.9)
        .setAlpha(found ? 0.55 : 1)
        .setInteractive({ useHandCursor: true });

      if (!found) {
        void animate(this, reduced, {
          targets: treasure,
          angle: 8,
          scale: 1.05,
          duration: 1100,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
      treasure.on("pointerup", () => void this.collectTreasure(region.treasureId));
      this.treasureSprites.set(region.treasureId, treasure);
    }
  }

  private drawNodes(): void {
    for (const obj of this.nodeObjects) {
      this.tweens.killTweensOf(obj);
      obj.destroy();
    }
    this.nodeObjects = [];

    const progress = this.services.progress.current;
    const reduced = this.services.settings().reducedMotion;

    this.services.quests.forEach((quest, index) => {
      const state = questAvailability(quest, progress);
      const tint = { available: 0x9ff3ff, completed: 0xffc94a, locked: 0x55607a, planned: 0x55607a }[state];
      const node = this.add.image(quest.map.x, quest.map.y, "node").setScale(0.78).setTint(tint);
      this.nodeObjects.push(node);

      // Quest number badge for clear visual order
      const badge = this.add
        .text(quest.map.x, quest.map.y + 32, String(index + 1), {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: PALETTE.label,
          stroke: PALETTE.labelStroke,
          strokeThickness: 3,
        })
        .setOrigin(0.5);
      this.nodeObjects.push(badge);

      if (state === "locked" || state === "planned") {
        const lock = this.add.image(quest.map.x, quest.map.y, "lock").setScale(0.78);
        this.nodeObjects.push(lock);
        return;
      }

      if (state === "completed") {
        const lit = this.add.image(quest.map.x, quest.map.y, "rune-lit").setScale(0.85);
        this.nodeObjects.push(lit);
      }
      if (state === "available") {
        void animate(this, reduced, {
          targets: node,
          scale: 0.9,
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }

      node.setInteractive({ useHandCursor: true }).on("pointerup", () => this.startQuest(quest.id));
    });
  }

  private refreshDynamicMapState(): void {
    if (!this.sys.settings.active || this.leaving) return;
    const progress = this.services.progress.current;
    for (const region of REGIONS) {
      const found = progress.rewardIds.includes(region.treasureId);
      const sprite = this.treasureSprites.get(region.treasureId);
      if (sprite) {
        sprite.setAlpha(found ? 0.55 : 1).setScale(found ? 0.75 : 0.9);
      }
    }
    this.drawNodes();
  }

  private spawnHero(): void {
    const progress = this.services.progress.current;
    // Place Aria at the next available quest or the most recently completed quest
    const activeQuest =
      this.services.quests.find((q) => questAvailability(q, progress) === "available") ??
      this.services.quests[0];
    const startX = (activeQuest?.map.x ?? 135) - 28;
    const startY = (activeQuest?.map.y ?? 395) + 18;

    this.pip = this.add.image(startX - 34, startY - 12, "owl").setScale(0.62);
    this.hero = this.add.image(startX, startY, "hero").setScale(0.78);
    this.guideSprites.set("pip", this.pip);
    this.pip.setInteractive({ useHandCursor: true }).on("pointerup", () => this.interactWithGuide("pip"));
  }

  private setupExplorationInput(): void {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
        down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
        left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
        right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      };
    }

    // Tap empty map terrain to walk Aria there
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (this.leaving || currentlyOver.length > 0) return;
      this.walkHeroTo(pointer.worldX, pointer.worldY);
    });
  }

  private walkHeroTo(x: number, y: number): void {
    const reduced = this.services.settings().reducedMotion;
    const targetX = Phaser.Math.Clamp(x, 48, WORLD.width - 48);
    const targetY = Phaser.Math.Clamp(y, 70, WORLD.height - 36);
    this.audio.step();
    void animate(this, reduced, {
      targets: this.hero,
      x: targetX,
      y: targetY,
      duration: 380,
      ease: "Sine.easeOut",
    });
    void animate(this, reduced, {
      targets: this.pip,
      x: targetX - 34,
      y: targetY - 12,
      duration: 440,
      ease: "Sine.easeOut",
    });
  }

  private checkProximityDiscoveries(): void {
    for (const region of REGIONS) {
      if (!this.services.progress.current.rewardIds.includes(region.treasureId)) {
        const dist = Phaser.Math.Distance.Between(
          this.hero.x,
          this.hero.y,
          region.treasurePos.x,
          region.treasurePos.y,
        );
        if (dist < 36) {
          void this.collectTreasure(region.treasureId);
        }
      }
    }
  }

  private interactWithGuide(guideId: GuideId): void {
    const sprite = this.guideSprites.get(guideId);
    const reduced = this.services.settings().reducedMotion;
    if (sprite && sprite !== this.pip) {
      this.walkHeroTo(sprite.x - 28, sprite.y);
    }
    if (sprite) {
      void animate(this, reduced, {
        targets: sprite,
        scale: sprite.scale * 1.18,
        duration: 180,
        yoyo: true,
        ease: "Back.easeOut",
      });
    }
    this.audio.discover();
    this.services.bridge.emit("mapDiscovery", { kind: "guide", guideId });
  }

  private async collectTreasure(treasureId: string): Promise<void> {
    const region = REGIONS.find((r) => r.treasureId === treasureId);
    if (!region) return;
    const sprite = this.treasureSprites.get(treasureId);
    const reduced = this.services.settings().reducedMotion;
    this.walkHeroTo(region.treasurePos.x + 24, region.treasurePos.y);

    this.audio.discover();
    if (sprite) {
      this.tweens.killTweensOf(sprite);
      await animate(this, reduced, {
        targets: sprite,
        scale: 1.25,
        duration: 220,
        yoyo: true,
        ease: "Back.easeOut",
      });
      sprite.setAlpha(0.55).setScale(0.75);
    }
    await this.services.progress.update((p) => discoverTreasure(p, treasureId));
    this.services.bridge.emit("mapDiscovery", {
      kind: "treasure",
      treasureId,
      nameKey: region.treasureNameKey,
    });
  }

  private startQuest(questId: string): void {
    const quest = findQuestOrSanctuary(questId, this.services.quests);
    if (!quest || this.leaving) return;
    if (!isPlayable(questAvailability(quest, this.services.progress.current))) return;

    this.leaving = true;
    this.scene.start(quest.sceneKey, { questId });
  }
}
