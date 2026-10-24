# Mathematics Learning Progression — Moonwood Quests

This document details the Grade 1 mathematical progressions, representations, strategy scaffolds, and diagnostic distractor models implemented in `src/learning/generators/` and `src/learning/curriculum/skills.ts`.

---

## 1. Addition & Subtraction Within 20 (`add-within-20`, `subtract-within-20`)

### Standards
- `1.OA.A.1`, `1.OA.B.3`, `1.OA.B.4`, `1.OA.C.6` (`NC.1.OA.1`, `NC.1.OA.3`, `NC.1.OA.4`, `NC.1.OA.6`)

### Difficulty Bands & Strategy Progression
- **Difficulty 1 (Sums/Minuends within 5–6)**: Concrete crystal manipulatives (`representation: "objects"`), perceptual subitizing and counting all.
- **Difficulty 2 (Fluency within 10)**: Counting on from the larger addend (`count-on-from-larger`), doubles (`4 + 4`), and take-from within 10.
- **Difficulty 3 (Crossing 10 up to 15)**: Make-ten decomposition (`8 + 5 = 8 + 2 + 3 = 10 + 3`), decomposing to 10 in subtraction (`13 - 5`), and number-line jumps.
- **Difficulty 4 (Full range within 20)**: Symbolic equations (`representation: "symbols"`), near-doubles (`7 + 8`), and think-addition for subtraction (`16 - 9` via `9 + ? = 16`).

### Diagnostic Distractor Tagging
- Off-by-one counting error (`answer ± 1` -> `"off-by-one"`)
- Wrong operation error (`|a - b|` on addition or `a + b` on subtraction -> `"operation-confusion"`)
- Ten-frame boundary error (`"ten-boundary-slip"`)

---

## 2. Unknown-Number Equations (`unknown-number-equations`)

### Standards
- `1.OA.D.8` / `NC.1.OA.8`: Determine the unknown whole number in an addition or subtraction equation relating three whole numbers.

### Four Equation Structures (`src/learning/generators/unknownEquations.ts`)
1. **`missing-second-addend`** (Difficulty 1+): `a + ? = c` (e.g., `6 + ? = 10`)
2. **`missing-first-addend`** (Difficulty 2+): `? + b = c` (e.g., `? + 4 = 9`)
3. **`missing-subtrahend`** (Difficulty 3+): `c - ? = a` (e.g., `12 - ? = 7`)
4. **`missing-minuend-reversed-equals`** (Difficulty 4): `a = ? - b` (e.g., `8 = ? - 3`)

### Relational Meaning of `=`
- Hints and canvas visuals model `=` as a **balance scale** ("both sides have the same value"), explicitly countering the common Grade 1 misconception that `=` means "write the total next" (which causes children to answer `16` for `6 + ? = 10`).

---

## 3. Place Value: Tens and Ones (`tens-and-ones`)

### Standards
- `1.NBT.B.2` (`NC.1.NBT.2`) for two-digit numbers (`10–99`); `1.NBT.B.3` (`>, =, <` symbol comparison) is tracked as `planned`.
- `1.NBT.A.1` (`NC.1.NBT.1`) for extended bundle counts `100–120` at Difficulty 4 (`extended-bundle-count-above-99`).

### Misconception Detection
- **Digit-reversal distractor** (`swapped`: e.g., choosing `43` for `3 tens + 4 ones = 34` -> `"swapped-tens-and-ones-digits"`).
- **Additive digit sum distractor** (`tens + ones`: e.g., choosing `7` for `3 tens + 4 ones` -> `"added-digits-without-place-value"`).

---

## 4. Length Measurement & Comparison (`compare-lengths`)

### Standards
- `1.MD.A.2` (`NC.1.MD.2`) for end-to-end non-standard unit planks; `1.MD.A.1` (3-object ordering and indirect comparison) is tracked as `planned`.

### Task Families
- End-to-end non-standard unit iteration (`join-unit-planks-within-8`, `join-unit-planks-within-12`) with equal-size moon-tiles and zero gaps/overlaps.
- Missing-plank span comparison (`missing-plank-span-within-16`, `missing-plank-span-within-20`) aligned from the left edge with an un-subdivided gap box.

---

## 5. Geometry & Composite Shapes (`compose-shapes`)

### Standards
- `1.G.A.2` (`NC.1.G.2`) for composing 2D composite sigil piece totals (`partial`); `1.G.A.1` (attribute sorting/drawing) is tracked as `planned`.
- Paired with **Moonwood Builder's Workshop** (`creative-construction`) for composite shape design choices.
