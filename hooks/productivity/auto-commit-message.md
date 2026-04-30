# auto-commit-message

**Type:** PreToolUse hook recipe — review before use, not auto-applied.

## Purpose

Generate a conventional commit message from the staged diff when the agent runs `git commit` without a `-m` flag. Saves the agent from writing boilerplate commit messages and ensures consistent Conventional Commits format across the project.

## Trigger Suggestion

```
PreToolUse → tool == Bash AND command matches "git commit" (without -m flag)
```

## Check Procedure

When triggered:

1. **Check for staged changes** — `git diff --cached --stat`. If nothing staged, do not generate.
2. **Get the diff** — `git diff --cached` (limit to first 4000 chars to avoid context overflow).
3. **Identify change type** — determine `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci` from the diff content.
4. **Identify scope** — extract the most-changed module, file area, or component as the scope.
5. **Write subject** — max 72 chars, imperative mood, no period. Format: `type(scope): description`
6. **Inject into command** — rewrite the commit command to include the generated message.

## Suggested Shell Hook

```bash
#!/usr/bin/env bash
# Intercept bare "git commit" calls (without -m) and inject a generated message.
# Relies on the agent to actually run the enriched command.

STAGED=$(git diff --cached --stat 2>/dev/null)
if [ -z "$STAGED" ]; then
  echo "[auto-commit-message] Nothing staged. Skipping."
  exit 0
fi

DIFF=$(git diff --cached 2>/dev/null | head -c 4000)
echo "[auto-commit-message] Staged changes detected."
echo "Diff summary:"
echo "$STAGED"
echo ""
echo "Suggested message format: <type>(<scope>): <subject>"
echo "Types: feat fix chore refactor test docs ci build perf"
echo "Generate and pass with: git commit -m \"...\""
```

Since message generation requires LLM reasoning, this hook surfaces the diff and prompts the agent to generate the message itself rather than using a dumb template.

## Agent Instructions (for the skill body)

When this hook fires, the agent should:

1. Read the staged diff from the hook output.
2. Determine the change type (feat, fix, chore, etc.) and scope.
3. Draft a subject line: `type(scope): imperative description` — max 72 chars.
4. Add a body if the change is non-obvious (what changed and why, not how).
5. Run: `git commit -m "type(scope): subject" -m "Optional body"`

## Safety Notes

- Never auto-commit without showing the message to the user first.
- If the diff is ambiguous (e.g., a large mixed refactor), ask the user for the intended type.
- Do not include `Co-Authored-By` or similar trailers unless the user has configured them.
- Breaking changes get a `!` suffix: `feat(auth)!: require token refresh on expiry`

## Failure Mode

Without this hook, agents default to vague messages ("Update files", "Fix bug", "Changes") that make git history unreadable and break changelog generation tools.
