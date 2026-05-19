# Goal: Audit and Salvage the PR #45 Side-Branch Stack

## Agent Entry

- Goal file: `goals/005-pr45-side-branch-stack-audit.md`
- Tracking issue: `#47`
- Source branches:
  - `origin/codex/source-of-truth-cleanup-base`
  - `origin/codex/agent-integration-utilities`
- PR target: one or more focused PRs to the repository default branch
  (`master` on GitHub as of 2026-05-19); do not reopen a broad stack PR.

## Objective

Determine exactly which work from the superseded PR #45 side-branch stack should
land on the repository default branch, which work is already represented by
merged PRs, and which work should be abandoned. By the end of the long session,
every valuable change from the preserved stack must either be merged, waiting in
a focused PR for final approval, or explicitly deferred with a follow-up
issue/goal.

## Context

PR #45 was closed because it mixed a narrow Codex hook installer change with a
much larger side-branch stack. The hook work was extracted into PR #46. The
remaining stack still needs deliberate review so useful progress is not lost.

Known facts to preserve:

- PRs #36-#39 are already merged to the repository default branch.
- PRs #41-#44 were merged into `codex/source-of-truth-cleanup-base`, not
  directly into the default branch.
- GitHub reports the repository default branch as `master` as of 2026-05-19.
  `specs/VISION.md` still describes `main`; treat that as source-of-truth drift
  to reconcile in the source-of-truth follow-up, not as proof that `origin/main`
  exists.
- `origin/codex/source-of-truth-cleanup-base` differs from the default branch by
  roughly 265 files and includes source-of-truth, phase, docs, specs, tests, and
  agent integration work.
- `origin/codex/agent-integration-utilities` includes that broader stack plus
  the later Codex hook work.
- Do not promote the full stack into the default branch without splitting and
  reviewing it.

## Scope

In scope:

- Build a source-of-truth inventory of the stack delta against the default
  branch.
- Classify each change group as already landed, still valuable, obsolete, or
  unsafe/stale.
- Split still-valuable work into PR-sized goal files or implementation branches.
- Merge or prepare focused PRs for the highest-value slices that are safe to
  land during the session.
- Preserve exact evidence for abandoned or deferred work.

Out of scope:

- Reopening PR #45 as a broad integration PR.
- Force-pushing or deleting preserved branches before the audit is complete.
- Reintroducing Codex goal workflows as part of Codex hook/tooling work.
- Merging generated state, local agent state, or one-off scratch files without a
  clear source-of-truth reason.

## Required Inputs

- GitHub:
  - `gh issue view 47`
  - `gh pr view 45`
  - `gh pr view 46`
  - `gh pr list --state merged --limit 30`
  - `gh repo view rothnic/udd --json defaultBranchRef`
- Git comparisons:
  - `DEFAULT_BRANCH=$(gh repo view rothnic/udd --json defaultBranchRef --jq .defaultBranchRef.name)`
  - `git log --oneline origin/$DEFAULT_BRANCH..origin/codex/source-of-truth-cleanup-base`
  - `git diff --name-status origin/$DEFAULT_BRANCH...origin/codex/source-of-truth-cleanup-base`
  - `git diff --stat origin/$DEFAULT_BRANCH...origin/codex/source-of-truth-cleanup-base`
  - `git range-diff origin/$DEFAULT_BRANCH...origin/codex/source-of-truth-cleanup-base`
- Existing source-of-truth docs:
  - `AGENTS.md`
  - `README.md`
  - `specs/VISION.md`
  - `specs/.udd/manifest.yml`
  - `docs/project/`

## Workstreams

1. Baseline the current default-branch state.
2. Inventory the full side-branch delta and group files by subsystem.
3. Reconcile already-merged work from PRs #36-#39 against the side-branch stack.
4. Classify remaining work into these buckets:
   - Source-of-truth and roadmap cleanup.
   - Traceability and phase model.
   - UDD CLI behavior.
   - Test governance and validation gates.
   - Agent integration and runtime-specific tooling.
   - Docs/examples/product/spec organization.
   - Generated, local, stale, or unsafe artifacts.
5. For each valuable bucket, create a PR-sized plan with explicit acceptance
   checks before implementing or cherry-picking.
6. Implement only the safest, highest-leverage slices during the session.
7. Leave remaining valid work as follow-up goal files or GitHub issues with
   branch/file evidence.

## Required Audit Artifact

Create or update a durable audit report before opening implementation PRs:

- Preferred path: `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`
- The report must include:
  - Branches inspected.
  - Commands run.
  - File groups and classification.
  - Already-landed work.
  - Valuable work to salvage.
  - Work to abandon and why.
  - Proposed PR sequence.
  - Risks and validation gaps.

## Explicit Checks

The goal is complete only when all of these are true:

- [ ] PR #46 is either merged or explicitly excluded from this stack audit.
- [ ] The audit report exists at
      `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`.
- [ ] Every file changed between the repository default branch and
      `origin/codex/source-of-truth-cleanup-base` is covered by a classification
      group in the audit report.
- [ ] Every still-valuable group is either merged, in an open focused PR, or
      represented by a follow-up goal/issue with exact branch and file evidence.
- [ ] No broad side-branch merge PR is open.
- [ ] No generated/local agent state is proposed for merge unless justified in
      the audit report.
- [ ] Each implementation PR produced from this goal has its own scoped tests,
      review notes, and clear rollback/defer decision.

## Measurables

- Stack inventory coverage: 100% of changed files grouped.
- Merge readiness: each open PR from this goal must be `CLEAN` or have a
  documented blocker.
- Scope control: no follow-up PR should exceed one coherent subsystem unless the
  audit report explains why the files cannot be split safely.
- Preservation: no branch deletion or destructive history rewrite until all
  valuable work is merged or tracked elsewhere.

## Verification Commands

Run these at the start:

```bash
git fetch origin
git status --short --branch
gh issue view 47
gh repo view rothnic/udd --json defaultBranchRef
DEFAULT_BRANCH=$(gh repo view rothnic/udd --json defaultBranchRef --jq .defaultBranchRef.name)
git diff --stat origin/$DEFAULT_BRANCH...origin/codex/source-of-truth-cleanup-base
git diff --name-status origin/$DEFAULT_BRANCH...origin/codex/source-of-truth-cleanup-base
```

Run these before each implementation PR:

```bash
npm test
npx tsc --noEmit
npx biome check .
```

If a verification command is too broad, unavailable, or fails because of known
baseline debt, record the exact failure and run the narrowest command that covers
the changed files.

## Completion Handoff

The final response or PR summary must include:

- The audit report path.
- PRs opened or merged.
- Follow-up issues/goals created.
- Work intentionally abandoned.
- Validation commands and results.
- The next exact goal file or command to run.
