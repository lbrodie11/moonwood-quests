---
name: asset-license-audit
description: Use whenever art, audio, fonts, icons, models or other media are added, modified or replaced in Moonwood Quests. Ensures every asset has recorded provenance and a license compatible with a potentially commercial game.
---

# Asset licence audit

Every file under `public/assets/` must be traceable to a source and a licence.
"I found it online" is not a licence.

## Allowed licences

| Licence        | Allowed | Notes                                                         |
|----------------|---------|---------------------------------------------------------------|
| CC0 1.0        | Yes     | Still record provenance.                                      |
| CC BY 4.0      | Yes     | Exact attribution line in `assets/ATTRIBUTION.md`.            |
| SIL OFL 1.1    | Fonts   | Keep the licence file next to the font.                       |
| Own work       | Yes     | Record author and date; project content is CC BY 4.0 by default. |
| Paid licence   | Yes     | Store the receipt/licence reference (not the file) in provenance. |
| CC BY-SA       | Ask     | Share-alike affects derived assets; human decision required.  |
| CC BY-NC / ND  | No      | NonCommercial / NoDerivatives block likely uses.              |
| Unknown / none | No      | Do not use, not even as a placeholder.                        |

## Generative AI art

Use for concept exploration and mood boards only. Production assets must be
human-created or licensed with traceable provenance. If a human decides to ship
AI-assisted art, record the tool, its terms version and the date.

## For each new asset

1. Put the file under `public/assets/<kind>/`.
2. Add a provenance entry to `assets/provenance/<source>.yml`:

   ```yaml
   - id: forest-tree-01
     file: public/assets/backgrounds/forest-tree-01.webp
     source: kenney            # or quaternius, poly-haven, game-icons, own-work…
     source_url: https://…
     author: …
     license: CC0-1.0          # SPDX id
     modified: true
     modifications: [palette adjusted, resized to 2x]
     added: 2026-10-23
   ```

3. If the licence requires attribution, add the exact line to `assets/ATTRIBUTION.md`.
4. No text baked into images (localisation + accessibility).
5. Check the size budget: first playable route ≤ ~3–5 MB compressed.

## Review checklist

- [ ] Every new file in `public/assets/` has a provenance entry
- [ ] Licence is in the allowed list
- [ ] Attribution present where required
- [ ] Generated textures in `BootScene.ts` replaced by assets are removed
