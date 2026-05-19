# PR #45 Side-Branch Stack Audit

Date: 2026-05-19

## Summary

PR #45 was correctly closed as superseded. It was not a narrow Codex hook PR; it
was a broad integration of the `codex/source-of-truth-cleanup-base` stack plus
later Codex work. The Codex hook work has since landed through PR #46, so the
remaining task is to preserve and split the useful work from the side branch
without merging the entire stack.

This report classifies 100% of the current side-branch delta from the
repository default branch to `origin/codex/source-of-truth-cleanup-base`.
GitHub reports the default branch as `master` as of 2026-05-19, so the concrete
comparison is `origin/master...origin/codex/source-of-truth-cleanup-base`: 265
changed files.

## Branches Inspected

- `origin/master`
- `origin/codex/source-of-truth-cleanup-base`
- `origin/codex/agent-integration-utilities`

Note: `specs/VISION.md` currently describes `main`, but this is not the current
GitHub default branch and there is no `origin/main` remote branch. The next
source-of-truth increment must reconcile that drift instead of using commands
that target a missing branch.

## Commands Run

```bash
git fetch origin
git status --short --branch
gh issue view 47 --json number,title,state,url,body
gh pr view 45 --json number,title,state,url,headRefName,baseRefName
gh pr view 46 --json number,title,state,url,headRefName,baseRefName,mergeStateStatus
gh pr list --state merged --limit 30 --json number,title,mergedAt,headRefName
gh pr view 41 --json number,title,state,baseRefName,headRefName,mergedAt,url
gh pr view 42 --json number,title,state,baseRefName,headRefName,mergedAt,url
gh pr view 43 --json number,title,state,baseRefName,headRefName,mergedAt,url
gh pr view 44 --json number,title,state,baseRefName,headRefName,mergedAt,url
gh pr view 35 --json number,title,state,url,headRefName,baseRefName,mergeStateStatus,body
gh pr view 40 --json number,title,state,url,headRefName,baseRefName,mergeStateStatus,body
gh repo view rothnic/udd --json defaultBranchRef
git log --oneline origin/master..origin/codex/source-of-truth-cleanup-base
git diff --stat origin/master...origin/codex/source-of-truth-cleanup-base
git diff --name-status origin/master...origin/codex/source-of-truth-cleanup-base
```

## Current PR State

- PR #45: closed, head `codex/agent-integration-utilities`, base `master`.
- PR #46: merged to `master`; Codex hook installer work is no longer part of
  the unresolved stack.
- PR #35: closed during this audit as a stale broad Phase 2 stack PR targeting
  `master`; branch preserved.
- PR #40: closed during this audit as a stale side-branch cleanup PR; branch
  preserved.
- PRs #41-#44: merged, but into `codex/source-of-truth-cleanup-base`, not
  directly into `master`.
- Issue #47: open tracking issue for this audit.
- Repository default branch: `master` as reported by GitHub on 2026-05-19.

## File Groups and Classification

The full delta is grouped below. These groups cover every file reported by
`git diff --name-status origin/master...origin/codex/source-of-truth-cleanup-base`.

| Group | Count | Status | Decision |
| --- | ---: | --- | --- |
| Agent integration and runtime tooling | 14 | 7 modified, 7 added | Salvage selectively after PR #46 compatibility review |
| Architecture and process documentation | 22 | 4 modified, 18 added | Salvage in documentation-only slices |
| BDD feature specifications | 68 | 26 modified, 41 added, 1 deleted | Salvage only with matching implementation/test slice |
| CLI and library implementation | 28 | 13 modified, 15 added | Split into multiple feature PRs |
| Examples and sample products | 9 | 1 deleted, 5 added, 3 renamed | Salvage after docs/source-of-truth decision |
| Generated/local/tool state requiring caution | 3 | 3 added | Do not merge as-is |
| Goal planning artifacts | 5 | 5 added | Superseded by current goal flow; reconcile manually |
| Package and tooling config | 4 | 4 modified | Salvage only when required by a focused PR |
| Product source-of-truth and traceability model | 50 | 38 added, 12 modified | Highest-value salvage, but must be first-class PR |
| Project issue notes and stale scratch docs | 4 | 3 modified, 1 deleted | Mostly abandon or archive |
| Repo automation and developer gates | 5 | 4 added, 1 modified | Salvage only after local checks are stable |
| Test implementation and setup | 53 | 21 modified, 31 added, 1 deleted | Salvage with corresponding spec/implementation PRs |

Total: 265 files.

## Already-Landed Work

- Codex hook installation support landed in PR #46 and should not be salvaged
  again from `codex/agent-integration-utilities`.
- PRs #36-#39 are already on `master` and should be treated as baseline.
- PRs #41-#44 are merged only into the preserved side branch. They remain
  source evidence, not `master` state.
- `specs/VISION.md` branch naming is stale relative to GitHub's default branch;
  issue #49 and `goals/006-source-of-truth-foundation.md` now make that an
  explicit source-of-truth reconciliation item.

## Valuable Work to Salvage

### 1. Product Source-of-Truth and Traceability Model

Files include `product/`, `specs/roadmap.yml`, `specs/system-boundary.yml`,
`specs/traceability-contract.yml`, `specs/journey-map.schema.yml`, and expanded
`specs/use-cases/`.

Decision: salvage first. This is the highest-leverage work because it defines
the repo-native source-of-truth model that later CLI and test-governance work
depends on.

Required next slice:

- Create a focused PR that introduces the product/source-of-truth structure and
  roadmap/traceability docs without also adding large CLI behavior.
- Validate that `udd status`, `udd lint`, and existing tests still pass or
  document baseline failures clearly.

### 2. Architecture and Process Documentation

Files include `ARCHITECTURE.md`, `docs/architecture/*`, `docs/process/*`, and
`docs/testing/troubleshooting-stubs.md`.

Decision: salvage in one or more docs-only PRs after source-of-truth structure is
settled. These docs are valuable but too broad to merge with implementation.

### 3. CLI and Library Implementation

Files include `src/commands/doctor.ts`, `src/commands/health.ts`,
`src/commands/opencode.ts`, `src/commands/orchestrate.ts`,
`src/commands/phase.ts`, `src/lib/phase.ts`, `src/lib/gate.ts`,
`src/lib/test-governance.ts`, `src/lib/agent-integration.ts`, and related
changes to `status`, `sync`, `test`, and `validate`.

Decision: split into independent PRs. The stack contains several products:
doctor/health recovery, phase/traceability, test governance, OpenCode tools, and
orchestration. Merging them together would recreate the PR #45 problem.

### 4. BDD Feature Specifications and Tests

Files include 68 feature specs and 53 test files.

Decision: salvage only when paired with the corresponding implementation slice.
Spec-only or test-only imports from this branch risk creating traceability drift
or masking stubbed behavior.

### 5. Agent Integration and Runtime Tooling

Files include `.opencode/*`, `integrations/*`, and shared integration contract
docs.

Decision: salvage selectively. The shared integration concepts are valuable, but
Codex-specific goal-command ideas must not be reintroduced into the hook work.
OpenCode-specific hooks should be treated like installable integration tooling,
not root-local project state, unless the repo explicitly dogfoods them.

### 6. Examples and Sample Products

Files include `examples/`, moved feature examples, and the todo-app sample
product.

Decision: salvage after the source-of-truth layout is accepted. These are useful
for onboarding and dogfooding, but they should not lead the stack merge.

## Work to Abandon or Recreate

- `.memsearch.yaml`: local/search tooling state. Do not merge unless a separate
  repo-wide tooling decision justifies it.
- `.udd/config.yml`: generated/project-local UDD config. Recreate through
  documented `udd init` or config work instead of cherry-picking blindly.
- `bun.lock`: do not merge unless the repo intentionally adopts Bun as a package
  manager. Current `master` uses npm lockfiles.
- `DRAFT_PR_SUMMARY_EDGE_CASE_HARDENING.md`: stale scratch summary. Do not merge
  as a root-level artifact.
- Root-local `.opencode/hooks/pre-task.sh`: do not merge as a local hook unless
  the integration is explicitly installable or the repo dogfooding contract says
  it belongs in source.
- Stub-only tests from the stack: do not merge if their only purpose is to move
  metrics without implementing or honestly classifying behavior.

## Proposed PR Sequence

1. Product source-of-truth and roadmap foundation.
   - Pull from: `product/`, `specs/roadmap.yml`, `specs/system-boundary.yml`,
     `specs/traceability-contract.yml`, `specs/journey-map.*`,
     `specs/use-cases/*`.
   - Exclude generated `.udd/config.yml` unless recreated intentionally.

2. Architecture/process docs alignment.
   - Pull from: `ARCHITECTURE.md`, `docs/architecture/*`, `docs/process/*`, and
     `docs/testing/troubleshooting-stubs.md`.
   - Keep as docs-only unless a broken link or command requires a tiny support
     edit.

3. Phase and traceability CLI foundation.
   - Pull from: `src/lib/phase.ts`, `src/lib/trace.ts`, `src/lib/paths.ts`,
     `src/commands/phase.ts`, and related type/schema changes.
   - Include only the feature specs/tests needed for this behavior.

4. Doctor and health diagnostics.
   - Pull from: `src/commands/doctor.ts`, `src/commands/health.ts`, relevant
     status/sync support, and matching recovery/diagnostic specs.
   - Validate against real initialized and drifted temp projects.

5. Test-governance gates.
   - Pull from: `src/lib/test-governance.ts`, hook/gate behavior, CI workflow
     drafts, and matching specs/tests.
   - Do not merge CI gates until local commands are stable and non-flaky.

6. OpenCode/shared agent integration.
   - Pull from: `integrations/shared/*`, `integrations/opencode/*`,
     `.opencode/command/*`, and `.opencode/plugin/*`.
   - Keep Codex hook behavior aligned with PR #46 and avoid Codex goal-command
     coupling.

7. Examples and sample products.
   - Pull from: `examples/*` and moved `docs/example-features/*`.
   - Merge after the canonical product/spec layout is stable.

8. Package/tooling cleanup.
   - Decide separately on Biome config, package scripts, `lefthook.yml`, and CI.
   - Do not merge `bun.lock` unless package-manager policy changes.

## Follow-Up Tracking

The proposed PR sequence is tracked by focused follow-up issues:

- #49: Salvage PR #45 source-of-truth foundation.
- #50: Salvage PR #45 architecture and process docs.
- #51: Salvage PR #45 phase and traceability CLI foundation.
- #52: Salvage PR #45 doctor and health diagnostics.
- #55: Salvage PR #45 test-governance gates.
- #54: Salvage PR #45 OpenCode and shared agent integration.
- #53: Salvage PR #45 examples and sample products.
- #56: Decide PR #45 package and tooling cleanup.

Each issue references this report and the exact source branch:
`origin/codex/source-of-truth-cleanup-base`.

## Risks and Validation Gaps

- The side branch contains many stub and governance tests. Each test must be
  evaluated against the real behavior it claims to verify.
- Some docs describe future architecture rather than current implementation.
  Those docs need either explicit "future" framing or matching implementation.
- The side branch contains root-local agent/tool state. That state should be
  converted into installable tooling or excluded.
- Broad validation commands may expose pre-existing failures. Each follow-up PR
  must distinguish baseline debt from regressions caused by the slice.
- `origin/master` moved during this audit when PR #46 merged. Future execution
  should fetch and rebase before creating salvage branches.
- Branch naming is inconsistent across repo docs. Use the GitHub default branch
  as the command source of truth until the source-of-truth increment resolves the
  `main` vs `master` policy.

## Current Completion State

- PR #46 is merged.
- No broad side-branch merge PR is open; stale PRs #35 and #40 were closed as
  superseded with branches preserved.
- This audit report covers all 265 files by classification group.
- Follow-up issues #49-#56 cover the still-valuable groups and tooling decisions.
- The next executable increment is defined in
  `goals/006-source-of-truth-foundation.md`.
