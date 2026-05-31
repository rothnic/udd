# Master Goal: UDD Strategic Execution Program

## Purpose

Use this master goal to execute the current UDD strategic portfolio in order.
The program is designed to prove user-visible value, not only internal
architecture. Each goal must end with an independent user-perspective review
against the promised outcome, a commit checkpoint, and a clear decision to keep
moving or pause for correction.

## Program Outcome

By the end of this program, UDD should have a verified end-to-end story:

1. Users can express product intent and get the right specs and test obligations.
2. Users can ask what a change affects and receive traceable answers.
3. Users can tell whether tests are real proof or lifecycle debt.
4. Agents can work from shared UDD facts and hand off reviewable evidence.
5. Drifted projects can be diagnosed and safely repaired.
6. A reference rebuild proves that UDD preserves observable behavior.

The final deliverable is one large review PR containing the implemented program,
with browser-readable evidence and command output proving each promised outcome.

## Operating Rules

- Execute goals in the order listed below unless the roadmap owner explicitly
  changes the sequence.
- Update use cases, feature scenarios, and failing tests before implementing new
  behavior.
- Keep every implementation tied to user-visible outcomes.
- Do not count generated local state as proof.
- Do not reintroduce Codex goal-command coupling.
- Treat OpenCode root-local files as intentional dogfooding state or convert the
  behavior into installable tooling.
- After each goal, run an independent review from the user's perspective before
  committing and continuing.

## Per-Goal Review Gate

After each goal is implemented, request an independent review that answers:

1. Would a user recognize the promised capability from the product surface?
2. Does the implementation prove the user-facing outcome with scenarios and E2E
   tests, not only internal unit tests?
3. Can a reviewer inspect durable evidence without relying on chat history?
4. Are the docs and command surfaces clear enough for a new user or agent?
5. Did the work avoid generated local state, hidden coupling, and unrelated
   cleanup?
6. What blocking gaps must be fixed before committing this goal?

The implementing agent should use judgment on review feedback, fix valid
blockers, rerun validation, commit the completed goal, and then continue to the
next goal.

## Ordered Goals

## 1. Goal 007: Product Source-of-Truth Authoring Workbench

Path: `goals/007-product-source-of-truth-authoring-workbench.md`

User-facing promise:

> "Help me turn a product idea into the right use case, scenarios, and test
> obligations before implementation starts."

Where it gets us:

UDD becomes useful at the moment a user asks for a feature. Instead of telling
them to manually edit YAML, feature files, and tests, UDD can guide authoring and
show what proof is now required.

Success criteria:

- A user can create or update a behavior contract from an objective or use case.
- The workflow produces valid use-case and scenario artifacts.
- The workflow identifies the expected E2E test obligation without creating fake
  passing tests.
- Documentation explains the difference between canonical traceability and
  optional journey/SysML discovery notes.
- A red-green example proves a behavior change starts from specs.

Independent review focus:

- Can a product-minded user understand what to do next from the CLI/docs?
- Does the generated work preserve `Objective -> Use Case -> Scenario -> E2E
  Test`?
- Would the workflow prevent an agent from implementing unspecified behavior?

## 2. Goal 008: Traceability Graph and Impact Analysis Engine

Path: `goals/008-traceability-graph-and-impact-analysis-engine.md`

User-facing promise:

> "Tell me what this change affects, what is missing, and where the proof lives."

Where it gets us:

UDD becomes a project intelligence layer. Users and agents can ask impact
questions before changing behavior, and reviewers can see traceable evidence
instead of reverse-engineering relationships from file names.

Success criteria:

- `udd trace --json` returns deterministic nodes and edges.
- `udd impact <path>` identifies affected objectives, use cases, scenarios, and
  tests.
- Status and lint diagnostics can be explained from the graph model.
- Missing, stale, orphaned, duplicate, and future-phase artifacts have clear
  source references.
- Agent-facing JSON is stable enough to route work.

Independent review focus:

- Can a reviewer answer "what does this file affect?" from command output?
- Does the graph make user outcomes more understandable, not just more abstract?
- Are diagnostics specific enough to drive the next action?

## 3. Goal 009: Scenario Lifecycle and Test Governance

Path: `goals/009-scenario-lifecycle-and-test-governance.md`

User-facing promise:

> "Show me which tests are real proof, which are stale, and which are not ready
> to trust."

Where it gets us:

UDD can distinguish confidence from paperwork. Users get an honest view of
missing, stale, stubbed, deferred, reviewed, and passing behavior instead of one
flat pass/fail signal.

Success criteria:

- Test inventory reports linked, unlinked, orphaned, and stubbed tests.
- Non-strict gates report governance findings without blocking all work.
- Strict gates fail on configured blocking findings.
- Existing `manage_test_lifecycle` and `local-gate-validation` source-of-truth
  artifacts are reconciled before implementation so they no longer make hidden
  local review state authoritative.
- Review decisions that affect gates are source-controlled human-authored
  evidence.
- Ignored local cache state cannot change status or gate outcomes.

Independent review focus:

- Would a user trust the reported test health?
- Does reviewed/unreviewed state have durable evidence?
- Are strict and non-strict modes clear enough for teams to adopt gradually?

## 4. Goal 010: Shared Agent Execution Control Plane

Path: `goals/010-shared-agent-execution-control-plane.md`

User-facing promise:

> "Let an agent pick the next UDD task, work from shared project facts, and hand
> me reviewable evidence."

Where it gets us:

UDD becomes practical for agent-assisted development. Codex, OpenCode, and
future adapters can consume shared facts without each inventing its own
interpretation of status, next work, issues, and evidence.

Success criteria:

- Shared status, next-work, issue, and evidence payloads are stable and tested.
- OpenCode integration is either installable or explicitly justified as
  dogfooding state.
- Codex remains aligned with PR #46 and does not regain goal-command coupling.
- Agent handoff evidence is useful to a human reviewer.
- Failure modes tell agents when to pause instead of continuing blindly.

Independent review focus:

- Can a user see why the agent chose the work and why it thinks it is done?
- Are shared contracts truly adapter-neutral?
- Are root-local OpenCode files justified or installable?

## 5. Goal 011: Recovery, Doctor, and Remediation Suite

Path: `goals/011-recovery-doctor-and-remediation-suite.md`

User-facing promise:

> "This UDD project is messy. Tell me what is broken and safely fix only the
> parts that are safe to fix."

Where it gets us:

UDD becomes survivable in real repos. Users inheriting partial, stale, or drifted
projects can diagnose problems, preview safe repairs, and avoid silent mutation
of behavior specs.

Success criteria:

- Doctor output classifies initialized, partial, stale, corrupt, and drifted
  states.
- Dry-run repair explains intended changes without writing files.
- Apply-mode repair performs only explicit, safe, reversible fixes.
- User-authored behavior specs are never rewritten automatically.
- Every repair emits reviewer-visible evidence.

Independent review focus:

- Would a user trust the tool to inspect a valuable repo?
- Is it obvious what will change before apply mode runs?
- Does the tool refuse unsafe repairs instead of guessing?

## 6. Goal 012: Rebuild Proof and Reference Implementation

Path: `goals/012-rebuild-proof-and-reference-implementation.md`

User-facing promise:

> "Prove that UDD can preserve behavior when the implementation is rebuilt."

Where it gets us:

UDD proves the product thesis end to end. A reviewer can inspect a realistic
reference product, see behavior contracts, run the tests, and compare a rebuild
against the same user-facing expectations.

Success criteria:

- The reference product has at least 5 use cases and 12 scenarios.
- Every scenario has an E2E test with user-observable assertions.
- Two implementations or rebuild paths pass the same behavior suite.
- At least 3 behavior changes demonstrate the red-green UDD loop.
- The final evidence report states what UDD preserved and what it did not.

Independent review focus:

- Does the proof feel like a real user-requested product, not a toy fixture?
- Can a reviewer verify that the same behavior contracts survived the rebuild?
- Does the evidence expose remaining product gaps honestly?

## Final Program PR Gate

After Goal 012 is complete, create one program-level PR that includes all
implemented changes and evidence. The PR must be reviewable from GitHub without
requiring chat history.

The final PR must include:

- A summary of every goal and its user-facing promise.
- Links to durable evidence for each independent review.
- Validation output for each goal and for the full final state.
- A traceability summary from objective to use case to scenario to E2E test.
- A user-facing demo or report proving the rebuild/reference implementation.
- A list of any deferred work, with explicit reasons and issue/goal links.

Blocking final PR criteria:

- Any goal lacks independent user-perspective review.
- Any promised user-facing capability lacks E2E proof.
- Generated local state is used as evidence.
- Codex/OpenCode adapter behavior is coupled in shared contracts.
- The final rebuild proof cannot be inspected or reproduced from repository
  artifacts.
