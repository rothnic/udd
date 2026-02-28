# Create T8 journey manifest example (@Sisyphus-Junior subagent)

**ID**: ses_36a345ab8ffeeM17u7TNIG25sE
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 11:14:37 AM
**Stats**: 3 files changed, +332 -0

---

## USER (11:14:37 AM)

# Scenario Metadata Policy

This document defines organization rules for scenario metadata used across the repository. It ensures feature directories remain capability-oriented, metadata is consistent and mandatory, and duplication is detected and prevented.

Scope
- Applies to all BDD scenario files under specs/ and any feature-level metadata stored alongside journeys or tests.

Goals
- Make scenarios discoverable by capability and actor
- Ensure every scenario includes the same minimal set of metadata
- Prevent duplicated scenarios or conflicting metadata

Feature directory strategy
- Organize features by capability, not by technical layer. A capability groups user outcomes and the related scenarios. Example directories:
  - specs/payment/         # payment-related capabilities
  - specs/onboarding/      # onboarding and signup flows
  - specs/search/          # search capability

- Each capability directory should contain:
  - one or more `*.feature` files, each focused on a single user goal or variation
  - an optional README.md that explains the capability, actor(s), and important constraints

- Naming guidance:
  - directory names: kebab-case, short, capability-focused (e.g., `billing`, `user-settings`)
  - feature files: `<action>_<variation>.feature` or `<goal>.feature` (kebab or underscore permitted, be consistent)

Mandatory metadata tags
- Every scenario (feature file) must include a metadata block at the top using YAML-style comments. The minimal required tags are:

  - id: unique string, kebab-case, prefixed by capability (e.g., `payment-refund-duplicate-check`)
  - capability: the feature directory name (e.g., `payment`)
  - actor: who performs the action (e.g., `user`, `admin`, `system`)
  - goal: one-line description of the intended user outcome
  - priority: `low|medium|high` (helps test selection)
  - created_by: author handle or initials
  - created_at: ISO 8601 date

- Optional tags:
  - constraints: short list of non-functional or environment constraints
  - related: list of other scenario ids or journey slugs

- Example metadata block (place at top of .feature):

  """
  # ---
  # id: payment-refund-happy-path
  # capability: payment
  # actor: user
  # goal: user can issue a refund for a completed order
  # priority: high
  # created_by: nroth
  # created_at: 2026-02-25
  # constraints: [payment-gateway-online]
  # related: [payment-cancel-edge-case]
  # ---
  """

Anti-duplication checks
- Every new scenario must pass a duplication check before it is added. The check has two parts:

  1. id uniqueness
     - The `id` must be unique repository-wide. Use a simple grep across `specs/` and `product/journeys/` to ensure no match.

  2. semantic duplication
     - The new scenario must be compared against existing scenarios in the same capability for overlapping goals. A practical checklist:
       - Compare `goal` strings for similarity. If the goal is identical or near-identical, the scenario is likely a duplicate.
       - Compare actor and primary success criteria. If those match and only minor variations exist, prefer adding `Examples` or `Scenario Outline` within an existing feature file rather than creating a new file.

- If duplication is suspected, resolve by one of:
  - merge variations into a single feature with multiple scenarios or examples
  - rename `id` and clarify `goal` and `constraints` if the outcome is distinct

Enforcement and automation
- Add a lightweight check in the repository CI to enforce:
  - presence of the required metadata keys in every `specs/**/*.feature`
  - `id` uniqueness across `specs/` and `product/journeys/` metadata blocks
  - capability tag matches the parent directory name

- Failure in CI should explain the missing or conflicting keys and point to the file and suggested fix.

Example scenario with metadata
- File: specs/payment/refund.feature

  """
  # ---
  # id: payment-refund-happy-path
  # capability: payment
  # actor: user
  # goal: user can request a refund for a completed order and receive confirmation
  # priority: high
  # created_by: nroth
  # created_at: 2026-02-25
  # constraints: [payment-gateway-online]
  # related: []
  # ---
  """

  Feature: Refunds

    Scenario: User requests a refund for a completed order
      Given a completed order exists for the user
      When the user requests a refund within the allowed window
      Then the refund is enqueued and the user receives confirmation

Guidelines for authors
- Keep `goal` short and outcome-focused. It should describe success from the user's perspective.
- Use `related` to link to journeys or other scenarios, not file paths.
- Prefer extending an existing feature file with `Scenario Outline` and `Examples` when adding variations.

Appendices
- Migration: When moving legacy scenarios into the capability structure, add or update the metadata block and ensure `id` uniqueness.
- Troubleshooting: Common CI errors and recommended fixes are in docs/architecture/README.md.

Contact
- Questions about policy: open an issue in the repo and tag `specs-maintainers`.


# Use Case Relationships

This document defines three UML use case relationship types used in our architecture diagrams: include, extend, and generalization. For each type we explain when to use it, give concrete examples, list invalid uses and rejection criteria, and show a compact decision table you can follow when modeling.

Notes:
- Use plain, clear language in diagrams. A reviewer should be able to read a use case and decide which relationship applies in 30 seconds.

## Relationship definitions

- Include
  - Purpose: Reuse a common, required, and deterministic piece of behavior from one use case inside another. The included use case always runs as part of the base use case.
  - When to use: The behavior is mandatory for the base use case and is factored out to avoid duplication. The included use case has no independent alternative flow when used here.
  - Visual cue: dashed arrow with «include» from base to included use case.

- Extend
  - Purpose: Model optional, conditional, or interrupting behavior that augments a base use case under specific conditions. The extending use case does not always run and represents a variant or addition.
  - When to use: The extra behavior is optional, triggered by a condition, or represents a variation that should not clutter the main happy path. Use extend for crosscutting exceptional flows or feature toggles.
  - Visual cue: dashed arrow with «extend» from the extension to the base use case.

- Generalization
  - Purpose: Represent inheritance between use cases: a child use case is a specialized form of a parent use case and can replace it where the parent is expected.
  - When to use: Two use cases share the same intent but one refines or narrows the other. Use generalization when you want polymorphic substitution or to show a superset/subset relationship.
  - Visual cue: solid line with hollow triangle pointing to the parent (same as class generalization).

## When to choose which relationship (guidelines)

- Use include when the behavior is required and extracted for reuse. If the base cannot complete without the included behavior, include is the right choice.
- Use extend when the behavior is optional or conditional. If you can demonstrate a clear trigger condition and the base use case remains meaningful without the extension, use extend.
- Use generalization when one use case is a specialized variant of another and can be substituted where the parent is used.

## Decision table with examples

The table helps you decide. Read the left column and follow the rule that fits your case.

| Scenario / Question | Relationship | Example |
|---|---:|---|
| Behavior is mandatory and factored out to avoid duplication | Include | Payment processing factored into "Place Order" and "Top Up Account" as "Process Payment" (include). |
| Behavior is optional or conditional, runs only on a trigger | Extend | "Offer Discount" extends "Checkout" when a promotion code is present. |
| Behavior is an alternative variant with same intent | Generalization | "Admin Login" generalizes "User Login" when admin adds extra verification steps. |
| Behavior interrupts base flow on error or exception | Extend | "Handle Payment Failure" extends "Process Payment" when gateway returns error. |
| Shared intent but different audiences or constraints | Generalization | "Guest Checkout" and "Registered Checkout" generalize to "Checkout". |
| Shared utility that must always run | Include | "Validate Address" included by "Place Order" and "Update Shipping". |

## Invalid uses and rejection criteria

Reject a proposed relationship when any of these apply:

- Proposed include but the behavior is optional or conditional. Reason: include denotes required behavior. Use extend instead.
- Proposed extend but the behavior is required for the base use case to complete. Reason: extend denotes optionality. Use include instead.
- Proposed generalization but child and parent do not share intent or substitutability. Reason: generalization implies polymorphism. Use separate use cases or refactor into include/extend.
- Mixing concerns: a single relationship that attempts to express both mandatory reuse and optional variation. Reason: relationships should be single-purpose. Split the concerns.
- Using extend to model sequential steps that always occur in the same order. Reason: sequence implies inclusion or a single larger use case. Use include or merge into the base.

Rejection checklist (apply when reviewing models):

1. If relationship is include, can base complete without the included use case? If yes, reject include.
2. If relationship is extend, is there a clear trigger condition and is the base still meaningful without the extension? If no, reject extend.
3. If relationship is generalization, can the child substitute the parent in any context? If no, reject generalization.
4. Does the relationship hide side effects or non-deterministic behavior that should be shown as a separate flow? If yes, reject and refactor.

## AI top-3 examples (as extend)

The following are three recommended examples where extend is the right modeling choice. These show optional or conditional behaviors that augment a base use case.

1. "Recommend Products" extends "View Product" when the user has browsing history or enabled recommendations. The base use case still makes sense without recommendations.
2. "Two-Factor Authentication" extends "Login" when the account has 2FA enabled. Login succeeds or continues without 2FA for accounts that don't have it.
3. "Offer AI-Assisted Summary" extends "Read Document" when an AI summarization feature is enabled. The document reading flow is not dependent on the summary.

These three examples are intentionally AI-focused where the behavior is optional and toggled by configuration or user state.

## Short modeling patterns and anti-patterns

- Pattern: Implementation + test pairing is not applicable here, but keep diagrams small and focused. One diagram per concern.
- Anti-pattern: Use extend to hide a failure mode that always occurs. That hides a required error-handling path from reviewers.
- Anti-pattern: Use generalization to mean "this use case sometimes adds an extra step". If substitution is not true, do not generalize.

## Review checklist for PRs that change use case diagrams

1. Does each relationship type match the definitions above? Yes / No
2. Are examples concrete and traceable to product behaviors? Yes / No
3. Did the author include a justification sentence for each relationship change? Yes / No
4. Are tests or acceptance criteria updated where the diagram changed user-visible behavior? Yes / No

Appendix: quick reference

- include: required, reusable, deterministic
- extend: optional, conditional, variant
- generalization: specialized, substitutable


---
# Example journey manifest demonstrating linking pattern
# Based on specs/traceability-contract.yml

id: example_journey
title: Example journey manifest
actor: user.persona.example
goal: Demonstrate forward and reverse traceability links from journey to tests
summary: |
  Small example manifest showing how to link journey -> use_cases -> scenarios -> e2e_tests
  and provide reverse links and an ownership matrix.
tags:
  - example
  - traceability

use_cases:
  - id: uc.example.onboard
    name: Onboard new user
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.auth.signup
        - sc.auth.verify_email

  - id: uc.example.create_item
    name: Create first item
    actors:
      - user.persona.example
    outcomes:
      scenarios:
        - sc.items.create_first

# Forward links (authoritative pointers)
forward_links:
  journey_to_use_cases:
    - uc.example.onboard
    - uc.example.create_item

  use_case_to_scenarios:
    uc.example.onboard:
      - sc.auth.signup
      - sc.auth.verify_email
    uc.example.create_item:
      - sc.items.create_first

  scenario_to_e2e_tests:
    sc.auth.signup:
      - id: e2e.auth.signup.test
        path: tests/auth/signup.e2e.test.ts
        status: unknown
    sc.auth.verify_email:
      - id: e2e.auth.verify_email.test
        path: tests/auth/verify_email.e2e.test.ts
        status: unknown
    sc.items.create_first:
      - id: e2e.items.create_first.test
        path: tests/items/create_first.e2e.test.ts
        status: unknown

# Reverse links (computed / explicit reverse mapping to help tools)
reverse_links:
  tests_to_scenarios:
    tests/auth/signup.e2e.test.ts: sc.auth.signup
    tests/auth/verify_email.e2e.test.ts: sc.auth.verify_email
    tests/items/create_first.e2e.test.ts: sc.items.create_first

  scenarios_to_use_cases:
    sc.auth.signup: uc.example.onboard
    sc.auth.verify_email: uc.example.onboard
    sc.items.create_first: uc.example.create_item

  use_cases_to_journeys:
    uc.example.onboard: example_journey
    uc.example.create_item: example_journey

# Ownership matrix: human | agent | generated
ownership:
  journey:
    human: product_manager@example.com
    agent: sre-agent
    generated: false

  use_cases:
    uc.example.onboard:
      human: pm@example.com
      agent: spec-generator
      generated: true
    uc.example.create_item:
      human: pm@example.com
      agent: spec-generator
      generated: true

  scenarios:
    sc.auth.signup:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.auth.verify_email:
      human: qa_lead@example.com
      agent: udd-sync
      generated: true
    sc.items.create_first:
      human: product_owner@example.com
      agent: udd-sync
      generated: true

  e2e_tests:
    e2e.auth.signup.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.auth.verify_email.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true
    e2e.items.create_first.test:
      human: qa_eng@example.com
      agent: test-gen
      generated: true

references:
  traceability_contract: specs/traceability-contract.yml

evidence:
  - .sisyphus/evidence/phase2/task-8-traversal.md
  - .sisyphus/evidence/phase2/task-8-stale.md

---


