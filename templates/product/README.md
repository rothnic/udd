# UDD Product Specification

This directory contains the product specification for your project.

## Structure

- **[actors.md](actors.md)** - Who uses this product
- **[constraints.md](constraints.md)** - Non-functional requirements and hard rules
- **[changelog.md](changelog.md)** - Decision history (auto-updated by `udd sync`)
- **[journeys/](journeys/)** - User journeys describing what users accomplish

## Getting Started

1. Edit `actors.md` to define who uses your product
2. Add constraints in `constraints.md`
3. Create user journeys in `journeys/`
4. Run `udd sync` to generate BDD scenarios from your journeys
