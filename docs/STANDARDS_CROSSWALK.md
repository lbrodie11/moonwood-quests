# Standards Crosswalk — Moonwood Quests (Grade 1 / Ages 6–7)

This crosswalk maps every learning objective and regional activity in **Moonwood Quests** (`src/learning/curriculum/standards.ts`) to:
- **Common Core State Standards (CCSS)** for Grade 1 Mathematics and English Language Arts
- **North Carolina Standard Course of Study (NC SCOS)** for Grade 1 Mathematics (`NC.1.*`)
- **North Carolina 2017 ELA Standard Course of Study** (effective through the **2026–27** school year)
- **North Carolina 2026 ELA Standard Course of Study** (scheduled implementation in **2027–28**)
- **NGSS / NC Early Elementary Science Standards** (`K-LS1-1`, `1-LS1-1`, `1-ESS1-1`, `1-ESS1-2`, `2-PS1-2`, `LS.1.1`)

## Coverage Honesty Policy

Every entry in `STANDARDS_REGISTRY` carries an explicit `coverageLevel` and `reviewStatus` (`requires-educator-review` / `requires-bilingual-review`):
- `full` — In-game tasks directly assess the core cognitive and representational demands of the standard across multiple item families and representations (`1.OA.D.8` / `NC.1.OA.8` and `1.NBT.B.2` / `NC.1.NBT.2`).
- `partial` — In-game tasks assess an important subset of a broader multi-part standard (for example, `1.OA.A.1` word-problem types, `1.G.A.1–3` and `1.MD.A.1–2` composite/length comparisons, `RF.1.2–3` multiple-choice decoding, or `L.1.5` oral vocabulary where expressive speech and physical partitioning/writing are supplemented by offline family prompts).
- `enrichment` — Tasks provide foundational reasoning, pattern recognition, or design enrichment (such as `star-patterns` under `1.NBT.A.1` or `MP.1` logical reasoning).

---

## Crosswalk Table

| Moonwood Objective ID | Domain | CCSS Standard | NC Math / Science | NC 2017 ELA (2026–27) | NC 2026 ELA (2027–28) | Coverage | Primary Quests & Sanctuaries |
|---|---|---|---|---|---|---|---|
| `add-within-20` | Mathematics | `1.OA.A.1`, `1.OA.B.3`, `1.OA.C.6` | `NC.1.OA.1`, `NC.1.OA.3`, `NC.1.OA.6` | — | — | `partial` | *The Whispering Gate*, *The Lantern Bridge*, *Moss's Mushroom Grove* |
| `subtract-within-20` | Mathematics | `1.OA.A.1`, `1.OA.B.4`, `1.OA.C.6` | `NC.1.OA.1`, `NC.1.OA.4`, `NC.1.OA.6` | — | — | `partial` | *Moss's Mushroom Grove*, *The Prism Sanctum*, *The Ravine Bridge* |
| `unknown-number-equations` | Mathematics | `1.OA.D.8`, `1.OA.B.4` | `NC.1.OA.8`, `NC.1.OA.4` | — | — | `full` (`1.OA.D.8`), `partial` (`1.OA.B.4`) | *Alchemist's Equation Forge* (`equation-alchemy`), *Starlight Independent Check* |
| `tens-and-ones` | Mathematics | `1.NBT.B.2`, `1.NBT.B.3`, `1.NBT.A.1` (>99) | `NC.1.NBT.2`, `NC.1.NBT.3`, `NC.1.NBT.1` | — | — | `full` (`1.NBT.B.2` 10–99), `enrichment` (>99) | *The Crystal Caves*, *The Echo Forge*, *The Prism Sanctum* |
| `compare-lengths` | Mathematics | `1.MD.A.1`, `1.MD.A.2` | `NC.1.MD.1`, `NC.1.MD.2` | — | — | `partial` | *The Ravine Bridge*, *The Living Storybook* |
| `compose-shapes` | Mathematics | `1.G.A.1`, `1.G.A.2`, `1.G.A.3` | `NC.1.G.1`, `NC.1.G.2`, `NC.1.G.3` | — | — | `partial` | *The Sigil Temple*, *The Star Observatory* |
| `star-patterns` | Mathematics | `1.NBT.A.1` | `NC.1.NBT.1` | — | — | `enrichment` | *The Star Observatory*, *The Crown of Moonwood* |
| `phonics-words` | Foundational Reading | `RF.1.2`, `RF.1.3` | — | `RF.1.2`, `RF.1.3` | `1.F.PA`, `1.F.PWS` | `partial` | *The Enchanted Library*, *The Living Storybook*, *The Crown of Moonwood* |
| `reading-comprehension` | Reading Comprehension | `RL.1.1`, `RL.1.2`, `RL.1.3` | — | `RL.1.1`, `RL.1.2`, `RL.1.3` | `1.RC.L` | `partial` | *Storykeeper Hollow* (`storykeeper-hollow`) |
| `vocabulary-oral` | Vocabulary & Oral Language | `L.1.4`, `L.1.5`, `SL.1.1` | — | `L.1.4`, `L.1.5` | `1.V` | `partial` (parent-assisted oral) | *Creature Conversations* (`creature-cavern`) |
| `spelling-writing` | Writing & Spelling | `L.1.1`, `L.1.2`, `RF.1.3` | — | `L.1.1`, `L.1.2` | `1.W.C`, `1.F.PWS` | `partial` (constrained encoding + paper companion) | *The Rune Journal* (`rune-journal-desk`) |
| `logical-reasoning` | Logical Reasoning | `MP.1`, `MP.2`, `MP.7` | `NC.MP.1` | — | — | `enrichment` | *The Wizard's Workshop* (`wizards-workshop`) |
| `science-nature` | Science & Nature | — | `K-LS1-1`, `1-LS1-1`, `1-ESS1-1`, `1-ESS1-2`, `2-PS1-2`, `LS.1.1` | — | — | `partial` | *Naturekeeper Glade* (`naturekeeper-glade`) |
| `creative-construction` | Creative Thinking | `1.G.A.2`, `MP.1` | `NC.1.G.2`, `K-2-ETS1-1`, `K-2-ETS1-2` | — | — | `enrichment` | *Moonwood Builder's Workshop* (`moonwood-workshop`) |

---

## Key Alignment Corrections Implemented

1. **Separated `1.OA.D.8` (`unknown-number-equations`) from `star-patterns` (`1.NBT.A.1`)**:
   - `1.OA.D.8` / `NC.1.OA.8` requires determining the unknown whole number in an addition or subtraction equation relating three whole numbers (`6 + ? = 10`, `? + 4 = 9`, `12 - ? = 7`, `8 = ? - 3`).
   - Skip-counting sequences (`2, 4, 6, ?`) are now classified under `1.NBT.A.1` / `NC.1.NBT.1` counting sequences and pattern enrichment.
2. **Place Value (`1.NBT.B.2` vs. `1.NBT.A.1`)**:
   - Two-digit tens-and-ones tasks (`10–99`) map to `1.NBT.B.2` / `NC.1.NBT.2`.
   - Extended bundle counts above `99` (`100–120` at difficulty 4) are explicitly tagged as `extended-bundle-count-above-99` (`1.NBT.A.1`).
