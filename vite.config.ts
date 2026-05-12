import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 53710,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      // Auto-update the service worker in the background without prompting the user
      registerType: "autoUpdate",
      // Include the service worker in the Vite build output
      injectRegister: "auto",
      // Dev mode: enable SW in development for testing
      devOptions: {
        enabled: false, // Set to true to test SW locally
        type: "module",
      },
      // ─── Web App Manifest ─────────────────────────────────────────────────
      manifest: {
        name: "Adityagenset",
        short_name: "Adityagenset",
        description:
          "ISO 9001:2015 certified manufacturer of silent diesel generator sets from 15 to 500 kVA. Pan-India delivery since 1997.",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "landscape-primary",
        scope: "/",
        start_url: "/",
        id: "/",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      // ─── Workbox Configuration ────────────────────────────────────────────
      workbox: {
        // Precache all static build artifacts (JS chunks, CSS, fonts, images)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webp,jpg,jpeg}"],
        // Maximum file size to precache: 5 MB (handles large JS bundles)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Offline fallback: serve /offline.html for uncached navigation requests
        navigateFallback: "/index.html",
        // Do not apply offline fallback to API calls or admin paths
        navigateFallbackDenylist: [/^\/api\//, /^\/__/, /^\/admin\/cms\/edit/],
        // ─── Runtime Caching Strategies ─────────────────────────────────────
        runtimeCaching: [
          // Supabase Offline Mutations (Background Sync)
          // Intercepts failed POST/PATCH/DELETE requests when offline
          // and saves them to IndexedDB. They are automatically replayed when online.
          {
            urlPattern: /^https:\/\/vbbeibweeavuksmvkbnb\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "POST",
            options: {
              backgroundSync: {
                name: "supabase-mutation-queue",
                options: {
                  maxRetentionTime: 24 * 60, // Retry for up to 24 Hours
                },
              },
            },
          },
          {
            urlPattern: /^https:\/\/vbbeibweeavuksmvkbnb\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "PATCH",
            options: {
              backgroundSync: {
                name: "supabase-mutation-queue",
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
          },
          {
            urlPattern: /^https:\/\/vbbeibweeavuksmvkbnb\.supabase\.co\/rest\/v1\/.*/i,
            handler: "NetworkOnly",
            method: "DELETE",
            options: {
              backgroundSync: {
                name: "supabase-mutation-queue",
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
          },
          // Supabase REST API (Reads) — StaleWhileRevalidate
          // Serve cached data immediately, refresh in background.
          // Keeps the app fast even on slow connections.
          {
            urlPattern: /^https:\/\/vbbeibweeavuksmvkbnb\.supabase\.co\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Supabase Storage (images/media) — CacheFirst
          // Images rarely change; serve from cache for speed.
          {
            urlPattern: /^https:\/\/vbbeibweeavuksmvkbnb\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Sanity CDN Images — CacheFirst
          // CMS images from cdn.sanity.io are immutable (URL-versioned).
          {
            urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "sanity-cdn-cache",
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Google Fonts — CacheFirst (long-lived)
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
