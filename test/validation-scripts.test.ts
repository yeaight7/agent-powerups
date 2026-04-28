import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function runScript(script: string, env: NodeJS.ProcessEnv) {
  try {
    const result = await execFileAsync("python", [path.join(repoRoot, "scripts", script)], {
      cwd: repoRoot,
      env: { ...process.env, ...env },
      windowsHide: true,
    });
    return { exitCode: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const maybeError = error as { code?: number; stdout?: string; stderr?: string };
    return {
      exitCode: typeof maybeError.code === "number" ? maybeError.code : 1,
      stdout: maybeError.stdout ?? "",
      stderr: maybeError.stderr ?? "",
    };
  }
}

async function tempRepo(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), "apx-validation-"));
}

test("validate-skills fails when a SKILL.md references a missing support file", async () => {
  const root = await tempRepo();
  await fs.mkdir(path.join(root, "skills", "broken", "references"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "broken", "SKILL.md"),
    [
      "---",
      "name: broken",
      "description: Use when testing missing support file validation",
      "---",
      "",
      "# Broken",
      "",
      "Read `references/missing.md` before proceeding.",
      "",
    ].join("\n"),
    "utf8",
  );

  const result = await runScript("validate-skills.py", { APX_REPO_ROOT: root });

  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /missing referenced support file/i);
  assert.match(result.stdout, /references\/missing\.md/);
});

test("validate-catalog fails when package and plugin licenses disagree with root license", async () => {
  const root = await tempRepo();
  await fs.mkdir(path.join(root, "plugins", "agent-powerups", ".codex-plugin"), { recursive: true });
  await fs.writeFile(path.join(root, "catalog.json"), "[]\n", "utf8");
  await fs.writeFile(path.join(root, "LICENSE"), "Apache License\nVersion 2.0\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ license: "MIT" }), "utf8");
  await fs.writeFile(
    path.join(root, "plugins", "agent-powerups", ".codex-plugin", "plugin.json"),
    JSON.stringify({ license: "Apache-2.0" }),
    "utf8",
  );

  const result = await runScript("validate-catalog.py", { APX_REPO_ROOT: root });

  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /license/i);
  assert.match(result.stdout, /package\.json/i);
});
