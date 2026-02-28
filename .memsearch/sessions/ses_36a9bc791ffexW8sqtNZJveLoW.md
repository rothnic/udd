# Implement Task 6 journey narrative model (@Sisyphus-Junior subagent)

**ID**: ses_36a9bc791ffexW8sqtNZJveLoW
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/25/2026, 9:21:39 AM
**Stats**: 1 files changed, +134 -0

---

## USER (9:21:39 AM)

# Journey Narrative Model (Experience Layer)

Purpose: define an experience-first narrative schema for journeys that documents the user's timeline and feelings without leaking capability internals or implementation details.

Scope and constraints
- This model describes the experience timeline: stages a user passes through, the observable touchpoints, channels used, emotional trajectory, pain points, and success metrics.
- It must not contain implementation details, component responsibilities, API surface, or test steps. Scenario text remains in .feature files.
- Aligns with docs/architecture/udd-concept-model.md and docs/architecture/canonical-derivation-model.md: Journey is an experience artifact that points to use_case ids or scenario paths.

Schema (fields)
- id: kebab-case string, journey id (example: new-user-onboarding)
- title: short human title
- actor: persona id (references product/actors.md)
- goal: one-sentence outcome the journey achieves for the actor
- stages: ordered array of stage objects
  - id: kebab-case stage id
  - title: short label
  - summary: 1-2 sentence description of stage from user's perspective
  - touchpoints: array of touchpoint objects (what the user sees/does)
    - id: kebab-case
    - description: short user-observable interaction (no implementation)
    - channels: array of channel strings (web, mobile, email, cli, phone, in-person)
    - observable_signals: optional array of strings (what product shows or logs that are user-facing)
- emotions: high-level emotional trajectory for the journey (see notes)
  - format: list of {stage_id, emotion, intensity: 1-5, note}
  - guidance: prefer qualitative labels (curious, frustrated, relieved) plus intensity; avoid internal metrics like latency numbers
- pain_points: array of user-facing pain point objects
  - id: kebab-case
  - description: what frustrates or blocks the user at this stage (user-observable)
  - frequency: optional estimate (always, often, sometimes, rare)
- success_metrics: array of measurable outcomes that indicate journey success
  - id: kebab-case
  - description: what success looks like (e.g., "task created and visible in inbox within 10s")
  - metric: optional machine-friendly metric reference (link to requirement id or monitoring metric)
  - target: optional numeric or qualitative target
- references: optional mapping to use_case ids or scenario paths
  - format: {type: "use_case"|"scenario", id: string}

Policy: narrative is experience timeline, not capability internals
- The journey narrative MUST use only user-observable language. Examples of forbidden content:
  - "This stage calls the task_service.create() API" (forbidden)
  - "The backend will enqueue a job to process" (forbidden)
  - "Use feature flag myfeature_v2" (forbidden)
- Allowed: "User taps New Task, a new blank input appears" (user-observable)
- Any reference to implementation must point to a Use Case or Component via references fields, not describe internals.

Invalid patterns (capability leak detection)
- Regex patterns to reject in narrative fields (illustrative, enforce via udd lint elsewhere):
  - "\b(service|api|endpoint|database|queue|persist|encrypt|decrypt|lambda|microservice|container)\b" when used with verb phrases (calls, writes, persists)
  - code-like tokens: "\b[A-Za-z_]+\.[A-Za-z_]+\(|\bGET /|POST /|PUT /" (indicates API or code)
  - feature-flag like tokens: "\bfeature[_-]flag\b|\btoggle\b|\bmyfeature_v\d+\b"
  - configuration or infra mentions: "k8s|docker|ecs|s3|cloudwatch|prometheus|redis|postgres|mysql|mongodb"

Rejection rules (human-readable)
- If a journey field matches any invalid pattern above it must be rejected and the author must either:
  1) replace with a user-observable description, or
  2) move the implementation detail into a Use Case or Component doc and reference it from references.

Example: Full narrative (Happy path)

id: onboarding-quick-start
title: "New User Quick Start"
actor: team-member
goal: "Sign up and complete first task within 5 minutes"
stages:
  - id: discover
    title: Discover
    summary: "User learns about the product and decides to try it"
    touchpoints:
      - id: landing-page
        description: "User reads short benefits and clicks Sign up"
        channels: [web]
        observable_signals: ["signup button visible", "marketing headline"]
  - id: signup
    title: Sign up
    summary: "User creates account using email or social sign-on"
    touchpoints:
      - id: signup-form
        description: "User completes a short form and confirms email"
        channels: [web, mobile]
        observable_signals: ["success message", "confirmation email sent"]
  - id: first-task
    title: Create first task
    summary: "User creates their first task and sees it in the inbox"
    touchpoints:
      - id: create-task-ui
        description: "User taps New Task, types a title, and taps Save"
        channels: [web, mobile, cli]
        observable_signals: ["new task appears in inbox list", "toast: Task created"]
emotions:
  - stage_id: discover
    emotion: curious
    intensity: 3
    note: "User is exploring options, open to persuasion"
  - stage_id: signup
    emotion: cautious
    intensity: 2
    note: "User may abandon if form is long"
  - stage_id: first-task
    emotion: delighted
    intensity: 4
    note: "User feels accomplished when task appears immediately"
pain_points:
  - id: email-confirmation-delay
    description: "Users sometimes do not receive confirmation quickly and abandon"
    frequency: often
  - id: unclear-empty-state
    description: "After signup the inbox looks empty and users are unsure what to do next"
    frequency: sometimes
success_metrics:
  - id: signup-success-rate
    description: "Percentage of users who complete signup and confirm email within 10 minutes"
    metric: analytics.signup_confirmed
    target: ">80%"
  - id: first-task-completion
    description: "Percentage of signed-up users who create a first task within 5 minutes"
    metric: analytics.first_task
    target: ">=50%"
references:
  - type: use_case
    id: capture-task

Notes on emotions (trajectory)
- Emotions represent the user's subjective experience at each stage. The model captures label and intensity to help product prioritize interventions. Keep labels human-centric, avoid technical proxies like CPU or response-time metrics.

Quality checks (what a human reviewer verifies)
- All stages use user-observable language (no code, API names, or component mentions).
- references point to use_case ids or scenario paths when implementation or test mapping is required.
- success_metrics are outcome-oriented and do not prescribe internal implementation.

Appendix: Common mistakes to avoid
- Writing step-by-step Gherkin in journey text. Scenarios belong in .feature files.
- Referencing internal component names or methods.
- Listing monitoring or infra targets as part of emotional descriptors.


