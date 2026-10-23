# Agent skills

Portable `SKILL.md` playbooks for coding agents working on this repository.

## Project-owned skills (in this folder)

| Skill | Use when |
|---|---|
| `fantasy-learning-design` | Changing quests, generators, hints, rewards or difficulty |
| `child-accessibility-review` | Adding or reviewing UI, scenes, animation, sound or input |
| `coppa-data-minimization` | Anything touching storage, network, identifiers, SDKs, inputs or deployment |
| `asset-license-audit` | Adding or replacing art, audio, fonts or models |

These encode product constraints as engineering policy. Keep them short and
specific to this project; update them when an invariant changes.

## Third-party skills (pinned)

Game-development skills come from
[`gamedev-skills/awesome-gamedev-agent-skills`](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)
(Apache-2.0), **pinned to commit `7eb1b53305fab881f4758e2eff2e371cd7869221`**
(main on 2026-10-23). The repository changes often, so it is pinned rather
than tracked.

```bash
npm run skills:install
```

The script runs the `vercel-labs/skills` CLI against a `tree/<commit>` URL and
installs only this allowlist, not the whole collection:

| Skill | Path at the pinned commit | Why |
|---|---|---|
| `phaser-core` | `skills/web-engines/phaser-core` | Phaser 4.2 config, scene lifecycle, debugging |
| `game-ui-ux` | `skills/disciplines/game-ui-ux` | Menus, HUD, feedback |
| `game-feel` | `skills/disciplines/game-feel` | Juice that rewards correct answers |
| `level-design` | `skills/disciplines/level-design` | World map and quest layout |
| `create-game-assets` | `skills/disciplines/create-game-assets` | Replacing the procedural placeholder art |
| `performance-optimization` | `skills/disciplines/performance-optimization` | Tablet budgets |
| `save-systems` | `skills/disciplines/save-systems` | Progress persistence and migrations |

Apply the project skills on top: for example, `save-systems` must still respect
`coppa-data-minimization`. The CLI asks which agents to install for; pass
`-a <agent>` to choose one non-interactively.

## Trust rules

Skills can bundle scripts, so they extend what an agent can execute.

- Read a skill's source before installing it; treat it like a dependency.
- Pin to a commit; update deliberately, in its own PR, with a diff review.
- Never give agent sandboxes production credentials.
- Indexes such as `VoltAgent/awesome-agent-skills` are for discovery only. They
  are not a trust boundary.
