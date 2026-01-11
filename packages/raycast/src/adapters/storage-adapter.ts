import { LocalStorage } from "@raycast/api";
import type { StorageProvider } from "@github-notifications/core";

/**
 * Raycast implementation of StorageProvider
 * Uses Raycast LocalStorage for persistence
 */
const LOG_PREFIX = "raycast.storage_adapter";

export class RaycastStorageAdapter implements StorageProvider {
  async get<T>(key: string): Promise<T | null> {
    const value = await LocalStorage.getItem<string>(key);
    if (!value) {
      console.debug(`${LOG_PREFIX}.get: cache miss`, { key });
      return null;
    }
    try {
      console.debug(`${LOG_PREFIX}.get: cache hit`, { key });
      return JSON.parse(value) as T;
    } catch {
      console.error(`${LOG_PREFIX}.get: failed to parse cached value`, { key });
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await LocalStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    await LocalStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await LocalStorage.clear();
  }
}
