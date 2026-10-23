# Parent & Educator Playtest Guide — Moonwood Quests

Use this guide when playtesting **Moonwood Quests** with a 6–7-year-old child or reviewing the game as an educator.

---

## 1. Quick Start & Deterministic Debugging

```bash
npm install
npm run dev
```

- Open `http://localhost:5173/?seed=42` for a deterministic challenge sequence.
- Open **Settings** (`⚙️`) to toggle **Sound**, **Calm motion**, **Read questions aloud**, or switch between **English** and **Español**.

---

## 2. 20-Minute Child Playtest Protocol

### Part A — Campaign Adventure (8–10 minutes)
1. Invite the child to start **The Whispering Gate** (`forest-gate`) on the World Map without adult instructions.
   - *Observe*: Can the child identify the prompt, count the crystals, and tap/select an answer button ($\ge 80\text{ px}$ target)?
2. On the next challenge, encourage the child to tap **Ask for a hint** (`💡`) or try an incorrect choice.
   - *Observe*: Does the child understand the 3-level progressive hint (*1: gentle strategy clue $\rightarrow$ 2: visual alignment $\rightarrow$ 3: guided solution*) without feeling punished?

### Part B — Regional Learning Sanctuaries & Workshops (8–10 minutes)
Scroll to **Regional Learning Sanctuaries & Workshops** on the World Map and explore:
1. **Storykeeper Hollow** (`storykeeper-hollow`):
   - Have the child try **📖 I read the story myself** on one passage and **🔊 Listen to story aloud** on another.
2. **Alchemist's Equation Forge** (`equation-alchemy`):
   - Observe how the child solves missing-addend equations like `6 + ? = 10` (`1.OA.D.8`).
3. **The Rune Journal** (`rune-journal`) & **Moonwood Builder's Workshop** (`moonwood-workshop`):
   - Tap the interactive rune/building tiles and try the non-graded **"What helped you solve that?"** reflection cards.
4. **Starlight Independent Check** (`starlight-check`):
   - Verify that the hint button is hidden and the check feels calm and encouraging.

### Part C — Grown-Ups Dashboard Review (2 minutes)
1. Click **For grown-ups** (`🔒`), answer the multiplication gate, and review:
   - **Academic Learning Overview** & **Evidence Summary** (standard codes, learning stage, mastery classification, and sample-size note).
   - **Reading Comprehension Modality** (independent reading vs. audio listening count).
   - **Recommended Offline Activities** tailored to recent practice or misconceptions.
   - **Export local learning report (JSON)**.
