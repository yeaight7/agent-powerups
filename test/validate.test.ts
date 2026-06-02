import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createCatalogService } from "../src/cli/utils/catalog.js";
import { runValidateCatalogCommand, runValidateSkillsCommand } from "../src/cli/commands/validate.js";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function makeTempRepo(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "apx-validate-test-"));
  await fs.writeFile(path.join(root, "catalog.json"), "[]", "utf8");
  return root;
}

test("validate skills: passes when skills dir is empty", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills"), { recursive: true });
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 0);
});

test("validate skills: fails when SKILL.md missing required frontmatter field", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "badskill"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "badskill", "SKILL.md"),
    "---\nname: badskill\n---\n\n# No description field\n",
    "utf8",
  );
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /description/i);
});

test("validate skills: fails when frontmatter name mismatches directory", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "real-name"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "real-name", "SKILL.md"),
    "---\nname: stale-name\ndescription: Use when testing\n---\n\n# Test skill\n",
    "utf8",
  );
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /frontmatter name does not match directory name/i);
});

test("validate skills: fails when backtick reference file is missing", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "refskill", "references"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "refskill", "SKILL.md"),
    [
      "---",
      "name: refskill",
      "description: Use when testing",
      "---",
      "",
      "Read `references/missing.md` before running.",
    ].join("\n"),
    "utf8",
  );
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /missing referenced support file/i);
});

test("validate skills: fails when SKILL.md uses XML-like top-level section tags", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "tagged-skill"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "tagged-skill", "SKILL.md"),
    [
      "---",
      "name: tagged-skill",
      "description: Use when testing",
      "---",
      "",
      "<Purpose>",
      "Test purpose.",
      "</Purpose>",
    ].join("\n"),
    "utf8",
  );
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /XML-like top-level section tag <Purpose>/i);
});

test("validate skills: fails when skill directory has no SKILL.md", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "emptyskill"), { recursive: true });
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /missing SKILL\.md/i);
});

test("python validate-skills fails when SKILL.md uses XML-like top-level section tags", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "tagged-skill"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "tagged-skill", "SKILL.md"),
    "---\nname: tagged-skill\ndescription: Use when testing\n---\n\n<Workflow>\nTest workflow.\n</Workflow>\n",
    "utf8",
  );

  await assert.rejects(
    execFileAsync("python", [path.join(repoRoot, "scripts", "validate-skills.py")], {
      env: { ...process.env, APX_REPO_ROOT: root },
    }),
    (error: any) => {
      assert.equal(error.code, 1);
      assert.match(error.stdout, /XML-like top-level section tag <Workflow>/i);
      return true;
    },
  );
});

test("python validate-skills default suppresses style warnings", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "lean-skill"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "lean-skill", "SKILL.md"),
    "---\nname: lean-skill\ndescription: Use when testing\n---\n\n# Lean skill\n",
    "utf8",
  );

  const result = await execFileAsync("python", [path.join(repoRoot, "scripts", "validate-skills.py")], {
    env: { ...process.env, APX_REPO_ROOT: root },
  });

  assert.match(result.stdout, /0 warning\(s\).*OK/i);
  assert.doesNotMatch(result.stdout, /missing recommended section/i);
});

test("python validate-skills --style reports missing recommended sections", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "lean-skill"), { recursive: true });
  await fs.writeFile(
    path.join(root, "skills", "lean-skill", "SKILL.md"),
    "---\nname: lean-skill\ndescription: Use when testing\n---\n\n# Lean skill\n",
    "utf8",
  );

  const result = await execFileAsync("python", [path.join(repoRoot, "scripts", "validate-skills.py"), "--style"], {
    env: { ...process.env, APX_REPO_ROOT: root },
  });

  assert.match(result.stdout, /missing recommended section/i);
  assert.match(result.stdout, /warning\(s\).*OK/i);
});

test("validate catalog: passes with consistent Apache-2.0 licenses", async () => {
  const root = await makeTempRepo();
  await fs.writeFile(path.join(root, "LICENSE"), "Apache License\nVersion 2.0\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ license: "Apache-2.0" }), "utf8");
  await fs.mkdir(path.join(root, "plugins", "agent-powerups", ".codex-plugin"), { recursive: true });
  await fs.writeFile(
    path.join(root, "plugins", "agent-powerups", ".codex-plugin", "plugin.json"),
    JSON.stringify({ license: "Apache-2.0" }),
    "utf8",
  );
  const service = await createCatalogService(root);
  const result = await runValidateCatalogCommand(service);
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /0 error/i);
});

test("validate catalog: fails when package.json license mismatches root LICENSE", async () => {
  const root = await makeTempRepo();
  await fs.writeFile(path.join(root, "LICENSE"), "Apache License\nVersion 2.0\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), JSON.stringify({ license: "MIT" }), "utf8");
  const service = await createCatalogService(root);
  const result = await runValidateCatalogCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /license/i);
  assert.match(result.stdout, /package\.json/i);
});
