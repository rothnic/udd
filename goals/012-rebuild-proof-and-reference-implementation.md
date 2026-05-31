# Goal 012: Rebuild Proof and Reference Implementation

## Agent Entry

Prove the UDD promise with a reference product that can be rebuilt from product
intent, behavior specs, and tests while preserving observable behavior.

## Timebox and Team Shape

- Target duration: 2 engineering weeks.
- Suggested team: 5-7 engineers across product specs, implementation, tests,
  docs, examples, and review automation.
- Primary users: evaluators deciding whether UDD produces durable behavior
  records, not just project paperwork.

## Objective

Create a reference implementation and rebuild proof showing that UDD can capture
stakeholder intent, drive implementation, and verify behavior after a controlled
rewrite or alternate implementation path.

## Scope

- One realistic reference product with product objective, use cases, scenarios,
  and E2E tests.
- A first implementation and a controlled rebuild implementation.
- Evidence that both implementations satisfy the same behavior contracts.
- Documentation explaining what UDD preserved and what remained outside scope.

## Non-Goals

- Large production application.
- Multiple frameworks unless needed for proof.
- Performance benchmarking beyond basic regression guardrails.
- Replacing the core UDD CLI roadmap.

## Measurables

- Reference product has at least 5 use cases and 12 scenarios.
- Every scenario has an E2E test with user-observable assertions.
- Two implementations or rebuild paths pass the same scenario suite.
- Rebuild evidence is captured in a browser-readable report.
- At least 3 intentional behavior changes demonstrate the red-green UDD loop.

## Tasks

- [ ] Select a reference product domain with enough realistic behavior.
- [ ] Write product objective and capability map.
- [ ] Author at least 5 use cases with measurable outcomes.
- [ ] Author at least 12 focused feature scenarios.
- [ ] Implement E2E tests for every scenario.
- [ ] Build the first reference implementation.
- [ ] Capture baseline passing evidence.
- [ ] Create a controlled rebuild or alternate implementation path.
- [ ] Prove the rebuilt implementation passes the same tests.
- [ ] Add 3 behavior-change commits or documented steps showing red-green flow.
- [ ] Record what UDD preserved across the rebuild.
- [ ] Record what UDD did not capture and why.
- [ ] Add docs for running the proof locally.
- [ ] Add reviewer checklist for accepting the proof.
- [ ] Link proof outcomes back to the strategic roadmap.

## Definition of Done

- The repository contains a credible, runnable proof that specs and tests can
  preserve behavior across a rebuild.
- Reviewers can inspect evidence without rerunning the entire exercise first.
- The proof produces concrete follow-up gaps for the roadmap.

## Verification Commands

```bash
./bin/udd status
./bin/udd lint
npm test -- --run
```

## Reviewer Blocking Criteria

- Blocks if the proof relies on tests that do not assert user-observable
  behavior.
- Blocks if the rebuilt implementation uses different behavior contracts.
- Blocks if evidence is only chat history or local generated state.
- Blocks if the example grows into an unrelated application build.

