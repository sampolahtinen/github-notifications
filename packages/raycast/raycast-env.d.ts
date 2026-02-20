/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** GitHub Token - Personal Access Token with 'notifications' and 'repo' scopes */
  "githubToken": string,
  /** Polling Interval - How often to check for new notifications */
  "pollingInterval": "30" | "60" | "120" | "300",
  /** Native Notifications - Show macOS notifications for new items */
  "nativeNotifications": boolean,
  /** Auto-start Listening - Start polling when Raycast launches */
  "autoStartListening": boolean,
  /** Show Read Notifications - Include already read notifications in the list */
  "showReadNotifications": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `inbox` command */
  export type Inbox = ExtensionPreferences & {}
  /** Preferences accessible in the `start-listening` command */
  export type StartListening = ExtensionPreferences & {}
  /** Preferences accessible in the `stop-listening` command */
  export type StopListening = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `inbox` command */
  export type Inbox = {}
  /** Arguments passed to the `start-listening` command */
  export type StartListening = {}
  /** Arguments passed to the `stop-listening` command */
  export type StopListening = {}
}

