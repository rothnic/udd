# Goal Command Contract

The `/goal <goal-file>` command is vendor-independent. It means: read one goal
file, execute only that goal, verify it with explicit evidence, and prepare one
focused PR.

## Required Goal Fields

Goal files must provide enough structure for any adapter to execute safely:

- `Objective` - the project state that must be true when the PR lands.
- `Explicit Checks` - yes/no completion checks that map to artifacts.
- `Measurables` - concrete targets or counts that prove scope.
- `Verification Commands` - commands the adapter must run or classify.
- `PR Notes` - evidence that must appear in the PR body.

`goals/TEMPLATE.md` is the canonical file template for these fields.

## Execution Steps

1. Read the requested goal file.
2. Check current repo state with `udd status`, `udd doctor`, and `git status`.
3. Build a prompt-to-artifact checklist from every explicit requirement.
4. Execute only the referenced goal.
5. Run narrow checks for changed implementation, then goal-required broad
   checks.
6. Create one focused branch and PR.
7. Include objective, files changed, checks, cleanup findings, deferred work,
   and verification output in the PR body.
8. Wait for PR comments from configured reviewers.
9. Address comments relevant to the goal and record out-of-scope findings as
   follow-up work.
10. Perform an independent review before declaring completion.

## Completion Rules

Do not mark a goal complete because checks passed by proxy. Completion requires
evidence for every explicit field, task, measurable, named command, and PR
deliverable in the goal file. If a command fails because of known baseline debt
or environment limits, record the exact failure and run the narrowest relevant
substitute checks.

## Adapter Responsibilities

Adapters may choose their own invocation syntax around the contract. For UDD,
`/goal goals/<file>.md` is the stable command form. Adapter-specific command
aliases must resolve back to this contract rather than introducing separate
goal semantics.
