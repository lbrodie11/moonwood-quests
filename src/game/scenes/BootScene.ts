import Phaser from "phaser";
import { PALETTE } from "../palette";
import { WorldMapScene } from "./WorldMapScene";

/**
 * Generates cohesive, multi-layered storybook textures at startup so every
 * character, manipulative, and landmark renders crisply with zero network latency.
 * See assets/ART_DIRECTION.md for the visual style specification.
 */
export class BootScene extends Phaser.Scene {
  static readonly KEY = "Boot";

  constructor() {
    super(BootScene.KEY);
  }

  create(): void {
    const g = this.make.graphics({}, false);

    // 1. Blue mana: faceted diamond crystal (distinct shape from gold).
    g.fillStyle(PALETTE.blueManaEdge).fillPoints(pts([[18, 0], [36, 22], [18, 44], [0, 22]]), true);
    g.fillStyle(PALETTE.blueMana).fillPoints(pts([[18, 4], [31, 22], [18, 40], [5, 22]]), true);
    g.fillStyle(0xb8ecff, 0.85).fillPoints(pts([[18, 6], [26, 20], [18, 22], [11, 20]]), true);
    g.fillStyle(0xffffff, 0.75).fillCircle(15, 13, 2.5);
    g.generateTexture("crystal-blue", 36, 44).clear();

    // 2. Gold mana: radiant sun-gem circle with inner ring.
    g.fillStyle(PALETTE.goldManaEdge).fillCircle(20, 20, 19);
    g.fillStyle(PALETTE.goldMana).fillCircle(20, 20, 15);
    g.lineStyle(2, 0xffe89e, 0.85).strokeCircle(20, 20, 11);
    g.fillStyle(0xffffff, 0.7).fillCircle(14, 13, 4);
    g.generateTexture("crystal-gold", 40, 40).clear();

    // 3. Rune satchel of 10 (tens-and-ones): bundled amethyst pouch with 10-dot crest.
    g.fillStyle(PALETTE.packPurpleEdge).fillRoundedRect(4, 10, 44, 38, 10);
    g.fillStyle(PALETTE.packPurple).fillRoundedRect(7, 13, 38, 32, 8);
    g.fillStyle(PALETTE.goldMana).fillRect(14, 10, 24, 5);
    g.fillStyle(0xffffff, 0.9);
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      g.fillCircle(14 + col * 6, 24 + row * 9, 2);
    }
    g.generateTexture("crystal-pack-10", 52, 50).clear();

    // 4. Bridge moon-tile plank (compare-lengths): carved timber with glowing inlay.
    g.fillStyle(PALETTE.plankWoodEdge).fillRoundedRect(0, 4, 42, 32, 6);
    g.fillStyle(PALETTE.plankWood).fillRoundedRect(3, 7, 36, 26, 4);
    g.lineStyle(2, PALETTE.runeLit, 0.9).strokeRoundedRect(8, 11, 26, 18, 3);
    g.fillStyle(PALETTE.runeLit, 0.85).fillCircle(21, 20, 4);
    g.generateTexture("plank-tile", 42, 40).clear();

    // 5. Geometric sigil shards (compose-shapes): triangle and diamond tiles.
    g.fillStyle(PALETTE.blueManaEdge).fillTriangle(20, 2, 38, 36, 2, 36);
    g.fillStyle(PALETTE.runeLit).fillTriangle(20, 7, 33, 33, 7, 33);
    g.generateTexture("sigil-triangle", 40, 40).clear();

    g.fillStyle(PALETTE.goldManaEdge).fillRoundedRect(4, 4, 32, 32, 5);
    g.fillStyle(PALETTE.goldMana).fillRoundedRect(8, 8, 24, 24, 4);
    g.lineStyle(2, 0xffffff, 0.8).strokeRect(12, 12, 16, 16);
    g.generateTexture("sigil-diamond", 40, 40).clear();

    // 6. Enchanted story scroll (phonics-words): parchment page with wax seal.
    g.fillStyle(PALETTE.scrollEdge).fillRoundedRect(4, 2, 48, 56, 6);
    g.fillStyle(PALETTE.scrollParchment).fillRoundedRect(7, 5, 42, 50, 4);
    g.lineStyle(2, 0x8d6e63).lineBetween(13, 16, 43, 16).lineBetween(13, 24, 39, 24);
    g.fillStyle(0xe63946).fillCircle(28, 41, 7);
    g.fillStyle(PALETTE.goldMana).fillCircle(28, 41, 4);
    g.generateTexture("story-scroll", 56, 60).clear();

    // 7. Constellation star node (star-patterns).
    g.fillStyle(PALETTE.goldManaEdge).fillCircle(22, 22, 20);
    g.fillStyle(PALETTE.astraGold).fillPoints(
      pts([
        [22, 2], [27, 15], [41, 16], [30, 25], [34, 39],
        [22, 31], [10, 39], [14, 25], [3, 16], [17, 15],
      ]),
      true,
    );
    g.fillStyle(0xffffff, 0.8).fillCircle(22, 21, 5);
    g.generateTexture("star-node", 44, 44).clear();

    // 8. Rune sockets.
    g.fillStyle(PALETTE.stoneDark).fillCircle(20, 20, 20);
    g.fillStyle(PALETTE.runeIdle).fillCircle(20, 20, 15);
    g.lineStyle(3, 0x3d475f).strokeCircle(20, 20, 8);
    g.generateTexture("rune-idle", 40, 40).clear();

    g.fillStyle(PALETTE.stoneDark).fillCircle(20, 20, 20);
    g.fillStyle(PALETTE.runeLit).fillCircle(20, 20, 15);
    g.lineStyle(3, 0xffffff).strokeCircle(20, 20, 8);
    g.lineBetween(20, 8, 20, 32).lineBetween(8, 20, 32, 20);
    g.generateTexture("rune-lit", 40, 40).clear();

    // 9. Sparkle & Hidden Star-Treasure icon.
    g.fillStyle(PALETTE.star).fillPoints(
      pts([[8, 0], [10, 6], [16, 8], [10, 10], [8, 16], [6, 10], [0, 8], [6, 6]]),
      true,
    );
    g.generateTexture("sparkle", 16, 16).clear();

    g.fillStyle(PALETTE.goldMana, 0.3).fillCircle(24, 24, 22);
    g.fillStyle(PALETTE.goldManaEdge).fillRoundedRect(10, 16, 28, 20, 5);
    g.fillStyle(PALETTE.goldMana).fillRoundedRect(12, 18, 24, 16, 4);
    g.fillStyle(PALETTE.runeLit).fillCircle(24, 24, 5);
    g.generateTexture("treasure-star", 48, 48).clear();

    // 10. Environment props: Pine Tree & Glowing Mushroom.
    g.fillStyle(0xffffff);
    g.fillTriangle(60, 0, 4, 100, 116, 100)
      .fillTriangle(60, 45, 0, 155, 120, 155)
      .fillTriangle(60, 90, 8, 175, 112, 175)
      .fillRect(51, 172, 18, 28);
    g.generateTexture("tree", 120, 200).clear();

    g.fillStyle(0xe9d6b8).fillRoundedRect(16, 20, 8, 18, 3);
    g.fillStyle(PALETTE.sprite).fillEllipse(20, 18, 32, 18);
    g.fillStyle(0xffffff, 0.75).fillCircle(13, 15, 3).fillCircle(24, 14, 2.5).fillCircle(20, 20, 2);
    g.generateTexture("mushroom", 40, 40).clear();

    // 11. Apprentice Aria (Young Hero).
    g.fillStyle(PALETTE.heroCloak).fillTriangle(32, 4, 10, 34, 54, 34); // pointed apprentice hat
    g.fillStyle(PALETTE.heroTrim).fillRect(14, 30, 36, 4);
    g.fillStyle(0xffdfba).fillCircle(32, 42, 12); // warm face
    g.fillStyle(0x1a1a2e).fillCircle(28, 41, 2.5).fillCircle(36, 41, 2.5);
    g.fillStyle(PALETTE.heroCloak).fillRoundedRect(16, 52, 32, 26, 9); // cloak body
    g.fillStyle(PALETTE.heroTrim).fillCircle(32, 60, 4); // star brooch
    g.fillStyle(PALETTE.goldMana, 0.9).fillCircle(52, 58, 7); // glowing lantern
    g.fillStyle(0xffffff, 0.8).fillCircle(52, 58, 3.5);
    g.generateTexture("hero", 64, 82).clear();

    // 12. Moss the forest sprite (Region 1 companion).
    g.fillStyle(PALETTE.spriteLeaf).fillEllipse(20, 14, 18, 28).fillEllipse(44, 14, 18, 28);
    g.fillStyle(PALETTE.sprite).fillCircle(32, 38, 22);
    g.fillStyle(0xffadad, 0.65).fillCircle(18, 42, 4).fillCircle(46, 42, 4);
    g.fillStyle(0x10301a).fillCircle(24, 36, 4).fillCircle(40, 36, 4);
    g.fillStyle(0xffffff).fillCircle(25, 35, 1.5).fillCircle(41, 35, 1.5);
    g.lineStyle(2.5, 0x10301a).beginPath().arc(32, 42, 7, 0.2, Math.PI - 0.2).strokePath();
    g.generateTexture("moss", 64, 64).clear();

    // 13. Pip the owl guide.
    g.fillStyle(PALETTE.owl).fillEllipse(35, 46, 60, 66).fillTriangle(10, 18, 18, 0, 26, 16).fillTriangle(44, 16, 52, 0, 60, 18);
    g.fillStyle(PALETTE.owlBelly).fillEllipse(35, 56, 36, 40);
    g.fillStyle(0x2a9d8f).fillRoundedRect(14, 42, 42, 8, 4); // scholar's scarf
    g.fillStyle(0xffffff).fillCircle(24, 30, 10).fillCircle(46, 30, 10);
    g.fillStyle(0x1a1a1a).fillCircle(24, 31, 5).fillCircle(46, 31, 5);
    g.fillStyle(0xffffff).fillCircle(22, 29, 2).fillCircle(44, 29, 2);
    g.fillStyle(0xf0a530).fillTriangle(31, 36, 39, 36, 35, 44);
    g.generateTexture("owl", 70, 80).clear();

    // 14. Bramble the crystal mole (Region 2 companion).
    g.fillStyle(PALETTE.brambleCrystal)
      .fillTriangle(20, 10, 28, 28, 12, 28)
      .fillTriangle(34, 6, 44, 28, 24, 28)
      .fillTriangle(48, 12, 54, 28, 40, 28);
    g.fillStyle(PALETTE.brambleBody).fillEllipse(34, 44, 52, 40);
    g.fillStyle(0xe9d6b8).fillEllipse(34, 48, 28, 22);
    g.fillStyle(PALETTE.goldMana).fillCircle(34, 24, 6); // miner's headlamp
    g.fillStyle(0x1a1a2e).fillCircle(25, 40, 3.5).fillCircle(43, 40, 3.5);
    g.fillStyle(0xff8fa3).fillEllipse(34, 45, 9, 6); // mole nose
    g.generateTexture("bramble", 68, 68).clear();

    // 15. Luma the librarian fox (Region 3 companion).
    g.fillStyle(PALETTE.lumaFur).fillTriangle(12, 26, 18, 4, 28, 24).fillTriangle(40, 24, 50, 4, 56, 26);
    g.fillStyle(PALETTE.lumaFur).fillEllipse(34, 42, 46, 42);
    g.fillStyle(PALETTE.lumaCream).fillEllipse(34, 48, 30, 26);
    g.lineStyle(2.5, PALETTE.goldMana).strokeCircle(25, 36, 7).strokeCircle(43, 36, 7).lineBetween(32, 36, 36, 36); // spectacles
    g.fillStyle(0x1a1a2e).fillCircle(25, 36, 3).fillCircle(43, 36, 3);
    g.fillStyle(0x1a1a2e).fillCircle(34, 44, 3);
    g.generateTexture("luma", 68, 68).clear();

    // 16. Astra the starlight sprite (Region 4 companion).
    g.fillStyle(PALETTE.astraGold, 0.35).fillCircle(34, 36, 30);
    g.fillStyle(PALETTE.astraStar).fillPoints(
      pts([
        [34, 6], [42, 24], [62, 26], [46, 40], [50, 60],
        [34, 50], [18, 60], [22, 40], [6, 26], [26, 24],
      ]),
      true,
    );
    g.fillStyle(0xfff7e6).fillCircle(34, 36, 15);
    g.fillStyle(0x1d3557).fillCircle(29, 35, 3).fillCircle(39, 35, 3);
    g.lineStyle(2, 0x1d3557).beginPath().arc(34, 39, 5, 0.2, Math.PI - 0.2).strokePath();
    g.generateTexture("astra", 68, 68).clear();

    // 17. Map node and lock icons.
    g.fillStyle(0xffffff).fillCircle(32, 32, 30);
    g.lineStyle(4, 0x101a33, 0.5).strokeCircle(32, 32, 26);
    g.generateTexture("node", 64, 64).clear();

    g.fillStyle(0x2b3245).fillRoundedRect(10, 22, 28, 22, 4);
    g.lineStyle(5, 0x2b3245).beginPath().arc(24, 22, 9, Math.PI, 0).strokePath();
    g.generateTexture("lock", 48, 48).clear();

    g.destroy();
    this.scene.start(WorldMapScene.KEY);
  }
}

function pts(points: readonly [number, number][]): Phaser.Math.Vector2[] {
  return points.map(([x, y]) => new Phaser.Math.Vector2(x, y));
}
