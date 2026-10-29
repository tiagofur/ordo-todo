// Single source of truth for connectivity across Ordo apps (toasts, sync
// indicators, offline queues). Raw browser online/offline events reflect the
// OS network interface: Wi-Fi roaming, ISP renewals or wake-from-sleep fire
// them in quick succession even though the app never lost real
// connectivity. Transitions are only reported once the raw state persists
// OFFLINE_CONFIRMATION_DELAY_MS, so micro-flaps stay invisible to consumers.
export const OFFLINE_CONFIRMATION_DELAY_MS = 5000;

type OnlineStatusListener = (online: boolean) => void;

let initialized = false;
let online = true;
let offlineTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<OnlineStatusListener>();

export function getOnlineStatus(): boolean {
  ensureInitialized();
  return online;
}

export function subscribeOnlineStatus(
  listener: OnlineStatusListener,
): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Test-only: drop the singleton so each test starts from a fresh monitor. */
export function __resetOnlineStatusMonitor(): void {
  if (offlineTimer !== null) {
    clearTimeout(offlineTimer);
    offlineTimer = null;
  }
  if (initialized && typeof window !== "undefined") {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  }
  listeners.clear();
  initialized = false;
  online = true;
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  online = Boolean(navigator.onLine);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
}

function handleOnline() {
  if (offlineTimer !== null) {
    clearTimeout(offlineTimer);
    offlineTimer = null;
  }
  setOnline(true);
}

function handleOffline() {
  // A confirmed outage or a pending confirmation timer already covers this
  // event; restarting the timer would re-report the same transition.
  if (offlineTimer !== null || !online) return;
  offlineTimer = setTimeout(() => {
    offlineTimer = null;
    setOnline(false);
  }, OFFLINE_CONFIRMATION_DELAY_MS);
}

function setOnline(next: boolean) {
  if (online === next) return;
  online = next;
  // Isolate failures: one misbehaving consumer must not swallow the rest of
  // the fan-out nor the event dispatch
  for (const listener of listeners) {
    try {
      listener(next);
    } catch (error) {
      console.error("[OnlineStatusMonitor] listener failed:", error);
    }
  }
  window.dispatchEvent(
    new CustomEvent(next ? "ordo-todo:online" : "ordo-todo:offline"),
  );
}
