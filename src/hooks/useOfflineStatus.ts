import { useState, useEffect } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  /** Flips to true the moment connectivity is restored */
  wasOffline: boolean;
}

/**
 * Tracks real-time network connectivity using the browser's online/offline events.
 * `wasOffline` is useful to show a "Back online — syncing…" toast briefly.
 */
export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Clear the "was offline" flag after 4 seconds
      reconnectTimer = setTimeout(() => setWasOffline(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(reconnectTimer);
    };
  }, []);

  return { isOnline, isOffline: !isOnline, wasOffline };
}
