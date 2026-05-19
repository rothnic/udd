# Journey: Project Setup

**Actor:** Developer, Agent
**Goal:** Initialize and configure the UDD project for development

## Context

Setting up a new UDD project should be simple and automated. This journey
covers installation and initial configuration.

## Steps

1. Developer runs `npm install` to install dependencies
2. Runs `npm link` to make CLI available globally
3. Verifies installation with `udd --help` → `specs/features/udd/cli/setup.feature`
4. Project is ready for development

## Success Criteria

- Dependencies are installed correctly
- CLI tool is linked and available globally
- Setup can be completed by agent or developer

## Use Cases

- `specs/use-cases/project_setup.yml` - Original use case (legacy)
