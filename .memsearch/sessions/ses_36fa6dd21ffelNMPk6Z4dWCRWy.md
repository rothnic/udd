# Add actor validation criteria section (@Sisyphus-Junior subagent)

**ID**: ses_36fa6dd21ffelNMPk6Z4dWCRWy
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 9:51:26 AM
**Stats**: 1 files changed, +13 -0

---

## USER (9:51:26 AM)

# Actors

This file documents who uses the product. Keep entries short, focused, and actionable.

## Team Member

**Who.** A team member is an individual contributor who works on tasks assigned by the team or themselves.

**Goals.**
- Capture tasks and ideas quickly so nothing is lost.
- Stay focused on the current work while making visible progress.

**Context.**
- Mobile-first usage, often on the go or away from a desktop.
- Frequently interrupted by meetings, messages, and ad-hoc requests.

**Pain points.**
- Forgetting ideas or decisions that came up while away from the desk.
- Losing work-in-progress when switching contexts or devices.
- Context switching between tasks and tools breaks focus and increases overhead.

Notes: This actor is intentionally concise. Keep future actor entries the same style and level of detail.

## Team Lead

**Who.** A Team Lead coordinates and supports a small group of team members, focusing on flow and delivery rather than task-level direction.

**Goals.**
- Monitor workload across the team so work is balanced and sustainable.
- Identify blockers early and clear impediments that slow progress.

**Context.**
- Needs a high-level overview without micromanaging individuals.
- Splits time between hands-on work and enabling others to succeed.

**Pain points.**
- Missing early signals that a teammate is blocked or overloaded.
- Too much detail can turn oversight into micromanagement, reducing trust.

Notes: Keep entries concise and parallel with the Team Member section.

## Validation Criteria

These checks apply to Layer 1 actor entries (Team Member, Team Lead). Keep each item short and verifiable.

- Goals present: actor has at least one clear, outcome-oriented goal. (verify: `Goals.` section exists)
- Context present: actor includes environment or situational notes explaining when they act. (verify: `Context.` section exists)
- Pain points present: actor lists at least one real pain point tied to the goals or context. (verify: `Pain points.` section exists)
- Measurable scope: at least one goal or pain point is specified so it can be measured or observed (time, frequency, count, or binary state). (verify: contains words like "within", "per", "often", "frequently", "times", or a numeric target)
- Realistic persona: the who/context/goals form a believable persona, not a vague role description. (verify: `Who.` plus context and goals are non-empty)
- Concise: total actor entry (who, goals, context, pain points, notes) should remain short and focused, roughly 6-12 lines. (manual check)

Keep criteria checklist-friendly so reviewers can verify actor quality quickly.


