import { createRoot } from "react-dom/client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { createPersistentQueryClient, queryPersister } from "./lib/queryPersister.ts";

// Import fonts locally to avoid CORS issues
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';

// ─── Persistent Query Client ──────────────────────────────────────────────────
// Created once at module level. gcTime (24h) must match persister maxAge.
const queryClient = createPersistentQueryClient();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    {/*
     * PersistQueryClientProvider extends QueryClientProvider.
     * It restores the cached query state from IndexedDB on startup,
     * making previously fetched data available immediately — even offline.
     * maxAge: 24h — cached data older than this is discarded on startup.
     */}
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: "", // Increment this string to bust the cache on breaking changes
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </ErrorBoundary>
);

