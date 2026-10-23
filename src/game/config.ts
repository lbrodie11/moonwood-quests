import Phaser from "phaser";
import { PALETTE, WORLD } from "./palette";
import { BootScene } from "./scenes/BootScene";
import { EndingScene } from "./scenes/EndingScene";
import { ForestQuestScene } from "./scenes/ForestQuestScene";
import { WorldMapScene } from "./scenes/WorldMapScene";

/**
 * Fixed logical resolution; Phaser scales the canvas to fit. Authored
 * layouts and visual-regression screenshots stay stable across devices.
 */
export function createGameConfig(preBoot: (game: Phaser.Game) => void): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "game-root",
    width: WORLD.width,
    height: WORLD.height,
    backgroundColor: PALETTE.skyTop,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // The game synthesizes its own sound effects via Web Audio in AudioSystem.
    audio: { noAudio: true },
    // Lower-power devices are a primary target (school tablets).
    fps: { target: 60, smoothStep: true },
    render: { antialias: true, powerPreference: "low-power" },
    banner: false,
    callbacks: { preBoot },
    scene: [BootScene, WorldMapScene, ForestQuestScene, EndingScene],
  };
}
