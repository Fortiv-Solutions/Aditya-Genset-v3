import { WifiOff } from 'lucide-react';

/**
 * Offline Fallback Page
 * Shown by the Service Worker when a user navigates to an uncached route while offline.
 * Must be a standalone HTML/JSX page (no network requests).
 */
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#e5e7eb',
        fontFamily: 'Inter, system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
        gap: '1.5rem',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WifiOff size={32} color="#ef4444" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#f9fafb',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em',
          }}
        >
          You're Offline
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: '#9ca3af',
            maxWidth: 380,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          This page isn't available offline. Pages you've already visited are still accessible.
          Please check your connection and try again.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#e5e7eb',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          ← Go Back
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '8px',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            background: 'rgba(249, 115, 22, 0.12)',
            color: '#fb923c',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(249, 115, 22, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(249, 115, 22, 0.12)')}
        >
          Retry
        </button>
      </div>

      {/* Branding */}
      <p style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '1rem' }}>
        Adityagenset · Silent Power. Since 1997.
      </p>
    </div>
  );
}
