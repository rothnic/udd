Decisions made during this work:

- Decision: Insert `phase: 3` at top-level in all use-case YAML files (after summary, before actors). This was applied to all files under specs/use-cases/.

- Decision: Commit approach — stage and commit only the modified use-case YAML files; avoid touching .memsearch session files. This avoids accidental commits of session data and keeps the change focused.

- Decision: Install yaml-language-server to run local LSP diagnostics for YAML files to satisfy verification rule requiring lsp_diagnostics clean on changed files.

Timestamp: 2026-03-01
