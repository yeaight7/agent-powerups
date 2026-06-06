#!/usr/bin/env python3
"""Validate that plugin skill copies stay byte-identical with their root skills.

Every skill under plugins/<bundle>/skills/<name>/ is expected to be a
byte-for-byte copy of skills/<name>/ (root is canonical). Intentional
variants must be declared in VARIANT_ALLOWLIST with a reason; everything
else that differs, is missing, or exists only in the plugin copy is an
error. Gitignored skill directories and files are skipped.
"""

from __future__ import annotations

import os
import subprocess
import sys

REPO_ROOT = os.environ.get("APX_REPO_ROOT") or os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
SKILLS_DIR = os.path.join(REPO_ROOT, "skills")
PLUGINS_DIR = os.path.join(REPO_ROOT, "plugins")

# Plugin skill copies that intentionally diverge from the root skill.
# Every entry needs a reason. If an entry becomes byte-identical to root,
# this validator warns so the stale entry gets removed.
VARIANT_ALLOWLIST: dict[str, str] = {
    "plugins/dev-vitals/skills/agent-harness-design": (
        "condensed core-workflow variant of the root skill"
    ),
    "plugins/codebase-maintenance/skills/context-retrieval-loop": (
        "refactor/blast-radius specialization of the root skill"
    ),
    "plugins/dev-vitals/skills/context-retrieval-loop": (
        "condensed generic variant of the root skill"
    ),
    "plugins/documentation-systems/skills/context-retrieval-loop": (
        "documentation specialization of the root skill"
    ),
}

SKIP_DIR_NAMES = {"__pycache__", "node_modules", ".git", "graphify-out"}

errors: list[str] = []
warnings: list[str] = []


def repo_rel_path(path: str) -> str:
    return os.path.relpath(path, REPO_ROOT).replace(os.sep, "/")


def batch_gitignored(rel_paths: list[str]) -> set[str]:
    """Return the subset of repo-relative paths that are gitignored."""
    if not rel_paths:
        return set()
    try:
        result = subprocess.run(
            ["git", "check-ignore", "--stdin"],
            cwd=REPO_ROOT,
            input="\n".join(rel_paths),
            capture_output=True,
            text=True,
        )
    except OSError:
        return set()
    # Exit 0 = some paths ignored, 1 = none ignored, 128 = usage error.
    if result.returncode not in (0, 1):
        return set()
    return {line.strip() for line in result.stdout.splitlines() if line.strip()}


def files_under(directory: str) -> list[str]:
    """List files below a directory as sorted dir-relative POSIX paths."""
    found: list[str] = []
    for current, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in SKIP_DIR_NAMES]
        for name in files:
            full = os.path.join(current, name)
            found.append(os.path.relpath(full, directory).replace(os.sep, "/"))
    return sorted(found)


def read_bytes(path: str) -> bytes:
    with open(path, "rb") as handle:
        return handle.read()


def compare_copy(plugin_dir: str, root_dir: str, ignored: set[str]) -> tuple[list[str], int]:
    """Compare one plugin skill copy against its root skill.

    Returns (issue descriptions, number of file pairs checked).
    """
    issues: list[str] = []
    plugin_files = files_under(plugin_dir)
    root_files = files_under(root_dir)
    checked = 0

    for rel in sorted(set(plugin_files) | set(root_files)):
        plugin_file = os.path.join(plugin_dir, *rel.split("/"))
        root_file = os.path.join(root_dir, *rel.split("/"))
        if repo_rel_path(plugin_file) in ignored or repo_rel_path(root_file) in ignored:
            continue
        if rel not in root_files:
            issues.append(f"file exists only in the plugin copy: {rel}")
        elif rel not in plugin_files:
            issues.append(f"file missing from the plugin copy: {rel}")
        else:
            checked += 1
            if read_bytes(plugin_file) != read_bytes(root_file):
                issues.append(f"content drift from root skill: {rel}")
    return issues, checked


def main() -> int:
    if not os.path.isdir(SKILLS_DIR):
        print(f"ERROR: skills directory not found at {SKILLS_DIR}")
        return 1
    if not os.path.isdir(PLUGINS_DIR):
        print(f"ERROR: plugins directory not found at {PLUGINS_DIR}")
        return 1

    # Enumerate plugin skill copies, skipping gitignored directories.
    copies: list[tuple[str, str, str]] = []  # (plugin_rel, plugin_dir, root_dir)
    dir_candidates: list[str] = []
    for bundle in sorted(os.listdir(PLUGINS_DIR)):
        bundle_skills = os.path.join(PLUGINS_DIR, bundle, "skills")
        if not os.path.isdir(bundle_skills):
            continue
        for skill in sorted(os.listdir(bundle_skills)):
            plugin_dir = os.path.join(bundle_skills, skill)
            if not os.path.isdir(plugin_dir):
                continue
            root_dir = os.path.join(SKILLS_DIR, skill)
            plugin_rel = repo_rel_path(plugin_dir)
            copies.append((plugin_rel, plugin_dir, root_dir))
            dir_candidates.append(plugin_rel)
            dir_candidates.append(repo_rel_path(root_dir))

    ignored_dirs = batch_gitignored(dir_candidates)

    # Batch the per-file gitignore check across every copy.
    file_candidates: list[str] = []
    for plugin_rel, plugin_dir, root_dir in copies:
        if plugin_rel in ignored_dirs or repo_rel_path(root_dir) in ignored_dirs:
            continue
        if os.path.isdir(root_dir):
            for rel in files_under(root_dir):
                file_candidates.append(f"{repo_rel_path(root_dir)}/{rel}")
        for rel in files_under(plugin_dir):
            file_candidates.append(f"{plugin_rel}/{rel}")
    ignored_files = batch_gitignored(file_candidates)

    checked_copies = 0
    checked_files = 0
    seen_allowlisted: set[str] = set()

    for plugin_rel, plugin_dir, root_dir in copies:
        if plugin_rel in ignored_dirs or repo_rel_path(root_dir) in ignored_dirs:
            continue

        if not os.path.isdir(root_dir):
            warnings.append(
                f"[{plugin_rel}] plugin skill has no root counterpart under skills/"
            )
            continue

        issues, checked = compare_copy(plugin_dir, root_dir, ignored_files)

        if plugin_rel in VARIANT_ALLOWLIST:
            seen_allowlisted.add(plugin_rel)
            if not issues:
                warnings.append(
                    f"[{plugin_rel}] allowlisted variant is byte-identical to root; "
                    "remove it from VARIANT_ALLOWLIST"
                )
            continue

        checked_copies += 1
        checked_files += checked
        for issue in issues:
            errors.append(f"[{plugin_rel}] {issue}")

    for entry in sorted(set(VARIANT_ALLOWLIST) - seen_allowlisted):
        warnings.append(
            f"[{entry}] VARIANT_ALLOWLIST entry does not match any plugin skill copy; remove it"
        )

    for message in errors:
        print(f"ERROR: {message}")
    for message in warnings:
        print(f"WARNING: {message}")

    if errors:
        print(
            f"Checked {checked_copies} mirrored skill copies ({checked_files} file pairs), "
            f"{len(VARIANT_ALLOWLIST)} allowlisted variants. "
            f"{len(errors)} error(s), {len(warnings)} warning(s). FAILED."
        )
        return 1

    print(
        f"Checked {checked_copies} mirrored skill copies ({checked_files} file pairs), "
        f"{len(VARIANT_ALLOWLIST)} allowlisted variants. {len(warnings)} warning(s). OK."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
