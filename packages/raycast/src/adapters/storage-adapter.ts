import { LocalStorage } from "@raycast/api";
import type { StorageProvider } from "@github-notifications/core";

/**
 * Raycast implementation of StorageProvider
 * Uses Raycast LocalStorage for persistence
 */
export class RaycastStorageAdapter implements StorageProvider {
  async get<T>(key: string): Promise<T | null> {
    const value = await LocalStorage.getItem<string>(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
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
