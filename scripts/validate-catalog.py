#!/usr/bin/env python3
"""Validate catalog.json structure and asset coverage."""

from __future__ import annotations

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
CATALOG_PATH = os.path.join(REPO_ROOT, "catalog.json")
SKILLS_DIR = os.path.join(REPO_ROOT, "skills")
SCRIPTS_DIR = os.path.join(REPO_ROOT, "scripts")
COMMANDS_DIR = os.path.join(REPO_ROOT, "commands")
HOOKS_DIR = os.path.join(REPO_ROOT, "hooks")
WORKFLOWS_DIR = os.path.join(REPO_ROOT, "workflows")
AGENTS_MD_DIR = os.path.join(REPO_ROOT, "agents-md")

REQUIRED_FIELDS = ["name", "type", "summary", "path", "compatible_with", "tags", "maturity"]
ALLOWED_TYPES = {
    "skill",
    "command",
    "mcp-config",
    "agents-md-template",
    "hook",
    "workflow",
    "example",
    "script",
    "pack",
}
ALLOWED_MATURITY = {"draft", "beta", "stable"}
ALLOWED_COMPATIBLE = {"claude-code", "codex", "gemini-cli", "cursor", "generic"}
ALLOWED_REQUIRE_KEYS = {"commands", "python_packages", "npm_packages"}
ALLOWED_TARGET_KEYS = {"codex", "claude-code", "generic"}

errors: list[str] = []
warnings: list[str] = []


def load_catalog() -> list[dict]:
    with open(CATALOG_PATH, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("catalog.json must be a JSON array")
    return data


def validate_requires(label: str, requires: object) -> None:
    if not isinstance(requires, dict):
        errors.append(f"[{label}] requires must be an object")
        return

    for key, value in requires.items():
        if key not in ALLOWED_REQUIRE_KEYS:
            warnings.append(f"[{label}] unknown requires key: {key}")
        if not isinstance(value, list):
            errors.append(f"[{label}] requires.{key} must be an array")
            continue
        for item in value:
            if not isinstance(item, str) or not item.strip():
                errors.append(f"[{label}] requires.{key} contains non-string or empty value")


def validate_targets(label: str, targets: object) -> None:
    if not isinstance(targets, dict):
        errors.append(f"[{label}] targets must be an object")
        return

    for key, value in targets.items():
        if key not in ALLOWED_TARGET_KEYS:
            errors.append(f"[{label}] invalid target key '{key}'")
        if not isinstance(value, str) or not value.strip():
            errors.append(f"[{label}] targets.{key} must be a non-empty string")


def validate_entry(index: int, entry: dict, seen_names: dict[str, int]) -> None:
    label = entry.get("name", f"entry[{index}]")

    if not isinstance(entry, dict):
        errors.append(f"[entry[{index}]] entry must be an object")
        return

    for field in REQUIRED_FIELDS:
        if field not in entry:
            errors.append(f"[{label}] missing required field: {field}")
        elif entry[field] in ("", [], {}):
            errors.append(f"[{label}] field '{field}' is empty")

    entry_type = entry.get("type")
    if entry_type and entry_type not in ALLOWED_TYPES:
        errors.append(f"[{label}] invalid type '{entry_type}'")

    maturity = entry.get("maturity")
    if maturity and maturity not in ALLOWED_MATURITY:
        errors.append(f"[{label}] invalid maturity '{maturity}'")

    compatible = entry.get("compatible_with")
    if compatible is not None and not isinstance(compatible, list):
        errors.append(f"[{label}] compatible_with must be an array")
    elif isinstance(compatible, list):
        for platform in compatible:
            if platform not in ALLOWED_COMPATIBLE:
                errors.append(f"[{label}] invalid compatible_with value '{platform}'")

    tags = entry.get("tags")
    if tags is not None and not isinstance(tags, list):
        errors.append(f"[{label}] tags must be an array")

    name = entry.get("name")
    if isinstance(name, str) and name:
        if name in seen_names:
            errors.append(f"[{label}] duplicate name; also appears at entry[{seen_names[name]}]")
        else:
            seen_names[name] = index

    entry_path = entry.get("path")
    if isinstance(entry_path, str) and entry_path:
        full_path = os.path.join(REPO_ROOT, entry_path)
        if not os.path.exists(full_path):
            errors.append(f"[{label}] path does not exist: {entry_path}")

    if "requires" in entry:
        validate_requires(label, entry["requires"])
    if "targets" in entry:
        validate_targets(label, entry["targets"])
        if isinstance(entry["targets"], dict):
            for target_path in entry["targets"].values():
                if isinstance(target_path, str) and target_path:
                    full_target_path = os.path.join(REPO_ROOT, target_path)
                    if not os.path.exists(full_target_path):
                        errors.append(f"[{label}] target path does not exist: {target_path}")


def validate_asset_coverage(catalog: list[dict]) -> None:
    cataloged_paths = {entry.get("path") for entry in catalog if isinstance(entry, dict)}
    for entry in catalog:
        if not isinstance(entry, dict) or not isinstance(entry.get("targets"), dict):
            continue
        cataloged_paths.update(entry["targets"].values())

    if os.path.isdir(SKILLS_DIR):
        for entry in sorted(os.listdir(SKILLS_DIR)):
            full_path = os.path.join(SKILLS_DIR, entry)
            if not os.path.isdir(full_path):
                continue
            expected = f"skills/{entry}"
            if expected not in cataloged_paths:
                errors.append(f"[{entry}] skill directory exists but has no catalog entry")

    if os.path.isdir(SCRIPTS_DIR):
        for entry in sorted(os.listdir(SCRIPTS_DIR)):
            if not entry.endswith(".py"):
                continue
            expected = f"scripts/{entry}"
            if expected not in cataloged_paths:
                warnings.append(f"[{entry}] script exists but has no catalog entry")

    for root_dir, asset_type, suffix in [
        (COMMANDS_DIR, "command", ".md"),
        (HOOKS_DIR, "hook", ".md"),
        (WORKFLOWS_DIR, "workflow", ".md"),
    ]:
        if not os.path.isdir(root_dir):
            continue
        for current_dir, _, files in os.walk(root_dir):
            for filename in sorted(files):
                if filename == ".gitkeep" or not filename.endswith(suffix):
                    continue
                full_path = os.path.join(current_dir, filename)
                rel_path = os.path.relpath(full_path, REPO_ROOT).replace(os.sep, "/")
                if rel_path not in cataloged_paths:
                    errors.append(f"[{rel_path}] {asset_type} file exists but has no catalog entry")

    if os.path.isdir(AGENTS_MD_DIR):
        for entry in sorted(os.listdir(AGENTS_MD_DIR)):
            expected = f"agents-md/{entry}/AGENTS.md"
            full_path = os.path.join(REPO_ROOT, expected)
            if os.path.isfile(full_path) and expected not in cataloged_paths:
                errors.append(f"[{entry}] AGENTS.md template exists but has no catalog entry")


def main() -> int:
    if not os.path.isfile(CATALOG_PATH):
        print(f"ERROR: catalog.json not found at {CATALOG_PATH}")
        return 1

    try:
        catalog = load_catalog()
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1

    seen_names: dict[str, int] = {}
    for index, entry in enumerate(catalog):
        validate_entry(index, entry, seen_names)

    validate_asset_coverage(catalog)

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
            f"Checked {len(catalog)} catalog entries. {len(errors)} error(s), {len(warnings)} warning(s). FAILED."
        )
        return 1

    print(f"Checked {len(catalog)} catalog entries. {len(warnings)} warning(s). OK.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
