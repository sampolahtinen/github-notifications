import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  openExtensionPreferences,
} from "@raycast/api";
import type { NotificationReason } from "@github-notifications/core";
import { useNotifications } from "./hooks/useNotifications";
import { formatRelativeTime, getReasonIcon, getReasonLabel, parsePRFromNotification } from "./utils";
import { ThreadList } from "./views/thread-list";

const REASON_OPTIONS: { value: NotificationReason | "all"; title: string }[] = [
  { value: "all", title: "All Notifications" },
  { value: "review_requested", title: "Review Requested" },
  { value: "mention", title: "Mentions" },
  { value: "assign", title: "Assigned" },
  { value: "comment", title: "Comments" },
  { value: "author", title: "Author" },
  { value: "state_change", title: "State Changes" },
  { value: "subscribed", title: "Subscribed" },
];

export default function Command() {
  const {
    notifications,
    allNotifications,
    isLoading,
    error,
    refresh,
    markAsDone,
    filterReason,
    setFilterReason,
    filterRepository,
    setFilterRepository,
    showReadNotifications,
    toggleShowReadNotifications,
    lastUpdated,
  } = useNotifications();

  // Dedupe repositories for filter menu (use all notifications, not filtered)
  const repositories = Array.from(
    new Map(
      allNotifications.map((n) => [n.repository.id, n.repository])
    ).values()
  );

  // Get active repo name for display
  const activeRepoName =
    filterRepository !== "all"
      ? repositories.find((r) => r.id === Number(filterRepository))?.fullName
      : null;

  const subtitle = lastUpdated
    ? `${notifications.length} notifications · Updated ${formatRelativeTime(lastUpdated.toISOString())}`
    : `${notifications.length} notifications`;

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
          title="Failed to load notifications"
          description="Check your internet connection or GitHub token"
          actions={
            <ActionPanel>
              <Action
                title="Retry"
                icon={Icon.RotateClockwise}
                onAction={refresh}
              />
              <Action
                title="Open Preferences"
                icon={Icon.Gear}
                onAction={openExtensionPreferences}
              />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      navigationTitle={activeRepoName ? `📁 ${activeRepoName}` : "GitHub Inbox"}
      searchBarPlaceholder="Search notifications..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by reason"
          value={filterReason}
          onChange={(value) =>
            setFilterReason(value as NotificationReason | "all")
          }
        >
          {REASON_OPTIONS.map((option) => (
            <List.Dropdown.Item
              key={option.value}
              title={option.title}
              value={option.value}
            />
          ))}
        </List.Dropdown>
      }
    >
      {notifications.length === 0 && !isLoading ? (
        <List.EmptyView
          icon="🎉"
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <List.Section title="Notifications" subtitle={subtitle}>
          {notifications.map((notification) => {
            const { icon, color } = getReasonIcon(notification.reason);
            const browserUrl = notification.subject.url
              ? notification.subject.url
                  .replace("api.github.com/repos", "github.com")
                  .replace("/pulls/", "/pull/")
              : `https://github.com/${notification.repository.fullName}`;
            const prIdentifier = parsePRFromNotification(notification);

            return (
              <List.Item
                key={notification.id}
                icon={{ source: icon, tintColor: color }}
                title={notification.subject.title}
                subtitle={notification.repository.fullName}
                accessories={[
                  {
                    text: formatRelativeTime(notification.updatedAt),
                    tooltip: new Date(notification.updatedAt).toLocaleString(),
                  },
                  {
                    tag: {
                      value: notification.unread ? "Unread" : "Read",
                      color: notification.unread
                        ? Color.Blue
                        : Color.SecondaryText,
                    },
                  },
                  {
                    tag: {
                      value: getReasonLabel(notification.reason),
                      color,
                    },
                  },
                ]}
                keywords={[
                  notification.repository.fullName,
                  notification.reason,
                  notification.subject.type,
                ]}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section>
                      <Action.OpenInBrowser
                        title="Open in Browser"
                        url={browserUrl}
                      />
                      {prIdentifier && (
                        <Action.Push
                          title="View Review Threads"
                          icon={Icon.Bubble}
                          shortcut={{ modifiers: ["cmd"], key: "t" }}
                          target={
                            <ThreadList
                              owner={prIdentifier.owner}
                              repo={prIdentifier.repo}
                              prNumber={prIdentifier.prNumber}
                            />
                          }
                        />
                      )}
                      <Action
                        title="Mark as Done"
                        icon={Icon.Checkmark}
                        shortcut={{ modifiers: ["cmd"], key: "d" }}
                        onAction={() => markAsDone(notification.id)}
                      />
                    </ActionPanel.Section>
                    <ActionPanel.Section title="Filter">
                      <ActionPanel.Submenu
                        title="Filter by Repository"
                        icon={Icon.Filter}
                        shortcut={{ modifiers: ["cmd"], key: "f" }}
                      >
                        <Action
                          title="All Repositories"
                          icon={
                            filterRepository === "all"
                              ? Icon.Checkmark
                              : Icon.Circle
                          }
                          onAction={() => setFilterRepository("all")}
                        />
                        {repositories.map((repo) => (
                          <Action
                            key={repo.id}
                            title={repo.fullName}
                            icon={
                              filterRepository === String(repo.id)
                                ? Icon.Checkmark
                                : Icon.Circle
                            }
                            onAction={() =>
                              setFilterRepository(String(repo.id))
                            }
                          />
                        ))}
                      </ActionPanel.Submenu>
                      {filterRepository !== "all" && (
                        <Action
                          title="Clear Repository Filter"
                          icon={Icon.XMarkCircle}
                          shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
                          onAction={() => setFilterRepository("all")}
                        />
                      )}
                    </ActionPanel.Section>
                    <ActionPanel.Section>
                      <Action
                        title={
                          showReadNotifications
                            ? "Hide Read Notifications"
                            : "Show Read Notifications"
                        }
                        icon={
                          showReadNotifications ? Icon.EyeDisabled : Icon.Eye
                        }
                        shortcut={{ modifiers: ["cmd"], key: "r" }}
                        onAction={toggleShowReadNotifications}
                      />
                      <Action.CopyToClipboard
                        title="Copy URL"
                        content={browserUrl}
                        shortcut={{ modifiers: ["cmd"], key: "c" }}
                      />
                      <Action
                        title="Refresh"
                        icon={Icon.RotateClockwise}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                        onAction={refresh}
                      />
                    </ActionPanel.Section>
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
