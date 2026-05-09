# Graphify Upstream Notes

This skill is based on the upstream `graphify` project by Safi Shamsi:

- Repo: <https://github.com/safishamsi/graphify>
- Package: `graphifyy` on PyPI
- License: MIT

## Why this file exists

`skills/graphify/SKILL.md` is not an original Agent Powerups workflow. It is local guidance for operating a third-party tool. Provenance, install requirements, and license facts must stay explicit.

## Local policy

- Do not claim this repo owns `graphify` or `graphifyy`.
- Do not claim the tool is bundled here. Only the skill documentation is.
- Do not claim compatibility beyond what upstream currently documents unless re-verified.
- Do not auto-install `graphifyy`; show install command first and ask before running it.

## Verified upstream facts

Checked against upstream GitHub README and PyPI metadata on 2026-05-09:

- Official package name is `graphifyy` with a double `y`
- Python 3.10+ required
- Upstream license is MIT
- PowerShell should use `graphify .`, not `/graphify .`
- Codex install path is available through upstream CLI after package install

## When changing this skill

Re-check:

1. Upstream README install instructions
2. PyPI package metadata and license
3. Supported platforms and any new dependency extras
4. Whether this repo's catalog and docs still match upstream facts
