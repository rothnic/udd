---
description: Show research status and active investigations
agent: udd
---

# /udd/research Command

Display active research investigations and their status.

## Research Directory

!`ls -la specs/research/`

## Active Research

!`cat specs/research/README.md`

## Research Workflow

Research documents track uncertain decisions:

### Status Values
- `active` - Investigation in progress, blocks related features
- `decided` - Decision made, related features can proceed
- `archived` - Historical reference, no longer active

### Creating Research

When facing uncertainty:
1. Create a research document: `mkdir specs/research/<id> && touch specs/research/<id>/README.md`
2. Document the question and options
3. Do investigation (prototyping stays local, never committed)
4. Record learnings and decision
5. Update status to `decided`
6. Proceed with related features

### Blocking Features

Features linked to `active` research should be deferred until the research is decided.
