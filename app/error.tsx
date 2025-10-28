"use client";

export default function GlobalError({ error }: { error: Error }) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: 'ui-sans-serif' }}>
        <h1>Something went wrong</h1>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error?.message || error)}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px' }}>
          Reload
        </button>
      </body>
    </html>
  );
}

