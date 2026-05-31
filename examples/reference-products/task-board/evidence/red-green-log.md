# Red-Green Behavior Changes

1. Title validation: the title-required scenario failed until both
   implementations rejected blank titles.
2. Blocked-state reason: the blocked-work scenario failed until the reason was
   stored as user-visible state.
3. Owner filtering: the owner-filter scenario failed until reporting used the
   same owner field as assignment.
