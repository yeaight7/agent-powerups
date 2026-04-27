#!/usr/bin/env python3
"""Validate skill folders and required frontmatter."""

from __future__ import annotations

import os
import re
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
SKILLS_DIR = os.path.join(REPO_ROOT, "skills")
REQUIRED_FRONTMATTER_FIELDS = ["name", "description"]
RECOMMENDED_SECTIONS = [
    "Purpose",
    "When to Use",
    "Inputs",
    "Workflow",
    "Output",
    "Verification",
    "Failure Modes",
]

errors: list[str] = []
warnings: list[str] = []


def parse_frontmatter(content: str) -> dict[str, str] | None:
    if not content.startswith("---"):
        return None
    match = re.match(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", content, re.DOTALL)
    if not match:
        return None

    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields


def check_skill(skill_dir: str) -> None:
    skill_name = os.path.basename(skill_dir)
    skill_md = os.path.join(skill_dir, "SKILL.md")

    if not os.path.isfile(skill_md):
        errors.append(f"[{skill_name}] missing SKILL.md")
        return

    with open(skill_md, encoding="utf-8") as handle:
        content = handle.read()

    if not content.strip():
        errors.append(f"[{skill_name}] SKILL.md is empty")
        return

    frontmatter = parse_frontmatter(content)
    if frontmatter is None:
        errors.append(f"[{skill_name}] SKILL.md missing YAML frontmatter")
        return

    for field in REQUIRED_FRONTMATTER_FIELDS:
        if not frontmatter.get(field, "").strip():
            errors.append(f"[{skill_name}] frontmatter missing required field: {field}")

    if not re.sub(r"\s", "", content):
        errors.append(f"[{skill_name}] SKILL.md has no content")

    prose = re.sub(r"```.*?```", "", content, flags=re.DOTALL)
    if not prose.strip():
        errors.append(f"[{skill_name}] SKILL.md has no prose content")

    if frontmatter.get("name") and frontmatter["name"] != skill_name:
        warnings.append(
            f"[{skill_name}] frontmatter name does not match directory name: {frontmatter['name']}"
        )

    for section in RECOMMENDED_SECTIONS:
        pattern = rf"^##\s+{re.escape(section)}\s*$"
        if not re.search(pattern, content, re.MULTILINE):
            warnings.append(f"[{skill_name}] missing recommended section: ## {section}")


def main() -> int:
    if not os.path.isdir(SKILLS_DIR):
        print(f"ERROR: skills directory not found at {SKILLS_DIR}")
        return 1

    skill_dirs = [
        os.path.join(SKILLS_DIR, entry)
        for entry in sorted(os.listdir(SKILLS_DIR))
        if os.path.isdir(os.path.join(SKILLS_DIR, entry))
    ]

    if not skill_dirs:
        print("ERROR: no skill directories found")
        return 1

    for skill_dir in skill_dirs:
        check_skill(skill_dir)

    if warnings:
        print(f"Warnings ({len(warnings)}):")
        for warning in warnings:
            print(f"  WARN  {warning}")
        print()

    if errors:
        print(f"Errors ({len(errors)}):")
        for error in errors:
            print(f"  ERROR {error}")
        print()
        print(
            f"Checked {len(skill_dirs)} skills. {len(errors)} error(s), {len(warnings)} warning(s). FAILED."
        )
        return 1

    print(f"Checked {len(skill_dirs)} skills. {len(warnings)} warning(s). OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
