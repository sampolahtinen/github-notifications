# Specification: GitHub Authentication

## Goal

Configure GitHub Personal Access Token storage in Raycast preferences with validation and secure retrieval, enabling all subsequent API calls to authenticate with GitHub.

## User Stories

- As a user, I want to securely store my GitHub token so that the extension can access my notifications
- As a user, I want to know if my token is valid so that I can fix authentication issues before they cause problems

## Specific Requirements

**Token Storage in Raycast Preferences**
- Use Raycast's built-in preferences API for secure token storage
- Define preference field with `type: "password"` for masked input
- Token should persist across Raycast sessions
- Store in `@github-notifications/raycast` package preferences

**Token Validation**
- Validate token on first use by calling GitHub API (`GET /user`)
- Check for required scopes: `notifications`, `repo`
- Cache validation result to avoid repeated API calls
- Re-validate when token changes

**Core Package Interface**
- Define `GitHubAuthProvider` interface in `@github-notifications/core`
- Interface methods: `getToken()`, `validateToken()`, `isAuthenticated()`
- Raycast implements this interface using Raycast preferences
- Other clients (VS Code, Zed) will implement with their own storage

**Error Handling**
- Show clear error if token is missing: prompt user to configure in preferences
- Show clear error if token is invalid: "Invalid token" with link to preferences
- Show clear error if token lacks required scopes: list missing scopes
- Handle network errors gracefully during validation

**Security Considerations**
- Never log or display the full token
- Token only accessed when making API calls
- No token caching outside of Raycast's secure preference storage

## Visual Design

Not applicable — uses Raycast's built-in preferences UI.

## Existing Code to Leverage

No existing code — first feature after monorepo setup.

## Out of Scope

- OAuth flow (using Personal Access Token only)
- Token refresh/rotation
- Multiple account support
- GitHub App authentication
- Storing token in core or observability packages
