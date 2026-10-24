# Standards Crosswalk — Moonwood Quests (Grade 1 / Ages 6–7)

This crosswalk maps every learning objective and regional activity in **Moonwood Quests** (`src/learning/curriculum/standards.ts`) to:
- **Common Core State Standards (CCSS)** for Grade 1 Mathematics and English Language Arts
- **North Carolina Standard Course of Study (NC SCOS)** for Grade 1 Mathematics (`NC.1.*`)
- **North Carolina 2017 ELA Standard Course of Study** (effective through the **2026–27** school year)
- **North Carolina 2026 ELA Standard Course of Study** (scheduled implementation in **2027–28**)
- **NGSS Early Elementary Science Standards** (`K-LS1-1`, `1-ESS1-2`)

## Coverage Honesty Policy

Every entry in `STANDARDS_REGISTRY` carries an explicit `coverageLevel` and `reviewStatus` (`requires-educator-review` / `requires-bilingual-review`):
- `full` — In-game tasks directly assess the core cognitive and representational demands of the standard across multiple item families and representations (`1.OA.C.6`, `NC.1.OA.6`, `1.OA.D.8`, `NC.1.OA.8`, `1.NBT.B.2`, `NC.1.NBT.2`).
- `partial` — In-game tasks assess a subset of a broader multi-part standard (`1.OA.A.1`, `1.OA.B.3`, `1.OA.B.4`, `NC.1.OA.1`, `NC.1.OA.3`, `NC.1.OA.4`, `NC.1.NBT.1`, `1.MD.A.2`, `NC.1.MD.2`, `1.G.A.2`, `NC.1.G.2`, `RF.1.2`, `RF.1.3`, `1.F.PWS`, `RL.1.1`, `1.RC.L`, `L.1.5`, `L.1.2`, `K-LS1-1`, `1-ESS1-2`).
- `enrichment` — Tasks provide foundational reasoning, pattern recognition, or design enrichment (`1.NBT.A.1`, `MP.1`).
- `planned` — Standards tracked in the registry whose dedicated generating task types are not yet implemented (`1.NBT.B.3`, `1.MD.A.1`, `1.G.A.1`, all with `supportedTaskTypes: []`).

---

## Crosswalk Table

Every standard code listed below exists in `STANDARDS_REGISTRY` (`src/learning/curriculum/standards.ts`):

| Moonwood Objective ID | Domain | CCSS Standard | NC Math / NGSS Science | NC 2017 ELA (2026–27) | NC 2026 ELA (2027–28) | Coverage | Primary Quests & Sanctuaries |
|---|---|---|---|---|---|---|---|
| `add-within-20` | Mathematics | `1.OA.A.1`, `1.OA.B.3`, `1.OA.C.6` | `NC.1.OA.1`, `NC.1.OA.3`, `NC.1.OA.6` | — | — | `full` (`1.OA.C.6`, `NC.1.OA.6`), `partial` (`1.OA.A.1`, `1.OA.B.3`) | *The Whispering Gate*, *The Lantern Bridge*, *Moss's Mushroom Grove* |
| `subtract-within-20` | Mathematics | `1.OA.A.1`, `1.OA.B.4`, `1.OA.C.6` | `NC.1.OA.1`, `NC.1.OA.4`, `NC.1.OA.6` | — | — | `full` (`1.OA.C.6`, `NC.1.OA.6`), `partial` (`1.OA.A.1`, `1.OA.B.4`) | *Moss's Mushroom Grove*, *The Prism Sanctum*, *The Ravine Bridge* |
| `unknown-number-equations` | Mathematics | `1.OA.D.8`, `1.OA.B.4` | `NC.1.OA.8`, `NC.1.OA.4` | — | — | `full` (`1.OA.D.8`, `NC.1.OA.8`), `partial` (`1.OA.B.4`, `NC.1.OA.4`) | *Alchemist's Equation Forge* (`equation-alchemy`), *Starlight Independent Check* |
| `tens-and-ones` | Mathematics | `1.NBT.B.2`, `1.NBT.A.1` (>99), `1.NBT.B.3` | `NC.1.NBT.2`, `NC.1.NBT.1` | — | — | `full` (`1.NBT.B.2`, `NC.1.NBT.2`), `enrichment` (`1.NBT.A.1`), `planned` (`1.NBT.B.3`) | *The Crystal Caves*, *The Echo Forge*, *The Prism Sanctum* |
| `compare-lengths` | Mathematics | `1.MD.A.2`, `1.MD.A.1` | `NC.1.MD.2` | — | — | `partial` (`1.MD.A.2`, `NC.1.MD.2`), `planned` (`1.MD.A.1`) | *The Ravine Bridge*, *The Living Storybook* |
| `compose-shapes` | Mathematics | `1.G.A.2`, `1.G.A.1` | `NC.1.G.2` | — | — | `partial` (`1.G.A.2`, `NC.1.G.2`), `planned` (`1.G.A.1`) | *The Sigil Temple*, *The Star Observatory* |
| `star-patterns` | Mathematics | `1.NBT.A.1` | `NC.1.NBT.1` | — | — | `enrichment` (`1.NBT.A.1`), `partial` (`NC.1.NBT.1`) | *The Star Observatory*, *The Crown of Moonwood* |
| `phonics-words` | Foundational Reading | `RF.1.2`, `RF.1.3` | — | `RF.1.3` | `1.F.PWS` | `partial` | *The Enchanted Library*, *The Living Storybook*, *The Crown of Moonwood* |
| `reading-comprehension` | Reading Comprehension | `RL.1.1` | — | `RL.1.1` | `1.RC.L` | `partial` | *Storykeeper Hollow* (`storykeeper-hollow`) |
| `vocabulary-oral` | Vocabulary & Oral Language | `L.1.5` | — | — | — | `partial` (parent-assisted oral) | *Creature Conversations* (`creature-cavern`) |
| `spelling-writing` | Writing & Spelling | `L.1.2`, `RF.1.3` | — | `RF.1.3` | `1.F.PWS` | `partial` (constrained encoding + paper companion) | *The Rune Journal* (`rune-journal-desk`) |
| `logical-reasoning` | Logical Reasoning | `MP.1` | — | — | — | `enrichment` | *The Wizard's Workshop* (`wizards-workshop`) |
| `science-nature` | Science & Nature | — | `K-LS1-1`, `1-ESS1-2` | — | — | `partial` | *Naturekeeper Glade* (`naturekeeper-glade`) |
| `creative-construction` | Creative Thinking | `1.G.A.2`, `MP.1` | `NC.1.G.2` | — | — | `partial` (`1.G.A.2`, `NC.1.G.2`), `enrichment` (`MP.1`) | *Moonwood Builder's Workshop* (`moonwood-workshop`) |

---

## Key Alignment & Educator Review Notes

1. **Separated `1.OA.D.8` (`unknown-number-equations`) from `star-patterns` (`1.NBT.A.1`)**:
   - `1.OA.D.8` / `NC.1.OA.8` requires determining the unknown whole number in an addition or subtraction equation relating three whole numbers (`6 + ? = 10`, `? + 4 = 9`, `12 - ? = 7`, `8 = ? - 3`).
   - Skip-counting sequences (`2, 4, 6, ?`) are classified under `1.NBT.A.1` / `NC.1.NBT.1`.
2. **Honest `planned` Classification for `1.NBT.B.3`, `1.MD.A.1`, and `1.G.A.1`**:
   - `1.NBT.B.3` (`>, =, <` symbol comparisons), `1.MD.A.1` (3-object ordering and indirect length comparison via a third reference object), and `1.G.A.1` (attribute sorting/drawing) do not yet have dedicated task generators and are marked `coverageLevel: "planned"` with `supportedTaskTypes: []`.
3. **Educator Review Flag on Sentence-Order Items (`L.1.2`)**:
   - `challenge.spelling.item.5` (*"Pip sees the moon."* / *"Pip ve la luna."*) and `challenge.spelling.item.6` (*"Moss lights a lantern."* / *"Musgo enciende un farol."*) use ungrammatical word-order distractors (`"Pip the moon sees."`, `"Lantern a lights Moss."`) so only one grammatical SVO ordering exists among the choices; these items are flagged `requires-educator-review` for classroom syntax alignment.
