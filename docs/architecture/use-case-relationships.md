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
