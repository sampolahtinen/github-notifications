import type { Notification, NotificationReason } from "@github-notifications/core";
import { notificationCenter, preparePrebuilds } from "raycast-notifier";
import { getReasonLabel } from "../utils";

/**
 * Threshold for switching from individual to batch notifications
 */
const BATCH_THRESHOLD = 4;

let prebuildsReady = false;

async function ensurePrebuilds(): Promise<void> {
  if (!prebuildsReady) {
    await preparePrebuilds();
    prebuildsReady = true;
  }
}

/**
 * Send native macOS notifications for new GitHub notifications.
 * Shows individual notifications for 1-3 items, or a batch summary for 4+.
 */
export async function sendNativeNotifications(newNotifications: Notification[]): Promise<void> {
  if (newNotifications.length === 0) return;

  await ensurePrebuilds();

  if (newNotifications.length >= BATCH_THRESHOLD) {
    await showBatchNotification(newNotifications);
  } else {
    for (const notification of newNotifications) {
      await showSingleNotification(notification);
    }
  }
}

/**
 * Show a native macOS notification for a single GitHub notification
 */
async function showSingleNotification(notification: Notification): Promise<void> {
  const reason = getReasonLabel(notification.reason);

  await notificationCenter({
    title: `GitHub - ${reason}`,
    subtitle: notification.repository.fullName,
    message: notification.subject.title,
    sound: "default",
  });
}

/**
 * Show a batch native macOS notification when 4+ new notifications arrive
 */
async function showBatchNotification(notifications: Notification[]): Promise<void> {
  const count = notifications.length;
  const summary = buildBatchSummary(notifications);

  await notificationCenter({
    title: "GitHub Notifications",
    subtitle: `${count} new notifications`,
    message: summary,
    sound: "default",
  });
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
