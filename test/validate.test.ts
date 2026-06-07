import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createCatalogService } from "../src/cli/utils/catalog.js";
import {
  runValidateCatalogCommand,
  runValidateDriftCommand,
  runValidateMetadataCommand,
  runValidateSkillsCommand,
} from "../src/cli/commands/validate.js";

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

// Build a temp repo from catalog entries (creating each referenced path dir) plus
// optional repo-relative files. Mirrors the createCatalogService contract.
async function makeCatalogRepo(entries: any[], files: Record<string, string> = {}): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "apx-validateb-"));
  await fs.writeFile(path.join(root, "catalog.json"), JSON.stringify(entries), "utf8");
  for (const entry of entries) {
    await fs.mkdir(path.join(root, entry.path), { recursive: true });
  }
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content, "utf8");
  }
  return root;
}

const skillEntry = (name: string, summary: string, extra: Record<string, unknown> = {}) => ({
  name,
  type: "skill",
  summary,
  path: `skills/${name}`,
  compatible_with: ["generic"],
  tags: [],
  maturity: "stable",
  ...extra,
});

const skillMd = (name: string, description: string) => `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n`;

test("validate drift: passes when catalog name and summary match frontmatter", async () => {
  const root = await makeCatalogRepo([skillEntry("myskill", "Use when testing X.")], {
    "skills/myskill/SKILL.md": skillMd("myskill", "Use when testing X."),
  });
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /0 error/i);
});

test("validate drift: errors when catalog.name mismatches frontmatter.name", async () => {
  const root = await makeCatalogRepo([skillEntry("real-skill", "Shared summary.")], {
    "skills/real-skill/SKILL.md": skillMd("stale-name", "Shared summary."),
  });
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /catalog\.name.*!=.*frontmatter\.name/i);
});

test("validate drift: summary/description difference is a warning, not an error", async () => {
  const root = await makeCatalogRepo([skillEntry("mskill", "Find root cause.")], {
    "skills/mskill/SKILL.md": skillMd("mskill", "Use when compressing output."),
  });
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /differs from frontmatter\.description/i);
  assert.match(result.stdout, /0 error/i);
});

test("validate drift: warns (exit 0) when SKILL.md is missing", async () => {
  const root = await makeCatalogRepo([skillEntry("noskill", "Summary.")]);
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /drift check skipped/i);
});

test("validate drift: errors when SKILL.md has no parseable frontmatter", async () => {
  const root = await makeCatalogRepo([skillEntry("raw", "Summary.")], {
    "skills/raw/SKILL.md": "# no frontmatter here\n",
  });
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 1);
  assert.match(result.stdout, /no parseable frontmatter/i);
});

test("validate drift: ignores non-skill catalog entries", async () => {
  const root = await makeCatalogRepo(
    [
      skillEntry("ok", "Use when X."),
      { name: "cmd", type: "command", summary: "c", path: "commands/cmd", compatible_with: ["generic"], tags: [], maturity: "stable" },
    ],
    { "skills/ok/SKILL.md": skillMd("ok", "Use when X.") },
  );
  const result = await runValidateDriftCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.doesNotMatch(result.stdout, /\[cmd\]/);
});

test("validate metadata: passes when routable assets carry use_when", async () => {
  const root = await makeCatalogRepo([skillEntry("a", "s", { use_when: ["A task signal."] })]);
  const result = await runValidateMetadataCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /0 warning/i);
});

test("validate metadata: warns (exit 0) when a skill lacks both use_when and signals", async () => {
  const root = await makeCatalogRepo([skillEntry("b", "s")]);
  const result = await runValidateMetadataCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /WARN.*missing use_when and signals/i);
});

test("validate metadata: does not warn for assets that opt out via check_policy or activation", async () => {
  const root = await makeCatalogRepo([
    skillEntry("c", "s", { check_policy: "none" }),
    skillEntry("d", "s", { activation: "approval-required" }),
  ]);
  const result = await runValidateMetadataCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /0 warning/i);
});

test("validate metadata: skips non-routable types (hook, mcp-config, pack)", async () => {
  const root = await makeCatalogRepo([
    { name: "h", type: "hook", summary: "s", path: "hooks/h", compatible_with: ["generic"], tags: [], maturity: "stable" },
    { name: "p", type: "pack", summary: "s", path: "plugins/p", compatible_with: ["generic"], tags: [], maturity: "stable" },
  ]);
  const result = await runValidateMetadataCommand(await createCatalogService(root));
  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Checked 0 routable asset\(s\)\. 0 warning/i);
});
