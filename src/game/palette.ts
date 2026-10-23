/**
 * Cohesive storybook night-and-twilight palette across all four Moonwood regions.
 * Information is never carried by colour alone: every manipulative pairs color
 * with a distinct geometric silhouette (diamond, circle, bundled satchel,
 * notched plank, scroll, triangle/square shard, or 5-point star).
 */
export const PALETTE = {
  skyTop: 0x101a33,
  skyBottom: 0x223a5e,
  caveTop: 0x14132b,
  caveBottom: 0x2c2454,
  libraryTop: 0x1c1733,
  libraryBottom: 0x3b2848,
  towerTop: 0x0b1026,
  towerBottom: 0x1e2b58,

  moon: 0xf4ecd0,
  star: 0xfff7d6,
  treeFar: 0x1b3346,
  treeNear: 0x183b2c,
  ground: 0x22452f,
  groundEdge: 0x2f5c3c,
  caveGround: 0x28223d,
  caveGroundEdge: 0x463a68,
  libraryGround: 0x362421,
  libraryGroundEdge: 0x5c3d31,
  towerGround: 0x1e2846,
  towerGroundEdge: 0x3a4d7a,

  stone: 0x6f7a8c,
  stoneDark: 0x4a5363,
  door: 0x5b3a26,
  doorDark: 0x3e271a,
  runeIdle: 0x2b3245,
  runeLit: 0x9ff3ff,

  blueMana: 0x5cc8ff,
  blueManaEdge: 0x1f6fb2,
  goldMana: 0xffc94a,
  goldManaEdge: 0xb07a12,
  packPurple: 0xb983ff,
  packPurpleEdge: 0x5e35b1,
  plankWood: 0xc88a4b,
  plankWoodEdge: 0x6e421c,
  scrollParchment: 0xf9f1dc,
  scrollEdge: 0xc29b61,

  heroCloak: 0x3b5bdb,
  heroTrim: 0xffd43b,
  sprite: 0x7ed98b,
  spriteLeaf: 0x3e9f57,
  owl: 0xb08a63,
  owlBelly: 0xe9d6b8,
  brambleBody: 0x6d597a,
  brambleCrystal: 0xe0aaff,
  lumaFur: 0xf48c06,
  lumaCream: 0xfff3b0,
  astraStar: 0x72efdd,
  astraGold: 0xffe066,

  label: "#fff7d6",
  labelStroke: "#101a33",
} as const;

export const WORLD = { width: 960, height: 540 } as const;
