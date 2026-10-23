# Harness decisions

- Accepted plan `e05abc90bc05ec0c5d4c941a8fd70fa85c0e990d36fa244ab49e504d7e3e9f2b`.
- Project kind: software.
- SDD: selected.
- 2026-10-22 — Added MCP servers: Context7 (remote, anonymous) and Playwright (local, headless) for opencode and Cursor.
- 2026-10-22 — Added project skills in `.agents/skills/`: `grill-me`, `grilling` (its dependency), `vue-best-practices`, `frontend-design`. Versions pinned in `skills-lock.json`.
- 2026-10-22 — MCP wiring is machine-local (`opencode.json` and `.cursor/mcp.json` excluded from git); skills are shared with the repository.
- 2026-10-22 — Package runner for MCP servers and skill installs: `pnpm dlx`.
- 2026-10-22 — Playwright reuses the installed Chromium at `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` via `--executable-path`; its output directory `.playwright-mcp/` is gitignored.
- 2026-10-22 — GitHub API access via the `gh` CLI (2.103.0, installed in `~/.local/bin`), not via an MCP server. Code already travels over the existing SSH remote.
- 2026-10-22 — Supabase deferred until the first feature that needs accounts, saved charts or sharing. The chart calculation stays client-side and independent of any backend.
- 2026-10-23 — Interaction preference: interviews (grilling, grill-me, clarify, onboarding) use the interactive `question` tool, one round at a time. Never paste a plain-text questionnaire.
- 2026-10-23 — SDD runtime calibrated: `02-DOCS/wiki/sdd/config.yaml`; registry refreshed.
- 2026-10-23 — Chart feature decisions: server-side calculation with an MIT engine, vendored MIT bodygraph renderer, last chart in browser storage, Jovian golden charts.
- 2026-10-23 — Constitution and spec drafted; ratification and approval pending.
