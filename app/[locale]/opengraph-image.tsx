import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GeoMondo — Indovina dove sei nel mondo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Globe grid lines decoration */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          top: '65px',
          right: '-80px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          top: '145px',
          right: '0px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          top: '215px',
          right: '70px',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#22c55e', letterSpacing: '-2px' }}>Ge</span>
          <span style={{ fontSize: '72px' }}>🌍</span>
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#ffffff', letterSpacing: '-2px' }}>Mon</span>
          <span style={{ fontSize: '72px', fontWeight: 900, color: '#ef4444', letterSpacing: '-2px' }}>do</span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: '28px',
          color: 'rgba(255,255,255,0.65)',
          margin: '0',
          letterSpacing: '0.5px',
          textAlign: 'center',
        }}>
          Indovina dove sei nel mondo
        </p>

        {/* Pill badges */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          {['🗺️  Street View', '⏱️  Sprint Mode', '🏆  5 Rounds'].map(label => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '999px',
              padding: '10px 24px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)',
              display: 'flex',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* URL watermark */}
        <p style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '18px',
          color: 'rgba(255,255,255,0.25)',
          margin: 0,
        }}>
          geomondo.vercel.app
        </p>
      </div>
    ),
    { ...size },
  );
}
