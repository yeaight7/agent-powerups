#!/usr/bin/env python3
"""Check external tool requirements declared in catalog.json."""

from __future__ import annotations

import importlib.metadata
import json
import os
import shutil
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
CATALOG_PATH = os.path.join(REPO_ROOT, "catalog.json")


def load_catalog() -> list[dict]:
    with open(CATALOG_PATH, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("catalog.json must be a JSON array")
    return data


def package_installed(name: str) -> bool:
    try:
        importlib.metadata.distribution(name)
    except importlib.metadata.PackageNotFoundError:
        return False
    return True


def check_entry(entry: dict) -> tuple[str, list[str]]:
    messages: list[str] = []
    requires = entry.get("requires", {})
    name = entry["name"]

    for command in requires.get("commands", []):
        status = "OK" if shutil.which(command) else "MISSING"
        messages.append(f"command:{command}={status}")

    for package in requires.get("python_packages", []):
        status = "OK" if package_installed(package) else "MISSING"
        messages.append(f"python:{package}={status}")

    for package in requires.get("npm_packages", []):
        messages.append(f"npm:{package}=DECLARED")

    return name, messages


def main(argv: list[str]) -> int:
    if not os.path.isfile(CATALOG_PATH):
        print(f"ERROR: catalog.json not found at {CATALOG_PATH}")
        return 1

    try:
        catalog = load_catalog()
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}")
        return 1

    target_name = argv[1] if len(argv) > 1 else None
    matching = [
        entry
        for entry in catalog
        if isinstance(entry, dict)
        and "requires" in entry
        and (target_name is None or entry.get("name") == target_name)
    ]

    if target_name and not matching:
        print(f"ERROR: no asset with declared requirements found for '{target_name}'")
        return 1

    if not matching:
        print("No catalog entries declare external requirements.")
        return 0

    print("Requirement check results:")
    for entry in matching:
        name, messages = check_entry(entry)
        print(f"- {name}")
        for message in messages:
            print(f"  {message}")

    print()
    print("This script does not install anything.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
