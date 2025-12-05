'use client';

import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Something went wrong</h1>
        <p>The application hit an unexpected error. Please try again.</p>

        {error?.digest && <p style={{ opacity: 0.6, fontSize: 12 }}>Error digest: {error.digest}</p>}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>

          <Link
            href='/'
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ddd',
              textDecoration: 'none',
            }}
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
