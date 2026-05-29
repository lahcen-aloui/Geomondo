'use client';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body style={{ padding: '40px', fontFamily: 'monospace', background: '#0f0f0f', color: '#ff6b6b', margin: 0 }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>🔴 Global Error (share this with Claude)</h2>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', background: '#1a1a1a', padding: '16px', borderRadius: '8px' }}>
          {error.message}
          {'\n\n'}
          {error.stack}
          {error.digest ? `\n\nDigest: ${error.digest}` : ''}
        </pre>
      </body>
    </html>
  );
}
