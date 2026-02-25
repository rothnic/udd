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
