import type Phaser from "phaser";
import type { RegionId } from "../../content/schemas";
import { mulberry32, randomInt } from "../../learning/random";
import { PALETTE, WORLD } from "../palette";

/** Shared night-sky backdrop. Decorative only; deterministic for screenshots. */
export function drawNightSky(scene: Phaser.Scene, seed = 7, region: RegionId = "whispering-woods"): void {
  const g = scene.add.graphics();
  const top = {
    "whispering-woods": PALETTE.skyTop,
    "crystal-caves": PALETTE.caveTop,
    "enchanted-library": PALETTE.libraryTop,
    "starfall-tower": PALETTE.towerTop,
  }[region];
  const bottom = {
    "whispering-woods": PALETTE.skyBottom,
    "crystal-caves": PALETTE.caveBottom,
    "enchanted-library": PALETTE.libraryBottom,
    "starfall-tower": PALETTE.towerBottom,
  }[region];

  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, WORLD.width, WORLD.height);

  const rng = mulberry32(seed);
  g.fillStyle(PALETTE.star, 0.85);
  for (let i = 0; i < 65; i++) {
    g.fillCircle(randomInt(rng, 0, WORLD.width), randomInt(rng, 0, 260), randomInt(rng, 1, 2));
  }

  if (region !== "crystal-caves") {
    g.fillStyle(PALETTE.moon, 0.14).fillCircle(820, 88, 66);
    g.fillStyle(PALETTE.moon, 0.25).fillCircle(820, 88, 52);
    g.fillStyle(PALETTE.moon).fillCircle(820, 88, 40);
  } else {
    // Glowing ceiling crystals in Crystal Caves
    g.fillStyle(PALETTE.packPurple, 0.22);
    for (let x = 80; x < WORLD.width; x += 160) {
      g.fillTriangle(x - 28, 0, x + 28, 0, x, 75);
      g.fillStyle(PALETTE.blueMana, 0.45).fillTriangle(x - 12, 0, x + 12, 0, x, 48);
      g.fillStyle(PALETTE.packPurple, 0.22);
    }
  }
}

export function drawTreeLine(scene: Phaser.Scene, y: number, tint: number, scale: number, seed: number): void {
  const rng = mulberry32(seed);
  for (let x = -40; x < WORLD.width + 40; x += randomInt(rng, 55, 95)) {
    scene.add
      .image(x, y, "tree")
      .setOrigin(0.5, 1)
      .setScale(scale * (0.8 + rng.next() * 0.4))
      .setTint(tint);
  }
}

export function drawGround(scene: Phaser.Scene, top: number, region: RegionId = "whispering-woods"): void {
  const g = scene.add.graphics();
  const edge = {
    "whispering-woods": PALETTE.groundEdge,
    "crystal-caves": PALETTE.caveGroundEdge,
    "enchanted-library": PALETTE.libraryGroundEdge,
    "starfall-tower": PALETTE.towerGroundEdge,
  }[region];
  const fill = {
    "whispering-woods": PALETTE.ground,
    "crystal-caves": PALETTE.caveGround,
    "enchanted-library": PALETTE.libraryGround,
    "starfall-tower": PALETTE.towerGround,
  }[region];

  g.fillStyle(edge).fillRect(0, top, WORLD.width, 8);
  g.fillStyle(fill).fillRect(0, top + 8, WORLD.width, WORLD.height - top - 8);

  // Subtle decorative foreground details
  if (region === "whispering-woods") {
    scene.add.image(115, top + 4, "mushroom").setOrigin(0.5, 1).setScale(0.85);
    scene.add.image(855, top + 6, "mushroom").setOrigin(0.5, 1).setScale(0.75);
  }
}
