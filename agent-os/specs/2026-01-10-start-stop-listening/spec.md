# Specification: Start/Stop Listening Commands

## Goal

Add commands to start and stop the background polling loop with visual status indicator, giving users control over when the extension actively monitors for new GitHub notifications.

## User Stories

- As a user, I want to start listening for notifications so that I receive real-time updates
- As a user, I want to stop listening so that I can pause notifications when I need focus time
- As a user, I want to see the current listening status so that I know if monitoring is active

## Specific Requirements

**Start Listening Command**
- Create `Start Listening` command in `@github-notifications/raycast` package
- Trigger immediate notification fetch on start
- Start the polling engine with configured interval
- Show confirmation toast: "Now listening for notifications"
- Prevent starting if already listening (show "Already listening" message)

**Stop Listening Command**
- Create `Stop Listening` command in `@github-notifications/raycast` package
- Stop the polling engine and clear interval
- Show confirmation toast: "Stopped listening"
- Prevent stopping if not currently listening (show "Not currently listening" message)

**Listening State Management**
- Track listening state in memory (not persisted across Raycast restarts)
- Expose `isListening()` method from `PollingService`
- Initialize as not listening on extension load
- Clean up polling on extension unload/deactivation

**Status Indicator**
- Show listening status in Inbox command subtitle or accessory
- Visual indicator: "🟢 Listening" or "⚪ Not listening"
- Update status reactively when state changes
- Include last poll timestamp if listening: "🟢 Listening · Updated 30s ago"

**Menu Bar Integration (Optional)**
- Consider Raycast menu bar extra for persistent status
- Show current listening state in menu bar
- Quick toggle start/stop from menu bar
- Display notification count badge

**Keyboard Shortcuts**
- Cmd+Shift+L: Toggle listening state from any command
- Show shortcut in action panel
- Accessible from Inbox command actions

**Auto-Start Preference**
- Add preference: "Start listening on Raycast launch"
- Default: disabled (user must explicitly start)
- If enabled, start polling when extension activates

## Visual Design

To be added during grooming — menu bar icon and status indicators.

## Existing Code to Leverage

- `PollingService` from polling-engine spec
- Raycast command and toast APIs
- Raycast menu bar extra API (if using menu bar)

## Out of Scope

- Auto-start on system login (Raycast limitation)
- Scheduled listening windows (e.g., only during work hours)
- Per-repository listening toggles
- Listening status sync across devices
- Background listening when Raycast is fully closed
