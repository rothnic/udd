# Concept: User Driven Development (UDD)

## Core Philosophy

### User-First Development
UDD inverts the traditional development pyramid. Instead of:
```
Code → Tests → Documentation → User Value
```

We practice:
```
User Journey → Scenarios → Tests → Code
```

**The user is not an afterthought—they are the specification.**

### Journeys as Requirements
A user journey is not documentation. It is a **computable requirement**. Each step in a journey:
- Maps to a BDD scenario
- Links to executable tests
- Traces to implementation
- Validates completion

### Test-as-Spec
Tests are not separate from requirements—they **are** the requirements in executable form. When all tests pass, the feature is done by definition.

### Traceability as Non-Negotiable
Every line of code must trace to a user need. Drift is detected, not tolerated.

## Scope

### In Scope

**Core Framework**
- Journey authoring and management
- Scenario generation from journeys
- Traceability validation
- Test lifecycle management (dirty/clean marking)
- CLI for developer workflows
- OpenCode plugin for agent integration

**Integration Points**
- Git hooks for pre-commit validation
- GitHub Actions for CI gates
- VS Code extension for editor awareness
- OpenCode orchestration hooks

**Governance**
- Phase-based development roadmap
- Use-case traceability
- Quality gates and checkpoints
- Remediation workflows

### Out of Scope

**Not a Replacement For**
- Project management tools (Jira, Linear)
- Test runners (Vitest, Jest)
- CI/CD platforms (GitHub Actions, CircleCI)
- Documentation generators

**Explicitly Excluded**
- Test execution (delegated to test runners)
- Code generation (scaffolding only)
- Deployment automation
- Bug tracking
- Performance profiling

## Success Metrics

### Completeness
- **100% journey coverage**: Every user journey has linked scenarios
- **100% traceability**: Every scenario links to a use case
- **100% strict validation**: `udd validate --strict` passes

### Quality
- **Zero drift**: All references resolve correctly
- **Zero stubs**: All tests have real assertions
- **<5 min recovery**: Drift detected and fixed automatically

### Adoption
- **Daily usage**: Team runs `udd status` daily
- **Phase adherence**: Work respects roadmap phase boundaries
- **Agent integration**: AI agents pause on drift

## Target Users

### Primary: Software Developers
- **Need**: Clear requirements that don't drift
- **Benefit**: Know exactly what's expected and when it's done
- **Workflow**: Journey → Scenario → Test → Code

### Secondary: AI Agents
- **Need**: Structured context for autonomous work
- **Benefit**: Clear boundaries, traceable decisions, guided recovery
- **Workflow**: Status check → Guided iteration → Validation

### Supporting: Product Managers
- **Need**: Visibility into implementation status
- **Benefit**: Requirements live in code, not documents
- **Workflow**: Author journey → Auto-generate scenarios → Track progress

### Enabling: QA Engineers
- **Need**: Test coverage linked to requirements
- **Benefit**: Tests validate intent, not just implementation
- **Workflow**: Review scenarios → Add edge cases → Validate coverage

## Value Hypotheses

### H1: Journeys Prevent Drift
**Claim**: When requirements are expressed as user journeys linked to executable tests, requirements drift drops by 80%.

**Validation**: Track scenarios with broken references over time. Target: <5% broken.

### H2: Traceability Accelerates Onboarding
**Claim**: New developers understand the codebase 50% faster when they can trace code to user journeys.

**Validation**: Measure time to first meaningful PR for new team members.

### H3: Agent Integration Reduces Review Cycles
**Claim**: AI agents with UDD context require 60% fewer review cycles.

**Validation**: Compare PR iterations with/without UDD context.

### H4: Strict Validation Prevents Tech Debt
**Claim**: Enforcing traceability at commit time prevents 70% of architectural drift.

**Validation**: Compare code churn in repos with/without UDD gates.

## Guiding Principles

1. **Spec is Truth**: If it's not in a journey, it's not a requirement.
2. **Automation Over Process**: Manual checks become automated gates.
3. **Fail Fast, Fix Fast**: Detect drift immediately, remediate automatically.
4. **Dogfood Everything**: UDD must use UDD for its own development.
5. **Agent-Ready**: Design for AI agents as first-class users.

## Anti-Patterns

- ✗ Skipping validation to "save time"
- ✗ Writing code before scenarios
- ✗ Treating journeys as documentation-only
- ✗ Allowing broken references to persist
- ✗ Disabling gates to merge faster

## Evolution

UDD evolves through phases:

**Phase 1**: Core CLI and validation (COMPLETE)
**Phase 2**: Research and technical specs (COMPLETE)
**Phase 3**: OpenCode integration (CURRENT)
**Phase 4**: Agent intelligence (UPCOMING)
**Phase 5**: Advanced workflows (UPCOMING)

Each phase adds capability while maintaining strict backward compatibility for existing journeys and scenarios.

## Conclusion

UDD is not a tool—it's a contract between humans and machines. The contract states:

> *"Every piece of code exists to serve a user need. That need is documented in a journey, specified in scenarios, verified by tests, and traceable at all times. Drift is not tolerated. Quality is not optional. The user is the north star."*
