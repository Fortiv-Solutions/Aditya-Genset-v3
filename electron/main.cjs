'use strict';

const { app, BrowserWindow, shell, Menu, ipcMain, nativeTheme, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// ─── Environment Detection ───────────────────────────────────────────────────
const isDev = !app.isPackaged;

// ─── dist/ absolute path ─────────────────────────────────────────────────────
const DIST_DIR = path.join(__dirname, '../dist');

// ─── Register Custom app:// Protocol (BEFORE app.whenReady) ─────────────────
//
// ROOT CAUSE OF BLACK SCREEN:
// Vite builds with base:'/' so all assets are referenced as /assets/index-xxx.js
// When Electron loads via file://, an absolute path like /assets/foo.js resolves
// to the FILESYSTEM ROOT (C:\assets\foo.js) — not the dist/ folder.
//
// FIX: Register a custom app:// scheme (Electron v25+ protocol.handle API).
// Every request to app://localhost/* is intercepted and served from dist/*.
// Unknown SPA routes (e.g. app://localhost/products) fall back to index.html.
//
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,        // Treated as secure context (needed for service workers)
      standard: true,      // Enables relative URL resolution (like http://)
      supportFetchAPI: true,
      allowServiceWorkers: true,
      corsEnabled: true,
    },
  },
]);

// ─── Window State ────────────────────────────────────────────────────────────
let mainWindow = null;

// ─── Create Main Window ──────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0a0a0a',
    icon: path.join(__dirname, '../public/aditya-logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      // sandbox must be false so preload can use Node's require for contextBridge
      sandbox: false,
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    title: 'Adityagenset',
  });

  // ─── Load URL ──────────────────────────────────────────────────────────────
  if (isDev) {
    // Development: try Vite dev server first (HMR), fallback to built dist/
    mainWindow.loadURL('http://localhost:53710').catch(() => {
      // Dev server not running — load from dist/ via the app:// protocol
      console.log('[Electron] Dev server not available. Loading from dist/ via app:// protocol.');
      mainWindow.loadURL('app://localhost/');
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production: always load via app:// protocol
    mainWindow.loadURL('app://localhost/');
  }

  // ─── Show Window When Ready ────────────────────────────────────────────────
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // ─── Open DevTools on render errors (dev only) ────────────────────────────
  if (isDev) {
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      console.error('[Electron] Render process gone:', details);
    });
  }

  // ─── Handle External Links ─────────────────────────────────────────────────
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // ─── Block navigation to external URLs ────────────────────────────────────
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isLocal = url.startsWith('http://localhost') || url.startsWith('app://');
    if (!isLocal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App Ready ───────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // ─── Register app:// Protocol Handler ──────────────────────────────────────
  // Maps app://localhost/<path> → dist/<path>
  // Falls back to dist/index.html for unknown paths (SPA client-side routing)
  protocol.handle('app', (request) => {
    // Parse the request URL to extract the pathname
    const { pathname } = new URL(request.url);

    // Decode URI components (e.g. spaces, special chars in filenames)
    const decodedPath = decodeURIComponent(pathname);

    // Resolve to absolute path in dist/
    const filePath = path.normalize(path.join(DIST_DIR, decodedPath));

    // Security: ensure the resolved path is within dist/ (prevent path traversal)
    if (!filePath.startsWith(DIST_DIR)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Check if the exact file exists
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      // Serve the file using net.fetch with a file:// URL
      return net.fetch(pathToFileURL(filePath).toString());
    }

    // SPA fallback: serve index.html for all unknown paths (React Router handles routing)
    return net.fetch(pathToFileURL(path.join(DIST_DIR, 'index.html')).toString());
  });

  // Remove default menu in production for a cleaner look
  if (!isDev) {
    Menu.setApplicationMenu(null);
  }

  createWindow();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// ─── All Windows Closed ──────────────────────────────────────────────────────
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── IPC Handlers ────────────────────────────────────────────────────────────
ipcMain.handle('get-platform', () => process.platform);
ipcMain.handle('get-version', () => app.getVersion());
ipcMain.handle('get-is-dev', () => isDev);

ipcMain.handle('open-external', async (_event, url) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

// ─── Force Dark Mode ─────────────────────────────────────────────────────────
nativeTheme.themeSource = 'dark';

