import Phaser from "phaser";
import { PALETTE, WORLD } from "../palette";
import { servicesOf, type GameServices } from "../services";
import { AudioSystem } from "../systems/AudioSystem";
import { animate } from "../systems/motion";
import { drawGround, drawNightSky, drawTreeLine } from "./drawing";
import { WorldMapScene } from "./WorldMapScene";

const GROUND_Y = 440;

/**
 * The Grand Starlight Celebration scene shown when the player restores
 * Moonwood's magic (or chooses to celebrate from the World Map).
 */
export class EndingScene extends Phaser.Scene {
  static readonly KEY = "Ending";

  private services!: GameServices;
  private audio!: AudioSystem;

  constructor() {
    super(EndingScene.KEY);
  }

  create(): void {
    this.services = servicesOf(this);
    this.audio = new AudioSystem(() => this.services.settings().sound);
    const reduced = this.services.settings().reducedMotion;

    drawNightSky(this, 77, "starfall-tower");
    drawTreeLine(this, 340, PALETTE.treeFar, 0.7, 31);

    // Aurora ribbons & restored Starlight Beacon in the sky
    const g = this.add.graphics();
    g.fillStyle(PALETTE.astraStar, 0.14).fillEllipse(480, 140, 760, 110);
    g.fillStyle(PALETTE.goldMana, 0.18).fillEllipse(480, 180, 620, 90);

    // Constellation lines uniting the four regions in the sky
    const constellationPts: [number, number][] = [
      [160, 130],
      [340, 85],
      [480, 110],
      [640, 80],
      [800, 125],
    ];
    g.lineStyle(3, PALETTE.goldMana, 0.65);
    g.beginPath();
    constellationPts.forEach(([x, y], i) => {
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.strokePath();
    for (const [x, y] of constellationPts) {
      const star = this.add.image(x, y, "star-node").setScale(0.85);
      void animate(this, reduced, {
        targets: star,
        scale: 1.08,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Central Starlight Beacon monument
    g.fillStyle(PALETTE.stoneDark).fillRect(430, 210, 100, GROUND_Y - 210);
    g.fillStyle(PALETTE.stone).fillRect(442, 220, 76, GROUND_Y - 220);
    g.fillStyle(PALETTE.goldMana, 0.3).fillCircle(480, 190, 58);
    g.fillStyle(PALETTE.goldMana).fillCircle(480, 190, 34);
    this.add.image(480, 190, "rune-lit").setScale(1.3);

    drawGround(this, GROUND_Y, "whispering-woods");
    drawTreeLine(this, WORLD.height + 30, PALETTE.treeNear, 0.5, 43);

    // Hero and all five companions celebrating together
    const party: { key: string; x: number; scale: number }[] = [
      { key: "moss", x: 200, scale: 1.15 },
      { key: "bramble", x: 310, scale: 1.15 },
      { key: "owl", x: 410, scale: 1.05 },
      { key: "hero", x: 485, scale: 1.25 },
      { key: "luma", x: 585, scale: 1.15 },
      { key: "astra", x: 700, scale: 1.15 },
    ];

    party.forEach(({ key, x, scale }, i) => {
      const sprite = this.add.image(x, GROUND_Y + 12, key).setOrigin(0.5, 1).setScale(scale);
      void animate(this, reduced, {
        targets: sprite,
        y: GROUND_Y - 14,
        duration: 650 + i * 70,
        delay: i * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });

    if (!reduced) {
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        const sparkle = this.add.image(480 + Math.cos(angle) * 40, 190 + Math.sin(angle) * 40, "sparkle");
        void animate(this, false, {
          targets: sparkle,
          x: 480 + Math.cos(angle) * 220,
          y: 190 + Math.sin(angle) * 120,
          alpha: 0,
          duration: 1400,
          repeat: -1,
          delay: i * 80,
          ease: "Quad.easeOut",
        });
      }
    }

    this.audio.fanfare();

    const offReturn = this.services.bridge.on("returnToMap", () => {
      this.scene.start(WorldMapScene.KEY);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, offReturn);

    this.services.bridge.emit("screen", { screen: "ending" });
  }
}
