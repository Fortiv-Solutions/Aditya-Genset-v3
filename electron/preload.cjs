'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// ─── Expose Safe API to Renderer ─────────────────────────────────────────────
// Only whitelisted functions are exposed. nodeIntegration remains false.
contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Platform Info ──────────────────────────────────────────────────────
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getIsDev: () => ipcRenderer.invoke('get-is-dev'),

  // ─── Shell ──────────────────────────────────────────────────────────────
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // ─── Environment Flags (synchronous, safe) ──────────────────────────────
  isElectron: true,
  platform: process.platform,
});
