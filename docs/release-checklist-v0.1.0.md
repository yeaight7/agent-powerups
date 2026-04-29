# Release Checklist v0.1.0

## Pre-Release Validation
- [ ] Verify GitHub Actions CI passes on Ubuntu, macOS, and Windows.
- [ ] Run `npm run build` locally and verify no TypeScript errors.
- [ ] Run `node dist/cli/apx.js doctor --full` and verify repository health.
- [ ] Run `python scripts/validate-skills.py` and `python scripts/validate-catalog.py`.
- [ ] Verify `npm pack --dry-run` includes only the intended distributed files (`dist/`, `skills/`, `mcp/`, `catalog.json`, etc.) and no secrets.
- [ ] Ensure `apx version` outputs `0.1.0`.

## Security & Safety Check
- [ ] Confirm Codex relay avoids `--full-auto` by default.
- [ ] Confirm persistent relay daemon requires local token authentication.
- [ ] Confirm GitHub MCP image pinning documentation exists.

## Publishing
- [ ] Draft a new GitHub Release with `v0.1.0` tag.
- [ ] (Optional) Publish to npm via `npm publish --access public`.