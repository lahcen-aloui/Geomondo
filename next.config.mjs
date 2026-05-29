import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV === 'development';

// Build the Content-Security-Policy header value.
// 'unsafe-inline' for script-src is regrettably required by Next.js App Router's
// inline hydration scripts. For a stricter setup, add nonce support later.
// 'unsafe-eval' is added in development only — Next.js Fast Refresh requires it.
const csp = [
  "default-src 'self'",

  // Scripts: own code + Google Maps JS SDK (+ unsafe-eval in dev for Fast Refresh)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://maps.googleapis.com`,

  // Styles: own + inline (Tailwind) + Google Fonts
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

  // Images: own, data URIs, blobs, Google tiles/static, Supabase storage,
  //         Google OAuth avatars, Mapillary CDN, OpenStreetMap (Leaflet tiles)
  [
    "img-src 'self' data: blob:",
    'https://*.googleapis.com',
    'https://*.gstatic.com',
    'https://*.supabase.co',
    'https://lh3.googleusercontent.com',
    'https://*.mapillary.com',
    'https://*.openstreetmap.org',
    'https://tile.openstreetmap.org',
  ].join(' '),

  // Fetch / XHR / WebSocket: Supabase REST + Realtime, Google APIs, Mapillary
  [
    "connect-src 'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.googleapis.com',
    'https://graph.mapillary.com',
    'https://*.mapillary.com',
  ].join(' '),

  // Fonts: own + Google Fonts
  "font-src 'self' data: https://fonts.gstatic.com",

  // Frames: only Google (Street View embed fallback)
  'frame-src https://www.google.com',

  // Web Workers: needed by some map libraries
  "worker-src 'self' blob:",

  // Block plugins (Flash etc.) and restrict base URL
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  async headers() {
    return [
      {
        // Apply to every route
        source: '/(.*)',
        headers: [
          // Prevent this site from being embedded in iframes elsewhere
          { key: 'X-Frame-Options', value: 'DENY' },

          // Stop browsers from MIME-sniffing the content type
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // Send origin only on same-origin requests; omit on cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Disable hardware APIs the game doesn't need
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },

          // Content Security Policy
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
