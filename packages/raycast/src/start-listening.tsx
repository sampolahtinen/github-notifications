import { showToast, Toast, getPreferenceValues, LaunchType, launchCommand } from "@raycast/api";
import { NotificationService, type Notification } from "@github-notifications/core";
import { RaycastAuthProvider, RaycastStorageAdapter } from "./adapters";
import { markListeningStarted } from "./services/polling-state";
import { sendNativeNotifications } from "./services/native-notifications";

interface Preferences {
  nativeNotifications: boolean;
}

/**
 * "Start Listening" command: triggers an immediate fetch, marks listening as active,
 * and starts polling. Since Raycast "no-view" commands run as one-shot scripts,
 * the actual polling loop happens inside the inbox command. This command
 * marks the listening state and performs the initial fetch + notification.
 */
export default async function Command() {
  const service = new NotificationService(new RaycastAuthProvider(), new RaycastStorageAdapter());

  await markListeningStarted();

  await showToast({
    style: Toast.Style.Animated,
    title: "Starting...",
    message: "Fetching notifications",
  });

  const result = await service.fetch({ includeRead: false });

  if (result.ok) {
    const fetched = result.value;
    const state = await service.getState();

    const previousIds = new Set(state.seenNotificationIds);
    const newNotifications = fetched.filter((n) => !previousIds.has(n.id));

    state.notifications = fetched;
    state.lastFetchedAt = new Date().toISOString();
    state.seenNotificationIds = Array.from(
      new Set([...state.seenNotificationIds, ...fetched.map((n) => n.id)]),
    );

    const preferences = getPreferenceValues<Preferences>();
    if (preferences.nativeNotifications && newNotifications.length > 0) {
      const unnotified = newNotifications.filter(
        (n) => !state.notifiedNotificationIds.includes(n.id),
      );
      if (unnotified.length > 0) {
        await sendNativeNotifications(unnotified);
        state.notifiedNotificationIds = [
          ...state.notifiedNotificationIds,
          ...unnotified.map((n: Notification) => n.id),
        ];
      }
    }

    await service.saveState(state);

    await showToast({
      style: Toast.Style.Success,
      title: "Now listening for notifications",
      message: `${fetched.length} notifications loaded`,
    });
  } else {
    await showToast({
      style: Toast.Style.Failure,
      title: "Failed to fetch notifications",
      message: result.error.message,
    });
  }

  try {
    await launchCommand({
      name: "inbox",
      type: LaunchType.Background,
    });
  } catch {
    // Inbox may not support background launch; this is non-critical
  }
}
