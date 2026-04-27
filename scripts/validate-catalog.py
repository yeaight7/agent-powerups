#!/usr/bin/env python3
"""Validate catalog.json: required fields, no duplicate names, all paths exist, all skills indexed."""

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
CATALOG_PATH = os.path.join(REPO_ROOT, "catalog.json")
SKILLS_DIR = os.path.join(REPO_ROOT, "skills")

REQUIRED_FIELDS = ["name", "type", "summary", "path", "compatible_with", "tags", "maturity"]
ALLOWED_TYPES = {"skill", "command", "mcp-config", "agents-md-template", "hook", "workflow", "example"}
ALLOWED_MATURITY = {"draft", "beta", "stable"}
ALLOWED_COMPATIBLE = {"claude-code", "codex", "gemini", "cursor", "generic"}

errors = []
warnings = []


def main():
    # Load catalog
    if not os.path.isfile(CATALOG_PATH):
        print(f"ERROR: catalog.json not found at {CATALOG_PATH}")
        sys.exit(1)

    with open(CATALOG_PATH, encoding="utf-8") as f:
        try:
            catalog = json.load(f)
        except json.JSONDecodeError as e:
            print(f"ERROR: catalog.json is not valid JSON: {e}")
            sys.exit(1)

    if not isinstance(catalog, list):
        print("ERROR: catalog.json must be a JSON array")
        sys.exit(1)

    seen_names = {}

    for i, entry in enumerate(catalog):
        label = entry.get("name", f"entry[{i}]")

        # Required fields
        for field in REQUIRED_FIELDS:
            if field not in entry:
                errors.append(f"[{label}] missing required field: {field}")
            elif not entry[field]:
                errors.append(f"[{label}] field '{field}' is empty")

        # Type validation
        entry_type = entry.get("type", "")
        if entry_type and entry_type not in ALLOWED_TYPES:
            errors.append(f"[{label}] invalid type '{entry_type}'. Allowed: {sorted(ALLOWED_TYPES)}")

        # Maturity validation
        maturity = entry.get("maturity", "")
        if maturity and maturity not in ALLOWED_MATURITY:
            errors.append(f"[{label}] invalid maturity '{maturity}'. Allowed: {sorted(ALLOWED_MATURITY)}")

        # compatible_with validation
        compatible = entry.get("compatible_with", [])
        if not isinstance(compatible, list):
            errors.append(f"[{label}] 'compatible_with' must be an array")
        else:
            for platform in compatible:
                if platform not in ALLOWED_COMPATIBLE:
                    warnings.append(
                        f"[{label}] unknown platform '{platform}' in compatible_with. "
                        f"Known: {sorted(ALLOWED_COMPATIBLE)}"
                    )

        # tags validation
        tags = entry.get("tags", [])
        if not isinstance(tags, list):
            errors.append(f"[{label}] 'tags' must be an array")

        # Duplicate names
        name = entry.get("name", "")
        if name:
            if name in seen_names:
                errors.append(f"[{label}] duplicate name — also appears at entry[{seen_names[name]}]")
            else:
                seen_names[name] = i

        # Path exists
        entry_path = entry.get("path", "")
        if entry_path:
            full_path = os.path.join(REPO_ROOT, entry_path)
            if not os.path.exists(full_path):
                errors.append(f"[{label}] path does not exist: {entry_path}")

    # Check all skills are in catalog
    if os.path.isdir(SKILLS_DIR):
        cataloged_skill_paths = {
            e["path"] for e in catalog if e.get("type") == "skill" and "path" in e
        }
        for skill_dir in sorted(os.listdir(SKILLS_DIR)):
            full = os.path.join(SKILLS_DIR, skill_dir)
            if os.path.isdir(full):
                expected_path = f"skills/{skill_dir}"
                if expected_path not in cataloged_skill_paths:
                    errors.append(f"[{skill_dir}] skill directory exists but has no catalog entry")

    checked = len(catalog)
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
        print(f"Checked {checked} catalog entries. {len(errors)} error(s), {len(warnings)} warning(s). FAILED.")
        sys.exit(1)
    else:
        print(f"Checked {checked} catalog entries. {len(warnings)} warning(s). OK.")
        sys.exit(0)


if __name__ == "__main__":
    main()
