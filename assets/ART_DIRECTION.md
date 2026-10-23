# Moonwood Quests — Visual Style Guide & Art Direction

This document defines the cohesive visual language for **Moonwood Quests**, a storybook fantasy learning adventure for children ages 6–7.

## 1. Creative Vision & Aesthetic Pillars

- **Storybook Twilight Enchantment**: Rich nocturnal and dawn-lit palettes inspired by illustrated children's picture books—warm, cozy, and inviting rather than dark or frightening.
- **Clarity for Young Eyes**: High figure-ground contrast between interactive foreground elements (crystals, runes, bridge planks, story scrolls, geometric sigils, characters) and soft atmospheric backgrounds.
- **Never by Color Alone**: Every interactive element pairs color with a distinct silhouette, geometric shape, and pattern (e.g., diamond blue mana vs. round gold mana; bundled rune satchels vs. loose gems; carved plank notches; distinct geometric sigils).

## 2. Character Proportions & Silhouettes

All characters share a rounded, approachable **storybook proportion system** (~1:2.5 head-to-body ratio) with expressive eyes, clear silhouettes readable at `64×64` to `96×96` pixels, and zero sharp/threatening angles:

| Character | Role & Region | Silhouette & Visual Cues |
|---|---|---|
| **Aria** (Young Hero) | Player Apprentice (All Regions) | Pointed starlight hood, flowing indigo-and-gold travel cloak, warm lantern in hand; dynamically displays earned rewards (`Crystal Wand`, `Star Robe`, `Crown of Moonwood`). |
| **Pip** (Owl Guide) | Mentor & Narrator (All Regions) | Plump rounded owl body, prominent ear tufts, oversized warm amber eyes, teal scholar's scarf. |
| **Moss** (Forest Sprite) | Region 1 Companion (*Whispering Woods*) | Spherical emerald sprout body, twin symmetrical fern-leaf ears, rosy glowing cheeks, dewy leaf crown. |
| **Bramble** (Crystal Mole) | Region 2 Companion (*Crystal Caves*) | Stocky rounded badger/mole silhouette, glowing amethyst crystal cluster on back, brass miner's headband lantern. |
| **Luma** (Librarian Fox) | Region 3 Companion (*Enchanted Library & Ravine*) | Petite kitsune-fox silhouette, oversized round brass spectacles, star-tipped fluffy tail, open enchanted book. |
| **Astra** (Starlight Sprite) | Region 4 Companion (*Starfall Tower*) | Five-pointed star cloak silhouette, floating crescent-moon diadem, shimmering cyan-and-gold celestial aura. |

## 3. Environmental Palette by Region

| Region | Sky / Backdrop | Midground & Architecture | Interactive Accent Colors |
|---|---|---|---|
| **1. Whispering Woods** | Deep twilight navy (`#101a33` → `#223a5e`) | Mossy emerald pines (`#183b2c`), ancient warm slate stone (`#6f7a8c`), bioluminescent mushrooms (`#7ed98b`) | Sky-blue diamond mana (`#5cc8ff`), warm gold round mana (`#ffc94a`), cyan runes (`#9ff3ff`) |
| **2. Crystal Caves** | Deep cavern indigo (`#14132b` → `#2a2550`) | Amethyst stalactites (`#4a3b78`), warm timber mine beams (`#6b442a`), glowing geodes | Violet tens-packs (`#b983ff`), aquamarine loose gems (`#5ce1e6`), amber lantern light (`#ffb84d`) |
| **3. Enchanted Library & Ravine** | Dusk plum & warm amber (`#1a1836` → `#38284c`) | Giant hollow heartwood library tree (`#4e3222`), golden candlelight (`#ffd166`), parchment scrolls (`#f9f1dc`) | Measured moon-tiles (`#7ce8ff`), emerald ink runes (`#7ed98b`), ruby wax seals (`#ff758f`) |
| **4. Starfall Tower** | Celestial midnight (`#0b1026` → `#1e2b58`) | Astral marble spires (`#8b9bb4`), brass astrolabe rings (`#e0a96d`), stained-glass sigil altar | Starlight gold (`#ffe066`), aurora cyan (`#72efdd`),rose-nebula (`#ff8fab`) |

## 4. Lighting & Atmospheric Treatment

- **Warm Focal Glows**: Soft radial halos (`alpha: 0.15–0.35`) behind active runes, lanterns, portals, and the moon guide the child's eye naturally to the active problem area.
- **Depth & Parallax**: Three distinct depth planes in every scene—distant sky/stars or cavern roof, mid-ground silhouettes (trees, arches, bookshelves, spires), and a grounded foreground stage at `y = 430–440`.
- **Subtle Magical Particles**: Fireflies, crystal motes, floating parchment sparkles, and starlight dust move gently and respect Calm Motion (`reducedMotion`).

## 5. Texture, Illustration & Export Format

- **Cohesive Vector & Procedural Art**:
  - Static region emblems, character portraits, and collectible badges are authored as clean, scalable SVGs under `public/assets/` with recorded provenance in `assets/provenance/own-work.yml`.
  - In-canvas sprites and environmental props are rendered via high-detail layered vector-to-texture synthesis in `BootScene.ts` and `drawing.ts` for zero-latency startup and crisp rendering across DPI scales.
- **No Text in Images**: All labels, titles, prompts, and dialogues are rendered dynamically via localized DOM text or dynamic numeral labels so English (`en-US`) and Spanish (`es-US`) stay 100% localized and screen-reader accessible.

## 6. Animation Language & Calm Motion

- **Purposeful Motion**: Animations communicate discovery (gentle bobbing of available nodes/companions), counting support (sequential pulse on Hint 1, row alignment on Hint 2, guided highlight on Hint 3), and celebration (doors opening, bridge planks locking, story pages flying, constellations igniting).
- **Calm Motion Guarantee**: Every tween passes through `animate(scene, reduced, config)` in `src/game/systems/motion.ts`. When `reducedMotion` is enabled (via OS `prefers-reduced-motion` or in-game toggle), end states apply immediately with zero pulsing or particle drift, and nothing ever flashes more than 3 times per second.

## 7. UI Components, Iconography & Accessibility

- **Touch Targets**: Primary actions ≥ `64px` height, answer choices ≥ `80px × 96px`, all toolbar/secondary controls ≥ `48px`.
- **Focus Indicators**: High-contrast `4px solid #ffe066` outline with `3px` offset on `:focus-visible`.
- **Canvas / DOM Parity**: Every canvas interaction (walking to regions, talking to friends, finding hidden treasures, solving challenges, viewing rewards) has a 1:1 semantic DOM control in `#panel`.

## 8. Performance Constraints

- **Logical Resolution**: `960×540` (16:9), scaled via `Phaser.Scale.FIT` with `CENTER_BOTH`.
- **First-Playable Budget**: Total compressed bundle ≤ 1 MB gzipped (well within the 3–5 MB target budget).
- **Memory Discipline**: Scenes clean up all bridge subscriptions and active tweens on `SHUTDOWN`.
