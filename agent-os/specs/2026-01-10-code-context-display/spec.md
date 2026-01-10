# Specification: Code Context Display

## Goal

Parse and display diff hunks and file metadata for PR review comments as Markdown snippets, allowing users to see the code being discussed directly within Raycast without opening GitHub.

## User Stories

- As a user, I want to see the code context of a review comment so that I can understand what's being discussed without switching to my browser
- As a user, I want to see the diff hunk so that I can quickly review the code change in question

## Specific Requirements

**Code Context Data Model**
- Define `CodeContext` type in `@github-notifications/core`
- Include fields: `path`, `diffHunk`, `line`, `side`, `startLine`, `endLine`
- Include `originalLine` and `originalStartLine` for multi-line comments
- Support both single-line and multi-line code selections

**PR Review Comment API**
- Extend `CommentService` to fetch PR review comment details
- Use `GET /repos/{owner}/{repo}/pulls/comments/{comment_id}` endpoint
- Extract `diff_hunk`, `path`, `line`, `side` from response
- Handle `start_line` and `start_side` for multi-line comments

**Diff Hunk Parsing**
- Parse diff hunk string from GitHub API response
- Extract added lines (+), removed lines (-), and context lines
- Preserve line numbers from diff header (@@ markers)
- Limit displayed lines to reasonable maximum (e.g., 20 lines)

**Markdown Rendering**
- Format code context as fenced code block with syntax highlighting
- Detect language from file extension in `path` field
- Include file path as header above code block
- Use diff syntax highlighting for hunks showing changes

**Display in Detail View**
- Show code context in notification detail view
- Position below comment body, above action buttons
- Include "View in GitHub" link to jump to exact line
- Collapse long diff hunks with "Show more" option

**Core Package Utilities**
- Create `parseFilePath(path)` to extract filename and extension
- Create `detectLanguage(path)` to map extension to syntax highlight language
- Create `formatDiffHunk(hunk, options)` to render hunk as Markdown
- Create `truncateDiffHunk(hunk, maxLines)` to limit displayed content

**Syntax Highlighting Language Map**
- Map common extensions: `.ts` → typescript, `.js` → javascript, `.py` → python
- Support: TypeScript, JavaScript, Python, Ruby, Go, Rust, Java, etc.
- Fallback to plain text for unknown extensions
- Use `diff` language for mixed add/remove hunks

**Fallback Handling**
- Show message when code context unavailable: "Code context not available"
- Handle comments on deleted files gracefully
- Handle comments on files user doesn't have access to
- Provide link to view in browser as fallback

## Visual Design

To be added during grooming — code context rendering in detail view.

## Existing Code to Leverage

- `CommentService` from fetch-comment-details spec
- `Comment` type from core package
- Notification detail view from notification-detail-view spec
- Raycast `Detail` component with Markdown support

## Out of Scope

- Full file content display (only diff hunk)
- Syntax highlighting beyond Raycast's Markdown support
- Code navigation (go to definition, references)
- Inline code editing
- Fetching surrounding context beyond diff hunk
- Side-by-side diff view
