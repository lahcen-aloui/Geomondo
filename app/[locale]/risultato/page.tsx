import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import RisultatoScreen from '@/components/game/RisultatoScreen';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RisultatoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RisultatoScreen />;
}
