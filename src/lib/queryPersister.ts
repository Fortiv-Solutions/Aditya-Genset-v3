import { get, set, del } from 'idb-keyval';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';

// ─── IDB-backed Async Storage Adapter ────────────────────────────────────────
// idb-keyval provides a simple key-value store on top of IndexedDB.
// This is the storage layer used by TanStack Query's async persister.
const idbStorage = {
  getItem: (key: string) => get<string>(key),
  setItem: (key: string, value: string) => set(key, value),
  removeItem: (key: string) => del(key),
};

// ─── Query Persister ──────────────────────────────────────────────────────────
// Persists the entire TanStack Query cache to IndexedDB.
// This means data survives page refreshes and is available when offline.
export const queryPersister = createAsyncStoragePersister({
  storage: idbStorage,
  key: 'adityagenset-query-cache',
  // Throttle writes to IndexedDB (avoids excessive I/O during rapid updates)
  throttleTime: 1000,
});

// ─── Persistent Query Client ──────────────────────────────────────────────────
// gcTime MUST be >= maxAge in persistOptions (set in App.tsx) for caching to work.
// We set 24h here — products don't change minute-to-minute.
export const createPersistentQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data is "fresh" for 5 minutes — no refetch during this window
        staleTime: 1000 * 60 * 5,
        // Keep cached data for 24 hours (survives offline browsing sessions)
        gcTime: 1000 * 60 * 60 * 24,
        // Retry failed queries 2 times (graceful on poor connectivity)
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
        // Don't refetch when window regains focus (avoid unnecessary API calls)
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
