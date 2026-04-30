# Release Checklist v0.1.0

## One-Time npm Setup
- [ ] Confirm the package name is available: `npm view agent-powerups`.
- [ ] Configure npm Trusted Publisher for package `agent-powerups`.
- [ ] Use GitHub organization/user `yeaight7`, repository `agent-powerups`, and workflow filename `release.yml`.
- [ ] After the first trusted publish succeeds, consider npm package settings that require 2FA and disallow token publishing.

## Pre-Release Validation
- [ ] Verify GitHub Actions CI passes on Ubuntu, macOS, and Windows.
- [ ] Run `npm run release:check` locally.
- [ ] Verify `node dist/cli/apx.js version` outputs `0.1.0`.
- [ ] Verify `npm pack --dry-run --json` includes only intended distributed files (`dist/`, `skills/`, `commands/`, `hooks/`, `mcp/`, `agents-md/`, `workflows/`, `docs/`, `examples/`, `catalog.json`, root docs) and no secrets.

## Security & Safety Check
- [ ] Confirm Codex relay avoids `--full-auto` by default.
- [ ] Confirm persistent relay daemon requires local token authentication.
- [ ] Confirm GitHub MCP image pinning documentation exists.
- [ ] Confirm no `NODE_AUTH_TOKEN`, `NPM_TOKEN`, or npm auth token is stored in repository files or GitHub Actions workflow YAML.

## Publishing
- [ ] Create release tag: `git tag v0.1.0`.
- [ ] Push release tag: `git push origin v0.1.0`.
- [ ] Watch the `Release` GitHub Actions workflow publish to npm with Trusted Publishing.
- [ ] Confirm GitHub Release `v0.1.0` was created from generated notes.

## Post-Release Verification
- [ ] Confirm npm package exists: `npm view agent-powerups@0.1.0 version`.
- [ ] Install from npm in a disposable directory: `npm install agent-powerups@0.1.0`.
- [ ] Run installed CLI help: `npx apx help`.
