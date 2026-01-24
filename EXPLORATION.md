# Exploration & Issues

This file tracks the exploration of the codebase, identified issues, and future work for the UDD project, specifically focusing on the TUI.

## Open Issues

- [ ] **TUI Navigation**: Implement deeper navigation within screens (e.g., scrolling lists).
- [ ] **Journeys Screen**: Implement listing of journeys from `product/journeys/`.
- [ ] **Actors Screen**: Improve markdown rendering and handle error states better.
- [ ] **Dashboard**: Add summary stats (similar to `udd status` output).
- [ ] **Interactive Mode**: Allow running commands like `udd sync` or `udd test` directly from TUI.
- [ ] **Themes**: Allow user to configure TUI colors/themes.

## Exploration Logs

### Initial TUI Implementation
- Created basic Ink-based TUI with Dashboard, Actors, and Journeys tabs.
- Integrated `marked` and `html-to-text` for viewing `product/actors.md`.
- Set `udd tui` as the default command.

## Future Work

- [ ] **Search**: Add global search across features and journeys.
- [ ] **Visualizations**: Use `ink-chart` or similar to show test coverage visually.
