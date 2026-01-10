# Specification: Reply to PR Review Comments

## Goal

Support replying specifically to PR review comment threads with proper API endpoints, enabling users to participate in code review discussions directly from Raycast.

## User Stories

- As a user, I want to reply to PR review comment threads so that I can participate in code review discussions without leaving Raycast
- As a user, I want my replies to appear in the correct thread so that the conversation context is preserved

## Specific Requirements

**PR Review Comment Detection**

- Detect when notification's `latestCommentUrl` points to a PR review comment
- PR review comments URL pattern: `/repos/{owner}/{repo}/pulls/comments/{comment_id}`
- Differentiate from issue comments: `/repos/{owner}/{repo}/issues/comments/{comment_id}`
- Extract pull request number and comment ID from URL

**GitHub API Integration**

- Use `POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies` endpoint
- This creates a reply in the same review thread as the original comment
- Request body: `{ "body": "reply content" }`
- Requires `repo` scope on authentication token

**Comment Service Extension**

- Add `replyToPRReviewComment(owner, repo, pullNumber, commentId, body)` method
- Detect PR review comments vs issue comments in `replyToComment()` dispatcher
- Route to appropriate endpoint based on comment type
- Return created reply comment object

**Thread Context Preservation**

- Replies appear nested under the original comment in GitHub UI
- Reply inherits the code context (diff hunk, file path, line) from parent
- No need to specify line numbers — API handles threading automatically
- Support multi-level thread replies (reply to a reply)

**Pull Request Number Resolution**

- Extract PR number from notification subject URL
- Subject URL pattern: `https://api.github.com/repos/{owner}/{repo}/pulls/{pull_number}`
- Cache PR number alongside notification for future use
- Handle case where PR number cannot be resolved

**Reply Form Enhancements**

- Show code context (diff hunk) in reply form for PR review comments
- Display file path and line number being discussed
- Include previous comments in thread for full context
- Indicate this is a code review reply vs general comment

**Error Handling**

- Handle 404: PR or comment deleted/not found
- Handle 403: user not authorized to comment on PR
- Handle 422: PR is locked or archived
- Handle case where PR was merged (still allow comments)
- Show specific error messages for PR review context

**Observability**

- Trace PR review reply with distinct span name
- Record comment type (pr_review vs issue) in metrics
- Log PR number and comment ID for debugging (no content)

## Visual Design

To be added during grooming — PR review reply form with code context.

## Existing Code to Leverage

- `CommentService` from fetch-comment-details spec
- Reply form from reply-to-comments spec
- Code context display from code-context-display spec
- `GitHubAuthProvider` from github-auth spec

## Out of Scope

- Creating new PR review comments (only replies to existing)
- Starting a new review
- Resolving/unresolving review threads
- Approving or requesting changes on PR
- Viewing full PR review conversation
- Suggesting code changes in replies
