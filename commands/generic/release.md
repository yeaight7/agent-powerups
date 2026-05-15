# release

Purpose: Run a release-readiness checklist and produce a go/no-go before tagging or publishing.

1. Read the intended version and confirm the bump type (patch/minor/major) matches the change set.
2. Run: `git log <last-tag>..HEAD --oneline --no-merges` to see the compare range.
3. Verify the changelog or release notes cover all user-visible commits in that range.
4. Run the full validation suite. All commands must exit 0.
5. Scan for breaking changes: commits with `!` suffix or `BREAKING CHANGE:` footer.
6. Write the publish plan: exact commands in sequence.
7. Write the rollback plan: one reversal step per publish action.
8. Present the go/no-go readout. Wait for explicit approval before executing any step.

Do not tag, publish, push, or create releases until explicitly approved.
