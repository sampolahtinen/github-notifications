import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getPreferenceValues, showToast, Toast } from "@raycast/api";
import { NotificationService, type Notification, type Failure } from "@github-notifications/core";
import { RaycastAuthProvider, RaycastStorageAdapter } from "../adapters";
import { sendNativeNotifications } from "../services/native-notifications";

const LOG_PREFIX = "raycast.use_polling";

/**
 * Maximum number of consecutive errors before stopping retries
 */
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Base delay for exponential backoff (in ms)
 */
const BASE_BACKOFF_DELAY_MS = 5000;

interface UsePollingResult {
  notifications: Notification[];
  isListening: boolean;
  isLoading: boolean;
  error: Failure | null;
  lastUpdated: Date | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  refresh: () => Promise<void>;
}

interface PollingPreferences {
  pollingInterval: string;
  nativeNotifications: boolean;
}

export function usePolling(): UsePollingResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Failure | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const consecutiveErrorsRef = useRef(0);
  const isFirstFetchRef = useRef(true);

  const service = useMemo(() => {
    const authProvider = new RaycastAuthProvider();
    const storageAdapter = new RaycastStorageAdapter();
    return new NotificationService(authProvider, storageAdapter);
  }, []);

  /**
   * Initialize seen and notified IDs from persisted state
   */
  const initializeFromState = useCallback(async () => {
    const state = await service.getState();
    for (const id of state.seenNotificationIds) {
      seenIdsRef.current.add(id);
    }
    for (const id of state.notifiedNotificationIds) {
      notifiedIdsRef.current.add(id);
    }
    if (state.notifications.length > 0) {
      setNotifications(state.notifications);
    }
    if (state.lastFetchedAt) {
      setLastUpdated(new Date(state.lastFetchedAt));
    }
  }, [service]);

  /**
   * Perform a single poll: fetch, deduplicate, detect new, cache, notify
   */
  const poll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await service.fetch({ includeRead: false });

    if (!result.ok) {
      consecutiveErrorsRef.current += 1;
      const errorCount = consecutiveErrorsRef.current;
      console.error(`${LOG_PREFIX}.poll: fetch failed (attempt ${errorCount})`, result.error);

      setError(result.error);
      setIsLoading(false);

      if (errorCount >= MAX_CONSECUTIVE_ERRORS) {
        console.error(`${LOG_PREFIX}.poll: max retries reached, stopping`);
        await showToast({
          style: Toast.Style.Failure,
          title: "Polling stopped",
          message: "Too many consecutive errors. Use Start Listening to resume.",
        });
        return "stop" as const;
      }

      await showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch notifications",
        message: `Retrying... (${errorCount}/${MAX_CONSECUTIVE_ERRORS})`,
      });
      return "retry" as const;
    }

    consecutiveErrorsRef.current = 0;
    const fetched = result.value;

    const newNotifications = fetched.filter((n) => !seenIdsRef.current.has(n.id));

    for (const n of fetched) {
      seenIdsRef.current.add(n.id);
    }

    setNotifications(fetched);
    setLastUpdated(new Date());

    const state = await service.getState();
    state.notifications = fetched;
    state.lastFetchedAt = new Date().toISOString();
    state.seenNotificationIds = Array.from(seenIdsRef.current);
    state.notifiedNotificationIds = Array.from(notifiedIdsRef.current);
    await service.saveState(state);

    if (!isFirstFetchRef.current && newNotifications.length > 0) {
      const preferences = getPreferenceValues<PollingPreferences>();
      if (preferences.nativeNotifications) {
        const unnotifiedNew = newNotifications.filter((n) => !notifiedIdsRef.current.has(n.id));

        if (unnotifiedNew.length > 0) {
          await sendNativeNotifications(unnotifiedNew);
          for (const n of unnotifiedNew) {
            notifiedIdsRef.current.add(n.id);
          }

          const updatedState = await service.getState();
          updatedState.notifiedNotificationIds = Array.from(notifiedIdsRef.current);
          await service.saveState(updatedState);
        }
      }
    }

    isFirstFetchRef.current = false;
    setIsLoading(false);
    return "ok" as const;
  }, [service]);

  /**
   * Compute the backoff delay for the next retry
   */
  const getBackoffDelay = useCallback((): number => {
    const errors = consecutiveErrorsRef.current;
    if (errors === 0) return 0;
    return Math.min(BASE_BACKOFF_DELAY_MS * Math.pow(2, errors - 1), 60000);
  }, []);

  /**
   * Clear any active polling timer
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Start the polling interval
   */
  const startPollingInterval = useCallback(() => {
    clearTimer();

    const preferences = getPreferenceValues<PollingPreferences>();
    const intervalMs = Number(preferences.pollingInterval) * 1000;

    timerRef.current = setInterval(async () => {
      const backoff = getBackoffDelay();
      if (backoff > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
      }

      const result = await poll();
      if (result === "stop") {
        clearTimer();
        setIsListening(false);
      }
    }, intervalMs);
  }, [clearTimer, getBackoffDelay, poll]);

  /**
   * Start listening: immediate fetch + start polling
   */
  const startListening = useCallback(async () => {
    await initializeFromState();
    setIsListening(true);
    consecutiveErrorsRef.current = 0;

    await poll();
    startPollingInterval();
  }, [initializeFromState, poll, startPollingInterval]);

  /**
   * Stop listening: clear timer and update state
   */
  const stopListening = useCallback(() => {
    clearTimer();
    setIsListening(false);
  }, [clearTimer]);

  /**
   * Manual refresh (force fetch without affecting polling state)
   */
  const refresh = useCallback(async () => {
    consecutiveErrorsRef.current = 0;
    await poll();
  }, [poll]);

  useEffect(() => {
    initializeFromState();
  }, [initializeFromState]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    notifications,
    isListening,
    isLoading,
    error,
    lastUpdated,
    startListening,
    stopListening,
    refresh,
  };
}
