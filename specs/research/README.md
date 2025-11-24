# Research Workflow

Research is a structured investigation to resolve uncertainty before committing to implementation. This document defines the workflow, artifact structure, and rules.

## When to Use Research

| Uncertainty Type | Example | Research Question |
|------------------|---------|-------------------|
| **Value** | "Is this feature worth building?" | "Do users actually need X?" |
| **Technical** | "How should we build this?" | "What's the best approach for X?" |
| **Feasibility** | "Can we build this?" | "Is X possible within constraints?" |

## Research Lifecycle

```
1. Identify uncertainty
   └── Feature marked with `requires_research: true`

2. Create research
   └── udd new research <id>
   └── git checkout -b research/<id>

3. Investigate (on research branch)
   └── Update README.md with findings
   └── Prototype code is LOCAL ONLY (never committed)

4. Decide
   └── udd research decide <id>
   └── Document learnings
   └── Merge README.md to phase branch

5. Continue with feature
   └── Link research to feature
   └── Create tech spec if needed
   └── Resume normal UDD flow
```

## Artifact Structure

Each research item lives in its own folder with a **single README**:

```
specs/research/
  <id>/
    README.md      # THE research document (single source of truth)
    assets/        # Optional: diagrams, screenshots, data files
```

### Anti-Sprawl Rules

1. **One README per research** - No `NOTES.md`, `FINDINGS_v2.md`, `SCRATCH.md`
2. **Append, don't create** - New findings go in the Findings section with timestamps
3. **Assets for binary only** - Images, diagrams, CSVs. Not markdown files.
4. **Prototype code is ephemeral** - Work in `/tmp` or local scratch, never commit to branch
5. **Lint enforced** - `udd lint` validates research folder structure

## README.md Template

```markdown
# Research: <Title>

## Metadata

| Field | Value |
|-------|-------|
| Status | `active` / `decided` / `abandoned` |
| Created | YYYY-MM-DD |
| Timebox | N days |
| Decision | _TBD_ or Option X |
| Related Features | link(s) |

## Question

What specific question are we trying to answer?

## Context

Why does this matter? What triggered this research?

## Alternatives

### Option A: <Name>

**Description**: ...

**Pros**:
- Pro 1
- Pro 2

**Cons**:
- Con 1
- Con 2

### Option B: <Name>

...

## Evaluation Criteria

| Criterion | Weight | Option A | Option B |
|-----------|--------|----------|----------|
| Performance | 3 | ⭐⭐⭐ | ⭐⭐ |
| Complexity | 2 | ⭐⭐ | ⭐⭐⭐ |
| Cost | 1 | ⭐⭐⭐ | ⭐ |

## Findings

### YYYY-MM-DD: <Topic>

What was investigated and discovered.

### YYYY-MM-DD: <Topic>

...

## Decision

**Selected**: Option X

**Rationale**: Why this option was chosen.

**Trade-offs Accepted**: What we're giving up.

## Learnings

Key insights to preserve (merged to main):

1. Learning 1
2. Learning 2

## Follow-up

- [ ] Link research to feature
- [ ] Create tech spec
- [ ] Update documentation
```

## Linking Research to Features

Features that require research are marked in `_feature.yml`:

```yaml
id: llm-validation
area: cli
name: LLM-Based Validation
summary: Use AI to validate spec quality
requires_research: true           # Blocks scenarios until research complete
research: llm-validation-approach # Links to specs/research/<id>/
```

When `requires_research: true`:
- Scenarios cannot be written until research status is `decided`
- `udd lint` will warn about missing research
- `udd status` shows features awaiting research

## Branching

```
main
  └── phase/1
        ├── research/llm-validation  # Research branch
        │     └── README.md only (no code)
        ├── feat/cli/status
        └── feat/cli/lint
```

**Research branches**:
- Branch from current phase branch
- Only merge the `specs/research/<id>/README.md` (learnings)
- Never merge prototype code
- Delete branch after merge

## CLI Commands (Planned)

```bash
udd new research <id>              # Scaffold from template
udd research list                  # Show all research (active/decided/abandoned)
udd research decide <id> [option]  # Record decision, prompt for learnings
udd research abandon <id>          # Mark abandoned with reason
udd research link <id> <feature>   # Add research link to _feature.yml
```

## Integration with Status

`udd status` will show:

```
Research
  ⏳ llm-validation-approach (active, 1d remaining)
  ✅ schema-library (decided: zod)
  ❌ ml-approach (abandoned)

Features Awaiting Research
  cli/llm-validation → needs: llm-validation-approach
```
