# Create template-actor markdown file (@Sisyphus-Junior subagent)

**ID**: ses_36ea0cc5dffe8x2LSi4LLqq88d
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:37:41 PM
**Stats**: 1 files changed, +36 -0

---

## USER (2:37:41 PM)

# Actor: <Actor Name>

**Who.**
A one-line persona description. Include role, environment, and any distinguishing detail. Example: "A team member using mobile during commutes." 

**Goals.**
- Primary goal (outcome oriented, measurable). Example: "Capture 90% of incoming tasks within 2 minutes." 
- Secondary goal (if any). Keep to short, testable outcomes.

**Context / Constraints.**
- Where and when the actor acts (device, network, time pressure).
- Constraints that affect design (privacy, access levels, regulatory).

**Pain points / Risks.**
- Short list of real pain points tied to goals or context. Use observable terms (lost items, slow sync, interruptions).

**Success criteria (measurable).**
- Clear pass/fail or numeric targets. Example: "Can add a task in <= 20s, 95% of attempts." 
- Map each success criterion to a verification method (manual check, automated test, telemetry metric).

**Journeys mapping.**
- Primary journey: product/journeys/<slug>.md  # map specific goal -> journey file
- Additional journeys: product/journeys/<slug>.md

**Validation checklist (Layer 1 actor).**
- [ ] Who present
- [ ] At least one goal that is outcome oriented
- [ ] Context or constraints present
- [ ] At least one pain point listed
- [ ] At least one measurable success criterion
- [ ] Journey mapping added
- [ ] Entry concise (aim for 6-12 lines total)

Notes:
- Keep entries short and parallel to other actor files in product/actors.md.
- Use this template for all Layer 1 actors. Do not add implementation details here.


