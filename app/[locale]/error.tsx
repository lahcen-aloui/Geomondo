'use client';

export default function LocaleError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0f0f0f', color: '#ff6b6b', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>🔴 Runtime Error (share this with Claude)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', background: '#1a1a1a', padding: '16px', borderRadius: '8px' }}>
        {error.message}
        {'\n\n'}
        {error.stack}
        {error.digest ? `\n\nDigest: ${error.digest}` : ''}
      </pre>
    </div>
  );
}
