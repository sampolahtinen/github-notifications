import type { Notification, NotificationReason } from "./notification";

/**
 * Snoozed notification with unsnooze timestamp
 */
export interface SnoozedNotification {
  unsnoozeAt: string;
  notification: Notification;
}

/**
 * Persisted state for caching, deduplication, and user actions
 */
export interface PersistedState {
  notifications: Notification[];
  lastFetchedAt: string | null;

  seenNotificationIds: string[];
  notifiedNotificationIds: string[];

  doneNotificationIds: string[];
  snoozedNotifications: Record<string, SnoozedNotification>;

  lastSelectedFilter: NotificationReason | "all";
  lastSelectedRepository: string | null;
}

/**
 * Default empty persisted state
 */
export const DEFAULT_PERSISTED_STATE: PersistedState = {
  notifications: [],
  lastFetchedAt: null,
  seenNotificationIds: [],
  notifiedNotificationIds: [],
  doneNotificationIds: [],
  snoozedNotifications: {},
  lastSelectedFilter: "all",
  lastSelectedRepository: null,
};
