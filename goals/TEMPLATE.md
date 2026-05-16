# Goal: <short title>

## Agent Entry

- Goal file: `goals/<file>.md`
- Command: `/goal goals/<file>.md`
- PR target: one focused PR for this goal only

## Objective

State the outcome in one or two sentences. The objective should describe the
project state that must be true when the PR lands.

## Context

List the project facts, decisions, and source documents the agent must respect.
Keep this section short and link to deeper docs instead of copying them.

## Scope

In scope:
- Item 1
- Item 2

Out of scope:
- Item 1
- Item 2

## Required Inputs

- Source docs:
  - `path/to/doc.md`
- Commands to inspect:
  - `command`
- History/context to inspect:
  - `git log -- path`

## Tasks

1. Task one.
2. Task two.
3. Task three.

## Review Subtask

Before implementation is considered complete, perform a review pass focused on:
- Conflicting or stale docs.
- One-off status files that should be removed, archived, or converted.
- Files/directories that do not belong in source.
- Debt introduced by the proposed changes.

Record findings in the PR summary. Do not make unrelated cleanup changes unless
they are needed to satisfy this goal.

## Explicit Checks

The goal is complete only when these checks are true:
- [ ] Check 1.
- [ ] Check 2.
- [ ] Check 3.

## Measurables

- Metric 1: target value.
- Metric 2: target value.

## Verification Commands

Run the narrowest useful commands first, then broader checks if they are
relevant:

```bash
udd status
udd doctor --check-stubs --strict
npm run check
```

If a command fails, classify whether it is caused by this goal, pre-existing
repo state, or environment limits.

## PR Notes

The PR body must include:
- Objective.
- Files changed.
- Checks run and results.
- Cleanup findings.
- Deferred work with exact follow-up goal or issue path.
