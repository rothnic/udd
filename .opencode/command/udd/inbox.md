---
description: Add an idea to the UDD inbox for later triage
agent: udd
---

# /udd/inbox Command

Capture an idea for later triage without interrupting current work.

## Arguments

- `$ARGUMENTS` - The idea description (can be a phrase or sentence)

## Execution

!`./bin/udd inbox add '$ARGUMENTS'`

## Current Inbox

!`cat specs/inbox.yml`

## About the Inbox

The inbox is a holding area for ideas that aren't ready for implementation:

- **Quick capture**: Don't lose good ideas while focused on other work
- **Later triage**: Periodically review and promote to use cases or discard
- **No commitment**: Items in inbox don't affect project status

## Next Steps

Ideas can be:
1. **Promoted to use case**: `/udd/new/use-case <id>` if it represents user value
2. **Discarded**: Remove from `specs/inbox.yml` if not valuable
3. **Left for later**: Keep in inbox until priorities clarify
