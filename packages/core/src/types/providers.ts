/**
 * Interface for GitHub authentication token management
 */
export interface GitHubAuthProvider {
  getToken(): Promise<string | null>;
  validateToken(token: string): Promise<boolean>;
}

/**
 * Interface for persistent storage
 */
export interface StorageProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Interface for native notification display
 */
export interface NotificationDisplayProvider {
  showNotification(title: string, body: string, options?: NotificationOptions): Promise<void>;
  showBatchNotification(count: number, summary: string): Promise<void>;
}

/**
 * Options for native notifications
 */
export interface NotificationOptions {
  subtitle?: string;
  sound?: boolean;
}
