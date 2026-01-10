# Specification: Raycast MVP

## Goal

Build a complete Raycast extension MVP for GitHub notification management that allows developers to view, triage, and respond to GitHub notifications without leaving their workflow. This spec consolidates all Phase 1-2 features into a single, cohesive product experience suitable for design generation.

## User Stories

- As a developer, I want to see all my GitHub notifications in Raycast so that I can quickly scan what needs my attention
- As a developer, I want to receive native macOS notifications so that I'm alerted to new review requests immediately
- As a developer, I want to mark notifications as done so that I can keep my inbox clean and focused
- As a developer, I want to open notifications in my browser so that I can dive into the full context when needed

---

## Screens & Components

### 1. Inbox Command (Main View)

The primary interface — a list view showing all actionable GitHub notifications.

**Layout:**

- Raycast `List` component with search enabled
- Filter dropdown at top (optional for MVP)
- Status indicator showing listening state
- Empty state when no notifications

**List Item Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Icon]  PR Title or Issue Title                    5 min ago   │
│         owner/repository-name                                   │
└─────────────────────────────────────────────────────────────────┘
```

**List Item Fields:**

- **Icon:** Based on notification reason
  - 🔍 Code review icon → `review_requested`
  - 💬 Comment bubble → `comment`
  - 📣 Megaphone/mention → `mention`
  - 📌 Pin/assignment → `assign`
  - 🔔 Bell → default/other
- **Title:** Notification subject title (PR title, issue title, etc.)
- **Subtitle:** Repository full name (`owner/repo`)
- **Accessory:** Relative timestamp (`5 min ago`, `2 hours ago`, `Yesterday`)
- **Keywords:** repo name, reason, subject type (for Raycast search)

**Empty State:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    🎉                                           │
│                                                                 │
│              No notifications                                   │
│              You're all caught up!                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Loading State:**

- Raycast native loading indicator
- Skeleton list items (optional)

**Error State:**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ⚠️                                           │
│                                                                 │
│              Failed to load notifications                       │
│              Check your internet connection                     │
│                                                                 │
│              [Retry]  [Open Preferences]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Status Bar / Subtitle:**

- When listening: `🟢 Listening · 12 notifications · Updated 30s ago`
- When not listening: `⚪ Not listening · 12 notifications`
- When loading: `Loading notifications...`

---

### 2. Notification Detail View

Expanded view when user navigates into a notification (right arrow or enter on detail action).

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ # Fix authentication bug in login flow                         │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ **Repository**                                                  │
│ octocat/hello-world · Private 🔒                               │
│                                                                 │
│ **Reason**                                                      │
│ 🔍 Review Requested                                            │
│                                                                 │
│ **Type**                                                        │
│ Pull Request #142                                               │
│                                                                 │
│ **Updated**                                                     │
│ 5 minutes ago (Jan 10, 2026 at 2:35 PM)                        │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Open in Browser]  [Mark as Done]  [Snooze]  [Copy URL]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Fields:**

- **Title:** Full notification subject title (h1)
- **Repository:** Full name with visibility indicator (🔒 Private / 🌐 Public)
- **Reason:** Human-readable with icon
- **Type:** PR, Issue, Release, Discussion, Commit with number/identifier
- **Timestamps:** Relative + absolute format
- **Author:** If available (avatar + username)

---

### 3. Action Panel

Available actions on notifications (shown in Raycast action panel).

**Primary Actions:**
| Action | Shortcut | Icon | Description |
|--------|----------|------|-------------|
| Open in Browser | `↵` (Enter) | 🌐 | Open notification URL in default browser |
| Mark as Done | `⌘ D` | ✓ | Mark notification as read, remove from inbox |
| Snooze | `⌘ S` | 💤 | Snooze for selected duration |
| Copy URL | `⌘ C` | 📋 | Copy GitHub URL to clipboard |

**Secondary Actions:**
| Action | Shortcut | Icon | Description |
|--------|----------|------|-------------|
| View Details | `→` | 📄 | Show detail view |
| Filter to Repo | `⌘ R` | 🗂️ | Filter inbox to this repository |
| Refresh | `⌘ ⇧ R` | 🔄 | Force refresh notifications |

**Snooze Submenu:**

```
Snooze →
  ├── 30 minutes
  ├── 1 hour
  ├── 3 hours
  ├── Tomorrow morning (9 AM)
  └── Custom...
```

---

### 4. Preferences Screen

Raycast extension preferences (accessed via Raycast preferences).

**Fields:**

| Field                | Type         | Description                                                        | Default    |
| -------------------- | ------------ | ------------------------------------------------------------------ | ---------- |
| GitHub Token         | Password     | Personal Access Token with `notifications`, `repo` scopes          | Required   |
| Polling Interval     | Dropdown     | How often to check for new notifications                           | 60 seconds |
| Notification Reasons | Multi-select | Which reasons to show (review_requested, mention, assign, comment) | All        |
| Native Notifications | Toggle       | Show macOS notifications for new items                             | Enabled    |
| Auto-start Listening | Toggle       | Start polling when Raycast launches                                | Disabled   |

**Polling Interval Options:**

- 30 seconds
- 60 seconds (default)
- 2 minutes
- 5 minutes

---

### 5. Start/Stop Listening Commands

Separate commands to control background polling.

**Start Listening Command:**

- Triggers immediate fetch
- Starts polling interval
- Shows toast: `🟢 Now listening for notifications`
- Updates inbox status indicator

**Stop Listening Command:**

- Stops polling interval
- Shows toast: `⚪ Stopped listening`
- Updates inbox status indicator

---

### 6. Native macOS Notifications

System notifications triggered by polling engine.

**Single Notification:**

```
┌─────────────────────────────────────────────────────────────────┐
│ GitHub · Review Requested                                       │
│                                                                 │
│ Fix authentication bug in login flow                           │
│ octocat/hello-world                                            │
└─────────────────────────────────────────────────────────────────┘
```

**Batch Notification (4+ new):**

```
┌─────────────────────────────────────────────────────────────────┐
│ GitHub Notifications                                            │
│                                                                 │
│ You have 5 new notifications                                   │
│ 3 review requests, 2 mentions                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Notification

```typescript
interface Notification {
  id: string;
  unread: boolean;
  reason: NotificationReason;
  updatedAt: string; // ISO timestamp
  subject: {
    type: "PullRequest" | "Issue" | "Release" | "Discussion" | "Commit";
    title: string;
    url: string; // API URL
    latestCommentUrl: string | null;
  };
  repository: {
    id: number;
    fullName: string; // "owner/repo"
    private: boolean;
    owner: {
      login: string;
      avatarUrl: string;
    };
  };
}

type NotificationReason =
  | "review_requested"
  | "mention"
  | "assign"
  | "comment"
  | "author"
  | "state_change"
  | "subscribed";
```

### Persisted State

```typescript
interface PersistedState {
  // Cache
  notifications: Notification[];
  lastFetchedAt: string | null;

  // Deduplication
  seenNotificationIds: string[];
  notifiedNotificationIds: string[]; // For native notifications

  // User actions
  doneNotificationIds: string[];
  snoozedNotifications: {
    [notificationId: string]: {
      unsnoozeAt: string; // ISO timestamp
      notification: Notification;
    };
  };

  // Preferences state
  lastSelectedFilter: NotificationReason | "all";
  lastSelectedRepository: string | null;
}
```

---

## User Flows

### Flow 1: First-Time Setup

```
1. User installs extension from Raycast Store
2. User opens "GitHub Inbox" command
3. Extension detects missing token
4. Shows error: "GitHub token required" with "Open Preferences" action
5. User opens preferences, enters GitHub PAT
6. User returns to Inbox command
7. Extension validates token, fetches notifications
8. Inbox displays notifications
```

### Flow 2: Daily Usage

```
1. User invokes "Start Listening" command
2. Toast confirms: "🟢 Now listening"
3. Extension polls every 60 seconds
4. New notification arrives → macOS notification appears
5. User clicks notification or opens Inbox
6. User reviews notification, presses Enter to open in browser
7. User presses ⌘D to mark as done
8. Notification removed from inbox
```

### Flow 3: Snooze & Return

```
1. User sees notification they can't handle now
2. User presses ⌘S, selects "1 hour"
3. Toast confirms: "Snoozed for 1 hour"
4. Notification disappears from inbox
5. 1 hour later, polling cycle detects expired snooze
6. Notification reappears in inbox
7. macOS notification: "Snoozed notification is back"
```

---

## Visual Design Guidelines

### Raycast Design System

- Use Raycast's built-in `List`, `Detail`, `Form`, `Action` components
- Follow Raycast's icon system (`Icon.*` from @raycast/api)
- Use semantic colors (success, warning, error)
- Respect system dark/light mode automatically

### Icon Mapping

| Reason           | Raycast Icon          | Color   |
| ---------------- | --------------------- | ------- |
| review_requested | `Icon.Code`           | Blue    |
| mention          | `Icon.AtSymbol`       | Purple  |
| assign           | `Icon.Person`         | Green   |
| comment          | `Icon.Bubble`         | Gray    |
| author           | `Icon.Pencil`         | Orange  |
| state_change     | `Icon.CircleProgress` | Yellow  |
| default          | `Icon.Bell`           | Default |

### Timestamps

- Under 1 minute: "Just now"
- Under 1 hour: "X min ago"
- Under 24 hours: "X hours ago"
- Under 7 days: "X days ago"
- Older: "Jan 10, 2026"

---

## Technical Architecture

### Package Dependencies

```
@github-notifications/raycast
  ├── @github-notifications/core
  │     ├── NotificationService
  │     ├── GitHubAuthProvider (interface)
  │     └── Types (Notification, etc.)
  ├── @github-notifications/storage
  │     └── StorageProvider (interface)
  └── @github-notifications/observability
        └── Tracing helpers
```

### Raycast-Specific Implementations

- `RaycastAuthProvider` — Implements `GitHubAuthProvider` using Raycast preferences
- `RaycastStorageAdapter` — Implements `StorageProvider` using Raycast LocalStorage
- `RaycastNotificationAdapter` — Wraps native notification via Raycast APIs

---

## MVP Scope

### In Scope ✅

- GitHub token configuration in preferences
- Fetch notifications from GitHub API
- Display notifications in list view
- Notification detail view
- Open in browser action
- Mark as done action (local + API)
- Basic snooze functionality
- Background polling with configurable interval
- Native macOS notifications for new items
- Start/Stop listening commands
- Filter by notification reason
- Notification caching and deduplication

### Stretch Goal (Lowest Priority) 🎯

If time permits after core MVP is stable:

**Thread View with Code Context**

Display full PR review comment threads with the code snippet being discussed.

**User Flow:**

```
1. You left a comment on a PR highlighting some code
2. Someone replies to your comment
3. You get a notification
4. In the extension, you see:
   - The code snippet (diff hunk) being discussed
   - Your original comment
   - Their reply
   - Option to reply back
```

**Thread View Layout:**

````
┌─────────────────────────────────────────────────────────────────┐
│ # Fix authentication bug                                        │
│ octocat/hello-world · Pull Request #142                        │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ 📄 src/auth.ts (line 42-45)                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ```typescript                                               │ │
│ │ -  if (user) {                                              │ │
│ │ -    return authenticate(user);                             │ │
│ │ -  }                                                        │ │
│ │ +  if (!user) return null;                                  │ │
│ │ +  return authenticate(user);                               │ │
│ │ ```                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💬 You (2 hours ago):                                          │
│    "Should we use a guard clause here?"                        │
│                                                                 │
│ 💬 octocat (30 min ago):                                       │
│    "Good point, I'll refactor"                                 │
│                                                                 │
│ ─────────────────────────────────────────────────────────────── │
│                                                                 │
│ [Reply]  [Open in GitHub]  [Mark as Done]                      │
└─────────────────────────────────────────────────────────────────┘
````

**Data Requirements:**

- Fetch full comment thread via `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments`
- Filter to comments with same `in_reply_to_id` chain
- Extract `diff_hunk`, `path`, `line` from original comment
- Parse diff hunk for syntax-highlighted code display

**Thread Data Model:**

```typescript
interface CommentThread {
  id: string;
  pullRequestNumber: number;
  path: string; // File path
  line: number;
  diffHunk: string; // Code context
  comments: ThreadComment[];
}

interface ThreadComment {
  id: string;
  author: {
    login: string;
    avatarUrl: string;
  };
  body: string;
  createdAt: string;
  isYou: boolean; // Highlight user's own comments
}
```

### Out of Scope ❌

- Filter by repository (nice-to-have)
- Notification grouping (Phase 6)
- VS Code / Zed extensions (Phase 5)
- Multiple GitHub accounts
- GitHub OAuth flow (PAT only)
- Custom notification sounds
- Keyboard shortcut customization

---

## Success Metrics

- User can configure token and see notifications within 2 minutes
- Inbox loads in under 2 seconds
- New notifications appear within polling interval + 5 seconds
- Zero duplicate native notifications
- All actions respond in under 500ms
