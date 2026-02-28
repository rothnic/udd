# Create journey template markdown file (@Sisyphus-Junior subagent)

**ID**: ses_36ea007b7ffeuxk1nOIAo1nSnV
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:38:31 PM
**Stats**: 1 files changed, +36 -0

---

## USER (2:38:31 PM)

# Journey: {{JOURNEY_TITLE}}

**Actor:** {{ACTOR}}
**Goal:** {{GOAL}}

## Steps

1. {{STEP_1_DESCRIPTION}} → `specs/{{DOMAIN}}/{{STEP_1_ACTION}}.feature`
2. {{STEP_2_DESCRIPTION}} → `specs/{{DOMAIN}}/{{STEP_2_ACTION}}.feature`
3. {{STEP_3_DESCRIPTION}} → `specs/{{DOMAIN}}/{{STEP_3_ACTION}}.feature`

Add or remove steps as needed. Keep each step short and map it to a single feature file.

## Success

Define a measurable outcome the actor can verify. Use time, count, or state where possible.

- Outcome: {{MEASURABLE_OUTCOME}}
- Timebox: {{TIME_LIMIT}} (e.g., "within 5 minutes")

## Notes (optional)

- Alternatives considered: {{ALTERNATIVES}}
- Edge cases: {{EDGE_CASES}}
- Assumptions: {{ASSUMPTIONS}}

--

Template guidance:
- JOURNEY_TITLE: short descriptive title, e.g., "Daily Planning"
- ACTOR: who performs the journey, e.g., "Team Member"
- GOAL: user-visible goal
- Steps: describe user actions and point to feature path
- MEASURABLE_OUTCOME: clear success criteria the test can assert

(Keep this file ASCII-only and minimal. Copy into product/journeys/ and replace placeholders.)


