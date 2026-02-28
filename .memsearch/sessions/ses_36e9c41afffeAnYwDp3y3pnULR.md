# Create test-review YAML template file (@Sisyphus-Junior subagent)

**ID**: ses_36e9c41afffeAnYwDp3y3pnULR
**Project ID**: ad761ea6174e58ed763fc75290c3f403ed51079d
**Created**: 2/24/2026, 2:42:39 PM
**Stats**: 1 files changed, +26 -0

---

## USER (2:42:39 PM)

test: <test-file>.e2e.test.ts
verifies: <spec-path>

reviews:
  - reviewer: <name>
    date: <YYYY-MM-DD>
    verdict: <approved|changes_requested|rejected>
    checklist:
      - name_matches_scenario: <true|false>
      - all_steps_have_code: <true|false>
      - assertions_meaningful: <true|false>
      - no_stub_patterns: <true|false>
      # optional: add any project-specific checks here
    notes: "<short notes about review>"
    adequate: <true|false>
    # optional: reason this review is considered stale
    stale_reason: <optional explanation if review is stale>

verification:
  last_run: <YYYY-MM-DD>
  result: <passing|failing|skipped|error>
  adequate: <true|false>

# Example usage:
# copy this file to tests/e2e/<area>/<feature>.test-review.yml
# fill placeholders and keep entries machine-readable and ASCII only


