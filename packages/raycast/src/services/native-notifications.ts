import { showHUD } from "@raycast/api";
import type { Notification, NotificationReason } from "@github-notifications/core";
import { getReasonLabel } from "../utils";

/**
 * Threshold for switching from individual to batch notifications
 */
const BATCH_THRESHOLD = 4;

/**
 * Send native macOS notifications for new GitHub notifications.
 * Shows individual notifications for 1-3 items, or a batch summary for 4+.
 */
export async function sendNativeNotifications(newNotifications: Notification[]): Promise<void> {
  if (newNotifications.length === 0) return;

  if (newNotifications.length >= BATCH_THRESHOLD) {
    await showBatchNotification(newNotifications);
  } else {
    for (const notification of newNotifications) {
      await showSingleNotification(notification);
    }
  }
}

/**
 * Show a native notification for a single GitHub notification
 */
async function showSingleNotification(notification: Notification): Promise<void> {
  const reason = getReasonLabel(notification.reason);
  const title = `GitHub - ${reason}`;
  const body = `${notification.subject.title}\n${notification.repository.fullName}`;

  await showHUD(`${title}: ${body}`);
}

/**
 * Show a batch native notification when 4+ new notifications arrive
 */
async function showBatchNotification(notifications: Notification[]): Promise<void> {
  const count = notifications.length;
  const summary = buildBatchSummary(notifications);

  await showHUD(`GitHub Notifications: You have ${count} new notifications - ${summary}`);
}

/**
 * Build a human-readable summary of notification reasons for batch display.
 * Example: "3 review requests, 2 mentions"
 */
function buildBatchSummary(notifications: Notification[]): string {
  const reasonCounts = new Map<NotificationReason, number>();

  for (const n of notifications) {
    const current = reasonCounts.get(n.reason) ?? 0;
    reasonCounts.set(n.reason, current + 1);
  }

  const parts: string[] = [];
  for (const [reason, count] of reasonCounts) {
    parts.push(`${count} ${getReasonPluralLabel(reason, count)}`);
  }

  return parts.join(", ");
}

/**
 * Get a pluralized label for a notification reason
 */
function getReasonPluralLabel(reason: NotificationReason, count: number): string {
  const singular: Record<NotificationReason, string> = {
    review_requested: "review request",
    mention: "mention",
    assign: "assignment",
    comment: "comment",
    author: "author update",
    state_change: "state change",
    subscribed: "subscription",
  };

  const label = singular[reason] ?? reason;
  return count === 1 ? label : `${label}s`;
}
