import type Phaser from "phaser";

/**
 * Tween helper that honours the "Calm motion" setting: with reduced motion
 * the end state is applied immediately (no movement, no pulsing). Nothing in
 * the game should flash more than three times per second either way.
 *
 * Also resolves cleanly if the scene shuts down mid-tween so callers awaiting
 * `animate()` never hang when the player navigates away.
 */
export function animate(
  scene: Phaser.Scene,
  reduced: boolean,
  config: Phaser.Types.Tweens.TweenBuilderConfig & { targets: object | object[] },
): Promise<void> {
  return new Promise((resolve) => {
    if (reduced || !scene.sys.settings.active) {
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

    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      scene.events.off("shutdown", finish);
      resolve();
    };
    scene.events.once("shutdown", finish);
    scene.tweens.add({ ...config, onComplete: finish });
  });
}

export function wait(scene: Phaser.Scene, ms: number): Promise<void> {
  return new Promise((resolve) => {
    if (!scene.sys.settings.active) {
      resolve();
      return;
    }
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      scene.events.off("shutdown", finish);
      resolve();
    };
    scene.events.once("shutdown", finish);
    scene.time.delayedCall(ms, finish);
  });
}
