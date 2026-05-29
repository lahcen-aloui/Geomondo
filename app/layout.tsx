import type { Metadata } from 'next';
import '@/app/globals.css';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

// Root layout required by Next.js 14.
// html/body live here. The locale-aware shell (providers, Navbar, Footer)
// is in app/[locale]/layout.tsx which wraps every page.
export const metadata: Metadata = {
  title: {
    default: 'GeoMondo — Indovina dove sei nel mondo',
    template: '%s · GeoMondo',
  },
  description:
    'Il gioco di geografie gratuito. Esplora il mondo tramite Street View e indovina dove ti trovi.',
  metadataBase: new URL('https://geomondo.vercel.app'),
  openGraph: {
    title: 'GeoMondo — Indovina dove sei nel mondo',
    description: 'Il gioco di geografie gratuito. Esplora il mondo tramite Street View e indovina dove ti trovi.',
    url: 'https://geomondo.vercel.app',
    siteName: 'GeoMondo',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoMondo — Indovina dove sei nel mondo',
    description: 'Il gioco di geografie gratuito. Esplora il mondo tramite Street View.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
