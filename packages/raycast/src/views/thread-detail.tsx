import { useState } from "react";
import {
  Detail,
  ActionPanel,
  Action,
  Icon,
  Color,
  Form,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import type { ReviewThread, PullRequestDetail } from "@github-notifications/core";
import { formatRelativeTime, parseDiffHunk } from "../utils";

interface ThreadDetailProps {
  thread: ReviewThread;
  prDetail: PullRequestDetail | null;
  onRefresh: () => void;
  onReply: (threadId: string, body: string) => Promise<void>;
}

function formatDiffHunkMarkdown(diffHunk: string): string {
  if (!diffHunk) {
    return "";
  }

  const lines = parseDiffHunk(diffHunk);
  if (lines.length === 0) {
    return "";
  }

  const diffLines = lines.map((line) => {
    const prefix = line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
    return `${prefix}${line.content}`;
  });

  return `\`\`\`diff\n${diffLines.join("\n")}\n\`\`\``;
}

function buildMarkdownContent(thread: ReviewThread, prDetail: PullRequestDetail | null): string {
  const sections: string[] = [];

  const title = prDetail ? `# ${prDetail.title}` : "# Review Thread";
  sections.push(title);

  sections.push(`### ${thread.path}:${thread.line}`);

  const diffBlock = formatDiffHunkMarkdown(thread.diffHunk);
  if (diffBlock) {
    sections.push(diffBlock);
  }

  sections.push("---");
  sections.push("## Comments");

  for (const comment of thread.comments) {
    const timestamp = formatRelativeTime(comment.createdAt);
    sections.push(`**${comment.author.login}** · ${timestamp}\n\n${comment.body}`);
  }

  return sections.join("\n\n");
}

function getStatusColor(thread: ReviewThread): Color {
  if (thread.isOutdated) return Color.SecondaryText;
  if (thread.isResolved) return Color.Green;
  return Color.Orange;
}

function getStatusLabel(thread: ReviewThread): string {
  if (thread.isOutdated) return "Outdated";
  if (thread.isResolved) return "Resolved";
  return "Unresolved";
}

interface ReplyFormProps {
  threadId: string;
  onReply: (threadId: string, body: string) => Promise<void>;
}

function ReplyForm({ threadId, onReply }: ReplyFormProps) {
  const { pop } = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: { body: string }) {
    if (!values.body.trim()) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Reply cannot be empty",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReply(threadId, values.body);
      pop();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      navigationTitle="Reply to Thread"
      isLoading={isSubmitting}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Post Reply" icon={Icon.Message} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="body" title="Reply" placeholder="Write your reply..." enableMarkdown />
    </Form>
  );
}

export function ThreadDetail({ thread, prDetail, onRefresh, onReply }: ThreadDetailProps) {
  const markdown = buildMarkdownContent(thread, prDetail);

  return (
    <Detail
      navigationTitle={`${thread.path}:${thread.line}`}
      markdown={markdown}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="File" text={thread.path} />
          <Detail.Metadata.Label title="Line" text={String(thread.line)} />
          <Detail.Metadata.Label title="Side" text={thread.diffSide} />
          <Detail.Metadata.Separator />
          <Detail.Metadata.TagList title="Status">
            <Detail.Metadata.TagList.Item
              text={getStatusLabel(thread)}
              color={getStatusColor(thread)}
            />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label title="Comments" text={String(thread.comments.length)} />
          {prDetail && <Detail.Metadata.Label title="PR State" text={prDetail.state} />}
          {prDetail && (
            <Detail.Metadata.Link
              title="Pull Request"
              text={prDetail.title}
              target={prDetail.url}
            />
          )}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Push
              title="Reply to Thread"
              icon={Icon.Message}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
              target={<ReplyForm threadId={thread.id} onReply={onReply} />}
            />
            {prDetail && <Action.OpenInBrowser title="Open PR in Browser" url={prDetail.url} />}
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
              onAction={onRefresh}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
