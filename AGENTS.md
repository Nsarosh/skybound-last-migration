# Build instructions for PROJECT: SKYBOUND — THE LAST MIGRATION

Read the make.fun skill, the best-game-01 bounty page, its requirements JSON, and the unpacked kit's RULES.txt, kit.json, starter files, and vendor API before changing the repository. Treat every requirement as binding. This is an original offline browser game, not a clone of any commercial title.

Build a polished, deterministic neon bullet-heaven survival game with a 60-second Dreadnought arrival, a readable win condition (defeat the boss after surviving to its arrival), a lose condition, restart, upgrade draft, score/high-score persistence, keyboard and pointer controls, responsive layout, and offline synthesized audio. Keep the requested modular ES-module architecture. Do not add external runtime dependencies, remote assets, network calls, or nondeterministic gameplay. Seed all gameplay randomness. Use the exact palette and readability priorities from the user request, but keep effects bounded and legible.

Engineering constraints:
- `vendor/makefun-game.ts` must remain byte-for-byte untouched.
- Keep the game self-contained in `game/`; `game/index.html` must work offline in desktop Chrome.
- Root `main.ts` must follow the starter and use the kit's `buildDossier` API correctly; it must copy the game and exactly 3 or 4 real game screenshots into `/output` as required.
- Read the actual size/file-count/screenshot/dossier limits from RULES.txt; do not guess them.
- Include an OSI-approved MIT LICENSE with its required SPDX line, README with the exact bounty badges/run instructions, and `.makefun/owner.json` naming the account wallet `9CdVwcTZLLwQUKJzRUxb2gCzciwjGYAZk5HRec6DN2oA`.
- Use the repo's existing GitHub remote and publish the finished commit to the public repo. Set GitHub About homepage to the bounty URL and add required topics.
- Create screenshots from the running game itself (not mockups or composites): briefing, active combat, upgrade draft or boss, and victory/debrief. If a deterministic showcase query is used to place the game in those states, it must exercise the same production renderer and real game state; keep it inaccessible or harmless in normal play.
- Test the game in Chrome at both a 300 CSS-pixel narrow viewport (use device scale factor so the screenshot still meets the platform's minimum image dimensions) and a 1024px desktop viewport. Test movement, dash, auto-fire, upgrades, boss, win/lose and restart. Check console errors and offline network behavior.
- Iterate visibly: make an initial source write, run it, then make a substantive improvement in a later assistant turn. Keep at least five substantive assistant turns and at least two distinct writes/edits to the same counted source file in this Codex session. All code must be authored here, not copied or imported from another project.
- Run `node main.ts`, kit `check`, `grade-local` and every applicable local check. Fix all failures before committing. Report any check that cannot be run honestly.
- Do not fabricate test results, screenshots, transcript records, model usage, or submission success. Preserve the complete Codex session and the live make.fun recording.
