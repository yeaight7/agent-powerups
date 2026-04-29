# validation-required

Status: review-before-use hook recipe.

Purpose: prevent unverified completion claims.

Suggested trigger:

- before final response
- before marking a task complete
- before creating release notes or PR text

Suggested check:

1. Did the agent state what validation command proves the claim?
2. Did the agent run that command in the current task?
3. Did the agent report the actual result, including warnings or failures?

Suggested action:

- If validation is missing, stop and run the narrowest meaningful validation.
- If validation cannot run, state the blocker instead of implying success.

Safety:

- This is documentation, not an installed hook.
- It must not mutate git, config, shell profiles, dependencies, or remote services.
