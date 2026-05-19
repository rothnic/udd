# Journey: Track Test Quality

**Actor:** Developer
**Goal:** Know which tests need review and why

## Context

Developers waste time figuring out which tests matter. Tests accumulate without clear ownership, leading to:

- Wasted time digging through unrelated tests when a feature changes
- Missed tests that should have been updated alongside code changes
- Lost confidence in the test suite as coverage gaps grow unnoticed

Without visibility into test status, teams either over-test (slowing development) or under-test (risking regressions).

## Steps

1. Link tests to features → `specs/features/udd/test-governance/test-linkage.feature`
   Associate tests with the features they validate so changes to a feature automatically surface relevant tests

2. Check test status → `specs/features/udd/test-governance/test-status.feature`
   See at a glance which tests are passing, failing, outdated, or need review

3. Mark tests clean → `specs/features/udd/test-governance/test-review.feature`
   Record when tests have been reviewed and are trusted for the current feature version

## Success Criteria

- Clear status visibility for every test (linked to features, last review date, current status)
- Under 10 seconds to understand the quality state of any test or feature
- Automatic linkage between code changes and affected tests
