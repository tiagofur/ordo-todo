"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimizeWindow: () => electron.ipcRenderer.invoke("minimize-window"),
  maximizeWindow: () => electron.ipcRenderer.invoke("maximize-window"),
  closeWindow: () => electron.ipcRenderer.invoke("close-window"),
  isMaximized: () => electron.ipcRenderer.invoke("is-maximized"),
  // Platform info
  platform: process.platform,
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // Desktop feature event listeners
  onTrayAction: (callback) => {
    electron.ipcRenderer.on("tray-action", (_event, action) => callback(action));
  },
  onGlobalShortcut: (callback) => {
    electron.ipcRenderer.on("global-shortcut", (_event, action) => callback(action));
  },
  onMenuAction: (callback) => {
    electron.ipcRenderer.on("menu-action", (_event, action) => callback(action));
  },
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  },
  // Remove listeners
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
});
