import {
  type Failure,
  type Result,
  authFailure,
  err,
  failureFromStatus,
  networkFailure,
  ok,
  rateLimitFailure,
} from "../result";
import type { GitHubAuthProvider, Notification, PersistedState, StorageProvider } from "../types";
import { DEFAULT_PERSISTED_STATE } from "../types";

const STORAGE_KEY = "github-notifications-state";
const LOG_PREFIX = "core.notification_service";

/**
 * Service for managing GitHub notifications
 */
export class NotificationService {
  constructor(
    private authProvider: GitHubAuthProvider,
    private storageProvider: StorageProvider,
  ) {}

  /**
   * Fetch notifications from GitHub API
   * @param options.includeRead - If true, includes already read notifications
   */
  async fetch(options?: {
    includeRead?: boolean;
  }): Promise<Result<Notification[]>> {
    const includeRead = options?.includeRead ?? false;
    const token = await this.authProvider.getToken();
    if (!token) {
      console.error(`${LOG_PREFIX}.fetch: no token configured`);
      return err(authFailure());
    }

    let response: Response;
    try {
      const url = includeRead
        ? "https://api.github.com/notifications?all=true"
        : "https://api.github.com/notifications";
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
    } catch (cause) {
      console.error(`${LOG_PREFIX}.fetch: network error`, cause);
      return err(networkFailure(cause));
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error(`${LOG_PREFIX}.fetch: invalid token (401)`);
        return err(authFailure("Invalid GitHub token"));
      }
      if (response.status === 403) {
        console.error(`${LOG_PREFIX}.fetch: forbidden (403)`);
        return err({
          code: "FORBIDDEN",
          message: "Access forbidden. Check token permissions.",
        } as Failure);
      }
      if (response.status === 429) {
        const rateLimitReset = response.headers.get("X-RateLimit-Reset");
        const resetAt = rateLimitReset
          ? new Date(Number(rateLimitReset) * 1000).toISOString()
          : undefined;
        console.error(`${LOG_PREFIX}.fetch: rate limited (429)`, { resetAt });
        return err(rateLimitFailure(resetAt));
      }
      console.error(`${LOG_PREFIX}.fetch: API error`, {
        status: response.status,
      });
      return err(failureFromStatus(response.status, `GitHub API error: ${response.status}`));
    }

    const data = await response.json();
    console.info(`${LOG_PREFIX}.fetch: fetched ${data.length} notifications`);
    return ok(this.transformNotifications(data));
  }

  /**
   * Mark a notification as done (read)
   */
  async markAsDone(notificationId: string): Promise<Result<void>> {
    const token = await this.authProvider.getToken();
    if (!token) {
      console.error(`${LOG_PREFIX}.markAsDone: no token configured`);
      return err(authFailure());
    }

    let response: Response;
    try {
      response = await fetch(`https://api.github.com/notifications/threads/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
    } catch (cause) {
      console.error(`${LOG_PREFIX}.markAsDone: network error`, { notificationId }, cause);
      return err(networkFailure(cause));
    }

    if (!response.ok && response.status !== 205) {
      console.error(`${LOG_PREFIX}.markAsDone: API error`, {
        notificationId,
        status: response.status,
      });
      return err(
        failureFromStatus(
          response.status,
          `Failed to mark notification as done: ${response.status}`,
        ),
      );
    }

    const state = await this.getState();
    state.doneNotificationIds.push(notificationId);
    state.notifications = state.notifications.filter((n) => n.id !== notificationId);
    await this.saveState(state);
    return ok(undefined);
  }

  /**
   * Snooze a notification until a specified time
   */
  async snooze(notificationId: string, unsnoozeAt: Date): Promise<Result<void>> {
    const state = await this.getState();
    const notification = state.notifications.find((n) => n.id === notificationId);

    if (!notification) {
      console.error(`${LOG_PREFIX}.snooze: notification not found`, {
        notificationId,
      });
      return err({
        code: "NOT_FOUND",
        message: "Notification not found",
      } as Failure);
    }

    state.snoozedNotifications[notificationId] = {
      unsnoozeAt: unsnoozeAt.toISOString(),
      notification,
    };
    state.notifications = state.notifications.filter((n) => n.id !== notificationId);
    await this.saveState(state);
    return ok(undefined);
  }

  /**
   * Get persisted state from storage
   */
  async getState(): Promise<PersistedState> {
    const state = await this.storageProvider.get<PersistedState>(STORAGE_KEY);
    return state ?? { ...DEFAULT_PERSISTED_STATE };
  }

  /**
   * Save state to storage
   */
  async saveState(state: PersistedState): Promise<void> {
    await this.storageProvider.set(STORAGE_KEY, state);
  }

  /**
   * Transform GitHub API response to internal Notification type
   */
  private transformNotifications(data: GitHubNotificationResponse[]): Notification[] {
    return data.map((item) => ({
      id: item.id,
      unread: item.unread,
      reason: item.reason as Notification["reason"],
      updatedAt: item.updated_at,
      subject: {
        type: item.subject.type as Notification["subject"]["type"],
        title: item.subject.title,
        url: item.subject.url,
        latestCommentUrl: item.subject.latest_comment_url,
      },
      repository: {
        id: item.repository.id,
        fullName: item.repository.full_name,
        private: item.repository.private,
        owner: {
          login: item.repository.owner.login,
          avatarUrl: item.repository.owner.avatar_url,
        },
      },
    }));
  }
}

/**
 * GitHub API notification response shape
 */
interface GitHubNotificationResponse {
  id: string;
  unread: boolean;
  reason: string;
  updated_at: string;
  subject: {
    type: string;
    title: string;
    url: string;
    latest_comment_url: string | null;
  };
  repository: {
    id: number;
    full_name: string;
    private: boolean;
    owner: {
      login: string;
      avatar_url: string;
    };
  };
}
