# Repository Guidelines

## Project Structure & Module Organization

Agent Powerups is a Node.js/TypeScript CLI plus a catalog of agent assets. Core CLI code lives in `src/cli/`, with command handlers in `src/cli/commands/` and shared helpers in `src/cli/utils/`. Tests live in `test/` as `*.test.ts`.

Shipped assets are organized by type: `skills/`, `commands/`, `hooks/`, `mcp/`, `agents-md/`, `workflows/`, and `examples/`. Repository docs live in `docs/`. Keep `catalog.json` in sync whenever a shipped asset is added, renamed, removed, or materially changed.

## Build, Test, and Development Commands

- `npm install`: install Node dependencies.
- `npm run build`: compile TypeScript with `tsc` and create the `apx` wrapper.
- `npm run test`: build, then run the Node test suite via `scripts/run-node-tests.mjs`.
- `apx doctor`: run local health checks after building.
- `apx list`: inspect catalog entries.
- `python scripts/validate-skills.py`: validate skill metadata and required files.
- `python scripts/validate-catalog.py`: validate `catalog.json`.
- `python scripts/validate-mirrors.py`: validate that plugin skill copies match their root skills (variant allowlist inside the script).
- `python scripts/check-requirements.py`: check documented tool requirements.

## Coding Style & Naming Conventions

Use TypeScript ES modules targeting Node 20+. The project uses `strict` TypeScript, `NodeNext` modules, semicolons, double quotes, and two-space indentation. Prefer small named functions, explicit error messages, and local helpers in `src/cli/utils/` when logic is shared.

Use kebab-case for asset folders and catalog names, for example `skills/systematic-debugging/`. Every skill folder must include `SKILL.md` with YAML frontmatter containing `name` and `description`. Agent instruction files should use YAML frontmatter plus a pure Markdown body with headings, not XML-like tags as normal top-level sections.

## Testing Guidelines

Add or update focused tests in `test/*.test.ts` for CLI behavior and validation logic. Use `npm run test` for the full test path. For asset-only changes, also run the relevant Python validators. There is no separate coverage gate; cover changed behavior and edge cases directly.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit-style subjects such as `feat: add ...` and `fix: update ...`. Keep commits scoped to one change.

Pull requests should describe the change, explain validation run, and link related issues when applicable. If shipped assets changed, confirm `catalog.json` was updated. For tool-dependent skills, document the required command, existence check, install command, approval requirement, and fallback behavior.

## Security & Configuration Tips

Do not add secrets, machine-specific paths, hidden installers, or broad compatibility claims. Keep install flows explicit and reviewable; use dry-run commands before write or setup actions when possible.
