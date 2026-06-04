# Goal: Source-of-Truth Foundation Salvage

## Agent Entry

- Goal file: `goals/006-source-of-truth-foundation.md`
- Tracking issue: `#49`
- Source branch: `origin/codex/source-of-truth-cleanup-base`
- Audit report: `docs/project/reviews/2026-05-19-pr45-stack-audit/report.md`
- PR target: repository default branch (`master` on GitHub as of 2026-05-19)

## Objective

Land the first focused salvage increment from the PR #45 side-branch stack:
the product/source-of-truth foundation. The result should give UDD a coherent
repo-native product intent layer and roadmap/traceability foundation without
also importing broad CLI, test-governance, OpenCode, or generated local-state
changes.

## Context

The PR #45 audit classified product/source-of-truth and traceability model work
as the highest-value first salvage slice. This goal executes that first slice
only.

Important branch fact:

- GitHub currently reports the default branch as `master`.
- `specs/VISION.md` still describes `main`; reconcile that drift in this goal
  by either updating the document to the actual branch name or explicitly
  documenting a planned branch rename. Do not write commands that require
  `origin/main` unless the remote branch exists.

## Scope

In scope:

- Product intent files from the side branch:
  - `product/README.md`
  - `product/actors.md`
  - `product/concept.md`
  - `product/constraints.md`
  - `product/journeys/*.md`
- Traceability and roadmap foundation files:
  - `specs/roadmap.yml`
  - `specs/system-boundary.yml`
  - `specs/traceability-contract.yml`
  - `specs/journey-map.schema.yml`
  - `specs/journey-map.example.yml`
  - `specs/requirements/persist_inbox_item.yml`
  - `specs/trace-slices/capture-ideas-inbox.md`
  - relevant `specs/use-cases/*.yml` updates
- Minimal docs or README edits needed to explain the new source-of-truth layer.
- Reconciliation of the `main` vs `master` branch-name drift in `specs/VISION.md`
  or a clearly documented follow-up decision.

Out of scope:

- `src/commands/*` or `src/lib/*` implementation changes beyond a tiny
  compatibility edit required by existing tests.
- `docs/architecture/*`, `docs/process/*`, and examples. Those are tracked by
  #50 and #53.
- `.udd/config.yml`, `.memsearch.yaml`, `bun.lock`, root-local agent state, or
  generated/local tooling artifacts.
- OpenCode/shared integration work from #54.
- Test-governance, doctor, health, phase CLI, or CI gate work from #51, #52,
  #55, and #56.

## Tasks

1. Fetch and confirm the default branch:
   `gh repo view rothnic/udd --json defaultBranchRef`.
2. Create a fresh branch from the current default branch.
3. Cherry-pick or copy only the in-scope source-of-truth files from
   `origin/codex/source-of-truth-cleanup-base`.
4. Review every imported file for stale references, generated state, and branch
   naming drift.
5. Run scoped validation and fix only issues caused by this slice.
6. Open one focused PR that references #49 and this goal file.

## Completion Evidence

Recorded on 2026-06-04 in
`docs/project/reviews/2026-06-04/goal-006-completion-evidence.md`.

Goal 006 is complete because PR #57 merged the focused source-of-truth
foundation slice for issue #49, imported the scoped product and traceability
files, excluded generated/local and broad implementation paths, reconciled the
default branch as `master`, and recorded validation plus review follow-up in the
PR body. Remaining salvage issues are tracked separately and are not required to
close this foundation goal.

## Explicit Checks

The goal is complete only when these are true:

- [x] The PR diff excludes generated/local artifacts such as `.udd/config.yml`,
      `.memsearch.yaml`, and `bun.lock`.
- [x] The PR diff excludes broad CLI/test-governance/OpenCode implementation
      changes.
- [x] Product intent and roadmap/traceability files are internally consistent.
- [x] `specs/VISION.md` no longer conflicts silently with the repository's
      actual default branch.
- [x] Each imported journey/use-case file is either referenced by the roadmap or
      explicitly marked as backlog/future.
- [x] Validation output is recorded in the PR body.
- [x] Any deferred source-of-truth decisions are linked to an exact issue or goal.

## Verification Commands

Run:

```bash
git fetch origin
gh repo view rothnic/udd --json defaultBranchRef
DEFAULT_BRANCH=$(gh repo view rothnic/udd --json defaultBranchRef --jq .defaultBranchRef.name)
git diff --name-status origin/$DEFAULT_BRANCH...HEAD
npm run udd -- status
npm run udd -- lint
npx tsc --noEmit
```

If `npm run udd -- status` or `npm run udd -- lint` fails because the imported
source-of-truth files expose pre-existing baseline drift, record the exact
failure and add a follow-up issue instead of suppressing it.

## PR Notes

The PR body must include:

- Objective and issue link: #49.
- Files imported from `origin/codex/source-of-truth-cleanup-base`.
- Files intentionally excluded and why.
- Branch-name reconciliation decision.
- Validation commands and results.
- Next recommended issue after merge.
