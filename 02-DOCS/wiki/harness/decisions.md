# Harness decisions

- Accepted plan `e05abc90bc05ec0c5d4c941a8fd70fa85c0e990d36fa244ab49e504d7e3e9f2b`.
- Project kind: software.
- SDD: selected.
- 2026-10-22 — Added MCP servers: Context7 (remote, anonymous) and Playwright (local, headless) for opencode and Cursor.
- 2026-10-22 — Added project skills in `.agents/skills/`: `grill-me`, `grilling` (its dependency), `vue-best-practices`, `frontend-design`. Versions pinned in `skills-lock.json`.
- 2026-10-22 — MCP wiring is machine-local (`opencode.json` and `.cursor/mcp.json` excluded from git); skills are shared with the repository.
- 2026-10-22 — Package runner for MCP servers and skill installs: `pnpm dlx`.
- 2026-10-22 — Playwright reuses the installed Chromium at `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` via `--executable-path`; its output directory `.playwright-mcp/` is gitignored.
