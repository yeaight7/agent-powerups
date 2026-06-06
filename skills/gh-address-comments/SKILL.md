---
name: gh-address-comments
description: Address actionable GitHub pull request review feedback. Use when the user wants to inspect unresolved review threads, requested changes, or inline review comments on a PR, then implement selected fixes.
---

# GitHub PR Comment Handler

Use this skill when the user wants to work through requested changes on a GitHub pull request. Use the GitHub MCP or `gh` CLI for PR metadata and patch context. Treat thread-aware review data as a `gh api graphql` problem — the flat comment surface does not preserve full review-thread state.

Run all `gh` commands with elevated network access. If CLI auth is required, confirm `gh auth status` first and ask the user to authenticate with `gh auth login` if it fails.

## Workflow

1. **Resolve the PR.**
   - If the user provides a repository and PR number or URL, use that directly.
   - If the request is about the current branch PR, use local git context: `gh pr view --json number,url`.

2. **Inspect review context with thread-aware reads.**
   - Use `gh api graphql` whenever the task depends on unresolved review threads, inline review locations, or resolution state — it fetches `reviewThreads`, `isResolved`, `isOutdated`, and file/line anchors.
   - Use flat comment reads only for lightweight top-level PR comment summaries.

3. **Cluster actionable review threads.**
   - Group comments by file or behavior area.
   - Separate actionable change requests from informational comments, approvals, already-resolved threads, and duplicates.

4. **Confirm scope before editing.**
   - Present numbered actionable threads with a one-line summary of the required change.
   - If the user did not ask to fix everything, ask which threads to address.
   - If the user asks to fix everything, interpret that as all unresolved actionable threads and call out anything ambiguous.

5. **Implement the selected fixes locally.**
   - Keep each code change traceable back to the thread or feedback cluster it addresses.
   - If a comment calls for explanation rather than code, draft the response rather than forcing a code change.

6. **Summarize the result.**
   - List which threads were addressed, which were intentionally left open, and what tests or checks support the change.

## Write Safety

- Do not reply on GitHub, resolve review threads, or submit a review unless the user explicitly asks for that write action.
- If review comments conflict with each other or would cause a behavioral regression, surface the tradeoff before making changes.
- If a comment is ambiguous, ask for clarification or draft a proposed response instead of guessing.
- Do not treat flat PR comments as a complete representation of review-thread state.
- If `gh` hits auth or rate-limit issues mid-run, ask the user to re-authenticate and retry.

## Fallback

If neither the connector nor `gh` can resolve the PR cleanly, tell the user whether the blocker is missing repository scope, missing PR context, or CLI authentication, then ask for the missing repo/PR identifier or a refreshed `gh` login.

## Quick Reference

```bash
# Check auth
gh auth status

# View PR
gh pr view <number> --json number,url,title,state

# List review threads (GraphQL)
gh api graphql -f query='
  query($owner:String!, $repo:String!, $pr:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:50) {
          nodes {
            id
            isResolved
            isOutdated
            comments(first:5) {
              nodes { body path line }
            }
          }
        }
      }
    }
  }
' -f owner=OWNER -f repo=REPO -F pr=NUMBER
```

## Verification

- [ ] Review state came from thread-aware GraphQL reads, not flat comments alone
- [ ] Actionable threads were clustered, numbered, and scope-confirmed before any edit
- [ ] Every change is traceable to the thread or feedback cluster it addresses
- [ ] No GitHub replies, thread resolutions, or review submissions happened without an explicit user request
- [ ] The summary lists addressed threads, intentionally open threads, and the tests or checks supporting the changes
