#!/usr/bin/env python3
"""Validate catalog.json structure and asset coverage."""

from __future__ import annotations

import json
import os
import subprocess
import sys

REPO_ROOT = os.environ.get("APX_REPO_ROOT") or os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)
CATALOG_PATH = os.path.join(REPO_ROOT, "catalog.json")
SKILLS_DIR = os.path.join(REPO_ROOT, "skills")
SCRIPTS_DIR = os.path.join(REPO_ROOT, "scripts")
COMMANDS_DIR = os.path.join(REPO_ROOT, "commands")
HOOKS_DIR = os.path.join(REPO_ROOT, "hooks")
WORKFLOWS_DIR = os.path.join(REPO_ROOT, "workflows")
AGENTS_MD_DIR = os.path.join(REPO_ROOT, "agents-md")
PACKAGE_JSON_PATH = os.path.join(REPO_ROOT, "package.json")
LICENSE_PATH = os.path.join(REPO_ROOT, "LICENSE")
PLUGIN_JSON_PATH = os.path.join(REPO_ROOT, "plugins", "agent-powerups", ".codex-plugin", "plugin.json")

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
ALLOWED_MATURITY = {"draft", "beta", "stable", "experimental"}
ALLOWED_COMPATIBLE = {"claude-code", "codex", "gemini-cli", "cursor", "generic"}
ALLOWED_REQUIRE_KEYS = {"commands", "python_packages", "npm_packages"}
ALLOWED_TARGET_KEYS = {"codex", "claude-code", "generic"}
ALLOWED_RUN_KINDS = {"ship-check"}
ALLOWED_MCP_KEYS = {"required_env", "server_package", "warning", "output_hints"}

errors: list[str] = []
warnings: list[str] = []


def is_gitignored(path: str) -> bool:
    rel_path = os.path.relpath(path, REPO_ROOT).replace(os.sep, "/")
    try:
        result = subprocess.run(
            ["git", "check-ignore", "-q", "--", rel_path],
            cwd=REPO_ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError:
        return False
    return result.returncode == 0


def detect_root_license() -> str:
    if not os.path.isfile(LICENSE_PATH):
        return "MISSING"
    with open(LICENSE_PATH, encoding="utf-8") as handle:
        content = handle.read()
    if "Apache License" in content and "Version 2.0" in content:
        return "Apache-2.0"
    return "UNKNOWN"


def load_json_file(path: str) -> dict:
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return data


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


def validate_run(label: str, run: object) -> None:
    if not isinstance(run, dict):
        errors.append(f"[{label}] run must be an object")
        return

    kind = run.get("kind")
    if kind not in ALLOWED_RUN_KINDS:
        errors.append(f"[{label}] invalid run.kind '{kind}'")


def validate_mcp(label: str, mcp: object) -> None:
    if not isinstance(mcp, dict):
        errors.append(f"[{label}] mcp must be an object")
        return

    for key in mcp:
        if key not in ALLOWED_MCP_KEYS:
            warnings.append(f"[{label}] unknown mcp key: {key}")

    required_env = mcp.get("required_env")
    if required_env is not None:
        if not isinstance(required_env, list):
            errors.append(f"[{label}] mcp.required_env must be an array")
        else:
            for env_name in required_env:
                if not isinstance(env_name, str) or not env_name.strip():
                    errors.append(f"[{label}] mcp.required_env contains non-string or empty value")

    server_package = mcp.get("server_package")
    if server_package is not None and (not isinstance(server_package, str) or not server_package.strip()):
        errors.append(f"[{label}] mcp.server_package must be a non-empty string")

    output_hints = mcp.get("output_hints")
    if output_hints is not None:
        if not isinstance(output_hints, dict):
            errors.append(f"[{label}] mcp.output_hints must be an object")
        else:
            for target, hint in output_hints.items():
                if target not in ALLOWED_TARGET_KEYS:
                    errors.append(f"[{label}] invalid mcp.output_hints target '{target}'")
                if not isinstance(hint, str) or not hint.strip():
                    errors.append(f"[{label}] mcp.output_hints.{target} must be a non-empty string")


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
    if "run" in entry:
        validate_run(label, entry["run"])
    if "mcp" in entry:
        validate_mcp(label, entry["mcp"])


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
            if is_gitignored(full_path):
                continue
            expected = f"skills/{entry}"
            if expected not in cataloged_paths:
                errors.append(f"[{entry}] skill directory exists but has no catalog entry")

    if os.path.isdir(SCRIPTS_DIR):
        for entry in sorted(os.listdir(SCRIPTS_DIR)):
            if not entry.endswith(".py"):
                continue
            if is_gitignored(os.path.join(SCRIPTS_DIR, entry)):
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
                if is_gitignored(full_path):
                    continue
                rel_path = os.path.relpath(full_path, REPO_ROOT).replace(os.sep, "/")
                if rel_path not in cataloged_paths:
                    errors.append(f"[{rel_path}] {asset_type} file exists but has no catalog entry")

    if os.path.isdir(AGENTS_MD_DIR):
        for entry in sorted(os.listdir(AGENTS_MD_DIR)):
            expected = f"agents-md/{entry}/AGENTS.md"
            full_path = os.path.join(REPO_ROOT, expected)
            if is_gitignored(full_path):
                continue
            if os.path.isfile(full_path) and expected not in cataloged_paths:
                errors.append(f"[{entry}] AGENTS.md template exists but has no catalog entry")


def validate_license_consistency() -> None:
    root_license = detect_root_license()
    if root_license != "Apache-2.0":
        errors.append(f"[LICENSE] expected Apache-2.0-compatible LICENSE, found {root_license}")

    if os.path.isfile(PACKAGE_JSON_PATH):
        try:
            package_json = load_json_file(PACKAGE_JSON_PATH)
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(f"[package.json] invalid JSON: {exc}")
        else:
            if package_json.get("license") != root_license:
                errors.append(
                    f"[package.json] license mismatch: expected {root_license}, found {package_json.get('license', 'missing')}"
                )

    if os.path.isfile(PLUGIN_JSON_PATH):
        try:
            plugin_json = load_json_file(PLUGIN_JSON_PATH)
        except (json.JSONDecodeError, ValueError) as exc:
            errors.append(f"[plugin.json] invalid JSON: {exc}")
        else:
            if plugin_json.get("license") != root_license:
                errors.append(
                    f"[plugin.json] license mismatch: expected {root_license}, found {plugin_json.get('license', 'missing')}"
                )


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
    validate_license_consistency()

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
