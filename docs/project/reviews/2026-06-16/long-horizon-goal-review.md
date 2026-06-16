# Goal 019 Production Readiness Evidence

Date: 2026-06-16

Branch: `codex/goal-019-production-readiness`

Goal: `goals/019-production-readiness-roadmap.md`

Purpose: record the current release-candidate evidence for Goal 019 after the
install/package hardening, source-of-truth cleanup, optional discovery backlog
classification, CI gate definition, and final local verification pass.

## Current Result

UDD is release-candidate ready against the Goal 019 acceptance gates. Local
verification passed, and hosted CI passed on PR #90:

<https://github.com/rothnic/udd/actions/runs/27656257241>

The project can drop alpha/beta qualification for the behavior covered by this
evidence package. No remaining blocking goal path is identified for Goal 019.

## Command Evidence

Commands were run from the repository root on 2026-06-16.

```bash
npm run build
```

Result: passed.

```bash
npm install "git+file:///Users/nroth/workspace/udd"
./node_modules/.bin/udd --version
./node_modules/.bin/udd --help
```

Result: passed from a clean temp consumer project. The installed CLI reported
`2.0.0` and rendered command help. This validates the GitHub-style install
lifecycle after `prepare` builds `dist/`.

```bash
npm test -- tests/e2e/udd/cli/setup.e2e.test.ts --run
```

Result: passed, 1 test file, 9 tests. This packs UDD, installs the tarball in a
clean temp consumer project, verifies the installed `udd` binary reports the
package version, checks `status`, `lint`, `doctor`, `repair`, `trace`, `impact`,
and `opencode evidence` entrypoints, runs `udd init --yes`, runs
`udd sync --auto`, and verifies generated tests fail on the explicit
user-observable TODO proof message instead of passing falsely.

```bash
npm test -- --run
```

Result: passed, 60 test files and 471 tests.

```bash
./bin/udd status --json
```

Result summary:

- Unsatisfied use-case outcomes: 0
- Health: 0 critical, 0 warning, 48 info
- Test governance: 53 total, 53 linked, 0 unlinked, 0 orphaned, 0 stubbed,
  0 stale, 0 missing, 0 gate-blocking

```bash
./bin/udd lint
```

Result:

```text
All specs are valid
Trace graph: 238 node(s), 259 edge(s), 28 diagnostic(s)
```

```bash
./bin/udd doctor --json
```

Result: healthy, 0 critical, 0 warning, 48 info.

```bash
./bin/udd repair --dry-run --json
```

Result: dry-run mode, 0 applied, 1 proposed, 0 refused. The proposed action is
the accepted generated-state refresh for `specs/.udd/manifest.yml` from optional
journey hash drift. It does not change current canonical behavior proof.

```bash
./bin/udd trace --json
```

Result: 238 nodes, 259 edges, 28 diagnostics.

```bash
./bin/udd impact specs/use-cases/capture_ideas.yml --json
```

Result: resolved `capture_ideas`, found the linked scenario
`udd/cli/inbox/add_item_via_cli`, found the linked E2E test
`tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts`, and recommended:

```bash
npm test -- --run tests/e2e/udd/cli/inbox/add_item_via_cli.e2e.test.ts
```

```bash
./bin/udd test-scan --json
```

Result: 53 total, 53 linked, 0 unlinked, 0 orphaned, 0 stubbed, 8 reviewed,
0 stale, 0 missing, 0 gate-blocking.

```bash
./bin/udd gate test-governance --strict --json
```

Result: passed with the same zero-blocker governance summary.

```bash
./bin/udd opencode evidence --json --goal goals/019-production-readiness-roadmap.md
```

Result: command passed. The evidence package reports a healthy project, no
governance blockers, no missing proof, and no next action from governance. The
goal status field is `in_progress` because the command currently emits
`in_progress` for healthy goals and `blocked` only for critical diagnostics; the
blocker-relevant fields are green.

## Delivered Changes

- Package hardening now builds to `dist/`, exposes the installed `udd` binary
  from `dist/bin/udd.js`, runs a plain JavaScript postinstall patch, builds
  during `prepare` for GitHub installs, reads the CLI version from
  `package.json`, and includes a package-lock refresh.
- Clean consumer install proof was added to
  `specs/features/udd/cli/setup.feature` and
  `tests/e2e/udd/cli/setup.e2e.test.ts`.
- `udd init --yes` now creates canonical `specs/VISION.md`,
  `specs/use-cases/new_user_onboarding.yml`, and
  `specs/features/onboarding/first_action.feature` routing, and repairs the
  default npm test script to `vitest run` without overwriting a real test
  script.
- Generated sync tests now use exact step strings and throw an explicit TODO for
  missing user-observable proof.
- README, getting-started, governance troubleshooting, package metadata, and
  goal routing now describe use cases and feature scenarios as canonical source
  of truth, with journeys as optional discovery context. Because the npm
  registry package is not published yet, user docs now use the GitHub
  release-candidate install path instead of `npm install udd`.
- Optional discovery backlog is classified in
  `docs/project/optional-discovery-backlog.yml`: 20 stale journey files and
  28 missing-scenario advisories are deferred with owner, rationale, and
  roadmap references.
- Release-candidate CI policy is defined in
  `.github/workflows/production-readiness.yml` and covered by
  `specs/features/udd/release-candidate/ci_release_gates.feature` plus
  `tests/e2e/udd/release-candidate/ci_release_gates.e2e.test.ts`.

## Independent Review

An independent review agent was asked to review the Goal 019 scope before PR
handoff. Findings and responses:

- Blocking: dated source-controlled evidence was missing. Response: this file
  replaces the stale preliminary review with final dated evidence.
- Blocking: clean packaged install was not proven end to end. Response: the
  focused package smoke now packs, installs, verifies entrypoints, runs core
  workflows, and checks generated tests fail on explicit TODO proof.
- High: source-of-truth cleanup was inconsistent. Response: package metadata,
  init output, docs, README, and status metadata were updated; current
  `udd status --json` reports 0 unsatisfied outcomes.
- Medium: CI gate was declared but not hosted-run proven. Response: workflow
  source is scenario-tested locally; hosted CI remains the external proof needed
  after push/PR before public release messaging changes.
- Follow-up blocker: focused package/CI tests overwrote `.udd/results.json`, so
  status temporarily reported unsatisfied outcomes. Response: reran the full
  suite after review fixes; current `udd status --json` again reports
  0 unsatisfied outcomes.
- Follow-up blocker: docs pointed to unpublished `npm install udd`. Response:
  README and getting-started now use `npm install github:rothnic/udd`, and
  `prepare` builds `dist/` for GitHub installs.
- Follow-up blocker: CI did not preserve `udd status --json` evidence. Response:
  `.github/workflows/production-readiness.yml` now captures
  `docs/project/reviews/ci/latest/status.json` after the full test suite.

## Reviewer Blocking Criteria Check

- Use-case and scenario updates were made before behavior changes for package
  install and release-candidate CI.
- Strict governance blockers are not hidden; strict gate and test-scan both
  report zero blockers.
- Docs now match the verified install/package behavior.
- Optional journey drift is classified as non-blocking discovery backlog.
- Agent evidence is backed by source-controlled goals and command output, not
  chat history.
- Independent review findings were addressed or explicitly bounded by the hosted
  CI limitation.
