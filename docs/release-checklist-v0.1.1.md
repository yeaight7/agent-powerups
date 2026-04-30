# Release Checklist v0.1.1

## npm Setup
- [ ] Confirm npm Trusted Publisher exists for package `agent-powerups`.
- [ ] Use GitHub user `yeaight7`, repository `agent-powerups`, and workflow filename `release.yml`.
- [ ] Confirm no `NODE_AUTH_TOKEN`, `NPM_TOKEN`, or npm auth token is stored in repository files or GitHub Actions workflow YAML.

## Pre-Release Validation
- [ ] Verify GitHub Actions CI passes on Ubuntu, macOS, and Windows.
- [ ] Run `npm run release:check` locally.
- [ ] Verify `node dist/cli/apx.js version` outputs `0.1.1`.
- [ ] Verify `npm pack --dry-run --json` includes only intended distributed files (`dist/`, `skills/`, `commands/`, `hooks/`, `mcp/`, `agents-md/`, `workflows/`, `docs/`, `examples/`, `catalog.json`, root docs) and no secrets.

## Publishing
- [ ] Create release tag: `git tag v0.1.1`.
- [ ] Push release tag: `git push origin v0.1.1`.
- [ ] Watch the `Release` GitHub Actions workflow publish to npm with Trusted Publisher.
- [ ] Confirm GitHub Release `v0.1.1` was created from generated notes.

## Post-Release Verification
- [ ] Confirm npm package exists: `npm view agent-powerups@0.1.1 version`.
- [ ] Install from npm in a disposable directory: `npm install agent-powerups@0.1.1`.
- [ ] Run installed CLI version: `node node_modules/agent-powerups/dist/cli/apx.js version`.
