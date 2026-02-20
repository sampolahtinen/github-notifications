import { getPreferenceValues } from "@raycast/api";
import type { GitHubAuthProvider } from "@github-notifications/core";

interface Preferences {
  githubToken: string;
}

/**
 * Raycast implementation of GitHubAuthProvider
 * Uses Raycast preferences for token storage
 */
export class RaycastAuthProvider implements GitHubAuthProvider {
  async getToken(): Promise<string | null> {
    const preferences = getPreferenceValues<Preferences>();
    return preferences.githubToken || null;
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
