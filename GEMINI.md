# Project Overview

**Agent Powerups** is an "Oh My Zsh-style" collection of reusable skills, slash commands, MCP configs, hooks, AGENTS.md templates, and workflows for coding agents. It provides a local-first CLI tool (`apx`) for browsing, validating, running, and explicitly installing these agent powerups.

**Main Technologies:**
- **Language:** TypeScript
- **Runtime:** Node.js (v20+)
- **Validation:** Zod (for runtime type checking), Python (for repository validation scripts)

**Architecture/Structure:**
The repository is structured around different "asset classes" for coding agents:
- `skills/`: Reusable agent workflows (e.g., systematic debugging).
- `mcp/`: Local-first GitHub MCP configs.
- `commands/`: Review-first markdown command prompts.
- `hooks/`: Review-before-use hook recipes.
- `agents-md/`: Starter templates.
- `src/cli/`: The source code for the `apx` CLI tool.
- `scripts/`: Python scripts for validating the repo's catalog and skills.
- `catalog.json`: The central registry of all shipped assets.

## Building and Running

The project relies on `npm` for dependency management and scripts.

**Setup:**
```bash
npm install
```

**Build:**
```bash
npm run build
# This runs `tsc` and a post-build script (`scripts/postbuild-apx-wrapper.mjs`).
```

**Testing:**
```bash
npm run test
# This builds the project and runs tests via `scripts/run-node-tests.mjs`.
```

**Running the CLI (Locally):**
After building, you can run the CLI directly from the `dist` folder:
```bash
node dist/cli/apx.js doctor
node dist/cli/apx.js list
node dist/cli/apx.js info <asset-name>
node dist/cli/apx.js check <asset-name>
```

**Repository Validation:**
Run these scripts to validate the integrity of the project's assets (important before submitting PRs):
```bash
python scripts/validate-skills.py
python scripts/validate-catalog.py
python scripts/check-requirements.py
```

## Development Conventions

**TypeScript Configuration:**
- **Strict Mode:** Enabled (`"strict": true`). Ensure all types are properly defined and handle potential `null` or `undefined` values.
- **Target/Module:** `ES2022` and `NodeNext`.

**Coding and Contribution Standards:**
- **Keep it small and explicit:** Contributions should be small, explicit, and portable.
- **No hidden actions:** Do not add hidden installers or auto-install tools without user approval. Always show the install command before running it.
- **No secrets:** Never add secrets, machine-specific paths, or personal data.
- **Skill Requirements:** Every skill in the `skills/` directory must include a `SKILL.md` file with YAML frontmatter containing `name` and `description`.
- **Tool Dependencies:** If a skill depends on an external tool, it must document: the required command, how to check if it exists, how to install it (requiring user approval), and the fallback behavior if installation is declined.
- **Catalog Maintenance:** Every shipped asset must be registered in `catalog.json` with a valid `type` and `maturity` level.
- **Compatibility:** Claims about compatibility should be narrow, defensible, and not faked.