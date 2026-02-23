import { useState, useMemo } from "react";
import { List, ActionPanel, Action, Icon, Color, openExtensionPreferences } from "@raycast/api";
import type { ReviewThread } from "@github-notifications/core";
import { useReviewThreads } from "../hooks/useReviewThreads";
import { formatRelativeTime } from "../utils";
import { sortThreads } from "../utils/sort-threads";
import { ThreadDetail } from "./thread-detail";

interface ThreadListProps {
  owner: string;
  repo: string;
  prNumber: number;
}

type ThreadFilter = "all" | "unresolved" | "resolved";

const FILTER_OPTIONS: { value: ThreadFilter; title: string }[] = [
  { value: "all", title: "All Threads" },
  { value: "unresolved", title: "Unresolved" },
  { value: "resolved", title: "Resolved" },
];

function getStatusTag(thread: ReviewThread): { value: string; color: Color } {
  if (thread.isOutdated) {
    return { value: "Outdated", color: Color.SecondaryText };
  }
  if (thread.isResolved) {
    return { value: "Resolved", color: Color.Green };
  }
  return { value: "Unresolved", color: Color.Orange };
}

function getFirstCommentPreview(thread: ReviewThread): string {
  const firstComment = thread.comments[0];
  if (!firstComment) {
    return "";
  }
  const body = firstComment.body.replace(/\n/g, " ").trim();
  return body.length > 80 ? `${body.slice(0, 80)}...` : body;
}

export function ThreadList({ owner, repo, prNumber }: ThreadListProps) {
  const { prDetail, isLoading, error, refresh, replyToThread } = useReviewThreads({
    owner,
    repo,
    prNumber,
  });

  const [filter, setFilter] = useState<ThreadFilter>("all");

  const threads = useMemo(() => {
    if (!prDetail) {
      return [];
    }
    const filtered = prDetail.reviewThreads.filter((thread) => {
      if (filter === "unresolved") return !thread.isResolved;
      if (filter === "resolved") return thread.isResolved;
      return true;
    });
    return sortThreads(filtered);
  }, [prDetail, filter]);

  const unresolvedCount = prDetail ? prDetail.reviewThreads.filter((t) => !t.isResolved).length : 0;

  const subtitle = prDetail
    ? `${threads.length} threads · ${unresolvedCount} unresolved`
    : undefined;

  if (error) {
    return (
      <List>
        <List.EmptyView
          icon={{ source: Icon.Warning, tintColor: Color.Red }}
          title="Failed to load review threads"
          description="Check your internet connection or GitHub token"
          actions={
            <ActionPanel>
              <Action title="Retry" icon={Icon.RotateClockwise} onAction={refresh} />
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
      navigationTitle={prDetail ? prDetail.title : "Review Threads"}
      searchBarPlaceholder="Search threads..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by status"
          value={filter}
          onChange={(value) => setFilter(value as ThreadFilter)}
        >
          {FILTER_OPTIONS.map((option) => (
            <List.Dropdown.Item key={option.value} title={option.title} value={option.value} />
          ))}
        </List.Dropdown>
      }
    >
      {threads.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.CheckCircle}
          title="No review threads"
          description={
            filter !== "all"
              ? "No threads match the current filter"
              : "This PR has no review threads"
          }
        />
      ) : (
        <List.Section title="Review Threads" subtitle={subtitle}>
          {threads.map((thread) => {
            const statusTag = getStatusTag(thread);
            const firstComment = thread.comments[0];
            const lastComment = thread.comments[thread.comments.length - 1];
            const timestamp = lastComment?.createdAt ?? firstComment?.createdAt;

            return (
              <List.Item
                key={thread.id}
                icon={
                  thread.isResolved
                    ? { source: Icon.CheckCircle, tintColor: Color.Green }
                    : { source: Icon.ExclamationMark, tintColor: Color.Orange }
                }
                title={`${thread.path}:${thread.line}`}
                subtitle={getFirstCommentPreview(thread)}
                accessories={[
                  {
                    text: `${thread.comments.length}`,
                    icon: Icon.Bubble,
                    tooltip: `${thread.comments.length} comment${thread.comments.length === 1 ? "" : "s"}`,
                  },
                  ...(timestamp
                    ? [
                        {
                          text: formatRelativeTime(timestamp),
                          tooltip: new Date(timestamp).toLocaleString(),
                        },
                      ]
                    : []),
                  { tag: statusTag },
                ]}
                keywords={[
                  thread.path,
                  ...(firstComment ? [firstComment.author.login, firstComment.body] : []),
                ]}
                actions={
                  <ActionPanel>
                    <ActionPanel.Section>
                      <Action.Push
                        title="View Thread"
                        icon={Icon.Eye}
                        target={
                          <ThreadDetail
                            thread={thread}
                            prDetail={prDetail}
                            onRefresh={refresh}
                            onReply={replyToThread}
                          />
                        }
                      />
                      {prDetail && (
                        <Action.OpenInBrowser title="Open PR in Browser" url={prDetail.url} />
                      )}
                    </ActionPanel.Section>
                    <ActionPanel.Section>
                      <Action.CopyToClipboard
                        title="Copy File Path"
                        content={thread.path}
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
