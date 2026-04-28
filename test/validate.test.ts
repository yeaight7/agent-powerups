import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createCatalogService } from "../src/cli/utils/catalog.js";
import { runValidateSkillsCommand } from "../src/cli/commands/validate.js";

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

test("validate skills: fails when skill directory has no SKILL.md", async () => {
  const root = await makeTempRepo();
  await fs.mkdir(path.join(root, "skills", "emptyskill"), { recursive: true });
  const service = await createCatalogService(root);
  const result = await runValidateSkillsCommand(service);
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /missing SKILL\.md/i);
});
