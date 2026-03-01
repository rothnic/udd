We added a top-level `phase: 3` field to every use-case YAML file under specs/use-cases/.

Validation steps performed:
- Verified presence of `phase: 3` in each file via grep.
- Parsed each modified YAML file using Ruby's YAML.load_file to ensure syntactic validity.
- Ran LSP diagnostics after installing yaml-language-server; no diagnostics reported for the changed files.

Blockers observed:
- Commit attempts were initially blocked by many modified .memsearch session files in the working tree which prevented staged files from being detected by lint-staged.

Resolution taken:
- Staged and committed only the use-case YAML files after diagnosing the staging issue.
- Installed yaml-language-server and ran LSP diagnostics for the changed files.

Next recommended actions:
- Consider adding .memsearch/ to .gitignore or committing/stashing those session files to avoid future commit interference.
- Run udd lint and npm test as part of CI to ensure no regressions.

Timestamp: 2026-03-01
