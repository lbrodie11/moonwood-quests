import type Phaser from "phaser";

/**
 * Tween helper that honours the "Calm motion" setting: with reduced motion
 * the end state is applied immediately (no movement, no pulsing). Nothing in
 * the game should flash more than three times per second either way.
 */
export function animate(
  scene: Phaser.Scene,
  reduced: boolean,
  config: Phaser.Types.Tweens.TweenBuilderConfig & { targets: object | object[] },
): Promise<void> {
  return new Promise((resolve) => {
    if (reduced) {
      const targets = Array.isArray(config.targets) ? config.targets : [config.targets];
      const skip = new Set(["targets", "duration", "delay", "ease", "yoyo", "repeat", "hold", "onComplete"]);
      for (const target of targets) {
        for (const [key, value] of Object.entries(config)) {
          if (skip.has(key) || typeof value === "function" || typeof value === "object") continue;
          // yoyo tweens return to their start value, so leave those properties alone.
          if (!config.yoyo) (target as Record<string, unknown>)[key] = value;
        }
      }
      resolve();
      return;
    }
    scene.tweens.add({ ...config, onComplete: () => resolve() });
  });
}

export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => scene.time.delayedCall(ms, resolve));
}
