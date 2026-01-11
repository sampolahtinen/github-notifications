import { showHUD } from "@raycast/api";
import type {
  NotificationDisplayProvider,
  NotificationOptions,
} from "@github-notifications/core";

/**
 * Raycast implementation of NotificationDisplayProvider
 * Uses Raycast HUD for notifications (native macOS notifications via Raycast)
 */
export class RaycastNotificationAdapter implements NotificationDisplayProvider {
  async showNotification(
    title: string,
    body: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: NotificationOptions
  ): Promise<void> {
    await showHUD(`${title}: ${body}`);
  }

  async showBatchNotification(count: number, summary: string): Promise<void> {
    await showHUD(`${count} new notifications: ${summary}`);
  }
}
