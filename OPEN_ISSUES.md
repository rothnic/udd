# Open Issues & Exploration Tracking

## TUI Development
- [ ] **Journeys Screen**: Implement a screen to list and manage user journeys.
  - [ ] Display list of journeys from `product/journeys/`.
  - [ ] Show status (sync needed, passing/failing tests).
  - [ ] Allow creating new journeys via the TUI.
- [ ] **Inbox Screen**: Implement the Inbox screen.
  - [ ] Integrate `useInbox` hook (needs to be created/verified).
  - [ ] Display items from `specs/inbox.yml`.
  - [ ] Allow processing inbox items (convert to journey/feature).
- [ ] **Help Screen**: Add a help screen with keyboard shortcuts and documentation.
- [ ] **Navigation**: Improve tab navigation (maybe use `ink-tab` if compatible or enhance `Layout.tsx`).
- [ ] **Status Integration**: Connect the Dashboard real data from `getProjectStatus`.
- [ ] **Interactive Commands**: Allow running `udd sync`, `udd test` directly from the TUI.

## Core Logic
- [ ] **Inbox Hook**: Ensure `src/hooks/useInbox.ts` exists and works correctly for the TUI.
- [ ] **Status Optimization**: Ensure `getProjectStatus` is fast enough for TUI rendering or implement caching/loading states.

## General
- [ ] **Styling**: Improve the "delightful, modern, and a little nerdy" aesthetic.
- [ ] **Patterns**: Establish reusable Ink components for lists, inputs, and modals.
