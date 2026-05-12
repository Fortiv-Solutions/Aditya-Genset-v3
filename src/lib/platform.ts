// ─── Platform Detection Utility ──────────────────────────────────────────────
// Detects if the app is running inside Electron.
// Safe to call during SSR or before window is defined.

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      platform: NodeJS.Platform;
      getPlatform: () => Promise<string>;
      getVersion: () => Promise<string>;
      getIsDev: () => Promise<boolean>;
      openExternal: (url: string) => Promise<boolean>;
    };
  }
}

/**
 * Returns true if running inside Electron (desktop app).
 * Works by checking for the `electronAPI` object injected by preload.cjs.
 */
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
};

/**
 * Returns the OS platform string when running in Electron.
 * Returns 'web' when running in a browser.
 */
export const getPlatform = (): string => {
  if (typeof window === 'undefined') return 'server';
  if (window.electronAPI?.platform) return window.electronAPI.platform;
  return 'web';
};

/**
 * Opens a URL in the system's default browser.
 * In Electron: uses shell.openExternal (safe, no Electron window popup).
 * In browser: uses window.open.
 */
export const openExternal = (url: string): void => {
  if (isElectron() && window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
