import { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

/**
 * OfflineBanner
 * 
 * A fixed top banner that:
 * - Slides in when the user goes offline (red, WifiOff icon)
 * - Briefly shows a "Back online" confirmation (green, Wifi icon)
 * - Slides out and is removed from DOM when fully online
 * 
 * Designed to match the app's dark/industrial aesthetic.
 */
export function OfflineBanner() {
  const { isOffline, wasOffline } = useOfflineStatus();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismiss state if network status changes
  useEffect(() => {
    setIsDismissed(false);
  }, [isOffline]);

  // Determine visibility and content
  const isVisible = (isOffline || wasOffline) && !isDismissed;
  const isReconnecting = wasOffline && !isOffline;

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    if (isVisible) {
      // Force browser to register initial state before animating
      el.style.transform = 'translateY(-100%)';
      el.style.opacity = '0';
      el.style.display = 'flex';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease';
          el.style.transform = 'translateY(0)';
          el.style.opacity = '1';
        });
      });
    } else {
      el.style.transition = 'transform 0.35s cubic-bezier(0.55, 0, 1, 0.45), opacity 0.3s ease';
      el.style.transform = 'translateY(-100%)';
      el.style.opacity = '0';

      const timer = setTimeout(() => {
        if (el) el.style.display = 'none';
      }, 380);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div
      ref={bannerRef}
      role="status"
      aria-live="polite"
      style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 20px',
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'var(--font-primary, Inter, sans-serif)',
        letterSpacing: '0.01em',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isReconnecting ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        background: isReconnecting
          ? 'rgba(6, 78, 59, 0.92)'
          : 'rgba(69, 10, 10, 0.92)',
        color: isReconnecting ? '#86efac' : '#fca5a5',
        transition: 'background 0.4s ease, color 0.4s ease, border-color 0.4s ease',
      }}
    >
      {isReconnecting ? (
        <>
          <Wifi size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>Back online — syncing data…</span>
        </>
      ) : (
        <>
          <WifiOff size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span>
            You're offline. Browsing cached data.
            {' '}
            <span style={{ opacity: 0.65 }}>Some features require a connection.</span>
          </span>
          <button 
            onClick={() => setIsDismissed(true)} 
            className="ml-auto p-1 hover:bg-black/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
}
