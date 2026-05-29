import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PendingScoreHandler from '@/components/auth/PendingScoreHandler';
import CookieBanner from '@/components/layout/CookieBanner';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: {
      default: t('title'),
      template: '%s · GeoMondo',
    },
    description: t('description'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'it' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      {/* Submits any pending guest score automatically after sign-in */}
      <PendingScoreHandler />
      {/* GDPR cookie consent — appears on first visit, remembers choice in localStorage */}
      <CookieBanner />
    </NextIntlClientProvider>
  );
}
