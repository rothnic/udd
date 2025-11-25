# Research: Multi-Agent Orchestration

## Metadata

| Field | Value |
|-------|-------|
| Status | `active` |
| Created | 2025-11-25 |
| Timebox | 5 days |
| Decision | _TBD_ |
| Related Features | opencode/orchestration |
| Prior Research | [opencode-orchestration-approach](../opencode-orchestration-approach/README.md) (decided) |

## Question

How should UDD support orchestrated multi-agent development with process enforcement, parallel workers, and cost-optimized model selection?

## Context

Current UDD provides CLI tools and agent prompts, but lacks:
- Process enforcement (agents can skip steps)
- Coordination for parallel workers
- Recovery from failures
- Cost optimization across models

The goal is "set it and run" autonomous development that self-corrects when agents deviate from process.

## Alternatives

### Option A: State machine with wrapped tools

Wrap file operations in custom OpenCode tools that check a state machine before allowing writes.

**Architecture:**
```
Orchestrator (gpt-5-mini)
    ↓ spawns
Workers (opus-4.5)
    ↓ use
Custom Tools (udd_read, udd_write, udd_claim)
    ↓ enforce
State Machine (.udd/process.yml)
```

**Pros:**
- Hard enforcement (can't bypass)
- Self-correcting (redirects agents)
- Supports parallel workers via locking

**Cons:**
- Requires OpenCode-specific tooling
- Adds complexity to simple workflows
- May be frustrating for experienced users

### Option B: Advisory prompts only

Keep current approach: agents receive process guidance via prompts but aren't blocked.

**Pros:**
- Simpler implementation
- Flexible for edge cases
- Works with any agent system

**Cons:**
- Agents can skip steps
- No coordination for parallel work
- No automatic recovery

### Option C: Hybrid (advisory + audit)

Allow all operations but audit and flag violations for review.

**Pros:**
- Non-blocking workflow
- Still catches violations
- Easier adoption

**Cons:**
- Violations detected after the fact
- Cleanup is manual
- Doesn't prevent conflicts

## Evaluation Criteria

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Process enforcement | 3 | Strong | Weak | Medium |
| Parallel coordination | 3 | Strong | None | None |
| Implementation effort | 2 | High | Low | Medium |
| User experience | 2 | Medium | High | High |
| Recovery capability | 2 | Strong | None | Weak |

## Findings

### 2025-11-25: Initial analysis

**Key components identified for Option A:**

1. **State machine** - Controls what writes are allowed per task state
2. **File locking** - Prevents parallel workers from conflicting
3. **Task management** - Track tasks through states
4. **Checkpointing** - Enable recovery from failures
5. **Model routing** - Use cheap models for orchestration, expensive for implementation

**State machine states:**
- inbox → planning → implementing → testing → review → complete

**Required new CLI commands:**
- `udd task create|list|claim|complete`
- `udd claim|release` (file locking)
- `udd checkpoint list|restore`

**Required OpenCode tools:**
- `udd_write` - Wrapped write with state check
- `udd_claim` - File locking
- `udd_spawn_worker` - Create child session

### 2025-11-25: Cost optimization

Model routing strategy:
- Orchestration tasks → gpt-5-mini (unlimited)
- Review tasks → gpt-5-mini
- Implementation tasks → opus-4.5 (or configurable)
- Test mode → configurable override

## Decision

_TBD - Pending review_

## Proposed Changes

If Option A is selected:

1. **New use case**: `orchestrated_development`
2. **New features**:
   - `udd/orchestration/state-machine`
   - `udd/orchestration/task-management`
   - `udd/orchestration/file-locking`
3. **New directory**: `.udd/` for runtime state
4. **OpenCode integration**: Custom tools and plugins

## Follow-up

- [ ] Review and decide on approach
- [ ] If approved, create use case and features
- [ ] Update VISION.md phases if scope changes
