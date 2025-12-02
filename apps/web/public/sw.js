const CACHE_NAME = "ordo-todo-v1";
const STATIC_CACHE = "ordo-todo-static-v1";
const DYNAMIC_CACHE = "ordo-todo-dynamic-v1";
const OFFLINE_DB_NAME = "ordo-todo-offline";
const OFFLINE_DB_VERSION = 1;

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/offline.html",
];

// ============================================
// IndexedDB Helpers for Service Worker
// ============================================

/**
 * Open the IndexedDB database
 */
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains("tasks")) {
        const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
        taskStore.createIndex("by-project", "projectId");
        taskStore.createIndex("by-workspace", "workspaceId");
        taskStore.createIndex("by-status", "status");
        taskStore.createIndex("by-updated", "updatedAt");
      }

      if (!db.objectStoreNames.contains("projects")) {
        const projectStore = db.createObjectStore("projects", {
          keyPath: "id",
        });
        projectStore.createIndex("by-workspace", "workspaceId");
        projectStore.createIndex("by-updated", "updatedAt");
      }

      if (!db.objectStoreNames.contains("pending-actions")) {
        const actionStore = db.createObjectStore("pending-actions", {
          keyPath: "id",
        });
        actionStore.createIndex("by-timestamp", "timestamp");
        actionStore.createIndex("by-entity", "entityId");
        actionStore.createIndex("by-type", "type");
      }

      if (!db.objectStoreNames.contains("sync-metadata")) {
        db.createObjectStore("sync-metadata", { keyPath: "key" });
      }
    };
  });
}

/**
 * Get all pending actions from IndexedDB
 */
async function getPendingActions() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("pending-actions", "readonly");
      const store = tx.objectStore("pending-actions");
      const index = store.index("by-timestamp");
      const request = index.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Failed to get pending actions:", error);
    return [];
  }
}

/**
 * Remove a pending action from IndexedDB
 */
async function removePendingAction(actionId) {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("pending-actions", "readwrite");
      const store = tx.objectStore("pending-actions");
      const request = store.delete(actionId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Failed to remove pending action:", error);
  }
}

/**
 * Increment retry count for a pending action
 */
async function incrementRetryCount(actionId, error) {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("pending-actions", "readwrite");
      const store = tx.objectStore("pending-actions");
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.retryCount = (action.retryCount || 0) + 1;
          action.lastError = error;
          store.put(action);
        }
        resolve(action);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error("[SW] Failed to increment retry count:", error);
  }
}

/**
 * Update last sync time in IndexedDB
 */
async function setLastSyncTime() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("sync-metadata", "readwrite");
      const store = tx.objectStore("sync-metadata");
      const request = store.put({
        key: "lastSyncTime",
        value: Date.now(),
        updatedAt: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[SW] Failed to set last sync time:", error);
  }
}

/**
 * Get auth token from localStorage (via client message)
 * Note: Service workers can't directly access localStorage
 */
let cachedAuthToken = null;

// Listen for token updates from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_AUTH_TOKEN") {
    cachedAuthToken = event.data.token;
    console.log("[SW] Auth token updated");
  }

  if (event.data && event.data.type === "TRIGGER_SYNC") {
    console.log("[SW] Manual sync triggered");
    syncPendingTasks().then(() => {
      // Notify all clients that sync is complete
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_COMPLETE" });
        });
      });
    });
  }
});

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) return;

  // Handle API requests differently
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response.ok) {
            return response;
          }

          const responseClone = response.clone();

          // Cache the response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return new Response("Offline content not available");
        });
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    image: data.image, // Support for large images
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || "/", // Ensure URL is stored in data
      ...data,
    },
    tag: data.tag || "ordo-notification", // Group notifications
    renotify: true, // Vibrate even if tag is same
    requireInteraction: true, // Keep notification until user interacts
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icons/icon-192.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Ordo-Todo", options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event);
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Default action or 'view' action
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const url = event.notification.data?.url || "/";

        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "background-sync-tasks") {
    event.waitUntil(syncPendingTasks());
  }
});

/**
 * Sync all pending tasks to the server
 */
async function syncPendingTasks() {
  console.log("[SW] Starting background sync...");

  try {
    const pendingActions = await getPendingActions();

    if (pendingActions.length === 0) {
      console.log("[SW] No pending actions to sync");
      await setLastSyncTime();
      return;
    }

    console.log(`[SW] Syncing ${pendingActions.length} pending actions...`);

    let syncedCount = 0;
    let failedCount = 0;

    for (const action of pendingActions) {
      try {
        await syncActionToServer(action);
        await removePendingAction(action.id);
        syncedCount++;
        console.log(`[SW] Synced action: ${action.id} (${action.type})`);
      } catch (error) {
        console.error(`[SW] Failed to sync action ${action.id}:`, error);

        const updated = await incrementRetryCount(action.id, error.message);

        if (updated && updated.retryCount >= (updated.maxRetries || 3)) {
          console.error(
            `[SW] Action ${action.id} exceeded max retries, marking as failed`
          );
          failedCount++;
        }
      }
    }

    await setLastSyncTime();

    console.log(
      `[SW] Background sync complete: ${syncedCount} synced, ${failedCount} failed`
    );

    // Notify all clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        synced: syncedCount,
        failed: failedCount,
      });
    });
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Sync a single action to the server
 */
async function syncActionToServer(action) {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  if (cachedAuthToken) {
    headers["Authorization"] = `Bearer ${cachedAuthToken}`;
  }

  // Determine the full URL
  // Note: In production, this should be configurable
  const baseURL = self.location.origin;
  const url = `${baseURL}/api${action.endpoint}`;

  const fetchOptions = {
    method: action.method,
    headers,
    credentials: "include",
  };

  // Add body for non-DELETE requests
  if (action.method !== "DELETE" && action.payload) {
    fetchOptions.body = JSON.stringify(action.payload);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json().catch(() => undefined);
}
