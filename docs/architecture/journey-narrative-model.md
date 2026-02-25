# Journey Narrative Model

## Overview

Journey narratives describe the user's experience as a timeline of observable events and outcomes. They belong to the experience layer and must not include implementation or capability internals (APIs, method names, infra, feature flags, storage details, service calls, etc.). Journeys are human-facing artifacts used by product, design, QA, and writers to define what users feel and do, not how the system achieves it.

This document defines the canonical schema for journey narratives, gives field definitions, provides a full example with an emotional trajectory, and describes capability-leak detection rules authors and lint tooling should apply.

## Schema

A Journey Narrative is a single markdown document with these required top-level fields and sections:

Required fields
- id: string (unique slug, e.g., `onboarding-quick-start`)
- title: string (human-friendly title)
- actor: string (who the journey is about)
- goal: string (what success looks like for the actor)
- stages: ordered array of Stage objects
- touchpoints: array of Touchpoint objects (derived from stages, optional if described inline)
- channels: array of channels involved (e.g., web, mobile, email)
- emotions: array describing predominant emotions per stage (see Stage.emotions)
- pain_points: array of known pain points (mapped to stages)
- success_metrics: array of measurable outcome metrics
- references: array of related use_case ids or docs (implementation artifacts only via reference)

Stage object
- name: string (stage label, ordered)
- description: string (what the user is doing/experiencing)
- touchpoints: array of touchpoint ids or descriptions
- channels: subset of journey channels active in this stage
- emotions: ordered list showing emotional trajectory within the stage (e.g., ["curious", "cautious", "delighted"]). Each emotion may include intensity (low|medium|high) optionally.
- success_criteria: optional short statement of what success looks like for the stage

Touchpoint object
- id: string (local id)
- label: string (short label like "signup form" or "welcome email")
- description: string (what the user sees or does)
- observable_outcome: string (user-observable signal, e.g., "confirmation email received")

Success Metric object
- id: string (metric id or analytics id)
- name: string (human name)
- description: string (what it measures, must be outcome-focused)
- target: optional numeric or relative target (e.g., ">50% within 5 minutes")

## Field Definitions and Rules

- stages: Ordered timeline. Each stage must describe user-observable behavior and outcomes. Keep stage names short and outcome oriented (Discover, Evaluate, Decide, Use, Recover).
- touchpoints: Concrete moments where the user interacts with the product or receives a communication. Touchpoints should be phrased in user language ("user sees pricing page") not implementer language ("server renders /pricing route").
- channels: Channels are modes of delivery. Use canonical names: web, mobile_app, email, sms, phone_support, in_product_tooltip.
- emotions: Capture how the user feels. Emotions are adjectives or short phrases. You may provide intensity and a one-sentence rationale for each.
- pain_points: Specific user problems encountered, mapped to stages when possible. Avoid including root-cause system internals; state observable symptom and user impact.
- success_metrics: Outcome focused, tied to stages where relevant. Metrics must reference analytics ids or business metrics, not implementation counters.
- references: If an implementation detail is required, reference a Use Case or Component doc by id. Do not embed code or API details in the journey body.

Policy: No capability internals

Journey narratives MUST NOT contain:
- API paths, HTTP methods, SDK calls, code snippets, or service/method names (e.g., `POST /api/users`, `userService.createUser()`).
- Infra, storage, logs, or vendor names that reveal implementation (e.g., "store in S3", "CloudWatch").
- Feature flag names, rollout stages, or experiment ids (e.g., "enable myfeature_v2").

If a narrative needs implementation context, add a reference to a Use Case, Component, or Architecture doc. Keep the journey focused on what the user does and feels.

## Full Example: onboarding-quick-start

id: onboarding-quick-start
title: New user quick start
actor: New user
goal: Sign up and create their first task within 5 minutes
channels: [web, email]

stages:
- name: Discover
  description: User finds the product via search or referral and views the landing page.
  touchpoints: [landing_page]
  channels: [web]
  emotions: [{emotion: "curious", intensity: "medium"}]
  success_criteria: "User is interested enough to click Sign up"

- name: Sign up
  description: User completes an email sign up form and confirms account via email.
  touchpoints: [signup_form, confirmation_email]
  channels: [web, email]
  emotions: [{emotion: "cautious", intensity: "medium"}, {emotion: "relieved", intensity: "low"}]
  success_criteria: "Account created and confirmed"

- name: First task
  description: User creates their first task via the in-product flow and sees it listed in their dashboard.
  touchpoints: [create_task_modal, dashboard_list]
  channels: [web]
  emotions: [{emotion: "delighted", intensity: "high"}]
  success_criteria: "First task visible on dashboard"

touchpoints:
- id: landing_page
  label: Landing page
  description: "User views the product landing page with value proposition and call-to-action"
  observable_outcome: "Clicks Sign up"

- id: signup_form
  label: Signup form
  description: "User fills email and password and submits"
  observable_outcome: "Form submitted"

- id: confirmation_email
  label: Confirmation email
  description: "User receives an email with confirm link"
  observable_outcome: "Email delivered and link clicked"

- id: create_task_modal
  label: Create task modal
  description: "User enters task details and saves"
  observable_outcome: "Task appears on dashboard"

pain_points:
- stage: Sign up
  problem: "Email delivery delays cause confusion"
  impact: "Users abandon before confirming"

success_metrics:
- id: analytics.signup_confirm_rate
  name: Signup confirm rate
  description: Percentage of signups that confirm within 1 hour
  target: ">= 70%"

- id: analytics.first_task_time
  name: Time to first task
  description: Median time from account creation to first task
  target: "<= 5 minutes"

Emotional trajectory

Across stages the user's emotional curve is: curious (landing) -> cautious (signup) -> relieved (confirmation) -> delighted (first task). This trajectory helps prioritize pain_points and success_metrics: high-intensity delight at First task indicates the biggest opportunity to convert new users into active users.

## Capability-leak detection rules

Linting and human review should apply these detection rules. If any rule triggers, the narrative should be returned to the author for revision.

1) Code-like tokens
- Regex: any token matching /\b([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*\(|POST\s+\/)\b/ — catches method calls and obvious HTTP mentions.

2) Infra/vendor identifiers
- Regex: /\b(S3|CloudWatch|BigQuery|RDS|DynamoDB|SQS|Kafka|GCS)\b/i

3) Feature-flag or experiment ids
- Regex: /\b(myfeature_[0-9a-zA-Z_-]+|experiment_[0-9]+|flag_[0-9a-zA-Z_-]+)\b/i

4) Storage/persistence verbs with resource hints
- Regex: /\b(store to|persist to|write to|save to)\b/i

5) Hard rule: If any field contains a match from rules 1-4, the narrative fails validation.

Remediation guidance
- Replace matched text with user-observable phrasing. Example: change "POST /api/users" to "User submits the sign up form".
- Move implementation details to a Use Case or Component doc and add an entry to references: [use_case:create-account]

## References
- docs/architecture/udd-concept-model.md
- .sisyphus/evidence/phase2/task-6-journey-narrative.md
- .sisyphus/evidence/phase2/task-6-leak.md
