# Session ses_36f4ce99dffeCZqqKW6ZSBQXqu

## user (2026-02-24T17:29:41.938Z)

"list out your available tools"
---

## assistant (2026-02-24T17:29:41.961Z)

The user is asking me to list my available tools. I should provide a comprehensive overview of the tools I have access to, organized by category for clarity.

Let me organize the tools I have available:

1. **File System Tools**:
   - read - Read files/directories
   - write - Write files
   - edit - Edit files using LINE:HASH format
   - glob - File pattern matching
   - grep - Content search

2. **LSP/Code Intelligence Tools**:
   - lsp_goto_definition - Jump to symbol definition
   - lsp_find_references - Find all usages
   - lsp_symbols - Get symbols from file/workspace
   - lsp_diagnostics - Get errors/warnings
   - lsp_prepare_rename - Check rename validity
   - lsp_rename - Rename symbols

3. **AST Tools**:
   - ast_grep_search - Structural code search
   - ast_grep_replace - Pattern replacement

4. **Task Management**:
   - task - Spawn agent tasks with categories/skills
   - todowrite - Create/manage todo lists

5. **Background Tasks**:
   - background_output - Get output from background tasks
   - background_cancel - Cancel background tasks

6. **Web/Research**:
   - webfetch - Fetch web content
   - search_grep_1mcp_searchGitHub - Search GitHub code
   - search_searxng_1mcp_searxng_web_search - Web search
   - search_searxng_1mcp_web_url_read - Read URLs
   - search_context7_1mcp_resolve-library-id - Resolve library IDs
   - search_context7_1mcp_query-docs - Query documentation

7. **Session Management**:
   - session_list - List OpenCode sessions
   - session_read - Read session messages
   - session_search - Search session content
   - session_info - Get session metadata

8. **Skill Management**:
   - skill - Load skill instructions
   - skill_mcp - Invoke MCP server operations

9. **Other Tools**:
   - bash - Execute bash commands
   - interactive_bash - TMUX-based interactive bash
   - look_at - Analyze media files
   - context_usage - Get token usage analysis
   - mem-* tools for memsearch (index, search, watch, compact, expand, version, reset, stats, config, transcript, doctor)

I'll categorize these into logical groups for easy understanding.

## Available Tools

### **File Operations**
- **read** - Read files or directories
- **write** - Write files (must read first if exists)
- **edit** - Edit files using LINE:HASH format for precise, safe modifications
- **glob** - Fast file pattern matching (e.g., `**/*.ts`)
- **grep** - Content search with regex support

### **Code Intelligence (LSP)**
- **lsp_goto_definition** - Jump to where a symbol is defined
- **lsp_find_references** - Find all usages of a symbol
- **lsp_symbols** - Get symbols from a file or search workspace
- **lsp_diagnostics** - Get errors, warnings, hints
- **lsp_prepare_rename** - Check if rename is valid
- **lsp_rename** - Rename symbols across workspace

### **AST Analysis**
- **ast_grep_search** - Structural code search (25 languages)
- **ast_grep_replace** - Pattern-based code replacement

### **Task & Agent Management**
- **task** - Spawn agent tasks with categories (visual-engineering, ultrabrain, deep, etc.) and skills
- **todowrite** - Create and manage todo lists
- **background_output** - Get results from background tasks
- **background_cancel** - Cancel running background tasks

### **Web & Research**
- **webfetch** - Fetch content from URLs
- **search_grep_1mcp_searchGitHub** - Search 1M+ GitHub repos for code patterns
- **search_searxng_1mcp_searxng_web_search** - Web search via SearXNG
- **search_searxng_1mcp_web_url_read** - Read and extract content from URLs
- **search_context7_1mcp_resolve-library-id** - Resolve library IDs for docs
- **search_context7_1mcp_query-docs** - Query library documentation

### **Session Management**
- **session_list** - List OpenCode sessions
- **session_read** - Read session messages
- **session_search** - Search across session content
- **session_info** - Get session metadata

### **Skills & MCP**
- **skill** - Load skill instructions (built-in or user-installed)
- **skill_mcp** - Invoke MCP server operations

### **System & Shell**
- **bash** - Execute bash commands
- **interactive_bash** - TMUX-based interactive shell for TUI apps
- **look_at** - Analyze media files (PDFs, images, diagrams)
- **context_usage** - Get detailed token usage analysis

### **Memory/Search (memsearch)**
- **mem-index** - Index files/directories
- **mem-search** - Search the index
- **mem-watch** - Start filesystem watcher
- **mem-compact** - Run compaction
- **mem-expand** - Expand chunk hash to full context
- **mem-stats** - Get index statistics
- **mem-config** - Get/set configuration
- **mem-transcript** - Fetch transcript entries
- **mem-doctor** - Run diagnostics
- **mem-version** - Get version info
- **mem-reset** - Reset the index

---

**Most commonly used**: `read`, `edit`, `grep`, `glob`, `bash`, `task`, `todowrite`