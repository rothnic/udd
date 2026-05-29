# Actors

## Primary Actors

### Developer
- **ID**: developer
- **Goal**: Ship features with clear traceability to product intent
- **Pain Points**:
  - Requirements drift from implementation
  - Unclear what "done" means
  - Hard to trace test failures to requirements

### AI Agent
- **ID**: agent
- **Goal**: Assist development while respecting boundaries
- **Pain Points**:
  - Unclear what has human approval
  - Hard to detect work-in-progress
  - No structured handoff protocol

### Product Manager
- **ID**: product_manager
- **Goal**: Communicate product vision clearly
- **Pain Points**:
  - Requirements lost in translation
  - No visibility into implementation status
  - Features shipped that don't match intent

## Secondary Actors

### Code Reviewer
- **ID**: code_reviewer

### QA Engineer
- **ID**: qa_engineer

### DevOps Engineer
- **ID**: devops_engineer

### Team Lead
- **ID**: team_lead
- **Goal**: Maintain delivery quality and keep team work aligned with product intent

### Team Manager
- **ID**: team_manager
- **Goal**: Monitor quality, delivery health, and process risks across the team

### User
- **ID**: user
- **Goal**: Use UDD workflows without needing to understand internal traceability mechanics

### Orchestrator Agent
- **ID**: orchestrator_agent
- **Goal**: Coordinate multi-step agent work through UDD status and traceability signals

### Worker Agent
- **ID**: worker_agent
- **Goal**: Complete bounded implementation tasks while preserving source-of-truth alignment
