"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // ============================================
  // Window Controls
  // ============================================
  minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => electron.ipcRenderer.invoke("maximize-window"),
  closeWindow: () => electron.ipcRenderer.invoke("close-window"),
  isMaximized: () => electron.ipcRenderer.invoke("is-maximized"),
  setAlwaysOnTop: (flag) => electron.ipcRenderer.invoke("window:setAlwaysOnTop", flag),
  isAlwaysOnTop: () => electron.ipcRenderer.invoke("window:isAlwaysOnTop"),
  showWindow: () => electron.ipcRenderer.invoke("window:show"),
  hideWindow: () => electron.ipcRenderer.invoke("window:hide"),
  // ============================================
  // Platform Info
  // ============================================
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // ============================================
  // App Info
  // ============================================
  getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
  getName: () => electron.ipcRenderer.invoke("app:getName"),
  getPath: (name) => electron.ipcRenderer.invoke("app:getPath", name),
  isPackaged: () => electron.ipcRenderer.invoke("app:isPackaged"),
  // ============================================
  // Tray Controls
  // ============================================
  updateTray: (state) => electron.ipcRenderer.invoke("tray:update", state),
  sendTimerState: (state) => electron.ipcRenderer.send("timer:stateUpdate", state),
  // ============================================
  // Notifications
  // ============================================
  showNotification: (options) => electron.ipcRenderer.invoke("notification:show", options),
  notifyPomodoroComplete: () => electron.ipcRenderer.invoke("notification:pomodoroComplete"),
  notifyShortBreakComplete: () => electron.ipcRenderer.invoke("notification:shortBreakComplete"),
  notifyLongBreakComplete: () => electron.ipcRenderer.invoke("notification:longBreakComplete"),
  notifyTaskDue: (taskTitle) => electron.ipcRenderer.invoke("notification:taskDue", taskTitle),
  notifyTaskReminder: (taskTitle, dueIn) => electron.ipcRenderer.invoke("notification:taskReminder", taskTitle, dueIn),
  // ============================================
  // Shortcuts
  // ============================================
  getShortcuts: () => electron.ipcRenderer.invoke("shortcuts:getAll"),
  getDefaultShortcuts: () => electron.ipcRenderer.invoke("shortcuts:getDefaults"),
  updateShortcut: (id, updates) => electron.ipcRenderer.invoke("shortcuts:update", id, updates),
  resetShortcuts: () => electron.ipcRenderer.invoke("shortcuts:reset"),
  // ============================================
  // Store (Persistent Settings)
  // ============================================
  storeGet: (key) => electron.ipcRenderer.invoke("store:get", key),
  storeSet: (key, value) => electron.ipcRenderer.invoke("store:set", key, value),
  storeDelete: (key) => electron.ipcRenderer.invoke("store:delete", key),
  storeClear: () => electron.ipcRenderer.invoke("store:clear"),
  // ============================================
  // Event Listeners
  // ============================================
  onTrayAction: (callback) => {
    electron.ipcRenderer.on("tray-action", (_event, action) => callback(action));
  },
  onGlobalShortcut: (callback) => {
    electron.ipcRenderer.on("global-shortcut", (_event, action) => callback(action));
  },
  onMenuAction: (callback) => {
    electron.ipcRenderer.on("menu-action", (_event, action, ...args) => callback(action, ...args));
  },
  onNotificationAction: (callback) => {
    electron.ipcRenderer.on("notification-action", (_event, action) => callback(action));
  },
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  },
  // ============================================
  // Remove Listeners
  // ============================================
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  },
  // ============================================
  // Database - Tasks (Offline Mode)
  // ============================================
  db: {
    task: {
      create: (task) => electron.ipcRenderer.invoke("db:task:create", task),
      update: (id, updates) => electron.ipcRenderer.invoke("db:task:update", id, updates),
      delete: (id, soft) => electron.ipcRenderer.invoke("db:task:delete", id, soft),
      getById: (id) => electron.ipcRenderer.invoke("db:task:getById", id),
      getByWorkspace: (workspaceId) => electron.ipcRenderer.invoke("db:task:getByWorkspace", workspaceId),
      getByProject: (projectId) => electron.ipcRenderer.invoke("db:task:getByProject", projectId),
      getPending: (workspaceId) => electron.ipcRenderer.invoke("db:task:getPending", workspaceId),
      getUnsynced: () => electron.ipcRenderer.invoke("db:task:getUnsynced")
    },
    workspace: {
      create: (workspace) => electron.ipcRenderer.invoke("db:workspace:create", workspace),
      getAll: () => electron.ipcRenderer.invoke("db:workspace:getAll"),
      getById: (id) => electron.ipcRenderer.invoke("db:workspace:getById", id)
    },
    project: {
      create: (project) => electron.ipcRenderer.invoke("db:project:create", project),
      getByWorkspace: (workspaceId) => electron.ipcRenderer.invoke("db:project:getByWorkspace", workspaceId)
    },
    session: {
      create: (session) => electron.ipcRenderer.invoke("db:session:create", session),
      getByWorkspace: (workspaceId, startDate, endDate) => electron.ipcRenderer.invoke("db:session:getByWorkspace", workspaceId, startDate, endDate)
    }
  },
  // ============================================
  // Sync Engine
  // ============================================
  sync: {
    setAuthToken: (token) => electron.ipcRenderer.invoke("sync:setAuthToken", token),
    startAuto: (intervalMs) => electron.ipcRenderer.invoke("sync:startAuto", intervalMs),
    stopAuto: () => electron.ipcRenderer.invoke("sync:stopAuto"),
    setOnlineStatus: (isOnline) => electron.ipcRenderer.invoke("sync:setOnlineStatus", isOnline),
    getState: () => electron.ipcRenderer.invoke("sync:getState"),
    force: () => electron.ipcRenderer.invoke("sync:force"),
    getQueueStats: () => electron.ipcRenderer.invoke("sync:getQueueStats"),
    onStateChanged: (callback) => {
      electron.ipcRenderer.on("sync-state-changed", (_event, state) => callback(state));
    }
  },
  // ============================================
  // Timer Floating Window
  // ============================================
  timerWindow: {
    show: () => electron.ipcRenderer.invoke("timer-window:show"),
    hide: () => electron.ipcRenderer.invoke("timer-window:hide"),
    toggle: () => electron.ipcRenderer.invoke("timer-window:toggle"),
    isVisible: () => electron.ipcRenderer.invoke("timer-window:isVisible"),
    setPosition: (x, y) => electron.ipcRenderer.invoke("timer-window:setPosition", x, y),
    getPosition: () => electron.ipcRenderer.invoke("timer-window:getPosition"),
    expand: () => electron.ipcRenderer.invoke("timer-window:expand"),
    sendAction: (action) => electron.ipcRenderer.invoke("timer-window:action", action),
    onStateUpdate: (callback) => {
      electron.ipcRenderer.on("timer-window:state-update", (_event, state) => callback(state));
    },
    onAction: (callback) => {
      electron.ipcRenderer.on("timer-window:action", (_event, action) => callback(action));
    }
  },
  // ============================================
  // Deep Links
  // ============================================
  deepLinks: {
    onDeepLink: (callback) => {
      electron.ipcRenderer.on("deep-link", (_event, data) => callback(data));
    }
  },
  // ============================================
  // Auto Updater
  // ============================================
  autoUpdater: {
    check: (silent) => electron.ipcRenderer.invoke("auto-update:check", silent),
    download: () => electron.ipcRenderer.invoke("auto-update:download"),
    install: () => electron.ipcRenderer.invoke("auto-update:install"),
    getState: () => electron.ipcRenderer.invoke("auto-update:getState"),
    getVersion: () => electron.ipcRenderer.invoke("auto-update:getVersion"),
    onStateChange: (callback) => {
      electron.ipcRenderer.on("auto-update:state", (_event, state) => callback(state));
    }
  },
  // ============================================
  // Auto Launch
  // ============================================
  autoLaunch: {
    isEnabled: () => electron.ipcRenderer.invoke("auto-launch:isEnabled"),
    getSettings: () => electron.ipcRenderer.invoke("auto-launch:getSettings"),
    enable: (minimized) => electron.ipcRenderer.invoke("auto-launch:enable", minimized),
    disable: () => electron.ipcRenderer.invoke("auto-launch:disable"),
    toggle: () => electron.ipcRenderer.invoke("auto-launch:toggle"),
    setStartMinimized: (minimized) => electron.ipcRenderer.invoke("auto-launch:setStartMinimized", minimized),
    wasStartedAtLogin: () => electron.ipcRenderer.invoke("auto-launch:wasStartedAtLogin")
  }
});
