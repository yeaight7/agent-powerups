import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();

test("postbuild entrypoint exists at dist/cli/apx.js", async () => {
  const entrypoint = path.resolve(repoRoot, "dist", "cli", "apx.js");
  await fs.access(entrypoint);
});

test("postbuild entrypoint runs help", async () => {
  const entrypoint = path.resolve(repoRoot, "dist", "cli", "apx.js");
  const result = await execFileAsync("node", [entrypoint, "help"], { cwd: repoRoot });

  assert.match(result.stdout, /apx help/);
});

test("postbuild entrypoint reports package version", async () => {
  const entrypoint = path.resolve(repoRoot, "dist", "cli", "apx.js");
  const packageJson = JSON.parse(await fs.readFile(path.resolve(repoRoot, "package.json"), "utf8"));
  const result = await execFileAsync("node", [entrypoint, "version"], { cwd: repoRoot });

  assert.equal(result.stdout.trim(), packageJson.version);
});
