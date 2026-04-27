#!/usr/bin/env python3
"""Validate all skill folders in skills/ have required structure and frontmatter."""

import os
import sys
import re

SKILLS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "skills")
REQUIRED_FRONTMATTER_FIELDS = ["name", "description"]
REQUIRED_SECTIONS = [
    "Purpose",
    "When to Use",
    "Inputs",
    "Workflow",
    "Output",
    "Verification",
    "Failure Modes",
]

errors = []
warnings = []


def parse_frontmatter(content):
    """Extract YAML frontmatter fields from a markdown file."""
    if not content.startswith("---"):
        return None
    end = content.find("---", 3)
    if end == -1:
        return None
    frontmatter_text = content[3:end].strip()
    fields = {}
    for line in frontmatter_text.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return fields


def check_skill(skill_dir):
    skill_name = os.path.basename(skill_dir)
    skill_md = os.path.join(skill_dir, "SKILL.md")

    if not os.path.isfile(skill_md):
        errors.append(f"[{skill_name}] Missing SKILL.md")
        return

    with open(skill_md, encoding="utf-8") as f:
        content = f.read()

    # Check frontmatter exists
    frontmatter = parse_frontmatter(content)
    if frontmatter is None:
        errors.append(f"[{skill_name}] SKILL.md has no YAML frontmatter (must start with ---)")
        return

    # Check required frontmatter fields
    for field in REQUIRED_FRONTMATTER_FIELDS:
        if field not in frontmatter or not frontmatter[field]:
            errors.append(f"[{skill_name}] SKILL.md frontmatter missing required field: {field}")

    # Check name matches directory
    if frontmatter.get("name") and frontmatter["name"] != skill_name:
        warnings.append(
            f"[{skill_name}] frontmatter 'name' ({frontmatter['name']}) "
            f"does not match directory name ({skill_name})"
        )

    # Check required sections
    for section in REQUIRED_SECTIONS:
        pattern = rf"^##\s+{re.escape(section)}\s*$"
        if not re.search(pattern, content, re.MULTILINE):
            warnings.append(f"[{skill_name}] SKILL.md missing recommended section: ## {section}")

    # Check for obvious placeholders
    placeholder_patterns = [r"\bTBD\b", r"\bTODO\b", r"implement later", r"fill in details"]
    for pattern in placeholder_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            errors.append(f"[{skill_name}] SKILL.md contains placeholder text matching: {pattern!r}")


def main():
    if not os.path.isdir(SKILLS_DIR):
        print(f"ERROR: skills/ directory not found at {SKILLS_DIR}")
        sys.exit(1)

    skill_dirs = [
        os.path.join(SKILLS_DIR, d)
        for d in sorted(os.listdir(SKILLS_DIR))
        if os.path.isdir(os.path.join(SKILLS_DIR, d))
    ]

    if not skill_dirs:
        print("WARNING: No skill directories found in skills/")
        sys.exit(0)

    for skill_dir in skill_dirs:
        check_skill(skill_dir)

    checked = len(skill_dirs)
    if warnings:
        print(f"Warnings ({len(warnings)}):")
        for w in warnings:
            print(f"  WARN  {w}")
        print()

    if errors:
        print(f"Errors ({len(errors)}):")
        for e in errors:
            print(f"  ERROR {e}")
        print()
        print(f"Checked {checked} skills. {len(errors)} error(s), {len(warnings)} warning(s). FAILED.")
        sys.exit(1)
    else:
        print(f"Checked {checked} skills. {len(warnings)} warning(s). OK.")
        sys.exit(0)


if __name__ == "__main__":
    main()
