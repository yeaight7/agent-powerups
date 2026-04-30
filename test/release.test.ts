import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function readText(relativePath: string): Promise<string> {
  return fs.readFile(path.join(repoRoot, relativePath), "utf8");
}

test("package exposes a release preflight command", async () => {
  const packageJson = JSON.parse(await readText("package.json"));

  assert.equal(packageJson.scripts["release:check"], "node scripts/release-check.mjs");
  assert.equal(packageJson.repository.url, "git+https://github.com/yeaight7/agent-powerups.git");
  assert.ok(packageJson.files.includes("!docs/superpowers/"));
});

test("release preflight script covers build, validation, version, pack, and publish dry-runs", async () => {
  const script = await readText("scripts/release-check.mjs");

  for (const expected of [
    "npm run build",
    "npm test",
    "node dist/cli/apx.js doctor --full",
    "python scripts/validate-skills.py",
    "python scripts/validate-catalog.py",
    "node dist/cli/apx.js version",
    "npm pack --dry-run",
    "npm publish --dry-run --access public",
  ]) {
    assert.match(script, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(script, /cmd\.exe/);
  assert.match(script, /"\/d", "\/s", "\/c"/);
});

test("ci validates release support on linux, windows, and macos", async () => {
  const ci = await readText(".github/workflows/ci.yml");

  assert.match(ci, /ubuntu-latest/);
  assert.match(ci, /windows-latest/);
  assert.match(ci, /macos-latest/);
  assert.match(ci, /npm pack --dry-run/);
});

test("release workflow publishes v tags with npm trusted publishing", async () => {
  const workflow = await readText(".github/workflows/release.yml");

  assert.match(workflow, /tags:\s*\n\s*-\s*["']v\*["']/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /node-version:\s*24/);
  assert.match(workflow, /npm install -g npm@latest/);
  assert.match(workflow, /npm publish --access public/);
  assert.doesNotMatch(workflow, /NODE_AUTH_TOKEN|NPM_TOKEN/);
});

test("release checklist documents trusted publishing and post-publish verification", async () => {
  const checklist = await readText("docs/release-checklist-v0.1.0.md");

  assert.match(checklist, /Trusted Publisher/);
  assert.match(checklist, /release\.yml/);
  assert.match(checklist, /npm run release:check/);
  assert.match(checklist, /git tag v0\.1\.0/);
  assert.match(checklist, /npm view agent-powerups@0\.1\.0/);
});
