# implement

Use to turn a spec or user request into working, tested code.

Steps:

1. Read the spec or request in full. If anything is ambiguous, ask before writing a single line.
2. Identify the files to create or modify. Read them first.
3. Write a failing test that captures the expected behavior. Confirm it fails.
4. Implement the minimum code that makes the test pass. No extras.
5. Run the full test suite: `npm test`. All tests must pass.
6. If assets were added or changed, run `apx validate catalog`.
7. Update any affected documentation or usage examples.

Do not add features beyond the spec. Do not commit unless asked.
