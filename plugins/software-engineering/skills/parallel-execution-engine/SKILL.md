---
name: parallel-execution-engine
description: Parallel execution engine for high-throughput task completion
argument-hint: "<task description with parallel work items>"
---

<Purpose>
Parallel Execution Engine is an execution protocol for independent work. It emphasizes intent grounding, parallel context gathering, dependency-aware task graphs for non-trivial work, and concise evidence-backed execution summaries.
</Purpose>

<Use_When>
- Multiple independent tasks can run simultaneously
- You need to delegate work to multiple agents at once
- Task benefits from concurrent execution but the user will manage completion themselves
</Use_When>

<Do_Not_Use_When>
- Task requires guaranteed completion with verification -- use a persistent loop instead
- Task requires a full autonomous pipeline -- use autonomous delivery instead
- There is only one sequential task with no parallelism opportunity -- delegate directly to an executor agent
</Do_Not_Use_When>

<Why_This_Exists>
Sequential task execution wastes time when tasks are independent. This engine enables firing multiple agents simultaneously and routing each to the right model tier, reducing total execution time while controlling token costs.
</Why_This_Exists>

<Execution_Policy>
- Fire all independent agent calls simultaneously -- never serialize independent work
- Always pass the `model` or `tier` parameter explicitly when delegating
- Use background execution for operations over ~30 seconds (installs, builds, tests)
- Run quick commands (git status, file reads, simple checks) in the foreground
- Resolve intent and uncertainty before implementation; explore first, ask only when still blocked
- For non-trivial tasks, produce a dependency-aware plan with parallel waves before execution
- Keep delegated-task reports concise: short summary, files touched, verification status, blockers
- Manual QA is required for implemented behavior, not just diagnostics
- Dry-run and default-safe behaviors apply.
</Execution_Policy>

<Steps>
1. **Ground intent first**: Confirm whether the request is implementation, investigation, evaluation, or research; do not code before that is clear
2. **Gather context in parallel**:
   - direct tools for quick reads/searches
   - exploration/docs agents for broad context
3. **Classify tasks by independence**: Identify which tasks can run in parallel vs which have dependencies
4. **Create a task graph for non-trivial work**:
   - Parallel Execution Waves
   - Dependency Matrix
   - acceptance criteria and verification steps per task
5. **Route to correct tiers**:
   - Simple lookups/definitions: LOW tier
   - Standard implementation: MEDIUM tier
   - Complex analysis/refactoring: HIGH tier
6. **Fire independent tasks simultaneously**: Launch all parallel-safe tasks at once
7. **Run dependent tasks sequentially**: Wait for prerequisites before launching dependent work
8. **Background long operations**: Builds, installs, and test suites run in background
9. **Verify when all tasks complete** (lightweight):
   - Build/typecheck passes
   - Affected tests pass
   - Manual QA completed for implemented behavior
   - No new errors introduced
</Steps>

<Tool_Usage>
- Use appropriate models/agents based on task complexity
- Use background process execution for package installs, builds, and test suites
- Use foreground execution for quick status checks and file operations
</Tool_Usage>

<Examples>
<Good>
Independent tasks fired simultaneously using parallel tool calls.
Why good: Independent tasks at appropriate tiers, all fired at once.
</Good>

<Good>
Correct use of background execution: Long build runs in background while short task runs in foreground.
</Good>

<Bad>
Sequential execution of independent work.
Why bad: These tasks are independent. Running them sequentially wastes time.
</Bad>

<Bad>
Wrong tier selection (e.g. using the most capable, expensive model for a trivial fix).
</Bad>
</Examples>

<Escalation_And_Stop_Conditions>
- Apply lightweight verification only -- build passes, tests pass, no new errors
- If a task fails repeatedly across retries, report the issue rather than retrying indefinitely
- Escalate to the user when tasks have unclear dependencies or conflicting requirements
</Escalation_And_Stop_Conditions>

<Final_Checklist>
- [ ] All parallel tasks completed
- [ ] Build/typecheck passes
- [ ] Affected tests pass
- [ ] No new errors introduced
</Final_Checklist>
