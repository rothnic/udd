# Goal 019: Production Readiness Roadmap

## Objective

Turn UDD from an upgraded but still proof-gated project into a fully usable
release candidate that does not need alpha or beta qualification.

This goal is a roadmap goal, not a claim that the product is production-ready
today. It defines the next ordered program of work, the measurable exit gates,
and the review evidence required before UDD can be described as fully usable.

## User-Facing Promise

A product author, maintainer, test governance owner, recovery user, or agent
operator can clone UDD, install it, run the core workflows, and trust the
reported status without hidden proof gaps, stale roadmap claims, or chat-only
handoff context.

## Current Baseline

Evidence captured on 2026-06-04 from branch `codex/non-alpha-roadmap`, based on
remote `master` after goals 014-018 and the Goal 013 program closeout:

- `./bin/udd status --json`: healthy project health, 0 critical issues, 0
  warnings, 48 informational optional-discovery advisories, 233 trace nodes, 253
  trace edges, 28 trace diagnostics, and 18 strict test-governance blockers.
- `./bin/udd doctor --json`: healthy, with generated state and optional journey
  drift treated as advisory.
- `./bin/udd gate test-governance --strict --json`: exits non-zero with 10
  stubbed tests and 8 unlinked tests.
- `goals/013-user-gap-upgrade-master-goal.md`: complete for goals 014-018, with
  child PRs and evidence linked.

## Scope

- Close the remaining strict test-governance blockers.
- Make installation, clean-checkout verification, and release packaging
  repeatable from source-controlled instructions.
- Replace stale compatibility and roadmap language with current source-of-truth
  routing.
- Decide which optional journey backlog items become canonical feature
  coverage, which remain discovery context, and which should be retired.
- Prove the product-author, maintainer, test-governance, recovery, and
  agent-operator workflows end to end on a clean checkout.
- Produce release-candidate evidence that can be reviewed without local chat
  history.

## Non-Goals

- Do not implement the entire production-readiness program in this roadmap PR.
- Do not hide strict governance blockers by lowering the gate.
- Do not rewrite historical goals 007-018 except to link their completed
  evidence from routing docs.
- Do not promote optional journey ideas into enforced behavior without first
  updating use cases and scenarios.

## Ordered Roadmap

### 019.1 Strict Governance Closure

**User promise:** A maintainer can run strict governance and get a pass, not a
known-debt report.

**Measurable outcomes:**

- `./bin/udd gate test-governance --strict --json` passes on the repository.
- `./bin/udd test-scan --json` reports 0 `stubbed`, 0 `unlinked`, 0 `orphaned`,
  0 `stale`, 0 `missing`, and 0 `gate_blocking`.
- Every formerly stubbed test proves user-observable behavior or is retired with
  an explicit use-case/scenario update.
- Every formerly unlinked test is linked to a scenario, converted into a
  scenario-backed E2E proof, or removed as implementation-only duplication with
  reviewer evidence.

**Spec-first tasks:**

- Update affected use cases and feature scenarios before changing test code.
- Split implementation-only library tests from user-proof tests only when the
  governance contract documents the distinction.
- Add review manifest entries only after tests prove observable behavior.

### 019.2 Install And Package Hardening

**User promise:** A new user can install UDD and run the documented commands
without local repo-specific knowledge.

**Measurable outcomes:**

- Fresh checkout install verification passes with documented commands.
- Package entrypoints expose `udd status`, `udd lint`, `udd doctor`, `udd
  repair`, `udd trace`, `udd impact`, and `udd opencode evidence`.
- Postinstall and runtime dependencies are documented and validated on a clean
  machine-like workspace.
- README quick start matches the actual supported install path.

**Spec-first tasks:**

- Add or update `project_setup` and CLI install scenarios before packaging
  changes.
- Add E2E proof for package entrypoints and fallback command usage.

### 019.3 Source-Of-Truth Documentation Cleanup

**User promise:** Docs explain the current canonical model and do not describe
completed work as pending.

**Measurable outcomes:**

- Root README, `goals/README.md`, `docs/getting-started.md`, and governance docs
  route users to current workflows.
- No stale claims remain that Goal 006 foundation work is pending.
- Optional journeys are consistently described as discovery context, not hidden
  product proof.
- Implemented change-impact and targeted regression behavior is documented
  accurately, with future scope limited to flake/pass-rate analytics and CI
  policy decisions.

**Spec-first tasks:**

- If docs introduce or change command behavior, update use cases and scenarios
  first.
- For pure routing/doc cleanup, include command evidence showing docs match
  current behavior.

### 019.4 Optional Discovery Backlog Decision

**User promise:** Advisory journey drift no longer leaves users wondering
whether the project is incomplete.

**Measurable outcomes:**

- Every current `doctor` informational missing-scenario advisory is classified
  as `promote`, `defer`, or `retire`.
- Promoted items have canonical use cases, feature files, and E2E tests.
- Deferred items have an owner, rationale, and non-blocking roadmap reference.
- Retired items are removed from optional journey references without deleting
  current behavior specs.

**Spec-first tasks:**

- For each promoted item, update use case outcomes before scenarios and tests.
- For each retired item, preserve evidence that no current use-case outcome is
  being removed.

### 019.5 CI And Release-Candidate Gates

**User promise:** Release confidence comes from enforced checks, not a manual
chat transcript.

**Measurable outcomes:**

- CI runs lint, full E2E tests, strict test governance, and at least one
  clean-checkout smoke test.
- `./bin/udd repair --dry-run --json` is either clean on a fresh checkout or
  reports only explicitly accepted generated-state writes.
- Release-candidate evidence is stored under
  `docs/project/reviews/<YYYY-MM-DD>/` and links the exact command outputs.
- PR review blocks on any regression in status, doctor, trace, impact,
  governance, install, or agent evidence.

**Spec-first tasks:**

- Add scenarios for release-candidate verification before adding CI jobs.
- Keep CI policy separate from user-facing command semantics unless a scenario
  explicitly changes those semantics.

### 019.6 Production Candidate Review

**User promise:** A reviewer can decide whether UDD is fully usable from a
single source-controlled evidence package.

**Measurable outcomes:**

- Independent user-perspective review covers product author, maintainer, test
  governance owner, recovery user, and agent operator workflows.
- Review includes fresh-checkout command evidence for `status`, `lint`,
  `doctor`, `repair --dry-run`, `trace`, `impact`, `test-scan`, strict
  governance, full tests, install smoke, and `opencode evidence`.
- The review explicitly states whether UDD can drop alpha/beta qualification; if
  not, it names the remaining blocking goal paths.

**Spec-first tasks:**

- Update any release-readiness use cases and scenarios before changing release
  messaging.
- Require independent review before any PR that changes release status language.

## Program-Level Acceptance

UDD is ready to be described as fully usable only when all of the following pass
from a fresh checkout:

```bash
./bin/udd status --json
./bin/udd lint
./bin/udd doctor --json
./bin/udd repair --dry-run --json
./bin/udd trace --json
./bin/udd impact specs/use-cases/capture_ideas.yml --json
./bin/udd test-scan --json
./bin/udd gate test-governance --strict --json
./bin/udd opencode evidence --json --goal goals/019-production-readiness-roadmap.md
npm test -- --run
```

The source-controlled evidence must show:

- 0 critical health issues and 0 warnings.
- 0 strict governance blockers.
- No stale scenario, missing proof, or unlinked proof that affects current
  product behavior.
- Optional discovery drift either resolved or explicitly classified as
  non-blocking discovery backlog.
- Release/install docs validated against actual commands.
- Independent review artifact under `docs/project/reviews/<YYYY-MM-DD>/`.

## Reviewer Blocking Criteria

Block production-readiness PRs if:

- A behavior change skips the use-case or scenario update.
- Strict governance blockers are hidden, downgraded, or excluded without a
  scenario-backed policy.
- Docs claim release readiness without fresh-checkout install and command
  evidence.
- Optional journey drift is used as proof or allowed to obscure current product
  status.
- Agent evidence depends on chat history instead of source-controlled goals and
  command output.
- Independent review findings are not addressed or explicitly rejected with
  evidence.
