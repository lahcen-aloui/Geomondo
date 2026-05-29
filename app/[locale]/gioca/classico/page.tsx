import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import ClassicoGame from '@/components/game/ClassicoGame';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function ClassicoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ClassicoGame />;
}
