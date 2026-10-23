import type Phaser from "phaser";
import type { RegionId } from "../../content/schemas";
import { t } from "../../i18n";
import type { Challenge } from "../../learning/challenge";
import type { HintLevel } from "../../learning/session";
import { PALETTE, WORLD } from "../palette";
import { animate } from "../systems/motion";

export const GATE = { x: 480, top: 170, bottom: 440, halfWidth: 100 } as const;
export const GROUND_Y = 440;
const POOL_LEFT_X = 210;
const POOL_RIGHT_X = 750;
const POOL_TOP_Y = 290;
const CRYSTAL_GAP_X = 44;
const CRYSTAL_GAP_Y = 62;

export interface RegionTheme {
  portalColor: number;
  doorLeftColor: number;
  doorRightColor: number;
  archColor: number;
  farTrees: boolean;
  nearTrees: boolean;
  astrolabeRing: boolean;
}

export const REGION_THEMES: Readonly<Record<RegionId, RegionTheme>> = {
  "whispering-woods": {
    portalColor: PALETTE.moon,
    doorLeftColor: PALETTE.door,
    doorRightColor: PALETTE.doorDark,
    archColor: PALETTE.stone,
    farTrees: true,
    nearTrees: true,
    astrolabeRing: false,
  },
  "crystal-caves": {
    portalColor: PALETTE.packPurple,
    doorLeftColor: 0x3c2f58,
    doorRightColor: 0x281e3d,
    archColor: 0x5c4d7d,
    farTrees: false,
    nearTrees: false,
    astrolabeRing: false,
  },
  "enchanted-library": {
    portalColor: PALETTE.goldMana,
    doorLeftColor: PALETTE.door,
    doorRightColor: PALETTE.doorDark,
    archColor: 0x6e421c,
    farTrees: true,
    nearTrees: false,
    astrolabeRing: false,
  },
  "starfall-tower": {
    portalColor: PALETTE.astraStar,
    doorLeftColor: 0x2b3a67,
    doorRightColor: 0x1d2849,
    archColor: 0x8b9bb4,
    farTrees: false,
    nearTrees: false,
    astrolabeRing: true,
  },
};

export interface Manipulative {
  image: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  /** True if this item stays in the active counting row on Hint 2 (false for spent subtraction items). */
  countable: boolean;
  choiceValue?: number;
}

export interface SpawnedChallengeStage {
  crystals: Manipulative[];
  stageProps: Phaser.GameObjects.GameObject[];
  hintTextProp?: Phaser.GameObjects.Text;
}

const LABEL_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "system-ui, sans-serif",
  fontSize: "18px",
  fontStyle: "bold",
  color: PALETTE.label,
  stroke: PALETTE.labelStroke,
  strokeThickness: 4,
};

function placeGroup(
  scene: Phaser.Scene,
  reduced: boolean,
  crystals: Manipulative[],
  opts: {
    count: number;
    centerX: number;
    startY?: number;
    texture: string;
    labelFor: (index: number) => string;
    showCounts: boolean;
    alpha?: number;
    countable?: boolean;
  },
): void {
  const {
    count,
    centerX,
    startY = POOL_TOP_Y,
    texture,
    labelFor,
    showCounts,
    alpha = 1,
    countable = true,
  } = opts;

  for (let i = 0; i < count; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = centerX + (col - 2) * CRYSTAL_GAP_X;
    const y = startY + row * CRYSTAL_GAP_Y;
    const image = scene.add
      .image(x, y, texture)
      .setAlpha(alpha)
      .setScale(reduced ? 1 : 0);
    const label = scene.add
      .text(x, y + 30, labelFor(i), LABEL_STYLE)
      .setOrigin(0.5)
      .setVisible(showCounts);

    image.setInteractive({ useHandCursor: true }).on("pointerdown", () => label.setVisible(true));

    void animate(scene, reduced, {
      targets: image,
      scale: 1,
      duration: 260,
      delay: i * 45,
      ease: "Back.easeOut",
    });
    crystals.push({ image, label, countable });
  }
}

export function spawnChallengeStage(
  scene: Phaser.Scene,
  reduced: boolean,
  challenge: Challenge,
  onSelectChoice: (value: number) => void,
): SpawnedChallengeStage {
  const crystals: Manipulative[] = [];
  const stageProps: Phaser.GameObjects.GameObject[] = [];
  const showCounts = challenge.representation === "objects";

  if (challenge.operator === "tens-ones") {
    const [tens = 0, ones = 0] = challenge.operands;
    placeGroup(scene, reduced, crystals, {
      count: tens,
      centerX: POOL_LEFT_X,
      texture: "crystal-pack-10",
      labelFor: (i) => String((i + 1) * 10),
      showCounts,
    });
    placeGroup(scene, reduced, crystals, {
      count: ones,
      centerX: POOL_RIGHT_X,
      texture: "crystal-gold",
      labelFor: (i) => String(tens * 10 + i + 1),
      showCounts,
    });
    return { crystals, stageProps };
  }

  if (challenge.operator === "unknown-equation") {
    const [a = 0, b = 0, structureCode = 1] = challenge.operands;
    const knownCount = Math.min(20, a);
    placeGroup(scene, reduced, crystals, {
      count: knownCount,
      centerX: POOL_LEFT_X,
      texture: "crystal-blue",
      labelFor: (i) => String(i + 1),
      showCounts,
    });

    // Draw an alchemy mystery vessel on the right side for the unknown quantity `?`
    const vesselBox = scene.add.graphics();
    vesselBox.lineStyle(3, PALETTE.astraGold, 0.9);
    vesselBox.strokeRoundedRect(POOL_RIGHT_X - 54, POOL_TOP_Y - 28, 108, 68, 10);
    const eqText =
      structureCode === 1
        ? `${a} + ? = ${b}`
        : structureCode === 2
          ? `? + ${a} = ${b}`
          : structureCode === 3
            ? `${a} - ? = ${b}`
            : `${a} = ? - ${b}`;
    const vesselLabel = scene.add
      .text(POOL_RIGHT_X, POOL_TOP_Y + 6, eqText, LABEL_STYLE)
      .setOrigin(0.5);
    stageProps.push(vesselBox, vesselLabel);
    return { crystals, stageProps };
  }

  if (challenge.operator === "-") {
    // Draw the whole starting pool of `whole` crystals together without pre-isolating
    // the remainder, so the child performs subtraction rather than counting a pre-split answer.
    const [whole = 0, spent = 0] = challenge.operands;
    const remaining = Math.max(0, whole - spent);
    const cols = Math.min(10, Math.max(5, whole));
    const startX = WORLD.width / 2 - ((Math.min(whole, cols) - 1) * CRYSTAL_GAP_X) / 2;

    for (let i = 0; i < whole; i++) {
      const isSpent = i >= remaining;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * CRYSTAL_GAP_X;
      const y = POOL_TOP_Y + row * CRYSTAL_GAP_Y;
      const image = scene.add
        .image(x, y, isSpent ? "crystal-gold" : "crystal-blue")
        .setAlpha(isSpent ? 0.38 : 1)
        .setScale(reduced ? 1 : 0);
      const label = scene.add
        .text(x, y + 30, isSpent ? `×` : String(i + 1), LABEL_STYLE)
        .setOrigin(0.5)
        .setVisible(false);

      image.setInteractive({ useHandCursor: true }).on("pointerdown", () => label.setVisible(true));
      void animate(scene, reduced, {
        targets: image,
        scale: 1,
        duration: 260,
        delay: i * 35,
        ease: "Back.easeOut",
      });
      crystals.push({ image, label, countable: !isSpent });
    }
    return { crystals, stageProps };
  }

  if (challenge.operator === "length") {
    const [a = 0, b = 0] = challenge.operands;
    const isMissingPlank = challenge.promptKey.includes("missing");

    if (!isMissingPlank) {
      placeGroup(scene, reduced, crystals, {
        count: a,
        centerX: POOL_LEFT_X,
        texture: "plank-tile",
        labelFor: (i) => String(i + 1),
        showCounts,
      });
      placeGroup(scene, reduced, crystals, {
        count: b,
        centerX: POOL_RIGHT_X,
        texture: "plank-tile",
        labelFor: (i) => String(a + i + 1),
        showCounts,
      });
      return { crystals, stageProps };
    }

    // Missing plank comparison (1.MD.A.1 & 1.MD.A.2): align the full span of `a` moon-tiles
    // above the known plank of `b` moon-tiles from the same left edge, with an
    // un-subdivided gap box so the picture does not pre-count `a - b` for the child.
    const tileGap = Math.min(36, 680 / Math.max(1, a));
    const leftEdge = WORLD.width / 2 - ((a - 1) * tileGap) / 2;
    const topRowY = 265;
    const bottomRowY = 345;

    for (let i = 0; i < a; i++) {
      const x = leftEdge + i * tileGap;
      const image = scene.add.image(x, topRowY, "plank-tile").setScale(reduced ? 0.9 : 0);
      const label = scene.add
        .text(x, topRowY + 26, String(i + 1), LABEL_STYLE)
        .setOrigin(0.5)
        .setVisible(showCounts);
      image.setInteractive({ useHandCursor: true }).on("pointerdown", () => label.setVisible(true));
      void animate(scene, reduced, {
        targets: image,
        scale: 0.9,
        duration: 240,
        delay: i * 30,
        ease: "Back.easeOut",
      });
      crystals.push({ image, label, countable: i >= b });
    }

    for (let i = 0; i < b; i++) {
      const x = leftEdge + i * tileGap;
      const image = scene.add
        .image(x, bottomRowY, "plank-tile")
        .setTint(0xc89f65)
        .setScale(reduced ? 0.9 : 0);
      const label = scene.add
        .text(x, bottomRowY + 26, String(i + 1), LABEL_STYLE)
        .setOrigin(0.5)
        .setVisible(showCounts);
      void animate(scene, reduced, {
        targets: image,
        scale: 0.9,
        duration: 240,
        delay: i * 30,
        ease: "Back.easeOut",
      });
      crystals.push({ image, label, countable: false });
    }

    const gapStartX = leftEdge + b * tileGap - tileGap * 0.4;
    const gapWidth = Math.max(40, (a - b) * tileGap);
    const gapBox = scene.add.graphics();
    gapBox.lineStyle(3, PALETTE.astraGold, 0.85);
    gapBox.strokeRoundedRect(gapStartX, bottomRowY - 16, gapWidth, 32, 6);
    const gapMark = scene.add
      .text(gapStartX + gapWidth / 2, bottomRowY, "?", LABEL_STYLE)
      .setOrigin(0.5);
    stageProps.push(gapBox, gapMark);

    return { crystals, stageProps };
  }

  if (challenge.operator === "shapes") {
    const [a = 0, b = 0] = challenge.operands;
    const frame = scene.add.graphics();
    frame.lineStyle(3, PALETTE.astraGold, 0.55);
    frame.strokeCircle(POOL_LEFT_X, POOL_TOP_Y + 24, 118);
    frame.strokeCircle(POOL_RIGHT_X, POOL_TOP_Y + 24, 118);
    stageProps.push(frame);

    placeGroup(scene, reduced, crystals, {
      count: a,
      centerX: POOL_LEFT_X,
      texture: "sigil-triangle",
      labelFor: (i) => String(i + 1),
      showCounts,
    });
    placeGroup(scene, reduced, crystals, {
      count: b,
      centerX: POOL_RIGHT_X,
      texture: "sigil-diamond",
      labelFor: (i) => String(a + i + 1),
      showCounts,
    });
    return { crystals, stageProps };
  }

  if (
    challenge.operator === "phonics" ||
    challenge.operator === "comprehension" ||
    challenge.operator === "vocabulary" ||
    challenge.operator === "spelling" ||
    challenge.operator === "reasoning" ||
    challenge.operator === "science" ||
    challenge.operator === "workshop"
  ) {
    const [targetId = 1] = challenge.operands;
    const isPhonics = challenge.operator === "phonics";
    const isStoryPhonics = isPhonics && challenge.promptKey.includes("story");
    const targetIcon = isPhonics
      ? isStoryPhonics
        ? "📖"
        : t(`challenge.phonics.word.${targetId}.icon`)
      : "✨";
    const rawSounds = isPhonics ? t(`challenge.phonics.word.${targetId}.sounds`) : "";
    const elkoninBoxes = isPhonics
      ? rawSounds
          .split("-")
          .map(() => "▢")
          .join(" ")
      : "";

    const clueBadge = scene.add
      .text(GATE.x, 225, targetIcon, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "44px",
      })
      .setOrigin(0.5);
    const hintTextProp = scene.add
      .text(GATE.x, 268, elkoninBoxes, {
        ...LABEL_STYLE,
        fontSize: "18px",
        color: "#ffe680",
      })
      .setOrigin(0.5)
      .setVisible(false);
    stageProps.push(clueBadge, hintTextProp);

    const positions = [210, 480, 750];
    challenge.choices.forEach((choiceId, idx) => {
      const x = positions[idx] ?? 480;
      const y = 345;
      const image = scene.add.image(x, y, "story-scroll").setScale(reduced ? 1.15 : 0);
      const rawText = isPhonics
        ? t(`challenge.phonics.word.${choiceId}.word`)
        : String(idx + 1);
      const label = scene.add
        .text(x, y + 40, rawText, LABEL_STYLE)
        .setOrigin(0.5)
        .setVisible(true);

      image.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        onSelectChoice(choiceId);
      });
      void animate(scene, reduced, {
        targets: image,
        scale: 1.15,
        duration: 260,
        delay: idx * 60,
        ease: "Back.easeOut",
      });
      crystals.push({ image, label, countable: true, choiceValue: choiceId });
    });
    return { crystals, stageProps, hintTextProp };
  }

  if (challenge.operator === "pattern") {
    const [s1 = 0, s2 = 0, s3 = 0, step = 1] = challenge.operands;
    const xs = [180, 360, 580, 780];
    const isNumberLine = challenge.representation === "number-line";
    const ys = isNumberLine ? [280, 280, 280, 280] : [265, 225, 225, 265];
    const values = [String(s1), String(s2), String(s3), "?"];

    const line = scene.add.graphics();
    line.lineStyle(4, PALETTE.astraGold, 0.75);
    line.beginPath();
    xs.forEach((x, idx) => {
      const y = ys[idx] ?? 260;
      if (idx === 0) line.moveTo(x, y);
      else line.lineTo(x, y);
    });
    line.strokePath();
    stageProps.push(line);

    const hintTextProp = scene.add
      .text(GATE.x, 195, `+${step}   +${step}   +${step}`, {
        ...LABEL_STYLE,
        color: "#ffe680",
      })
      .setOrigin(0.5)
      .setVisible(showCounts || isNumberLine);
    stageProps.push(hintTextProp);

    xs.forEach((x, idx) => {
      const y = ys[idx] ?? 260;
      const image = scene.add.image(x, y, "star-node").setScale(reduced ? 1 : 0);
      const label = scene.add
        .text(x, y + 32, values[idx] ?? "", LABEL_STYLE)
        .setOrigin(0.5)
        .setVisible(true);
      void animate(scene, reduced, {
        targets: image,
        scale: 1,
        duration: 260,
        delay: idx * 60,
        ease: "Back.easeOut",
      });
      crystals.push({ image, label, countable: true });
    });
    return { crystals, stageProps, hintTextProp };
  }

  // Default: "+" (add-within-20)
  const [a = 0, b = 0] = challenge.operands;
  placeGroup(scene, reduced, crystals, {
    count: a,
    centerX: POOL_LEFT_X,
    texture: "crystal-blue",
    labelFor: (i) => String(i + 1),
    showCounts,
  });
  placeGroup(scene, reduced, crystals, {
    count: b,
    centerX: POOL_RIGHT_X,
    texture: "crystal-gold",
    labelFor: (i) => String(a + i + 1),
    showCounts,
  });
  return { crystals, stageProps };
}

export async function animateChallengeHint(
  scene: Phaser.Scene,
  reduced: boolean,
  challenge: Challenge,
  stage: SpawnedChallengeStage,
  level: HintLevel,
): Promise<void> {
  const { crystals, stageProps, hintTextProp } = stage;
  for (const { label } of crystals) label.setVisible(true);
  if (hintTextProp) hintTextProp.setVisible(true);

  if (level === 1) {
    await Promise.all(
      crystals.map(({ image }, i) =>
        animate(scene, reduced, { targets: image, scale: 1.22, duration: 130, delay: i * 90, yoyo: true }),
      ),
    );
    return;
  }

  const scrollOperators = new Set([
    "phonics",
    "pattern",
    "comprehension",
    "vocabulary",
    "spelling",
    "reasoning",
    "science",
    "workshop",
  ]);

  if (!scrollOperators.has(challenge.operator)) {
    const countableItems = crystals.filter((c) => c.countable);
    const n = countableItems.length;
    const gap = Math.min(44, 780 / Math.max(1, n));
    const startX = WORLD.width / 2 - ((n - 1) * gap) / 2;

    await Promise.all(
      countableItems.flatMap(({ image, label }, i) => {
        label.setText(
          challenge.operator === "tens-ones" && i < (challenge.operands[0] ?? 0)
            ? String((i + 1) * 10)
            : String(i + 1),
        );
        return [
          animate(scene, reduced, {
            targets: image,
            x: startX + i * gap,
            y: GROUND_Y + 26,
            duration: 420,
            ease: "Cubic.easeInOut",
          }),
          animate(scene, reduced, {
            targets: label,
            x: startX + i * gap,
            y: GROUND_Y + 58,
            duration: 420,
            ease: "Cubic.easeInOut",
          }),
        ];
      }),
    );
  }

  // Level 3: Add a golden guided-magic banner/halo on the canvas so Hint 3 is
  // visually distinct from Hint 2 on the canvas as well as in the DOM.
  if (level === 3 && scene.sys.settings.active) {
    const targetScroll = crystals.find((c) => c.choiceValue === challenge.correctAnswer);
    const highlightX = targetScroll ? targetScroll.image.x : GATE.x;
    const highlightY = targetScroll ? targetScroll.image.y : GATE.top + 115;
    const halo = scene.add.graphics();
    halo.lineStyle(4, PALETTE.astraGold, 0.95);
    halo.strokeCircle(highlightX, highlightY, 44);
    stageProps.push(halo);
  }
}
