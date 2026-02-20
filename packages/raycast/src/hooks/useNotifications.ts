import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { showToast, Toast, getPreferenceValues } from "@raycast/api";
import {
  NotificationService,
  type Notification,
  type NotificationReason,
  type Failure,
} from "@github-notifications/core";
import { RaycastAuthProvider, RaycastStorageAdapter } from "../adapters";
import {
  getListeningState,
  markListeningStarted,
  markListeningStopped,
} from "../services/polling-state";
import { sendNativeNotifications } from "../services/native-notifications";

const LOG_PREFIX = "raycast.use_notifications";

/**
 * Maximum consecutive polling errors before auto-stopping
 */
const MAX_CONSECUTIVE_ERRORS = 5;

/**
 * Base delay for exponential backoff (ms)
 */
const BASE_BACKOFF_DELAY_MS = 5000;

interface UseNotificationsPreferences {
  pollingInterval: string;
  nativeNotifications: boolean;
  autoStartListening: boolean;
}

interface UseNotificationsResult {
  notifications: Notification[];
  allNotifications: Notification[];
  isLoading: boolean;
  isListening: boolean;
  error: Failure | null;
  refresh: () => Promise<void>;
  markAsDone: (id: string) => Promise<void>;
  filterReason: NotificationReason | "all";
  setFilterReason: (reason: NotificationReason | "all") => void;
  filterRepository: string;
  setFilterRepository: (repositoryId: string) => void;
  showReadNotifications: boolean;
  toggleShowReadNotifications: () => void;
  lastUpdated: Date | null;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Failure | null>(null);
  const [filterReason, setFilterReason] = useState<NotificationReason | "all">("all");
  const [filterRepository, setFilterRepository] = useState<string | "all">("all");
  const [showReadNotifications, setShowReadNotifications] = useState(false);
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
   * Load previously seen/notified IDs from persisted state
   */
  const initializeFromState = useCallback(async () => {
    const state = await service.getState();
    for (const id of state.seenNotificationIds) {
      seenIdsRef.current.add(id);
    }
    for (const id of state.notifiedNotificationIds) {
      notifiedIdsRef.current.add(id);
    }
  }, [service]);

  /**
   * Perform a single fetch cycle: fetch, deduplicate, detect new, cache, notify
   */
  const fetchNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      const result = await service.fetch({
        includeRead: showReadNotifications,
      });

      if (result.ok) {
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
          const preferences = getPreferenceValues<UseNotificationsPreferences>();
          if (preferences.nativeNotifications) {
            const unnotified = newNotifications.filter((n) => !notifiedIdsRef.current.has(n.id));
            if (unnotified.length > 0) {
              await sendNativeNotifications(unnotified);
              for (const n of unnotified) {
                notifiedIdsRef.current.add(n.id);
              }
              const updatedState = await service.getState();
              updatedState.notifiedNotificationIds = Array.from(notifiedIdsRef.current);
              await service.saveState(updatedState);
            }
          }
        }

        isFirstFetchRef.current = false;
      } else {
        consecutiveErrorsRef.current += 1;
        const errorCount = consecutiveErrorsRef.current;
        console.error(`${LOG_PREFIX}.fetch: failed (attempt ${errorCount})`, result.error);

        setError(result.error);

        if (!silent) {
          await showToast({
            style: Toast.Style.Failure,
            title: "Failed to fetch notifications",
            message: result.error.message,
          });
        }

        if (errorCount >= MAX_CONSECUTIVE_ERRORS) {
          console.error(`${LOG_PREFIX}.fetch: max retries reached, stopping polling`);
          await stopPollingTimer();
          setIsListening(false);
          await markListeningStopped();
          await showToast({
            style: Toast.Style.Failure,
            title: "Polling stopped",
            message: "Too many consecutive errors. Use Start Listening to resume.",
          });
        }
      }

      setIsLoading(false);
    },
    [service, showReadNotifications],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopPollingTimer = useCallback(async () => {
    clearTimer();
  }, [clearTimer]);

  /**
   * Start the polling interval timer
   */
  const startPollingTimer = useCallback(() => {
    clearTimer();
    const preferences = getPreferenceValues<UseNotificationsPreferences>();
    const intervalMs = Number(preferences.pollingInterval) * 1000;

    timerRef.current = setInterval(async () => {
      const backoffErrors = consecutiveErrorsRef.current;
      if (backoffErrors > 0) {
        const delay = Math.min(BASE_BACKOFF_DELAY_MS * Math.pow(2, backoffErrors - 1), 60000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      await fetchNotifications({ silent: true });
    }, intervalMs);
  }, [clearTimer, fetchNotifications]);

  /**
   * Start listening: immediate fetch + start polling timer
   */
  const startListening = useCallback(async () => {
    setIsListening(true);
    consecutiveErrorsRef.current = 0;
    isFirstFetchRef.current = true;
    await markListeningStarted();
    await fetchNotifications();
    startPollingTimer();

    await showToast({
      style: Toast.Style.Success,
      title: "Now listening for notifications",
    });
  }, [fetchNotifications, startPollingTimer]);

  /**
   * Stop listening: clear polling timer + update state
   */
  const stopListening = useCallback(async () => {
    clearTimer();
    setIsListening(false);
    await markListeningStopped();

    await showToast({
      style: Toast.Style.Success,
      title: "Stopped listening",
    });
  }, [clearTimer]);

  const markAsDone = useCallback(
    async (id: string) => {
      const result = await service.markAsDone(id);

      if (result.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await showToast({
          style: Toast.Style.Success,
          title: "Marked as done",
        });
      } else {
        await showToast({
          style: Toast.Style.Failure,
          title: "Failed to mark as done",
          message: result.error.message,
        });
      }
    },
    [service],
  );

  const toggleShowReadNotifications = useCallback(() => {
    setShowReadNotifications((prev) => !prev);
  }, []);

  /**
   * On mount: initialize from state, fetch, and check if we should auto-start polling
   */
  useEffect(() => {
    async function init() {
      await initializeFromState();
      await fetchNotifications();

      const listeningState = await getListeningState();
      const preferences = getPreferenceValues<UseNotificationsPreferences>();

      if (listeningState.isListening || preferences.autoStartListening) {
        setIsListening(true);
        if (!listeningState.isListening) {
          await markListeningStarted();
        }
        startPollingTimer();
      }
    }
    init();

    return () => {
      clearTimer();
    };
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    const matchesReason = filterReason === "all" || n.reason === filterReason;
    const matchesRepo = filterRepository === "all" || n.repository.id === Number(filterRepository);
    return matchesReason && matchesRepo;
  });

  return {
    notifications: filteredNotifications,
    allNotifications: notifications,
    isLoading,
    isListening,
    error,
    refresh: fetchNotifications,
    markAsDone,
    filterReason,
    setFilterReason,
    filterRepository,
    setFilterRepository,
    showReadNotifications,
    toggleShowReadNotifications,
    lastUpdated,
    startListening,
    stopListening,
  };
}
